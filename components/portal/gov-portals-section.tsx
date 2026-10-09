"use client";

import React, { useState, useMemo } from "react";
import {
  ExternalLink,
  Search,
  Globe,
  Building2,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  Layers,
  ArrowUpRight,
  Filter
} from "lucide-react";
import { OFFICIAL_GOV_PORTALS, GovPortalLink } from "@/lib/gov-portals-data";

interface GovPortalsSectionProps {
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

export const GovPortalsSection: React.FC<GovPortalsSectionProps> = ({
  title = "Official MeeSeva & Government Portals",
  subtitle = "Direct shortcut links to official Telangana and Central departments for rapid application verification, statutory lookups, and kiosk processing.",
  compact = false
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = useMemo(() => {
    return [
      { id: "all", label: "All Portals" },
      { id: "MeeSeva", label: "MeeSeva" },
      { id: "Civil Supplies", label: "Civil Supplies (Ration)" },
      { id: "Municipal", label: "Municipal (GHMC/CDMA)" },
      { id: "Land & Revenue", label: "Land & Dharani" },
      { id: "Identity & Police", label: "Identity & Police" }
    ];
  }, []);

  const filteredPortals = useMemo(() => {
    return OFFICIAL_GOV_PORTALS.filter((portal) => {
      const matchesCategory =
        selectedCategory === "all" || portal.category === selectedCategory;

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      return (
        portal.name.toLowerCase().includes(q) ||
        portal.shortName.toLowerCase().includes(q) ||
        portal.description.toLowerCase().includes(q) ||
        portal.badge.toLowerCase().includes(q) ||
        portal.url.toLowerCase().includes(q) ||
        portal.keyServices.some((s) => s.toLowerCase().includes(q))
      );
    });
  }, [selectedCategory, searchQuery]);

  const handleCopy = (portal: GovPortalLink) => {
    navigator.clipboard?.writeText(portal.url);
    setCopiedId(portal.id);
    setTimeout(() => {
      setCopiedId((curr) => (curr === portal.id ? null : curr));
    }, 2000);
  };

  const getThemeStyles = (theme: GovPortalLink["theme"]) => {
    switch (theme) {
      case "emerald":
        return {
          cardBorder: "border-emerald-200 dark:border-emerald-900/40 hover:border-emerald-500",
          iconBg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300",
          badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
        };
      case "amber":
        return {
          cardBorder: "border-amber-200 dark:border-amber-900/40 hover:border-amber-500",
          iconBg: "bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300",
          badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border-amber-200 dark:border-amber-800"
        };
      case "purple":
        return {
          cardBorder: "border-purple-200 dark:border-purple-900/40 hover:border-purple-500",
          iconBg: "bg-purple-50 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300",
          badge: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 border-purple-200 dark:border-purple-800"
        };
      case "rose":
        return {
          cardBorder: "border-rose-200 dark:border-rose-900/40 hover:border-rose-500",
          iconBg: "bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300",
          badge: "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300 border-rose-200 dark:border-rose-800"
        };
      case "cyan":
        return {
          cardBorder: "border-cyan-200 dark:border-cyan-900/40 hover:border-cyan-500",
          iconBg: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/70 dark:text-cyan-300",
          badge: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800"
        };
      case "indigo":
        return {
          cardBorder: "border-indigo-200 dark:border-indigo-900/40 hover:border-indigo-500",
          iconBg: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300",
          badge: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
        };
      case "orange":
        return {
          cardBorder: "border-orange-200 dark:border-orange-900/40 hover:border-orange-500",
          iconBg: "bg-orange-50 text-orange-700 dark:bg-orange-950/70 dark:text-orange-300",
          badge: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300 border-orange-200 dark:border-orange-800"
        };
      case "blue":
      default:
        return {
          cardBorder: "border-blue-200 dark:border-blue-900/40 hover:border-blue-500",
          iconBg: "bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300",
          badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-800"
        };
    }
  };

  return (
    <div className="w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 space-y-5 animate-in fade-in duration-200">
      {/* Header with Title and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#000080] to-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-900/20">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{title}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#E8F5E9] text-[#138808] border border-[#C8E6C9] dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
                  {OFFICIAL_GOV_PORTALS.length} Official Depts
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search portal, FSC, UBC, birth..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1 mr-1 shrink-0">
          <Filter className="w-3 h-3" />
          <span>Filter:</span>
        </span>
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-lg font-medium text-xs whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#000080] text-white shadow-sm"
                  : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Grid of Official Portals */}
      {filteredPortals.length === 0 ? (
        <div className="text-center py-8 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700">
          <Building2 className="w-8 h-8 text-slate-400 mx-auto mb-1 opacity-60" />
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            No official portals match &quot;{searchQuery}&quot;
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
            }}
            className="mt-2 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div
          className={`grid gap-3.5 ${
            compact
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {filteredPortals.map((portal) => {
            const styles = getThemeStyles(portal.theme);
            const isCopied = copiedId === portal.id;

            return (
              <div
                key={portal.id}
                className={`group relative p-3.5 sm:p-4 rounded-xl bg-white dark:bg-slate-800/50 border ${styles.cardBorder} transition-all duration-200 hover:shadow-md flex flex-col justify-between`}
              >
                <div>
                  {/* Top Bar: Icon + Badge */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${styles.iconBg} font-bold text-sm shadow-xs`}
                      >
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {portal.shortName}
                        </h4>
                        <span className="text-[10px] text-slate-400 truncate block">
                          {new URL(portal.url).hostname}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${styles.badge}`}
                    >
                      {portal.badge}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 mb-2.5">
                    {portal.description}
                  </p>

                  {/* Key Services Pills */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {portal.keyServices.slice(0, 3).map((srv, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300"
                      >
                        {srv}
                      </span>
                    ))}
                    {portal.keyServices.length > 3 && (
                      <span className="text-[9px] px-1 py-0.5 text-slate-400">
                        +{portal.keyServices.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 mt-auto">
                  <button
                    type="button"
                    onClick={() => handleCopy(portal)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
                    title="Copy URL"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>

                  <a
                    href={portal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-gradient-to-r from-[#000080] to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-[11px] font-bold shadow-xs hover:shadow-sm transition-all cursor-pointer"
                  >
                    <span>Open Portal</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
