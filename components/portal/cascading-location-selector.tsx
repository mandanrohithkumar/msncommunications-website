"use client";

import React, { useState, useEffect } from "react";
import {
  TELANGANA_LOCATIONS,
  getTelanganaDistricts,
  getMandalsForDistrict,
  lookupPincode
} from "@/components/telangana-locations";
import { MapPin, Building2, Compass, Lock, CheckCircle2, Home } from "lucide-react";

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
}

export const CascadingLocationSelector: React.FC<CascadingLocationSelectorProps> = ({
  initialDistrict = "Nagarkurnool",
  initialMandal = "Nagarkurnool",
  initialColonyStreet = "",
  initialPincode = "509209",
  onLocationChange,
  required = true
}) => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>(initialDistrict);
  const [selectedMandal, setSelectedMandal] = useState<string>(initialMandal);
  const [colonyStreet, setColonyStreet] = useState<string>(initialColonyStreet);
  const [pincode, setPincode] = useState<string>(initialPincode);

  const districts = getTelanganaDistricts();
  const availableMandals = getMandalsForDistrict(selectedDistrict);

  // Helper to format full address for owner review
  const buildFormattedAddress = (street: string, m: string, d: string, pin: string) => {
    const parts: string[] = [];
    if (street.trim()) parts.push(street.trim());
    if (m.trim()) parts.push(`${m.trim()} Mandal`);
    if (d.trim()) parts.push(`${d.trim()} Dist`);
    parts.push("Telangana");
    if (pin.trim()) parts.push(`- ${pin.trim()}`);
    return parts.join(", ").replace("Telangana, -", "Telangana -");
  };

  // When district changes, update mandals and auto-set first mandal + pincode
  const handleDistrictChange = (newDistrict: string) => {
    setSelectedDistrict(newDistrict);
    const mandals = getMandalsForDistrict(newDistrict);
    const firstMandal = mandals[0]?.name || "";
    setSelectedMandal(firstMandal);

    const mappedPincode = lookupPincode(newDistrict, firstMandal);
    setPincode(mappedPincode);

    if (onLocationChange) {
      onLocationChange({
        district: newDistrict,
        mandal: firstMandal,
        colonyStreet,
        pincode: mappedPincode,
        formattedAddress: buildFormattedAddress(colonyStreet, firstMandal, newDistrict, mappedPincode)
      });
    }
  };

  // When mandal changes, auto update pincode
  const handleMandalChange = (newMandal: string) => {
    setSelectedMandal(newMandal);
    const mappedPincode = lookupPincode(selectedDistrict, newMandal);
    setPincode(mappedPincode);

    if (onLocationChange) {
      onLocationChange({
        district: selectedDistrict,
        mandal: newMandal,
        colonyStreet,
        pincode: mappedPincode,
        formattedAddress: buildFormattedAddress(colonyStreet, newMandal, selectedDistrict, mappedPincode)
      });
    }
  };

  // When colony/street name changes
  const handleColonyStreetChange = (newStreet: string) => {
    setColonyStreet(newStreet);

    if (onLocationChange) {
      onLocationChange({
        district: selectedDistrict,
        mandal: selectedMandal,
        colonyStreet: newStreet,
        pincode,
        formattedAddress: buildFormattedAddress(newStreet, selectedMandal, selectedDistrict, pincode)
      });
    }
  };

  // Synchronize on external changes
  useEffect(() => {
    if (initialDistrict) {
      setSelectedDistrict(initialDistrict);
      const mapped = lookupPincode(initialDistrict, initialMandal || "");
      setPincode(mapped || initialPincode);
    }
    if (initialMandal) {
      setSelectedMandal(initialMandal);
    }
    if (initialColonyStreet !== undefined) {
      setColonyStreet(initialColonyStreet);
    }
  }, [initialDistrict, initialMandal, initialColonyStreet, initialPincode]);

  const formattedAddressPreview = buildFormattedAddress(
    colonyStreet,
    selectedMandal,
    selectedDistrict,
    pincode
  );

  return (
    <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-amber-50/40 via-white to-blue-50/30 dark:from-slate-900/90 dark:via-slate-900 dark:to-blue-950/20 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
      {/* Tightened Location Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
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

      {/* 4 Fields Aligned in a Single Balanced Row with Equal Heights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* 1. District Dropdown (Required *) */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-[#000080] dark:text-blue-400" />
            <span>District {required && <span className="text-rose-500">*</span>}</span>
          </label>
          <select
            value={selectedDistrict}
            onChange={(e) => handleDistrictChange(e.target.value)}
            className="h-10 w-full px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-[#FF9933] focus:ring-2 focus:ring-[#FF9933]/20 transition-all cursor-pointer shadow-xs"
          >
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Mandal Cascading Dropdown (Required *) */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-[#FF9933]" />
            <span>Mandal {required && <span className="text-rose-500">*</span>}</span>
          </label>
          <select
            value={selectedMandal}
            onChange={(e) => handleMandalChange(e.target.value)}
            className="h-10 w-full px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-[#FF9933] focus:ring-2 focus:ring-[#FF9933]/20 transition-all cursor-pointer shadow-xs"
          >
            {availableMandals.map((m) => (
              <option key={m.name} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Colony / Street Name (Text Input Field, Required *) */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
            <Home className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Colony / Street {required && <span className="text-rose-500">*</span>}</span>
          </label>
          <input
            type="text"
            required={required}
            value={colonyStreet}
            onChange={(e) => handleColonyStreetChange(e.target.value)}
            placeholder="e.g. H.No 4-21, Gandhi Nagar"
            className="h-10 w-full px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs placeholder-slate-400 focus:outline-none focus:border-[#FF9933] focus:ring-2 focus:ring-[#FF9933]/20 transition-all shadow-xs"
          />
        </div>

        {/* 4. Pincode (Auto-Mapped Field, Read-Only/Locked) */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-[#138808]" />
            <span>Pincode</span>
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              readOnly
              value={pincode}
              className="h-10 w-full px-3 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 text-xs font-mono font-bold tracking-wider cursor-not-allowed pr-14 select-all shadow-xs"
              title="Pincode is auto-mapped based on selected District and Mandal."
            />
            <span className="absolute right-2 px-1.5 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-black tracking-wide flex items-center gap-0.5">
              ✓ Set
            </span>
          </div>
        </div>
      </div>

      {/* Condense Formatted Address Preview Box */}
      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[10px] font-bold text-slate-400 shrink-0 uppercase tracking-wider">
            Address Preview:
          </span>
          <span className="text-[11px] font-medium text-slate-800 dark:text-slate-200 truncate">
            {formattedAddressPreview}
          </span>
        </div>
        <div className="shrink-0 flex items-center gap-1 text-[10px] text-slate-500 font-mono self-end sm:self-center">
          <span className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300">
            {selectedDistrict}
          </span>
          <span>/</span>
          <span className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300">
            {selectedMandal}
          </span>
          <span>/</span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 font-bold text-emerald-800 dark:text-emerald-300">
            {pincode}
          </span>
        </div>
      </div>
    </div>
  );
};
