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
  buildSmartAddress
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
    "Village / Locality": "Nagarkurnool Town",
    "Colony / Locality / Street Name": "",
    "Pincode": "509209",
    "Address": buildSmartAddress("", "Nagarkurnool", "Nagarkurnool", "Telangana", "509209", "Nagarkurnool Town")
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

  // Mobile swipe navigation between 'Required Documents' and 'Applicant Information'
  const [activeMobileSection, setActiveMobileSection] = useState<"docs" | "applicant">("docs");
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    const diffY = e.changedTouches[0].clientY - touchStartY.current;

    // Detect horizontal swipe intent (horizontal swipe distance > vertical and threshold > 40px)
    if (Math.abs(diffX) > Math.abs(diffY) * 1.3 && Math.abs(diffX) > 40) {
      if (diffX < 0 && activeMobileSection === "docs") {
        // Swiped Left -> navigate to Applicant Information
        setActiveMobileSection("applicant");
      } else if (diffX > 0 && activeMobileSection === "applicant") {
        // Swiped Right -> navigate to Required Documents
        setActiveMobileSection("docs");
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

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
    // Automatically switch active mobile section to the section containing the erroneous field
    if (elementId.startsWith("doc-box-")) {
      setActiveMobileSection("docs");
    } else {
      setActiveMobileSection("applicant");
    }

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

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8 animate-in fade-in duration-300">
      {/* Header - Fits perfectly on mobile without overflowing */}
      <div className="relative flex flex-col items-center text-center mb-5 sm:mb-6">
        <button
          onClick={goBack}
          className="md:absolute left-0 top-1/2 md:-translate-y-1/2 mb-3 md:mb-0 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors flex items-center gap-1.5 cursor-pointer backdrop-blur-md shadow-sm self-start md:self-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <div className="flex items-center gap-2 sm:gap-2.5">
          <span className="text-2xl sm:text-3xl">{selectedService.icon}</span>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {selectedService.name} Application
          </h1>
        </div>
        <p className="text-[11px] sm:text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-lg">
          Complete the required verified documents and citizen information below
        </p>
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

      {/* Main 2-Column Form Layout with Mobile Swipe & Touch Gestures */}
      <form onSubmit={handleSubmit}>
        {/* Mobile Swipe Navigation Bar with Directional Indicator Arrows (Requirement 2) */}
        <div className="lg:hidden mb-4">
          <div className="flex items-center justify-between p-1.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 shadow-md backdrop-blur-md gap-1.5">
            {/* Left Directional Indicator Arrow Button */}
            <button
              type="button"
              onClick={() => setActiveMobileSection("docs")}
              disabled={activeMobileSection === "docs"}
              aria-label="Previous Section: Required Documents"
              className={`p-2 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                activeMobileSection === "docs"
                  ? "opacity-30 text-slate-400 cursor-not-allowed"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-[#FF9933] hover:text-white"
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            {/* Segmented Section Tabs */}
            <div className="flex-1 grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setActiveMobileSection("docs")}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer truncate ${
                  activeMobileSection === "docs"
                    ? "bg-gradient-to-r from-[#FF9933] to-[#FF6F00] text-white shadow-sm shadow-[#FF9933]/30"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span>📄</span>
                <span className="truncate">Documents ({selectedService.docs.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMobileSection("applicant")}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer truncate ${
                  activeMobileSection === "applicant"
                    ? "bg-gradient-to-r from-[#000080] to-[#1E3A8A] text-white shadow-sm shadow-blue-900/30"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span>📝</span>
                <span className="truncate">Applicant Info</span>
              </button>
            </div>

            {/* Right Directional Indicator Arrow Button */}
            <button
              type="button"
              onClick={() => setActiveMobileSection("applicant")}
              disabled={activeMobileSection === "applicant"}
              aria-label="Next Section: Applicant Information"
              className={`p-2 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                activeMobileSection === "applicant"
                  ? "opacity-30 text-slate-400 cursor-not-allowed"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-[#000080] hover:text-white"
              }`}
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Directional Guide Hint */}
          <div className="mt-1.5 px-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            {activeMobileSection === "docs" ? (
              <span className="flex items-center gap-1 text-[#E65100] dark:text-amber-400 font-medium">
                <span>👈 Swipe left or tap arrow for Applicant Info</span>
                <ArrowRight className="w-3 h-3 animate-pulse inline" />
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[#000080] dark:text-blue-400 font-medium">
                <ArrowLeft className="w-3 h-3 animate-pulse inline" />
                <span>Swipe right or tap arrow for Documents 👉</span>
              </span>
            )}
            <span className="font-mono text-[10px] text-slate-400">
              {activeMobileSection === "docs" ? "Step 1 of 2" : "Step 2 of 2"}
            </span>
          </div>
        </div>

        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left"
        >
          {/* Left Column: Documents & Special Instructions (5 cols) */}
          <div
            className={`lg:col-span-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 md:p-7 backdrop-blur-md space-y-4 sm:space-y-5 shadow-sm transition-all duration-300 ${
              activeMobileSection === "docs" ? "block" : "hidden lg:block"
            }`}
          >
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
                      categoryName={selectedService.category}
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

            {/* Quick Mobile Navigation to Applicant Info */}
            <div className="lg:hidden pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActiveMobileSection("applicant")}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center gap-2 border border-indigo-200 dark:border-indigo-800/50 cursor-pointer transition-colors"
              >
                <span>Continue to Applicant Information</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Basic Details Dynamic Inputs (7 cols) */}
          <div
            className={`lg:col-span-7 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 md:p-7 backdrop-blur-md space-y-4 sm:space-y-5 shadow-sm transition-all duration-300 ${
              activeMobileSection === "applicant" ? "block" : "hidden lg:block"
            }`}
          >
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
                      "village",
                      "village / locality",
                      "village / mandal",
                      "village name",
                      "pincode",
                      "pin code",
                      "colony / locality / street name",
                      "colony",
                      "locality",
                      "street name",
                      "street"
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
                  initialVillage={formData["Village / Locality"] || "Nagarkurnool Town"}
                  initialColonyStreet={formData["Colony / Locality / Street Name"] || ""}
                  initialPincode={formData["Pincode"] || "509209"}
                  errorField={errorFieldId === "location-colony-street" ? "Colony / Street" : null}
                  onLocationChange={({ district, mandal, village, colonyStreet, pincode, formattedAddress }) => {
                    setFormData((prev) => ({
                      ...prev,
                      "District": district,
                      "Mandal": mandal,
                      "Village / Locality": village || "",
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

            {/* Quick Mobile Navigation back to Docs */}
            <div className="lg:hidden pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActiveMobileSection("docs")}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Review Required Documents</span>
              </button>
            </div>
          </div>
        </div>

        {/* Submit Bar - Perfectly responsive, fits on all mobile screens without overflow */}
        <div className="mt-6 sm:mt-8 flex items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800 w-full">
          <button
            type="button"
            onClick={goBack}
            className="px-4 py-2.5 sm:px-6 sm:py-3 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 sm:gap-2 shadow-sm shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Cancel</span>
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 sm:flex-initial px-4 py-2.5 sm:px-8 sm:py-3.5 rounded-full bg-[#FF9933] hover:bg-[#FF6F00] text-white text-xs font-bold transition-all shadow-lg shadow-[#FF9933]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 truncate"
          >
            {isSubmitting ? (
              <span>{t("form.submitting")}</span>
            ) : (
              <>
                <span className="truncate">{t("form.submit")}</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
