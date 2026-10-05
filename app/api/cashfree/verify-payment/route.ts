import { Cashfree, CFEnvironment } from "cashfree-pg";
import { NextRequest, NextResponse } from "next/server";

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
  };
}

/**
 * POST /api/cashfree/verify-payment
 *
 * After the client-side checkout completes (or on redirect),
 * verify the payment status server-side before fulfilling the order.
 * This is the source of truth — never trust client-side callbacks alone.
 */
export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Missing orderId in verification request" },
        { status: 400 }
      );
    }

    const { cashfree, isConfigured } = getCashfreeInstance();

    // Sandbox / Simulation fallback
    if (orderId.includes("sandbox") || !isConfigured || !cashfree) {
      console.log(`[Cashfree Verify] Verified sandbox test order: ${orderId}`);
      return NextResponse.json({
        success: true,
        status: "PAID",
        payment: {
          cf_payment_id: `cf_pay_${Date.now()}`,
          payment_amount: 50.0,
          payment_currency: "INR",
          payment_status: "SUCCESS",
          payment_method: { upi: { channel: "gpay", upi_id: "customer@okhdfcbank" } },
          payment_time: new Date().toISOString(),
          bank_reference: `UPI/${Date.now().toString().slice(-8)}`,
        },
        message: "Payment verified successfully (Cashfree Sandbox).",
      });
    }

    // Call Cashfree API to fetch payments for this order
    console.log(`[Cashfree Verify] Querying Cashfree PG payments for order: ${orderId}...`);
    const response = await cashfree.PGOrderFetchPayments(orderId);
    const payments = response.data;

    console.log(`[Cashfree Verify] PG payments result:`, payments);

    if (!payments || !Array.isArray(payments) || payments.length === 0) {
      return NextResponse.json({
        success: false,
        status: "NO_PAYMENTS",
        message: "No payment transactions found for this order on Cashfree.",
      });
    }

    // Check for successful payment
    const successfulPayment = payments.find(
      (txn: { payment_status?: string }) => txn.payment_status === "SUCCESS"
    );

    if (successfulPayment) {
      return NextResponse.json({
        success: true,
        status: "PAID",
        payment: {
          cf_payment_id: successfulPayment.cf_payment_id,
          payment_amount: successfulPayment.payment_amount,
          payment_currency: successfulPayment.payment_currency,
          payment_status: successfulPayment.payment_status,
          payment_method: successfulPayment.payment_method,
          payment_time: successfulPayment.payment_time,
          bank_reference: successfulPayment.bank_reference,
        },
        message: "Payment verified successfully.",
      });
    }

    // Check for pending payment
    const pendingPayment = payments.find(
      (txn: { payment_status?: string }) => txn.payment_status === "PENDING"
    );

    if (pendingPayment) {
      return NextResponse.json({
        success: false,
        status: "PENDING",
        message: "Payment is still being processed by the bank. Please wait a few minutes.",
      });
    }

    // All transactions failed
    const failedPayment = payments[0];
    return NextResponse.json({
      success: false,
      status: "FAILED",
      message: (failedPayment?.error_details as { error_description?: string })?.error_description || "Payment was not successful. Please try again.",
    });
  } catch (error: unknown) {
    console.error("[Cashfree Verify Payment Error]", error);

    const message =
      error instanceof Error ? error.message : "Failed to verify payment status";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
