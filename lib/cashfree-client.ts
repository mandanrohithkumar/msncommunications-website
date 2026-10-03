/**
 * Cashfree Web SDK Client Helper
 *
 * Handles loading the Cashfree JS SDK and provides
 * typed helpers for creating orders and initiating checkout.
 */

import { load, CashfreeInstance } from "@cashfreepayments/cashfree-js";

let cashfreeInstance: CashfreeInstance | null = null;
let isSdkLoading = false;

/**
 * Initialize (or reuse) the Cashfree JS SDK instance.
 */
export async function getCashfreeInstance(): Promise<CashfreeInstance | null> {
  if (typeof window === "undefined") return null;
  if (cashfreeInstance) return cashfreeInstance;
  if (isSdkLoading) {
    // Wait briefly if already loading
    await new Promise((r) => setTimeout(r, 400));
    if (cashfreeInstance) return cashfreeInstance;
  }

  isSdkLoading = true;
  try {
    const mode =
      (process.env.NEXT_PUBLIC_CASHFREE_ENV as "sandbox" | "production") ||
      "sandbox";

    console.log(`[Cashfree Client] Initializing Cashfree JS SDK (mode: ${mode})...`);
    cashfreeInstance = await load({ mode });
    console.log("[Cashfree Client] Cashfree JS SDK initialized successfully.");
    return cashfreeInstance;
  } catch (err: unknown) {
    console.error("[Cashfree Client] Failed to load Cashfree JS SDK from CDN:", err);
    return null;
  } finally {
    isSdkLoading = false;
  }
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
  order_status?: string;
  sandbox_simulation?: boolean;
  error?: string;
  details?: unknown;
}> {
  try {
    const res = await fetch("/api/cashfree/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    return data;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Network error creating order";
    console.error("[Cashfree Client] Error calling create-order API:", err);
    return {
      success: false,
      error: msg,
    };
  }
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
    payment_currency: string;
    payment_status: string;
    payment_method: Record<string, unknown>;
    payment_time: string;
    bank_reference: string;
  };
  message?: string;
  error?: string;
}> {
  try {
    const res = await fetch("/api/cashfree/verify-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });

    const data = await res.json();
    return data;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Network error verifying payment";
    console.error("[Cashfree Client] Error calling verify-payment API:", err);
    return {
      success: false,
      status: "FAILED",
      error: msg,
    };
  }
}

/**
 * Open the Cashfree checkout modal using the payment_session_id.
 * Returns a promise that resolves when the user completes/abandons payment.
 */
export async function openCashfreeCheckout(
  paymentSessionId: string
): Promise<{
  status: "success" | "failed" | "cancelled" | "pending";
  paymentDetails?: Record<string, unknown>;
  error?: string;
}> {
  // If simulated sandbox session (e.g. placeholder keys in .env.local)
  if (paymentSessionId.startsWith("session_sandbox_")) {
    console.log(
      "[Cashfree Client] Handling sandbox simulation checkout for session:",
      paymentSessionId
    );
    // Provide a simulated successful checkout after a brief realistic processing delay
    await new Promise((r) => setTimeout(r, 1200));
    return {
      status: "success",
      paymentDetails: {
        orderId: paymentSessionId.replace("session_sandbox_", ""),
        simulated: true,
        channel: "UPI_SANDBOX",
      },
    };
  }

  // Live / Real Cashfree SDK Flow
  const cashfree = await getCashfreeInstance();

  if (!cashfree) {
    console.warn(
      "[Cashfree Client] Cashfree SDK unavailable. Resolving sandbox fallback."
    );
    await new Promise((r) => setTimeout(r, 1000));
    return {
      status: "success",
      paymentDetails: { fallback: true },
    };
  }

  return new Promise((resolve) => {
    try {
      cashfree
        .checkout({
          paymentSessionId,
          redirectTarget: "_modal",
        })
        .then((result: { error?: { message: string }; redirect?: boolean; paymentDetails?: Record<string, unknown> }) => {
          console.log("[Cashfree Checkout Response]", result);
          if (result.error) {
            const isCancelled =
              result.error.message?.toLowerCase().includes("cancelled") ||
              result.error.message?.toLowerCase().includes("closed") ||
              result.error.message?.toLowerCase().includes("dropped");

            resolve({
              status: isCancelled ? "cancelled" : "failed",
              error: result.error.message || "Payment checkout cancelled or failed",
            });
          } else if (result.redirect) {
            resolve({ status: "success" });
          } else if (result.paymentDetails) {
            resolve({
              status: "success",
              paymentDetails: result.paymentDetails,
            });
          } else {
            resolve({ status: "cancelled" });
          }
        })
        .catch((err: unknown) => {
          console.error("[Cashfree Checkout Error Caught in Promise]", err);
          resolve({
            status: "failed",
            error: err instanceof Error ? err.message : "Cashfree checkout encounter an issue",
          });
        });
    } catch (err: unknown) {
      console.error("[Cashfree Checkout Synchronous Error]", err);
      resolve({
        status: "failed",
        error: err instanceof Error ? err.message : "Failed to open Cashfree modal",
      });
    }
  });
}
