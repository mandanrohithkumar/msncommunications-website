"use client";

import React, { useRef, useEffect, useState } from "react";
import { usePortal } from "@/lib/portal-store";
import {
  Search,
  X,
  Sun,
  Moon,
  MoreHorizontal,
  FileText,
  Globe,
  HelpCircle,
  MessageSquare,
  Trash2,
  LogOut,
  Check,
  Mail,
  Phone,
  Clock,
  Bell,
  Users,
  Camera,
  Scan,
  Eye,
  ShieldCheck,
  LogIn
} from "lucide-react";
import { ExtendedFamilyModal } from "./extended-family-modal";
import { FaceRecognitionModal } from "./face-recognition-modal";

export const PortalNavbar: React.FC = () => {
  const {
    user,
    currentView,
    setCurrentView,
    searchQuery,
    setSearchQuery,
    theme,
    toggleTheme,
    setIsProfileOpen,
    logout,
    language,
    setLanguage,
    clearSessionData,
    accounts,
    setIsMessagesOpen,
    unreadCount,
    updateFacialProfile,
    isAuthOpen,
    setIsAuthOpen,
    t
  } = usePortal();

  const [menuOpen, setMenuOpen] = useState(false);
  const [dataClearedNotice, setDataClearedNotice] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [isFacePreviewOpen, setIsFacePreviewOpen] = useState(false);
  const [isFaceChangeModalOpen, setIsFaceChangeModalOpen] = useState(false);
  const [faceUpdatedNotice, setFaceUpdatedNotice] = useState(false);

  // Recent Search History with LocalStorage Persistence
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("msn_portal_search_history");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {}
    }
    return [
      "Aadhaar Card",
      "PAN Card Application",
      "Police Verification",
      "Income Certificate",
      "Ration Card"
    ];
  });

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const addSearchHistory = (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed) return;
    setSearchHistory((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      const next = [trimmed, ...filtered].slice(0, 10);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("msn_portal_search_history", JSON.stringify(next));
        } catch (e) {}
      }
      return next;
    });
  };

  const handleRemoveHistoryItem = (queryText: string) => {
    setSearchHistory((prev) => {
      const next = prev.filter((item) => item !== queryText);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("msn_portal_search_history", JSON.stringify(next));
        } catch (e) {}
      }
      return next;
    });
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("msn_portal_search_history");
      } catch (e) {}
    }
  };

  const handleSelectHistoryItem = (queryText: string) => {
    setSearchQuery(queryText);
    addSearchHistory(queryText);
    searchInputRef.current?.focus();
  };

  // Auto-dismiss local popovers and modals on mobile/gesture back navigation
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handlePopState = () => {
      setMenuOpen(false);
      setIsResetConfirmOpen(false);
      setIsFamilyModalOpen(false);
      setIsFacePreviewOpen(false);
      setIsFaceChangeModalOpen(false);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Active account information lookup
  const currentAccount = accounts?.find(
    (a) =>
      (user?.email && a.email.toLowerCase() === user.email.toLowerCase()) ||
      (user?.phone && a.phone === user.phone)
  );
  const displayName = user?.name || currentAccount?.name || "Customer User";
  const displayEmail = user?.email || currentAccount?.email || "";
  const displayPhone = user?.phone || currentAccount?.phone || "";
  const displayRoleTag =
    user?.role === "superadmin"
      ? t("role.superadmin")
      : user?.role === "owner"
      ? t("role.owner")
      : t("role.customer");
  const profileAvatar = user?.avatar || currentAccount?.avatar;

  // Track real-time active session duration
  useEffect(() => {
    if (!user) {
      setSessionSeconds(0);
      return;
    }
    const activeSess = currentAccount?.sessionLogs?.find((s) => s.status === "active");
    if (activeSess?.durationSeconds) {
      setSessionSeconds(activeSess.durationSeconds);
    }
    const interval = setInterval(() => {
      setSessionSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [user?.email, user?.role, currentAccount?.activeSessionId]);

  const formatSessionTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    if (mins < 60) {
      return `${mins}m ${secs < 10 ? "0" : ""}${secs}s`;
    }
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hrs}h ${remMins < 10 ? "0" : ""}${remMins}m ${secs < 10 ? "0" : ""}${secs}s`;
  };

  // Close menus and collapse search on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      // Close three-dot menu if clicked outside
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      // Collapse search container if clicked outside and no query entered
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        if (!searchQuery.trim()) {
          setIsSearchFocused(false);
        }
      }
    };
    window.addEventListener("mousedown", handleOutsideClick);
    return () => window.removeEventListener("mousedown", handleOutsideClick);
  }, [searchQuery]);

  const handleClearData = () => {
    clearSessionData();
    setDataClearedNotice(true);
    setTimeout(() => {
      setDataClearedNotice(false);
      setMenuOpen(false);
    }, 1500);
  };

  return (
    <header className="w-full flex flex-col items-center sticky top-0 sm:top-3 z-50 px-2 sm:px-4 pt-1.5 sm:pt-0">
      {/* Dynamic Capsule Navigation Bar */}
      <nav
        className={`w-full max-w-xl md:max-w-2xl transition-all duration-300 rounded-2xl sm:rounded-full border shadow-lg sm:shadow-xl backdrop-blur-xl px-2.5 sm:px-3.5 py-1.5 flex items-center justify-between gap-1.5 sm:gap-2.5 ${
          theme === "light"
            ? "bg-white/95 border-slate-200/90 shadow-slate-200/60 text-slate-800"
            : "bg-[#11131c]/90 border-white/10 shadow-black/50 text-slate-200"
        }`}
      >
        {/* Left: Brand Logo & Navigation Control (Theme Toggle) */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setCurrentView("meeseva")}
            className="p-0.5 rounded-full hover:opacity-85 transition-opacity cursor-pointer shrink-0"
            title="MSN Communications - Home"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/msn-logo.png"
              alt="MSN Communications"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-contain bg-white p-0.5 shadow-2xs border border-slate-200 dark:border-white/10"
            />
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            className={`p-1.5 sm:p-2 rounded-full transition-colors cursor-pointer ${
              theme === "light"
                ? "text-slate-700 hover:text-slate-950 hover:bg-slate-100"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            aria-label="Toggle Theme"
          >
            {theme === "light" ? (
              <Moon className="w-4 h-4 text-slate-700" />
            ) : (
              <Sun className="w-4 h-4 text-amber-300" />
            )}
          </button>
        </div>

        {/* Center: Central Search Bar with Click & Expand Behavior */}
        <div
          ref={searchContainerRef}
          onClick={() => {
            if (!isSearchFocused) {
              setIsSearchFocused(true);
              setTimeout(() => searchInputRef.current?.focus(), 50);
            }
          }}
          className={`flex-1 min-w-0 flex items-center transition-all duration-300 ease-in-out relative rounded-full px-2 sm:px-2.5 py-1 ${
            isSearchFocused || searchQuery
              ? theme === "light"
                ? "bg-white border border-[#FF9933]/80 ring-2 ring-[#FF9933]/25 shadow-inner"
                : "bg-white/10 border border-[#FF9933]/50 ring-2 ring-[#FF9933]/20 shadow-inner"
              : "bg-transparent cursor-pointer hover:bg-slate-50/70 dark:hover:bg-white/5"
          }`}
        >
          {/* Search Icon */}
          <Search
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-colors ${
              isSearchFocused || searchQuery
                ? "text-[#FF9933]"
                : "text-slate-400 dark:text-slate-400 mr-1.5 sm:mr-2"
            }`}
          />

          {/* Resting State Preview Tags for Desktop: "Dashboard  Meeseva  online works  documents" */}
          {!isSearchFocused && !searchQuery && (
            <div className="hidden sm:flex items-center gap-1.5 sm:gap-2.5 text-xs font-medium animate-in fade-in duration-200 select-none overflow-hidden truncate">
              {/* Dashboard Preview Tag for Desktop */}
              <button
                type="button"
                id="btnDesktopNavDashboard"
                data-nav="dashboard"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentView("meeseva");
                }}
                className={`nav-tab-dashboard px-2.5 py-0.5 rounded-full transition-all cursor-pointer font-semibold ${
                  (currentView as string) === "dashboard"
                    ? "bg-[#000080] text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10"
                }`}
                title="Go to Dashboard"
              >
                Dashboard
              </button>
              {/* Meeseva Preview Tag (Saffron accent) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentView("meeseva");
                }}
                className={`px-2.5 py-0.5 rounded-full transition-all cursor-pointer capitalize font-semibold ${
                  currentView === "meeseva"
                    ? "bg-[#FFF3E0] dark:bg-amber-950/70 text-[#E65100] dark:text-[#FFB74D] border border-[#FFE0B2] dark:border-amber-800 shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10"
                }`}
                title="Go to MeeSeva"
              >
                {t("nav.meeseva")}
              </button>

              {/* online works Preview Tag (Ashoka Navy Blue accent) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentView("online-works");
                }}
                className={`px-2.5 py-0.5 rounded-full transition-all cursor-pointer font-semibold ${
                  currentView === "online-works" || currentView === "online-sub"
                    ? "bg-[#EFF6FF] dark:bg-blue-950/70 text-[#000080] dark:text-[#93C5FD] border border-[#BFDBFE] dark:border-blue-800 shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10"
                }`}
                title="Go to Online Works"
              >
                {t("nav.online_works")}
              </button>

              {/* documents Preview Tag (India Green accent) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentView("documents");
                }}
                className={`px-2.5 py-0.5 rounded-full transition-all cursor-pointer font-semibold ${
                  currentView === "documents"
                    ? "bg-[#E8F5E9] dark:bg-emerald-950/70 text-[#138808] dark:text-[#A5D6A7] border border-[#C8E6C9] dark:border-emerald-800 shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10"
                }`}
                title="Go to Documents"
              >
                {t("nav.documents")}
              </button>
            </div>
          )}

          {/* Resting State Preview on Mobile (Compact Search Trigger) */}
          {!isSearchFocused && !searchQuery && (
            <div className="flex sm:hidden items-center text-xs text-slate-400 dark:text-slate-400 font-medium truncate select-none">
              <span className="truncate">{t("nav.search_placeholder") || "Search services..."}</span>
            </div>
          )}

          {/* Expanded Search Input with active typing cursor and clean placeholder */}
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => {
              if (!searchQuery.trim()) {
                setTimeout(() => {
                  if (!searchContainerRef.current?.contains(document.activeElement)) {
                    setIsSearchFocused(false);
                  }
                }, 150);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (searchQuery.trim()) {
                  addSearchHistory(searchQuery.trim());
                }
              }
            }}
            placeholder={t("nav.search_placeholder")}
            className={`w-full text-xs md:text-sm py-1 bg-transparent border-none outline-none transition-all duration-300 ${
              isSearchFocused || searchQuery
                ? "opacity-100 ml-2 pl-0.5 block flex-1"
                : "opacity-0 w-0 p-0 pointer-events-none hidden"
            } ${
              theme === "light"
                ? "text-slate-900 placeholder-slate-400"
                : "text-white placeholder-slate-400"
            }`}
          />

          {/* Clear Button when user has entered text */}
          {searchQuery && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSearchQuery("");
                searchInputRef.current?.focus();
              }}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0 ml-1 transition-colors cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Interactive Recent Search History Dropdown */}
          {isSearchFocused && (
            <div
              onMouseDown={(e) => e.preventDefault()}
              className={`absolute left-1/2 -translate-x-1/2 sm:left-0 sm:right-0 sm:translate-x-0 top-full mt-2.5 sm:mt-3 w-[calc(100vw-1.5rem)] sm:w-auto z-50 rounded-2xl border shadow-2xl backdrop-blur-xl p-3 animate-in fade-in zoom-in-95 duration-150 ${
                theme === "light"
                  ? "bg-white/95 border-slate-200 text-slate-800 shadow-slate-300/60"
                  : "bg-[#181a24]/95 border-white/10 text-slate-200 shadow-black/80"
              }`}
            >
              {/* Dropdown Header */}
              <div className="flex items-center justify-between px-2 pb-2 mb-1.5 border-b border-slate-100 dark:border-white/10">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-[#FF9933]" />
                  <span>Recent Search History</span>
                </div>
                {searchHistory.length > 0 && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    {searchHistory.length} {searchHistory.length === 1 ? "entry" : "entries"}
                  </span>
                )}
              </div>

              {/* History Items List */}
              <div className="space-y-0.5 max-h-52 overflow-y-auto pr-0.5">
                {searchHistory.length === 0 ? (
                  <div className="py-4 text-center text-xs text-slate-400">
                    No recent searches yet. Type and press Enter to save.
                  </div>
                ) : (
                  searchHistory.map((queryText, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectHistoryItem(queryText)}
                      className={`group flex items-center justify-between px-2.5 py-2 rounded-xl cursor-pointer transition-all text-xs ${
                        theme === "light"
                          ? "hover:bg-[#FFF3E0] hover:text-[#E65100]"
                          : "hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Clock className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#FF9933] shrink-0" />
                        <span className="truncate font-medium">{queryText}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveHistoryItem(queryText);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="Remove from history"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Dropdown Footer: Clear History Action */}
              {searchHistory.length > 0 && (
                <div className="pt-2 mt-1.5 border-t border-slate-100 dark:border-white/10 flex justify-between items-center px-1">
                  <span className="text-[10px] text-slate-400">Click any item to search</span>
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="text-xs font-semibold text-rose-500 hover:text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear History</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Face Recognition Quick Action & Three-Dots Menu */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 relative" ref={menuRef}>
          {!user && (
            <button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              className="px-2 py-1 rounded-full bg-[#000080] hover:bg-[#000066] text-white text-[10px] sm:text-[11px] font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1 shrink-0"
              title="Sign In to Customer Portal"
            >
              <LogIn className="w-3 h-3" />
              <span className="hidden xs:inline">Sign In</span>
            </button>
          )}

          {/* Dedicated Face Recognition Dynamic Bar Button */}
          <button
            type="button"
            onClick={() => setIsFacePreviewOpen(true)}
            className={`p-0.5 sm:p-1 rounded-full transition-all cursor-pointer flex items-center justify-center relative group border ${
              theme === "light"
                ? "border-slate-200 hover:border-[#FF9933]/60 bg-white"
                : "border-white/10 hover:border-[#FF9933]/60 bg-white/5"
            }`}
            title="Face Recognition: View or Change Profile Photo"
            aria-label="Face Recognition"
          >
            {profileAvatar ? (
              <img
                src={profileAvatar}
                alt={displayName}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-[#FF9933] shadow-2xs"
              />
            ) : (
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Scan className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white dark:border-[#11131c]" />
          </button>

          {/* Three-Dots Icon (...) */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className={`p-1.5 sm:p-2 rounded-full transition-colors cursor-pointer flex items-center justify-center relative ${
              menuOpen
                ? theme === "light"
                  ? "bg-slate-100 text-slate-900 ring-2 ring-indigo-500/20"
                  : "bg-white/15 text-white ring-2 ring-indigo-500/30"
                : theme === "light"
                ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
            title="Account & Language Menu (...)"
            aria-label="Account and Language Menu"
          >
            <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#FF9933] border-2 border-white dark:border-[#11131c] animate-pulse" />
            )}
          </button>

          {/* Three-Dots Popover Dropdown */}
          {menuOpen && (
            <div
              className={`absolute right-0 top-full mt-2.5 sm:mt-3 w-[calc(100vw-1.5rem)] max-w-sm sm:w-84 rounded-3xl border shadow-2xl p-3.5 sm:p-4 text-left z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-2xl ${
                theme === "light"
                  ? "bg-white/98 border-slate-200 shadow-slate-300/70 text-slate-800"
                  : "bg-[#13141f]/98 border-white/10 shadow-black/80 text-slate-100"
              }`}
            >
              {/* Notice Alert if data cleared */}
              {dataClearedNotice && (
                <div className="mb-3 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs text-center flex items-center justify-center gap-1.5 font-medium animate-in fade-in">
                  <Check className="w-3.5 h-3.5" />
                  <span>Session records cleared!</span>
                </div>
              )}

              {/* 1. Logged-in Account Profile Card */}
              <div
                className={`p-3.5 rounded-2xl border mb-3 ${
                  theme === "light"
                    ? "bg-gradient-to-br from-[#FFF8F0] via-white to-[#F0FDF4] border-[#FFE0B2]/70 shadow-xs"
                    : "bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900 border-slate-800"
                }`}
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    {profileAvatar ? (
                      <div className="relative w-10 h-10 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={profileAvatar}
                          alt={displayName}
                          className="w-10 h-10 rounded-2xl object-cover border-2 border-[#FF9933] shadow-sm bg-slate-900"
                        />
                        {(currentAccount?.faceVerified || user?.faceVerified) && (
                          <span
                            className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold border border-white dark:border-slate-900"
                            title="Biometrically Verified"
                          >
                            ✓
                          </span>
                        )}
                      </div>
                    ) : (
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black shrink-0 text-white shadow-sm ${
                          user?.role === "superadmin"
                            ? "bg-gradient-to-tr from-[#000080] to-[#1E3A8A]"
                            : user?.role === "owner"
                            ? "bg-gradient-to-tr from-[#FF9933] to-[#FF6F00]"
                            : "bg-gradient-to-tr from-[#138808] to-[#2E7D32]"
                        }`}
                      >
                        {displayName.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <div className="truncate">
                      <p className={`font-extrabold text-sm truncate ${theme === "light" ? "text-slate-900" : "text-white"}`}>
                        {displayName}
                      </p>
                      <span
                        className={`inline-block mt-0.5 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          user?.role === "superadmin"
                            ? "bg-[#EFF6FF] dark:bg-[#0A1931] text-[#000080] dark:text-[#93C5FD] border border-[#BFDBFE] dark:border-blue-900"
                            : user?.role === "owner"
                            ? "bg-[#FFF3E0] dark:bg-amber-950/80 text-[#E65100] dark:text-[#FFB74D] border border-[#FFE0B2] dark:border-amber-800"
                            : "bg-[#E8F5E9] dark:bg-emerald-950/80 text-[#138808] dark:text-[#A5D6A7] border border-[#C8E6C9] dark:border-emerald-800"
                        }`}
                      >
                        {displayRoleTag}
                      </span>
                    </div>
                  </div>

                  {/* Active Status Badge (India Green) */}
                  <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5E9] dark:bg-emerald-950/80 text-[#138808] dark:text-[#A5D6A7] border border-[#C8E6C9] dark:border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#138808] animate-pulse" />
                    {t("nav.active_now")}
                  </span>
                </div>

                {/* Account Details Rows */}
                <div className="mt-3 pt-2.5 border-t border-slate-200/70 dark:border-slate-800/80 space-y-1.5 text-xs">
                  {/* Email ID */}
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 overflow-hidden">
                    <Mail className="w-3.5 h-3.5 text-[#000080] dark:text-[#60A5FA] shrink-0" />
                    <span className="font-mono text-[11px] truncate" title={displayEmail}>
                      {displayEmail}
                    </span>
                  </div>

                  {/* Phone Number */}
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-[#138808] shrink-0" />
                    <span className="font-mono text-[11px]">{displayPhone}</span>
                  </div>

                  {/* Active Session Time */}
                  <div className="flex items-center justify-between gap-2 pt-1 text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#FF9933]" />
                      <span>{t("nav.session_time")}</span>
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {formatSessionTime(sessionSeconds)}
                    </span>
                  </div>
                </div>

                {/* Extended Family & Dependents Button */}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setIsFamilyModalOpen(true);
                  }}
                  className="w-full mt-2.5 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-[#FF9933]/15 to-[#138808]/15 hover:from-[#FF9933]/25 hover:to-[#138808]/25 text-[#000080] dark:text-blue-300 border border-[#000080]/20 font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5 text-[#000080] dark:text-blue-300" />
                  <span>{t("nav.family_dependents")}</span>
                </button>

                {/* Sign In / Sign Out Button */}
                {user ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                    className="w-full mt-2 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition-all cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t("nav.sign_out")}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setIsAuthOpen(true);
                    }}
                    className="w-full mt-2 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#000080] hover:bg-[#000066] text-white font-bold text-xs shadow-md shadow-[#000080]/20 transition-all cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Customer Sign In / Login</span>
                  </button>
                )}
              </div>

              {/* Dedicated Face Recognition Management Block */}
              <div
                className={`p-3.5 rounded-2xl border mb-3 ${
                  theme === "light"
                    ? "bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/40 border-indigo-200/80 shadow-xs"
                    : "bg-gradient-to-br from-indigo-950/30 via-slate-900/40 to-purple-950/20 border-indigo-900/60"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/15 dark:bg-indigo-500/25 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Scan className="w-4 h-4" />
                    </div>
                    <div>
                      <span className={`text-xs font-bold flex items-center gap-1.5 ${theme === "light" ? "text-slate-900" : "text-white"}`}>
                        Face Recognition
                      </span>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        Biometric Identity & Profile Photo
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      profileAvatar || currentAccount?.faceVerified
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/60"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/60"
                    }`}
                  >
                    {profileAvatar || currentAccount?.faceVerified ? "✓ Enrolled" : "Not Enrolled"}
                  </span>
                </div>

                {/* Sub-Actions: [ View ] and [ Change ] */}
                <div className="grid grid-cols-2 gap-2 mt-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setIsFacePreviewOpen(true);
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white/90 dark:bg-slate-800/80 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>[ View ]</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setIsFaceChangeModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-gradient-to-r from-[#FF9933] to-[#FF6F00] hover:from-[#FF6F00] hover:to-[#E65100] text-white text-xs font-bold shadow-md shadow-[#FF9933]/20 transition-all cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>[ Change ]</span>
                  </button>
                </div>
              </div>

              {/* 2. Language Selector Option with 3 Selectable Languages */}
              <div
                className={`p-3 rounded-2xl border mb-3 ${
                  theme === "light"
                    ? "bg-slate-50/90 border-slate-200/90"
                    : "bg-white/5 border-white/10"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#FF9933]" />
                    <span className={`text-xs font-bold ${theme === "light" ? "text-[#0A1931]" : "text-white"}`}>
                      {t("nav.language")} / Language
                    </span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FFF3E0] text-[#E65100] border border-[#FFE0B2]">
                    {language === "EN" ? "EN" : language === "TE" ? "TE" : "HI"}
                  </span>
                </div>

                {/* Three Selectable Languages */}
                <div className="grid grid-cols-1 gap-1.5">
                  {/* English (Default) */}
                  <button
                    type="button"
                    onClick={() => setLanguage("EN")}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      language === "EN"
                        ? "bg-[#FF9933] text-white shadow-md shadow-[#FF9933]/30 font-bold"
                        : theme === "light"
                        ? "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80"
                        : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 border border-slate-700/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm">🇬🇧</span>
                      <span>English (Default)</span>
                    </div>
                    {language === "EN" && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>

                  {/* Telugu (తెలుగు) */}
                  <button
                    type="button"
                    onClick={() => setLanguage("TE")}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      language === "TE"
                        ? "bg-[#FF9933] text-white shadow-md shadow-[#FF9933]/30 font-bold"
                        : theme === "light"
                        ? "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80"
                        : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 border border-slate-700/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm">🇮🇳</span>
                      <span>Telugu (తెలుగు)</span>
                    </div>
                    {language === "TE" && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>

                  {/* Hindi (हिंदी) */}
                  <button
                    type="button"
                    onClick={() => setLanguage("HI")}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      language === "HI"
                        ? "bg-[#FF9933] text-white shadow-md shadow-[#FF9933]/30 font-bold"
                        : theme === "light"
                        ? "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80"
                        : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 border border-slate-700/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm">🇮🇳</span>
                      <span>Hindi (हिंदी)</span>
                    </div>
                    {language === "HI" && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                </div>
              </div>

              {/* 3. Secondary Navigation Menu Items */}
              <div className="space-y-1.5 text-xs">
                {/* Notifications & Messages Box / Tab */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMessagesOpen(true);
                    setMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl transition-colors cursor-pointer group text-left ${
                    unreadCount > 0
                      ? "bg-[#FFF8F0] dark:bg-amber-950/40 border border-[#FFE0B2] dark:border-amber-900/60"
                      : "hover:bg-slate-100 dark:hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-6 h-6 rounded-lg bg-[#FFF3E0] text-[#E65100] flex items-center justify-center shrink-0">
                      <Bell className="w-3.5 h-3.5 text-[#FF9933]" />
                    </div>
                    <div className="truncate">
                      <span className={`font-semibold block ${theme === "light" ? "text-slate-800" : "text-slate-200"}`}>
                        {t("nav.notifications_messages")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {unreadCount > 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#FF9933] text-white shadow-xs animate-pulse">
                        {unreadCount} New
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#000080] dark:text-blue-400 font-semibold group-hover:underline">
                        {t("nav.view")}
                      </span>
                    )}
                  </div>
                </button>

                {/* History & Payments */}
                <button
                  type="button"
                  onClick={() => {
                    setCurrentView("history");
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer group text-left"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-6 h-6 rounded-lg bg-[#EFF6FF] text-[#000080] flex items-center justify-center shrink-0">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <span className={`font-semibold ${theme === "light" ? "text-slate-800" : "text-slate-200"}`}>
                      {t("nav.history_payments")}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#000080] font-semibold group-hover:underline">
                    {t("nav.view")}
                  </span>
                </button>

                {/* Help & Support */}
                <a
                  href="tel:8125898068"
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-6 h-6 rounded-lg bg-[#E8F5E9] text-[#138808] flex items-center justify-center shrink-0">
                      <HelpCircle className="w-3.5 h-3.5" />
                    </div>
                    <span className={`font-semibold ${theme === "light" ? "text-slate-800" : "text-slate-200"}`}>
                      {t("nav.help_support")}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">8125898068</span>
                </a>

                {/* Complaint Box */}
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(true);
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer group text-left"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-6 h-6 rounded-lg bg-[#FFF3E0] text-[#E65100] flex items-center justify-center shrink-0">
                      <MessageSquare className="w-3.5 h-3.5" />
                    </div>
                    <span className={`font-semibold ${theme === "light" ? "text-slate-800" : "text-slate-200"}`}>
                      {t("nav.complaint_box")}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#E65100] font-semibold group-hover:underline">
                    {t("nav.feedback")}
                  </span>
                </button>

                {/* Reset Session Records with Confirmation Modal */}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setIsResetConfirmOpen(true);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-500 transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-6 h-6 rounded-lg bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-semibold text-rose-500">
                      {t("nav.reset_session")}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold">{t("nav.clear")}</span>
                </button>

                {/* Admin/Owner Console Shortcut */}
                {(user?.role === "owner" || user?.role === "superadmin") && (
                  <div
                    className={`pt-2 mt-2 border-t flex items-center justify-between ${
                      theme === "light" ? "border-slate-100" : "border-white/10"
                    }`}
                  >
                    <span className="text-[11px] text-slate-400 font-medium">{t("nav.console")}</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (user?.role === "owner") setCurrentView("owner-dashboard");
                        else setCurrentView("admin-dashboard");
                        setMenuOpen(false);
                      }}
                      className="text-xs font-bold text-[#000080] dark:text-[#60A5FA] hover:underline cursor-pointer"
                    >
                      {user?.role === "owner" ? t("nav.owner_portal") : t("nav.admin_console")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Sticky Quick-View Navigator Chips */}
      <div className="flex sm:hidden items-center justify-center gap-1.5 mt-1.5 w-full max-w-xl px-1 overflow-x-auto no-scrollbar py-0.5">
        {/* Customer Dashboard Navigation Tab (Hidden on mobile via CSS media query max-width: 768px) */}
        <button
          type="button"
          id="btnNavDashboard"
          data-nav="dashboard"
          onClick={() => setCurrentView("meeseva")}
          className={`nav-tab-dashboard px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
            (currentView as string) === "dashboard"
              ? "bg-[#000080] text-white shadow-xs scale-105"
              : "bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800"
          }`}
          title="Dashboard"
        >
          <span>📊</span>
          <span>Dashboard</span>
        </button>
        <button
          type="button"
          onClick={() => setCurrentView("meeseva")}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
            currentView === "meeseva"
              ? "bg-[#FFF3E0] dark:bg-amber-950/70 text-[#E65100] dark:text-[#FFB74D] border border-[#FFE0B2] dark:border-amber-800 shadow-xs scale-105"
              : "bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800"
          }`}
        >
          <span>🏛️</span>
          <span>{t("nav.meeseva")}</span>
        </button>
        <button
          type="button"
          onClick={() => setCurrentView("online-works")}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
            currentView === "online-works" || currentView === "online-sub"
              ? "bg-[#EFF6FF] dark:bg-blue-950/70 text-[#000080] dark:text-[#93C5FD] border border-[#BFDBFE] dark:border-blue-800 shadow-xs scale-105"
              : "bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800"
          }`}
        >
          <span>🌐</span>
          <span>{t("nav.online_works")}</span>
        </button>
        <button
          type="button"
          onClick={() => setCurrentView("documents")}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
            currentView === "documents"
              ? "bg-[#E8F5E9] dark:bg-emerald-950/70 text-[#138808] dark:text-[#A5D6A7] border border-[#C8E6C9] dark:border-emerald-800 shadow-xs scale-105"
              : "bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800"
          }`}
        >
          <span>📁</span>
          <span>{t("nav.documents")}</span>
        </button>
      </div>

      {/* Confirmation Modal for Reset Session Records */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#151923] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-900/60 flex items-center justify-center shrink-0 text-rose-600">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {t("nav.reset_modal_title")}
                </h3>
                <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t("nav.reset_modal_desc")}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/10">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer"
              >
                [ {t("common.no")} ]
              </button>
              <button
                type="button"
                onClick={() => {
                  clearSessionData();
                  setDataClearedNotice(true);
                  setIsResetConfirmOpen(false);
                  setTimeout(() => {
                    setDataClearedNotice(false);
                  }, 2500);
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all cursor-pointer"
              >
                [ {t("common.yes")} ]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extended Family & Dependents Schema Modal */}
      <ExtendedFamilyModal
        isOpen={isFamilyModalOpen}
        onClose={() => setIsFamilyModalOpen(false)}
      />

      {/* Face Recognition: [ View ] Profile Snapshot Modal */}
      {isFacePreviewOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-[#11131c] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200 space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Scan className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Facial Biometric Profile
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFacePreviewOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Snapshot in Tailored Circular Frame (~4 cm) */}
            <div className="relative my-2 flex flex-col items-center">
              <div className="relative w-36 h-36 rounded-full p-1 bg-gradient-to-tr from-[#000080] via-[#FF9933] to-[#138808] shadow-xl flex items-center justify-center">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 relative flex items-center justify-center">
                  {profileAvatar ? (
                    <img
                      src={profileAvatar}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Scan className="w-10 h-10 text-indigo-400 mb-1" />
                      <span className="text-[10px]">No Scan Enrolled</span>
                    </div>
                  )}
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E8F5E9] text-[#138808] border border-[#C8E6C9] shadow-md mt-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Biometric Identity Enrolled</span>
              </span>
            </div>

            {/* Details Box */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Citizen:</span>
                <span className="font-bold text-slate-900 dark:text-white">{displayName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{displayEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Template ID:</span>
                <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 truncate max-w-[170px]">
                  {currentAccount?.faceEmbedding || user?.faceEmbedding || "emb-msn-verified-template-sha256"}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              This facial snapshot is encrypted and securely linked to your account for biometric authentication and forgot password validation.
            </p>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-white/10">
              <button
                type="button"
                onClick={() => {
                  setIsFacePreviewOpen(false);
                  setIsFaceChangeModalOpen(true);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#FF9933] to-[#FF6F00] hover:from-[#FF6F00] hover:to-[#E65100] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#FF9933]/20 transition-all cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>[ Change ]</span>
              </button>
              <button
                type="button"
                onClick={() => setIsFacePreviewOpen(false)}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Face Recognition: [ Change ] Camera Capture Flow */}
      <FaceRecognitionModal
        isOpen={isFaceChangeModalOpen}
        onClose={() => setIsFaceChangeModalOpen(false)}
        mode="register"
        targetCustomer={currentAccount || (user ? ({ id: user.id, name: user.name, email: user.email, phone: user.phone || "" } as any) : undefined)}
        onCaptureSuccess={(photoDataUrl, faceEmbedding) => {
          updateFacialProfile(displayEmail, photoDataUrl, faceEmbedding);
          setIsFaceChangeModalOpen(false);
          setFaceUpdatedNotice(true);
          setTimeout(() => setFaceUpdatedNotice(false), 3500);
        }}
      />

      {/* Toast Notification when Face Recognition is Updated */}
      {faceUpdatedNotice && (
        <div className="fixed bottom-6 right-6 z-[130] p-4 rounded-2xl bg-emerald-600 text-white shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200">
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <div className="text-xs">
            <p className="font-bold">Face Recognition Updated!</p>
            <p className="text-emerald-100 text-[11px]">Your new facial snapshot and template are now active.</p>
          </div>
        </div>
      )}
    </header>
  );
};
