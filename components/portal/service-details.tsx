"use client";

import React, { useState, useRef, useEffect } from "react";
import { ServiceItem, DocumentRequirement, FormField } from "@/types/portal";
import {
  ArrowLeft,
  ArrowRight,
  Menu,
  Plus,
  Trash2,
  X,
  FilePlus2,
  ListPlus,
  FileText,
  Info,
  CheckCircle2,
  Settings,
  Globe,
  Check,
  ExternalLink,
} from "lucide-react";
import {
  getFieldConstraintType,
  sanitizePhoneNumber,
  formatAadhaarNumber,
  formatPanNumber
} from "@/lib/field-validation";

export const DEFAULT_APPLICANT_FIELDS: FormField[] = [
  { label: "Aadhaar number", type: "text", required: true, placeholder: "Enter 12-digit Aadhaar number" },
  { label: "Virtual ID number", type: "text", required: false, placeholder: "Enter 16-digit Virtual ID" },
  { label: "Name", type: "text", required: true, placeholder: "Full legal name as per records" },
  { label: "Mail ID", type: "email", required: true, placeholder: "Email address for notifications" },
  { label: "Phone number", type: "tel", required: true, placeholder: "10-digit mobile number" },
  { label: "State", type: "text", required: true, placeholder: "State name (e.g. Telangana)" },
  { label: "District", type: "text", required: true, placeholder: "District name" },
  { label: "Mandal", type: "text", required: true, placeholder: "Mandal / Tahsil name" },
  { label: "Colony", type: "text", required: false, placeholder: "Colony / Locality / Street" },
  { label: "Pin code", type: "text", required: true, placeholder: "6-digit postal PIN code" },
  { label: "Website URL", type: "text", required: false, placeholder: "https://example.gov.in" },
];

const DEFAULT_REQUIRED_DOCS: DocumentRequirement[] = [
  { label: "Aadhaar Card", required: true },
  { label: "Passport Size Photograph", required: true },
  { label: "Application Identity Proof", required: true },
];

interface ServiceDetailsProps {
  service: ServiceItem;
  onBack: () => void;
  onSave: (updated: ServiceItem) => void;
}

