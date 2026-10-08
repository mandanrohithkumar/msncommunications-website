"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  getTelanganaDistricts,
  getMandalsForDistrict,
  lookupPincode
} from "@/components/telangana-locations";
import { getLocalTelanganaPincode } from "@/lib/telangana-pincodes-data";
import { sanitizePincode, buildSmartAddress } from "@/lib/field-validation";
import {
  MapPin,
  Building2,
  Compass,
  Lock,
  Unlock,
  CheckCircle2,
  Home,
  Copy,
  Loader2,
  AlertCircle,
  Sparkles
} from "lucide-react";

export interface CascadingLocationData {
  district: string;
  mandal: string;
  village: string;
  colonyStreet: string;
  pincode: string;
  formattedAddress: string;
}

export interface CascadingLocationSelectorProps {
  initialDistrict?: string;
  initialMandal?: string;
  initialVillage?: string;
  initialColonyStreet?: string;
  initialPincode?: string;
  onLocationChange?: (location: CascadingLocationData) => void;
  required?: boolean;
  errorField?: string | null;
}

interface PincodeLookupResponse {
  success: boolean;
  pincode: string;
  district: string;
  mandal: string;
  villages: string[];
  state: string;
  source?: string;
  error?: string;
}

// In-memory client cache for 0ms instant repeated lookups
const CLIENT_PINCODE_CACHE = new Map<string, PincodeLookupResponse>();

