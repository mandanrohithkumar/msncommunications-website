/**
 * Cashfree Web SDK Client Helper
 *
 * Handles loading the Cashfree JS SDK and provides
 * typed helpers for creating orders and initiating checkout.
 */

import { load, CashfreeInstance } from "@cashfreepayments/cashfree-js";

let cashfreeInstance: CashfreeInstance | null = null;

/**
 * Initialize (or reuse) the Cashfree JS SDK instance.
 */
export async function getCashfreeInstance(): Promise<CashfreeInstance> {
  if (cashfreeInstance) return cashfreeInstance;

  const mode =
    (process.env.NEXT_PUBLIC_CASHFREE_ENV as "sandbox" | "production") ||
    "sandbox";

  cashfreeInstance = await load({ mode });
  return cashfreeInstance;
}

/**
 * Create an order on your backend and get the payment_session_id.
 */
export async function createCashfreeOrder(params: {
  orderId: string;
  orderAmount: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceName: string;
}): Promise<{
  success: boolean;
  order_id?: string;
  payment_session_id?: string;
  error?: string;
}> {
  const res = await fetch("/api/cashfree/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  return data;
}

/**
 * After payment, verify the order status server-side.
 */
export async function verifyCashfreePayment(orderId: string): Promise<{
  success: boolean;
  status: string;
  payment?: {
    cf_payment_id: string;
    payment_amount: number;
    payment_method: Record<string, unknown>;
    payment_time: string;
    bank_reference: string;
  };
  message?: string;
  error?: string;
}> {
  const res = await fetch("/api/cashfree/verify-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId }),
  });

  const data = await res.json();
  return data;
}

/**
 * Open the Cashfree checkout modal using the payment_session_id.
 * Returns a promise that resolves when the user completes/abandons payment.
 */
export async function openCashfreeCheckout(
  paymentSessionId: string
): Promise<{
  status: "success" | "failed" | "cancelled";
  paymentDetails?: Record<string, unknown>;
  error?: string;
}> {
  const cashfree = await getCashfreeInstance();

  return new Promise((resolve) => {
    cashfree
      .checkout({
        paymentSessionId,
        redirectTarget: "_modal",
      })
      .then((result: { error?: { message: string }; redirect?: boolean; paymentDetails?: Record<string, unknown> }) => {
        if (result.error) {
          // Payment errored out or user closed the modal
          resolve({
            status: result.error.message?.includes("cancelled")
              ? "cancelled"
              : "failed",
            error: result.error.message,
          });
        } else if (result.redirect) {
          // For redirect-based flows (rarely used with _modal)
          resolve({ status: "success" });
        } else if (result.paymentDetails) {
          // Payment completed
          resolve({
            status: "success",
            paymentDetails: result.paymentDetails,
          });
        } else {
          resolve({ status: "cancelled" });
        }
      });
  });
}