// Modal A: Edit Basic Details (Service Name, Fee, Portal URL)
export const ManageBasicDetailsModal: React.FC<{
  service: ServiceItem;
  onClose: () => void;
  onSave: (details: { name: string; category: string; price: string; officialUrl?: string }) => void;
}> = ({ service, onClose, onSave }) => {
  const [name, setName] = useState(service.name || "");
  const [category, setCategory] = useState(service.category || "");
  const [price, setPrice] = useState(service.price || "");
  const [officialUrl, setOfficialUrl] = useState(service.officialUrl || "");

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name: name.trim(), category: category.trim(), price: price.trim(), officialUrl: officialUrl.trim() });
    onClose();
  };

  const getCleanTestUrl = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return "";
    return trimmed.startsWith("http://") || trimmed.startsWith("https://") ? trimmed : `https://${trimmed}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg p-6 space-y-4 animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#FFF3E0] dark:bg-amber-950/60 border border-[#FFE082] dark:border-amber-800 text-[#E65100] dark:text-amber-400">
              <Settings className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Edit Basic Details
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Service Name, Statutory Fee, and Official Dept Portal URL
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleApply} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Service Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Police Verification"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF9933] transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Catalog Group / Department
              </label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Meeseva or Police Dept"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF9933] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Statutory Fee (Tariff in ₹)
              </label>
              <input
                type="text"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 180 or Free"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF9933] transition-colors"
              />
            </div>
          </div>

          {/* Dedicated Official Dept Portal URL section */}
          <div className="p-3.5 rounded-2xl bg-[#E8EEF5]/50 dark:bg-blue-950/20 border border-[#BBDEFB] dark:border-blue-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[#000080] dark:text-blue-300 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[#000080] dark:text-blue-400" />
                <span>Official Dept Portal URL</span>
              </label>
              {officialUrl.trim() && (
                <a
                  href={getCleanTestUrl(officialUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-[#000080] dark:text-blue-400 hover:underline flex items-center gap-1 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <span>Test Link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <input
              type="text"
              value={officialUrl}
              onChange={(e) => setOfficialUrl(e.target.value)}
              placeholder="https://tspolice.gov.in"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-[#000080] transition-colors font-mono"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5 pt-0.5">
              <Info className="w-3.5 h-3.5 text-[#000080] dark:text-blue-400 shrink-0 mt-0.5" />
              <span>
                <strong>Instant Propagation:</strong> Enter the official government department or ministry portal URL (e.g. <code>https://tspolice.gov.in</code>). Updates immediately apply to Citizen service forms and Kiosk Owner consoles.
              </span>
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF9933] to-[#FF6F00] hover:from-[#FF6F00] hover:to-[#E65100] text-white text-xs font-bold cursor-pointer transition-all shadow-md shadow-[#FF9933]/25 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save & Propagate Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal B: Manage Required Documents
export const ManageDocsModal: React.FC<{
  docs: DocumentRequirement[];
  onClose: () => void;
  onSave: (docs: DocumentRequirement[]) => void;
}> = ({ docs, onClose, onSave }) => {
  const [list, setList] = useState<DocumentRequirement[]>([...docs]);
  const [newLabel, setNewLabel] = useState("");

  const addDoc = () => {
    const trimmed = newLabel.trim();
    if (!trimmed) return;
    setList((prev) => [...prev, { label: trimmed, required: true }]);
    setNewLabel("");
  };

  const removeDoc = (idx: number) =>
    setList((prev) => prev.filter((_, i) => i !== idx));

  const handleApply = () => {
    onSave(list);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-[#000080] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#138808]" />
            📄 Manage Required Documents
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {list.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-6">No required documents added yet.</p>
          )}
          {list.map((doc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#138808]" />
                <span className="text-slate-800 font-semibold">{doc.label}</span>
              </div>
              <button
                type="button"
                onClick={() => removeDoc(idx)}
                className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 cursor-pointer transition-colors"
                title="Remove Document"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addDoc()}
            placeholder="e.g. Income Certificate"
            className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#138808] text-slate-900"
          />
          <button
            type="button"
            onClick={addDoc}
            className="px-3.5 py-2 rounded-xl bg-[#138808] hover:bg-[#0e6606] text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition-colors shadow-sm"
          >
            Save Documents
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal C: Edit Applicant Information Fields
export const ManageFieldsModal: React.FC<{
  fields: FormField[];
  onClose: () => void;
  onSave: (fields: FormField[]) => void;
}> = ({ fields, onClose, onSave }) => {
  const [list, setList] = useState<FormField[]>([...fields]);
  const [newLabel, setNewLabel] = useState("");
  const [newType, setNewType] = useState<FormField["type"]>("text");

  const addField = () => {
    const trimmed = newLabel.trim();
    if (!trimmed) return;
    setList((prev) => [...prev, { label: trimmed, type: newType, required: true }]);
    setNewLabel("");
  };

  const removeField = (idx: number) =>
    setList((prev) => prev.filter((_, i) => i !== idx));

  const handleApply = () => {
    onSave(list);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ListPlus className="w-4 h-4 text-indigo-500" />
            📝 Edit Applicant Information Fields
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {list.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-6">No fields added yet.</p>
          )}
          {list.map((field, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span className="text-slate-800 font-semibold">{field.label}</span>
                <span className="text-[10px] text-slate-400 font-mono">({field.type})</span>
              </div>
              <button
                type="button"
                onClick={() => removeField(idx)}
                className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 cursor-pointer transition-colors"
                title="Remove Field"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addField()}
            placeholder="e.g. Bank Account Number"
            className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500 text-slate-900"
          />
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value as FormField["type"])}
            className="px-2 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none text-slate-900 bg-white"
          >
            <option value="text">text</option>
            <option value="tel">tel</option>
            <option value="email">email</option>
            <option value="number">number</option>
            <option value="date">date</option>
            <option value="textarea">textarea</option>
          </select>
          <button
            type="button"
            onClick={addField}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition-colors shadow-sm"
          >
            Save Fields
          </button>
        </div>
      </div>
    </div>
  );
};

export const ServiceDetails: React.FC<ServiceDetailsProps> = ({ service, onBack, onSave }) => {
  const [currentService, setCurrentService] = useState<ServiceItem>(service);
  const [docs, setDocs] = useState<DocumentRequirement[]>(
    service.docs && service.docs.length > 0 ? service.docs : DEFAULT_REQUIRED_DOCS
  );
  const [fields, setFields] = useState<FormField[]>(
    service.fields && service.fields.length > 0 ? service.fields : DEFAULT_APPLICANT_FIELDS
  );
  const [ownerNote, setOwnerNote] = useState(service.note || "");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showBasicModal, setShowBasicModal] = useState(false);
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [showFieldsModal, setShowFieldsModal] = useState(false);
  const [savedSuccessToast, setSavedSuccessToast] = useState(false);
  const [activeMobileSection, setActiveMobileSection] = useState<"docs" | "applicant">("docs");
  const menuRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diffX = e.changedTouches[0].clientX - touchStartXRef.current;
    const diffY = e.changedTouches[0].clientY - touchStartYRef.current;
    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0 && activeMobileSection === "docs") {
        setActiveMobileSection("applicant");
      } else if (diffX > 0 && activeMobileSection === "applicant") {
        setActiveMobileSection("docs");
      }
    }
  };

  useEffect(() => {
    setCurrentService(service);
    if (service.docs && service.docs.length > 0) setDocs(service.docs);
    if (service.fields && service.fields.length > 0) setFields(service.fields);
    if (service.note !== undefined) setOwnerNote(service.note);
  }, [service]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, []);

  const triggerToast = () => {
    setSavedSuccessToast(true);
    setTimeout(() => setSavedSuccessToast(false), 2500);
  };

  const handleSaveBasicDetails = (details: { name: string; category: string; price: string; officialUrl?: string }) => {
    const updated: ServiceItem = {
      ...currentService,
      name: details.name,
      category: details.category,
      price: details.price,
      officialUrl: details.officialUrl,
      docs,
      fields,
      note: ownerNote
    };
    setCurrentService(updated);
    onSave(updated);
    triggerToast();
  };

  const handleSaveDocs = (updatedDocs: DocumentRequirement[]) => {
    setDocs(updatedDocs);
    const updated: ServiceItem = {
      ...currentService,
      docs: updatedDocs,
      fields,
      note: ownerNote
    };
    setCurrentService(updated);
    onSave(updated);
    triggerToast();
  };

  const handleSaveFields = (updatedFields: FormField[]) => {
    setFields(updatedFields);
    const updated: ServiceItem = {
      ...currentService,
      docs,
      fields: updatedFields,
      note: ownerNote
    };
    setCurrentService(updated);
    onSave(updated);
    triggerToast();
  };

  const handleOwnerNoteChange = (note: string) => {
    setOwnerNote(note);
    const updated: ServiceItem = {
      ...currentService,
      docs,
      fields,
      note
    };
    setCurrentService(updated);
    onSave(updated);
  };

  return (
    <div className="min-h-screen bg-white border-slate-200 text-slate-800 animate-in fade-in duration-200">
      {/* Dynamic Save Notification Toast */}
      {savedSuccessToast && (
        <div className="fixed top-5 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white shadow-xl shadow-slate-900/20 text-xs font-semibold animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Service configuration updated successfully</span>
        </div>
      )}

      {/* Top Bar - Responsive layout fitting mobile without overflowing */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between shadow-xs gap-2">
        {/* Left: Back button calling onBack (setEditorService(null)) */}
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 sm:gap-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl transition-colors cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Catalog</span>
          <span className="sm:hidden">Back</span>
        </button>

        {/* Center: Service Identity */}
        <div className="flex items-center gap-2 sm:gap-2.5 text-center min-w-0 flex-1 justify-center max-w-sm sm:max-w-md">
          <span className="text-lg sm:text-xl p-1 sm:p-1.5 rounded-xl bg-slate-100 border border-slate-200 shrink-0">
            {currentService.icon || "📄"}
          </span>
          <div className="text-left min-w-0">
            <h1 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight flex items-center gap-1.5 truncate">
              <span className="truncate">{currentService.name}</span>
              <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-[#FFF3E0] text-[#E65100] border border-[#FFE082] font-mono shrink-0">
                #{currentService.id}
              </span>
            </h1>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">
              {currentService.category} • Statutory Portal Configuration
            </p>
          </div>
        </div>

        {/* Right: Circular button containing 3-line hamburger menu icon (Menu from lucide-react) */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer shadow-xs ${
              menuOpen
                ? "bg-[#000080] border-[#000080] text-white"
                : "bg-white border-slate-300 text-[#000080] hover:bg-slate-50 hover:border-[#000080]"
            }`}
            title="Service Options Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Menu Dropdown with 3 Distinct Management Options */}
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Option A: Edit Basic Details - Saffron Theme */}
              <button
                type="button"
                onClick={() => {
                  setShowBasicModal(true);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-xs text-slate-700 hover:bg-[#FFF8E1]/60 border-b border-slate-100 transition-colors cursor-pointer text-left"
              >
                <span className="w-8 h-8 rounded-xl bg-[#FFF3E0] border border-[#FFE082] flex items-center justify-center text-[#E65100] shrink-0">
                  <Settings className="w-4 h-4" />
                </span>
                <div>
                  <p className="font-bold text-slate-900">⚙ Edit Basic Details</p>
                  <p className="text-[10px] text-slate-400">Service Name, Fee, Portal URL</p>
                </div>
              </button>

              {/* Option B: Manage Required Documents - India Green Theme */}
              <button
                type="button"
                onClick={() => {
                  setShowDocsModal(true);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-xs text-slate-700 hover:bg-[#E8F5E9]/60 border-b border-slate-100 transition-colors cursor-pointer text-left"
              >
                <span className="w-8 h-8 rounded-xl bg-[#E8F5E9] border border-[#C8E6C9] flex items-center justify-center text-[#138808] shrink-0">
                  <FileText className="w-4 h-4" />
                </span>
                <div>
                  <p className="font-bold text-slate-900">📄 Manage Required Documents</p>
                  <p className="text-[10px] text-slate-400">{docs.length} document(s) configured</p>
                </div>
              </button>

              {/* Option C: Edit Applicant Information Fields - Ashoka Navy Theme */}
              <button
                type="button"
                onClick={() => {
                  setShowFieldsModal(true);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-xs text-slate-700 hover:bg-[#E8EEF5]/60 transition-colors cursor-pointer text-left"
              >
                <span className="w-8 h-8 rounded-xl bg-[#E8EEF5] border border-[#BBDEFB] flex items-center justify-center text-[#000080] shrink-0">
                  <ListPlus className="w-4 h-4" />
                </span>
                <div>
                  <p className="font-bold text-slate-900">📝 Edit Applicant Information Fields</p>
                  <p className="text-[10px] text-slate-400">{fields.length} form field(s) configured</p>
                </div>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Two-Column Layout with Mobile Swipe Controller & Touch Gestures */}
      <main
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-8"
      >
        {/* Mobile Swipe Navigation Bar with Directional Indicator Arrows (Requirement 2) */}
        <div className="lg:hidden mb-4">
          <div className="flex items-center justify-between p-1.5 rounded-2xl bg-white border border-slate-200 shadow-md gap-1.5">
            <button
              type="button"
              onClick={() => setActiveMobileSection("docs")}
              disabled={activeMobileSection === "docs"}
              aria-label="Previous Section: Required Documents"
              className={`p-2 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                activeMobileSection === "docs"
                  ? "opacity-30 text-slate-400 cursor-not-allowed"
                  : "bg-slate-100 text-slate-700 hover:bg-[#FF9933] hover:text-white"
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex-1 grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setActiveMobileSection("docs")}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer truncate ${
                  activeMobileSection === "docs"
                    ? "bg-gradient-to-r from-[#FF9933] to-[#FF6F00] text-white shadow-sm shadow-[#FF9933]/30"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>📄</span>
                <span className="truncate">Documents ({docs.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMobileSection("applicant")}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer truncate ${
                  activeMobileSection === "applicant"
                    ? "bg-gradient-to-r from-[#000080] to-[#1E3A8A] text-white shadow-sm shadow-blue-900/30"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>📝</span>
                <span className="truncate">Applicant Info</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setActiveMobileSection("applicant")}
              disabled={activeMobileSection === "applicant"}
              aria-label="Next Section: Applicant Information"
              className={`p-2 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                activeMobileSection === "applicant"
                  ? "opacity-30 text-slate-400 cursor-not-allowed"
                  : "bg-slate-100 text-slate-700 hover:bg-[#000080] hover:text-white"
              }`}
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-1.5 px-2 flex items-center justify-between text-[11px] text-slate-500">
            {activeMobileSection === "docs" ? (
              <span className="flex items-center gap-1 text-[#E65100] font-medium">
                <span>👈 Swipe left or tap arrow for Applicant Info</span>
                <ArrowRight className="w-3 h-3 animate-pulse inline" />
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[#000080] font-medium">
                <ArrowLeft className="w-3 h-3 animate-pulse inline" />
                <span>Swipe right or tap arrow for Documents 👉</span>
              </span>
            )}
            <span className="font-mono text-[10px] text-slate-400">
              {activeMobileSection === "docs" ? "Step 1 of 2" : "Step 2 of 2"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* ================= LEFT CARD: Required Documents ================= */}
          <div
            className={`bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col ${
              activeMobileSection === "docs" ? "block" : "hidden lg:flex"
            }`}
          >
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-700" />
              <h2 className="text-sm font-extrabold text-slate-900">Required Documents</h2>
            </div>
            {/* Active Statutory Fee badge */}
            <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 text-xs font-black shadow-xs tracking-wide">
              {currentService.price
                ? currentService.price.startsWith("₹")
                  ? currentService.price
                  : `₹${currentService.price}`
                : "₹20"}
            </span>
          </div>

          <div className="p-5 space-y-5 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Instruction note box */}
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#FFF8E1] border border-[#FFE082] text-slate-800">
                <Info className="w-4 h-4 text-[#FF9933] shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Upload clear, legible scans of original documents. Files must be under 5 MB each. Accepted formats:{" "}
                  <strong className="text-[#000080]">PDF, JPG, PNG</strong>.
                </p>
              </div>

              {/* Dynamic upload inputs for each required document */}
              {docs.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                  No documents required currently. Use the top menu to add documents.
                </div>
              ) : (
                <div className="space-y-3.5">
                  {docs.map((doc, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-slate-700">
                          {doc.label}
                          {doc.required && <span className="text-rose-500 ml-0.5">*</span>}
                        </label>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">
                          {doc.required ? "Mandatory" : "Optional"}
                        </span>
                      </div>
                      <label className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/60 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/20 transition-all group">
                        <Plus className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                        <span className="text-xs text-slate-600 group-hover:text-indigo-700 font-medium truncate flex-1">
                          Choose file for {doc.label}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-500 font-bold">
                          Browse
                        </span>
                        <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Owner instructions textarea */}
            <div className="space-y-1.5 pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700">
                Owner Instructions
              </label>
              <textarea
                rows={3}
                value={ownerNote}
                onChange={(e) => handleOwnerNoteChange(e.target.value)}
                placeholder="Enter processing guidelines or special remarks for the operating owner..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none transition-colors"
              />
              <p className="text-[10px] text-slate-400">
                These instructions will be displayed directly to the assigned operator when handling citizen submissions.
              </p>
            </div>

            {/* Quick Mobile Navigation to Applicant Info */}
            <div className="lg:hidden pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveMobileSection("applicant")}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#FF9933] to-[#FF6F00] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <span>Continue to Applicant Information</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ================= RIGHT CARD: Applicant Information ================= */}
        <div
          className={`bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col ${
            activeMobileSection === "applicant" ? "block" : "hidden lg:flex"
          }`}
        >
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListPlus className="w-4 h-4 text-slate-700" />
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">Applicant Information</h2>
                {/* Subtitle "All fields verified by portal" */}
                <p className="text-[11px] text-slate-500 font-medium">All fields verified by portal</p>
              </div>
            </div>
            <span className="text-[10px] text-slate-600 bg-white border border-slate-200 rounded-full px-2.5 py-0.5 font-bold shadow-xs">
              {fields.length} Fields Configured
            </span>
          </div>

          <div className="p-5 flex-1">
            {fields.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                No applicant information fields configured. Use the top menu to add form fields.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fields.map((field, idx) => {
                  const isWide =
                    field.full ||
                    field.type === "textarea" ||
                    field.label.toLowerCase().includes("website") ||
                    field.label.toLowerCase().includes("address") ||
                    field.label.toLowerCase().includes("colony");

                  const constraintType = getFieldConstraintType(field.label, field.type);
                  return (
                    <div key={idx} className={`space-y-1.5 ${isWide ? "sm:col-span-2" : ""}`}>
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-slate-700">
                          {field.label}
                          {field.required && <span className="text-rose-500 ml-0.5">*</span>}
                        </label>
                        {constraintType === "phone" && (
                          <span className="text-[10px] text-slate-400 font-normal">10 digits</span>
                        )}
                        {constraintType === "aadhaar" && (
                          <span className="text-[10px] text-slate-400 font-normal">12 digits</span>
                        )}
                        {constraintType === "pan" && (
                          <span className="text-[10px] text-slate-400 font-normal">10-char CAPS</span>
                        )}
                      </div>
                      {field.type === "textarea" ? (
                        <textarea
                          rows={2}
                          placeholder={field.placeholder || `Enter ${field.label}`}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none transition-colors"
                        />
                      ) : (
                        <input
                          type={constraintType === "phone" ? "tel" : "text"}
                          inputMode={constraintType === "phone" || constraintType === "aadhaar" ? "numeric" : undefined}
                          maxLength={constraintType === "phone" ? 10 : constraintType === "aadhaar" ? 14 : constraintType === "pan" ? 10 : undefined}
                          onChange={(e) => {
                            if (constraintType === "phone") {
                              e.target.value = sanitizePhoneNumber(e.target.value);
                            } else if (constraintType === "aadhaar") {
                              e.target.value = formatAadhaarNumber(e.target.value).formatted;
                            } else if (constraintType === "pan") {
                              e.target.value = formatPanNumber(e.target.value);
                            }
                          }}
                          placeholder={
                            field.placeholder ||
                            (constraintType === "phone"
                              ? "10-digit mobile number"
                              : constraintType === "aadhaar"
                              ? "12-digit Aadhaar (e.g. 9876 5432 1098)"
                              : constraintType === "pan"
                              ? "10-character PAN (e.g. ABCDE1234F)"
                              : `Enter ${field.label}`)
                          }
                          className={`w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors ${
                            constraintType === "pan" ? "uppercase font-mono" : ""
                          } ${constraintType === "aadhaar" ? "font-mono" : ""}`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {/* Quick Mobile Navigation back to Docs */}
            <div className="lg:hidden pt-4 mt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveMobileSection("docs")}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 border border-slate-200 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Required Documents</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

      {/* Modals for Document, Basic Details & Field Customization */}
      {showBasicModal && (
        <ManageBasicDetailsModal
          service={currentService}
          onClose={() => setShowBasicModal(false)}
          onSave={handleSaveBasicDetails}
        />
      )}
      {showDocsModal && (
        <ManageDocsModal
          docs={docs}
          onClose={() => setShowDocsModal(false)}
          onSave={handleSaveDocs}
        />
      )}
      {showFieldsModal && (
        <ManageFieldsModal
          fields={fields}
          onClose={() => setShowFieldsModal(false)}
          onSave={handleSaveFields}
        />
      )}
    </div>
  );
};
