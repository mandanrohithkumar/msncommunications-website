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
  CreditCard,
  ChevronDown,
  ChevronUp,
  Tag
} from "lucide-react";

export type FamilyMemberType = "self" | "father" | "mother" | "spouse" | "wife" | "husband" | "son" | "daughter" | "custom-other";

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
  const [isOtherExpanded, setIsOtherExpanded] = useState<boolean>(false);
  const [customRelationName, setCustomRelationName] = useState<string>("");
  const [customMemberFullName, setCustomMemberFullName] = useState<string>("");
  const [customMemberAge, setCustomMemberAge] = useState<string>("");
  const [customPresetCategory, setCustomPresetCategory] = useState<"all" | "siblings" | "elders" | "inlaws" | "guardians">("all");
  const [savedCustomMembers, setSavedCustomMembers] = useState<Array<{ id: string; relation: string; name?: string; age?: string }>>([
    { id: "custom-brother", relation: "Brother", name: "" },
    { id: "custom-grandfather", relation: "Grandfather", name: "" }
  ]);
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
        !docKey.startsWith("[Husband]") &&
        !docKey.startsWith("[Son") &&
        !docKey.startsWith("[Daughter") &&
        !docKey.startsWith("[Other") &&
        !(Boolean(customRelationName) && docKey.startsWith(`[${customRelationName}`))
      );
    }
    if (memberId === "father") {
      return docKey.includes("[Father]");
    }
    if (memberId === "mother") {
      return docKey.includes("[Mother]");
    }
    if (memberId === "wife" || memberId === "spouse") {
      return docKey.includes("[Wife]") || docKey.includes("[Spouse]");
    }
    if (memberId === "husband") {
      return docKey.includes("[Husband]");
    }
    if (memberId === "sons" || memberId.startsWith("son-")) {
      if (memberId === "sons") return docKey.includes("[Son");
      const idx = parseInt(memberId.split("-")[1], 10) + 1;
      return docKey.includes(`[Son ${idx}]`) || docKey.includes("[Son");
    }
    if (memberId === "daughters" || memberId.startsWith("daughter-")) {
      if (memberId === "daughters") return docKey.includes("[Daughter");
      const idx = parseInt(memberId.split("-")[1], 10) + 1;
      return docKey.includes(`[Daughter ${idx}]`) || docKey.includes("[Daughter");
    }
    if (memberId === "custom-other") {
      const rel = customRelationName.trim();
      if (Boolean(rel)) {
        return docKey.includes(`[${rel}]`) || docKey.includes("[Other]");
      }
      return (
        docKey.includes("[Other]") ||
        savedCustomMembers.some((m) => docKey.includes(`[${m.relation}]`))
      );
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
    if (selectedMemberId === "wife" || selectedMemberId === "spouse") {
      return {
        label: "Wife",
        name: familyDetails?.spouseName || "Wife Details",
        icon: "👰",
        prefix: "[Wife]",
        relation: "Wife"
      };
    }
    if (selectedMemberId === "husband") {
      return {
        label: "Husband",
        name: familyDetails?.spouseName || "Husband Details",
        icon: "🤵",
        prefix: "[Husband]",
        relation: "Husband"
      };
    }
    if (selectedMemberId === "sons" || selectedMemberId.startsWith("son-")) {
      const idx = selectedMemberId.startsWith("son-")
        ? parseInt(selectedMemberId.split("-")[1], 10)
        : 0;
      const child = sonsList[idx] || (sonsCount > 0 ? sonsList[0] : undefined);
      return {
        label: sonsCount > 1 ? `Son ${idx + 1}` : "Son",
        name: child?.name || `Son ${idx + 1}`,
        icon: "👦",
        prefix: `[Son ${idx + 1}]`,
        relation: "Son",
        child,
        childIndex: idx,
        gender: "Son" as const
      };
    }
    if (selectedMemberId === "daughters" || selectedMemberId.startsWith("daughter-")) {
      const idx = selectedMemberId.startsWith("daughter-")
        ? parseInt(selectedMemberId.split("-")[1], 10)
        : 0;
      const child = daughtersList[idx] || (daughtersCount > 0 ? daughtersList[0] : undefined);
      return {
        label: daughtersCount > 1 ? `Daughter ${idx + 1}` : "Daughter",
        name: child?.name || `Daughter ${idx + 1}`,
        icon: "👧",
        prefix: `[Daughter ${idx + 1}]`,
        relation: "Daughter",
        child,
        childIndex: idx,
        gender: "Daughter" as const
      };
    }
    if (selectedMemberId === "custom-other") {
      const rel = customRelationName.trim() || "Other Member";
      const full = customMemberFullName.trim();
      const displayName = full ? `${full} (${rel})` : rel;
      return {
        label: rel,
        name: displayName,
        icon: "🏷️",
        prefix: `[${rel}]`,
        relation: rel
      };
    }
    return {
      label: "You (Self)",
      name: user?.name || "Primary Citizen",
      icon: "👤",
      prefix: "[Self]",
      relation: "Account Holder"
    };
  }, [selectedMemberId, familyDetails, user, sonsList, daughtersList, customRelationName, sonsCount, daughtersCount, t]);

  // Helper to find an uploaded document with robust key & prefix matching
  const findMemberDoc = React.useCallback(
    (rawKey: string): UploadedFileMeta | null => {
      const scopedKey =
        selectedMemberId === "self"
          ? rawKey
          : `${activeMemberInfo.prefix} ${rawKey}`;

      if (memberScopedDocs[scopedKey]) return memberScopedDocs[scopedKey];
      if (uploadedDocs[scopedKey]) return uploadedDocs[scopedKey];
      if (uploadedDocs[rawKey]) return uploadedDocs[rawKey];
      if (memberScopedDocs[rawKey]) return memberScopedDocs[rawKey];

      const lowerScoped = scopedKey.toLowerCase().trim();
      const lowerRaw = rawKey.toLowerCase().trim();

      const memberMatch = Object.entries(memberScopedDocs).find(([k]) => {
        const kl = k.toLowerCase().trim();
        return kl === lowerScoped || kl === lowerRaw;
      });
      if (memberMatch) return memberMatch[1];

      const uploadedMatch = Object.entries(uploadedDocs).find(([k]) => {
        const kl = k.toLowerCase().trim();
        return kl === lowerScoped || kl === lowerRaw;
      });
      if (uploadedMatch) return uploadedMatch[1];

      return null;
    },
    [memberScopedDocs, uploadedDocs, selectedMemberId, activeMemberInfo.prefix]
  );

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
    if (selectedMemberId === "wife" || selectedMemberId === "spouse") {
      return [
        {
          label: "Wife's Aadhaar Card",
          docKey: "[Wife] Aadhaar Card",
          description: "Official 12-digit Aadhaar card of Wife",
          required: true
        },
        {
          label: "Marriage Registration Certificate",
          docKey: "[Wife] Marriage Certificate",
          description: "Official Registration of Marriage under Hindu/Special Marriage Act",
          required: true
        },
        {
          label: "Wife's PAN Card",
          docKey: "[Wife] PAN Card",
          description: "Permanent Account Number card"
        },
        {
          label: "Wife's Voter ID",
          docKey: "[Wife] Voter ID",
          description: "Election Photo ID card or Passport"
        }
      ];
    }
    if (selectedMemberId === "husband") {
      return [
        {
          label: "Husband's Aadhaar Card",
          docKey: "[Husband] Aadhaar Card",
          description: "Official 12-digit Aadhaar card of Husband",
          required: true
        },
        {
          label: "Marriage Registration Certificate",
          docKey: "[Husband] Marriage Certificate",
          description: "Official Registration of Marriage under Hindu/Special Marriage Act",
          required: true
        },
        {
          label: "Husband's PAN Card",
          docKey: "[Husband] PAN Card",
          description: "Permanent Account Number card"
        },
        {
          label: "Husband's Voter ID",
          docKey: "[Husband] Voter ID",
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
    if (selectedMemberId === "custom-other") {
      const rel = customRelationName.trim() || "Other Member";
      const pfx = `[${rel}]`;
      const relLower = rel.toLowerCase();
      const isSenior =
        relLower.includes("grand") ||
        relLower.includes("elder") ||
        relLower.includes("senior") ||
        relLower.includes("uncle") ||
        relLower.includes("aunt");
      const isGuardian =
        relLower.includes("guardian") ||
        relLower.includes("custod") ||
        relLower.includes("ward");

      if (isSenior) {
        return [
          {
            label: `${rel}'s Aadhaar Card`,
            docKey: `${pfx} Aadhaar Card`,
            description: `Official 12-digit Aadhaar Card copy of ${rel}`,
            required: true
          },
          {
            label: `${rel}'s Senior Citizen / Voter ID`,
            docKey: `${pfx} Senior Citizen or Voter ID`,
            description: `Government Senior Citizen ID card or Voter Identity Proof for ${rel}`
          },
          {
            label: `${rel}'s Pension / Health Insurance Card`,
            docKey: `${pfx} Pension or Health Card`,
            description: `Pension payment order (PPO), Ayushman Bharat, or Senior health policy document`
          },
          {
            label: `${rel}'s Bank Passbook / Address Proof`,
            docKey: `${pfx} Address Proof`,
            description: `Bank account passbook front page or utility statement for ${rel}`
          },
          {
            label: `${rel}'s Passport Size Photo`,
            docKey: `${pfx} Passport Photo`,
            description: `Recent passport photograph of ${rel}`
          }
        ];
      }

      if (isGuardian) {
        return [
          {
            label: `${rel}'s Aadhaar Card`,
            docKey: `${pfx} Aadhaar Card`,
            description: `Official 12-digit Aadhaar Card copy of ${rel}`,
            required: true
          },
          {
            label: `Legal Guardianship Deed / Court Order`,
            docKey: `${pfx} Guardianship Order`,
            description: `Certified legal guardianship certificate, adoption decree, or court authorization`,
            required: true
          },
          {
            label: `${rel}'s Photo Identity Proof / PAN Card`,
            docKey: `${pfx} Identity Proof`,
            description: `Government issued Voter ID, PAN Card, or Passport of guardian`
          },
          {
            label: `${rel}'s Address Proof`,
            docKey: `${pfx} Address Proof`,
            description: `Current proof of residence for ${rel}`
          },
          {
            label: `${rel}'s Passport Size Photo`,
            docKey: `${pfx} Passport Photo`,
            description: `Recent passport photograph of ${rel}`
          }
        ];
      }

      return [
        {
          label: `${rel}'s Aadhaar Card`,
          docKey: `${pfx} Aadhaar Card`,
          description: `Official 12-digit Aadhaar Card copy of ${rel}`,
          required: true
        },
        {
          label: `${rel}'s Identity Proof / Voter ID`,
          docKey: `${pfx} Identity Proof`,
          description: `Government photo identity card (Voter ID, Passport, or DL) for ${rel}`
        },
        {
          label: `${rel}'s PAN Card`,
          docKey: `${pfx} PAN Card`,
          description: `Income Tax PAN card copy for ${rel}`
        },
        {
          label: `${rel}'s Address Proof`,
          docKey: `${pfx} Address Proof`,
          description: `Utility bill, bank statement or residential certificate for ${rel}`
        },
        {
          label: `${rel}'s Passport Size Photo`,
          docKey: `${pfx} Passport Photo`,
          description: `Recent passport size photograph of ${rel}`
        }
      ];
    }
    return [];
  }, [selectedMemberId, activeMemberInfo.prefix, customRelationName]);

  // Document counts for each family member slot
  const selfDocCount = useMemo(
    () => Object.keys(uploadedDocs).filter((k) => isDocForMember(k, "self")).length,
    [uploadedDocs, customRelationName]
  );
  const fatherDocCount = useMemo(
    () => Object.keys(uploadedDocs).filter((k) => isDocForMember(k, "father")).length,
    [uploadedDocs]
  );
  const motherDocCount = useMemo(
    () => Object.keys(uploadedDocs).filter((k) => isDocForMember(k, "mother")).length,
    [uploadedDocs]
  );
  const wifeDocCount = useMemo(
    () => Object.keys(uploadedDocs).filter((k) => isDocForMember(k, "wife") || isDocForMember(k, "spouse")).length,
    [uploadedDocs]
  );
  const husbandDocCount = useMemo(
    () => Object.keys(uploadedDocs).filter((k) => isDocForMember(k, "husband")).length,
    [uploadedDocs]
  );
  const sonsDocCount = useMemo(
    () => Object.keys(uploadedDocs).filter((k) => isDocForMember(k, "sons")).length,
    [uploadedDocs]
  );
  const daughtersDocCount = useMemo(
    () => Object.keys(uploadedDocs).filter((k) => isDocForMember(k, "daughters")).length,
    [uploadedDocs]
  );
  const customOtherDocCount = useMemo(
    () => Object.keys(uploadedDocs).filter((k) => isDocForMember(k, "custom-other")).length,
    [uploadedDocs, customRelationName]
  );
  const otherTotalDocCount = useMemo(
    () => Object.keys(uploadedDocs).filter((k) => !isDocForMember(k, "self")).length,
    [uploadedDocs, customRelationName]
  );

  // Sub-options definitions for the consolidated 'Other' expandable dropdown/menu
  const otherSubOptions = useMemo(() => [
    {
      id: "father",
      number: "1",
      label: t("docs.father") || "Father",
      subtext: familyDetails?.fatherName || "Father Details",
      icon: "👨",
      docCount: fatherDocCount
    },
    {
      id: "mother",
      number: "2",
      label: t("docs.mother") || "Mother",
      subtext: familyDetails?.motherName || "Mother Details",
      icon: "👩",
      docCount: motherDocCount
    },
    {
      id: "son-0",
      number: "3",
      label: t("docs.sons") || "Sons",
      subtext: sonsCount > 0 ? `${sonsCount} Son${sonsCount > 1 ? "s" : ""}` : "Add Son",
      icon: "👦",
      docCount: sonsDocCount,
      isChild: true,
      childGender: "Son" as const,
      childCount: sonsCount
    },
    {
      id: "daughter-0",
      number: "4",
      label: t("docs.daughters") || "Daughters",
      subtext: daughtersCount > 0 ? `${daughtersCount} Daughter${daughtersCount > 1 ? "s" : ""}` : "Add Daughter",
      icon: "👧",
      docCount: daughtersDocCount,
      isChild: true,
      childGender: "Daughter" as const,
      childCount: daughtersCount
    },
    {
      id: "wife",
      number: "5",
      label: "Wife",
      subtext: familyDetails?.spouseName || "Wife Details",
      icon: "👰",
      docCount: wifeDocCount
    },
    {
      id: "husband",
      number: "6",
      label: "Husband",
      subtext: familyDetails?.spouseName || "Husband Details",
      icon: "🤵",
      docCount: husbandDocCount
    },
    {
      id: "custom-other",
      number: "7",
      label: customRelationName.trim() ? customRelationName : "Other (Custom)",
      subtext: customRelationName.trim()
        ? `${customMemberFullName ? customMemberFullName + " • " : ""}Custom Profile`
        : "Type custom name / presets",
      icon: "🏷️",
      docCount: customOtherDocCount,
      isCustom: true
    }
  ], [
    t,
    familyDetails,
    fatherDocCount,
    motherDocCount,
    wifeDocCount,
    husbandDocCount,
    sonsDocCount,
    daughtersDocCount,
    customOtherDocCount,
    sonsCount,
    daughtersCount,
    customRelationName
  ]);

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {activeCategory.items.map((rawDocName) => {
            const scopedKey =
              selectedMemberId === "self"
                ? rawDocName
                : `${activeMemberInfo.prefix} ${rawDocName}`;

            const uploadedDoc = findMemberDoc(rawDocName);
            const isUploaded = Boolean(uploadedDoc);

            return (
              <div
                key={rawDocName}
                className={`p-3 rounded-xl border transition-all backdrop-blur-md shadow-xs flex flex-col justify-between min-w-0 overflow-hidden ${
                  isUploaded
                    ? "bg-white dark:bg-slate-900/80 border-emerald-300 dark:border-emerald-800/80"
                    : "bg-white/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
                }`}
              >
                {/* Header: Document Name & Status */}
                <div className="flex items-start justify-between gap-2.5 mb-2 min-w-0">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs transition-transform ${
                        isUploaded
                          ? "bg-[#E8F5E9] text-[#138808] border border-[#C8E6C9]"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate" title={rawDocName}>
                        {rawDocName}
                      </h4>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        {isUploaded && uploadedDoc ? uploadedDoc.name : `${activeMemberInfo.label} Document`}
                      </p>
                    </div>
                  </div>

                  {isUploaded ? (
                    <span className="shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#E8F5E9] text-[#138808] border border-[#C8E6C9] flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span>Attached</span>
                    </span>
                  ) : (
                    <span className="shrink-0 text-[9px] text-slate-400 font-medium">
                      Optional
                    </span>
                  )}
                </div>

                {/* Card Body: If uploaded -> Show preview indicator, file name, and View/Delete action buttons. If not uploaded -> Show FileUploadBox */}
                {isUploaded && uploadedDoc ? (
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 min-w-0">
                    {/* Preview Indicator & Metadata */}
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-2 min-w-0 overflow-hidden">
                      <div className="w-7 h-7 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold text-[10px] uppercase border border-emerald-200 dark:border-emerald-800">
                        {uploadedDoc.previewType === "image" ? "IMG" : "PDF"}
                      </div>
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate block w-full leading-tight" title={uploadedDoc.name}>
                          {uploadedDoc.name}
                        </p>
                        <div className="flex items-center gap-1.5 text-[9px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                          <span>{uploadedDoc.size}</span>
                          <span>•</span>
                          <span>{uploadedDoc.uploadedAt || "Verified"}</span>
                        </div>
                        {/aadhaar|aadhar/i.test(rawDocName) || uploadedDoc.verificationStatus === "APPROVED" || uploadedDoc.isGenuineAadhaar ? (
                          <div className="flex items-center gap-1 text-[8px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/90 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700 px-1.5 py-0.5 rounded mt-1 w-fit">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                            <span>STATUS: APPROVED - Identified as a genuine Aadhaar card.</span>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* View and Delete Action Buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewDoc(uploadedDoc);
                        }}
                        className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#000080] hover:bg-[#000066] text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs transition-all cursor-pointer hover:shadow-sm"
                        title="View Document"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeDocument(scopedKey);
                          removeDocument(rawDocName);
                          if (uploadedDoc.docName) {
                            removeDocument(uploadedDoc.docName);
                          }
                        }}
                        className="py-1.5 px-2.5 rounded-lg border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                        title="Delete Document"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full pt-0.5 min-w-0">
                    <FileUploadBox
                      label={rawDocName}
                      hideLabel={true}
                      currentFile={null}
                      onConfirmUpload={(file, fileMeta) => {
                        uploadDocument(scopedKey, file, fileMeta);
                      }}
                      onView={(doc) => setPreviewDoc(doc)}
                      onRemove={() => {
                        removeDocument(scopedKey);
                        removeDocument(rawDocName);
                      }}
                    />
                  </div>
                )}
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

        {/* Consolidated Member Selection Row: You (Self) + Other */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* 1. You (Self) Card */}
          <button
            type="button"
            onClick={() => {
              setSelectedMemberId("self");
              setIsOtherExpanded(false);
            }}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
              selectedMemberId === "self"
                ? "bg-[#000080] text-white border-[#000080] shadow-lg shadow-[#000080]/30 scale-[1.01]"
                : "bg-white dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 shadow-xs"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                {(currentAccount?.avatar || user?.avatar) ? (
                  <img
                    src={currentAccount?.avatar || user?.avatar}
                    alt="You"
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#FF9933]/80 shadow-xs"
                  />
                ) : (
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                      selectedMemberId === "self"
                        ? "bg-white/15 text-white"
                        : "bg-blue-50 dark:bg-slate-800 text-[#000080] dark:text-blue-300"
                    }`}
                  >
                    👤
                  </div>
                )}
                <span
                  className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                    selectedMemberId === "self"
                      ? "bg-[#FF9933] text-white"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                  title="Item #1: Primary Account Holder"
                >
                  #1
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold truncate">{t("docs.self") || "You (Self)"}</span>
                  {selectedMemberId === "self" && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-white/20 text-white">
                      Active
                    </span>
                  )}
                </div>
                <span
                  className={`text-xs block truncate ${
                    selectedMemberId === "self" ? "text-blue-100" : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {user?.name || "Primary Citizen Profile"}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end shrink-0 gap-1">
              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                  selectedMemberId === "self"
                    ? "bg-white/20 text-white"
                    : selfDocCount > 0
                    ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>{selfDocCount} {selfDocCount === 1 ? "Doc" : "Docs"}</span>
              </span>
              <span
                className={`text-[10px] ${
                  selectedMemberId === "self" ? "text-blue-200" : "text-slate-400"
                }`}
              >
                Vault records
              </span>
            </div>
          </button>

          {/* 2. Consolidated 'Other' Card */}
          <button
            type="button"
            onClick={() => {
              if (selectedMemberId === "self") {
                setSelectedMemberId("father");
                setIsOtherExpanded(true);
              } else {
                setIsOtherExpanded((prev) => !prev);
              }
            }}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
              selectedMemberId !== "self"
                ? "bg-[#000080] text-white border-[#000080] shadow-lg shadow-[#000080]/30 scale-[1.01]"
                : "bg-white dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 shadow-xs"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                    selectedMemberId !== "self"
                      ? "bg-white/15 text-white"
                      : "bg-indigo-50 dark:bg-slate-800 text-[#000080] dark:text-indigo-300"
                  }`}
                >
                  👥
                </div>
                <span
                  className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                    selectedMemberId !== "self"
                      ? "bg-[#FF9933] text-white"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                  title="Item #2: Family & Other Members"
                >
                  #2
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold truncate">Other (Family Members)</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold flex items-center gap-0.5 ${
                      selectedMemberId !== "self"
                        ? "bg-white/20 text-white"
                        : "bg-blue-100 dark:bg-blue-900/50 text-[#000080] dark:text-blue-300"
                    }`}
                  >
                    <span>7 Sub-Options</span>
                  </span>
                </div>
                <span
                  className={`text-xs block truncate ${
                    selectedMemberId !== "self" ? "text-blue-100" : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {selectedMemberId !== "self"
                    ? `Selected: ${activeMemberInfo.icon} ${activeMemberInfo.label}`
                    : "Father, Mother, Sons, Daughters, Wife, Husband & Custom"}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end shrink-0 gap-1.5">
              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                  selectedMemberId !== "self"
                    ? "bg-white/20 text-white"
                    : otherTotalDocCount > 0
                    ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>{otherTotalDocCount} {otherTotalDocCount === 1 ? "Doc" : "Docs"}</span>
              </span>
              <div
                className={`flex items-center gap-1 text-[10px] font-semibold ${
                  selectedMemberId !== "self" ? "text-blue-200" : "text-[#000080] dark:text-blue-400"
                }`}
              >
                <span>{isOtherExpanded ? "Hide options" : "Expand options"}</span>
                {isOtherExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5 transition-transform" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 transition-transform" />
                )}
              </div>
            </div>
          </button>
        </div>

        {/* Expandable Sub-Menu containing 7 Sub-Options: Father, Mother, Sons, Daughters, Wife, Husband, Other (Custom) */}
        {isOtherExpanded && (
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-50/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800/90 shadow-md space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#000080] dark:text-blue-400" />
                  Select Family Member / Relationship Sub-Option
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  7 Available
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Click any member card to view or attach dedicated records
              </p>
            </div>

            {/* Sub-Options Grid with Numbering & Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {otherSubOptions.map((opt) => {
                const isSelected =
                  selectedMemberId === opt.id ||
                  (opt.isChild && opt.childGender === "Son" && selectedMemberId.startsWith("son-")) ||
                  (opt.isChild && opt.childGender === "Daughter" && selectedMemberId.startsWith("daughter-"));

                return (
                  <div
                    key={opt.id}
                    onClick={() => {
                      if (opt.id === "son-0" && sonsCount === 0) {
                        handleUpdateChildCount("Son", 1);
                      }
                      if (opt.id === "daughter-0" && daughtersCount === 0) {
                        handleUpdateChildCount("Daughter", 1);
                      }
                      setSelectedMemberId(opt.id);
                    }}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between relative group ${
                      isSelected
                        ? "bg-[#000080] text-white border-[#000080] shadow-md shadow-[#000080]/30 scale-[1.02]"
                        : "bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {/* Header: Numbering Badge + Icon + Doc Counter */}
                    <div className="flex items-center justify-between mb-1.5 gap-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          #{opt.number}
                        </span>
                        <span className="text-lg">{opt.icon}</span>
                      </div>

                      {/* Item/Doc Counter Badge */}
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : opt.docCount > 0
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                        }`}
                        title={`${opt.docCount} documents attached`}
                      >
                        {opt.docCount}
                      </span>
                    </div>

                    {/* Member Label & Subtext */}
                    <div>
                      <span className="text-xs font-bold block truncate" title={opt.label}>
                        {opt.label}
                      </span>
                      <span
                        className={`text-[10px] block truncate ${
                          isSelected ? "text-blue-100" : "text-slate-400"
                        }`}
                        title={opt.subtext}
                      >
                        {opt.subtext}
                      </span>
                    </div>

                    {/* Stepper (+ / -) for Sons & Daughters */}
                    {opt.isChild && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className={`mt-2 flex items-center justify-between gap-1 rounded-lg p-0.5 border ${
                          isSelected
                            ? "bg-white/10 border-white/20"
                            : "bg-slate-50 dark:bg-slate-700/60 border-slate-200 dark:border-slate-600"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleUpdateChildCount(opt.childGender!, -1)}
                          disabled={opt.childCount === 0}
                          className="w-4 h-4 flex items-center justify-center rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[10px] font-bold hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                          title={`Decrease ${opt.childGender} count`}
                        >
                          -
                        </button>
                        <span className="text-[10px] font-bold px-1">{opt.childCount}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateChildCount(opt.childGender!, 1)}
                          className="w-4 h-4 flex items-center justify-center rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[10px] font-bold hover:bg-slate-200 cursor-pointer"
                          title={`Add ${opt.childGender}`}
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Custom Name Filling Option: Rich Customization & Presets when 'custom-other' is selected */}
            {selectedMemberId === "custom-other" && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-purple-50/90 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/40 border border-blue-200/90 dark:border-indigo-800/70 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-blue-200/60 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🏷️</span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>Custom Family Member & Relationship Profile</span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#000080] text-white">
                          #7 Sub-Option
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Choose a relationship preset below or type any custom family member, in-law, or legal dependent.
                      </p>
                    </div>
                  </div>
                  {customRelationName.trim() && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#000080] text-white font-bold shadow-2xs flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        <span>Scoped As: [{customRelationName.trim()}]</span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800">
                        {customOtherDocCount} {customOtherDocCount === 1 ? "Doc" : "Docs"} Attached
                      </span>
                    </div>
                  )}
                </div>

                {/* Preset Category Filter Tabs */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">Categories:</span>
                  {[
                    { id: "all", label: "All Presets" },
                    { id: "siblings", label: "Siblings" },
                    { id: "elders", label: "Elders & Extended" },
                    { id: "inlaws", label: "In-Laws" },
                    { id: "guardians", label: "Guardians & Others" }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCustomPresetCategory(cat.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        customPresetCategory === cat.id
                          ? "bg-[#000080] text-white shadow-xs"
                          : "bg-white/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Filtered Preset Chips Grid */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { name: "Brother", icon: "👨‍🦱", cat: "siblings" },
                    { name: "Sister", icon: "👩‍🦰", cat: "siblings" },
                    { name: "Grandfather", icon: "👴", cat: "elders" },
                    { name: "Grandmother", icon: "👵", cat: "elders" },
                    { name: "Uncle", icon: "👨‍🦳", cat: "elders" },
                    { name: "Aunt", icon: "👩‍🦳", cat: "elders" },
                    { name: "Father-in-law", icon: "👴", cat: "inlaws" },
                    { name: "Mother-in-law", icon: "👵", cat: "inlaws" },
                    { name: "Brother-in-law", icon: "👨‍🦱", cat: "inlaws" },
                    { name: "Sister-in-law", icon: "👩‍🦰", cat: "inlaws" },
                    { name: "Legal Guardian", icon: "⚖️", cat: "guardians" },
                    { name: "Cousin", icon: "🧑", cat: "guardians" },
                    { name: "Nephew", icon: "👦", cat: "guardians" },
                    { name: "Niece", icon: "👧", cat: "guardians" },
                    { name: "Dependent / Ward", icon: "🤝", cat: "guardians" }
                  ]
                    .filter((p) => customPresetCategory === "all" || p.cat === customPresetCategory)
                    .map((preset) => {
                      const isSelected = customRelationName.toLowerCase() === preset.name.toLowerCase();
                      const presetDocCount = Object.keys(uploadedDocs).filter((k) =>
                        k.includes(`[${preset.name}]`)
                      ).length;

                      return (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setCustomRelationName(preset.name)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? "bg-[#000080] text-white shadow-md scale-105"
                              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                          }`}
                        >
                          <span>{preset.icon}</span>
                          <span>{preset.name}</span>
                          {presetDocCount > 0 && (
                            <span
                              className={`px-1 py-0.2 rounded-full text-[9px] font-bold ${
                                isSelected ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              {presetDocCount}
                            </span>
                          )}
                        </button>
                      );
                    })}
                </div>

                {/* Input Fields: Relationship Name, Full Name & Age */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  {/* Field 1: Custom Relationship */}
                  <div className="relative">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                      Relationship / Title *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={customRelationName}
                        onChange={(e) => setCustomRelationName(e.target.value)}
                        placeholder="e.g. Brother, Grandmother, Guardian"
                        className="w-full pl-3 pr-8 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#000080]/30 font-semibold"
                      />
                      {customRelationName && (
                        <button
                          type="button"
                          onClick={() => setCustomRelationName("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                          title="Clear relationship"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Field 2: Custom Person Full Name (Optional) */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                      Member Full Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={customMemberFullName}
                      onChange={(e) => setCustomMemberFullName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar, Sunita Devi"
                      className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#000080]/30"
                    />
                  </div>

                  {/* Field 3: Age / DOB (Optional) */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                      Age / Details (Optional)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={customMemberAge}
                        onChange={(e) => setCustomMemberAge(e.target.value)}
                        placeholder="e.g. 68 Years, DOB: 1956"
                        className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#000080]/30"
                      />

                      {/* Save to My Members Button */}
                      {customRelationName.trim() && (
                        <button
                          type="button"
                          onClick={() => {
                            const trimmedRel = customRelationName.trim();
                            if (!savedCustomMembers.some((m) => m.relation.toLowerCase() === trimmedRel.toLowerCase())) {
                              setSavedCustomMembers((prev) => [
                                ...prev,
                                {
                                  id: `custom-${Date.now()}`,
                                  relation: trimmedRel,
                                  name: customMemberFullName.trim(),
                                  age: customMemberAge.trim()
                                }
                              ]);
                            }
                            setSaveSuccessNotice(true);
                            setTimeout(() => setSaveSuccessNotice(false), 2000);
                          }}
                          className="px-3 py-2 rounded-xl bg-[#000080] text-white text-xs font-bold hover:bg-[#000066] transition-colors shrink-0 flex items-center gap-1 cursor-pointer shadow-xs"
                          title="Save this custom relation to quick list"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Save</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Saved Custom Profiles List */}
                {savedCustomMembers.length > 0 && (
                  <div className="pt-2 border-t border-blue-200/60 dark:border-slate-800 flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <span>Saved Members:</span>
                    </span>
                    {savedCustomMembers.map((member) => {
                      const isActive = customRelationName.toLowerCase() === member.relation.toLowerCase();
                      const docCount = Object.keys(uploadedDocs).filter((k) =>
                        k.includes(`[${member.relation}]`)
                      ).length;

                      return (
                        <div
                          key={member.id}
                          className={`inline-flex items-center rounded-xl border text-xs font-semibold transition-all ${
                            isActive
                              ? "bg-[#000080] text-white border-[#000080] shadow-xs"
                              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setCustomRelationName(member.relation);
                              if (member.name) setCustomMemberFullName(member.name);
                              if (member.age) setCustomMemberAge(member.age);
                            }}
                            className="px-2.5 py-1 flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>🏷️</span>
                            <span>{member.name ? `${member.name} (${member.relation})` : member.relation}</span>
                            <span
                              className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                                isActive
                                  ? "bg-white/20 text-white"
                                  : docCount > 0
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {docCount}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSavedCustomMembers((prev) => prev.filter((m) => m.id !== member.id));
                            }}
                            className={`pr-2 pl-0.5 text-[10px] hover:text-red-500 cursor-pointer ${
                              isActive ? "text-blue-200" : "text-slate-400"
                            }`}
                            title="Remove saved member"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Individual Child Sub-Pills (When Sons or Daughters > 0) */}
            {(sonsCount > 0 || daughtersCount > 0) && (
              <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1">
                  <Baby className="w-3.5 h-3.5 text-[#FF9933]" />
                  Select Specific Child:
                </span>

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
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-[#FF9933] text-white shadow-sm shadow-[#FF9933]/30 scale-105"
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700"
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
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-[#FF9933] text-white shadow-sm shadow-[#FF9933]/30 scale-105"
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700"
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
                    (slot) => Boolean(findMemberDoc(slot.docKey) || findMemberDoc(slot.label))
                  ).length
                }{" "}
                of {memberSlots.length} Attached
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {memberSlots.map((slot) => {
                const currentDoc = findMemberDoc(slot.docKey) || findMemberDoc(slot.label);

                return (
                  <div
                    key={slot.docKey}
                    className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between space-y-2 min-w-0 overflow-hidden"
                  >
                    <div className="min-w-0 overflow-hidden">
                      <div className="flex items-start justify-between gap-1.5 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1 min-w-0 overflow-hidden" title={slot.label}>
                          <span className="truncate">{slot.label}</span>
                          {slot.required && <span className="text-rose-500 font-bold shrink-0">*</span>}
                        </h4>
                        {currentDoc && (
                          <button
                            type="button"
                            onClick={() => setPreviewDoc(currentDoc)}
                            className="text-[#000080] dark:text-blue-300 hover:underline text-[10px] font-semibold flex items-center gap-0.5 shrink-0 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1" title={slot.description}>
                        {slot.description}
                      </p>
                    </div>

                    {/* Standalone Reusable FileUploadBox */}
                    <div className="min-w-0 w-full">
                      <FileUploadBox
                        label={slot.label}
                        hideLabel={true}
                        required={slot.required}
                        currentFile={currentDoc}
                        onConfirmUpload={(file, fileMeta) => {
                          uploadDocument(slot.docKey, file, fileMeta);
                        }}
                        onRemove={() => {
                          removeDocument(slot.docKey);
                          if (currentDoc?.docName) {
                            removeDocument(currentDoc.docName);
                          }
                        }}
                        onView={(doc) => {
                          setPreviewDoc(doc);
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {memberUploadedList.map(([docName, docMeta]) => (
                <div
                  key={docName}
                  onClick={() => setPreviewDoc(docMeta)}
                  className="p-3.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 hover:border-[#000080] dark:border-slate-800 dark:hover:border-blue-500 transition-all duration-200 transform hover:-translate-y-0.5 shadow-xs hover:shadow-sm cursor-pointer flex flex-col justify-between space-y-2.5 group min-w-0 overflow-hidden"
                >
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-[#FFF3E0] text-[#E65100] border border-[#FFE082] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#E8F5E9] text-[#138808] border border-[#C8E6C9] flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Verified
                      </span>
                    </div>

                    <div className="min-w-0 overflow-hidden">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#000080] dark:group-hover:text-blue-300 transition-colors truncate" title={docMeta.docName || docName}>
                        {docMeta.docName || docName}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono truncate mt-0.5" title={docMeta.name}>{docMeta.name}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-slate-400 block text-[9px]">Size</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 truncate block">{docMeta.size}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px]">Type</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 truncate block">
                          {docMeta.type.split("/")[1]?.toUpperCase() || "PDF"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between min-w-0">
                    <span className="text-[11px] font-bold text-[#000080] dark:text-blue-300 flex items-center gap-1 group-hover:underline truncate">
                      <Eye className="w-3 h-3 shrink-0" />
                      <span>Open Viewer</span>
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeDocument(docName);
                        }}
                        className="p-1 rounded-md text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete Document"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>

                      <div className="flex items-center gap-1 text-[#138808]">
                        {isAuthorized ? (
                          <>
                            <span title="Download"><Download className="w-3 h-3" /></span>
                            <span title="Print"><Printer className="w-3 h-3" /></span>
                            <span title="Share"><Share2 className="w-3 h-3" /></span>
                          </>
                        ) : (
                          <span title="Actions Restricted"><Lock className="w-3 h-3 text-slate-400" /></span>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                className="group p-3.5 rounded-xl bg-white dark:bg-slate-900/70 hover:bg-slate-50/90 dark:hover:bg-slate-800/80 border border-slate-200/90 dark:border-slate-800 hover:border-[#000080] backdrop-blur-md transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-between shadow-xs hover:shadow-sm min-w-0"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
                  <span className="text-xl p-2 rounded-lg bg-slate-100 border border-slate-200 dark:bg-slate-800/60 dark:border-slate-700/50 group-hover:scale-105 transition-transform shrink-0">
                    {cat.icon}
                  </span>
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#000080] dark:group-hover:text-blue-300 transition-colors truncate">
                      {cat.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {cat.items.length} {t("nav.documents")}
                      </span>
                      {uploadedCount > 0 ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#E8F5E9] text-[#138808] border border-[#C8E6C9]">
                          {uploadedCount} Attached
                        </span>
                      ) : (
                        <span className="text-[9px] text-slate-400">{t("docs.empty")}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center text-slate-400 group-hover:text-[#000080] dark:group-hover:text-white transition-colors shrink-0 ml-2">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
