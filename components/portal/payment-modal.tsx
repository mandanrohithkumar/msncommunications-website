"use client";

import React, { useState } from "react";
import { usePortal } from "@/lib/portal-store";
import { PaymentMethod } from "@/types/portal";
import { X, QrCode, CreditCard, Building2, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";

export const PaymentModal: React.FC = () => {
  const { activePaymentApp, setActivePaymentApp, processPayment, setCurrentView } = usePortal();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("UPI");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!activePaymentApp) return null;

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      processPayment(activePaymentApp.id, selectedMethod);
      setIsProcessing(false);
      setCurrentView("history");
    }, 800);
  };

  const methods: { id: PaymentMethod; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: "UPI",
      label: "UPI (Google Pay / PhonePe / Paytm)",
      icon: <QrCode className="w-5 h-5 text-[#FF9933]" />,
      desc: "Instant payment via UPI ID or QR"
    },
    {
      id: "QR Code",
      label: "Dynamic BharatQR Scan",
      icon: <QrCode className="w-5 h-5 text-[#138808]" />,
      desc: "Scan with any banking or UPI app"
    },
    {
      id: "Net Banking",
      label: "Net Banking",
      icon: <Building2 className="w-5 h-5 text-[#000080]" />,
      desc: "All major Indian banks supported"
    },
    {
      id: "Debit Card",
      label: "Debit / Credit Card",
      icon: <CreditCard className="w-5 h-5 text-[#E65100]" />,
      desc: "Visa, Mastercard, RuPay"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 md:p-8 text-slate-900 dark:text-white space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF9933]">
              Official Payment Gateway
            </span>
            <h3 className="text-base font-bold text-[#000080] dark:text-white mt-0.5">Application Checkout</h3>
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
            <span className="text-slate-500 dark:text-slate-400">Application ID:</span>
            <span className="font-mono font-semibold text-[#000080] dark:text-blue-300">{activePaymentApp.id}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Service:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
              {activePaymentApp.serviceName}
            </span>
          </div>
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Total Statutory Fee:</span>
            <span className="text-lg font-black text-[#138808]">₹{activePaymentApp.price}</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-2.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Select Payment Mode
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
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50">{m.icon}</div>
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
                {selectedMethod === m.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </div>
          ))}
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-[#138808]" />
          <span>256-Bit Encrypted Payment Processing</span>
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePay}
          disabled={isProcessing}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FF9933] to-[#FF6F00] hover:from-[#FF6F00] hover:to-[#E65100] text-white text-xs font-bold transition-all shadow-md shadow-[#FF9933]/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          {isProcessing ? (
            <span>Authorizing Payment...</span>
          ) : (
            <>
              <span>Authorize & Pay ₹{activePaymentApp.price}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
