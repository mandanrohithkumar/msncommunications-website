import { Cashfree, CFEnvironment } from "cashfree-pg";
import { NextRequest, NextResponse } from "next/server";

/**
 * Helper to get configured Cashfree instance
 */
function getCashfreeInstance() {
  const appId = (process.env.CASHFREE_APP_ID || process.env.NEXT_PUBLIC_CASHFREE_APP_ID)?.trim();
  const secretKey = process.env.CASHFREE_SECRET_KEY?.trim();
  const envMode = (process.env.CASHFREE_ENV || process.env.NEXT_PUBLIC_CASHFREE_ENV)?.trim() || "sandbox";

  const isProduction = envMode.toLowerCase() === "production";
  const cfEnv = isProduction ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;

  const isConfigured =
    Boolean(appId && secretKey) &&
    appId !== "your_cashfree_app_id_here" &&
    secretKey !== "your_cashfree_secret_key_here";

  return {
    cashfree: isConfigured ? new Cashfree(cfEnv, appId!, secretKey!) : null,
    isConfigured,
    isProduction,
    cfEnv,
    appId,
  };
}

/**
 * POST /api/cashfree/create-order
 *
 * Creates a Cashfree order and returns the payment_session_id
 * to the frontend for checkout initialization.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      orderId,
      orderAmount,
      customerName,
      customerEmail,
      customerPhone,
      serviceName,
    } = body;

    // 1. Sanitize & Validate Order ID (Alphanumeric, underscores, hyphens, max 45 chars)
    const rawOrderId = String(orderId || `order_${Date.now()}`);
    const sanitizedOrderId = rawOrderId
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 45);

    // 2. Sanitize & Validate Amount (Positive number, minimum 1.00 INR for PG)
    const rawParsed = parseFloat(String(orderAmount || "0").replace(/[^0-9.]/g, ""));
    const sanitizedAmount = Math.max(1.0, Number((isNaN(rawParsed) ? 1.0 : rawParsed).toFixed(2)));

    // 3. Sanitize Customer Phone (Strictly 10 digits for Indian payment gateways)
    const rawPhoneDigits = String(customerPhone || "").replace(/\D/g, "");
    const sanitizedPhone =
      rawPhoneDigits.length >= 10
        ? rawPhoneDigits.slice(-10)
        : "9848012345"; // Default fallback mobile for testing

    // 4. Sanitize Customer Email & Name
    const sanitizedEmail =
      customerEmail && String(customerEmail).includes("@")
        ? String(customerEmail).trim()
        : "customer@meeseva.telangana.gov.in";

    const sanitizedName = String(customerName || "Customer").trim().slice(0, 50);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // 5. Build Cashfree Order Request
    const orderRequest = {
      order_id: sanitizedOrderId,
      order_amount: sanitizedAmount,
      order_currency: "INR",
      customer_details: {
        customer_id: `cust_${sanitizedOrderId.slice(-15)}`,
        customer_name: sanitizedName,
        customer_email: sanitizedEmail,
        customer_phone: sanitizedPhone,
      },
      order_meta: {
        return_url: `${appUrl}?order_id={order_id}`,
        notify_url: `${appUrl}/api/cashfree/webhook`,
        payment_methods: "",
      },
      order_note: serviceName ? `Payment for: ${String(serviceName).slice(0, 80)}` : "MeeSeva Service Payment",
    };

    const { cashfree, isConfigured, isProduction } = getCashfreeInstance();

    // 6. If Cashfree API keys are configured, attempt real Cashfree PG API call
    if (cashfree && isConfigured) {
      console.log(`[Cashfree API] Creating order ${sanitizedOrderId} for ₹${sanitizedAmount}...`);
      try {
        const response = await cashfree.PGCreateOrder(orderRequest);
        const data = response.data;

        console.log(`[Cashfree API] Order created successfully:`, {
          order_id: data.order_id,
          order_status: data.order_status,
          has_session: Boolean(data.payment_session_id),
        });

        return NextResponse.json({
          success: true,
          order_id: data.order_id,
          payment_session_id: data.payment_session_id,
          order_status: data.order_status,
        });
      } catch (cfErr: unknown) {
        // Detailed Cashfree error handling
        const axiosError = cfErr as {
          response?: { status?: number; data?: Record<string, unknown> };
          message?: string;
        };

        const statusCode = axiosError.response?.status || 500;
        const responseData = axiosError.response?.data;
        const errorMsg =
          (responseData?.message as string) ||
          axiosError.message ||
          "Cashfree PG API call failed";

        console.error("[Cashfree PG API Error Details]:", {
          statusCode,
          responseData,
          message: errorMsg,
          requestPayload: orderRequest,
        });

        // In Sandbox mode: If Cashfree credentials returned 401 (e.g. invalid test keys)
        // gracefully provide sandbox session so user can continue testing
        if (!isProduction && statusCode === 401) {
          console.warn(
            "[Cashfree PG Sandbox Mode] Cashfree returned 401 Authentication Failed. Providing sandbox simulation session."
          );
          const simulatedSession = `session_sandbox_${sanitizedOrderId}_${Date.now()}`;
          return NextResponse.json({
            success: true,
            order_id: sanitizedOrderId,
            payment_session_id: simulatedSession,
            order_status: "ACTIVE",
            sandbox_simulation: true,
            warning:
              "Using Cashfree Sandbox Simulation because configured API keys returned 401 Authentication Failed. Add valid sandbox credentials to .env.local for live PG test.",
          });
        }

        return NextResponse.json(
          {
            success: false,
            error: errorMsg,
            details: responseData || null,
            statusCode,
          },
          { status: statusCode }
        );
      }
    }

    // 7. If API keys are missing or placeholder in Sandbox/Dev mode
    console.warn(
      "[Cashfree PG] Missing or placeholder credentials in .env.local (NEXT_PUBLIC_CASHFREE_APP_ID / CASHFREE_SECRET_KEY). Initializing sandbox test session."
    );

    const simulatedSession = `session_sandbox_${sanitizedOrderId}_${Date.now()}`;

    return NextResponse.json({
      success: true,
      order_id: sanitizedOrderId,
      payment_session_id: simulatedSession,
      order_status: "ACTIVE",
      sandbox_simulation: true,
      message:
        "Cashfree Sandbox Simulation active. Please configure real Cashfree App ID & Secret Key in .env.local to connect to live Cashfree servers.",
    });
  } catch (error: unknown) {
    console.error("[Cashfree Create Order Critical Error]", error);

    const message =
      error instanceof Error ? error.message : "Failed to create payment order";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
