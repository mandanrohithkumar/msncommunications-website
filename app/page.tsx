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
import { ProfileModal } from "@/components/portal/profile-modal";
import { PaymentModal } from "@/components/portal/payment-modal";
import { DocumentModal } from "@/components/portal/document-modal";
import { NotificationMessageCenter } from "@/components/portal/notification-message-center";
import { StarlightBackground } from "@/components/portal/starlight-background";

import { X } from "lucide-react";

function PortalApp() {
  const {
    user,
    currentView,
    theme,
    isProfileOpen,
    activePaymentApp,
    previewDoc,
    isAuthOpen,
    setIsAuthOpen,
  } = usePortal();

  return (
    <div className={`min-h-screen relative transition-colors duration-200 ${theme === "light" ? "light bg-slate-50 text-slate-900" : "dark bg-[#08090f] text-slate-100"}`}>
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
        {currentView === "owner-dashboard" && <OwnerDashboard />}
        {currentView === "admin-dashboard" && <AdminDashboard />}
      </main>

      {/* Modals */}
      {isProfileOpen && <ProfileModal />}
      {activePaymentApp && <PaymentModal />}
      {previewDoc && <DocumentModal />}
      <NotificationMessageCenter />

      {/* Explicit Customer Login Dialog (only triggered on deliberate user action) */}
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
