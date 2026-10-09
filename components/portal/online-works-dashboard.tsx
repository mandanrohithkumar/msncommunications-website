"use client";

import React, { useState } from "react";
import { usePortal } from "@/lib/portal-store";
import { ServiceCategory, ServiceItem } from "@/types/portal";
import { ArrowLeft, ArrowRight, ExternalLink, Sparkles } from "lucide-react";

export const OnlineWorksDashboard: React.FC = () => {
  const {
    onlineCategories,
    selectedCategory,
    setSelectedCategory,
    openServiceForm,
    searchQuery,
    goBack,
    t
  } = usePortal();

  // Filter categories and sub-services based on active search
  const filteredCategories = onlineCategories
    .map((cat) => {
      if (!searchQuery.trim()) return cat;
      const q = searchQuery.toLowerCase();
      const catMatches = cat.name.toLowerCase().includes(q);
      const matchedSubs = cat.subServices.filter(
        (sub) =>
          sub.name.toLowerCase().includes(q) ||
          (sub.note && sub.note.toLowerCase().includes(q))
      );
      if (catMatches || matchedSubs.length > 0) {
        return {
          ...cat,
          subServices: matchedSubs.length > 0 ? matchedSubs : cat.subServices
        };
      }
      return null;
    })
    .filter(Boolean) as ServiceCategory[];

  // If a category is selected (and user is not searching globally), show its Sub-Services View
  if (selectedCategory && !searchQuery.trim()) {
    return (
      <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8 animate-in fade-in duration-300">
        {/* Sub-view Header */}
        <div className="relative flex flex-col items-center text-center mb-6 sm:mb-10">
          <button
            onClick={goBack}
            className="md:absolute left-0 top-1/2 md:-translate-y-1/2 mb-3 md:mb-0 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors flex items-center gap-1.5 cursor-pointer backdrop-blur-md shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t("docs.back_to_categories")}</span>
          </button>
          <div className="flex items-center gap-2.5 sm:gap-3">
            <span className="text-2xl sm:text-3xl">{selectedCategory.icon}</span>
            <h1 className="text-xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              {selectedCategory.name}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 sm:mt-2 max-w-xl">
            {t("hero.subtitle")}
          </p>
        </div>

        {/* Sub-services Grid - Compact on mobile, standard on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-5">
          {selectedCategory.subServices.map((sub) => (
            <div
              key={sub.id}
              onClick={() => openServiceForm(sub, "online-sub")}
              className="group p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900/70 hover:bg-slate-50/90 dark:hover:bg-slate-800/80 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/50 backdrop-blur-md transition-all duration-200 transform hover:-translate-y-1 cursor-pointer flex items-center justify-between shadow-xs sm:shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
                <span className="text-xl sm:text-2xl p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-slate-100 border border-slate-200 dark:bg-slate-800/60 dark:border-slate-700/50 group-hover:scale-110 transition-transform shrink-0">
                  {sub.icon}
                </span>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                    {sub.name}
                  </h3>
                  {sub.note && (
                    <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {sub.note}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-2">
                <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-[#E8F5E9] text-[#138808] border border-[#C8E6C9] dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40">
                  {sub.price === "Free" ? t("service.free") : `₹${sub.price}`}
                </span>
                <span className="text-slate-400 group-hover:text-slate-800 dark:text-slate-500 dark:group-hover:text-white transition-colors">
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Main Categories Grid View
  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8 animate-in fade-in duration-300">
      {/* Title */}
      <div className="text-center mb-6 sm:mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-xs font-medium mb-2 sm:mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t("hero.badge")}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-1.5 sm:mb-2">
          {t("hero.title")}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          {t("hero.subtitle")}
        </p>
      </div>

      {/* Main Categories Grid - Compact on mobile, standard on desktop */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-500 dark:text-slate-400 text-sm">No services or categories match &quot;{searchQuery}&quot;.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-5">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => setSelectedCategory(cat)}
              className="group p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900/70 hover:bg-slate-50/90 dark:hover:bg-slate-800/80 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/50 backdrop-blur-md transition-all duration-200 transform hover:-translate-y-1 cursor-pointer flex items-center justify-between shadow-xs sm:shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
                <span className="text-xl sm:text-2xl p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-slate-100 border border-slate-200 dark:bg-slate-800/60 dark:border-slate-700/50 group-hover:scale-110 transition-transform shrink-0">
                  {cat.icon}
                </span>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                    {cat.name}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {cat.subServices.length} {cat.subServices.length === 1 ? "Service" : "Services"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 text-slate-400 group-hover:text-slate-800 dark:text-slate-500 dark:group-hover:text-white transition-colors shrink-0 ml-2">
                <span className="hidden xs:inline text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">{t("hero.explore")}</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