export const CascadingLocationSelector: React.FC<CascadingLocationSelectorProps> = ({
  initialDistrict = "Nagarkurnool",
  initialMandal = "Nagarkurnool",
  initialVillage = "",
  initialColonyStreet = "",
  initialPincode = "509209",
  onLocationChange,
  required = true,
  errorField = null
}) => {
  const [pincode, setPincode] = useState<string>(sanitizePincode(initialPincode) || "509209");
  const [selectedDistrict, setSelectedDistrict] = useState<string>(initialDistrict);
  const [selectedMandal, setSelectedMandal] = useState<string>(initialMandal);
  const [villagesList, setVillagesList] = useState<string[]>([]);
  const [selectedVillage, setSelectedVillage] = useState<string>(initialVillage);
  const [isCustomVillage, setIsCustomVillage] = useState(false);
  const [customVillageText, setCustomVillageText] = useState("");
  const [colonyStreet, setColonyStreet] = useState<string>(initialColonyStreet);

  // Auto-lock state: District & Mandal locked after successful PIN lookup
  const [isJurisdictionLocked, setIsJurisdictionLocked] = useState<boolean>(true);

  // Lookup statuses
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lookupSuccess, setLookupSuccess] = useState<boolean>(false);
  const [pincodeError, setPincodeError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const activeAbortRef = useRef<AbortController | null>(null);

  const districts = getTelanganaDistricts();
  const availableMandals = getMandalsForDistrict(selectedDistrict);

  // Emit updated values to parent form
  const notifyChange = useCallback(
    (newDist: string, newMand: string, newVill: string, newStreet: string, newPin: string) => {
      if (!onLocationChange) return;
      const formatted = buildSmartAddress(newStreet, newMand, newDist, "Telangana", newPin, newVill);
      onLocationChange({
        district: newDist,
        mandal: newMand,
        village: newVill,
        colonyStreet: newStreet,
        pincode: newPin,
        formattedAddress: formatted
      });
    },
    [onLocationChange]
  );

  // Apply lookup result to component state
  const applyLookupResult = (data: PincodeLookupResponse, pin: string) => {
    setSelectedDistrict(data.district);
    setSelectedMandal(data.mandal);
    setIsJurisdictionLocked(true);
    setLookupSuccess(true);
    setPincodeError(null);

    const villages = data.villages || [];
    setVillagesList(villages);

    let resolvedVillage = "";
    if (villages.length === 1) {
      resolvedVillage = villages[0];
      setSelectedVillage(resolvedVillage);
      setIsCustomVillage(false);
    } else if (villages.length > 1) {
      if (selectedVillage && villages.includes(selectedVillage)) {
        resolvedVillage = selectedVillage;
      } else {
        resolvedVillage = "";
        setSelectedVillage("");
      }
      setIsCustomVillage(false);
    } else {
      resolvedVillage = "";
      setSelectedVillage("");
    }

    notifyChange(data.district, data.mandal, resolvedVillage, colonyStreet, pin);
  };

  // Perform PIN code lookup with multi-tiered caching
  const performPincodeLookup = useCallback(
    async (pinToSearch: string) => {
      if (!/^[1-9][0-9]{5}$/.test(pinToSearch)) {
        if (pinToSearch.length === 6) {
          setPincodeError("Please enter a valid 6-digit PIN code.");
          setIsJurisdictionLocked(false);
        }
        return;
      }

      setPincodeError(null);

      // 1. In-memory client cache (0ms)
      if (CLIENT_PINCODE_CACHE.has(pinToSearch)) {
        applyLookupResult(CLIENT_PINCODE_CACHE.get(pinToSearch)!, pinToSearch);
        return;
      }

      // 2. LocalStorage cache (0ms)
      if (typeof window !== "undefined") {
        try {
          const ls = localStorage.getItem(`pin_cache_${pinToSearch}`);
          if (ls) {
            const parsed = JSON.parse(ls);
            CLIENT_PINCODE_CACHE.set(pinToSearch, parsed);
            applyLookupResult(parsed, pinToSearch);
            return;
          }
        } catch {
          // ignore
        }
      }

      // 3. Fast local offline Telangana dataset (0ms)
      const offline = getLocalTelanganaPincode(pinToSearch);
      if (offline && offline.villages.length > 1) {
        const res: PincodeLookupResponse = {
          success: true,
          pincode: pinToSearch,
          district: offline.district,
          mandal: offline.mandal,
          villages: offline.villages,
          state: "Telangana"
        };
        CLIENT_PINCODE_CACHE.set(pinToSearch, res);
        applyLookupResult(res, pinToSearch);
        return;
      }

      // 4. Server API Route
      if (activeAbortRef.current) activeAbortRef.current.abort();
      const ctrl = new AbortController();
      activeAbortRef.current = ctrl;

      setIsLoading(true);

      try {
        const res = await fetch(`/api/pincode/${encodeURIComponent(pinToSearch)}`, {
          signal: ctrl.signal
        });
        const data: PincodeLookupResponse = await res.json();

        if (res.ok && data.success) {
          CLIENT_PINCODE_CACHE.set(pinToSearch, data);
          try {
            if (typeof window !== "undefined") {
              localStorage.setItem(`pin_cache_${pinToSearch}`, JSON.stringify(data));
            }
          } catch {
            // ignore
          }
          applyLookupResult(data, pinToSearch);
        } else {
          setPincodeError(data.error || "Please enter a valid 6-digit PIN code.");
          setLookupSuccess(false);
          setIsJurisdictionLocked(false);
        }
      } catch (err: unknown) {
        if ((err as Error)?.name === "AbortError") return;

        if (offline) {
          const fallbackRes: PincodeLookupResponse = {
            success: true,
            pincode: pinToSearch,
            district: offline.district,
            mandal: offline.mandal,
            villages: offline.villages,
            state: "Telangana"
          };
          applyLookupResult(fallbackRes, pinToSearch);
        } else {
          setPincodeError("Could not connect to PIN lookup service. Please enter location manually.");
          setIsJurisdictionLocked(false);
          setLookupSuccess(false);
        }
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Trigger auto-fill as 6th digit is typed
  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizePincode(e.target.value);
    setPincode(sanitized);

    if (sanitized.length < 6) {
      setPincodeError(null);
      setLookupSuccess(false);
      setVillagesList([]);
      setSelectedVillage("");
      notifyChange(selectedDistrict, selectedMandal, "", colonyStreet, sanitized);
      return;
    }

    if (sanitized.length === 6) {
      performPincodeLookup(sanitized);
    }
  };

  const handleVillageSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "__custom__") {
      setIsCustomVillage(true);
      setSelectedVillage("");
      notifyChange(selectedDistrict, selectedMandal, customVillageText, colonyStreet, pincode);
    } else {
      setIsCustomVillage(false);
      setSelectedVillage(val);
      notifyChange(selectedDistrict, selectedMandal, val, colonyStreet, pincode);
    }
  };

  const handleCustomVillageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value.slice(0, 80);
    setCustomVillageText(text);
    notifyChange(selectedDistrict, selectedMandal, text, colonyStreet, pincode);
  };

  const handleDistrictChange = (newDistrict: string) => {
    setSelectedDistrict(newDistrict);
    const mandals = getMandalsForDistrict(newDistrict);
    const firstMandal = mandals[0]?.name || "";
    setSelectedMandal(firstMandal);

    const mappedPincode = lookupPincode(newDistrict, firstMandal);
    const sanitized = sanitizePincode(mappedPincode);
    setPincode(sanitized);
    setVillagesList([]);
    setSelectedVillage("");

    notifyChange(newDistrict, firstMandal, "", colonyStreet, sanitized);
  };

  const handleMandalChange = (newMandal: string) => {
    setSelectedMandal(newMandal);
    const mappedPincode = lookupPincode(selectedDistrict, newMandal);
    const sanitized = sanitizePincode(mappedPincode);
    setPincode(sanitized);
    setVillagesList([]);
    setSelectedVillage("");

    notifyChange(selectedDistrict, newMandal, "", colonyStreet, sanitized);
  };

  const handleColonyStreetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const trimmed = e.target.value.slice(0, 100);
    setColonyStreet(trimmed);
    const activeVillage = isCustomVillage ? customVillageText : selectedVillage;
    notifyChange(selectedDistrict, selectedMandal, activeVillage, trimmed, pincode);
  };

  // Mount initialization
  useEffect(() => {
    if (initialPincode && initialPincode.length === 6) {
      performPincodeLookup(initialPincode);
    }
  }, [initialPincode, performPincodeLookup]);

  // Sync external changes
  useEffect(() => {
    if (initialDistrict && initialDistrict !== selectedDistrict) {
      setSelectedDistrict(initialDistrict);
    }
    if (initialMandal && initialMandal !== selectedMandal) {
      setSelectedMandal(initialMandal);
    }
    if (initialColonyStreet !== undefined && initialColonyStreet !== colonyStreet) {
      setColonyStreet(initialColonyStreet.slice(0, 100));
    }
  }, [initialDistrict, initialMandal, initialColonyStreet]);

  const activeVillageVal = isCustomVillage ? customVillageText : selectedVillage;
  const formattedAddressPreview = buildSmartAddress(
    colonyStreet,
    selectedMandal,
    selectedDistrict,
    "Telangana",
    pincode,
    activeVillageVal
  );

  const isColonyError =
    errorField === "Colony / Locality / Street Name" ||
    errorField === "Colony / Street" ||
    errorField === "colonyStreet";
  const isPincodeError =
    errorField === "Pincode" || errorField === "Pin Code" || Boolean(pincodeError);

  return (
    <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 space-y-2.5 shadow-xs">
      {/* 1. COMPACT HEADER */}
      <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-1.5">
          <div className="p-1 rounded-md bg-[#FF9933]/15 text-[#E65100] dark:text-[#FFB74D]">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <span>Telangana Jurisdiction</span>
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 hidden sm:inline">
              (33 Districts)
            </span>
          </h4>
        </div>

        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <Sparkles className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
          <span>PIN Auto-Fill</span>
        </span>
      </div>

      {/* 2. COMPACT ERROR BANNER */}
      {pincodeError && (
        <div className="py-1.5 px-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-[11px] text-rose-800 dark:text-rose-200 flex items-center justify-between gap-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-1.5 truncate">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
            <span className="truncate">{pincodeError}</span>
          </div>
          <span className="text-[10px] font-medium text-slate-500 shrink-0">Unlocked for manual entry</span>
        </div>
      )}

      {/* 3. ROW 1: PIN CODE & VILLAGE / LOCALITY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
        {/* FIELD 1: PIN CODE */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label
              htmlFor="location-pincode"
              className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1"
            >
              <span>PIN Code</span>
              {required && <span className="text-rose-500">*</span>}
            </label>

            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
              {pincode.length === 6 ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3" /> 6 Digits
                </span>
              ) : (
                <span>{pincode.length}/6</span>
              )}
            </span>
          </div>

          <div className="relative flex items-center">
            <input
              id="location-pincode"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={pincode}
              onChange={handlePincodeChange}
              placeholder="e.g. 509209"
              className={`h-9 w-full pl-3 pr-20 rounded-lg border font-mono text-xs font-bold tracking-wider bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-all shadow-2xs ${
                isPincodeError
                  ? "border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20"
                  : lookupSuccess
                  ? "border-emerald-400 dark:border-emerald-700 ring-1 ring-emerald-500/20"
                  : "border-slate-300 dark:border-slate-700 focus:outline-none focus:border-[#FF9933] focus:ring-2 focus:ring-[#FF9933]/20"
              }`}
            />

            <div className="absolute right-2 flex items-center">
              {isLoading ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-[10px] font-semibold animate-pulse">
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  <span>Looking up</span>
                </span>
              ) : lookupSuccess ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold border border-emerald-300 dark:border-emerald-800">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Verified</span>
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* FIELD 2: VILLAGE / LOCALITY */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label
              htmlFor="location-village"
              className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1"
            >
              <span>Village / Locality</span>
              {required && <span className="text-rose-500">*</span>}
            </label>

            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
              {villagesList.length > 0 ? (
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">{villagesList.length} linked</span>
              ) : (
                "Enter PIN"
              )}
            </span>
          </div>

          {!isCustomVillage ? (
            <select
              id="location-village"
              value={selectedVillage}
              onChange={handleVillageSelect}
              disabled={isLoading || villagesList.length === 0}
              className={`h-9 w-full pl-3 pr-7 rounded-lg border text-xs font-semibold transition-all shadow-2xs cursor-pointer truncate ${
                villagesList.length === 0
                  ? "bg-slate-100 dark:bg-slate-900/80 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800 cursor-not-allowed"
                  : !selectedVillage
                  ? "border-amber-400 ring-2 ring-amber-400/20 bg-amber-50/20 text-slate-800 dark:text-slate-200"
                  : "bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 focus:outline-none focus:border-[#FF9933] focus:ring-2 focus:ring-[#FF9933]/20"
              }`}
            >
              {villagesList.length === 0 ? (
                <option value="">Enter 6-digit PIN to load</option>
              ) : (
                <>
                  {villagesList.length > 1 && (
                    <option value="">-- Choose Village ({villagesList.length}) --</option>
                  )}
                  {villagesList.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                  <option value="__custom__">+ Enter Custom Village</option>
                </>
              )}
            </select>
          ) : (
            <div className="flex items-center gap-1.5">
              <input
                id="location-custom-village"
                type="text"
                value={customVillageText}
                onChange={handleCustomVillageChange}
                placeholder="Enter custom village or locality"
                className="h-9 flex-1 px-3 rounded-lg border border-indigo-300 dark:border-indigo-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                autoFocus
              />
              <button
                type="button"
                onClick={() => {
                  setIsCustomVillage(false);
                  if (villagesList.length > 0) {
                    setSelectedVillage(villagesList[0]);
                    notifyChange(selectedDistrict, selectedMandal, villagesList[0], colonyStreet, pincode);
                  }
                }}
                className="h-9 px-2.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                List
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. ROW 2: DISTRICT & MANDAL (LOCKED BY DEFAULT WITH UNLOCK BUTTON) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
        {/* FIELD 3: DISTRICT */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label
              htmlFor="location-district"
              className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1"
            >
              <Building2 className="w-3 h-3 text-[#000080] dark:text-blue-400" />
              <span>District</span>
              {required && <span className="text-rose-500">*</span>}
            </label>

            <button
              type="button"
              onClick={() => setIsJurisdictionLocked((prev) => !prev)}
              className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              {isJurisdictionLocked ? (
                <>
                  <Unlock className="w-2.5 h-2.5" />
                  <span>Unlock / Edit</span>
                </>
              ) : (
                <>
                  <Lock className="w-2.5 h-2.5 text-emerald-600" />
                  <span className="text-emerald-600">Lock</span>
                </>
              )}
            </button>
          </div>

          {isJurisdictionLocked ? (
            <div className="relative flex items-center">
              <input
                id="location-district"
                type="text"
                readOnly
                value={selectedDistrict}
                className="h-9 w-full pl-3 pr-16 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/60 text-slate-800 dark:text-slate-200 font-bold text-xs cursor-not-allowed shadow-2xs truncate"
              />
              <span className="absolute right-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9px] font-bold">
                <Lock className="w-2 h-2" />
                <span>Locked</span>
              </span>
            </div>
          ) : (
            <select
              id="location-district"
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="h-9 w-full pl-3 pr-7 rounded-lg border border-blue-400 dark:border-blue-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-2xs truncate"
            >
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* FIELD 4: MANDAL */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label
              htmlFor="location-mandal"
              className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1"
            >
              <Compass className="w-3 h-3 text-[#FF9933]" />
              <span>Mandal</span>
              {required && <span className="text-rose-500">*</span>}
            </label>

            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
              {availableMandals.length} Mandals
            </span>
          </div>

          {isJurisdictionLocked ? (
            <div className="relative flex items-center">
              <input
                id="location-mandal"
                type="text"
                readOnly
                value={selectedMandal}
                className="h-9 w-full pl-3 pr-16 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/60 text-slate-800 dark:text-slate-200 font-bold text-xs cursor-not-allowed shadow-2xs truncate"
              />
              <span className="absolute right-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9px] font-bold">
                <Lock className="w-2 h-2" />
                <span>Locked</span>
              </span>
            </div>
          ) : (
            <select
              id="location-mandal"
              value={selectedMandal}
              onChange={(e) => handleMandalChange(e.target.value)}
              className="h-9 w-full pl-3 pr-7 rounded-lg border border-blue-400 dark:border-blue-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-2xs truncate"
            >
              {availableMandals.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* 5. ROW 3: COLONY / STREET / HOUSE NO. */}
      <div className="space-y-1 text-xs">
        <div className="flex items-center justify-between">
          <label
            htmlFor="location-colony-street"
            className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1"
          >
            <Home className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
            <span>Colony / Street / House No.</span>
            {required && <span className="text-rose-500">*</span>}
          </label>
          <span
            className={`text-[10px] font-mono ${
              colonyStreet.length >= 95 ? "text-rose-500 font-bold" : "text-slate-400 dark:text-slate-500"
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
          onChange={handleColonyStreetChange}
          placeholder="e.g. H.No 4-21, Gandhi Nagar"
          className={`h-9 w-full px-3 rounded-lg border bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs placeholder-slate-400 focus:outline-none focus:border-[#FF9933] focus:ring-2 focus:ring-[#FF9933]/20 transition-all shadow-2xs ${
            isColonyError
              ? "border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20"
              : "border-slate-300 dark:border-slate-700"
          }`}
        />
      </div>

      {/* 6. ROW 4: COMPACT ADDRESS PREVIEW CONTAINER */}
      <div className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-950/80 border border-slate-200/90 dark:border-slate-800 flex items-center justify-between gap-2 text-xs shadow-2xs">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <span className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-[9px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300 shrink-0">
            Address:
          </span>
          <span
            className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate leading-tight"
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
          className="shrink-0 text-[10px] font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer"
          title="Copy formatted address to clipboard"
        >
          {copied ? (
            <>
              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 text-slate-400" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
