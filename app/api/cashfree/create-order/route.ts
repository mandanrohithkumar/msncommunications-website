import { Cashfree, CFEnvironment } from "cashfree-pg";
import { NextRequest, NextResponse } from "next/server";

// Create a Cashfree instance (server-side only)
const cashfree = new Cashfree(
  process.env.NEXT_PUBLIC_CASHFREE_ENV === "production"
    ? CFEnvironment.PRODUCTION
    : CFEnvironment.SANDBOX,
  process.env.NEXT_PUBLIC_CASHFREE_APP_ID!,
  process.env.CASHFREE_SECRET_KEY!
);

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

    // Validate required fields
    if (!orderId || !orderAmount || !customerPhone) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: orderId, orderAmount, customerPhone",
        },
        { status: 400 }
      );
    }

    // Build the Cashfree order request
    const orderRequest = {
      order_id: orderId,
      order_amount: parseFloat(orderAmount),
      order_currency: "INR",
      customer_details: {
        customer_id: `cust_${orderId}`,
        customer_name: customerName || "Customer",
        customer_email: customerEmail || "",
        customer_phone: customerPhone,
      },
      order_meta: {
        return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}?order_id={order_id}`,
        notify_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/cashfree/webhook`,
        payment_methods: "",
      },
      order_note: serviceName ? `Payment for: ${serviceName}` : undefined,
    };

    // Call Cashfree Create Order API
    const response = await cashfree.PGCreateOrder(orderRequest);
    const data = response.data;

    return NextResponse.json({
      success: true,
      order_id: data.order_id,
      payment_session_id: data.payment_session_id,
      order_status: data.order_status,
    });
  } catch (error: unknown) {
    console.error("[Cashfree Create Order Error]", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to create payment order";

    // Cashfree SDK errors often have response data
    const cfError = error as { response?: { data?: unknown } };
    const details = cfError?.response?.data || null;

    return NextResponse.json(
      {
        success: false,
        error: message,
        details,
      },
      { status: 500 }
    );
  }
}
