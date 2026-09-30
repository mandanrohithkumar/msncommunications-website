"use client";

import React, { useState, useMemo } from "react";
import { usePortal } from "@/lib/portal-store";
import { Application, ApplicationStatus, UploadedFileMeta } from "@/types/portal";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Printer,
  CreditCard,
  ChevronRight,
  ExternalLink,
  ShieldCheck
} from "lucide-react";

export const ApplicationHistory: React.FC = () => {
  const { applications, setActivePaymentApp, user, setPreviewDoc, searchQuery } = usePortal();
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // Filter applications for current user (or show all if admin/owner) strictly scoped to active logged-in customer ID
  const userApps = useMemo(() => {
    return applications
      .filter((app) =>
        user?.role === "customer"
          ? app.customerId === user.id ||
            (user.email && app.customerEmail?.toLowerCase() === user.email.toLowerCase()) ||
            (user.phone && app.customerPhone?.replace(/\D/g, "") === user.phone.replace(/\D/g, ""))
          : true
      )
      .filter((app) => {
        if (!searchQuery?.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        return (
          app.id.toLowerCase().includes(q) ||
          app.serviceName.toLowerCase().includes(q) ||
          app.serviceCategory.toLowerCase().includes(q) ||
          app.status.toLowerCase().includes(q) ||
          (app.subCategory && app.subCategory.toLowerCase().includes(q))
        );
      });
  }, [applications, user, searchQuery]);

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case "Completed":
        return "bg-[#E8F5E9] text-[#138808] border-[#C8E6C9]";
      case "Accepted":
      case "Processing":
        return "bg-[#E8EEF5] text-[#000080] border-[#000080]/30";
      case "Waiting for Owner":
        return "bg-[#FFF3E0] text-[#E65100] border-[#FF9933]/30";
      case "Payment Pending":
        return "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30";
      default:
        return "bg-[#E8EEF5] text-[#000080] border-[#000080]/20";
    }
  };

  const handlePrintReceipt = (app: Application) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Application Receipt - ${app.id}</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; color: #0A1931; max-width: 600px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #FF9933; padding-bottom: 16px; margin-bottom: 24px; }
            .title { font-size: 22px; font-weight: 800; color: #000080; letter-spacing: 0.5px; }
            .subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }
            .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
            .label { color: #64748b; font-weight: 500; }
            .val { font-weight: 600; color: #0A1931; }
            .badge { display: inline-block; background: #E8F5E9; color: #138808; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: bold; border: 1px solid #C8E6C9; }
            .footer { margin-top: 32px; text-align: center; font-size: 11px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">MSN COMMUNICATION</div>
            <div class="subtitle">Official Service Application Acknowledgement Receipt</div>
          </div>
          <div class="row"><span class="label">Application Reference ID:</span><span class="val">${app.id}</span></div>
          <div class="row"><span class="label">Service Category:</span><span class="val">${app.serviceCategory}</span></div>
          <div class="row"><span class="label">Service Name:</span><span class="val">${app.serviceName}</span></div>
          <div class="row"><span class="label">Applicant Name:</span><span class="val">${app.customerName}</span></div>
          <div class="row"><span class="label">Applicant Phone:</span><span class="val">${app.customerPhone}</span></div>
          <div class="row"><span class="label">Statutory Fee Paid:</span><span class="val">₹${app.price}</span></div>
          <div class="row"><span class="label">Current Status:</span><span class="badge">${app.status}</span></div>
          <div class="row"><span class="label">Submission Timestamp:</span><span class="val">${app.createdAt}</span></div>
          <div class="footer">
            <p>Verified through Official Government Processing Center</p>
            <p>Contact Owner: 8125898068 • msncommunication23@gmail.com</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
          Application History & Tracking
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Track real-time status, download statutory acknowledgement slips, and review submission history
        </p>
      </div>

      {userApps.length === 0 ? (
        <div className="text-center py-16 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
          <Clock className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No applications found</p>
          <p className="text-xs text-slate-500 mt-1">
            Apply for any MeeSeva or Online Works service to track your application here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {userApps.map((app) => (
            <div
              key={app.id}
              className="p-5 md:p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800 backdrop-blur-md shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800/80">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-[#000080] bg-[#E8EEF5] px-2.5 py-0.5 rounded-md border border-[#000080]/20">
                      {app.id}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">• {app.createdAt}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">{app.serviceName}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{app.serviceCategory}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusBadge(
                      app.status
                    )}`}
                  >
                    {app.status}
                  </span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">₹{app.price}</span>
                </div>
              </div>

              {/* Detail fields & docs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-400">
                <div>
                  <span className="text-slate-500 block">Applicant:</span>
                  <span className="text-slate-900 dark:text-white font-medium">{app.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Assigned Officer / Owner:</span>
                  <span className="text-slate-900 dark:text-white font-medium">
                    {app.assignedOwnerName || "Pending Assignment"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Uploaded Files:</span>
                  <span className="text-slate-900 dark:text-white font-medium">
                    {Object.keys(app.uploadedDocs).length} attached
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-wrap items-center justify-end gap-2.5">
                {app.status === "Payment Pending" && (
                  <button
                    onClick={() => setActivePaymentApp(app)}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Complete Payment</span>
                  </button>
                )}

                <button
                  onClick={() => handlePrintReceipt(app)}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>Acknowledgement Slip</span>
                </button>

                {Object.keys(app.uploadedDocs).length > 0 && (
                  <button
                    onClick={() => {
                      const firstDoc = Object.values(app.uploadedDocs)[0];
                      if (firstDoc) setPreviewDoc(firstDoc as unknown as UploadedFileMeta);
                    }}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#000080]" />
                    <span>View Document</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
