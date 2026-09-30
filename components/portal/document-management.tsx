"use client";

import React, { useState, useMemo, useEffect } from "react";
import { usePortal } from "@/lib/portal-store";
import { DOCUMENT_CATEGORIES } from "@/lib/services-data";
import {
  DocumentCategoryDef,
  UploadedFileMeta,
  FamilyChild,
  ExtendedFamilyDetails
} from "@/types/portal";
import { FileUploadBox } from "../FileUploadBox";
import { formatAadhaarNumber } from "@/lib/field-validation";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  Eye,
  Trash2,
  Shield,
  CheckCircle2,
  FileText,
  Lock,
  Download,
  Printer,
  Share2,
  Layers,
  Sparkles,
  Users,
  User,
  Heart,
  Baby,
  Plus,
  Minus,
  Save,
  Check,
  AlertCircle,
  Info,
  Calendar,
  CreditCard
} from "lucide-react";

export type FamilyMemberType = "self" | "father" | "mother" | "spouse" | "son" | "daughter";

export interface MemberDocSlot {
  label: string;
  docKey: string;
  description: string;
  required?: boolean;
}

export const DocumentManagement: React.FC = () => {
  const {
    uploadedDocs,
    uploadDocument,
    removeDocument,
    setPreviewDoc,
    user,
    accounts,
    updateAccount,
    logUserActivity,
    t
  } = usePortal();

  const [activeCategory, setActiveCategory] = useState<DocumentCategoryDef | null>(null);
  const [activeTab, setActiveTab] = useState<"vault" | "categories">("vault");
  const [selectedMemberId, setSelectedMemberId] = useState<string>("self");
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  const isAuthorized = user?.role === "superadmin" || user?.role === "owner";

  // Current user account and family schema
  const currentAccount = useMemo(() => {
    return (
      accounts.find(
        (a) =>
          a.id === user?.id ||
          (user?.email && a.email?.toLowerCase() === user.email.toLowerCase())
      ) || null
    );
  }, [accounts, user]);

  const familyDetails: ExtendedFamilyDetails | undefined =
    currentAccount?.familyDetails || user?.familyDetails;

  const isMarried = familyDetails?.maritalStatus === "Married";

  // Children state initialized from account details
  const [children, setChildren] = useState<FamilyChild[]>(() => {
    return familyDetails?.children && familyDetails.children.length > 0
      ? familyDetails.children
      : [];
  });

  // Sync children from account changes if not manually editing
  useEffect(() => {
    if (familyDetails?.children && familyDetails.children.length > 0) {
      setChildren(familyDetails.children);
    }
  }, [familyDetails?.children]);

  // Derived Sons and Daughters
  const sonsList = useMemo(() => children.filter((c) => c.gender === "Son"), [children]);
  const daughtersList = useMemo(() => children.filter((c) => c.gender === "Daughter"), [children]);

  const sonsCount = sonsList.length;
  const daughtersCount = daughtersList.length;

  // Stepper handler for child quantities
  const handleUpdateChildCount = (gender: "Son" | "Daughter", delta: number) => {
    setChildren((prev) => {
      const currentOfGender = prev.filter((c) => c.gender === gender);
      const otherGender = prev.filter((c) => c.gender !== gender);

      if (delta > 0) {
        // Add new child
        const newChild: FamilyChild = {
          id: `child-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: `${gender} ${currentOfGender.length + 1}`,
          gender,
          age: "",
          dob: "",
          aadhaar: ""
        };
        const updated = [...prev, newChild];
        // Automatically switch to the newly created child tab
        const newChildIndex = currentOfGender.length;
        setSelectedMemberId(`${gender.toLowerCase()}-${newChildIndex}`);

        // Persist to account
        if (currentAccount) {
          updateAccount(currentAccount.id, {
            familyDetails: {
              ...(familyDetails || {
                maritalStatus: isMarried ? "Married" : "Single",
                brothers: [],
                sisters: [],
                children: []
              }),
              children: updated
            }
          });
        }
        return updated;
      } else {
        // Remove last child of this gender if any exist
        if (currentOfGender.length === 0) return prev;
        const keptOfGender = currentOfGender.slice(0, currentOfGender.length - 1);
        const updated = [...otherGender, ...keptOfGender];

        // Reset selected member if deleted child was selected
        const removedIndex = currentOfGender.length - 1;
        if (selectedMemberId === `${gender.toLowerCase()}-${removedIndex}`) {
          setSelectedMemberId("self");
        }

        // Persist to account
        if (currentAccount) {
          updateAccount(currentAccount.id, {
            familyDetails: {
              ...(familyDetails || {
                maritalStatus: isMarried ? "Married" : "Single",
                brothers: [],
                sisters: [],
                children: []
              }),
              children: updated
            }
          });
        }
        return updated;
      }
    });
  };

  // Update specific child details in sub-form
  const handleUpdateChildField = (
    childId: string,
    field: keyof FamilyChild,
    value: string
  ) => {
    setChildren((prev) =>
      prev.map((c) => (c.id === childId ? { ...c, [field]: value } : c))
    );
  };

  const handleSaveChildDetails = (childId: string) => {
    if (!currentAccount) return;
    const targetChild = children.find((c) => c.id === childId);
    if (!targetChild) return;

    updateAccount(currentAccount.id, {
      familyDetails: {
        ...(familyDetails || {
          maritalStatus: isMarried ? "Married" : "Single",
          brothers: [],
          sisters: [],
          children: []
        }),
        children
      }
    });

    logUserActivity(
      "Updated Child Profile",
      `Saved details for ${targetChild.gender}: ${targetChild.name || "Unnamed"}`,
      currentAccount.email
    );

    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 2000);
  };

  // Helper: check if a docKey belongs to a member
  const isDocForMember = (docKey: string, memberId: string): boolean => {
    if (memberId === "self") {
      return (
        !docKey.startsWith("[Father]") &&
        !docKey.startsWith("[Mother]") &&
        !docKey.startsWith("[Spouse]") &&
        !docKey.startsWith("[Wife]") &&
        !docKey.startsWith("[Son") &&
        !docKey.startsWith("[Daughter")
      );
    }
    if (memberId === "father") {
      return docKey.includes("[Father]");
    }
    if (memberId === "mother") {
      return docKey.includes("[Mother]");
    }
    if (memberId === "spouse") {
      return docKey.includes("[Spouse]") || docKey.includes("[Wife]");
    }
    if (memberId.startsWith("son-")) {
      const idx = parseInt(memberId.split("-")[1], 10) + 1;
      return docKey.includes(`[Son ${idx}]`);
    }
    if (memberId.startsWith("daughter-")) {
      const idx = parseInt(memberId.split("-")[1], 10) + 1;
      return docKey.includes(`[Daughter ${idx}]`);
    }
    return true;
  };

  // Scoped documents for the active family member
  const memberScopedDocs = useMemo(() => {
    const res: Record<string, UploadedFileMeta> = {};
    Object.entries(uploadedDocs).forEach(([k, v]) => {
      if (isDocForMember(k, selectedMemberId)) {
        res[k] = v;
      }
    });
    return res;
  }, [uploadedDocs, selectedMemberId]);

  const memberUploadedCount = Object.keys(memberScopedDocs).length;
  const memberUploadedList = Object.entries(memberScopedDocs);

  // Active member details for header & badges
  const activeMemberInfo = useMemo(() => {
    if (selectedMemberId === "self") {
      return {
        label: t("docs.self") || "You (Self)",
        name: user?.name || "Primary Citizen",
        icon: "👤",
        prefix: "[Self]",
        relation: "Account Holder"
      };
    }
    if (selectedMemberId === "father") {
      return {
        label: t("docs.father") || "Father",
        name: familyDetails?.fatherName || "Father Details",
        icon: "👨",
        prefix: "[Father]",
        relation: "Father"
      };
    }
    if (selectedMemberId === "mother") {
      return {
        label: t("docs.mother") || "Mother",
        name: familyDetails?.motherName || "Mother Details",
        icon: "👩",
        prefix: "[Mother]",
        relation: "Mother"
      };
    }
    if (selectedMemberId === "spouse") {
      return {
        label: t("docs.spouse") || "Wife / Spouse",
        name: familyDetails?.spouseName || "Spouse Details",
        icon: "💍",
        prefix: "[Spouse]",
        relation: "Spouse"
      };
    }
    if (selectedMemberId.startsWith("son-")) {
      const idx = parseInt(selectedMemberId.split("-")[1], 10);
      const child = sonsList[idx];
      return {
        label: `Son ${idx + 1}`,
        name: child?.name || `Son ${idx + 1}`,
        icon: "👦",
        prefix: `[Son ${idx + 1}]`,
        relation: "Son",
        child,
        childIndex: idx,
        gender: "Son" as const
      };
    }
    if (selectedMemberId.startsWith("daughter-")) {
      const idx = parseInt(selectedMemberId.split("-")[1], 10);
      const child = daughtersList[idx];
      return {
        label: `Daughter ${idx + 1}`,
        name: child?.name || `Daughter ${idx + 1}`,
        icon: "👧",
        prefix: `[Daughter ${idx + 1}]`,
        relation: "Daughter",
        child,
        childIndex: idx,
        gender: "Daughter" as const
      };
    }
    return {
      label: "You (Self)",
      name: user?.name || "Primary Citizen",
      icon: "👤",
      prefix: "[Self]",
      relation: "Account Holder"
    };
  }, [selectedMemberId, familyDetails, user, sonsList, daughtersList, t]);

  // Predefined upload slots for specific family members
  const memberSlots: MemberDocSlot[] = useMemo(() => {
    if (selectedMemberId === "father") {
      return [
        {
          label: "Father's Aadhaar Card",
          docKey: "[Father] Aadhaar Card",
          description: "Front & back copy of Father's 12-digit Aadhaar Card",
          required: true
        },
        {
          label: "Father's PAN Card",
          docKey: "[Father] PAN Card",
          description: "Permanent Account Number card issued by Income Tax Dept"
        },
        {
          label: "Senior Citizen / Voter ID",
          docKey: "[Father] Senior Citizen or Voter ID",
          description: "Official Election Photo ID Card or Senior Citizen ID"
        },
        {
          label: "Pension / Income Certificate",
          docKey: "[Father] Pension or Income Certificate",
          description: "Latest pension payment order or certified income slip"
        }
      ];
    }
    if (selectedMemberId === "mother") {
      return [
        {
          label: "Mother's Aadhaar Card",
          docKey: "[Mother] Aadhaar Card",
          description: "Front & back copy of Mother's 12-digit Aadhaar Card",
          required: true
        },
        {
          label: "Food Security / Ration Card",
          docKey: "[Mother] Ration Card",
          description: "National Food Security Card or Telangana FSC booklet"
        },
        {
          label: "Mother's Voter ID",
          docKey: "[Mother] Voter ID",
          description: "Election Photo Identity Card (EPIC) copy"
        },
        {
          label: "Bank Passbook / SHG Document",
          docKey: "[Mother] Bank Passbook or SHG",
          description: "Bank account passbook front page or Self Help Group record"
        }
      ];
    }
    if (selectedMemberId === "spouse") {
      return [
        {
          label: "Spouse's Aadhaar Card",
          docKey: "[Spouse] Aadhaar Card",
          description: "Official 12-digit Aadhaar card of spouse",
          required: true
        },
        {
          label: "Marriage Registration Certificate",
          docKey: "[Spouse] Marriage Certificate",
          description: "Official Registration of Marriage under Hindu/Special Marriage Act",
          required: true
        },
        {
          label: "Spouse's PAN Card",
          docKey: "[Spouse] PAN Card",
          description: "Permanent Account Number card"
        },
        {
          label: "Spouse's Voter ID",
          docKey: "[Spouse] Voter ID",
          description: "Election Photo ID card or Passport"
        }
      ];
    }
    if (selectedMemberId.startsWith("son-") || selectedMemberId.startsWith("daughter-")) {
      const pfx = activeMemberInfo.prefix;
      return [
        {
          label: "Birth Certificate",
          docKey: `${pfx} Birth Certificate`,
          description: "Official Municipal Corporation / Gram Panchayat birth certificate",
          required: true
        },
        {
          label: "Child Aadhaar / Enrolment Slip",
          docKey: `${pfx} Aadhaar Card`,
          description: "Baal Aadhaar card (Blue) or official enrolment acknowledgement",
          required: true
        },
        {
          label: "School Bonafide / Study Certificate",
          docKey: `${pfx} School Bonafide Certificate`,
          description: "Institutional bonafide, study, or conduct certificate from school"
        },
        {
          label: "Immunization / Child Health Record",
          docKey: `${pfx} Immunization Record`,
          description: "Maternal & Child Health (MCH) immunization record book"
        },
        {
          label: "Passport Size Photograph",
          docKey: `${pfx} Passport Photo`,
          description: "Recent color passport photograph of child on white background"
        }
      ];
    }
    return [];
  }, [selectedMemberId, activeMemberInfo.prefix]);

  // If a category view is selected in Tab 2
  if (activeCategory) {
    const categoryUploadedCount = activeCategory.items.filter((item) => memberScopedDocs[item]).length;

    return (
      <div className="w-full max-w-5xl mx-auto px-4 py-8 animate-in fade-in duration-300">
        {/* Category Header */}
        <div className="relative flex flex-col items-center text-center mb-8">
          <button
            onClick={() => setActiveCategory(null)}
            className="md:absolute left-0 top-1/2 md:-translate-y-1/2 mb-4 md:mb-0 px-4 py-2 rounded-full bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors flex items-center gap-1.5 cursor-pointer backdrop-blur-md shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t("docs.back_to_categories")}</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{activeCategory.icon}</span>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#000080] dark:text-white">
              {activeCategory.name}
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1">
            {t("docs.showing_records_for") || "Viewing records for"}:{" "}
            <span className="font-semibold text-[#000080] dark:text-blue-300">
              {activeMemberInfo.icon} {activeMemberInfo.name} ({activeMemberInfo.label})
            </span>
          </p>
        </div>

        {/* Category Empty State Notice if none uploaded */}
        {categoryUploadedCount === 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-[#FFF8E1] dark:bg-amber-950/20 border border-[#FFE082] dark:border-amber-900/40 text-center text-xs text-slate-700 dark:text-slate-300">
            No documents uploaded yet for <strong>{activeMemberInfo.name}</strong> in this category. Click <strong>Upload</strong> on any document below to store it securely in their vault.
          </div>
        )}

        {/* Documents list grid - Interactive Clickable Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeCategory.items.map((rawDocName) => {
            const scopedKey =
              selectedMemberId === "self"
                ? rawDocName
                : `${activeMemberInfo.prefix} ${rawDocName}`;

            const isUploaded = memberScopedDocs[scopedKey] || uploadedDocs[scopedKey];

            return (
              <div
                key={rawDocName}
                onClick={() => {
                  if (isUploaded) setPreviewDoc(isUploaded);
                }}
                className={`p-4 rounded-2xl border transition-all backdrop-blur-md shadow-sm flex flex-col justify-between ${
                  isUploaded
                    ? "bg-white dark:bg-slate-900/80 border-[#C8E6C9] hover:border-[#138808] hover:shadow-md cursor-pointer group"
                    : "bg-white/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm transition-transform group-hover:scale-105 ${
                        isUploaded
                          ? "bg-[#E8F5E9] text-[#138808] border border-[#C8E6C9]"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {rawDocName}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">
                        {isUploaded ? isUploaded.name : `${activeMemberInfo.label} Document`}
                      </p>
                    </div>
                  </div>

                  {isUploaded && (
                    <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5E9] text-[#138808] border border-[#C8E6C9] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {t("upload.attached") || "Attached"}
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  {isUploaded ? (
                    <>
                      <span className="text-[11px] font-semibold text-[#000080] dark:text-blue-300 group-hover:underline flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        Click Card to Inspect & Actions
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeDocument(scopedKey);
                        }}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/15 transition-colors cursor-pointer"
                        title="Remove Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <div className="w-full">
                      <FileUploadBox
                        label={rawDocName}
                        currentFile={null}
                        onConfirmUpload={(file) => {
                          uploadDocument(scopedKey, file);
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Main Documents Page View
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 animate-in fade-in duration-300 space-y-8">
      {/* Title */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFF3E0] dark:bg-amber-950/20 border border-[#FFE082] text-[#E65100] text-xs font-bold mb-3">
          <Shield className="w-3.5 h-3.5" />
          <span>{t("docs.badge")}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#000080] dark:text-white mb-2">
          Document Management & Family Digital Vault
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Secure, isolated digital document repository for your entire household. Select any family member to review, upload, and manage verified records independently.
        </p>

        {/* Account Info Pill */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8EEF5] dark:bg-blue-950/40 border border-[#BBDEFB] text-xs text-[#000080] dark:text-blue-300 font-medium">
            <span>{t("docs.account")}: <strong>{user?.email || "Current Citizen"}</strong></span>
            <span>•</span>
            <span className="font-semibold text-[#138808]">
              {memberUploadedCount > 0
                ? `${memberUploadedCount} Files for ${activeMemberInfo.label}`
                : `0 Files for ${activeMemberInfo.label}`}
            </span>
          </div>

          {isAuthorized ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E8F5E9] text-[#138808] border border-[#C8E6C9] text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Privileged Mode: Full Download, Print & Share Unlocked</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-medium">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Citizen View-Only Mode</span>
            </div>
          )}
        </div>
      </div>

      {/* 1. DOCUMENT FAMILY VIEW & MEMBER SELECTION PANEL */}
      <section className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-xl backdrop-blur-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-[#000080] dark:text-blue-400 font-bold text-base">
              <Users className="w-5 h-5 text-[#FF9933]" />
              <span>{t("docs.family_panel_title") || "Family Member Document Selection Panel"}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t("docs.family_panel_desc") ||
                "Select a family member to instantly scope and filter the document vault to their records."}
            </p>
          </div>

          {/* Active Member Focus Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[#E8F5E9] dark:bg-emerald-950/40 text-[#138808] dark:text-emerald-300 border border-[#C8E6C9] text-xs font-bold shrink-0 self-start sm:self-auto">
            <span>{activeMemberInfo.icon}</span>
            <span>Active: {activeMemberInfo.label}</span>
          </div>
        </div>

        {/* Member Selection Buttons Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {/* 1. You (Self) */}
          <button
            type="button"
            onClick={() => setSelectedMemberId("self")}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              selectedMemberId === "self"
                ? "bg-[#000080] text-white border-[#000080] shadow-md shadow-[#000080]/30 scale-[1.02]"
                : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              {(currentAccount?.avatar || user?.avatar) ? (
                <img
                  src={currentAccount?.avatar || user?.avatar}
                  alt="You"
                  className="w-7 h-7 rounded-full object-cover border-2 border-[#FF9933]/80 shadow-xs"
                />
              ) : (
                <span className="text-xl">👤</span>
              )}
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  selectedMemberId === "self"
                    ? "bg-white/20 text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                }`}
              >
                {Object.keys(uploadedDocs).filter((k) => isDocForMember(k, "self")).length}
              </span>
            </div>
            <div>
              <span className="text-xs font-bold block">{t("docs.self") || "You (Self)"}</span>
              <span
                className={`text-[10px] block truncate ${
                  selectedMemberId === "self" ? "text-blue-100" : "text-slate-400"
                }`}
              >
                {user?.name || "Account Owner"}
              </span>
            </div>
          </button>

          {/* 2. Father */}
          <button
            type="button"
            onClick={() => setSelectedMemberId("father")}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              selectedMemberId === "father"
                ? "bg-[#000080] text-white border-[#000080] shadow-md shadow-[#000080]/30 scale-[1.02]"
                : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xl">👨</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  selectedMemberId === "father"
                    ? "bg-white/20 text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                }`}
              >
                {Object.keys(uploadedDocs).filter((k) => isDocForMember(k, "father")).length}
              </span>
            </div>
            <div>
              <span className="text-xs font-bold block">{t("docs.father") || "Father"}</span>
              <span
                className={`text-[10px] block truncate ${
                  selectedMemberId === "father" ? "text-blue-100" : "text-slate-400"
                }`}
              >
                {familyDetails?.fatherName || "Father"}
              </span>
            </div>
          </button>

          {/* 3. Mother */}
          <button
            type="button"
            onClick={() => setSelectedMemberId("mother")}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              selectedMemberId === "mother"
                ? "bg-[#000080] text-white border-[#000080] shadow-md shadow-[#000080]/30 scale-[1.02]"
                : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xl">👩</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  selectedMemberId === "mother"
                    ? "bg-white/20 text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                }`}
              >
                {Object.keys(uploadedDocs).filter((k) => isDocForMember(k, "mother")).length}
              </span>
            </div>
            <div>
              <span className="text-xs font-bold block">{t("docs.mother") || "Mother"}</span>
              <span
                className={`text-[10px] block truncate ${
                  selectedMemberId === "mother" ? "text-blue-100" : "text-slate-400"
                }`}
              >
                {familyDetails?.motherName || "Mother"}
              </span>
            </div>
          </button>

          {/* 4. Wife / Spouse (Conditionally Revealed if Marital Status is Married) */}
          {isMarried && (
            <button
              type="button"
              onClick={() => setSelectedMemberId("spouse")}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                selectedMemberId === "spouse"
                  ? "bg-[#000080] text-white border-[#000080] shadow-md shadow-[#000080]/30 scale-[1.02]"
                  : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xl">💍</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    selectedMemberId === "spouse"
                      ? "bg-white/20 text-white"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {Object.keys(uploadedDocs).filter((k) => isDocForMember(k, "spouse")).length}
                </span>
              </div>
              <div>
                <span className="text-xs font-bold block">{t("docs.spouse") || "Wife / Spouse"}</span>
                <span
                  className={`text-[10px] block truncate ${
                    selectedMemberId === "spouse" ? "text-blue-100" : "text-slate-400"
                  }`}
                >
                  {familyDetails?.spouseName || "Spouse"}
                </span>
              </div>
            </button>
          )}

          {/* 5. Sons with Interactive Stepper (+ / -) */}
          <div
            onClick={() => {
              if (sonsCount > 0) setSelectedMemberId("son-0");
            }}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              selectedMemberId.startsWith("son-")
                ? "bg-[#000080] text-white border-[#000080] shadow-md shadow-[#000080]/30 scale-[1.02]"
                : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xl">👦</span>

              {/* Quantity Stepper (+ / -) */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 bg-white/20 dark:bg-slate-700/80 rounded-lg p-0.5 border border-slate-300/40"
              >
                <button
                  type="button"
                  onClick={() => handleUpdateChildCount("Son", -1)}
                  disabled={sonsCount === 0}
                  className="w-5 h-5 flex items-center justify-center rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  title="Decrease Son Count"
                >
                  -
                </button>
                <span className="w-4 text-center font-bold text-xs">{sonsCount}</span>
                <button
                  type="button"
                  onClick={() => handleUpdateChildCount("Son", 1)}
                  className="w-5 h-5 flex items-center justify-center rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                  title="Add Son"
                >
                  +
                </button>
              </div>
            </div>
            <div>
              <span className="text-xs font-bold block">{t("docs.sons") || "Sons"}</span>
              <span
                className={`text-[10px] block truncate ${
                  selectedMemberId.startsWith("son-") ? "text-blue-100" : "text-slate-400"
                }`}
              >
                {sonsCount > 0 ? `${sonsCount} Son${sonsCount > 1 ? "s" : ""}` : "Click + to Add"}
              </span>
            </div>
          </div>

          {/* 6. Daughters with Interactive Stepper (+ / -) */}
          <div
            onClick={() => {
              if (daughtersCount > 0) setSelectedMemberId("daughter-0");
            }}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              selectedMemberId.startsWith("daughter-")
                ? "bg-[#000080] text-white border-[#000080] shadow-md shadow-[#000080]/30 scale-[1.02]"
                : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xl">👧</span>

              {/* Quantity Stepper (+ / -) */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 bg-white/20 dark:bg-slate-700/80 rounded-lg p-0.5 border border-slate-300/40"
              >
                <button
                  type="button"
                  onClick={() => handleUpdateChildCount("Daughter", -1)}
                  disabled={daughtersCount === 0}
                  className="w-5 h-5 flex items-center justify-center rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  title="Decrease Daughter Count"
                >
                  -
                </button>
                <span className="w-4 text-center font-bold text-xs">{daughtersCount}</span>
                <button
                  type="button"
                  onClick={() => handleUpdateChildCount("Daughter", 1)}
                  className="w-5 h-5 flex items-center justify-center rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                  title="Add Daughter"
                >
                  +
                </button>
              </div>
            </div>
            <div>
              <span className="text-xs font-bold block">{t("docs.daughters") || "Daughters"}</span>
              <span
                className={`text-[10px] block truncate ${
                  selectedMemberId.startsWith("daughter-") ? "text-blue-100" : "text-slate-400"
                }`}
              >
                {daughtersCount > 0
                  ? `${daughtersCount} Daughter${daughtersCount > 1 ? "s" : ""}`
                  : "Click + to Add"}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Individual Child Sub-Pills (When Sons or Daughters > 0) */}
        {(sonsCount > 0 || daughtersCount > 0) && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1">
              <Baby className="w-3.5 h-3.5 text-[#FF9933]" />
              Select Individual Child:
            </span>

            {/* Individual Sons */}
            {sonsList.map((son, idx) => {
              const tabId = `son-${idx}`;
              const isSelected = selectedMemberId === tabId;
              const sonDocCount = Object.keys(uploadedDocs).filter((k) =>
                isDocForMember(k, tabId)
              ).length;

              return (
                <button
                  key={son.id || idx}
                  type="button"
                  onClick={() => setSelectedMemberId(tabId)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-[#FF9933] text-white shadow-md shadow-[#FF9933]/30 scale-105"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <span>👦</span>
                  <span>{son.name || `Son ${idx + 1}`}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isSelected ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600"
                    }`}
                  >
                    {sonDocCount}
                  </span>
                </button>
              );
            })}

            {/* Individual Daughters */}
            {daughtersList.map((daughter, idx) => {
              const tabId = `daughter-${idx}`;
              const isSelected = selectedMemberId === tabId;
              const dauDocCount = Object.keys(uploadedDocs).filter((k) =>
                isDocForMember(k, tabId)
              ).length;

              return (
                <button
                  key={daughter.id || idx}
                  type="button"
                  onClick={() => setSelectedMemberId(tabId)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-[#FF9933] text-white shadow-md shadow-[#FF9933]/30 scale-105"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <span>👧</span>
                  <span>{daughter.name || `Daughter ${idx + 1}`}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isSelected ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600"
                    }`}
                  >
                    {dauDocCount}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* 2. DYNAMIC SUB-FORM & MEMBER DEDICATED SLOTS */}
      {selectedMemberId !== "self" && (
        <section className="p-6 rounded-3xl bg-gradient-to-br from-white via-slate-50/50 to-blue-50/20 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-950 border border-slate-200/90 dark:border-slate-800 shadow-xl space-y-6">
          {/* Header of member section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-lg font-bold text-[#000080] dark:text-white">
                <span className="text-2xl">{activeMemberInfo.icon}</span>
                <span>{activeMemberInfo.label} — Profile & Dedicated Document Slots</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Upload and inspect individual statutory certificates attached strictly for{" "}
                <strong>{activeMemberInfo.name}</strong>.
              </p>
            </div>

            {saveSuccessNotice && (
              <div className="px-3.5 py-1.5 rounded-full bg-[#E8F5E9] text-[#138808] border border-[#C8E6C9] text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
                <Check className="w-3.5 h-3.5" />
                <span>Profile details saved!</span>
              </div>
            )}
          </div>

          {/* If the active member is a Son or Daughter: Render Child Profile Sub-Form */}
          {(selectedMemberId.startsWith("son-") || selectedMemberId.startsWith("daughter-")) &&
            activeMemberInfo.child && (
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Baby className="w-4 h-4 text-[#FF9933]" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {activeMemberInfo.gender} Details & Form Fields
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    ID: {activeMemberInfo.child.id || `child-${activeMemberInfo.childIndex}`}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {/* Child Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {activeMemberInfo.gender} Full Name
                    </label>
                    <input
                      type="text"
                      value={activeMemberInfo.child.name || ""}
                      onChange={(e) =>
                        handleUpdateChildField(
                          activeMemberInfo.child!.id!,
                          "name",
                          e.target.value
                        )
                      }
                      placeholder={`e.g. Master / Miss ${activeMemberInfo.gender}`}
                      className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#000080]/30"
                    />
                  </div>

                  {/* Date of Birth / Age */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Date of Birth / Age
                    </label>
                    <input
                      type="text"
                      value={activeMemberInfo.child.age || activeMemberInfo.child.dob || ""}
                      onChange={(e) =>
                        handleUpdateChildField(
                          activeMemberInfo.child!.id!,
                          "age",
                          e.target.value
                        )
                      }
                      placeholder="e.g. 15/08/2018 or 8 Years"
                      className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#000080]/30"
                    />
                  </div>

                  {/* Aadhaar Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Child Aadhaar / Enrolment No.
                    </label>
                    <input
                      type="text"
                      maxLength={14}
                      value={activeMemberInfo.child.aadhaar || ""}
                      onChange={(e) =>
                        handleUpdateChildField(
                          activeMemberInfo.child!.id!,
                          "aadhaar",
                          formatAadhaarNumber(e.target.value).formatted
                        )
                      }
                      placeholder="XXXX XXXX XXXX"
                      className="w-full px-3.5 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#000080]/30"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => handleSaveChildDetails(activeMemberInfo.child!.id!)}
                    className="px-4 py-2 rounded-xl bg-[#000080] hover:bg-[#000066] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save {activeMemberInfo.label} Information</span>
                  </button>
                </div>
              </div>
            )}

          {/* Dedicated File Upload Slots using FileUploadBox (with Confirmation modal + OK + Green Attached state) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Required & Statutory Document Slots ({memberSlots.length})
              </h3>
              <span className="text-[11px] text-[#138808] font-bold">
                {
                  memberSlots.filter(
                    (slot) => memberScopedDocs[slot.docKey] || uploadedDocs[slot.docKey]
                  ).length
                }{" "}
                of {memberSlots.length} Attached
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {memberSlots.map((slot) => {
                const currentDoc = memberScopedDocs[slot.docKey] || uploadedDocs[slot.docKey] || null;

                return (
                  <div
                    key={slot.docKey}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{slot.label}</span>
                          {slot.required && <span className="text-rose-500 font-bold">*</span>}
                        </h4>
                        {currentDoc && (
                          <button
                            type="button"
                            onClick={() => setPreviewDoc(currentDoc)}
                            className="text-[#000080] dark:text-blue-300 hover:underline text-[11px] font-semibold flex items-center gap-1 shrink-0"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        {slot.description}
                      </p>
                    </div>

                    {/* Standalone Reusable FileUploadBox */}
                    <div>
                      <FileUploadBox
                        label={slot.label}
                        required={slot.required}
                        currentFile={currentDoc}
                        onConfirmUpload={(file) => {
                          uploadDocument(slot.docKey, file);
                        }}
                        onRemove={() => {
                          removeDocument(slot.docKey);
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Switcher Tabs */}
      <div className="flex items-center justify-center">
        <div className="p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-2">
          <button
            onClick={() => setActiveTab("vault")}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "vault"
                ? "bg-[#000080] text-white shadow-md shadow-[#000080]/20"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>
              Interactive Document Cards ({memberUploadedCount})
            </span>
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "categories"
                ? "bg-[#FF9933] text-white shadow-md shadow-[#FF9933]/20"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Statutory Categories ({DOCUMENT_CATEGORIES.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Interactive Document Cards Vault (Filtered Strictly for Active Member) */}
      {activeTab === "vault" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
              Vault Contents for:{" "}
              <strong className="text-[#000080] dark:text-blue-300">
                {activeMemberInfo.icon} {activeMemberInfo.name} ({activeMemberInfo.label})
              </strong>
            </span>
            <span className="text-xs font-mono text-slate-500">
              {memberUploadedCount} {memberUploadedCount === 1 ? "document" : "documents"} attached
            </span>
          </div>

          {memberUploadedCount === 0 ? (
            <div className="p-10 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-[#FFF3E0] text-[#FF9933] flex items-center justify-center mx-auto text-2xl shadow-inner">
                📂
              </div>
              <h3 className="text-base font-bold text-[#000080] dark:text-white">
                No Documents in Digital Vault for {activeMemberInfo.label}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Use the dedicated slots above or switch to the Statutory Categories tab to attach Aadhaar, certificates, or marksheets for {activeMemberInfo.name}.
              </p>
              <button
                onClick={() => setActiveTab("categories")}
                className="px-5 py-2.5 rounded-xl bg-[#FF9933] hover:bg-[#FF6F00] text-white text-xs font-bold cursor-pointer transition-colors shadow-sm"
              >
                Browse Document Categories
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {memberUploadedList.map(([docName, docMeta]) => (
                <div
                  key={docName}
                  onClick={() => setPreviewDoc(docMeta)}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 hover:border-[#000080] dark:border-slate-800 dark:hover:border-blue-500 transition-all duration-200 transform hover:-translate-y-1 shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-[#FFF3E0] text-[#E65100] border border-[#FFE082] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5E9] text-[#138808] border border-[#C8E6C9] flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Verified
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#000080] dark:group-hover:text-blue-300 transition-colors truncate">
                        {docMeta.docName || docName}
                      </h4>
                      <p className="text-xs text-slate-500 font-mono truncate">{docMeta.name}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Size</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{docMeta.size}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Type</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {docMeta.type.split("/")[1]?.toUpperCase() || "PDF"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs font-bold text-[#000080] dark:text-blue-300 flex items-center gap-1.5 group-hover:underline">
                      <Eye className="w-3.5 h-3.5" />
                      Open Viewer & Actions
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeDocument(docName);
                        }}
                        className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center gap-1 text-[#138808]">
                        {isAuthorized ? (
                          <>
                            <span title="Download"><Download className="w-3.5 h-3.5" /></span>
                            <span title="Print"><Printer className="w-3.5 h-3.5" /></span>
                            <span title="Share"><Share2 className="w-3.5 h-3.5" /></span>
                          </>
                        ) : (
                          <span title="Actions Restricted"><Lock className="w-3.5 h-3.5 text-slate-400" /></span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: 6 Statutory Categories Grid */}
      {activeTab === "categories" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {DOCUMENT_CATEGORIES.map((cat) => {
            const uploadedCount = cat.items.filter((item) => {
              const scopedKey =
                selectedMemberId === "self"
                  ? item
                  : `${activeMemberInfo.prefix} ${item}`;
              return Boolean(memberScopedDocs[scopedKey] || uploadedDocs[scopedKey]);
            }).length;

            return (
              <div
                key={cat.name}
                onClick={() => setActiveCategory(cat)}
                className="group p-5 rounded-2xl bg-white dark:bg-slate-900/70 hover:bg-slate-50/90 dark:hover:bg-slate-800/80 border border-slate-200/90 dark:border-slate-800 hover:border-[#000080] backdrop-blur-md transition-all duration-200 transform hover:-translate-y-1 cursor-pointer flex items-center justify-between shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl p-2.5 rounded-xl bg-slate-100 border border-slate-200 dark:bg-slate-800/60 dark:border-slate-700/50 group-hover:scale-110 transition-transform">
                    {cat.icon}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-[#000080] dark:group-hover:text-blue-300 transition-colors">
                      {cat.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {cat.items.length} {t("nav.documents")}
                      </span>
                      {uploadedCount > 0 ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#138808] border border-[#C8E6C9]">
                          {uploadedCount} Attached for {activeMemberInfo.label}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">{t("docs.empty")}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-400 group-hover:text-[#000080] dark:group-hover:text-white transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
