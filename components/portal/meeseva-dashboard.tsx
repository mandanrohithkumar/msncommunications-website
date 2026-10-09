"use client";

import React from "react";
import { usePortal } from "@/lib/portal-store";
import { ArrowLeft, ArrowRight, ShieldCheck, Clock, ExternalLink } from "lucide-react";

export const MeesevaDashboard: React.FC = () => {
  const { meesevaServices, openServiceForm, goBack, searchQuery, t } = usePortal();

  const filteredServices = meesevaServices.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || (s.note && s.note.toLowerCase().includes(q));
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8 animate-in fade-in duration-300">
      {/* Title Header with Back Button */}
      <div className="relative flex flex-col items-center text-center mb-6 sm:mb-10">
        <button
          onClick={goBack}
          className="md:absolute left-0 top-1/2 md:-translate-y-1/2 mb-3 md:mb-0 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors flex items-center gap-1.5 cursor-pointer backdrop-blur-md shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t("nav.online_works")}</span>
        </button>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-1.5 sm:mb-2">
          {t("meeseva.title")}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl">
          {t("meeseva.subtitle")}
        </p>
      </div>

      {/* Services Grid (3 columns on desktop, 2 tablet, 1 mobile - compact on mobile) */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-500 dark:text-slate-400 text-sm">No MeeSeva services match &quot;{searchQuery}&quot;.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-5">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              onClick={() => openServiceForm(service, "meeseva")}
              className="group p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900/70 hover:bg-slate-50/90 dark:hover:bg-slate-800/80 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/50 backdrop-blur-md transition-all duration-200 transform hover:-translate-y-1 cursor-pointer flex items-center justify-between shadow-xs sm:shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
                <span className="text-xl sm:text-2xl p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-slate-100 border border-slate-200 dark:bg-slate-800/60 dark:border-slate-700/50 group-hover:scale-110 transition-transform shrink-0">
                  {service.icon}
                </span>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                    {service.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {service.note || "Visit official office"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-2">
                <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-[#E8F5E9] text-[#138808] border border-[#C8E6C9] dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40">
                  ₹{service.price}
                </span>
                <span className="text-slate-400 group-hover:text-slate-800 dark:text-slate-500 dark:group-hover:text-white transition-colors">
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
