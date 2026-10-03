"use client";

import React, { useState, useEffect } from "react";
import {
  TELANGANA_LOCATIONS,
  getTelanganaDistricts,
  getMandalsForDistrict,
  lookupPincode
} from "@/components/telangana-locations";
import { sanitizePincode, buildSmartAddress } from "@/lib/field-validation";
import {
  MapPin,
  Building2,
  Compass,
  Lock,
  CheckCircle2,
  Home,
  Copy
} from "lucide-react";

export interface CascadingLocationData {
  district: string;
  mandal: string;
  colonyStreet: string;
  pincode: string;
  formattedAddress: string;
}

export interface CascadingLocationSelectorProps {
  initialDistrict?: string;
  initialMandal?: string;
  initialColonyStreet?: string;
  initialPincode?: string;
  onLocationChange?: (location: CascadingLocationData) => void;
  required?: boolean;
  errorField?: string | null;
}

export const CascadingLocationSelector: React.FC<CascadingLocationSelectorProps> = ({
  initialDistrict = "Nagarkurnool",
  initialMandal = "Nagarkurnool",
  initialColonyStreet = "",
  initialPincode = "509209",
  onLocationChange,
  required = true,
  errorField = null
}) => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>(initialDistrict);
  const [selectedMandal, setSelectedMandal] = useState<string>(initialMandal);
  const [colonyStreet, setColonyStreet] = useState<string>(initialColonyStreet);
  const [pincode, setPincode] = useState<string>(sanitizePincode(initialPincode) || "509209");
  const [isEditingPincode, setIsEditingPincode] = useState(false);
  const [copied, setCopied] = useState(false);

  const districts = getTelanganaDistricts();
  const availableMandals = getMandalsForDistrict(selectedDistrict);

  // When district changes, update mandals and auto-set first mandal + pincode
  const handleDistrictChange = (newDistrict: string) => {
    setSelectedDistrict(newDistrict);
    const mandals = getMandalsForDistrict(newDistrict);
    const firstMandal = mandals[0]?.name || "";
    setSelectedMandal(firstMandal);

    const mappedPincode = lookupPincode(newDistrict, firstMandal);
    const sanitized = sanitizePincode(mappedPincode);
    setPincode(sanitized);

    if (onLocationChange) {
      onLocationChange({
        district: newDistrict,
        mandal: firstMandal,
        colonyStreet,
        pincode: sanitized,
        formattedAddress: buildSmartAddress(colonyStreet, firstMandal, newDistrict, "Telangana", sanitized)
      });
    }
  };

  // When mandal changes, auto update pincode
  const handleMandalChange = (newMandal: string) => {
    setSelectedMandal(newMandal);
    const mappedPincode = lookupPincode(selectedDistrict, newMandal);
    const sanitized = sanitizePincode(mappedPincode);
    setPincode(sanitized);

    if (onLocationChange) {
      onLocationChange({
        district: selectedDistrict,
        mandal: newMandal,
        colonyStreet,
        pincode: sanitized,
        formattedAddress: buildSmartAddress(colonyStreet, newMandal, selectedDistrict, "Telangana", sanitized)
      });
    }
  };

  // When colony/street name changes (enforces max 100 characters)
  const handleColonyStreetChange = (newStreet: string) => {
    const trimmedVal = newStreet.slice(0, 100);
    setColonyStreet(trimmedVal);

    if (onLocationChange) {
      onLocationChange({
        district: selectedDistrict,
        mandal: selectedMandal,
        colonyStreet: trimmedVal,
        pincode,
        formattedAddress: buildSmartAddress(trimmedVal, selectedMandal, selectedDistrict, "Telangana", pincode)
      });
    }
  };

  // When pincode is manually modified (strictly 6 numeric digits)
  const handlePincodeChange = (newPin: string) => {
    const sanitized = sanitizePincode(newPin);
    setPincode(sanitized);

    if (onLocationChange) {
      onLocationChange({
        district: selectedDistrict,
        mandal: selectedMandal,
        colonyStreet,
        pincode: sanitized,
        formattedAddress: buildSmartAddress(colonyStreet, selectedMandal, selectedDistrict, "Telangana", sanitized)
      });
    }
  };

  // Synchronize on external changes
  useEffect(() => {
    if (initialDistrict) {
      setSelectedDistrict(initialDistrict);
      const mapped = lookupPincode(initialDistrict, initialMandal || "");
      setPincode(sanitizePincode(mapped || initialPincode));
    }
    if (initialMandal) {
      setSelectedMandal(initialMandal);
    }
    if (initialColonyStreet !== undefined) {
      setColonyStreet(initialColonyStreet.slice(0, 100));
    }
  }, [initialDistrict, initialMandal, initialColonyStreet, initialPincode]);

  const formattedAddressPreview = buildSmartAddress(
    colonyStreet,
    selectedMandal,
    selectedDistrict,
    "Telangana",
    pincode
  );

  const isColonyError =
    errorField === "Colony / Locality / Street Name" ||
    errorField === "Colony / Street" ||
    errorField === "colonyStreet";
  const isPincodeError = errorField === "Pincode" || errorField === "Pin Code";

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/40 via-white to-blue-50/30 dark:from-slate-900/90 dark:via-slate-900 dark:to-blue-950/20 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
      {/* 1. Header & Jurisdiction Info */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#FF9933]/15 text-[#E65100] dark:text-[#FFB74D]">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Telangana State Location & Jurisdiction</span>
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 hidden sm:inline">
                (33 Districts • 589+ Mandals)
              </span>
            </h4>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8F5E9] dark:bg-emerald-950/80 text-[#138808] dark:text-[#A5D6A7] border border-[#C8E6C9] dark:border-emerald-800 shrink-0">
          <CheckCircle2 className="w-3 h-3 text-[#138808]" />
          <span>Official Jurisdiction</span>
        </span>
      </div>

      {/* 2. RESPONSIVE BALANCED 2x2 GRID (No cramped inputs, fully visible dropdown text) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        {/* Field 1: District Dropdown (Required *) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#000080] dark:text-blue-400" />
              <span>District {required && <span className="text-rose-500">*</span>}</span>
            </label>
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
              33 Districts
            </span>
          </div>
          <select
            id="location-district"
            value={selectedDistrict}
            title={selectedDistrict}
            onChange={(e) => handleDistrictChange(e.target.value)}
            className="h-10.5 w-full pl-3.5 pr-8 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-[#FF9933] focus:ring-2 focus:ring-[#FF9933]/20 transition-all cursor-pointer shadow-xs truncate"
          >
            {districts.map((d) => (
              <option key={d} value={d} title={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Field 2: Mandal Cascading Dropdown (Required *) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#FF9933]" />
              <span>Mandal {required && <span className="text-rose-500">*</span>}</span>
            </label>
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
              {availableMandals.length} Mandals
            </span>
          </div>
          <select
            id="location-mandal"
            value={selectedMandal}
            title={selectedMandal}
            onChange={(e) => handleMandalChange(e.target.value)}
            className="h-10.5 w-full pl-3.5 pr-8 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-[#FF9933] focus:ring-2 focus:ring-[#FF9933]/20 transition-all cursor-pointer shadow-xs truncate"
          >
            {availableMandals.map((m) => (
              <option key={m.name} value={m.name} title={m.name}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Field 3: Colony / Street (Strict 100 Char Limit + Live Character Counter) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Colony / Street {required && <span className="text-rose-500">*</span>}</span>
            </label>
            <span
              className={`text-[10px] font-mono ${
                colonyStreet.length >= 95
                  ? "text-rose-500 font-bold"
                  : "text-slate-400 dark:text-slate-500"
              }`}
            >
              {colonyStreet.length}/100
            </span>
          </div>
          <input
            id="location-colony-street"
            type="text"
            required={required}
            maxLength={100}
            value={colonyStreet}
            title={colonyStreet || "Enter Colony, Street, or House No."}
            onChange={(e) => handleColonyStreetChange(e.target.value)}
            placeholder="e.g. H.No 4-21, Gandhi Nagar"
            className={`h-10.5 w-full px-3.5 rounded-xl border bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs placeholder-slate-400 focus:outline-none focus:border-[#FF9933] focus:ring-2 focus:ring-[#FF9933]/20 transition-all shadow-xs ${
              isColonyError
                ? "border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20"
                : "border-slate-300 dark:border-slate-700"
            }`}
          />
        </div>

        {/* Field 4: Pincode (Strict 6-Digit Numeric Limit + '✓ Set' Status Button) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#138808]" />
              <span>Pincode (6 Digits)</span>
            </label>
            <button
              type="button"
              onClick={() => setIsEditingPincode((prev) => !prev)}
              className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
            >
              {isEditingPincode ? "Auto-Lock" : "Edit"}
            </button>
          </div>
          <div className="relative flex items-center">
            <input
              id="location-pincode"
              type="text"
              inputMode="numeric"
              maxLength={6}
              readOnly={!isEditingPincode}
              value={pincode}
              onChange={(e) => handlePincodeChange(e.target.value)}
              placeholder="6-digit PIN"
              className={`h-10.5 w-full px-3.5 rounded-xl border font-mono text-xs font-bold tracking-wider pr-18 select-all shadow-xs transition-all ${
                isEditingPincode
                  ? "bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  : "bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800 cursor-not-allowed"
              } ${
                isPincodeError
                  ? "border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20"
                  : ""
              }`}
              title={pincode ? `Pincode: ${pincode} (strictly 6 digits)` : "Pincode is auto-mapped based on selected District and Mandal."}
            />
            <div className="absolute right-2 flex items-center">
              {pincode.length === 6 ? (
                <button
                  type="button"
                  onClick={() => setIsEditingPincode(false)}
                  className="px-2 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black tracking-wide flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
                  title="Pincode Verified & Set"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Set</span>
                </button>
              ) : (
                <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-bold">
                  {pincode.length}/6
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. CLEAN STANDARDIZED ADDRESS PREVIEW CONTAINER (No Duplicate Tags) */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/90 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs shadow-2xs">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-[10px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300 shrink-0">
            Address Preview:
          </span>
          <span
            className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate leading-relaxed"
            title={formattedAddressPreview}
          >
            {formattedAddressPreview}
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            if (typeof navigator !== "undefined" && navigator.clipboard) {
              navigator.clipboard.writeText(formattedAddressPreview);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }
          }}
          className="shrink-0 text-[10px] font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5 transition-colors px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900 cursor-pointer self-end sm:self-auto"
          title="Copy formatted address to clipboard"
        >
          {copied ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
