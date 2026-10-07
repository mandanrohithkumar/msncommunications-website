"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePortal } from "@/lib/portal-store";
import { ServiceItem, UploadedFileMeta } from "@/types/portal";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  FileCheck,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Lock,
  ExternalLink,
  Sparkles,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Focus
} from "lucide-react";
import {
  getFieldConstraintType,
  sanitizePhoneNumber,
  formatAadhaarNumber,
  formatPanNumber,
  validatePhoneNumber,
  validateAadhaarNumber,
  validatePanNumber,
  validateEmailAddress,
  validateDateOfBirth,
  calculateAge,
  validateColonyStreet,
  validatePincode,
  buildSmartAddress,
  formatJurisdictionLabel
} from "@/lib/field-validation";
import { FileUploadBox } from "@/components/FileUploadBox";
import { CascadingLocationSelector } from "@/components/portal/cascading-location-selector";

export const DynamicForm: React.FC = () => {
  const {
    selectedService,
    goBack,
    submitApplication,
    user,
    setPreviewDoc,
    t
  } = usePortal();

  const [formData, setFormData] = useState<Record<string, string>>({
    "Full Name": user?.name || "",
    "Phone Number": user?.phone || "",
    "Email ID": user?.email || "",
    "State": "Telangana",
    "District": "Nagarkurnool",
    "Mandal": "Nagarkurnool",
    "Colony / Locality / Street Name": "",
    "Pincode": "509209",
    "Address": buildSmartAddress("", "Nagarkurnool", "Nagarkurnool", "Telangana", "509209")
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        "Full Name": user.name || prev["Full Name"] || "",
        "Phone Number": user.phone || prev["Phone Number"] || "",
        "Email ID": user.email || prev["Email ID"] || ""
      }));
    }
  }, [user]);

  const [attachedFiles, setAttachedFiles] = useState<Record<string, UploadedFileMeta>>({});
  const [ownerNote, setOwnerNote] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [errorFieldId, setErrorFieldId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const errorBannerRef = useRef<HTMLDivElement>(null);

  // Maximum allowed date for Date of Birth (strictly prevents future dates)
  const todayString = new Date().toISOString().split("T")[0];

  if (!selectedService) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 dark:text-slate-400">No service selected.</p>
        <button
          onClick={goBack}
          className="mt-4 px-4 py-2 rounded-full bg-indigo-600 text-white text-xs font-semibold cursor-pointer shadow-md"
        >
          {t("form.return_services")}
        </button>
      </div>
    );
  }

  // Smooth scroll and auto-focus helper (Requirement 3)
  const focusAndScrollToField = (elementId: string) => {
    // Scroll error banner into view first
    if (errorBannerRef.current) {
      errorBannerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    setTimeout(() => {
      const el = document.getElementById(elementId) as HTMLInputElement | HTMLSelectElement | null;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus();
      }
    }, 250);
  };

  const handleFieldChange = (label: string, value: string, inputType?: string) => {
    const constraintType = getFieldConstraintType(label, inputType);
    let updatedValue = value;

    if (constraintType === "phone") {
      // 1. Phone Number: strictly numeric characters (0-9), max 10 digits
      updatedValue = sanitizePhoneNumber(value);
    } else if (constraintType === "aadhaar") {
      // 2. Aadhaar Number: strictly numeric characters (0-9), max 12 digits, formatted with spaces
      updatedValue = formatAadhaarNumber(value).formatted;
    } else if (constraintType === "pan") {
      // 3. PAN Number: auto uppercase in real time + standard 10-char format (5 letters, 4 numbers, 1 letter)
      updatedValue = formatPanNumber(value);
    } else if (constraintType === "dob") {
      // 4. Date of Birth: enforce max today
      updatedValue = value;
      if (value && value > todayString) {
        setValidationError(`Date of Birth cannot be in the future (selected: ${value}).`);
        setErrorFieldId(`input-${label.replace(/[^a-zA-Z0-9]/g, "-")}`);
      } else if (errorFieldId === `input-${label.replace(/[^a-zA-Z0-9]/g, "-")}`) {
        setValidationError(null);
        setErrorFieldId(null);
      }
    } else {
      // 5. General Text Fields
      updatedValue = value;
    }

    setFormData((prev) => ({ ...prev, [label]: updatedValue }));

    // Clear error if active field is modified
    if (errorFieldId && errorFieldId.includes(label.replace(/[^a-zA-Z0-9]/g, "-"))) {
      setValidationError(null);
      setErrorFieldId(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setErrorFieldId(null);

    // 1. Validate General & Dynamic Fields
    for (const field of selectedService.fields) {
      // Skip fields that are handled by CascadingLocationSelector
      const norm = field.label.toLowerCase().trim();
      if (
        [
          "district",
          "mandal",
          "pincode",
          "pin code",
          "colony / locality / street name",
          "colony",
          "locality",
          "street name",
          "street",
          "village / mandal"
        ].includes(norm)
      ) {
        continue;
      }

      const val = (formData[field.label] || "").trim();
      const fieldDomId = `input-${field.label.replace(/[^a-zA-Z0-9]/g, "-")}`;

      if (field.required && !val) {
        const msg = `Please fill out the required field: ${field.label}`;
        setValidationError(msg);
        setErrorFieldId(fieldDomId);
        focusAndScrollToField(fieldDomId);
        return;
      }

      if (val) {
        const constraintType = getFieldConstraintType(field.label, field.type);

        if (constraintType === "phone") {
          const res = validatePhoneNumber(val);
          if (!res.valid) {
            setValidationError(res.error || `Please enter a valid 10-digit phone number for ${field.label}`);
            setErrorFieldId(fieldDomId);
            focusAndScrollToField(fieldDomId);
            return;
          }
        } else if (constraintType === "aadhaar") {
          const res = validateAadhaarNumber(val, field.label);
          if (!res.valid) {
            setValidationError(res.error || `${field.label} must be exactly 12 digits.`);
            setErrorFieldId(fieldDomId);
            focusAndScrollToField(fieldDomId);
            return;
          }
        } else if (constraintType === "pan") {
          const res = validatePanNumber(val, field.label);
          if (!res.valid) {
            setValidationError(res.error || `${field.label} must be a valid 10-character PAN.`);
            setErrorFieldId(fieldDomId);
            focusAndScrollToField(fieldDomId);
            return;
          }
        } else if (constraintType === "dob") {
          const res = validateDateOfBirth(val, field.label);
          if (!res.valid) {
            setValidationError(res.error || `${field.label} is invalid.`);
            setErrorFieldId(fieldDomId);
            focusAndScrollToField(fieldDomId);
            return;
          }
        } else if (field.type === "email" || norm.includes("email")) {
          const res = validateEmailAddress(val);
          if (!res.valid) {
            setValidationError(res.error || `Please enter a valid email for ${field.label}`);
            setErrorFieldId(fieldDomId);
            focusAndScrollToField(fieldDomId);
            return;
          }
        }
      }
    }

    // 2. Validate Top-Level Applicant Phone Number
    if (formData["Phone Number"]) {
      const phoneRes = validatePhoneNumber(formData["Phone Number"]);
      if (!phoneRes.valid) {
        setValidationError(phoneRes.error || "Phone Number must be exactly 10 digits.");
        setErrorFieldId("input-Phone-Number");
        focusAndScrollToField("input-Phone-Number");
        return;
      }
    }

    // 3. Validate Top-Level Email ID
    if (formData["Email ID"]) {
      const emailRes = validateEmailAddress(formData["Email ID"]);
      if (!emailRes.valid) {
        setValidationError(emailRes.error || "Please enter a valid Email ID.");
        setErrorFieldId("input-Email-ID");
        focusAndScrollToField("input-Email-ID");
        return;
      }
    }

    // 4. Validate Telangana Location Details (Colony / Street is Required *)
    const colonyStreet = (formData["Colony / Locality / Street Name"] || "").trim();
    const colonyRes = validateColonyStreet(colonyStreet, "Colony / Locality / Street Name");
    if (!colonyRes.valid) {
      setValidationError(colonyRes.error || "Please enter your Colony / Locality / Street Name.");
      setErrorFieldId("location-colony-street");
      focusAndScrollToField("location-colony-street");
      return;
    }

    // 5. Validate Pincode (Strictly 6 Digits)
    const pin = (formData["Pincode"] || "").trim();
    const pinRes = validatePincode(pin);
    if (!pinRes.valid) {
      setValidationError(pinRes.error || "Pincode must be exactly 6 digits.");
      setErrorFieldId("location-pincode");
      focusAndScrollToField("location-pincode");
      return;
    }

    // 6. Validate Required Documents
    for (const doc of selectedService.docs) {
      if (doc.required && !attachedFiles[doc.label]) {
        setValidationError(`Please upload the required document: ${doc.label}`);
        setErrorFieldId(`doc-box-${doc.label.replace(/[^a-zA-Z0-9]/g, "-")}`);
        if (errorBannerRef.current) {
          errorBannerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        return;
      }
    }

    // Form submission
    setIsSubmitting(true);
    setTimeout(() => {
      submitApplication(selectedService, formData, ownerNote, attachedFiles);
      setIsSubmitting(false);
    }, 400);
  };

  // Form completeness metrics
  const requiredFieldsCount = selectedService.fields.filter((f) => f.required).length + 1; // +1 for Colony/Street
  const filledRequiredFieldsCount =
    selectedService.fields.filter((f) => f.required && (formData[f.label] || "").trim()).length +
    (formData["Colony / Locality / Street Name"]?.trim() ? 1 : 0);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="relative flex flex-col items-center text-center mb-6">
        <button
          onClick={goBack}
          className="md:absolute left-0 top-1/2 md:-translate-y-1/2 mb-4 md:mb-0 px-4 py-2 rounded-full bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors flex items-center gap-1.5 cursor-pointer backdrop-blur-md shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <div className="flex items-center gap-2.5">
          <span className="text-3xl">{selectedService.icon}</span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {selectedService.name} Application
          </h1>
        </div>
        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-lg">
          Complete the required verified documents and citizen information below
        </p>
      </div>

      {/* REQUIREMENT 1: AUTO-FILLING PREVIEW / UPPER STRUCTURED BOXES */}
      <div className="mb-6 p-4 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-indigo-500/10 border border-amber-500/20 dark:border-amber-500/30 backdrop-blur-md shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 mb-3 border-b border-amber-500/20 gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#FF9933] text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                Application Live Profile & Address Summary
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                All fields dynamically synchronize and reflect in real time
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
              Form Progress: {filledRequiredFieldsCount}/{requiredFieldsCount} Required
            </span>
          </div>
        </div>

        {/* Structured Upper Grid Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
          {/* Box 1: Citizen Name */}
          <div className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 flex items-start gap-2 shadow-xs">
            <User className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                Citizen Name
              </span>
              <span className="block text-[11px] font-bold text-slate-900 dark:text-white truncate">
                {formData["Full Name"] || "Awaiting entry..."}
              </span>
            </div>
          </div>

          {/* Box 2: Contact Info */}
          <div className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 flex items-start gap-2 shadow-xs">
            <Phone className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                Phone & Email
              </span>
              <span className="block text-[11px] font-bold text-slate-900 dark:text-white truncate">
                {formData["Phone Number"] || "No Phone"} • {formData["Email ID"]?.split("@")[0] || "No Email"}
              </span>
            </div>
          </div>

          {/* Box 3: Jurisdiction (Deduplicated: shows unique name once if Mandal === District) */}
          <div className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 flex items-start gap-2 shadow-xs">
            <MapPin className="w-4 h-4 text-[#FF9933] shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                Jurisdiction
              </span>
              <span className="block text-[11px] font-bold text-slate-900 dark:text-white truncate">
                {formatJurisdictionLabel(formData["Mandal"], formData["District"])}
              </span>
            </div>
          </div>

          {/* Box 4: Live Formatted Address (Smart concatenated, non-repeating) */}
          <div className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 flex items-start gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                Live Address
              </span>
              <span
                className="block text-[11px] font-bold text-slate-900 dark:text-white truncate"
                title={formData["Address"]}
              >
                {formData["Address"] || "Awaiting address entry..."}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* REQUIREMENT 3: SMART ERROR HANDLING BANNER WITH JUMP-TO-FIELD BUTTON */}
      {validationError && (
        <div
          ref={errorBannerRef}
          className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-500/50 text-rose-700 dark:text-rose-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in shake duration-200 shadow-md"
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <span className="font-semibold">{validationError}</span>
          </div>
          {errorFieldId && (
            <button
              type="button"
              onClick={() => focusAndScrollToField(errorFieldId)}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] flex items-center gap-1.5 shrink-0 self-end sm:self-center cursor-pointer shadow-xs transition-colors"
            >
              <Focus className="w-3.5 h-3.5" />
              <span>Fix Field Now</span>
            </button>
          )}
        </div>
      )}

      {/* Main 2-Column Form Layout */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
          {/* Left Column: Documents & Special Instructions (5 cols) */}
          <div className="lg:col-span-5 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-6 md:p-7 backdrop-blur-md space-y-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">
                Required Documents
              </h3>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#E8F5E9] text-[#138808] border border-[#C8E6C9] dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40">
                {selectedService.price === "Free" ? "Free" : `₹${selectedService.price}`}
              </span>
            </div>

            {/* Service note banner */}
            <div className="p-3.5 rounded-xl bg-[#FFF8E1] dark:bg-amber-950/30 border border-[#FFE082] dark:border-amber-900/40 text-[#B78103] dark:text-amber-300 text-xs font-medium flex items-center gap-2 leading-relaxed">
              <span>📌</span>
              <span>Note: {selectedService.note || "Please submit accurate official documents."}</span>
            </div>

            {/* Document Uploads List */}
            <div className="space-y-3.5">
              {selectedService.docs.map((doc) => {
                const isAttached = attachedFiles[doc.label];
                return (
                  <div key={doc.label} id={`doc-box-${doc.label.replace(/[^a-zA-Z0-9]/g, "-")}`}>
                    <FileUploadBox
                      label={doc.label}
                      required={doc.required}
                      acceptedTypes={doc.acceptedTypes || [".pdf", ".jpg", ".jpeg", ".png"]}
                      currentFile={isAttached}
                      onConfirmUpload={(_file, fileMeta) => {
                        setAttachedFiles((prev) => ({
                          ...prev,
                          [doc.label]: fileMeta
                        }));
                        setValidationError(null);
                        setErrorFieldId(null);
                      }}
                      onRemove={() => {
                        setAttachedFiles((prev) => {
                          const copy = { ...prev };
                          delete copy[doc.label];
                          return copy;
                        });
                      }}
                      onView={(meta) => {
                        setPreviewDoc(meta);
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Note / Special Instructions for Owner */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                {t("form.special_instructions")}
              </label>
              <textarea
                rows={3}
                value={ownerNote}
                onChange={(e) => setOwnerNote(e.target.value)}
                placeholder={t("form.owner_note_placeholder")}
                className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none transition-colors"
              />
            </div>
          </div>

          {/* Right Column: Basic Details Dynamic Inputs (7 cols) */}
          <div className="lg:col-span-7 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-6 md:p-7 backdrop-blur-md space-y-5 shadow-sm">
            <div className="pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">
                {t("form.applicant_info")}
              </h3>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {t("form.all_verified")}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedService.fields
                .filter(
                  (f) =>
                    !f.label.toLowerCase().includes("website url") &&
                    f.label.toLowerCase() !== "website" &&
                    f.label.toLowerCase() !== "portal url" &&
                    ![
                      "district",
                      "mandal",
                      "pincode",
                      "pin code",
                      "colony / locality / street name",
                      "colony",
                      "locality",
                      "street name",
                      "street",
                      "village / mandal"
                    ].includes(f.label.toLowerCase().trim())
                )
                .map((field, idx) => {
                  const constraintType = getFieldConstraintType(field.label, field.type);
                  const val = formData[field.label] || "";
                  const rawDigits = val.replace(/\D/g, "");
                  const domId = `input-${field.label.replace(/[^a-zA-Z0-9]/g, "-")}`;
                  const isErroneous = errorFieldId === domId;

                  let placeholderText = `Enter ${field.label.toLowerCase()}`;
                  let helperNode = null;

                  // REQUIREMENT 2 & 4: STRICT FIELD LIMITS & DOB CONSTRAINTS
                  if (constraintType === "phone") {
                    placeholderText = "10-digit mobile number (e.g. 9848012345)";
                    if (val.length > 0 && val.length < 10) {
                      helperNode = (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                          {val.length}/10 digits
                        </span>
                      );
                    } else if (val.length === 10) {
                      helperNode = (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> 10 Digits Set
                        </span>
                      );
                    }
                  } else if (constraintType === "aadhaar") {
                    placeholderText = "12-digit Aadhaar (e.g. 9876 5432 1098)";
                    if (rawDigits.length > 0 && rawDigits.length < 12) {
                      helperNode = (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                          {rawDigits.length}/12 digits
                        </span>
                      );
                    } else if (rawDigits.length === 12) {
                      helperNode = (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> 12 Digits Set
                        </span>
                      );
                    }
                  } else if (constraintType === "pan") {
                    placeholderText = "10-character PAN (e.g. ABCDE1234F)";
                    const isCompletePan = /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(val);
                    if (val.length > 0 && !isCompletePan) {
                      helperNode = (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                          {val.length}/10 (5 letters, 4 digits, 1 letter)
                        </span>
                      );
                    } else if (isCompletePan) {
                      helperNode = (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Valid PAN
                        </span>
                      );
                    }
                  } else if (constraintType === "dob") {
                    // REQUIREMENT 4: Date of Birth Field Constraints
                    const age = calculateAge(val);
                    const isFuture = val && val > todayString;

                    if (isFuture) {
                      helperNode = (
                        <span className="text-[10px] text-rose-500 font-bold flex items-center gap-0.5">
                          <AlertCircle className="w-3 h-3" /> Future date not allowed
                        </span>
                      );
                    } else if (age !== null) {
                      helperNode = (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Age: {age} yrs
                        </span>
                      );
                    }
                  }

                  return (
                    <div
                      key={idx}
                      className={`space-y-1.5 ${field.full ? "sm:col-span-2" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                          {field.label} {field.required && <span className="text-rose-500">*</span>}
                        </label>
                        {helperNode}
                      </div>

                      {constraintType === "dob" ? (
                        <div className="relative flex items-center">
                          <input
                            id={domId}
                            type="date"
                            max={todayString}
                            min="1900-01-01"
                            required={field.required}
                            value={val}
                            onChange={(e) => handleFieldChange(field.label, e.target.value, "date")}
                            className={`w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border text-slate-900 dark:text-white focus:outline-none focus:border-[#FF9933] transition-all ${
                              isErroneous || (val && val > todayString)
                                ? "border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20"
                                : "border-slate-300 dark:border-slate-800"
                            }`}
                          />
                        </div>
                      ) : (
                        <input
                          id={domId}
                          type={constraintType === "phone" ? "tel" : field.type || "text"}
                          inputMode={
                            constraintType === "phone" || constraintType === "aadhaar"
                              ? "numeric"
                              : undefined
                          }
                          required={field.required}
                          maxLength={
                            constraintType === "phone"
                              ? 10
                              : constraintType === "aadhaar"
                              ? 14
                              : constraintType === "pan"
                              ? 10
                              : undefined
                          }
                          value={val}
                          onChange={(e) => handleFieldChange(field.label, e.target.value, field.type)}
                          placeholder={field.placeholder || placeholderText}
                          className={`w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#FF9933] transition-all ${
                            constraintType === "pan"
                              ? "uppercase font-mono tracking-wider font-semibold"
                              : ""
                          } ${constraintType === "aadhaar" ? "font-mono tracking-wider" : ""} ${
                            isErroneous
                              ? "border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20"
                              : "border-slate-300 dark:border-slate-800"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}

              {/* Cascading Location Dropdowns with Upper Preview & Pincode limits */}
              <div className="sm:col-span-2 pt-2">
                <CascadingLocationSelector
                  initialDistrict={formData["District"] || "Nagarkurnool"}
                  initialMandal={formData["Mandal"] || "Nagarkurnool"}
                  initialColonyStreet={formData["Colony / Locality / Street Name"] || ""}
                  initialPincode={formData["Pincode"] || "509209"}
                  errorField={errorFieldId === "location-colony-street" ? "Colony / Street" : null}
                  onLocationChange={({ district, mandal, colonyStreet, pincode, formattedAddress }) => {
                    setFormData((prev) => ({
                      ...prev,
                      "District": district,
                      "Mandal": mandal,
                      "Colony / Locality / Street Name": colonyStreet,
                      "Pincode": pincode,
                      "Address": formattedAddress
                    }));
                    if (
                      errorFieldId === "location-colony-street" ||
                      errorFieldId === "location-pincode"
                    ) {
                      setValidationError(null);
                      setErrorFieldId(null);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="mt-8 flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={goBack}
            className="px-6 py-3 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel</span>
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3.5 rounded-full bg-[#FF9933] hover:bg-[#FF6F00] text-white text-xs font-bold transition-all shadow-lg shadow-[#FF9933]/25 flex items-center gap-2.5 cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              <span>{t("form.submitting")}</span>
            ) : (
              <>
                <span>{t("form.submit")}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
