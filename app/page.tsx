"use client";

import React from "react";
import { PortalProvider, usePortal } from "@/lib/portal-store";
import { PortalNavbar } from "@/components/portal/navbar";
import { AuthView } from "@/components/portal/auth-view";
import { MeesevaDashboard } from "@/components/portal/meeseva-dashboard";
import { OnlineWorksDashboard } from "@/components/portal/online-works-dashboard";
import { DynamicForm } from "@/components/portal/dynamic-form";
import { DocumentManagement } from "@/components/portal/document-management";
import { ApplicationHistory } from "@/components/portal/application-history";
import { OwnerDashboard } from "@/components/portal/owner-dashboard";
import { AdminDashboard } from "@/components/portal/admin-dashboard";
import { CustomerDashboard } from "@/components/portal/customer-dashboard";
import { ProfileModal } from "@/components/portal/profile-modal";
import { PaymentModal } from "@/components/portal/payment-modal";
import { DocumentModal } from "@/components/portal/document-modal";
import { NotificationMessageCenter } from "@/components/portal/notification-message-center";
import { StarlightBackground } from "@/components/portal/starlight-background";
import { X, ShieldCheck, Lock } from "lucide-react";

function PortalApp() {
  const {
    user,
    isLoggedIn,
    isAuthChecking,
    currentView,
    theme,
    toggleTheme,
    isProfileOpen,
    activePaymentApp,
    previewDoc,
    isAuthOpen,
    setIsAuthOpen,
  } = usePortal();

  // 1. Initial Session Verification State (prevents flash of unauthenticated UI while verifying cookies)
  if (isAuthChecking) {
    return (
      <div className={`min-h-screen relative flex items-center justify-center transition-colors duration-200 ${theme === "light" ? "light bg-slate-50 text-slate-900" : "dark bg-[#08090f] text-slate-100"}`}>
        <StarlightBackground />
        <div className="relative z-10 flex flex-col items-center gap-4 animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#000080] via-[#000066] to-[#138808] p-0.5 shadow-xl flex items-center justify-center">
            <div className="w-full h-full rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-3xl animate-pulse">
              🏛️
            </div>
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-sm font-bold tracking-tight text-[#000080] dark:text-blue-300">
              MSN MeeSeva & Government Services Portal
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verifying secure session & access permissions...
            </p>
          </div>
          <div className="w-6 h-6 border-2 border-[#000080] dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // 2. Route Protection: If unauthenticated, NEVER render inside dashboard or navbar
  if (!user || !isLoggedIn) {
    return (
      <div className={`min-h-screen relative flex flex-col justify-between overflow-y-auto transition-colors duration-200 ${theme === "light" ? "light bg-slate-50 text-slate-900" : "dark bg-[#08090f] text-slate-100"}`}>
        <StarlightBackground />

        {/* Top Government Portal Branding Bar */}
        <header className="relative z-10 w-full max-w-4xl mx-auto px-4 pt-2.5 pb-1 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#000080] via-[#000066] to-[#138808] p-0.5 shadow-md flex items-center justify-center shrink-0">
              <div className="w-full h-full rounded-[10px] bg-white dark:bg-slate-900 flex items-center justify-center text-lg font-bold">
                🏛️
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-extrabold tracking-tight text-[#000080] dark:text-blue-300">
                  MSN Communication & MeeSeva Services
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#E8F5E9] dark:bg-emerald-950/60 text-[#138808] dark:text-emerald-300 border border-[#C8E6C9] dark:border-emerald-800">
                  Official Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                Authorized Digital Citizen Services & Family Vault Authentication Gateway
              </p>
            </div>
          </div>

          {/* Security Badges & Theme Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50">
              <ShieldCheck className="w-3 h-3" />
              <span>256-Bit SSL</span>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer text-xs"
              title="Toggle Light/Dark Theme"
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>
          </div>
        </header>

        {/* Main Authentication Container - Perfectly Centered, Full Accessibility */}
        <main className="relative z-10 w-full max-w-lg mx-auto px-3 sm:px-4 flex-1 flex flex-col justify-center items-center py-3 sm:py-5">
          <AuthView />
        </main>

        {/* Footer with Compliance & Rights */}
        <footer className="relative z-10 w-full max-w-4xl mx-auto px-4 py-1.5 text-center text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-1.5 shrink-0">
          <p>© 2026 MSN Communication & MeeSeva Digital Center. All Government Rights Reserved.</p>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium text-[10px]">
              <Lock className="w-3 h-3 text-[#FF9933]" />
              <span>Route Guard Protected</span>
            </span>
            <span className="text-[10px]">• UIDAI Aadhaar Verified</span>
          </div>
        </footer>
      </div>
    );
  }

  // 3. Authenticated State: Inside Dashboard & Vault Navigation
  return (
    <div className={`min-h-screen relative transition-colors duration-200 animate-in fade-in duration-300 ${theme === "light" ? "light bg-slate-50 text-slate-900" : "dark bg-[#08090f] text-slate-100"}`}>
      <StarlightBackground />

      {/* Fixed Navigation Bar */}
      <div className="relative z-50">
        <PortalNavbar />
      </div>

      {/* Main Content */}
      <main className="relative z-10 pt-4 pb-16 min-h-screen">
        {currentView === "meeseva" && <MeesevaDashboard />}
        {currentView === "online-works" && <OnlineWorksDashboard />}
        {currentView === "online-sub" && <OnlineWorksDashboard />}
        {currentView === "form" && <DynamicForm />}
        {currentView === "documents" && <DocumentManagement />}
        {currentView === "history" && <ApplicationHistory />}
        {currentView === "payments" && <ApplicationHistory />}
        {currentView === "inbox" && <ApplicationHistory />}
        {currentView === "customer-dashboard" && <CustomerDashboard />}
        {currentView === "owner-dashboard" && <OwnerDashboard />}
        {currentView === "admin-dashboard" && <AdminDashboard />}
      </main>

      {/* Modals */}
      {isProfileOpen && <ProfileModal />}
      {activePaymentApp && <PaymentModal />}
      {previewDoc && <DocumentModal />}
      <NotificationMessageCenter />

      {/* Switch Account Modal (if opened while logged in) */}
      {isAuthOpen && (
        <div
          onClick={() => setIsAuthOpen(false)}
          className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg my-auto"
          >
            <button
              type="button"
              onClick={() => setIsAuthOpen(false)}
              className="absolute -top-3 -right-3 z-50 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white cursor-pointer transition-colors shadow-lg border border-slate-700"
              title="Close Login Window"
            >
              <X className="w-4 h-4" />
            </button>
            <AuthView />
          </div>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <PortalProvider>
      <PortalApp />
    </PortalProvider>
  );
}
