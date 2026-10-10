"use client";

import React, { useState, useMemo } from "react";
import { usePortal } from "@/lib/portal-store";
import { Application, ServiceItem, UploadedFileMeta, PortalMessage } from "@/types/portal";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Phone,
  Mail,
  FileText,
  MessageSquare,
  AlertTriangle,
  Send,
  Eye,
  User as UserIcon,
  Calendar,
  Sparkles,
  Download,
  Printer,
  Copy,
  Layers,
  Check,
  X,
  FileCheck2,
  MapPin,
  Building2,
  Search,
  LayoutDashboard,
  FolderLock,
  Receipt,
  Users,
  UserCheck,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  CreditCard,
  ArrowRight,
  TrendingUp,
  FileCheck,
  Upload,
  Camera,
  Scan,
  RefreshCw,
  BellRing,
  HelpCircle,
  FileBadge2,
  Shield,
  ChevronRight
} from "lucide-react";
import { resolveDocumentDataUrl, isImageDocument, isPdfDocument } from "@/lib/doc-preview-utils";
import { downloadDocument } from "@/lib/document-download-share";
import { ExtendedFamilyModal } from "./extended-family-modal";

export const CustomerDashboard: React.FC = () => {
  const {
    user,
    accounts,
    applications,
    meesevaServices,
    onlineCategories,
    uploadedDocs,
    getUserUploadedDocs,
    setPreviewDoc,
    openServiceForm,
    sendMessage,
    messages,
    payments,
    logout,
    setIsProfileOpen,
    getApplicationDocuments,
    uploadDocument
  } = usePortal();

  // Navigation & Layout States
  const [activeTab, setActiveTab] = useState<
    "overview" | "applications" | "apply" | "vault" | "payments" | "messages" | "family" | "profile"
  >("overview");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState<boolean>(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState<"all" | "meeseva" | "online">("all");
  const [copiedAppId, setCopiedAppId] = useState<string | null>(null);

  // Modals & Drawers
  const [selectedAppForDetails, setSelectedAppForDetails] = useState<Application | null>(null);
  const [selectedAppForMsg, setSelectedAppForMsg] = useState<Application | null>(null);
  const [msgInput, setMsgInput] = useState<string>("");
  const [msgSuccess, setMsgSuccess] = useState<boolean>(false);

  // Current customer account details
  const currentCustomerAccount = useMemo(() => {
    if (!user) return null;
    return accounts.find(
      (acc) =>
        acc.id === user.id ||
        acc.email.toLowerCase() === user.email.toLowerCase() ||
        (user.phone && acc.phone === user.phone)
    );
  }, [accounts, user]);

  // Customer's own applications
  const myApplications = useMemo(() => {
    if (!user) return [];
    const cleanUserEmail = user.email.toLowerCase().trim();
    const cleanUserId = user.id;

    return applications.filter((app) => {
      const appEmail = (app.customerEmail || "").toLowerCase().trim();
      const appCustId = app.customerId;
      return (
        appEmail === cleanUserEmail ||
        appCustId === cleanUserId ||
        (user.phone && app.customerPhone === user.phone)
      );
    });
  }, [applications, user]);

  // Status Metrics
  const inProgressCount = useMemo(
    () =>
      myApplications.filter(
        (app) =>
          app.status === "Processing" ||
          app.status === "Waiting for Owner" ||
          app.status === "Accepted" ||
          app.status === "Submitted"
      ).length,
    [myApplications]
  );

  const actionRequiredCount = useMemo(
    () =>
      myApplications.filter(
        (app) =>
          app.status === "Documents Required" ||
          app.status === "Payment Pending"
      ).length,
    [myApplications]
  );

  const completedCount = useMemo(
    () => myApplications.filter((app) => app.status === "Completed").length,
    [myApplications]
  );

  // Customer's uploaded vault documents
  const customerVaultDocs = useMemo(() => {
    if (!user) return {};
    return getUserUploadedDocs(user.email);
  }, [getUserUploadedDocs, user]);

  const vaultDocsList = useMemo(() => {
    return Object.values(customerVaultDocs);
  }, [customerVaultDocs]);

  // Customer's payments
  const myPayments = useMemo(() => {
    if (!user) return [];
    const cleanUserEmail = user.email.toLowerCase().trim();
    return payments.filter((p) => {
      const matchedApp = myApplications.find((a) => a.id === p.applicationId);
      return (
        Boolean(matchedApp) ||
        (p.customerName &&
          user.name &&
          p.customerName.toLowerCase() === user.name.toLowerCase())
      );
    });
  }, [myApplications, payments, user]);

  const totalSpent = useMemo(() => {
    return myPayments.reduce((acc, p) => {
      const numeric = parseInt(p.amount.replace(/[^0-9]/g, ""), 10) || 0;
      return acc + numeric;
    }, 0);
  }, [myPayments]);

  // Customer's messages
  const myMessages = useMemo(() => {
    if (!user) return [];
    const cleanUserId = user.id;
    const cleanEmail = user.email.toLowerCase();

    return messages.filter((m) => {
      return (
        m.recipientId === cleanUserId ||
        m.senderId === cleanUserId ||
        myApplications.some((app) => app.id === m.applicationId)
      );
    });
  }, [messages, myApplications, user]);

  // Unified catalog of all services
  const allServices = useMemo(() => {
    const list: ServiceItem[] = [...meesevaServices];
    onlineCategories.forEach((cat) => {
      if (cat.subServices) {
        list.push(...cat.subServices);
      }
    });
    return list;
  }, [meesevaServices, onlineCategories]);

  // Filtered applications for table/card view
  const filteredApplications = useMemo(() => {
    return myApplications.filter((app) => {
      // Status filter
      if (statusFilter === "in-progress") {
        if (
          app.status !== "Processing" &&
          app.status !== "Waiting for Owner" &&
          app.status !== "Accepted" &&
          app.status !== "Submitted"
        )
          return false;
      } else if (statusFilter === "action-required") {
        if (
          app.status !== "Documents Required" &&
          app.status !== "Payment Pending"
        )
          return false;
      } else if (statusFilter === "completed") {
        if (app.status !== "Completed") return false;
      } else if (statusFilter === "cancelled") {
        if (app.status !== "Cancelled" && app.status !== "Rejected")
          return false;
      }

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        app.id.toLowerCase().includes(q) ||
        app.serviceName.toLowerCase().includes(q) ||
        app.serviceCategory.toLowerCase().includes(q) ||
        (app.subCategory && app.subCategory.toLowerCase().includes(q))
      );
    });
  }, [myApplications, searchQuery, statusFilter]);

  // Filtered Services for Apply Catalog Tab
  const filteredCatalogServices = useMemo(() => {
    return allServices.filter((service) => {
      const isMeeSeva = meesevaServices.some((ms) => ms.id === service.id);
      if (catalogCategoryFilter === "meeseva" && !isMeeSeva) return false;
      if (catalogCategoryFilter === "online" && isMeeSeva) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        service.name.toLowerCase().includes(q) ||
        service.category.toLowerCase().includes(q)
      );
    });
  }, [allServices, meesevaServices, catalogCategoryFilter, searchQuery]);

  // Most recent active application for overview stepper
  const latestActiveApp = useMemo(() => {
    return myApplications.find(
      (app) => app.status !== "Completed" && app.status !== "Cancelled"
    ) || myApplications[0] || null;
  }, [myApplications]);

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAppId(label);
    setTimeout(() => setCopiedAppId(null), 2000);
  };

  // Send message to operator
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppForMsg || !msgInput.trim()) return;

    sendMessage(
      msgInput.trim(),
      selectedAppForMsg.id,
      selectedAppForMsg.assignedOwnerId || "owner-1"
    );
    setMsgInput("");
    setMsgSuccess(true);
    setTimeout(() => {
      setMsgSuccess(false);
      setSelectedAppForMsg(null);
    }, 1500);
  };

  // Status badge styling helper
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#E8F5E9] dark:bg-emerald-950/80 text-[#138808] dark:text-[#A5D6A7] border border-[#C8E6C9] dark:border-emerald-800 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Ready / Completed</span>
          </span>
        );
      case "Processing":
      case "Accepted":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#E8EEF5] dark:bg-blue-950/80 text-[#000080] dark:text-[#93C5FD] border border-[#BBDEFB] dark:border-blue-800 shadow-2xs">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "3s" }} />
            <span>In Processing</span>
          </span>
        );
      case "Waiting for Owner":
      case "Submitted":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FFF3E0] dark:bg-amber-950/80 text-[#E65100] dark:text-[#FFB74D] border border-[#FFE0B2] dark:border-amber-800 shadow-2xs">
            <Clock className="w-3.5 h-3.5" />
            <span>Queue / Submitted</span>
          </span>
        );
      case "Documents Required":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 shadow-2xs">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Action Required</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 md:py-6 animate-in fade-in duration-300">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* =========================================================================
            SIDEBAR NAVIGATION (Matches Super Admin & Owner styling perfectly)
            ========================================================================= */}
        <aside
          className={`w-full lg:sticky lg:top-20 z-30 transition-all duration-300 shrink-0 ${
            isSidebarCollapsed ? "lg:w-20" : "lg:w-64"
          }`}
        >
          <div className="rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col justify-between gap-6">
            <div className="space-y-4">
              
              {/* Sidebar Header: Citizen Badge & Desktop Collapse Button */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
                <div className={`flex items-center gap-2.5 overflow-hidden ${isSidebarCollapsed ? "lg:justify-center w-full" : ""}`}>
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#000080] via-[#000066] to-[#138808] flex items-center justify-center text-white shadow-md shadow-[#000080]/30 shrink-0">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full rounded-2xl object-cover" />
                    ) : (
                      <UserIcon className="w-5 h-5 text-white" />
                    )}
                  </div>
                  {!isSidebarCollapsed && (
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                          Citizen Hub
                        </span>
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#E8F5E9] dark:bg-emerald-950/80 text-[#138808] dark:text-[#A5D6A7] border border-[#C8E6C9] dark:border-emerald-800">
                          VERIFIED
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {user?.name || "Registered Resident"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Desktop Collapse Toggle Button */}
                <button
                  type="button"
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="hidden lg:flex p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                  {isSidebarCollapsed ? (
                    <PanelLeftOpen className="w-4 h-4 text-[#000080]" />
                  ) : (
                    <PanelLeftClose className="w-4 h-4 text-[#000080]" />
                  )}
                </button>
              </div>

              {/* Navigation Menu Links */}
              <nav className="space-y-1.5">
                
                {/* 1. Overview */}
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  title="Dashboard Overview"
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                    isSidebarCollapsed ? "justify-center" : "justify-between"
                  } ${
                    activeTab === "overview"
                      ? "bg-[#000080] text-white shadow-lg shadow-[#000080]/25 font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-[#E8EEF5]/70 dark:hover:bg-slate-800 hover:text-[#000080] dark:hover:text-blue-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <LayoutDashboard className={`w-4 h-4 shrink-0 ${activeTab === "overview" ? "text-white" : "text-[#000080] dark:text-[#93C5FD]"}`} />
                    {!isSidebarCollapsed && <span>Overview</span>}
                  </div>
                </button>

                {/* 2. Active Services & Submissions */}
                <button
                  type="button"
                  onClick={() => setActiveTab("applications")}
                  title="My Applications & Submissions"
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                    isSidebarCollapsed ? "justify-center" : "justify-between"
                  } ${
                    activeTab === "applications"
                      ? "bg-[#FF9933] text-white shadow-lg shadow-[#FF9933]/25 font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-[#FFF3E0]/70 dark:hover:bg-slate-800 hover:text-[#E65100] dark:hover:text-[#FFB74D]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileCheck className={`w-4 h-4 shrink-0 ${activeTab === "applications" ? "text-white" : "text-[#FF9933]"}`} />
                    {!isSidebarCollapsed && <span>My Services</span>}
                  </div>
                  {!isSidebarCollapsed && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        activeTab === "applications"
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {myApplications.length}
                    </span>
                  )}
                </button>

                {/* 3. Apply for Services */}
                <button
                  type="button"
                  onClick={() => setActiveTab("apply")}
                  title="Apply for MeeSeva & Online Services"
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                    isSidebarCollapsed ? "justify-center" : "justify-between"
                  } ${
                    activeTab === "apply"
                      ? "bg-gradient-to-r from-[#FF9933] to-[#E65100] text-white shadow-lg shadow-[#FF9933]/25 font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-[#FFF3E0]/70 dark:hover:bg-slate-800 hover:text-[#E65100] dark:hover:text-[#FFB74D]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Layers className={`w-4 h-4 shrink-0 ${activeTab === "apply" ? "text-white" : "text-[#138808]"}`} />
                    {!isSidebarCollapsed && <span>Apply Services</span>}
                  </div>
                  {!isSidebarCollapsed && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8F5E9] dark:bg-emerald-950/80 text-[#138808] dark:text-[#A5D6A7]">
                      {allServices.length}
                    </span>
                  )}
                </button>

                {/* 4. Document Vault */}
                <button
                  type="button"
                  onClick={() => setActiveTab("vault")}
                  title="Statutory Document Vault"
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                    isSidebarCollapsed ? "justify-center" : "justify-between"
                  } ${
                    activeTab === "vault"
                      ? "bg-[#138808] text-white shadow-lg shadow-[#138808]/25 font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-[#E8F5E9]/70 dark:hover:bg-slate-800 hover:text-[#138808] dark:hover:text-emerald-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FolderLock className={`w-4 h-4 shrink-0 ${activeTab === "vault" ? "text-white" : "text-[#138808]"}`} />
                    {!isSidebarCollapsed && <span>Document Vault</span>}
                  </div>
                  {!isSidebarCollapsed && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        activeTab === "vault"
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {vaultDocsList.length}
                    </span>
                  )}
                </button>

                {/* 5. Payment Receipts */}
                <button
                  type="button"
                  onClick={() => setActiveTab("payments")}
                  title="Fee Receipts & Payment Ledger"
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                    isSidebarCollapsed ? "justify-center" : "justify-between"
                  } ${
                    activeTab === "payments"
                      ? "bg-[#000080] text-white shadow-lg shadow-[#000080]/25 font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-[#E8EEF5]/70 dark:hover:bg-slate-800 hover:text-[#000080] dark:hover:text-blue-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Receipt className={`w-4 h-4 shrink-0 ${activeTab === "payments" ? "text-white" : "text-[#000080] dark:text-[#93C5FD]"}`} />
                    {!isSidebarCollapsed && <span>Fee Receipts</span>}
                  </div>
                  {!isSidebarCollapsed && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        activeTab === "payments"
                          ? "bg-white/20 text-white"
                          : "bg-[#E8EEF5] text-[#000080] dark:bg-blue-950/80 dark:text-blue-300"
                      }`}
                    >
                      ₹{totalSpent}
                    </span>
                  )}
                </button>

                {/* 6. Officer Messages */}
                <button
                  type="button"
                  onClick={() => setActiveTab("messages")}
                  title="Messages & Officer Inquiries"
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                    isSidebarCollapsed ? "justify-center" : "justify-between"
                  } ${
                    activeTab === "messages"
                      ? "bg-[#FF9933] text-white shadow-lg shadow-[#FF9933]/25 font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-[#FFF3E0]/70 dark:hover:bg-slate-800 hover:text-[#E65100] dark:hover:text-[#FFB74D]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className={`w-4 h-4 shrink-0 ${activeTab === "messages" ? "text-white" : "text-[#FF9933]"}`} />
                    {!isSidebarCollapsed && <span>Officer Chat</span>}
                  </div>
                  {!isSidebarCollapsed && myMessages.length > 0 && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        activeTab === "messages"
                          ? "bg-white/20 text-white"
                          : "bg-[#FFF3E0] text-[#E65100] dark:bg-amber-950/80 dark:text-amber-300"
                      }`}
                    >
                      {myMessages.length}
                    </span>
                  )}
                </button>

                {/* 7. Family Vault */}
                <button
                  type="button"
                  onClick={() => setActiveTab("family")}
                  title="Household Family Members"
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                    isSidebarCollapsed ? "justify-center" : "justify-between"
                  } ${
                    activeTab === "family"
                      ? "bg-gradient-to-r from-[#000080] to-blue-700 text-white shadow-lg shadow-blue-900/25 font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-[#E8EEF5]/70 dark:hover:bg-slate-800 hover:text-[#000080] dark:hover:text-blue-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Users className={`w-4 h-4 shrink-0 ${activeTab === "family" ? "text-white" : "text-[#000080] dark:text-[#93C5FD]"}`} />
                    {!isSidebarCollapsed && <span>Family Vault</span>}
                  </div>
                </button>

                {/* 8. Profile & Security */}
                <button
                  type="button"
                  onClick={() => setActiveTab("profile")}
                  title="Citizen Profile & Biometric Security"
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                    isSidebarCollapsed ? "justify-center" : "justify-between"
                  } ${
                    activeTab === "profile"
                      ? "bg-[#000080] text-white shadow-lg shadow-[#000080]/25 font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-[#E8EEF5]/70 dark:hover:bg-slate-800 hover:text-[#000080] dark:hover:text-blue-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <UserCheck className={`w-4 h-4 shrink-0 ${activeTab === "profile" ? "text-white" : "text-[#000080] dark:text-[#93C5FD]"}`} />
                    {!isSidebarCollapsed && <span>Profile & Bio</span>}
                  </div>
                </button>
              </nav>
            </div>

            {/* Bottom-Left: Citizen Profile Card & Direct Logout Button */}
            <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 space-y-2">
              <div
                className={`p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-2.5 ${
                  isSidebarCollapsed ? "justify-center" : "justify-between"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#000080] to-[#1E3A8A] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    {(user?.name || "C").slice(0, 1).toUpperCase()}
                  </div>
                  {!isSidebarCollapsed && (
                    <div className="truncate text-left">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {user?.name || "Citizen User"}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                        {user?.email}
                      </p>
                    </div>
                  )}
                </div>
                {!isSidebarCollapsed && (
                  <span className="w-2 h-2 rounded-full bg-[#138808] animate-pulse shrink-0" title="Active Citizen Session" />
                )}
              </div>

              {/* Prominent Sidebar Logout Button */}
              <button
                type="button"
                onClick={logout}
                title="Safely exit Citizen Session"
                className={`w-full flex items-center gap-3 p-2.5 rounded-2xl transition-all cursor-pointer bg-rose-50/80 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-bold ${
                  isSidebarCollapsed ? "justify-center" : "justify-between"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/25">
                    <LogOut className="w-4 h-4" />
                  </div>
                  {!isSidebarCollapsed && (
                    <div className="text-left truncate">
                      <p className="text-xs font-bold leading-tight truncate">Logout</p>
                      <p className="text-[10px] text-rose-500/80 leading-tight truncate">Exit Citizen Session</p>
                    </div>
                  )}
                </div>
                {!isSidebarCollapsed && (
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-rose-200/60 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300">
                    Exit
                  </span>
                )}
              </button>
            </div>

          </div>
        </aside>


        {/* =========================================================================
            MAIN CONSOLE CONTENT
            ========================================================================= */}
        <main className="flex-1 w-full min-w-0 space-y-6">
          
          {/* Top Bar / Header of Console (Matches Super Admin & Owner) */}
          <div className="p-5 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="p-1.5 rounded-xl bg-[#E8EEF5] dark:bg-blue-950/60 text-[#000080] dark:text-blue-300 border border-[#BBDEFB] dark:border-blue-900">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#000080] dark:text-white">
                  Citizen Services Dashboard
                </h1>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5E9] text-[#138808] dark:bg-emerald-950/60 dark:text-emerald-300 border border-[#C8E6C9] dark:border-emerald-800">
                  Official Digital Center
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Welcome, <strong>{user?.name || "Citizen"}</strong> • Track active MeeSeva applications, statutory documents & online works processing.
              </p>
            </div>

            {/* Quick Header Metric Pills & Header Logout Button */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <div className="px-3 py-1.5 rounded-2xl bg-[#E8EEF5] dark:bg-blue-950/40 border border-[#BBDEFB] dark:border-blue-800/40 text-[#000080] dark:text-blue-300 font-semibold flex items-center gap-1.5">
                <span>📑 Applied:</span>
                <span className="font-bold">{myApplications.length}</span>
              </div>
              <div className="px-3 py-1.5 rounded-2xl bg-[#FFF3E0] dark:bg-amber-950/40 border border-[#FFE082] dark:border-amber-800/40 text-[#E65100] dark:text-amber-300 font-semibold flex items-center gap-1.5">
                <span>⏳ Pipeline:</span>
                <span className="font-bold">{inProgressCount}</span>
              </div>
              <div className="px-3 py-1.5 rounded-2xl bg-[#E8F5E9] dark:bg-emerald-950/40 border border-[#C8E6C9] dark:border-emerald-800/40 text-[#138808] dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                <span>✅ Ready:</span>
                <span className="font-bold">{completedCount}</span>
              </div>
              <div className="px-3 py-1.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/40 text-indigo-700 dark:text-indigo-300 font-semibold flex items-center gap-1.5">
                <span>📁 Vault:</span>
                <span className="font-bold">{vaultDocsList.length}</span>
              </div>

              {/* Prominent Header Logout Button */}
              <button
                type="button"
                onClick={logout}
                className="px-4 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/80 border-2 border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md active:scale-95 cursor-pointer ml-auto md:ml-2"
                title="Safely log out of citizen portal"
              >
                <LogOut className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Alert Banner if Documents or Payment are Pending */}
          {actionRequiredCount > 0 && (
            <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500 via-[#FF9933] to-amber-600 text-white shadow-xl shadow-amber-500/20 flex flex-col md:flex-row md:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Action Required on {actionRequiredCount} Application(s)</h4>
                  <p className="text-xs text-amber-100">
                    The MeeSeva processing officer has requested additional documents or fee completion for immediate dispatch.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("action-required");
                  setActiveTab("applications");
                }}
                className="px-4 py-2 rounded-xl bg-white text-[#E65100] font-bold text-xs hover:bg-amber-50 transition-colors cursor-pointer self-start md:self-auto shrink-0 shadow-md"
              >
                Review Applications &rarr;
              </button>
            </div>
          )}


          {/* =========================================================================
              TAB 1: OVERVIEW DASHBOARD
              ========================================================================= */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              
              {/* 4 Metric KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                
                {/* 1. Total Applications */}
                <div className="p-4 sm:p-5 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Total Applied
                    </span>
                    <div className="w-9 h-9 rounded-2xl bg-[#E8EEF5] text-[#000080] dark:bg-blue-950/60 dark:text-blue-300 flex items-center justify-center shadow-xs">
                      <FileText className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                      {myApplications.length}
                    </span>
                    <span className="text-xs font-semibold text-[#000080] dark:text-blue-300">Services</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Across MeeSeva & Online</p>
                </div>

                {/* 2. In Progress Pipeline */}
                <div className="p-4 sm:p-5 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      In Processing
                    </span>
                    <div className="w-9 h-9 rounded-2xl bg-[#FFF3E0] text-[#E65100] dark:bg-amber-950/60 dark:text-amber-300 flex items-center justify-center shadow-xs">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-[#E65100] dark:text-amber-400">
                      {inProgressCount}
                    </span>
                    <span className="text-xs font-semibold text-amber-600">Active</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Kiosk verification stage</p>
                </div>

                {/* 3. Completed Certificates */}
                <div className="p-4 sm:p-5 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Ready / Issued
                    </span>
                    <div className="w-9 h-9 rounded-2xl bg-[#E8F5E9] text-[#138808] dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center justify-center shadow-xs">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-[#138808] dark:text-emerald-400">
                      {completedCount}
                    </span>
                    <span className="text-xs font-semibold text-emerald-600">Certificates</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Download ready anytime</p>
                </div>

                {/* 4. Total Fees Paid */}
                <div className="p-4 sm:p-5 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Total Fees Paid
                    </span>
                    <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 flex items-center justify-center shadow-xs">
                      <CreditCard className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                      ₹{totalSpent}
                    </span>
                    <span className="text-xs font-semibold text-indigo-600">Statutory</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Receipts verified online</p>
                </div>

              </div>

              {/* Active Pipeline Stepper Card (Most recent active submission) */}
              {latestActiveApp && (
                <div className="p-5 sm:p-6 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#FF9933]">
                          Live Application Status
                        </span>
                        <span className="font-mono text-xs font-extrabold text-slate-800 dark:text-slate-200">
                          {latestActiveApp.id}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-[#000080] dark:text-white mt-0.5">
                        {latestActiveApp.serviceName}
                      </h3>
                    </div>
                    <div>
                      {renderStatusBadge(latestActiveApp.status)}
                    </div>
                  </div>

                  {/* Progressive Stepper */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                    {/* Step 1: Submitted */}
                    <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50">
                      <div className="flex items-center gap-2 text-[#138808] dark:text-emerald-400 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>1. Submitted</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                        {latestActiveApp.createdAt}
                      </p>
                    </div>

                    {/* Step 2: Verification */}
                    <div className={`p-3 rounded-2xl border ${
                      latestActiveApp.status !== "Waiting for Owner" && latestActiveApp.status !== "Submitted"
                        ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50 text-[#138808]"
                        : "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50 text-amber-700"
                    }`}>
                      <div className="flex items-center gap-2 font-bold text-xs">
                        <Clock className="w-4 h-4" />
                        <span>2. Kiosk Review</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                        {latestActiveApp.assignedOwnerName || "Assigned Officer"}
                      </p>
                    </div>

                    {/* Step 3: Department Processing */}
                    <div className={`p-3 rounded-2xl border ${
                      latestActiveApp.status === "Processing" || latestActiveApp.status === "Completed"
                        ? "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/50 text-[#000080] dark:text-blue-300"
                        : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400"
                    }`}>
                      <div className="flex items-center gap-2 font-bold text-xs">
                        <Building2 className="w-4 h-4" />
                        <span>3. Govt Portal</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Official Server</p>
                    </div>

                    {/* Step 4: Ready */}
                    <div className={`p-3 rounded-2xl border ${
                      latestActiveApp.status === "Completed"
                        ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50 text-[#138808]"
                        : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400"
                    }`}>
                      <div className="flex items-center gap-2 font-bold text-xs">
                        <FileBadge2 className="w-4 h-4" />
                        <span>4. Certificate Ready</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                        {latestActiveApp.status === "Completed" ? "Downloadable" : "Pending"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-slate-500">
                      Category: <strong>{latestActiveApp.serviceCategory}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedAppForDetails(latestActiveApp)}
                      className="text-xs font-bold text-[#000080] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Full Breakdown</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Service Launcher Section */}
              <div className="p-5 sm:p-6 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Popular MeeSeva & Online Services
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Apply immediately with your pre-verified document vault
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("apply")}
                    className="text-xs font-bold text-[#FF9933] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All {allServices.length} Services</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {allServices.slice(0, 6).map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => openServiceForm(service, "customer-dashboard")}
                      className="p-3.5 rounded-2xl bg-slate-50 hover:bg-[#FFF3E0]/70 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 hover:border-[#FF9933]/60 dark:border-slate-700/80 text-left transition-all group cursor-pointer flex flex-col justify-between"
                    >
                      <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-700 shadow-xs flex items-center justify-center text-lg mb-2 group-hover:scale-110 transition-transform">
                        {service.icon || "📄"}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight">
                          {service.name}
                        </h4>
                        <span className="text-[11px] font-extrabold text-[#000080] dark:text-blue-300 mt-1 block">
                          ₹{service.price}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}


          {/* =========================================================================
              TAB 2: ACTIVE SERVICES & HISTORY (Interactive Data Table / Mobile Cards)
              ========================================================================= */}
          {activeTab === "applications" && (
            <div className="space-y-4">
              
              {/* Filter & Search Bar Header */}
              <div className="p-4 sm:p-5 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Status Filter Pills */}
                <div className="flex items-center gap-1.5 flex-wrap text-xs">
                  <button
                    type="button"
                    onClick={() => setStatusFilter("all")}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      statusFilter === "all"
                        ? "bg-[#000080] text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    All ({myApplications.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("in-progress")}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      statusFilter === "in-progress"
                        ? "bg-[#FF9933] text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    In Progress ({inProgressCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("action-required")}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      statusFilter === "action-required"
                        ? "bg-rose-500 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    Action Needed ({actionRequiredCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("completed")}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      statusFilter === "completed"
                        ? "bg-[#138808] text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    Completed ({completedCount})
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative min-w-[220px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by ID or service..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#000080]"
                  />
                </div>
              </div>

              {/* Applications Listing */}
              {filteredApplications.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">No applications match your filter</h4>
                  <p className="text-xs text-slate-500 mt-1">Try resetting the status filter or searching for a different keyword.</p>
                </div>
              ) : (
                <>
                  {/* Desktop Data Table */}
                  <div className="hidden md:block rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                          <th className="py-3.5 px-4">Application ID</th>
                          <th className="py-3.5 px-4">Service & Department</th>
                          <th className="py-3.5 px-4">Applied Date</th>
                          <th className="py-3.5 px-4">Fee Paid</th>
                          <th className="py-3.5 px-4 text-center">Status</th>
                          <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredApplications.map((app) => (
                          <tr key={app.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                            {/* App ID with copy */}
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                              <div className="flex items-center gap-1.5">
                                <span>{app.id}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(app.id, app.id)}
                                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 cursor-pointer"
                                  title="Copy Application ID"
                                >
                                  {copiedAppId === app.id ? (
                                    <Check className="w-3 h-3 text-[#138808]" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            </td>

                            {/* Service Name & Category */}
                            <td className="py-3.5 px-4">
                              <p className="font-bold text-slate-900 dark:text-white">{app.serviceName}</p>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                {app.serviceCategory} {app.subCategory ? `• ${app.subCategory}` : ""}
                              </span>
                            </td>

                            {/* Applied Date */}
                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                              {app.createdAt}
                            </td>

                            {/* Fee Paid */}
                            <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                              ₹{app.price}
                            </td>

                            {/* Status Badge */}
                            <td className="py-3.5 px-4 text-center">
                              {renderStatusBadge(app.status)}
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setSelectedAppForDetails(app)}
                                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                                >
                                  View
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSelectedAppForMsg(app)}
                                  className="px-2.5 py-1.5 rounded-xl bg-[#FFF3E0] hover:bg-[#FFE0B2] text-[#E65100] font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
                                  title="Chat with Kiosk Operator"
                                >
                                  <MessageSquare className="w-3 h-3" />
                                  <span>Message</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Responsive Cards */}
                  <div className="md:hidden space-y-3">
                    {filteredApplications.map((app) => (
                      <div
                        key={app.id}
                        className="p-4 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-mono text-xs font-bold text-[#000080] dark:text-blue-300">
                              {app.id}
                            </span>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                              {app.serviceName}
                            </h4>
                            <p className="text-[11px] text-slate-500">
                              {app.serviceCategory} • {app.createdAt}
                            </p>
                          </div>
                          <div>{renderStatusBadge(app.status)}</div>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                          <span className="font-bold text-slate-900 dark:text-white">Fee: ₹{app.price}</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedAppForDetails(app)}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                            >
                              Details
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedAppForMsg(app)}
                              className="px-3 py-1.5 rounded-xl bg-[#FFF3E0] text-[#E65100] font-bold text-xs"
                            >
                              Message
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

            </div>
          )}


          {/* =========================================================================
              TAB 3: APPLY FOR SERVICES (Full Catalog with instant launch)
              ========================================================================= */}
          {activeTab === "apply" && (
            <div className="space-y-4">
              {/* Category Filter Pills & Search */}
              <div className="p-4 sm:p-5 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setCatalogCategoryFilter("all")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      catalogCategoryFilter === "all"
                        ? "bg-[#000080] text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    All Services ({allServices.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCatalogCategoryFilter("meeseva")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      catalogCategoryFilter === "meeseva"
                        ? "bg-[#FF9933] text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    🏛️ MeeSeva Works ({meesevaServices.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCatalogCategoryFilter("online")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      catalogCategoryFilter === "online"
                        ? "bg-[#138808] text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    🌐 Online Utilities ({allServices.length - meesevaServices.length})
                  </button>
                </div>

                <div className="relative min-w-[220px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search any service..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#000080]"
                  />
                </div>
              </div>

              {/* Service Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCatalogServices.map((service) => (
                  <div
                    key={service.id}
                    className="p-5 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#E8EEF5] text-[#000080] dark:bg-blue-950/60 dark:text-blue-300 flex items-center justify-center text-xl shadow-xs group-hover:scale-105 transition-transform">
                          {service.icon || "📄"}
                        </div>
                        <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-[#E8F5E9] text-[#138808] dark:bg-emerald-950/80 dark:text-[#A5D6A7] border border-[#C8E6C9] dark:border-emerald-800">
                          ₹{service.price}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                        {service.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Category: {service.category}
                      </p>

                      {/* Required Docs Preview */}
                      {service.docs && service.docs.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                            Required Documents:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {service.docs.slice(0, 3).map((d, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300"
                              >
                                {d.label}
                              </span>
                            ))}
                            {service.docs.length > 3 && (
                              <span className="text-[10px] text-slate-400">
                                +{service.docs.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => openServiceForm(service, "customer-dashboard")}
                      className="w-full mt-4 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#000080] to-[#1E3A8A] hover:from-[#000066] hover:to-[#000080] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#000080]/20 transition-all cursor-pointer"
                    >
                      <span>Apply Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* =========================================================================
              TAB 4: DOCUMENT VAULT
              ========================================================================= */}
          {activeTab === "vault" && (
            <div className="space-y-5">
              {/* Vault Header Notice */}
              <div className="p-5 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-xl bg-[#E8F5E9] text-[#138808] border border-[#C8E6C9]">
                      <FolderLock className="w-4 h-4" />
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      Statutory Citizen Document Vault
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Your authenticated digital certificates & identity proofs are encrypted and auto-attached during applications.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E8F5E9] text-[#138808] border border-[#C8E6C9] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>UIDAI Verified</span>
                  </span>
                </div>
              </div>

              {/* Vault Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {vaultDocsList.map((doc, idx) => (
                  <div
                    key={doc.id || idx}
                    className="p-4 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {doc.type.includes("pdf") ? "PDF Document" : "Image Scan"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{doc.size}</span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {doc.docName || doc.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Uploaded: {doc.uploadedAt}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewDoc(doc)}
                        className="flex-1 py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Preview</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadDocument({ doc, customerName: user?.name || "Citizen" })}
                        className="p-2 rounded-xl bg-[#E8EEF5] hover:bg-[#BBDEFB] text-[#000080] font-bold text-xs cursor-pointer"
                        title="Download Document"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* =========================================================================
              TAB 5: PAYMENT RECEIPTS
              ========================================================================= */}
          {activeTab === "payments" && (
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Government Fee Payment Ledger
                  </h3>
                  <p className="text-xs text-slate-500">
                    Verified transactions processed through Cashfree & UPI PG with instant receipt generation.
                  </p>
                </div>
                <div className="px-3.5 py-1.5 rounded-2xl bg-[#E8F5E9] text-[#138808] border border-[#C8E6C9] font-bold text-sm">
                  Total Paid: ₹{totalSpent}
                </div>
              </div>

              {myPayments.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
                  <Receipt className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">No payment records found.</p>
                </div>
              ) : (
                <div className="rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-3.5 px-4">Receipt ID</th>
                        <th className="py-3.5 px-4">Application ID</th>
                        <th className="py-3.5 px-4">Service</th>
                        <th className="py-3.5 px-4">Amount</th>
                        <th className="py-3.5 px-4">Method</th>
                        <th className="py-3.5 px-4">Date & Time</th>
                        <th className="py-3.5 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {myPayments.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                            {p.id}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                            {p.applicationId}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                            {p.serviceName}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-[#000080] dark:text-blue-300">
                            {p.amount}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                            {p.method}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500">{p.timestamp}</td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5E9] text-[#138808] border border-[#C8E6C9]">
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}


          {/* =========================================================================
              TAB 6: OFFICER MESSAGES & NOTIFICATIONS
              ========================================================================= */}
          {activeTab === "messages" && (
            <div className="p-5 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Officer Correspondence & Updates
                </h3>
                <p className="text-xs text-slate-500">
                  Direct communication thread with MeeSeva processing officers handling your requests.
                </p>
              </div>

              {myMessages.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <MessageSquare className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">No officer messages yet. Messages from operators will appear here.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                  {myMessages.map((msg) => {
                    const isCitizen = msg.senderRole === "customer";
                    return (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-2xl text-xs space-y-1 ${
                          isCitizen
                            ? "bg-[#E8F5E9] dark:bg-emerald-950/40 border border-[#C8E6C9] dark:border-emerald-900 text-slate-900 dark:text-emerald-100 ml-4 sm:ml-8"
                            : "bg-[#E8EEF5] dark:bg-blue-950/40 border border-[#BBDEFB] dark:border-blue-900 text-slate-900 dark:text-blue-100 mr-4 sm:mr-8"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold">
                            {isCitizen ? "You (Citizen)" : `MeeSeva Officer: ${msg.senderName}`}
                          </span>
                          <span className="font-mono text-slate-400">{msg.timestamp}</span>
                        </div>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}


          {/* =========================================================================
              TAB 7: FAMILY VAULT
              ========================================================================= */}
          {activeTab === "family" && (
            <div className="p-5 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Household Family Members & Dependents
                  </h3>
                  <p className="text-xs text-slate-500">
                    Enrolled family schema used for ration cards, income certificates, and welfare applications.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFamilyModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#000080] hover:bg-[#000066] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  Edit Family Schema
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700">
                  <span className="text-slate-500">Marital Status:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {user?.familyDetails?.maritalStatus || "Single"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700">
                  <span className="text-slate-500">Father Name:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {user?.familyDetails?.fatherName || "Not Provided"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700">
                  <span className="text-slate-500">Mother Name:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {user?.familyDetails?.motherName || "Not Provided"}
                  </span>
                </div>
                {user?.familyDetails?.spouseName && (
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Spouse Name:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {user.familyDetails.spouseName}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}


          {/* =========================================================================
              TAB 8: CITIZEN PROFILE & BIOMETRICS
              ========================================================================= */}
          {activeTab === "profile" && (
            <div className="p-5 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Citizen Credentials & Biometric Identity
                </h3>
                <p className="text-xs text-slate-500">
                  Secure identity credentials verified via UIDAI Aadhaar and facial biometric recognition.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Personal Credentials Box */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2.5">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider text-[#000080] dark:text-blue-300">
                    Contact & Account Information
                  </h4>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Full Name:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{user?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Email Address:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{user?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phone Number:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{user?.phone || "8125898068"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Role:</span>
                    <span className="font-bold text-[#138808]">Registered Citizen</span>
                  </div>
                </div>

                {/* Biometrics Status Box */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2.5">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider text-[#138808]">
                    Facial Biometric Security
                  </h4>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-[#000080] via-[#FF9933] to-[#138808] flex items-center justify-center shrink-0">
                      {user?.avatar ? (
                        <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <Scan className="w-6 h-6 text-indigo-500" />
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {user?.avatar ? "✓ Biometric Enrolled" : "Not Enrolled"}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        256-bit AES Template Encryption
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-200/80 dark:border-slate-700">
                    Facial biometric snapshots allow seamless single-glance sign-in on mobile and tablet terminals.
                  </p>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* =========================================================================
          APPLICATION DETAILS MODAL
          ========================================================================= */}
      {selectedAppForDetails && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#000080] dark:text-blue-300">
                  {selectedAppForDetails.id}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedAppForDetails.serviceName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAppForDetails(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Current Status:</span>
                <div>{renderStatusBadge(selectedAppForDetails.status)}</div>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Category:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedAppForDetails.serviceCategory}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Applied Date:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{selectedAppForDetails.createdAt}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Statutory Fee:</span>
                <span className="font-bold text-[#000080] dark:text-blue-300">₹{selectedAppForDetails.price}</span>
              </div>
              {selectedAppForDetails.ownerNote && (
                <div className="p-3 rounded-2xl bg-[#FFF3E0] dark:bg-amber-950/40 border border-[#FFE082] dark:border-amber-900/50">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#E65100] block mb-1">
                    Kiosk Operator Instruction:
                  </span>
                  <p className="text-slate-800 dark:text-amber-200 text-xs">{selectedAppForDetails.ownerNote}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedAppForDetails(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MESSAGE OFFICER MODAL
          ========================================================================= */}
      {selectedAppForMsg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#FF9933]" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Message MeeSeva Officer
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAppForMsg(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Regarding Application <strong className="font-mono text-slate-800 dark:text-slate-200">{selectedAppForMsg.id}</strong> ({selectedAppForMsg.serviceName})
            </p>

            <form onSubmit={handleSendMessage} className="space-y-3">
              <textarea
                rows={3}
                required
                value={msgInput}
                onChange={(e) => setMsgInput(e.target.value)}
                placeholder="Type your message or inquiry for the kiosk operator..."
                className="w-full p-3 text-xs rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FF9933] resize-none"
              />

              {msgSuccess && (
                <p className="text-xs text-[#138808] font-bold">Message sent to processing officer!</p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAppForMsg(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF9933] to-[#FF6F00] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#FF9933]/25 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Extended Family Modal */}
      <ExtendedFamilyModal
        isOpen={isFamilyModalOpen}
        onClose={() => setIsFamilyModalOpen(false)}
      />

    </div>
  );
};
