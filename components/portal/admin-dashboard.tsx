"use client";

import React, { useState, useMemo, useEffect } from "react";
import { usePortal } from "@/lib/portal-store";
import { ServiceItem } from "@/types/portal";
import { sanitizePhoneNumber } from "@/lib/field-validation";
import {
  KeyRound,
  Layers,
  Users,
  CreditCard,
  Settings,
  Edit2,
  Check,
  X,
  ExternalLink,
  Plus,
  BellRing,
  TrendingUp,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Shield,
  Lock,
  Globe,
  Building2,
  Search,
  SlidersHorizontal,
  Save,
  RefreshCw,
  UserCheck,
  Server,
  Smartphone,
  Mail,
  PanelLeftClose,
  PanelLeftOpen,
  CheckCircle2,
  AlertTriangle,
  History,
  Download,
  Filter,
  Eye,
  Info,
  Trash2,
  Menu,
  UserPlus,
  Clock,
  Activity,
  EyeOff,
  Phone,
  Sparkles,
  Copy,
  Monitor,
  FileText,
  LogOut,
  Camera,
  Scan,
  ListPlus
} from "lucide-react";
import {
  ServiceDetails,
  ManageBasicDetailsModal,
  ManageDocsModal,
  ManageFieldsModal,
  DEFAULT_APPLICANT_FIELDS
} from "./service-details";
import { UserAccount } from "@/types/portal";

// User figure with gear badge icon matching the reference image exactly
export const UserGearIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Head / User silhouette */}
    <path d="M10 2.5a4.2 4.2 0 1 0 0 8.4 4.2 4.2 0 0 0 0-8.4z" />
    {/* Body / Torso silhouette cutout for the gear on bottom right */}
    <path d="M10 12.5c-4.2 0-7.8 2.2-8 5.6v1.2a.7.7 0 0 0 .7.7h9.4a6.45 6.45 0 0 1-.6-2.8 6.4 6.4 0 0 1 1.4-4.04c-.9-.42-1.89-.66-2.9-.66z" />
    {/* Gear Badge on the bottom-right corner */}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M17.5 12a1 1 0 0 0-.91.59l-.31.68-.74-.11a1 1 0 0 0-1.11.66l-.27.7-.72.22a1 1 0 0 0-.67 1.1l.12.74-.55.5a1 1 0 0 0 0 1.44l.55.5-.12.74a1 1 0 0 0 .67 1.1l.72.22.27.7a1 1 0 0 0 1.11.66l.74-.11.31.68a1 1 0 0 0 .91.59h.8a1 1 0 0 0 .91-.59l.31-.68.74.11a1 1 0 0 0 1.11-.66l.27-.7.72-.22a1 1 0 0 0 .67-1.1l-.12-.74.55-.5a1 1 0 0 0 0-1.44l-.55-.5.12-.74a1 1 0 0 0-.67-1.1l-.72-.22-.27-.7a1 1 0 0 0-1.11-.66l-.74.11-.31-.68a1 1 0 0 0-.91-.59h-.8zm.4 3a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4z"
    />
  </svg>
);

