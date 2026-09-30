"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePortal } from "@/lib/portal-store";
import { X, Phone, Mail, User as UserIcon, Send, MessageSquare } from "lucide-react";

export const ProfileModal: React.FC = () => {
  const { isProfileOpen, setIsProfileOpen, submitFeedback } = usePortal();
  const [complaintText, setComplaintText] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  // Close on ESC and outside click
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isProfileOpen) {
        setIsProfileOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node) && isProfileOpen) {
        setIsProfileOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileOpen, setIsProfileOpen]);

  if (!isProfileOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintText.trim()) return;

    submitFeedback(complaintText.trim());
    setComplaintText("");
    setStatusMessage("Thank you! Feedback received by portal administration.");
    setTimeout(() => {
      setStatusMessage(null);
      setIsProfileOpen(false);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 md:p-6 pointer-events-none">
      <div
        ref={modalRef}
        className="pointer-events-auto w-full max-w-sm rounded-3xl bg-white dark:bg-[#15151e]/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-2xl p-6 text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-200 mt-16"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#FFF3E0] text-[#E65100] border border-[#FF9933]/30 flex items-center justify-center text-xs font-black">
              MSN
            </div>
            <h3 className="text-sm font-semibold tracking-wide text-[#000080] dark:text-blue-300">Owner Information</h3>
          </div>
          <button
            onClick={() => setIsProfileOpen(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            aria-label="Close owner profile"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contact details */}
        <div className="py-4 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2.5">
            <UserIcon className="w-4 h-4 text-[#000080] shrink-0" />
            <div>
              <span className="text-slate-500 dark:text-slate-400">Owner Name: </span>
              <span className="font-semibold text-slate-900 dark:text-white">MANDAN ROHITH KUMAR</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Phone className="w-4 h-4 text-[#000080] shrink-0" />
            <div>
              <span className="text-slate-500 dark:text-slate-400">Official Mobile: </span>
              <a href="tel:8125898068" className="text-[#000080] font-semibold hover:underline">
                8125898068
              </a>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Mail className="w-4 h-4 text-[#000080] shrink-0" />
            <div>
              <span className="text-slate-500 dark:text-slate-400">Official Email: </span>
              <a href="mailto:msncommunication23@gmail.com" className="text-[#000080] font-semibold hover:underline break-all">
                msncommunication23@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Feedback / Complaint submission */}
        <div className="pt-3 border-t border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-1.5 mb-2">
            <MessageSquare className="w-3.5 h-3.5 text-[#FF9933]" />
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-200">Feedback / Complaint Box</h4>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2.5">
            <textarea
              rows={3}
              value={complaintText}
              onChange={(e) => setComplaintText(e.target.value)}
              placeholder="Write your feedback, query, or urgent service note for the owner..."
              className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#FF9933] focus:ring-1 focus:ring-[#FF9933] resize-none transition-colors"
              required
            />
            {statusMessage && (
              <p className="text-[11px] text-[#138808] font-semibold">{statusMessage}</p>
            )}
            <button
              type="submit"
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#FF9933] to-[#FF6F00] hover:from-[#FF6F00] hover:to-[#E65100] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#FF9933]/20 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Submit Feedback
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
