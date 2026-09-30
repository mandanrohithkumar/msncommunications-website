"use client";

import React, { useState, useEffect } from "react";
import {
  TELANGANA_LOCATIONS,
  getTelanganaDistricts,
  getMandalsForDistrict,
  lookupPincode
} from "@/components/telangana-locations";
import { MapPin, Building2, Compass, Lock } from "lucide-react";

export interface CascadingLocationSelectorProps {
  initialDistrict?: string;
  initialMandal?: string;
  initialPincode?: string;
  onLocationChange?: (location: {
    district: string;
    mandal: string;
    pincode: string;
  }) => void;
  required?: boolean;
}

export const CascadingLocationSelector: React.FC<CascadingLocationSelectorProps> = ({
  initialDistrict = "Nagarkurnool",
  initialMandal = "Nagarkurnool",
  initialPincode = "509209",
  onLocationChange,
  required = true
}) => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>(initialDistrict);
  const [selectedMandal, setSelectedMandal] = useState<string>(initialMandal);
  const [pincode, setPincode] = useState<string>(initialPincode);

  const districts = getTelanganaDistricts();
  const availableMandals = getMandalsForDistrict(selectedDistrict);

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
        pincode: mappedPincode
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
        pincode: mappedPincode
      });
    }
  };

  useEffect(() => {
    if (initialDistrict) {
      setSelectedDistrict(initialDistrict);
      const mapped = lookupPincode(initialDistrict, initialMandal || "");
      setPincode(mapped);
    }
  }, [initialDistrict, initialMandal]);

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/50 via-white to-blue-50/40 dark:from-slate-900/90 dark:via-slate-900 dark:to-blue-950/20 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#FF9933]/15 text-[#E65100] dark:text-[#FFB74D]">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Telangana State Location & Jurisdiction
            </h4>
            <p className="text-[10px] text-slate-400">
              Cascading District & Mandal mapping with auto-generated Pincode
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8F5E9] dark:bg-emerald-950/80 text-[#138808] dark:text-[#A5D6A7] border border-[#C8E6C9] dark:border-emerald-800">
          Telangana State
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        {/* 1. District Dropdown */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-[#000080] dark:text-blue-400" />
            <span>District {required && <span className="text-rose-500">*</span>}</span>
          </label>
          <select
            value={selectedDistrict}
            onChange={(e) => handleDistrictChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-[#FF9933] cursor-pointer"
          >
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Dynamic Mandal Dropdown */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-[#FF9933]" />
            <span>Mandal {required && <span className="text-rose-500">*</span>}</span>
          </label>
          <select
            value={selectedMandal}
            onChange={(e) => handleMandalChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-[#FF9933] cursor-pointer"
          >
            {availableMandals.map((m) => (
              <option key={m.name} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Automatic Pincode (Auto-mapped & Locked) */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
            <Lock className="w-3 h-3 text-[#138808]" />
            <span>Pincode (Auto-Mapped)</span>
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              readOnly
              value={pincode}
              className="w-full px-3 py-2 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 text-xs font-mono font-bold tracking-wider cursor-not-allowed pr-8"
              title="Pincode is auto-mapped based on selected District and Mandal."
            />
            <span className="absolute right-2.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
              ✓ Set
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
