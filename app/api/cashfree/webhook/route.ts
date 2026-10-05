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
 * POST /api/cashfree/webhook
 *
 * Cashfree sends payment event notifications here.
 * We verify the webhook signature, then process the event.
 *
 * IMPORTANT: This endpoint MUST return 200 quickly —
 * Cashfree will retry if it doesn't get a 200 within 5 seconds.
 */
export async function POST(req: NextRequest) {
  try {
    // Get the raw body for signature verification
    const rawBody = await req.text();
    const signature = req.headers.get("x-webhook-signature") || "";
    const timestamp = req.headers.get("x-webhook-timestamp") || "";

    const { cashfree, isConfigured } = getCashfreeInstance();

    // Verify webhook authenticity using Cashfree SDK
    if (isConfigured && cashfree) {
      try {
        cashfree.PGVerifyWebhookSignature(signature, rawBody, timestamp);
      } catch (sigErr) {
        console.error("[Webhook] Invalid signature — rejecting.", sigErr);
        return NextResponse.json(
          { success: false, error: "Invalid webhook signature" },
          { status: 400 }
        );
      }
    } else {
      console.warn("[Webhook] SDK not configured; skipping signature verification for local/sandbox test.");
    }

    // Parse the verified payload
    const payload = JSON.parse(rawBody);
    const eventType = payload?.type;
    const orderData = payload?.data?.order;
    const paymentData = payload?.data?.payment;

    console.log(`[Webhook] Event: ${eventType}`, {
      order_id: orderData?.order_id,
      order_status: orderData?.order_status,
      payment_status: paymentData?.payment_status,
    });

    // Route events
    switch (eventType) {
      case "PAYMENT_SUCCESS_WEBHOOK":
        // ✅ Payment was successful
        // In a real app, update your database here:
        //   - Mark order as "paid" in your DB
        //   - Trigger service fulfillment
        //   - Send confirmation email/SMS
        console.log(
          `[Webhook] ✅ Payment SUCCESS for order: ${orderData?.order_id}`,
          {
            amount: paymentData?.payment_amount,
            method: paymentData?.payment_method,
            cf_payment_id: paymentData?.cf_payment_id,
            bank_reference: paymentData?.bank_reference,
          }
        );
        break;

      case "PAYMENT_FAILED_WEBHOOK":
        // ❌ Payment failed
        console.log(
          `[Webhook] ❌ Payment FAILED for order: ${orderData?.order_id}`,
          {
            error: paymentData?.error_details,
          }
        );
        break;

      case "PAYMENT_USER_DROPPED_WEBHOOK":
        // 🚫 User abandoned payment
        console.log(
          `[Webhook] 🚫 User DROPPED for order: ${orderData?.order_id}`
        );
        break;

      default:
        console.log(`[Webhook] Unhandled event type: ${eventType}`);
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("[Webhook Error]", error);
    // Still return 200 to prevent Cashfree retries on parse errors
    return NextResponse.json({ success: true });
  }
}
