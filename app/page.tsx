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

function PortalApp() {
  const {
    user,
    currentView,
    theme,
    isProfileOpen,
    activePaymentApp,
    previewDoc,
  } = usePortal();

  // Show auth/login screen if not logged in
  if (!user) {
    return (
      <div className={`min-h-screen relative overflow-hidden transition-colors duration-200 ${theme === "light" ? "light bg-slate-50 text-slate-900" : "dark bg-[#08090f] text-slate-100"}`}>
        <StarlightBackground />
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
          <AuthView />
        </div>
      </div>
    );
  }

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
