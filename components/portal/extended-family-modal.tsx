"use client";

import React, { useState, useEffect } from "react";
import { usePortal } from "@/lib/portal-store";
import {
  ExtendedFamilyDetails,
  FamilySibling,
  FamilyChild,
  MaritalStatus
} from "@/types/portal";
import {
  X,
  Users,
  Heart,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  Phone,
  Shield,
  Briefcase,
  UserCheck
} from "lucide-react";
import {
  sanitizePhoneNumber,
  formatAadhaarNumber
} from "@/lib/field-validation";

interface ExtendedFamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_FAMILY_DETAILS: ExtendedFamilyDetails = {
  maritalStatus: "Single",
  fatherName: "",
  fatherPhone: "",
  fatherAadhaar: "",
  fatherOccupation: "",
  motherName: "",
  motherPhone: "",
  motherAadhaar: "",
  motherOccupation: "",
  brothers: [],
  sisters: [],
  spouseName: "",
  spousePhone: "",
  spouseAadhaar: "",
  spouseOccupation: "",
  children: []
};

export const ExtendedFamilyModal: React.FC<ExtendedFamilyModalProps> = ({
  isOpen,
  onClose
}) => {
  const { user, accounts, updateAccount, logUserActivity } = usePortal();

  // Find current account
  const currentAccount = accounts.find(
    (a) =>
      a.id === user?.id ||
      (user?.email && a.email.toLowerCase() === user.email.toLowerCase())
  );

  const [familyData, setFamilyData] = useState<ExtendedFamilyDetails>(
    currentAccount?.familyDetails || DEFAULT_FAMILY_DETAILS
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync when account changes or modal opens
  useEffect(() => {
    if (isOpen && currentAccount?.familyDetails) {
      setFamilyData(currentAccount.familyDetails);
    }
  }, [isOpen, currentAccount]);

  if (!isOpen) return null;

  // Add / Remove Brothers
  const handleAddBrother = () => {
    setFamilyData((prev) => ({
      ...prev,
      brothers: [
        ...prev.brothers,
        { id: `br-${Date.now()}`, name: "", age: "", phone: "", occupation: "" }
      ]
    }));
  };

  const handleRemoveBrother = (index: number) => {
    setFamilyData((prev) => ({
      ...prev,
      brothers: prev.brothers.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateBrother = (
    index: number,
    field: keyof FamilySibling,
    value: string
  ) => {
    setFamilyData((prev) => {
      const updated = [...prev.brothers];
      updated[index] = {
        ...updated[index],
        [field]: field === "phone" ? sanitizePhoneNumber(value) : value
      };
      return { ...prev, brothers: updated };
    });
  };

  // Add / Remove Sisters
  const handleAddSister = () => {
    setFamilyData((prev) => ({
      ...prev,
      sisters: [
        ...prev.sisters,
        { id: `sis-${Date.now()}`, name: "", age: "", phone: "", occupation: "" }
      ]
    }));
  };

  const handleRemoveSister = (index: number) => {
    setFamilyData((prev) => ({
      ...prev,
      sisters: prev.sisters.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateSister = (
    index: number,
    field: keyof FamilySibling,
    value: string
  ) => {
    setFamilyData((prev) => {
      const updated = [...prev.sisters];
      updated[index] = {
        ...updated[index],
        [field]: field === "phone" ? sanitizePhoneNumber(value) : value
      };
      return { ...prev, sisters: updated };
    });
  };

  // Add / Remove Children
  const handleAddChild = (gender: "Son" | "Daughter") => {
    setFamilyData((prev) => ({
      ...prev,
      children: [
        ...prev.children,
        { id: `ch-${Date.now()}`, name: "", gender, age: "" }
      ]
    }));
  };

  const handleRemoveChild = (index: number) => {
    setFamilyData((prev) => ({
      ...prev,
      children: prev.children.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateChild = (
    index: number,
    field: keyof FamilyChild,
    value: string
  ) => {
    setFamilyData((prev) => {
      const updated = [...prev.children];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return { ...prev, children: updated };
    });
  };

  // Save handler
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAccount) return;

    updateAccount(currentAccount.id, {
      familyDetails: familyData
    });

    logUserActivity(
      "Updated Extended Family Schema",
      `Saved family tree: Marital Status: ${familyData.maritalStatus}, ${familyData.brothers.length} brothers, ${familyData.sisters.length} sisters, ${familyData.children.length} children.`,
      currentAccount.email
    );

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const isMarried = familyData.maritalStatus === "Married";

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#151620] border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-gradient-to-r from-amber-50/60 via-white to-indigo-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#000080] text-white shadow-md shadow-[#000080]/20">
              <Users className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Extended Family & Dependents</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official family registry, sibling details, and conditional dependent mapping
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {savedSuccess && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Family details and dependents updated successfully!</span>
            </div>
          )}

          {/* 1. Marital Status Selection */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>Marital Status <span className="text-rose-500">*</span></span>
              </label>
              <span className="text-[10px] text-slate-400 font-medium">
                Select &apos;Married&apos; to add Spouse & Children details
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(["Single", "Married", "Divorced", "Widowed"] as MaritalStatus[]).map((status) => {
                const isSelected = familyData.maritalStatus === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setFamilyData((prev) => ({ ...prev, maritalStatus: status }))}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? "bg-[#FF9933] text-white border-[#FF9933] shadow-md shadow-[#FF9933]/25 ring-2 ring-[#FF9933]/20"
                        : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400"
                    }`}
                  >
                    <span>{status}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Parents Section (Father & Mother) */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-[#000080] dark:text-blue-400" />
              <span>Parents Details (Father & Mother)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Father Box */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="w-2 h-2 rounded-full bg-[#000080]" />
                  <span className="font-bold text-xs text-slate-900 dark:text-white">Father Details</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Father&apos;s Full Name
                  </label>
                  <input
                    type="text"
                    value={familyData.fatherName || ""}
                    onChange={(e) => setFamilyData((prev) => ({ ...prev, fatherName: e.target.value }))}
                    placeholder="e.g. Mandan Mohan Kumar"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#FF9933]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      value={familyData.fatherPhone || ""}
                      onChange={(e) => setFamilyData((prev) => ({ ...prev, fatherPhone: sanitizePhoneNumber(e.target.value) }))}
                      placeholder="10-digit mobile"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-[#FF9933]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Aadhaar Number
                    </label>
                    <input
                      type="text"
                      maxLength={14}
                      value={familyData.fatherAadhaar || ""}
                      onChange={(e) => setFamilyData((prev) => ({ ...prev, fatherAadhaar: formatAadhaarNumber(e.target.value).formatted }))}
                      placeholder="XXXX XXXX XXXX"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-[#FF9933]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Occupation
                  </label>
                  <input
                    type="text"
                    value={familyData.fatherOccupation || ""}
                    onChange={(e) => setFamilyData((prev) => ({ ...prev, fatherOccupation: e.target.value }))}
                    placeholder="e.g. Agriculture / Business"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#FF9933]"
                  />
                </div>
              </div>

              {/* Mother Box */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="w-2 h-2 rounded-full bg-[#138808]" />
                  <span className="font-bold text-xs text-slate-900 dark:text-white">Mother Details</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Mother&apos;s Full Name
                  </label>
                  <input
                    type="text"
                    value={familyData.motherName || ""}
                    onChange={(e) => setFamilyData((prev) => ({ ...prev, motherName: e.target.value }))}
                    placeholder="e.g. Mandan Lakshmi"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#FF9933]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      value={familyData.motherPhone || ""}
                      onChange={(e) => setFamilyData((prev) => ({ ...prev, motherPhone: sanitizePhoneNumber(e.target.value) }))}
                      placeholder="10-digit mobile"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-[#FF9933]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Aadhaar Number
                    </label>
                    <input
                      type="text"
                      maxLength={14}
                      value={familyData.motherAadhaar || ""}
                      onChange={(e) => setFamilyData((prev) => ({ ...prev, motherAadhaar: formatAadhaarNumber(e.target.value).formatted }))}
                      placeholder="XXXX XXXX XXXX"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-[#FF9933]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Occupation
                  </label>
                  <input
                    type="text"
                    value={familyData.motherOccupation || ""}
                    onChange={(e) => setFamilyData((prev) => ({ ...prev, motherOccupation: e.target.value }))}
                    placeholder="e.g. Homemaker"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#FF9933]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Brothers & Sisters Section */}
          <div className="space-y-4">
            {/* Brothers */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  Brothers ({familyData.brothers.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddBrother}
                  className="px-2.5 py-1 rounded-lg bg-[#000080] hover:bg-[#000066] text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Brother</span>
                </button>
              </div>

              {familyData.brothers.length === 0 ? (
                <p className="text-[11px] text-slate-400 py-1">No brothers added yet.</p>
              ) : (
                <div className="space-y-2">
                  {familyData.brothers.map((b, idx) => (
                    <div
                      key={b.id || idx}
                      className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-2"
                    >
                      <input
                        type="text"
                        placeholder="Brother's Full Name"
                        value={b.name}
                        onChange={(e) => handleUpdateBrother(idx, "name", e.target.value)}
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Age"
                        value={b.age || ""}
                        onChange={(e) => handleUpdateBrother(idx, "age", e.target.value)}
                        className="w-16 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-xs text-center"
                      />
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="Phone"
                        value={b.phone || ""}
                        onChange={(e) => handleUpdateBrother(idx, "phone", e.target.value)}
                        className="w-28 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveBrother(idx)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 cursor-pointer"
                        title="Remove brother"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sisters */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  Sisters ({familyData.sisters.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddSister}
                  className="px-2.5 py-1 rounded-lg bg-[#000080] hover:bg-[#000066] text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Sister</span>
                </button>
              </div>

              {familyData.sisters.length === 0 ? (
                <p className="text-[11px] text-slate-400 py-1">No sisters added yet.</p>
              ) : (
                <div className="space-y-2">
                  {familyData.sisters.map((s, idx) => (
                    <div
                      key={s.id || idx}
                      className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-2"
                    >
                      <input
                        type="text"
                        placeholder="Sister's Full Name"
                        value={s.name}
                        onChange={(e) => handleUpdateSister(idx, "name", e.target.value)}
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Age"
                        value={s.age || ""}
                        onChange={(e) => handleUpdateSister(idx, "age", e.target.value)}
                        className="w-16 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-xs text-center"
                      />
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="Phone"
                        value={s.phone || ""}
                        onChange={(e) => handleUpdateSister(idx, "phone", e.target.value)}
                        className="w-28 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSister(idx)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 cursor-pointer"
                        title="Remove sister"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 4. CONDITIONAL MARITAL STATUS SECTION (Only if 'Married') */}
          {isMarried && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              {/* Spouse Details Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-50/80 via-white to-rose-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-pink-950/20 border-2 border-pink-300/80 dark:border-pink-800/60 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 border-b border-pink-100 dark:border-pink-900/40 pb-2">
                  <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                  <span className="font-bold text-xs text-pink-900 dark:text-pink-300">
                    Wife / Spouse Details
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Spouse Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required={isMarried}
                      value={familyData.spouseName || ""}
                      onChange={(e) => setFamilyData((prev) => ({ ...prev, spouseName: e.target.value }))}
                      placeholder="e.g. Mandan Anitha"
                      className="w-full px-3 py-2 rounded-xl border border-pink-300 dark:border-pink-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Spouse Mobile Number
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      value={familyData.spousePhone || ""}
                      onChange={(e) => setFamilyData((prev) => ({ ...prev, spousePhone: sanitizePhoneNumber(e.target.value) }))}
                      placeholder="10-digit mobile"
                      className="w-full px-3 py-2 rounded-xl border border-pink-300 dark:border-pink-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Spouse Aadhaar Number
                    </label>
                    <input
                      type="text"
                      maxLength={14}
                      value={familyData.spouseAadhaar || ""}
                      onChange={(e) => setFamilyData((prev) => ({ ...prev, spouseAadhaar: formatAadhaarNumber(e.target.value).formatted }))}
                      placeholder="XXXX XXXX XXXX"
                      className="w-full px-3 py-2 rounded-xl border border-pink-300 dark:border-pink-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Occupation
                    </label>
                    <input
                      type="text"
                      value={familyData.spouseOccupation || ""}
                      onChange={(e) => setFamilyData((prev) => ({ ...prev, spouseOccupation: e.target.value }))}
                      placeholder="e.g. Teacher / IT / Homemaker"
                      className="w-full px-3 py-2 rounded-xl border border-pink-300 dark:border-pink-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>
              </div>

              {/* Sons & Daughters (Children) */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                    Children (Sons / Daughters: {familyData.children.length})
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleAddChild("Son")}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Son</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddChild("Daughter")}
                      className="px-2.5 py-1 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Daughter</span>
                    </button>
                  </div>
                </div>

                {familyData.children.length === 0 ? (
                  <p className="text-[11px] text-slate-400 py-1">No children added yet.</p>
                ) : (
                  <div className="space-y-2">
                    {familyData.children.map((c, idx) => (
                      <div
                        key={c.id || idx}
                        className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-2"
                      >
                        <select
                          value={c.gender}
                          onChange={(e) => handleUpdateChild(idx, "gender", e.target.value)}
                          className={`px-2 py-1.5 rounded-lg border text-xs font-bold cursor-pointer ${
                            c.gender === "Son"
                              ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/80 dark:border-indigo-800 dark:text-indigo-300"
                              : "bg-pink-50 border-pink-200 text-pink-700 dark:bg-pink-950/80 dark:border-pink-800 dark:text-pink-300"
                          }`}
                        >
                          <option value="Son">👦 Son</option>
                          <option value="Daughter">👧 Daughter</option>
                        </select>
                        <input
                          type="text"
                          placeholder={`${c.gender}'s Full Name`}
                          value={c.name}
                          onChange={(e) => handleUpdateChild(idx, "name", e.target.value)}
                          className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Age"
                          value={c.age || ""}
                          onChange={(e) => handleUpdateChild(idx, "age", e.target.value)}
                          className="w-16 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-xs text-center"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveChild(idx)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 cursor-pointer"
                          title="Remove child"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF9933] to-[#FF6F00] hover:from-[#FF6F00] hover:to-[#E65100] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-[#FF9933]/25 cursor-pointer transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Family Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
