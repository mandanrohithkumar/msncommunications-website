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
        { success: false, error: "Missing orderId" },
        { status: 400 }
      );
    }

    // Fetch all payments for this order from Cashfree
    const response = await cashfree.PGOrderFetchPayments(
      "2025-01-01",
      orderId
    );
    const payments = response.data;

    if (!payments || !Array.isArray(payments) || payments.length === 0) {
      return NextResponse.json({
        success: false,
        status: "NO_PAYMENTS",
        message: "No payment transactions found for this order.",
      });
    }

    // Check if any payment succeeded
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

    // Check for pending or failed
    const pendingPayment = payments.find(
      (txn: { payment_status?: string }) => txn.payment_status === "PENDING"
    );

    if (pendingPayment) {
      return NextResponse.json({
        success: false,
        status: "PENDING",
        message:
          "Payment is still being processed. Please wait a few minutes.",
      });
    }

    // All transactions failed
    return NextResponse.json({
      success: false,
      status: "FAILED",
      message: "Payment was not successful. Please try again.",
    });
  } catch (error: unknown) {
    console.error("[Cashfree Verify Payment Error]", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to verify payment status";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