export const AdminDashboard: React.FC = () => {
  const {
    meesevaServices,
    onlineCategories,
    updateServicePrice,
    updateServiceUrl,
    toggleServiceActive,
    updateServiceDetails,
    applications,
    payments,
    feedbackList,
    notifications,
    user,
    accounts,
    addAccount,
    updateAccount,
    deleteAccount,
    generateResetOtp,
    activeSystemOtp,
    activeUsersCount,
    getUserDocCount,
    setPreviewDoc,
    passwordResetRequests,
    approvePasswordReset,
    rejectPasswordReset,
    passwordChangeAudits,
    logout
  } = usePortal();

  // Navigation tab state: includes standard tabs and the dedicated "user-settings" view
  const [activeTab, setActiveTab] = useState<
    "services" | "applications" | "revenue" | "feedback" | "audit" | "user-settings" | "accounts"
  >("services");

  // Sidebar collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Services catalog filtering & grouping state
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState<"all" | "meeseva" | "online">("all");
  const [serviceViewMode, setServiceViewMode] = useState<"tabs" | "sections">("tabs");
  const [serviceSearch, setServiceSearch] = useState("");

  // Service editing state
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState("");
  const [newUrl, setNewUrl] = useState("");

  // Service configuration editor state
  const [editorService, setEditorService] = useState<any | null>(null);
  const [editorFormData, setEditorFormData] = useState<Partial<ServiceItem> & { newDocLabel: string; newDocRequired: boolean }>({ newDocLabel: "", newDocRequired: true });

  // Service Row Action Menu (Pencil Icon) Popover state & dedicated modals
  const [activeMenuServiceId, setActiveMenuServiceId] = useState<string | null>(null);
  const [activeModalType, setActiveModalType] = useState<"basic" | "docs" | "fields" | null>(null);
  const [selectedServiceForModal, setSelectedServiceForModal] = useState<ServiceItem | null>(null);

  // User Settings state
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);
  const [adminName, setAdminName] = useState("Super Administrator");
  const [adminEmail, setAdminEmail] = useState("admin@msnportal.gov.in");
  const [adminPhone, setAdminPhone] = useState("+91 98480 22338");
  const [sessionTimeout, setSessionTimeout] = useState("60");
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [autoApproveVerified, setAutoApproveVerified] = useState(false);
  const [operatorCommission, setOperatorCommission] = useState("65");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [smsGatewayActive, setSmsGatewayActive] = useState(true);
  const [paymentGatewayActive, setPaymentGatewayActive] = useState(true);

  // Accounts Management state & modals
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newRoleForm, setNewRoleForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    role: "owner" as "owner" | "superadmin"
  });
  const [showPassword, setShowPassword] = useState(false);
  const [editingAccount, setEditingAccount] = useState<UserAccount | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    role: "owner" as "owner" | "superadmin",
    status: "active" as "active" | "suspended"
  });
  const [deletingAccount, setDeletingAccount] = useState<UserAccount | null>(null);
  const [accountToast, setAccountToast] = useState<string | null>(null);

  // OTP Generator state in Accounts Mgmt (1-minute auto-expiry)
  const [otpTargetId, setOtpTargetId] = useState<string>("customer-default");
  const [activeGeneratedOtp, setActiveGeneratedOtp] = useState<{
    code: string;
    expiresAt: number;
    targetName: string;
    phoneOrEmail: string;
    timestamp: string;
  } | null>(null);
  const [otpRemainingSeconds, setOtpRemainingSeconds] = useState<number>(0);

  // User-specific Activity & Session Analytics modal state
  const [selectedUserForAnalytics, setSelectedUserForAnalytics] = useState<UserAccount | null>(null);
  const [analyticsTab, setAnalyticsTab] = useState<"sessions" | "activity">("sessions");

  // Dedicated Customer Directory search & filter state
  const [customerFilterText, setCustomerFilterText] = useState("");

  // Super Admin split tabs: Side 1 (Customer Directory) vs Side 2 (Staff & Management)
  const [accountSubTab, setAccountSubTab] = useState<"customers" | "staff">("customers");
  const [showHistoryApprovals, setShowHistoryApprovals] = useState(false);

  const customerAccountsList = useMemo(() => {
    return accounts
      .filter((a) => a.role === "customer")
      .filter((a) => {
        if (!customerFilterText.trim()) return true;
        const q = customerFilterText.toLowerCase();
        return (
          a.name.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          (a.phone && a.phone.includes(q))
        );
      });
  }, [accounts, customerFilterText]);

  const staffAccountsList = useMemo(() => {
    return accounts.filter((a) => a.role === "superadmin" || a.role === "owner");
  }, [accounts]);

  // Sync activeGeneratedOtp with activeSystemOtp if already active
  useEffect(() => {
    if (activeSystemOtp && !activeGeneratedOtp) {
      const remaining = Math.max(0, Math.ceil((activeSystemOtp.expiresAt - Date.now()) / 1000));
      setActiveGeneratedOtp({
        code: activeSystemOtp.code,
        expiresAt: activeSystemOtp.expiresAt,
        targetName: activeSystemOtp.targetName || "Rohith Kumar (Customer)",
        phoneOrEmail: activeSystemOtp.targetIdentifier || "8125898068",
        timestamp: new Date(activeSystemOtp.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      });
      setOtpRemainingSeconds(remaining);
    }
  }, [activeSystemOtp]);

  // Real-time 1-minute countdown timer (Ticks every second, marks expired when reaches 0)
  useEffect(() => {
    if (!activeGeneratedOtp) return;

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((activeGeneratedOtp.expiresAt - Date.now()) / 1000));
      setOtpRemainingSeconds(remaining);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [activeGeneratedOtp]);

  const handleGenerateResetOtp = () => {
    let targetAcc = accounts.find((a) => a.id === otpTargetId);
    if (!targetAcc) {
      targetAcc = accounts.find((a) => a.role === "customer") || accounts[0];
    }
    const identifier = targetAcc ? targetAcc.email || targetAcc.phone : "8125898068";
    const res = generateResetOtp(identifier);
    const code = typeof res === "object" ? res.code : String(res);
    const expiresAt = typeof res === "object" && res.expiresAt ? res.expiresAt : Date.now() + 60 * 1000;

    setActiveGeneratedOtp({
      code,
      expiresAt,
      targetName: targetAcc ? targetAcc.name : "Rohith Kumar (Customer)",
      phoneOrEmail: targetAcc ? targetAcc.phone || targetAcc.email : "8125898068",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    });
    setOtpRemainingSeconds(60);
    showToastMsg(`6-Digit OTP (${code}) successfully activated (valid for exactly 60 seconds)`);
  };

  const pendingResetRequests = useMemo(() => {
    return passwordResetRequests.filter((r) => r.status === "pending");
  }, [passwordResetRequests]);

  const handleApproveResetRequest = (reqId: string) => {
    const target = passwordResetRequests.find((r) => r.id === reqId);
    const res = approvePasswordReset(reqId);
    if (res.success) {
      setActiveGeneratedOtp({
        code: res.code,
        expiresAt: res.expiresAt,
        targetName: target ? target.customerName : "Customer",
        phoneOrEmail: target ? target.customerPhone || target.customerEmail : "8125898068",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      });
      const remainingSecs = Math.max(0, Math.ceil((res.expiresAt - Date.now()) / 1000));
      setOtpRemainingSeconds(remainingSecs || 600);
      showToastMsg(`[ Approved ] 6-Digit OTP (${res.code}) issued for ${target?.customerName || "Customer"}! Customer routed to OTP verification page.`);
    }
  };

  const handleRejectResetRequest = (reqId: string) => {
    const target = passwordResetRequests.find((r) => r.id === reqId);
    rejectPasswordReset(reqId);
    showToastMsg(`[ No ] Request dismissed for ${target?.customerName || "Customer"}. Notification cleared and log entry recorded.`);
  };

  const showToastMsg = (msg: string) => {
    setAccountToast(msg);
    setTimeout(() => setAccountToast(null), 3500);
  };

  const handleOpenAddModal = () => {
    setNewRoleForm({
      name: "",
      phone: "",
      email: "",
      password: "",
      role: "owner"
    });
    setShowPassword(false);
    setShowAddUserModal(true);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleForm.name.trim() || !newRoleForm.email.trim() || !newRoleForm.phone.trim() || !newRoleForm.password.trim()) {
      return;
    }
    const created = addAccount({
      name: newRoleForm.name.trim(),
      email: newRoleForm.email.trim(),
      phone: newRoleForm.phone.trim(),
      password: newRoleForm.password,
      role: newRoleForm.role,
      status: "active",
      lastLogin: "Never logged in",
      dailyServiceCount: 0,
      monthlyServiceCount: 0
    });
    setShowAddUserModal(false);
    showToastMsg(`Account created for ${created.name} (${created.role === "owner" ? "Owner" : "Super Admin"}). Welcome notification with credentials dispatched.`);
  };

  const handleOpenEdit = (acc: UserAccount) => {
    setEditingAccount(acc);
    setEditForm({
      name: acc.name,
      phone: acc.phone,
      role: acc.role as "owner" | "superadmin",
      status: acc.status || "active"
    });
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;
    updateAccount(editingAccount.id, {
      name: editForm.name.trim(),
      phone: editForm.phone.trim(),
      role: editForm.role,
      status: editForm.status
    });
    showToastMsg(`Account details for ${editForm.name} updated successfully.`);
    setEditingAccount(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingAccount) return;
    deleteAccount(deletingAccount.id);
    showToastMsg(`Account for ${deletingAccount.name} removed successfully.`);
    setDeletingAccount(null);
  };

  // All combined flat services from catalog
  const allServices: ServiceItem[] = useMemo(() => [
    ...meesevaServices,
    ...onlineCategories.flatMap((c) => c.subServices)
  ], [meesevaServices, onlineCategories]);

  // Distinct groups: First 12 are "Meeseva Services", remaining are "Online Services"
  const meesevaServicesList = useMemo(() => allServices.slice(0, 12), [allServices]);
  const onlineServicesList = useMemo(() => allServices.slice(12), [allServices]);

  // Filtered services for the "tabs" view
  const filteredServices = useMemo(() => {
    let list: ServiceItem[] = [];
    if (serviceCategoryFilter === "all") {
      list = allServices;
    } else if (serviceCategoryFilter === "meeseva") {
      list = meesevaServicesList;
    } else if (serviceCategoryFilter === "online") {
      list = onlineServicesList;
    }

    if (!serviceSearch.trim()) return list;

    const q = serviceSearch.toLowerCase().trim();
    return list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        (s.officialUrl && s.officialUrl.toLowerCase().includes(q))
    );
  }, [allServices, meesevaServicesList, onlineServicesList, serviceCategoryFilter, serviceSearch]);

  const handleStartEdit = (service: ServiceItem) => {
    setEditorService(service);
    setEditorFormData({
      name: service.name,
      category: service.category,
      price: service.price,
      officialUrl: service.officialUrl || "",
      active: service.active,
      docs: [...(service.docs || [])],
      newDocLabel: "",
      newDocRequired: true
    });
  };

  const handleSaveInline = (serviceId: string) => {
    if (newPrice) updateServicePrice(serviceId, newPrice);
    if (newUrl) updateServiceUrl(serviceId, newUrl);
    setEditingServiceId(null);
    setNewPrice("");
    setNewUrl("");
  };

  const handleSaveEdit = () => {
    if (!editorService) return;
    
    // Save details via the store
    const updates: Partial<ServiceItem> = {
      name: editorFormData.name,
      category: editorFormData.category,
      price: editorFormData.price,
      officialUrl: editorFormData.officialUrl,
      active: editorFormData.active,
      docs: editorFormData.docs
    };
    updateServiceDetails(editorService.id, updates);
    
    // Toast
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 3000);
    
    setEditorService(null);
  };

  // Close row action menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".service-action-menu-container")) {
        setActiveMenuServiceId(null);
      }
    };
    window.addEventListener("mousedown", handleOutsideClick);
    return () => window.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSaveModalBasic = (details: { name: string; category: string; price: string; officialUrl?: string }) => {
    if (!selectedServiceForModal) return;
    updateServiceDetails(selectedServiceForModal.id, details);
    showToastMsg(`✓ Details & Official Dept Portal URL for "${details.name}" updated! Propagated instantly.`);
    setActiveModalType(null);
    setSelectedServiceForModal(null);
  };

  const handleSaveModalDocs = (docs: any[]) => {
    if (!selectedServiceForModal) return;
    updateServiceDetails(selectedServiceForModal.id, { docs });
    showToastMsg(`✓ Required documents updated for "${selectedServiceForModal.name}"!`);
    setActiveModalType(null);
    setSelectedServiceForModal(null);
  };

  const handleSaveModalFields = (fields: any[]) => {
    if (!selectedServiceForModal) return;
    updateServiceDetails(selectedServiceForModal.id, { fields });
    showToastMsg(`✓ Applicant fields updated for "${selectedServiceForModal.name}"!`);
    setActiveModalType(null);
    setSelectedServiceForModal(null);
  };

  // Reusable Service Edit Action Menu (Pencil Icon) popover renderer
  const renderServiceActionMenu = (service: ServiceItem, isNearBottom: boolean = false) => {
    const isOpen = activeMenuServiceId === service.id;
    return (
      <div className="relative inline-block text-left service-action-menu-container">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setActiveMenuServiceId(isOpen ? null : service.id);
          }}
          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
            isOpen
              ? "bg-[#FF9933] text-white shadow-md ring-2 ring-[#FF9933]/30"
              : "text-slate-400 hover:text-[#FF9933] hover:bg-[#FFF8E1] dark:hover:bg-amber-950/30"
          }`}
          title="Service Configuration Options"
        >
          <Edit2 className="w-4 h-4" />
        </button>

        {isOpen && (
          <div
            className={`absolute right-0 ${
              isNearBottom ? "bottom-full mb-2" : "top-full mt-2"
            } w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-left`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header info */}
            <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <span className="text-base">{service.icon || "📄"}</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {service.name}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 shrink-0">
                #{service.id}
              </span>
            </div>

            {/* Option 1: Edit Basic Details - Saffron Theme */}
            <button
              type="button"
              onClick={() => {
                setSelectedServiceForModal(service);
                setActiveModalType("basic");
                setActiveMenuServiceId(null);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-xs text-slate-700 dark:text-slate-200 hover:bg-[#FFF8E1]/70 dark:hover:bg-amber-950/30 border-b border-slate-100 dark:border-slate-800 transition-colors cursor-pointer text-left"
            >
              <span className="w-8 h-8 rounded-xl bg-[#FFF3E0] dark:bg-amber-950/60 border border-[#FFE082] dark:border-amber-800/40 flex items-center justify-center text-[#E65100] dark:text-amber-400 shrink-0">
                <Settings className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 dark:text-white">⚙ Edit Basic Details</p>
                <p className="text-[10px] text-slate-400 truncate">
                  Service Name, Fee, Official Dept Portal URL
                </p>
              </div>
            </button>

            {/* Option 2: Manage Required Documents - India Green Theme */}
            <button
              type="button"
              onClick={() => {
                setSelectedServiceForModal(service);
                setActiveModalType("docs");
                setActiveMenuServiceId(null);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-xs text-slate-700 dark:text-slate-200 hover:bg-[#E8F5E9]/70 dark:hover:bg-emerald-950/30 border-b border-slate-100 dark:border-slate-800 transition-colors cursor-pointer text-left"
            >
              <span className="w-8 h-8 rounded-xl bg-[#E8F5E9] dark:bg-emerald-950/60 border border-[#C8E6C9] dark:border-emerald-800/40 flex items-center justify-center text-[#138808] dark:text-emerald-400 shrink-0">
                <FileText className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 dark:text-white">📄 Manage Required Documents</p>
                <p className="text-[10px] text-slate-400 truncate">
                  {(service.docs || []).length} document(s) configured
                </p>
              </div>
            </button>

            {/* Option 3: Edit Applicant Information Fields - Ashoka Navy Theme */}
            <button
              type="button"
              onClick={() => {
                setSelectedServiceForModal(service);
                setActiveModalType("fields");
                setActiveMenuServiceId(null);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-xs text-slate-700 dark:text-slate-200 hover:bg-[#E8EEF5]/70 dark:hover:bg-blue-950/30 border-b border-slate-100 dark:border-slate-800 transition-colors cursor-pointer text-left"
            >
              <span className="w-8 h-8 rounded-xl bg-[#E8EEF5] dark:bg-blue-950/60 border border-[#BBDEFB] dark:border-blue-800/40 flex items-center justify-center text-[#000080] dark:text-blue-400 shrink-0">
                <ListPlus className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 dark:text-white">📝 Edit Applicant Information Fields</p>
                <p className="text-[10px] text-slate-400 truncate">
                  {(service.fields || DEFAULT_APPLICANT_FIELDS).length} field(s) configured
                </p>
              </div>
            </button>

            {/* Option 4: Full Service Page Configuration Suite */}
            <button
              type="button"
              onClick={() => {
                setEditorService(service);
                setActiveMenuServiceId(null);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-left"
            >
              <span className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 shrink-0">
                <ExternalLink className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <p className="font-bold text-slate-800 dark:text-slate-200">🔍 Full Configuration Suite</p>
                <p className="text-[10px] text-slate-400">Open complete detailed editor & preview</p>
              </div>
            </button>
          </div>
        )}
      </div>
    );
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 3000);
  };

  // Metrics
  const totalRevenue = payments.reduce((acc, p) => {
    const num = parseInt(p.amount.replace(/[^0-9]/g, ""), 10) || 0;
    return acc + num;
  }, 0);

  // Audit Logs mock data
  const auditLogs = [
    {
      id: "AUD-8091",
      action: "Price Updated",
      detail: "Police Verification fee updated to ₹180",
      admin: "Super Admin",
      timestamp: "12 mins ago",
      type: "update"
    },
    {
      id: "AUD-8090",
      action: "Portal URL Configured",
      detail: "Ration Card portal linked to epds.telangana.gov.in",
      admin: "Super Admin",
      timestamp: "45 mins ago",
      type: "config"
    },
    {
      id: "AUD-8089",
      action: "Session Verified",
      detail: "Hardware 2FA authentication verified for Root Console",
      admin: "Super Admin",
      timestamp: "1 hour ago",
      type: "security"
    },
    {
      id: "AUD-8088",
      action: "Service Status Toggle",
      detail: "Telangana Registration & Stamps marked Active",
      admin: "Super Admin",
      timestamp: "3 hours ago",
      type: "update"
    }
  ];

  // If a service details editor is active, render dedicated Service Details screen
  if (editorService) {
    return (
      <ServiceDetails
        service={editorService}
        onBack={() => setEditorService(null)}
        onSave={(updated) => {
          updateServiceDetails(updated.id, updated);
          setEditorService(updated);
        }}
      />
    );
  }

  // Super Admin Password Change Audit & Photo Comparison Display Component
  const renderPasswordChangeAuditSection = () => (
    <div
      id="super-admin-password-change-audits"
      className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-indigo-900/60 shadow-xl space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-[#000080] to-indigo-700 text-white shadow-md shadow-[#000080]/20 shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-extrabold text-[#000080] dark:text-white">
                Super Admin Password Change Audit & Photo Comparison
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                {passwordChangeAudits.length} Verified Log{passwordChangeAudits.length === 1 ? "" : "s"}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live biometric compliance log displaying side-by-side photo comparison of original sign-up photo vs recent reset verification snapshot.
            </p>
          </div>
        </div>
      </div>

      {passwordChangeAudits.length === 0 ? (
        <div className="py-8 px-4 rounded-2xl bg-slate-50/70 dark:bg-slate-950/40 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-1">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            No password change audit logs recorded yet.
          </p>
          <p className="text-[11px] text-slate-400">
            When a customer verifies their face and changes their password, an audit entry with side-by-side photos appears here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {passwordChangeAudits.map((audit) => (
            <div
              key={audit.id}
              className="p-5 rounded-2xl bg-gradient-to-r from-slate-50/90 via-white to-indigo-50/50 dark:from-slate-950/80 dark:via-slate-900/90 dark:to-indigo-950/20 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
            >
              {/* Top Row: Customer Identity and Status Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {audit.customerName}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    Audit ID: {audit.id}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {audit.matchConfidence}% Facial Similarity
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono self-start sm:self-auto flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {audit.timestamp}
                </span>
              </div>

              {/* Customer Details Display: Name, Email ID, Mobile Number */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">Customer Name</span>
                  <span className="font-bold text-slate-800 dark:text-white truncate block mt-0.5">
                    {audit.customerName}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">Email ID</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 truncate block mt-0.5">
                    {audit.customerEmail}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">Mobile Number</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white truncate block mt-0.5">
                    📞 {audit.customerPhone}
                  </span>
                </div>
              </div>

              {/* Visual Photo Comparison: Side-by-Side Image Containers */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Scan className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Visual Photo Comparison</span>
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Identity Verified for Security Compliance</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Container 1: Original Sign-Up Profile Photo */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border-2 border-indigo-200 dark:border-indigo-900/70 text-center space-y-2 relative overflow-hidden shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                        1. Sign-Up Profile Photo
                      </span>
                      <span className="text-[10px] text-slate-400">Database Record</span>
                    </div>

                    <div className="w-32 h-32 sm:w-36 sm:h-36 mx-auto rounded-2xl overflow-hidden border-2 border-indigo-500/40 shadow-md bg-slate-100 dark:bg-slate-900 flex items-center justify-center relative">
                      {audit.originalPhoto ? (
                        <img
                          src={audit.originalPhoto}
                          alt="Sign-Up Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-slate-400 text-xs font-bold flex flex-col items-center gap-1">
                          <Users className="w-6 h-6" />
                          <span>No Profile Photo</span>
                        </div>
                      )}
                      <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-md bg-black/70 text-white text-[9px] font-bold">
                        Sign-Up
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      Customer&apos;s baseline profile photo registered in the system database.
                    </p>
                  </div>

                  {/* Container 2: Password Change Verification Snapshot */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border-2 border-emerald-200 dark:border-emerald-900/70 text-center space-y-2 relative overflow-hidden shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        2. Password Change Verification Snapshot
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold">Recent Reset Attempt</span>
                    </div>

                    <div className="w-32 h-32 sm:w-36 sm:h-36 mx-auto rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-md bg-slate-100 dark:bg-slate-900 flex items-center justify-center relative">
                      {audit.verificationSnapshot ? (
                        <img
                          src={audit.verificationSnapshot}
                          alt="Verification Snapshot"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-slate-400 text-xs font-bold flex flex-col items-center gap-1">
                          <Camera className="w-6 h-6" />
                          <span>Live Snapshot</span>
                        </div>
                      )}
                      <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[9px] font-bold flex items-center gap-0.5">
                        ✓ Live Match
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      Snapshot captured in the circular frame camera with blink liveness check during reset.
                    </p>
                  </div>
                </div>
              </div>

              {/* Compliance Footer Note */}
              <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-1.5">
                <span>{audit.securityNote || "Facial Embedding Matched Live Camera Feed with Blink Liveness"}</span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  ✓ Super Admin Compliance Logged
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full max-w-[1400px] mx-auto px-2 sm:px-4 py-4 animate-in fade-in duration-300">
      {/* Settings Saved Notification Banner */}
      {settingsSavedToast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-600/30 animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <div>
            <p className="text-xs font-bold">Settings Saved Successfully</p>
            <p className="text-[11px] opacity-90">Super Admin configurations and security policies updated.</p>
          </div>
        </div>
      )}

      {/* Global Notification Toast for Service Configuration and Accounts */}
      {accountToast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-600/30 animate-in slide-in-from-top-4 duration-200 max-w-md">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <p className="text-xs font-bold leading-snug">{accountToast}</p>
        </div>
      )}

      {/* Main Dashboard Layout with Left Collapsible Sidebar */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* ==================== FIXED COLLAPSIBLE SIDEBAR ==================== */}
        <aside
          className={`shrink-0 transition-all duration-300 ease-in-out z-30 sticky top-20 ${
            isSidebarCollapsed ? "w-full lg:w-20" : "w-full lg:w-64"
          }`}
        >
          <div className="h-auto lg:h-[calc(100vh-6.5rem)] flex flex-col justify-between rounded-3xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/50 p-3.5 space-y-4">
            {/* Top: Sidebar Brand & Collapse Toggle */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
                <div className={`flex items-center gap-2.5 overflow-hidden ${isSidebarCollapsed ? "lg:justify-center w-full" : ""}`}>
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#FF9933] to-[#FF6F00] flex items-center justify-center text-white shadow-md shadow-[#FF9933]/30 shrink-0">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  {!isSidebarCollapsed && (
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                          Super Admin
                        </span>
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#FFF3E0] dark:bg-amber-950/80 text-[#E65100] dark:text-[#FFB74D] border border-[#FFE0B2] dark:border-amber-800">
                          ROOT
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Control Console v2.4</p>
                    </div>
                  )}
                </div>

                {/* Collapse Toggle Button (visible on desktop) */}
                <button
                  type="button"
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="hidden lg:flex p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-[#FFF3E0] dark:hover:bg-slate-800 transition-colors"
                  title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                  {isSidebarCollapsed ? (
                    <PanelLeftOpen className="w-4 h-4 text-[#FF9933]" />
                  ) : (
                    <PanelLeftClose className="w-4 h-4 text-[#000080]" />
                  )}
                </button>
              </div>

              {/* Navigation Menu */}
              <nav className="space-y-1.5">
                {/* Services Catalog Button */}
                <button
                  type="button"
                  onClick={() => setActiveTab("services")}
                  title="Services Catalog"
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                    isSidebarCollapsed ? "justify-center" : "justify-between"
                  } ${
                    activeTab === "services"
                      ? "bg-[#FF9933] text-white shadow-lg shadow-[#FF9933]/25 font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-[#FFF3E0]/70 dark:hover:bg-slate-800 hover:text-[#E65100] dark:hover:text-[#FFB74D]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Layers className={`w-4 h-4 shrink-0 ${activeTab === "services" ? "text-white" : "text-[#000080] dark:text-[#93C5FD]"}`} />
                    {!isSidebarCollapsed && <span>Services Catalog</span>}
                  </div>
                  {!isSidebarCollapsed && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        activeTab === "services"
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {allServices.length}
                    </span>
                  )}
                </button>

                {/* All Applications Button */}
                <button
                  type="button"
                  onClick={() => setActiveTab("applications")}
                  title="All Applications"
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                    isSidebarCollapsed ? "justify-center" : "justify-between"
                  } ${
                    activeTab === "applications"
                      ? "bg-[#FF9933] text-white shadow-lg shadow-[#FF9933]/25 font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-[#FFF3E0]/70 dark:hover:bg-slate-800 hover:text-[#E65100] dark:hover:text-[#FFB74D]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileCheck className={`w-4 h-4 shrink-0 ${activeTab === "applications" ? "text-white" : "text-[#000080] dark:text-[#93C5FD]"}`} />
                    {!isSidebarCollapsed && <span>Applications</span>}
                  </div>
                  {!isSidebarCollapsed && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        activeTab === "applications"
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {applications.length}
                    </span>
                  )}
                </button>

                {/* Revenue & Billing Button */}
                <button
                  type="button"
                  onClick={() => setActiveTab("revenue")}
                  title="Revenue & Ledger"
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                    isSidebarCollapsed ? "justify-center" : "justify-between"
                  } ${
                    activeTab === "revenue"
                      ? "bg-[#FF9933] text-white shadow-lg shadow-[#FF9933]/25 font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-[#FFF3E0]/70 dark:hover:bg-slate-800 hover:text-[#E65100] dark:hover:text-[#FFB74D]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <TrendingUp className={`w-4 h-4 shrink-0 ${activeTab === "revenue" ? "text-white" : "text-[#138808]"}`} />
                    {!isSidebarCollapsed && <span>Revenue & Ledger</span>}
                  </div>
                  {!isSidebarCollapsed && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        activeTab === "revenue"
                          ? "bg-white/20 text-white"
                          : "bg-[#E8F5E9] dark:bg-emerald-950/80 text-[#138808] dark:text-[#A5D6A7]"
                      }`}
                    >
                      ₹{totalRevenue}
                    </span>
                  )}
                </button>

                {/* Feedback & Grievances Button */}
                <button
                  type="button"
                  onClick={() => setActiveTab("feedback")}
                  title="Feedback & Grievances"
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                    isSidebarCollapsed ? "justify-center" : "justify-between"
                  } ${
                    activeTab === "feedback"
                      ? "bg-[#FF9933] text-white shadow-lg shadow-[#FF9933]/25 font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-[#FFF3E0]/70 dark:hover:bg-slate-800 hover:text-[#E65100] dark:hover:text-[#FFB74D]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <BellRing className={`w-4 h-4 shrink-0 ${activeTab === "feedback" ? "text-white" : "text-[#000080] dark:text-[#93C5FD]"}`} />
                    {!isSidebarCollapsed && <span>Grievances</span>}
                  </div>
                  {!isSidebarCollapsed && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        activeTab === "feedback"
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {feedbackList.length}
                    </span>
                  )}
                </button>

                {/* Audit Logs Button */}
                <button
                  type="button"
                  onClick={() => setActiveTab("audit")}
                  title="Security Audit Logs"
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                    isSidebarCollapsed ? "justify-center" : "justify-between"
                  } ${
                    activeTab === "audit"
                      ? "bg-[#FF9933] text-white shadow-lg shadow-[#FF9933]/25 font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-[#FFF3E0]/70 dark:hover:bg-slate-800 hover:text-[#E65100] dark:hover:text-[#FFB74D]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className={`w-4 h-4 shrink-0 ${activeTab === "audit" ? "text-white" : "text-[#138808]"}`} />
                    {!isSidebarCollapsed && <span>Audit Logs</span>}
                  </div>
                  {!isSidebarCollapsed && (
                    <span className="w-2 h-2 rounded-full bg-[#138808] animate-pulse" />
                  )}
                </button>

                {/* Accounts Button */}
                <button
                  type="button"
                  onClick={() => setActiveTab("accounts")}
                  title="Accounts Management"
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                    isSidebarCollapsed ? "justify-center" : "justify-between"
                  } ${
                    activeTab === "accounts"
                      ? "bg-[#FF9933] text-white shadow-lg shadow-[#FF9933]/25 font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-[#FFF3E0]/70 dark:hover:bg-slate-800 hover:text-[#E65100] dark:hover:text-[#FFB74D]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Users className={`w-4 h-4 shrink-0 ${activeTab === "accounts" ? "text-white" : "text-[#000080] dark:text-[#93C5FD]"}`} />
                    {!isSidebarCollapsed && <span>Accounts Mgmt</span>}
                  </div>
                </button>
              </nav>
            </div>

            {/* Bottom-Left: User-Settings Icon Button (User Figure with Gear Badge) */}
            <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800">
              <button
                type="button"
                id="btnSidebarUserSettings"
                onClick={() => setActiveTab("user-settings")}
                title="Super Admin User Settings"
                className={`group w-full flex items-center gap-3 p-2.5 rounded-2xl transition-all cursor-pointer ${
                  isSidebarCollapsed ? "justify-center" : "justify-between"
                } ${
                  activeTab === "user-settings"
                    ? "bg-gradient-to-r from-[#FF9933] to-[#FF6F00] text-white shadow-lg shadow-[#FF9933]/30 ring-2 ring-[#FF9933]/40"
                    : "bg-[#FFF8F0] dark:bg-slate-800 hover:bg-[#FFF0DC] dark:hover:bg-slate-700/80 border border-[#FFE0B2] dark:border-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* User figure with gear badge icon */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                      activeTab === "user-settings"
                        ? "bg-white/20 text-white"
                        : "bg-[#FF9933] text-white shadow-md shadow-[#FF9933]/25"
                    }`}
                  >
                    <UserGearIcon className="w-5 h-5" />
                  </div>

                  {!isSidebarCollapsed && (
                    <div className="text-left truncate">
                      <p
                        className={`text-xs font-bold leading-tight truncate ${
                          activeTab === "user-settings" ? "text-white" : "text-slate-900 dark:text-white"
                        }`}
                      >
                        User Settings
                      </p>
                      <p
                        className={`text-[10px] leading-tight truncate ${
                          activeTab === "user-settings" ? "text-amber-100" : "text-[#FF9933] dark:text-amber-400"
                        }`}
                      >
                        Root Preferences & Keys
                      </p>
                    </div>
                  )}
                </div>

                {!isSidebarCollapsed && (
                  <span
                    className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md ${
                      activeTab === "user-settings"
                        ? "bg-white/20 text-white"
                        : "bg-[#FFF3E0] dark:bg-amber-950/60 text-[#E65100] dark:text-amber-300"
                    }`}
                  >
                    Admin
                  </span>
                )}
              </button>

              {/* Prominent Sidebar Logout Button */}
              <button
                type="button"
                onClick={logout}
                title="Terminate Super Admin Session"
                className={`w-full mt-2 flex items-center gap-3 p-2.5 rounded-2xl transition-all cursor-pointer bg-rose-50/80 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-bold ${
                  isSidebarCollapsed ? "justify-center" : "justify-between"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/25">
                    <LogOut className="w-4 h-4" />
                  </div>
                  {!isSidebarCollapsed && (
                    <div className="text-left truncate">
                      <p className="text-xs font-bold leading-tight truncate">Logout</p>
                      <p className="text-[10px] text-rose-500/80 leading-tight truncate">Exit Super Admin</p>
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

        {/* ==================== MAIN CONTENT CONSOLE ==================== */}
        <main className="flex-1 w-full min-w-0 space-y-6">
          {/* Top Bar / Header of Console */}
          <div className="p-5 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-[#FFF3E0] text-[#E65100] border border-[#FFE082]">
                  <KeyRound className="w-5 h-5" />
                </span>
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#000080] dark:text-white">
                  Super Admin Control Console
                </h1>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5E9] text-[#138808] border border-[#C8E6C9]">
                  Live Production
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Global service catalog partitioning, statutory tariffs, official external URLs, and master user configuration
              </p>
            </div>

            {/* Quick Header Metric Pills & Header Logout Button */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <div className="px-3 py-1.5 rounded-2xl bg-[#FFF3E0] dark:bg-amber-950/40 border border-[#FFE082] dark:border-amber-800/40 text-[#E65100] dark:text-amber-300 font-semibold flex items-center gap-1.5">
                <span>🏛️ Meeseva:</span>
                <span className="font-bold">{meesevaServicesList.length}</span>
              </div>
              <div className="px-3 py-1.5 rounded-2xl bg-[#E8EEF5] dark:bg-blue-950/40 border border-[#BBDEFB] dark:border-blue-800/40 text-[#000080] dark:text-blue-300 font-semibold flex items-center gap-1.5">
                <span>🌐 Online:</span>
                <span className="font-bold">{onlineServicesList.length}</span>
              </div>
              <div className="px-3 py-1.5 rounded-2xl bg-[#E8F5E9] dark:bg-emerald-950/40 border border-[#C8E6C9] dark:border-emerald-800/40 text-[#138808] dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                <span>Revenue:</span>
                <span className="font-bold">₹{totalRevenue}</span>
              </div>

              {/* Prominent Super Admin Header Logout Button */}
              <button
                type="button"
                onClick={logout}
                className="px-4 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/80 border-2 border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md active:scale-95 cursor-pointer ml-auto md:ml-2"
                title="Safely log out and terminate Super Admin session"
              >
                <LogOut className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Top Banner Alert for Incoming Customer Password Reset Requests */}
          {pendingResetRequests.length > 0 && (
            <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500 via-[#FF9933] to-amber-600 text-white shadow-xl shadow-amber-500/25 flex flex-col md:flex-row md:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md shrink-0">
                  <KeyRound className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-white/25 px-2 py-0.5 rounded-full">
                      Action Required
                    </span>
                    <span className="text-xs font-bold">
                      {pendingResetRequests.length} Customer Password Reset Verification Request{pendingResetRequests.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-100 mt-0.5">
                    <strong>{pendingResetRequests[0].customerName}</strong> ({pendingResetRequests[0].customerPhone}) requested password reset. Authorize with [ Yes ] to issue 6-digit OTP, or decline with [ No ].
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button
                  type="button"
                  onClick={() => handleRejectResetRequest(pendingResetRequests[0].id)}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-black text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                  title="Reject request: do not generate OTP"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>[ No ]</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleApproveResetRequest(pendingResetRequests[0].id)}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1 shadow-md cursor-pointer transition-colors"
                  title="Authorize request: generate 6-digit OTP"
                >
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>[ Yes ]</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("accounts");
                    setAccountSubTab("customers");
                  }}
                  className="px-3 py-1.5 rounded-xl bg-black/20 hover:bg-black/30 text-white font-semibold text-xs cursor-pointer"
                >
                  View in Console ({pendingResetRequests.length})
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 1: SERVICES CATALOG WITH DISTINCT GROUPING & TABS     */}
          {/* ========================================================= */}
          {activeTab === "services" && (
            <div className="space-y-6">
              {/* Category Filter Tabs & Toolbar */}
              <div className="p-4 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Requirement 3: Filterable Tabs for Meeseva (first 12) & Online (remaining) */}
                  <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs overflow-x-auto">
                    <button
                      type="button"
                      onClick={() => setServiceCategoryFilter("all")}
                      className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                        serviceCategoryFilter === "all"
                          ? "bg-[#000080] text-white shadow-md shadow-[#000080]/25"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <span>All Services</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          serviceCategoryFilter === "all" ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-800"
                        }`}
                      >
                        {allServices.length}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setServiceCategoryFilter("meeseva")}
                      className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                        serviceCategoryFilter === "meeseva"
                          ? "bg-[#FF9933] text-white shadow-md shadow-[#FF9933]/25"
                          : "text-slate-600 dark:text-slate-400 hover:text-[#E65100]"
                      }`}
                    >
                      <span>🏛️ Meeseva Services</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                          serviceCategoryFilter === "meeseva"
                            ? "bg-white/20 text-white"
                            : "bg-[#FFF3E0] dark:bg-amber-950 text-[#E65100] dark:text-amber-300"
                        }`}
                      >
                        12
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setServiceCategoryFilter("online")}
                      className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                        serviceCategoryFilter === "online"
                          ? "bg-[#138808] text-white shadow-md shadow-[#138808]/25"
                          : "text-slate-600 dark:text-slate-400 hover:text-[#138808]"
                      }`}
                    >
                      <span>🌐 Online Services</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                          serviceCategoryFilter === "online"
                            ? "bg-white/20 text-white"
                            : "bg-[#E8F5E9] dark:bg-emerald-950 text-[#138808] dark:text-emerald-300"
                        }`}
                      >
                        {onlineServicesList.length}
                      </span>
                    </button>
                  </div>

                  {/* Search and Layout Mode Switcher */}
                  <div className="flex items-center gap-2.5">
                    {/* View mode toggle: Filter Tabs vs Stacked Sections */}
                    <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setServiceViewMode("tabs")}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                          serviceViewMode === "tabs"
                            ? "bg-white dark:bg-slate-800 text-[#000080] dark:text-blue-400 shadow-sm"
                            : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                        }`}
                      >
                        Tabbed
                      </button>
                      <button
                        type="button"
                        onClick={() => setServiceViewMode("sections")}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                          serviceViewMode === "sections"
                            ? "bg-white dark:bg-slate-800 text-[#000080] dark:text-blue-400 shadow-sm"
                            : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                        }`}
                      >
                        Dual Sections
                      </button>
                    </div>

                    {/* Search Input */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search services or URLs..."
                        value={serviceSearch}
                        onChange={(e) => setServiceSearch(e.target.value)}
                        className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#FF9933] transition-colors w-48 sm:w-60"
                      />
                    </div>
                  </div>
                </div>

                {/* Banner explanation of automatic assignment */}
                <div className="p-3.5 rounded-2xl bg-[#FFF8E1]/80 dark:bg-amber-950/20 border border-[#FFE082]/80 dark:border-amber-900/30 text-xs text-[#B78103] dark:text-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 shrink-0 text-[#FF9933]" />
                    <span>
                      <strong>Catalog Partitioning:</strong> First 12 services automatically routed to{" "}
                      <strong>Meeseva Services</strong> (statutory verification, certificates & cards); remaining{" "}
                      <strong>{onlineServicesList.length} services</strong> routed to{" "}
                      <strong>Online Services</strong> (digital portals & utilities).
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-[#E65100] whitespace-nowrap">
                    Instant Real-time Sync
                  </span>
                </div>
              </div>

              {/* View 1: Tabbed / Filtered Table */}
              {serviceViewMode === "tabs" ? (
                <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/80 backdrop-blur-md shadow-sm">
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                        {serviceCategoryFilter === "all" && `All Catalog Services (${filteredServices.length})`}
                        {serviceCategoryFilter === "meeseva" && `Meeseva Services (First 12 Services)`}
                        {serviceCategoryFilter === "online" && `Online Services (Digital & Utility Apps)`}
                      </h2>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Edit statutory pricing and official website links below. Changes propagate instantly to citizen and owner views.
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                      <thead className="bg-slate-50 dark:bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="py-3 px-4 font-semibold w-12">#</th>
                          <th className="py-3 px-4 font-semibold">Service Name</th>
                          <th className="py-3 px-4 font-semibold">Details</th>
                          <th className="py-3 px-4 font-semibold">Catalog Group</th>
                          <th className="py-3 px-4 font-semibold">Statutory Fee</th>
                          <th className="py-3 px-4 font-semibold">Official Dept Portal</th>
                          <th className="py-3 px-4 font-semibold">Status</th>
                          <th className="py-3 px-4 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {filteredServices.map((service, idx) => {
                          const serviceIndex = allServices.findIndex((s) => s.id === service.id);
                          const isMeesevaGroup = serviceIndex < 12;

                          return (
                            <tr
                              key={service.id}
                              className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                            >
                              <td className="py-3.5 px-4 text-sm font-bold text-slate-400">
                                {idx + 1}
                              </td>
                              <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white flex items-center gap-2.5">
                                <span className="text-lg p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                                  {service.icon || "📄"}
                                </span>
                                <div>
                                  <span className="font-semibold text-slate-900 dark:text-white block">
                                    {service.name}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono">#{service.id}</span>
                                </div>
                              </td>
                              <td className="py-3.5 px-4">
                                <button
                                  type="button"
                                  onClick={() => setEditorService(service)}
                                  className="group flex flex-col items-start gap-1 text-left cursor-pointer p-1.5 -m-1.5 rounded-xl hover:bg-[#FFF8E1]/50 dark:hover:bg-amber-950/20 transition-colors"
                                >
                                  <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full group-hover:bg-[#FFF3E0] group-hover:text-[#E65100]">
                                    [{(service.docs || []).length} Docs Required • Basic Info]
                                  </span>
                                  <span className="text-xs text-[#000080] dark:text-blue-400 font-bold group-hover:underline">
                                    View / Configure Details
                                  </span>
                                </button>
                              </td>
                              <td className="py-3.5 px-4">
                                {isMeesevaGroup ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FFF3E0] dark:bg-amber-950/40 text-[#E65100] dark:text-amber-300 border border-[#FFE082] dark:border-amber-800/40">
                                    <span>🏛️</span>
                                    <span>Meeseva</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E8EEF5] dark:bg-blue-950/40 text-[#000080] dark:text-blue-300 border border-[#BBDEFB] dark:border-blue-800/40">
                                    <span>🌐</span>
                                    <span>Online</span>
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="font-bold text-slate-900 dark:text-white px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
                                  {service.price === "Free" ? "Free" : `₹${service.price}`}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 max-w-xs">
                                {service.officialUrl ? (
                                  <a
                                    href={service.officialUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#000080] dark:text-blue-400 hover:text-[#0A1931] hover:underline flex items-center gap-1 truncate max-w-[200px]"
                                  >
                                    <span className="truncate">{service.officialUrl}</span>
                                    <ExternalLink className="w-3 h-3 shrink-0" />
                                  </a>
                                ) : (
                                  <span className="text-slate-400 dark:text-slate-500 italic text-[11px]">
                                    Direct Form Mode
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5 px-4">
                                <button
                                  type="button"
                                  onClick={() => toggleServiceActive(service.id)}
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                                    service.active !== false
                                      ? "bg-[#E8F5E9] dark:bg-emerald-950/40 text-[#138808] dark:text-emerald-400 border border-[#C8E6C9] dark:border-emerald-800/40"
                                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700"
                                  }`}
                                >
                                  {service.active !== false ? "Active" : "Inactive"}
                                </button>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                {renderServiceActionMenu(service, idx >= filteredServices.length - 3)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* View 2: Separate Distinct Sections for "Meeseva Services" & "Online Services" */
                <div className="space-y-8">
                  {/* Section A: Meeseva Services (First 12) - Saffron Theme */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="p-2 rounded-xl bg-[#FFF3E0] text-[#E65100] border border-[#FFE082]">
                          <Building2 className="w-5 h-5" />
                        </span>
                        <div>
                          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>Meeseva Services</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FF9933] text-white">
                              12 Services
                            </span>
                          </h2>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Statutory governmental certificates, Police Verification, Ration cards, and Revenue documents.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/80 backdrop-blur-md shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                          <thead className="bg-[#FFF8E1]/60 dark:bg-amber-950/30 text-[11px] uppercase tracking-wider text-[#B78103] dark:text-amber-300 border-b border-[#FFE082] dark:border-amber-900/30">
                            <tr>
                              <th className="py-3 px-4 font-semibold">Service (#1 to #12)</th>
                              <th className="py-3 px-4 font-semibold">Details</th>
                              <th className="py-3 px-4 font-semibold">Statutory Tariff</th>
                              <th className="py-3 px-4 font-semibold">Official Dept Portal</th>
                              <th className="py-3 px-4 font-semibold">Status</th>
                              <th className="py-3 px-4 font-semibold text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {meesevaServicesList.map((service, idx) => {
                              const isEditing = editingServiceId === service.id;
                              return (
                                <tr
                                  key={service.id}
                                  className="hover:bg-[#FFF8E1]/30 dark:hover:bg-amber-950/20 transition-colors"
                                >
                                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-white flex items-center gap-2.5">
                                    <span className="text-sm font-bold text-[#E65100] dark:text-amber-400 w-5">
                                      #{idx + 1}
                                    </span>
                                    <span className="text-base p-1.5 rounded-xl bg-[#FFF3E0] dark:bg-amber-950/60 shrink-0">
                                      {service.icon}
                                    </span>
                                    <div>
                                      <span className="font-semibold block">{service.name}</span>
                                      <span className="text-[10px] text-slate-400">{service.note || "Visit Office"}</span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <button
                                      type="button"
                                      onClick={() => setEditorService(service)}
                                      className="text-left cursor-pointer group flex flex-col items-start gap-1"
                                    >
                                      <span className="text-[10px] text-[#E65100] dark:text-amber-300 font-bold bg-[#FFF3E0] dark:bg-amber-950/50 px-2 py-0.5 rounded-full">
                                        [{(service.docs || []).length} Docs Required • Basic Info]
                                      </span>
                                      <span className="text-xs text-[#000080] dark:text-blue-400 font-bold group-hover:underline">
                                        View / Configure Details
                                      </span>
                                    </button>
                                  </td>
                                  <td className="py-3 px-4">
                                    {isEditing ? (
                                      <input
                                        type="text"
                                        value={newPrice}
                                        onChange={(e) => setNewPrice(e.target.value)}
                                        className="w-16 px-2 py-1 rounded bg-slate-50 dark:bg-slate-950 border border-[#FF9933] text-xs font-bold"
                                      />
                                    ) : (
                                      <span className="font-bold text-[#138808] dark:text-emerald-300 px-2 py-0.5 rounded bg-[#E8F5E9] dark:bg-emerald-950/50">
                                        ₹{service.price}
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3 px-4">
                                    {isEditing ? (
                                      <input
                                        type="text"
                                        value={newUrl}
                                        onChange={(e) => setNewUrl(e.target.value)}
                                        className="w-full px-2 py-1 rounded bg-slate-50 dark:bg-slate-950 border border-[#FF9933] text-xs"
                                      />
                                    ) : service.officialUrl ? (
                                      <a
                                        href={service.officialUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#000080] dark:text-blue-400 hover:text-[#0A1931] hover:underline flex items-center gap-1 truncate max-w-[200px]"
                                      >
                                        <span className="truncate">{service.officialUrl}</span>
                                        <ExternalLink className="w-3 h-3 shrink-0" />
                                      </a>
                                    ) : (
                                      <span className="text-slate-400 italic">Default</span>
                                    )}
                                  </td>
                                  <td className="py-3 px-4">
                                    <button
                                      type="button"
                                      onClick={() => toggleServiceActive(service.id)}
                                      className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5E9] dark:bg-emerald-500/15 text-[#138808] dark:text-emerald-400"
                                    >
                                      {service.active !== false ? "Active" : "Inactive"}
                                    </button>
                                  </td>
                                  <td className="py-3 px-4 text-right">
                                    {isEditing ? (
                                      <div className="flex items-center justify-end gap-1">
                                        <button
                                          type="button"
                                          onClick={() => handleSaveInline(service.id)}
                                          className="p-1 rounded bg-[#138808] text-white"
                                        >
                                          <Check className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setEditingServiceId(null)}
                                          className="p-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-400"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    ) : (
                                      renderServiceActionMenu(service, idx >= meesevaServicesList.length - 3)
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Section B: Online Services (Remaining services after first 12) - Ashoka Navy Theme */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="p-2 rounded-xl bg-[#E8EEF5] text-[#000080] border border-[#BBDEFB]">
                          <Globe className="w-5 h-5" />
                        </span>
                        <div>
                          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>Online Services</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#000080] text-white">
                              {onlineServicesList.length} Services
                            </span>
                          </h2>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Digital portals, Pan Card, Passport Seva, EPF/UAN utilities, and web applications.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/80 backdrop-blur-md shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                          <thead className="bg-[#E8EEF5]/60 dark:bg-blue-950/30 text-[11px] uppercase tracking-wider text-[#000080] dark:text-blue-300 border-b border-[#BBDEFB] dark:border-blue-900/30">
                            <tr>
                              <th className="py-3 px-4 font-semibold">Service Name</th>
                              <th className="py-3 px-4 font-semibold">Details</th>
                              <th className="py-3 px-4 font-semibold">Tariff</th>
                              <th className="py-3 px-4 font-semibold">Official Dept Portal</th>
                              <th className="py-3 px-4 font-semibold">Status</th>
                              <th className="py-3 px-4 font-semibold text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {onlineServicesList.map((service, idx) => {
                              const isEditing = editingServiceId === service.id;
                              return (
                                <tr
                                  key={service.id}
                                  className="hover:bg-[#E8EEF5]/30 dark:hover:bg-blue-950/20 transition-colors"
                                >
                                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-white flex items-center gap-2.5">
                                    <span className="text-base p-1.5 rounded-xl bg-[#E8EEF5] dark:bg-blue-950/60 shrink-0">
                                      {service.icon}
                                    </span>
                                    <div>
                                      <span className="font-semibold block">{service.name}</span>
                                      <span className="text-[10px] text-slate-400">{service.category}</span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <button
                                      type="button"
                                      onClick={() => setEditorService(service)}
                                      className="text-left cursor-pointer group flex flex-col items-start gap-1"
                                    >
                                      <span className="text-[10px] text-[#000080] dark:text-blue-300 font-bold bg-[#E8EEF5] dark:bg-blue-950/50 px-2 py-0.5 rounded-full">
                                        [{(service.docs || []).length} Docs Required • Basic Info]
                                      </span>
                                      <span className="text-xs text-[#000080] dark:text-blue-400 font-bold group-hover:underline">
                                        View / Configure Details
                                      </span>
                                    </button>
                                  </td>
                                  <td className="py-3 px-4">
                                    {isEditing ? (
                                      <input
                                        type="text"
                                        value={newPrice}
                                        onChange={(e) => setNewPrice(e.target.value)}
                                        className="w-16 px-2 py-1 rounded bg-slate-50 dark:bg-slate-950 border border-[#000080] text-xs font-bold"
                                      />
                                    ) : (
                                      <span className="font-bold text-[#138808] dark:text-emerald-300 px-2 py-0.5 rounded bg-[#E8F5E9] dark:bg-emerald-950/50">
                                        {service.price === "Free" ? "Free" : `₹${service.price}`}
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3 px-4">
                                    {isEditing ? (
                                      <input
                                        type="text"
                                        value={newUrl}
                                        onChange={(e) => setNewUrl(e.target.value)}
                                        className="w-full px-2 py-1 rounded bg-slate-50 dark:bg-slate-950 border border-[#000080] text-xs"
                                      />
                                    ) : service.officialUrl ? (
                                      <a
                                        href={service.officialUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#000080] dark:text-blue-400 hover:text-[#0A1931] hover:underline flex items-center gap-1 truncate max-w-[200px]"
                                      >
                                        <span className="truncate">{service.officialUrl}</span>
                                        <ExternalLink className="w-3 h-3 shrink-0" />
                                      </a>
                                    ) : (
                                      <span className="text-slate-400 italic">Default</span>
                                    )}
                                  </td>
                                  <td className="py-3 px-4">
                                    <button
                                      type="button"
                                      onClick={() => toggleServiceActive(service.id)}
                                      className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5E9] dark:bg-emerald-500/15 text-[#138808] dark:text-emerald-400"
                                    >
                                      {service.active !== false ? "Active" : "Inactive"}
                                    </button>
                                  </td>
                                  <td className="py-3 px-4 text-right">
                                    {isEditing ? (
                                      <div className="flex items-center justify-end gap-1">
                                        <button
                                          type="button"
                                          onClick={() => handleSaveInline(service.id)}
                                          className="p-1 rounded bg-[#138808] text-white"
                                        >
                                          <Check className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setEditingServiceId(null)}
                                          className="p-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-400"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    ) : (
                                      renderServiceActionMenu(service, idx >= onlineServicesList.length - 3)
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: ALL APPLICATIONS                                   */}
          {/* ========================================================= */}
          {activeTab === "applications" && (
            <div className="space-y-4">
              <div className="p-4 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Master Applications Registry ({applications.length})
                  </h2>
                  <p className="text-xs text-slate-500">Live citizen submissions across all MeeSeva and Online services</p>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-4 divide-y divide-slate-100 dark:divide-slate-800 shadow-sm">
                {applications.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No active applications currently submitted.</p>
                ) : (
                  applications.map((app) => (
                    <div key={app.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#000080] dark:text-blue-400">{app.id}</span>
                          <span className="text-slate-500">• {app.createdAt}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {app.serviceCategory}
                          </span>
                        </div>
                        <p className="font-semibold text-slate-900 dark:text-white mt-1">{app.serviceName}</p>
                        <p className="text-slate-500 dark:text-slate-400">
                          Applicant: {app.customerName} ({app.customerPhone}) • {app.customerEmail}
                        </p>
                        {Object.keys(app.uploadedDocs || {}).length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            <span className="text-[10px] text-slate-400 font-medium">Vault Docs:</span>
                            {Object.entries(app.uploadedDocs).map(([label, doc]) => (
                              <button
                                key={label}
                                type="button"
                                onClick={() => setPreviewDoc(doc)}
                                className="px-2 py-0.5 rounded-md bg-[#E8EEF5] hover:bg-[#D0E2FF] dark:bg-blue-950/40 text-[#000080] dark:text-blue-300 border border-[#BBDEFB] text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                title="Open in Document Viewer (Download, Print, Share enabled)"
                              >
                                <FileText className="w-2.5 h-2.5" />
                                <span>{label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#E8F5E9] dark:bg-emerald-950/40 text-[#138808] dark:text-emerald-400 border border-[#C8E6C9] dark:border-emerald-800/40">
                          {app.status}
                        </span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">₹{app.price}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: REVENUE & PAYMENTS                                 */}
          {/* ========================================================= */}
          {activeTab === "revenue" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                    Total Statutory Collections
                  </span>
                  <p className="text-3xl font-black text-[#138808] dark:text-emerald-400 mt-2">₹{totalRevenue}</p>
                  <p className="text-[11px] text-slate-400 mt-1">Direct government treasury & service fees</p>
                </div>
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                    Settled Transactions
                  </span>
                  <p className="text-3xl font-black text-[#000080] dark:text-blue-400 mt-2">{payments.length}</p>
                  <p className="text-[11px] text-slate-400 mt-1">UPI, QR Code, and Gateway settlements</p>
                </div>
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                    Catalog Active Services
                  </span>
                  <p className="text-3xl font-black text-[#FF9933] dark:text-amber-400 mt-2">{allServices.length}</p>
                  <p className="text-[11px] text-slate-400 mt-1">12 Meeseva + {onlineServicesList.length} Online utilities</p>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-4 divide-y divide-slate-100 dark:divide-slate-800 text-xs shadow-sm">
                <h3 className="font-bold text-slate-900 dark:text-white pb-3">Real-time Payment Ledger</h3>
                {payments.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No payment transactions recorded yet.</p>
                ) : (
                  payments.map((p) => (
                    <div key={p.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{p.serviceName}</p>
                        <p className="text-slate-500">
                          {p.customerName} • {p.method} • Ref: <span className="font-mono">{p.transactionRef}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{p.amount}</span>
                        <span className="text-[10px] text-slate-500 block">{p.timestamp}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: GRIEVANCES & FEEDBACK                              */}
          {/* ========================================================= */}
          {activeTab === "feedback" && (
            <div className="space-y-4">
              <div className="p-4 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-[#000080]/20 shadow-sm flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-[#000080] dark:text-blue-300">
                    Citizen Grievances & Escalations ({feedbackList.length})
                  </h2>
                  <p className="text-xs text-slate-500">Super Admin monitoring of unresolved feedback and complaints</p>
                </div>
              </div>

              {feedbackList.length === 0 ? (
                <div className="p-8 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <p className="text-xs text-slate-400">No unresolved grievances or complaints registered.</p>
                </div>
              ) : (
                feedbackList.map((fb) => (
                  <div
                    key={fb.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-900 dark:text-white">{fb.customerName}</span>
                      <span className="text-slate-500">{fb.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 italic">{fb.message}</p>
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                      {fb.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: AUDIT LOGS                                         */}
          {/* ========================================================= */}
          {activeTab === "audit" && (
            <div className="space-y-4">
              <div className="p-4 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Security Audit & Administrative Operations Log
                  </h2>
                  <p className="text-xs text-slate-500">Immutable audit trail of root credential operations and catalog modifications</p>
                </div>
                <button
                  type="button"
                  onClick={() => alert("Audit log export started. Generating signed CSV...")}
                  className="px-3 py-1.5 rounded-xl bg-[#000080] hover:bg-[#0A1931] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>

              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-4 divide-y divide-slate-100 dark:divide-slate-800 text-xs shadow-sm">
                {auditLogs.map((log) => (
                  <div key={log.id} className="py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="p-2 rounded-xl bg-[#E8EEF5] dark:bg-blue-950/50 text-[#000080] dark:text-blue-400">
                        <History className="w-4 h-4" />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">{log.action}</span>
                          <span className="font-mono text-[10px] text-[#000080] dark:text-blue-400 bg-[#E8EEF5] dark:bg-blue-950/60 px-1.5 py-0.5 rounded">
                            {log.id}
                          </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 mt-0.5">{log.detail}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-700 dark:text-slate-300 font-medium block">{log.admin}</span>
                      <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Password Change Biometric Audits & Visual Photo Comparison */}
              {renderPasswordChangeAuditSection()}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: ACCOUNTS MANAGEMENT                                   */}
          {/* ========================================================= */}
          {activeTab === "accounts" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Header Banner */}
              <div className="p-5 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="text-base font-extrabold text-[#000080] dark:text-white">
                      Accounts Management & Multi-Tenant Analytics
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#FFF3E0] dark:bg-amber-950/80 text-[#E65100] dark:text-amber-300 border border-[#FFE082] dark:border-amber-800">
                      {accounts.length} Accounts
                    </span>
                    {/* Live Logged-In Users Count */}
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5E9] dark:bg-emerald-950/80 text-[#138808] dark:text-emerald-400 border border-[#C8E6C9] dark:border-emerald-800 flex items-center gap-1.5 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#138808]" />
                      {activeUsersCount} Active / Logged In Now
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Isolated multi-tenant accounts, real-time session duration tracking, audit trails, and OTP verification.
                  </p>
                </div>

                {/* Permissions: Render + Add New Role strictly if active session user has Super Admin role */}
                {user?.role === "superadmin" && (
                  <button
                    type="button"
                    onClick={handleOpenAddModal}
                    className="px-4 py-2 rounded-xl bg-[#FF9933] hover:bg-[#FF6F00] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-[#FF9933]/25 transition-all cursor-pointer self-start sm:self-auto shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add New Role</span>
                  </button>
                )}
              </div>

              {/* Toast Notification */}
              {accountToast && (
                <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-[#E8F5E9] dark:bg-emerald-950/60 border border-[#C8E6C9] dark:border-emerald-800 text-[#138808] dark:text-emerald-200 text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200">
                  <CheckCircle2 className="w-4 h-4 text-[#138808] shrink-0" />
                  <span>{accountToast}</span>
                </div>
              )}

              {/* Sub-Tabs Selector: Side 1 (Customer Directory) vs Side 2 (Staff & Management) */}
              <div className="flex flex-wrap items-center gap-3 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-fit">
                <button
                  type="button"
                  onClick={() => setAccountSubTab("customers")}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    accountSubTab === "customers"
                      ? "bg-[#FF9933] text-white shadow-md shadow-[#FF9933]/25"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800/60"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Side 1: Customer Directory</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      accountSubTab === "customers"
                        ? "bg-white/20 text-white"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {customerAccountsList.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setAccountSubTab("staff")}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    accountSubTab === "staff"
                      ? "bg-[#000080] text-white shadow-md shadow-[#000080]/25"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800/60"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Side 2: Staff & Management</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      accountSubTab === "staff"
                        ? "bg-white/20 text-white"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {staffAccountsList.length}
                  </span>
                </button>
              </div>

              {/* ========================================================= */}
              {/* SIDE 1: CUSTOMER DIRECTORY VIEW                           */}
              {/* ========================================================= */}
              {accountSubTab === "customers" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Super Admin Incoming Password Reset Request Notification Card */}
                  <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-indigo-900/60 shadow-lg space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/25 shrink-0">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                              Incoming Password Reset Verification Requests
                            </h3>
                            {pendingResetRequests.length > 0 ? (
                              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                                {pendingResetRequests.length} Pending Approval
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                                Up to Date
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Customer-initiated verification requests. Authorize with [ Yes ] to generate 6-digit OTP, or decline with [ No ].
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Pending Requests List */}
                    {pendingResetRequests.length === 0 ? (
                      <div className="py-4 px-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                        No pending password reset requests from customers right now.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {pendingResetRequests.map((req) => (
                          <div
                            key={req.id}
                            className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/70 via-white to-indigo-50/70 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/30 border-2 border-amber-300/80 dark:border-amber-600/50 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in"
                          >
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                                <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                                  Verification Request Received
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  • {req.requestedAt}
                                </span>
                              </div>

                              {/* Customer Details: Full Name, Mobile Number, Email ID */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs">
                                <div className="bg-white/90 dark:bg-slate-900/90 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                                  <span className="text-[10px] text-slate-400 block font-medium">Full Name</span>
                                  <span className="font-bold text-slate-900 dark:text-white">{req.customerName}</span>
                                </div>
                                <div className="bg-white/90 dark:bg-slate-900/90 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                                  <span className="text-[10px] text-slate-400 block font-medium">Mobile Number</span>
                                  <span className="font-mono font-bold text-slate-900 dark:text-white">{req.customerPhone}</span>
                                </div>
                                <div className="bg-white/90 dark:bg-slate-900/90 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                                  <span className="text-[10px] text-slate-400 block font-medium">Email ID</span>
                                  <span className="font-mono text-slate-700 dark:text-slate-300 truncate block">{req.customerEmail}</span>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons: [ Yes ] and [ No ] */}
                            <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                              <button
                                type="button"
                                onClick={() => handleRejectResetRequest(req.id)}
                                className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/80 text-rose-700 dark:text-rose-300 border-2 border-rose-300 dark:border-rose-800 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                                title="Reject reset request. OTP will NOT be generated."
                              >
                                <X className="w-4 h-4 text-rose-600 font-bold" />
                                <span>[ No ]</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleApproveResetRequest(req.id)}
                                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                                title="Authorize reset request and generate 6-digit OTP."
                              >
                                <Check className="w-4 h-4 text-white font-bold" />
                                <span>[ Yes ]</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Super Admin OTP Generator Control (For Customer Password Reset) */}
                  <div className="p-5 rounded-3xl bg-gradient-to-r from-[#FFF3E0]/70 via-white to-[#E8F5E9]/70 dark:from-slate-900/90 dark:via-slate-900 dark:to-slate-900/90 border border-slate-200 dark:border-slate-800 backdrop-blur-md space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-[#FF9933] text-white shadow-md shadow-[#FF9933]/25 shrink-0">
                          <KeyRound className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-extrabold text-[#000080] dark:text-white">
                              Customer Password Reset OTP Generator
                            </h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300">
                              Support Hotline: 8125898068
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Issue verified 6-digit numeric OTPs for customer password reset requests received via phone support.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5">
                        <select
                          value={otpTargetId}
                          onChange={(e) => setOtpTargetId(e.target.value)}
                          className="px-3 py-2 rounded-xl text-xs font-medium border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500"
                        >
                          <option value="customer-default">Customer: Rohith Kumar (8125898068)</option>
                          {accounts
                            .filter((a) => a.role === "customer")
                            .map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.name} ({a.phone || a.email})
                              </option>
                            ))}
                        </select>

                        <button
                          type="button"
                          onClick={handleGenerateResetOtp}
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-amber-600/30 transition-all cursor-pointer whitespace-nowrap"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Generate 6-Digit OTP</span>
                        </button>
                      </div>
                    </div>

                    {/* Active Generated OTP Display Banner with 1-Minute Expiry Countdown */}
                    {activeGeneratedOtp && (
                      <div
                        className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border ${
                          otpRemainingSeconds > 0
                            ? "border-amber-300 dark:border-amber-600/40"
                            : "border-rose-300 dark:border-rose-700/60 bg-rose-50/20"
                        } shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in zoom-in-95 duration-150`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-3 h-3 rounded-full ${
                              otpRemainingSeconds > 0
                                ? "bg-emerald-500 animate-ping"
                                : "bg-rose-500"
                            } shrink-0`}
                          />
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`text-[10px] font-extrabold uppercase tracking-wider ${
                                  otpRemainingSeconds > 0
                                    ? "text-amber-700 dark:text-amber-400"
                                    : "text-rose-600 dark:text-rose-400"
                                }`}
                              >
                                {otpRemainingSeconds > 0
                                  ? `Active Verified OTP Code • ${activeGeneratedOtp.targetName}`
                                  : `Expired OTP Code • ${activeGeneratedOtp.targetName}`}
                              </span>
                              <span
                                className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                                  otpRemainingSeconds > 0
                                    ? "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                                    : "bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                                }`}
                              >
                                <Clock className="w-3 h-3" />
                                {otpRemainingSeconds > 0
                                  ? `Expires in: 00:${otpRemainingSeconds < 10 ? "0" : ""}${otpRemainingSeconds}s`
                                  : "Expired (00:00)"}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              <span
                                className={`text-2xl font-black font-mono tracking-[0.25em] px-3.5 py-1 rounded-xl border ${
                                  otpRemainingSeconds > 0
                                    ? "text-slate-900 dark:text-white bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800"
                                    : "text-slate-400 line-through bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900"
                                }`}
                              >
                                {activeGeneratedOtp.code}
                              </span>
                              <span className="text-xs text-slate-400">
                                Generated at {activeGeneratedOtp.timestamp}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right text-[11px] text-slate-500 hidden md:block">
                            <p className="font-semibold text-slate-800 dark:text-slate-200">
                              Communicate to customer at <strong>8125898068</strong>
                            </p>
                            <p
                              className={`text-[10px] ${
                                otpRemainingSeconds > 0
                                  ? "text-emerald-600 dark:text-emerald-400 font-medium"
                                  : "text-rose-600 dark:text-rose-400 font-bold"
                              }`}
                            >
                              {otpRemainingSeconds > 0
                                ? "Ready to unlock password reset form"
                                : "OTP has expired. Generate a new OTP."}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard?.writeText(activeGeneratedOtp.code);
                              showToastMsg(`OTP ${activeGeneratedOtp.code} copied to clipboard!`);
                            }}
                            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy OTP</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Customer Directory Table */}
                  <div className="rounded-3xl border border-indigo-200 dark:border-indigo-900/60 bg-white dark:bg-slate-900/90 p-5 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/25 shrink-0">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                              Customer Directory (Side 1)
                            </h3>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                              {customerAccountsList.length} Registered Customer{customerAccountsList.length === 1 ? "" : "s"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Displays all registered customers with email, contact, registration timestamp, uploaded file counts, and activity status.
                          </p>
                        </div>
                      </div>

                      {/* Customer Quick Search */}
                      <div className="relative min-w-[220px]">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search customer email or phone..."
                          value={customerFilterText}
                          onChange={(e) => setCustomerFilterText(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Table of Customer Profiles */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                            <th className="py-2.5 px-3">Customer</th>
                            <th className="py-2.5 px-3">Email ID</th>
                            <th className="py-2.5 px-3">Phone Number</th>
                            <th className="py-2.5 px-3">Registration Date & Time</th>
                            <th className="py-2.5 px-3">Uploaded Files Count</th>
                            <th className="py-2.5 px-3">Total Logins</th>
                            <th className="py-2.5 px-3">Activity Status</th>
                            <th className="py-2.5 px-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                          {customerAccountsList.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                                No customer records found matching your search.
                              </td>
                            </tr>
                          ) : (
                            customerAccountsList.map((cust) => {
                              const docCount = getUserDocCount(cust.email);
                              return (
                                <tr key={cust.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                  <td className="py-3 px-3">
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-7 h-7 rounded-xl bg-[#000080] text-white font-black text-xs flex items-center justify-center shrink-0">
                                        {cust.name.slice(0, 1).toUpperCase()}
                                      </div>
                                      <span className="font-bold text-slate-900 dark:text-white truncate">
                                        {cust.name}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-3">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedUserForAnalytics(cust);
                                        setAnalyticsTab("sessions");
                                      }}
                                      className="font-mono text-[#000080] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                                      title="Click to view full session logs & activity"
                                    >
                                      <span>{cust.email}</span>
                                      <ExternalLink className="w-3 h-3 opacity-60" />
                                    </button>
                                  </td>
                                  <td className="py-3 px-3">
                                    <span className="font-mono text-slate-700 dark:text-slate-300">
                                      {cust.phone || "8125898068"}
                                    </span>
                                  </td>
                                  <td className="py-3 px-3">
                                    <span className="text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                      {cust.registeredAt || cust.createdAt || "Feb 14, 2026, 10:30 AM"}
                                    </span>
                                  </td>
                                  <td className="py-3 px-3">
                                    <span
                                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5 ${
                                        docCount > 0
                                          ? "bg-[#FFF3E0] dark:bg-amber-950/80 text-[#E65100] dark:text-amber-300 border border-[#FFE082]"
                                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                                      }`}
                                    >
                                      <FileText className="w-3 h-3" />
                                      <span>{docCount} {docCount === 1 ? "file" : "files"}</span>
                                    </span>
                                  </td>
                                  <td className="py-3 px-3">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#E8EEF5] dark:bg-blue-950 text-[#000080] dark:text-blue-300">
                                      {cust.totalLogins || 0} Logins
                                    </span>
                                  </td>
                                  <td className="py-3 px-3">
                                    {cust.status === "active" ? (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5E9] dark:bg-emerald-950 text-[#138808] dark:text-emerald-400 border border-[#C8E6C9] dark:border-emerald-800 flex items-center gap-1 w-fit">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#138808]" />
                                        Active
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800 w-fit">
                                        Suspended
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3 px-3 text-right">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedUserForAnalytics(cust);
                                        setAnalyticsTab("sessions");
                                      }}
                                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold transition-colors cursor-pointer"
                                    >
                                      View Logs
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* SIDE 2: STAFF & MANAGEMENT VIEW (SUPER ADMIN & OWNER)      */}
              {/* ========================================================= */}
              {accountSubTab === "staff" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Top Bar for Staff & Management */}
                  <div className="p-4 rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-[#000080] text-white shadow-md shadow-[#000080]/20 shrink-0">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-extrabold text-[#000080] dark:text-white">
                            Staff & Management (Side 2)
                          </h3>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#E8EEF5] dark:bg-blue-950 text-[#000080] dark:text-blue-300 border border-[#BBDEFB] dark:border-blue-800">
                            {staffAccountsList.length} Accounts (Super Admin & Owner)
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Strictly displays Super Admin and Owner accounts with roles, operational metrics, edit, and delete options.
                        </p>
                      </div>
                    </div>

                    {user?.role === "superadmin" && (
                      <button
                        type="button"
                        onClick={handleOpenAddModal}
                        className="px-4 py-2 rounded-xl bg-[#FF9933] hover:bg-[#FF6F00] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-[#FF9933]/25 transition-all cursor-pointer self-start sm:self-auto shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                        <span>+ Add New Role</span>
                      </button>
                    )}
                  </div>

                  {/* Staff Accounts Cards */}
                  <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5 divide-y divide-slate-100 dark:divide-slate-800 shadow-sm space-y-2">
                    {staffAccountsList.length === 0 ? (
                      <p className="text-center py-8 text-xs text-slate-400">
                        No staff accounts found.
                      </p>
                    ) : (
                      staffAccountsList.map((acc) => (
                        <div
                          key={acc.id}
                          className="pt-4 first:pt-0 pb-4 last:pb-0 flex flex-col xl:flex-row xl:items-center justify-between gap-4"
                        >
                          {/* 1. Identity Info & Clickable Email for Analytics */}
                          <div className="flex items-start sm:items-center gap-3.5 min-w-[280px]">
                            <div
                              className={`p-3 rounded-2xl shrink-0 ${
                                acc.role === "superadmin"
                                  ? "bg-[#E8EEF5] dark:bg-blue-950/60 text-[#000080] dark:text-blue-400 border border-[#BBDEFB] dark:border-blue-800/40"
                                  : "bg-[#FFF3E0] dark:bg-amber-950/60 text-[#E65100] dark:text-amber-400 border border-[#FFE082] dark:border-amber-800/40"
                              }`}
                            >
                              {acc.role === "superadmin" ? (
                                <KeyRound className="w-5 h-5" />
                              ) : (
                                <ShieldCheck className="w-5 h-5" />
                              )}
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                                  {acc.name}
                                </span>
                                <span
                                  className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                    acc.role === "superadmin"
                                      ? "bg-[#E8EEF5] dark:bg-blue-950/80 text-[#000080] dark:text-blue-300 border border-[#BBDEFB] dark:border-blue-700/50"
                                      : "bg-[#FFF3E0] dark:bg-amber-950/80 text-[#E65100] dark:text-amber-300 border border-[#FFE082] dark:border-amber-700/50"
                                  }`}
                                >
                                  {acc.role === "superadmin" ? "Super Admin" : "Owner"}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    acc.status === "active"
                                      ? "bg-[#E8F5E9] dark:bg-emerald-950/60 text-[#138808] dark:text-emerald-400 border border-[#C8E6C9] dark:border-emerald-800"
                                      : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                                  }`}
                                >
                                  {acc.status === "active" ? "Active" : "Suspended"}
                                </span>

                                {/* Live Session State Badge */}
                                {acc.activeSessionId ? (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8F5E9] dark:bg-emerald-950/90 text-[#138808] dark:text-emerald-400 border border-[#C8E6C9] dark:border-emerald-700 flex items-center gap-1 animate-pulse">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#138808]" />
                                    Active Session
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-400 px-1.5 py-0.5">
                                    Offline
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-3 text-slate-500 dark:text-slate-400 mt-1 text-[11px]">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedUserForAnalytics(acc);
                                    setAnalyticsTab("sessions");
                                  }}
                                  className="flex items-center gap-1 text-[#000080] dark:text-blue-400 font-semibold hover:underline cursor-pointer group"
                                  title="Click to view detailed user activity logs, login history, and time spent on site"
                                >
                                  <Mail className="w-3.5 h-3.5 text-[#000080] group-hover:scale-110 transition-transform" />
                                  <span>{acc.email}</span>
                                  <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                                </button>

                                {acc.phone && (
                                  <span className="flex items-center gap-1 font-mono">
                                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                                    {acc.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* 2. Usage & Activity Metrics Display */}
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex-1 max-w-3xl">
                            {/* Last Login / Session Time */}
                            <div className="flex items-center gap-2.5">
                              <Clock className="w-4 h-4 text-[#FF9933] shrink-0" />
                              <div className="truncate">
                                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                                  Last Session
                                </p>
                                <p className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate">
                                  {acc.lastLogin || "Never"}
                                </p>
                              </div>
                            </div>

                            {/* Daily Service Count */}
                            <div className="flex items-center gap-2.5">
                              <Activity className="w-4 h-4 text-[#138808] shrink-0" />
                              <div>
                                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                                  Daily Tasks
                                </p>
                                <p className="font-bold text-[#138808] dark:text-emerald-400 text-xs">
                                  {acc.dailyServiceCount || 0} processed
                                </p>
                              </div>
                            </div>

                            {/* Monthly Service Count */}
                            <div className="flex items-center gap-2.5">
                              <TrendingUp className="w-4 h-4 text-[#000080] shrink-0" />
                              <div>
                                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                                  Monthly Tasks
                                </p>
                                <p className="font-bold text-[#000080] dark:text-blue-400 text-xs">
                                  {acc.monthlyServiceCount || 0} this month
                                </p>
                              </div>
                            </div>

                            {/* Total Logins & Time Spent on site */}
                            <div className="flex items-center gap-2.5">
                              <Monitor className="w-4 h-4 text-[#FF9933] shrink-0" />
                              <div>
                                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                                  Total Logins / Time
                                </p>
                                <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                                  {acc.totalLogins || acc.sessionLogs?.length || 1} logins • {Math.floor((acc.totalTimeSpentSeconds || 1800) / 60)}m
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* 3. Action Buttons: Edit and Delete */}
                          <div className="flex items-center justify-end gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(acc)}
                              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                              title="Edit user details"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-[#000080]" />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeletingAccount(acc)}
                              className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                              title="Delete user account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Add New Role Modal */}
              {showAddUserModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg p-6 space-y-5 animate-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2.5 rounded-xl bg-[#FFF3E0] dark:bg-amber-950/40 text-[#E65100] border border-[#FFE082]">
                          <UserPlus className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-extrabold text-[#000080] dark:text-white">
                            + Add New Role & User Account
                          </h3>
                          <p className="text-xs text-slate-500">
                            Create credentials and assign administrative permissions
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAddUserModal(false)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
                      {/* Role Selector */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Select Role <span className="text-rose-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setNewRoleForm((p) => ({ ...p, role: "owner" }))}
                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                              newRoleForm.role === "owner"
                                ? "border-[#FF9933] bg-[#FFF8E1] dark:bg-amber-950/40 text-slate-900 dark:text-white shadow-sm ring-2 ring-[#FF9933]/30"
                                : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-extrabold text-sm flex items-center gap-1.5 text-[#E65100]">
                                <ShieldCheck className="w-4 h-4 text-[#FF9933]" />
                                Owner
                              </span>
                              {newRoleForm.role === "owner" && (
                                <CheckCircle2 className="w-4 h-4 text-[#138808]" />
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 leading-tight">
                              Local MSN kiosk operator with task processing & verification controls.
                            </p>
                          </button>

                          <button
                            type="button"
                            onClick={() => setNewRoleForm((p) => ({ ...p, role: "superadmin" }))}
                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                              newRoleForm.role === "superadmin"
                                ? "border-[#000080] bg-[#E8EEF5] dark:bg-blue-950/40 text-slate-900 dark:text-white shadow-sm ring-2 ring-[#000080]/30"
                                : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-extrabold text-sm flex items-center gap-1.5 text-[#000080]">
                                <KeyRound className="w-4 h-4 text-[#000080]" />
                                Super Admin
                              </span>
                              {newRoleForm.role === "superadmin" && (
                                <CheckCircle2 className="w-4 h-4 text-[#138808]" />
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 leading-tight">
                              Full root privilege to manage catalog, pricing, users, and audit vaults.
                            </p>
                          </button>
                        </div>
                      </div>

                      {/* Full Name */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Full Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={newRoleForm.name}
                          onChange={(e) => setNewRoleForm((p) => ({ ...p, name: e.target.value }))}
                          placeholder="e.g. Ramesh Chandra"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#FF9933] focus:ring-1 focus:ring-[#FF9933] transition-colors"
                        />
                      </div>

                      {/* Phone & Email in 2 columns */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                              Phone Number <span className="text-rose-500">*</span>
                            </label>
                            {newRoleForm.phone.length > 0 && newRoleForm.phone.length < 10 && (
                              <span className="text-[10px] text-amber-600 dark:text-amber-400">
                                {newRoleForm.phone.length}/10 digits
                              </span>
                            )}
                          </div>
                          <input
                            type="tel"
                            inputMode="numeric"
                            maxLength={10}
                            required
                            value={newRoleForm.phone}
                            onChange={(e) => setNewRoleForm((p) => ({ ...p, phone: sanitizePhoneNumber(e.target.value) }))}
                            placeholder="10-digit number (e.g. 9848011223)"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#FF9933] focus:ring-1 focus:ring-[#FF9933] transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Email ID <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="email"
                            required
                            value={newRoleForm.email}
                            onChange={(e) => setNewRoleForm((p) => ({ ...p, email: e.target.value }))}
                            placeholder="user@msnportal.gov.in"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#FF9933] focus:ring-1 focus:ring-[#FF9933] transition-colors"
                          />
                        </div>
                      </div>

                      {/* Password */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Password <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={newRoleForm.password}
                            onChange={(e) => setNewRoleForm((p) => ({ ...p, password: e.target.value }))}
                            placeholder="Enter secure password"
                            className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#FF9933] focus:ring-1 focus:ring-[#FF9933] transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                          User can use this Email/Phone and Password to log in directly from the sign-in page.
                        </p>
                      </div>

                      <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => setShowAddUserModal(false)}
                          className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-[#FF9933] hover:bg-[#FF6F00] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#FF9933]/30 cursor-pointer transition-colors"
                        >
                          <Check className="w-4 h-4" />
                          <span>Create & Register Role</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Edit User Modal */}
              {editingAccount && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <h3 className="text-base font-extrabold text-[#000080] dark:text-white flex items-center gap-2">
                        <Edit2 className="w-4 h-4 text-[#FF9933]" />
                        Edit Account Details
                      </h3>
                      <button
                        type="button"
                        onClick={() => setEditingAccount(null)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveEditUser} className="space-y-4 text-xs">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={editForm.name}
                          onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#000080]"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                            Phone Number
                          </label>
                          {editForm.phone.length > 0 && editForm.phone.length < 10 && (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400">
                              {editForm.phone.length}/10 digits
                            </span>
                          )}
                        </div>
                        <input
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          required
                          value={editForm.phone}
                          onChange={(e) => setEditForm((p) => ({ ...p, phone: sanitizePhoneNumber(e.target.value) }))}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#000080]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Assigned Role
                        </label>
                        <select
                          value={editForm.role}
                          onChange={(e) =>
                            setEditForm((p) => ({ ...p, role: e.target.value as "owner" | "superadmin" }))
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#000080]"
                        >
                          <option value="owner">Owner (Kiosk Operator)</option>
                          <option value="superadmin">Super Admin (Root Privilege)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Account Status
                        </label>
                        <select
                          value={editForm.status}
                          onChange={(e) =>
                            setEditForm((p) => ({ ...p, status: e.target.value as "active" | "suspended" }))
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#000080]"
                        >
                          <option value="active">Active (Access Allowed)</option>
                          <option value="suspended">Suspended (Access Revoked)</option>
                        </select>
                      </div>

                      <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => setEditingAccount(null)}
                          className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-[#000080] hover:bg-[#0A1931] text-white text-xs font-bold cursor-pointer transition-colors shadow-sm"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Delete User Confirmation Dialog */}
              {deletingAccount && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-4 animate-in zoom-in-95 duration-150">
                    <div className="flex items-center gap-3 text-rose-600">
                      <div className="p-2.5 rounded-2xl bg-rose-100 dark:bg-rose-950/60">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                          Confirm Account Removal
                        </h3>
                        <p className="text-xs text-slate-500">Permanent deletion of account credentials</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Are you sure you want to permanently remove <strong>{deletingAccount.name}</strong> (
                      {deletingAccount.role === "superadmin" ? "Super Admin" : "Owner"})? This user will no longer be
                      able to log in to MSN Communications.
                    </p>

                    <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setDeletingAccount(null)}
                        className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmDelete}
                        className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/30 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Confirm Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Specific User Activity Logs & Session Analytics Modal */}
              {selectedUserForAnalytics && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
                    {/* Modal Header */}
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-slate-950/40">
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`p-3 rounded-2xl ${
                            selectedUserForAnalytics.role === "superadmin"
                              ? "bg-[#E8EEF5] dark:bg-blue-950 text-[#000080] dark:text-blue-400"
                              : selectedUserForAnalytics.role === "owner"
                              ? "bg-[#FFF3E0] dark:bg-amber-950 text-[#E65100] dark:text-amber-400"
                              : "bg-[#E8EEF5] dark:bg-slate-800 text-[#000080] dark:text-slate-300"
                          }`}
                        >
                          {selectedUserForAnalytics.role === "superadmin" ? (
                            <KeyRound className="w-6 h-6" />
                          ) : selectedUserForAnalytics.role === "owner" ? (
                            <ShieldCheck className="w-6 h-6" />
                          ) : (
                            <Users className="w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                              {selectedUserForAnalytics.name}
                            </h3>
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                selectedUserForAnalytics.role === "superadmin"
                                  ? "bg-[#E8EEF5] text-[#000080] dark:bg-blue-950 dark:text-blue-300 border border-[#BBDEFB]"
                                  : selectedUserForAnalytics.role === "owner"
                                  ? "bg-[#FFF3E0] text-[#E65100] dark:bg-amber-950 dark:text-amber-300 border border-[#FFE082]"
                                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                              }`}
                            >
                              {selectedUserForAnalytics.role === "superadmin"
                                ? "Super Admin"
                                : selectedUserForAnalytics.role === "owner"
                                ? "Owner"
                                : "Customer"}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                selectedUserForAnalytics.status === "active"
                                  ? "bg-[#E8F5E9] text-[#138808] dark:bg-emerald-950 dark:text-emerald-400 border border-[#C8E6C9]"
                                  : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                              }`}
                            >
                              {selectedUserForAnalytics.status === "active" ? "Active" : "Suspended"}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-slate-500 text-xs mt-1">
                            <span className="flex items-center gap-1 font-mono">
                              <Mail className="w-3.5 h-3.5" />
                              {selectedUserForAnalytics.email}
                            </span>
                            {selectedUserForAnalytics.phone && (
                              <span className="flex items-center gap-1 font-mono">
                                <Phone className="w-3.5 h-3.5" />
                                {selectedUserForAnalytics.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedUserForAnalytics(null)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Operational Summary Metrics Tiles */}
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white dark:bg-slate-900">
                      <div className="p-3 rounded-2xl bg-[#E8EEF5]/50 dark:bg-blue-950/20 border border-[#BBDEFB]/50 dark:border-blue-800/40">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#000080] dark:text-blue-400">
                          Total Logins
                        </p>
                        <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                          {selectedUserForAnalytics.totalLogins || selectedUserForAnalytics.sessionLogs?.length || 1}
                        </p>
                      </div>

                      <div className="p-3 rounded-2xl bg-[#FFF3E0]/50 dark:bg-amber-950/20 border border-[#FFE082]/50 dark:border-amber-800/40">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#E65100] dark:text-amber-400">
                          Time Spent
                        </p>
                        <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                          {Math.floor((selectedUserForAnalytics.totalTimeSpentSeconds || 1200) / 60)} mins
                        </p>
                      </div>

                      <div className="p-3 rounded-2xl bg-[#E8F5E9]/50 dark:bg-emerald-950/20 border border-[#C8E6C9]/50 dark:border-emerald-800/40">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#138808] dark:text-emerald-400">
                          Session Status
                        </p>
                        <p className="text-xs font-extrabold text-[#138808] dark:text-emerald-400 mt-1 flex items-center gap-1.5">
                          {selectedUserForAnalytics.activeSessionId ? (
                            <>
                              <span className="w-2 h-2 rounded-full bg-[#138808] animate-ping" />
                              <span>Live Active</span>
                            </>
                          ) : (
                            <span className="text-slate-500">Offline / Ended</span>
                          )}
                        </p>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800/40">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                          Last Session
                        </p>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate mt-1">
                          {selectedUserForAnalytics.lastLogin || "Never"}
                        </p>
                      </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="px-6 pt-3 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 text-xs font-bold bg-slate-50/30 dark:bg-slate-950/20">
                      <button
                        type="button"
                        onClick={() => setAnalyticsTab("sessions")}
                        className={`pb-2.5 border-b-2 cursor-pointer transition-colors flex items-center gap-2 ${
                          analyticsTab === "sessions"
                            ? "border-[#FF9933] text-[#FF9933]"
                            : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        }`}
                      >
                        <Clock className="w-4 h-4" />
                        <span>Login History & Sessions ({selectedUserForAnalytics.sessionLogs?.length || 0})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAnalyticsTab("activity")}
                        className={`pb-2.5 border-b-2 cursor-pointer transition-colors flex items-center gap-2 ${
                          analyticsTab === "activity"
                            ? "border-[#000080] text-[#000080]"
                            : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        }`}
                      >
                        <Activity className="w-4 h-4" />
                        <span>Operational Actions & Logs ({selectedUserForAnalytics.activityLogs?.length || 0})</span>
                      </button>
                    </div>

                    {/* Tab Body */}
                    <div className="p-6 overflow-y-auto max-h-[380px] space-y-3">
                      {analyticsTab === "sessions" ? (
                        /* Login History and Sessions list */
                        selectedUserForAnalytics.sessionLogs && selectedUserForAnalytics.sessionLogs.length > 0 ? (
                          <div className="space-y-2.5">
                            {selectedUserForAnalytics.sessionLogs.map((sess) => (
                              <div
                                key={sess.id}
                                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                                      {sess.sessionId}
                                    </span>
                                    <span
                                      className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                                        sess.status === "active"
                                          ? "bg-[#E8F5E9] dark:bg-emerald-950 text-[#138808] dark:text-emerald-400 border border-[#C8E6C9]"
                                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                                      }`}
                                    >
                                      {sess.status === "active" ? "Active Now" : "Ended"}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                    Logged In: <strong>{sess.loginTime}</strong>
                                    {sess.logoutTime && (
                                      <span> • Logged Out: <strong>{sess.logoutTime}</strong></span>
                                    )}
                                  </p>
                                </div>

                                <div className="flex flex-wrap sm:flex-col sm:items-end gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                                  <span className="font-semibold text-[#000080] dark:text-blue-400 font-mono">
                                    Duration: {Math.floor(sess.durationSeconds / 60)}m {sess.durationSeconds % 60}s
                                  </span>
                                  <span>{sess.device || "Chrome / Windows 11"}</span>
                                  <span className="font-mono text-[10px]">IP: {sess.ipAddress || "49.205.14.88"}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-slate-400 text-xs">
                            No individual session logs recorded yet for this user.
                          </div>
                        )
                      ) : (
                        /* Operational Actions & Activity list */
                        selectedUserForAnalytics.activityLogs && selectedUserForAnalytics.activityLogs.length > 0 ? (
                          <div className="space-y-2.5">
                            {selectedUserForAnalytics.activityLogs.map((act) => (
                              <div
                                key={act.id}
                                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 flex items-start gap-3 text-xs"
                              >
                                <div className="p-2 rounded-xl bg-[#FFF3E0] dark:bg-amber-950/80 text-[#E65100] shrink-0 mt-0.5">
                                  <Activity className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-extrabold text-slate-900 dark:text-white">
                                      {act.action}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {act.timestamp}
                                    </span>
                                  </div>
                                  {act.details && (
                                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                                      {act.details}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-slate-400 text-xs">
                            No operational activities logged yet for this user.
                          </div>
                        )
                      )}
                    </div>

                    {/* Modal Footer */}
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs bg-slate-50/50 dark:bg-slate-950/40">
                      <span className="text-[11px] text-slate-500">
                        Multi-tenant isolated activity vault • DPDP Act 2023 Compliant
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedUserForAnalytics(null)}
                        className="px-4 py-2 rounded-xl bg-[#000080] hover:bg-[#0A1931] text-white font-bold transition-colors cursor-pointer"
                      >
                        Close Analytics
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {/* ========================================================= */}
              {/* FOOTER AREA: CUSTOMER PASSWORD CHANGE REQUESTS APPROVAL BOX*/}
              {/* ========================================================= */}
              <div
                id="customer-password-change-requests"
                className="mt-6 p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-indigo-900/60 shadow-xl space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-[#000080] text-white shadow-md shadow-[#000080]/20 shrink-0">
                      <KeyRound className="w-5 h-5 text-amber-300" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-extrabold text-[#000080] dark:text-white">
                          Customer Password Change Requests
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8EEF5] dark:bg-blue-950 text-[#000080] dark:text-blue-300 border border-[#BBDEFB] dark:border-blue-800">
                          Password Reset Approvals
                        </span>
                        {pendingResetRequests.length > 0 ? (
                          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 flex items-center gap-1.5 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                            {pendingResetRequests.length} Live Request{pendingResetRequests.length > 1 ? "s" : ""} Pending
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            All Requests Processed
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Real-time customer verification requests. Authorize with <strong>[ Yes ]</strong> to generate and send a 10-minute OTP, or reject with <strong>[ No ]</strong> to dismiss.
                      </p>
                    </div>
                  </div>

                  {/* Toggle History Button */}
                  <button
                    type="button"
                    onClick={() => setShowHistoryApprovals(!showHistoryApprovals)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-center"
                  >
                    <History className="w-3.5 h-3.5 text-[#FF9933]" />
                    <span>{showHistoryApprovals ? "Hide History" : "Audit History"}</span>
                  </button>
                </div>

                {/* Real-time Customer Request Rows */}
                {pendingResetRequests.length === 0 ? (
                  <div className="py-6 px-4 rounded-2xl bg-slate-50/70 dark:bg-slate-950/40 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-1">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      No active customer password change requests at this moment.
                    </p>
                    <p className="text-[11px] text-slate-400">
                      When a customer clicks &quot;Forgot Password&quot; on the login page and enters their identifier, their request appears here dynamically.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingResetRequests.map((req) => (
                      <div
                        key={req.id}
                        className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/80 via-white to-indigo-50/70 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/30 border-2 border-amber-300 dark:border-amber-600/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-1"
                      >
                        {/* Customer Basic Details */}
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping shrink-0" />
                            <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                              Incoming Password Change Request
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              • Requested at {req.requestedAt}
                            </span>
                            {/* Facial Identity Verified Badge */}
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5E9] dark:bg-emerald-950/60 text-[#138808] dark:text-emerald-300 border border-[#C8E6C9] dark:border-emerald-800 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-[#138808]" />
                              <span>✓ Facial Identity Verified</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            {req.customerPhoto && (
                              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-500 shadow-sm shrink-0">
                                <img
                                  src={req.customerPhoto}
                                  alt={req.customerName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs flex-1">
                              <div className="bg-white/90 dark:bg-slate-900/90 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                                <span className="text-[10px] text-slate-400 block font-medium">Customer Name</span>
                                <span className="font-extrabold text-slate-900 dark:text-white">{req.customerName}</span>
                              </div>
                              <div className="bg-white/90 dark:bg-slate-900/90 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                                <span className="text-[10px] text-slate-400 block font-medium">Email ID</span>
                                <span className="font-mono text-slate-700 dark:text-slate-300 truncate block">{req.customerEmail}</span>
                              </div>
                              <div className="bg-white/90 dark:bg-slate-900/90 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                                <span className="text-[10px] text-slate-400 block font-medium">Phone Number</span>
                                <span className="font-mono font-bold text-slate-900 dark:text-white">📞 {req.customerPhone}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons: [ Yes ] and [ No ] */}
                        <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                          <button
                            type="button"
                            onClick={() => handleRejectResetRequest(req.id)}
                            className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                            title="Decline request. Request will be cleared and OTP will not be sent."
                          >
                            <X className="w-4 h-4" />
                            <span>[ No ]</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleApproveResetRequest(req.id)}
                            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                            title="Authorize request. Generates 10-minute OTP and sends customer to OTP verification page."
                          >
                            <Check className="w-4 h-4" />
                            <span>[ Yes ]</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Audit History of Previously Processed Requests (Approved / Rejected) */}
                {showHistoryApprovals && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 animate-in fade-in">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-[#000080] dark:text-blue-400" />
                      <span>Password Reset Audit History ({passwordResetRequests.length})</span>
                    </h4>
                    {passwordResetRequests.length === 0 ? (
                      <p className="text-[11px] text-slate-400 py-2">No past reset requests recorded.</p>
                    ) : (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/40">
                        {passwordResetRequests.slice(0, 5).map((r) => (
                          <div key={r.id} className="p-3 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2.5">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  r.status === "approved"
                                    ? "bg-emerald-500"
                                    : r.status === "rejected"
                                    ? "bg-rose-500"
                                    : "bg-amber-500 animate-ping"
                                }`}
                              />
                              <div>
                                <span className="font-bold text-slate-900 dark:text-white">{r.customerName}</span>
                                <span className="text-[11px] text-slate-400 ml-2 font-mono">({r.customerPhone})</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span
                                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                  r.status === "approved"
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                    : r.status === "rejected"
                                    ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                                    : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                }`}
                              >
                                {r.status}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">{r.requestedAt}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Password Change Biometric Audits & Visual Photo Comparison */}
              {renderPasswordChangeAuditSection()}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 6: DEDICATED USER & ADMIN SETTINGS VIEW               */}
          {/* Triggered by the User-Settings Icon Button on bottom-left */}
          {/* ========================================================= */}
          {activeTab === "user-settings" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Settings Header */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-[#FFF3E0]/70 via-white to-[#E8F5E9]/70 dark:from-slate-900/90 dark:via-slate-900 dark:to-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#000080] text-white flex items-center justify-center shadow-lg shadow-[#000080]/20 shrink-0">
                    <UserGearIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black text-[#000080] dark:text-white">
                        Super Admin & User Settings
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FF9933] text-white shadow-sm">
                        Root Privilege
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      Configure master administrative credentials, operator permissions, security barriers, and gateway credentials.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSettingsSavedToast(true);
                    setTimeout(() => setSettingsSavedToast(false), 3000);
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-[#FF9933] hover:bg-[#FF6F00] text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#FF9933]/25 transition-all self-start sm:self-auto cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save All Changes</span>
                </button>
              </div>

              {/* Settings Form Grid */}
              <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Master Root Profile Card */}
                <div className="p-6 rounded-3xl bg-white/95 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800">
                    <span className="p-1.5 rounded-xl bg-[#FFF3E0] text-[#E65100]">
                      <Shield className="w-4 h-4" />
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Master Administrator Profile
                    </h3>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#FF9933] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1">
                        Super Admin Email (Official ID)
                      </label>
                      <input
                        type="email"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#FF9933] transition-colors"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-slate-500 dark:text-slate-400 font-semibold">
                          Security Phone Number (2FA OTP)
                        </label>
                        {adminPhone.length > 0 && adminPhone.length < 10 && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400">
                            {adminPhone.length}/10 digits
                          </span>
                        )}
                      </div>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={adminPhone}
                        onChange={(e) => setAdminPhone(sanitizePhoneNumber(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#FF9933] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1">
                        Session Idle Timeout
                      </label>
                      <select
                        value={sessionTimeout}
                        onChange={(e) => setSessionTimeout(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#FF9933] transition-colors"
                      >
                        <option value="15">15 Minutes (High Security)</option>
                        <option value="30">30 Minutes</option>
                        <option value="60">60 Minutes (Standard)</option>
                        <option value="120">2 Hours</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. Security & Two-Factor Authentication */}
                <div className="p-6 rounded-3xl bg-white/95 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800">
                    <span className="p-1.5 rounded-xl bg-[#E8EEF5] text-[#000080]">
                      <Lock className="w-4 h-4" />
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Security & Two-Factor Authentication
                    </h3>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FFF8E1]/50 dark:bg-amber-950/30 border border-[#FFE082]/80 dark:border-amber-800/40">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">Hardware / App 2FA</p>
                        <p className="text-[11px] text-slate-500">Require TOTP authenticator code on login</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTwoFactorAuth(!twoFactorAuth)}
                        className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                          twoFactorAuth ? "bg-[#FF9933]" : "bg-slate-300 dark:bg-slate-700"
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                            twoFactorAuth ? "right-1" : "left-1"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">Auto-approve Verified Services</p>
                        <p className="text-[11px] text-slate-500">Fast-track direct statutory certificate requests</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAutoApproveVerified(!autoApproveVerified)}
                        className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                          autoApproveVerified ? "bg-[#138808]" : "bg-slate-300 dark:bg-slate-700"
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                            autoApproveVerified ? "right-1" : "left-1"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">Emergency Maintenance Mode</p>
                        <p className="text-[11px] text-slate-500">Suspend public submissions for backend updates</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMaintenanceMode(!maintenanceMode)}
                        className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                          maintenanceMode ? "bg-amber-600" : "bg-slate-300 dark:bg-slate-700"
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                            maintenanceMode ? "right-1" : "left-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Operator Privilege & Commission Matrix */}
                <div className="p-6 rounded-3xl bg-white/95 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800">
                    <span className="p-1.5 rounded-xl bg-[#FFF3E0] text-[#E65100]">
                      <SlidersHorizontal className="w-4 h-4" />
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Center Owner & Operator Policies
                    </h3>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-slate-500 dark:text-slate-400 font-semibold">
                          Center Operator Convenience Share
                        </label>
                        <span className="font-bold text-[#FF9933]">{operatorCommission}%</span>
                      </div>
                      <input
                        type="range"
                        min="40"
                        max="90"
                        value={operatorCommission}
                        onChange={(e) => setOperatorCommission(e.target.value)}
                        className="w-full accent-[#FF9933]"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                        <span>Portal: {100 - parseInt(operatorCommission, 10)}%</span>
                        <span>Operator: {operatorCommission}%</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                      <p className="font-bold text-slate-900 dark:text-white">Catalog Routing Permissions</p>
                      <p className="text-[11px] text-slate-500">
                        MeeSeva services are restricted to certified CSC kiosk owners. Online services are accessible to all operators.
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FFF3E0] dark:bg-amber-950 text-[#E65100] dark:text-amber-300">
                          12 Meeseva Enforced
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#E8EEF5] dark:bg-blue-950 text-[#000080] dark:text-blue-300">
                          {onlineServicesList.length} Online Open
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Gateways & Department Sync Status */}
                <div className="p-6 rounded-3xl bg-white/95 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800">
                    <span className="p-1.5 rounded-xl bg-[#E8EEF5] text-[#000080]">
                      <Server className="w-4 h-4" />
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Government Department Gateways
                    </h3>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">MeeSeva Telangana Gateway</p>
                          <p className="text-[10px] text-slate-400">REST v3 • Ping 24ms • Official API</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase">
                        Active
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">DigiLocker & Aadhaar e-KYC</p>
                          <p className="text-[10px] text-slate-400">Central UIDAI Bridge</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase">
                        Connected
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#138808] shrink-0" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">Payment Aggregator (UPI/QR)</p>
                          <p className="text-[10px] text-slate-400">Live Merchant Settlements</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-extrabold text-[#138808] dark:text-emerald-400 uppercase">
                        Operational
                      </span>
                    </div>
                  </div>
                </div>

                {/* Save Button Row */}
                <div className="col-span-1 md:col-span-2 flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("services")}
                    className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Back to Services Catalog
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-2xl bg-[#FF9933] hover:bg-[#FF6F00] text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#FF9933]/25 transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save & Deploy Configurations</span>
                  </button>
                </div>
              </form>
            </div>
          )}
          {/* Dedicated Service Management Modals triggered from pencil menu */}
          {activeModalType === "basic" && selectedServiceForModal && (
            <ManageBasicDetailsModal
              service={selectedServiceForModal}
              onClose={() => {
                setActiveModalType(null);
                setSelectedServiceForModal(null);
              }}
              onSave={handleSaveModalBasic}
            />
          )}

          {activeModalType === "docs" && selectedServiceForModal && (
            <ManageDocsModal
              docs={selectedServiceForModal.docs || []}
              onClose={() => {
                setActiveModalType(null);
                setSelectedServiceForModal(null);
              }}
              onSave={handleSaveModalDocs}
            />
          )}

          {activeModalType === "fields" && selectedServiceForModal && (
            <ManageFieldsModal
              fields={selectedServiceForModal.fields && selectedServiceForModal.fields.length > 0 ? selectedServiceForModal.fields : DEFAULT_APPLICANT_FIELDS}
              onClose={() => {
                setActiveModalType(null);
                setSelectedServiceForModal(null);
              }}
              onSave={handleSaveModalFields}
            />
          )}
        </main>
      </div>
    </div>
  );
};
