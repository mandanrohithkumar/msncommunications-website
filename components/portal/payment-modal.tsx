"use client";

import React, { useState } from "react";
import { usePortal } from "@/lib/portal-store";
import { PaymentMethod } from "@/types/portal";
import {
  createCashfreeOrder,
  openCashfreeCheckout,
  verifyCashfreePayment,
} from "@/lib/cashfree-client";
import {
  X,
  QrCode,
  CreditCard,
  Building2,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Loader2,
  AlertTriangle,
  XCircle,
} from "lucide-react";

type PaymentStage =
  | "select" // User picking method
  | "creating" // Creating Cashfree order
  | "checkout" // Cashfree modal is open
  | "verifying" // Verifying payment server-side
  | "success" // Payment confirmed
  | "failed" // Payment failed
  | "error"; // System error

export const PaymentModal: React.FC = () => {
  const {
    activePaymentApp,
    setActivePaymentApp,
    processPayment,
    setCurrentView,
  } = usePortal();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("UPI");
  const [stage, setStage] = useState<PaymentStage>("select");
  const [errorMessage, setErrorMessage] = useState<string>("");

  if (!activePaymentApp) return null;

  const handleCashfreePay = async () => {
    setStage("creating");
    setErrorMessage("");

    try {
      // Step 1: Create order on backend -> Cashfree PG API
      const rawOrderId = `MSN_${activePaymentApp.id.replace(/[^a-zA-Z0-9_-]/g, "_")}_${Date.now()}`;
      console.log("[Cashfree Checkout Flow] 1. Initiating order creation:", {
        orderId: rawOrderId,
        amount: activePaymentApp.price,
        customerName: activePaymentApp.customerName,
        customerPhone: activePaymentApp.customerPhone,
        service: activePaymentApp.serviceName,
      });

      const orderResult = await createCashfreeOrder({
        orderId: rawOrderId,
        orderAmount: activePaymentApp.price,
        customerName: activePaymentApp.customerName || "Customer",
        customerEmail: activePaymentApp.customerEmail || "customer@meeseva.telangana.gov.in",
        customerPhone: activePaymentApp.customerPhone || "9848012345",
        serviceName: activePaymentApp.serviceName,
      });

      console.log("[Cashfree Checkout Flow] 2. Order creation response:", orderResult);

      if (!orderResult.success || !orderResult.payment_session_id) {
        const errorMsg =
          orderResult.error ||
          (orderResult.details as { message?: string })?.message ||
          "Failed to generate payment session with Cashfree";

        console.error("[Cashfree Checkout Flow] Order creation error:", {
          error: errorMsg,
          details: orderResult.details,
        });

        setStage("error");
        setErrorMessage(errorMsg);
        return;
      }

      const activeOrderId = orderResult.order_id || rawOrderId;
      const sessionId = orderResult.payment_session_id;

      // Step 2: Open Cashfree checkout modal
      setStage("checkout");
      console.log("[Cashfree Checkout Flow] 3. Opening Cashfree checkout modal with session:", sessionId);

      const checkoutResult = await openCashfreeCheckout(sessionId);
      console.log("[Cashfree Checkout Flow] 4. Checkout modal returned:", checkoutResult);

      if (checkoutResult.status === "cancelled") {
        console.log("[Cashfree Checkout Flow] User dismissed or cancelled checkout");
        setStage("select");
        return;
      }

      if (checkoutResult.status === "failed") {
        const failReason = checkoutResult.error || "Payment was declined by bank or gateway.";
        console.warn("[Cashfree Checkout Flow] Payment checkout failed:", failReason);

        // Record FAILED status in database / store
        processPayment(activePaymentApp.id, selectedMethod, "Failed", {
          transactionRef: `CF_FAIL_${Date.now()}`,
          errorMessage: failReason,
        });

        setStage("failed");
        setErrorMessage(failReason);
        return;
      }

      // Step 3: Verify payment server-side (THE source of truth)
      setStage("verifying");
      console.log("[Cashfree Checkout Flow] 5. Verifying payment server-side for order:", activeOrderId);

      const verifyResult = await verifyCashfreePayment(activeOrderId);
      console.log("[Cashfree Checkout Flow] 6. Server verification response:", verifyResult);

      if (verifyResult.success && verifyResult.status === "PAID") {
        // SUCCESS: Update application & payment in database
        console.log("[Cashfree Checkout Flow] ✅ Payment status SUCCESS confirmed.");
        setStage("success");

        const cfMethod = verifyResult.payment?.payment_method;
        let resolvedMethod: PaymentMethod = selectedMethod;
        if (cfMethod) {
          const methodStr = JSON.stringify(cfMethod).toLowerCase();
          if (methodStr.includes("upi")) resolvedMethod = "UPI";
          else if (methodStr.includes("netbanking")) resolvedMethod = "Net Banking";
          else if (methodStr.includes("card")) resolvedMethod = "Debit Card";
        }

        processPayment(activePaymentApp.id, resolvedMethod, "Successful", {
          cfPaymentId: verifyResult.payment?.cf_payment_id,
          transactionRef: verifyResult.payment?.bank_reference || `CF_${activeOrderId}`,
        });

        // Show success briefly then navigate
        setTimeout(() => {
          setCurrentView("history");
        }, 1500);
      } else if (verifyResult.status === "PENDING") {
        // PENDING: Update application & payment to Pending
        console.warn("[Cashfree Checkout Flow] ⏳ Payment status is PENDING.");
        processPayment(activePaymentApp.id, selectedMethod, "Pending", {
          transactionRef: `CF_PENDING_${Date.now()}`,
          errorMessage: verifyResult.message,
        });

        setStage("verifying");
        setErrorMessage(
          "Payment confirmation is currently pending with your bank. Application status has been saved as Payment Pending."
        );
        setTimeout(() => {
          setCurrentView("history");
          setActivePaymentApp(null);
        }, 3000);
      } else {
        // FAILED: Update application & payment to Failed
        const failMessage =
          verifyResult.message ||
          verifyResult.error ||
          "Payment verification failed. If your account was debited, it will be refunded within 3-5 business days.";

        console.warn("[Cashfree Checkout Flow] ❌ Payment status verification returned FAILED:", failMessage);

        processPayment(activePaymentApp.id, selectedMethod, "Failed", {
          transactionRef: `CF_FAILED_${Date.now()}`,
          errorMessage: failMessage,
        });

        setStage("failed");
        setErrorMessage(failMessage);
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "An unexpected payment error occurred.";
      console.error("[Cashfree Checkout Critical Error]", {
        error: err,
        message: errorMsg,
      });

      setStage("error");
      setErrorMessage(`Cashfree Payment Error: ${errorMsg}`);
    }
  };

  const handleRetry = () => {
    setStage("select");
    setErrorMessage("");
  };

  const methods: {
    id: PaymentMethod;
    label: string;
    icon: React.ReactNode;
    desc: string;
  }[] = [
    {
      id: "UPI",
      label: "UPI (Google Pay / PhonePe / Paytm)",
      icon: <QrCode className="w-5 h-5 text-[#FF9933]" />,
      desc: "Instant payment via UPI ID or QR",
    },
    {
      id: "QR Code",
      label: "Dynamic BharatQR Scan",
      icon: <QrCode className="w-5 h-5 text-[#138808]" />,
      desc: "Scan with any banking or UPI app",
    },
    {
      id: "Net Banking",
      label: "Net Banking",
      icon: <Building2 className="w-5 h-5 text-[#000080]" />,
      desc: "All major Indian banks supported",
    },
    {
      id: "Debit Card",
      label: "Debit / Credit Card",
      icon: <CreditCard className="w-5 h-5 text-[#E65100]" />,
      desc: "Visa, Mastercard, RuPay",
    },
  ];

  // ── SUCCESS STATE ──
  if (stage === "success") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
        <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-8 text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#138808]/10 flex items-center justify-center animate-in zoom-in duration-300">
            <CheckCircle2 className="w-10 h-10 text-[#138808]" />
          </div>
          <h3 className="text-lg font-bold text-[#138808]">
            Payment Successful!
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            ₹{activePaymentApp.price} paid for{" "}
            <strong>{activePaymentApp.serviceName}</strong>
          </p>
          <p className="text-xs text-slate-400">Redirecting to history...</p>
        </div>
      </div>
    );
  }

  // ── FAILED / ERROR STATE ──
  if (stage === "failed" || stage === "error") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
        <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-8 text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center">
            {stage === "failed" ? (
              <XCircle className="w-10 h-10 text-red-500" />
            ) : (
              <AlertTriangle className="w-10 h-10 text-amber-500" />
            )}
          </div>
          <h3 className="text-lg font-bold text-red-600 dark:text-red-400">
            {stage === "failed" ? "Payment Failed" : "Cashfree Gateway Notice"}
          </h3>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-left">
            <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 mb-1">
              Gateway Diagnostic
            </span>
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 break-words leading-relaxed">
              {errorMessage}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setActivePaymentApp(null)}
              className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleRetry}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#FF9933] to-[#FF6F00] text-white text-sm font-bold transition-all shadow-md cursor-pointer"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── CREATING / VERIFYING LOADING STATE ──
  if (stage === "creating" || stage === "checkout" || stage === "verifying") {
    const stageMessages: Record<string, string> = {
      creating: "Initializing secure payment...",
      checkout: "Complete payment in the Cashfree window...",
      verifying: "Verifying payment with bank...",
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
        <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-8 text-center space-y-5">
          <Loader2 className="w-12 h-12 mx-auto text-[#FF9933] animate-spin" />
          <h3 className="text-base font-bold text-[#000080] dark:text-white">
            {stageMessages[stage]}
          </h3>
          <p className="text-xs text-slate-400">
            {stage === "checkout"
              ? "Do not close this window."
              : "Please wait..."}
          </p>
          {errorMessage && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
              {errorMessage}
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── DEFAULT: PAYMENT METHOD SELECTION ──
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 md:p-8 text-slate-900 dark:text-white space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF9933]">
              Cashfree Secure Payment
            </span>
            <h3 className="text-base font-bold text-[#000080] dark:text-white mt-0.5">
              Application Checkout
            </h3>
          </div>
          <button
            onClick={() => setActivePaymentApp(null)}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Order Summary */}
        <div className="p-4 rounded-2xl bg-[#F9FAFB] dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Application ID:
            </span>
            <span className="font-mono font-semibold text-[#000080] dark:text-blue-300">
              {activePaymentApp.id}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Service:
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
              {activePaymentApp.serviceName}
            </span>
          </div>
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Total Statutory Fee:
            </span>
            <span className="text-lg font-black text-[#138808]">
              ₹{activePaymentApp.price}
            </span>
          </div>
        </div>

        {/* Payment Methods (visual preference only — Cashfree handles actual selection) */}
        <div className="space-y-2.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Preferred Payment Mode
          </label>
          {methods.map((m) => (
            <div
              key={m.id}
              onClick={() => setSelectedMethod(m.id)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                selectedMethod === m.id
                  ? "bg-[#FFF3E0] dark:bg-amber-950/20 border-[#FF9933] text-slate-900 dark:text-white shadow-sm"
                  : "bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50">
                  {m.icon}
                </div>
                <div>
                  <p className="text-xs font-semibold">{m.label}</p>
                  <p className="text-[10px] text-slate-500">{m.desc}</p>
                </div>
              </div>
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  selectedMethod === m.id
                    ? "border-[#FF9933] bg-[#FF9933] text-white"
                    : "border-slate-300 dark:border-slate-700"
                }`}
              >
                {selectedMethod === m.id && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Cashfree badge */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-[#138808]" />
          <span>Secured by Cashfree · 256-Bit Encrypted</span>
        </div>

        {/* Pay Button */}
        <button
          onClick={handleCashfreePay}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FF9933] to-[#FF6F00] hover:from-[#FF6F00] hover:to-[#E65100] text-white text-xs font-bold transition-all shadow-md shadow-[#FF9933]/30 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Pay ₹{activePaymentApp.price} via Cashfree</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
