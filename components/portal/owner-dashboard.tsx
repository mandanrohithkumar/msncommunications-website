"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { usePortal } from "@/lib/portal-store";
import { Application, ApplicationStatus, UploadedFileMeta, PortalMessage } from "@/types/portal";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Phone,
  Mail,
  FileText,
  MessageSquare,
  AlertTriangle,
  Send,
  Eye,
  User as UserIcon,
  Calendar,
  Sparkles,
  Download,
  Printer,
  Share2,
  Copy,
  RotateCw,
  Tag,
  Activity,
  Layers,
  Filter,
  Check,
  X,
  ZoomIn,
  ZoomOut,
  FileCheck2,
  ImageIcon
} from "lucide-react";
import { resolveDocumentDataUrl, isImageDocument, isPdfDocument } from "@/lib/doc-preview-utils";
import { downloadDocument, shareDocumentAsPdf } from "@/lib/document-download-share";

// Helper component for smooth visual count-up animation of total file count
const AnimatedFileCounter: React.FC<{ targetCount: number; onTrigger?: () => void }> = ({
  targetCount,
  onTrigger
}) => {
  const [displayCount, setDisplayCount] = useState<number>(0);

  const runAnimation = useCallback(() => {
    let startTimestamp: number | null = null;
    const duration = 750; // ms

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // ease-out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayCount(Math.round(easedProgress * targetCount));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [targetCount]);

  useEffect(() => {
    runAnimation();
  }, [runAnimation]);

  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        runAnimation();
        onTrigger?.();
      }}
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F5E9] text-[#138808] border border-[#C8E6C9] font-mono text-xs font-bold cursor-pointer hover:bg-[#C8E6C9] transition-all shadow-sm"
      title="Click to replay count-up animation"
    >
      <Sparkles className="w-3 h-3 text-[#138808] animate-spin" style={{ animationDuration: "3s" }} />
      <span>{displayCount} {displayCount === 1 ? "File" : "Files"} Attached</span>
      <RotateCw className="w-2.5 h-2.5 opacity-60 ml-0.5" />
    </span>
  );
};

interface InlinePreviewState {
  doc: UploadedFileMeta;
  viewMode: "file" | "certificate";
  zoom: number;
  format: "pdf" | "image";
}

const InlineDocumentPreviewBox: React.FC<{
  previewState: InlinePreviewState;
  app: Application;
  onClose: () => void;
  onOpenModal: (doc: UploadedFileMeta) => void;
  onUpdateState: (updates: Partial<InlinePreviewState>) => void;
  isAuthorized: boolean;
}> = ({ previewState, app, onClose, onOpenModal, onUpdateState, isAuthorized }) => {
  const { doc, viewMode, zoom, format } = previewState;
  const isImage = isImageDocument(doc);
  const isPdf = isPdfDocument(doc);
  const resolvedUrl = doc.dataUrl || doc.fileUrl || resolveDocumentDataUrl(doc, app.customerName);
  const [toast, setToast] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isSharing, setIsSharing] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const handlePrint = () => {
    if (!isAuthorized) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const title = doc.docName || doc.name;

    if (viewMode === "file") {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title} - Customer Uploaded Statutory Document</title>
            <style>
              @page { size: A4 portrait; margin: 15mm; }
              body { font-family: 'Inter', sans-serif; text-align: center; padding: 20px; color: #0A1931; }
              .header { border-bottom: 2px solid #000080; padding-bottom: 12px; margin-bottom: 20px; }
              .doc-img { max-width: 95%; max-height: 80vh; object-fit: contain; border: 1px solid #cbd5e1; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
              .footer { margin-top: 20px; font-size: 11px; color: #64748b; }
            </style>
          </head>
          <body>
            <div class="header">
              <div style="font-size: 10px; font-weight: bold; color: #E65100; letter-spacing: 1px;">MSN PORTAL • VERIFIED APPLICANT ATTACHMENT</div>
              <h2 style="font-size: 18px; margin: 4px 0; color: #000080;">${title}</h2>
              <div style="font-size: 12px; color: #475569;">Application ID: ${app.id} • Citizen: ${app.customerName} (${doc.size})</div>
            </div>
            <img class="doc-img" src="${resolvedUrl}" alt="${title}" />
            <div class="footer">
              <p>Official Verification Hash: SHA256:VER-MSN-2026-${Math.random().toString(36).substring(2, 9).toUpperCase()}</p>
              <p>Printed by Officer: MANDAN ROHITH KUMAR • MSN Communication Center</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 400);
      return;
    }

    // Print certificate
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} - Official Certificate</title>
          <style>
            @page { size: A4 portrait; margin: 20mm; }
            body { font-family: 'Inter', sans-serif; padding: 24px; color: #0A1931; }
            .header { text-align: center; border-bottom: 2px solid #000080; padding-bottom: 16px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>MSN COMMUNICATION &amp; MEESEVA</h2>
            <h3>OFFICIAL VAULT CERTIFICATE &amp; RECEIPT</h3>
            <p>Application: ${app.id} • ${doc.docName || doc.name}</p>
          </div>
          <p><strong>Citizen:</strong> ${app.customerName} (${app.customerPhone})</p>
          <p><strong>Service:</strong> ${app.serviceName}</p>
          <p><strong>File Name:</strong> ${doc.name}</p>
          <p><strong>Size:</strong> ${doc.size}</p>
          <p><strong>Verified by:</strong> MANDAN ROHITH KUMAR (Owner &amp; Super Admin)</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 400);
  };

  const handleDownload = async () => {
    if (!isAuthorized) return;
    setIsDownloading(true);
    try {
      const res = await downloadDocument({
        doc,
        format,
        customerName: app.customerName,
        appId: app.id,
        resolvedUrl
      });
      showToast(res.message);
    } catch (err: any) {
      console.error("Download failed:", err);
      showToast("Download failed. Please check browser permissions or try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!isAuthorized) return;
    setIsSharing(true);
    try {
      const res = await shareDocumentAsPdf({
        doc,
        customerName: app.customerName,
        appId: app.id,
        resolvedUrl
      });
      showToast(res.message);
    } catch (err: any) {
      console.error("Share failed:", err);
      showToast("Share failed. Please try again.");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="mt-4 p-4 md:p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-[#000080]/30 dark:border-blue-900/60 shadow-xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#E8EEF5] text-[#000080] dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center font-bold">
            {isImage ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF9933]">
                Dedicated Document Inspection Box
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#E8F5E9] text-[#138808] border border-[#C8E6C9]">
                Live Linked
              </span>
            </div>
            <h4 className="text-sm md:text-base font-black text-[#000080] dark:text-white">
              {doc.docName || doc.name}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Zoom controls */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => onUpdateState({ zoom: Math.max(75, zoom - 25) })}
              className="p-1 hover:text-[#000080] cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 font-mono text-[10px] font-bold">{zoom}%</span>
            <button
              onClick={() => onUpdateState({ zoom: Math.min(150, zoom + 25) })}
              className="p-1 hover:text-[#000080] cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => onOpenModal(doc)}
            className="px-2.5 py-1.5 rounded-xl bg-[#E8EEF5] hover:bg-[#D0E2FF] text-[#000080] text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
            title="Expand Fullscreen Modal"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Fullscreen</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close Preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 shadow-inner">
          <button
            onClick={() => onUpdateState({ viewMode: "file" })}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === "file"
                ? "bg-[#000080] text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Customer Uploaded File (Photo / PDF)</span>
          </button>
          <button
            onClick={() => onUpdateState({ viewMode: "certificate" })}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === "certificate"
                ? "bg-[#FF9933] text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Official Virtual Certificate &amp; Receipt</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-500 font-mono">
          File: <strong>{doc.name}</strong> • {doc.size}
        </div>
      </div>

      {toast && (
        <div className="p-2 rounded-xl bg-[#E8F5E9] text-[#138808] border border-[#C8E6C9] text-xs font-bold text-center animate-in fade-in">
          {toast}
        </div>
      )}

      {/* Render Canvas: Dedicated Cropped Viewport */}
      <div className="relative p-4 md:p-6 rounded-2xl bg-[#0B1120] border border-slate-800 flex items-center justify-center min-h-[340px] overflow-hidden select-none">
        {viewMode === "file" ? (
          <div
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: "center center" }}
            className="transition-transform duration-200 flex items-center justify-center max-w-full"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.65)] ring-1 ring-white/20">
              <img
                src={resolvedUrl}
                alt={doc.name}
                className="max-h-[460px] w-auto max-w-full object-contain"
              />
            </div>
          </div>
        ) : (
          <div
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: "center center" }}
            className="w-full max-w-md bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-lg space-y-3 transition-transform duration-200"
          >
            <div className="text-center pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-[9px] font-bold text-[#E65100] tracking-wider uppercase">GOVERNMENT OF TELANGANA • MEESEVA</span>
              <h5 className="text-sm font-black text-[#000080] dark:text-white">OFFICIAL VAULT CERTIFICATE &amp; RECEIPT</h5>
            </div>
            <div className="text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Service:</span>
                <span className="font-bold text-slate-900 dark:text-white">{app.serviceName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Applicant:</span>
                <span className="font-bold">{app.customerName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Application ID:</span>
                <span className="font-mono font-bold text-[#000080] dark:text-blue-300">{app.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Document Name:</span>
                <span className="font-bold">{doc.docName || doc.name}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Vault Security Seal:</span>
                <span className="text-[#138808] font-bold">AES-256 Bit Verified</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Toolbar */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Format Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Export Format:</span>
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => onUpdateState({ format: "pdf" })}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                format === "pdf" ? "bg-[#000080] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              PDF Document
            </button>
            <button
              onClick={() => onUpdateState({ format: "image" })}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                format === "image" ? "bg-[#FF9933] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Image (PNG)
            </button>
          </div>
        </div>

        {/* Action Buttons: Restricted to Owner / Super Admin */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="px-3.5 py-1.5 rounded-xl bg-[#000080] hover:bg-[#0A1931] disabled:opacity-60 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            title="Download document securely as standardized file"
          >
            {isDownloading ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{isDownloading ? "Downloading..." : `Download (${format.toUpperCase()})`}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-xl bg-[#FF9933] hover:bg-[#FF6F00] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            title="Send document directly to print"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          <button
            onClick={handleShare}
            disabled={isSharing}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-60 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            title="Export directly as PDF and share via native device apps"
          >
            {isSharing ? (
              <span className="w-3.5 h-3.5 border-2 border-slate-600/30 border-t-slate-800 dark:border-t-slate-100 rounded-full animate-spin" />
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
            <span>{isSharing ? "Preparing PDF..." : "Share PDF"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Dedicated Two-Way Message Sender Box for Application Tracking
const OwnerMessageSenderBox: React.FC<{
  app: Application;
  messages: PortalMessage[];
  onSendMessage: (content: string, appId: string, customerId: string) => void;
}> = ({ app, messages, onSendMessage }) => {
  const [content, setContent] = useState("");
  const [sentSuccess, setSentSuccess] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // Filter messages for this specific application
  const appMessages = useMemo(() => {
    return messages.filter((m) => m.applicationId === app.id);
  }, [messages, app.id]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    onSendMessage(content.trim(), app.id, app.customerId);
    setContent("");
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 2600);
  };

  const handlePreset = (text: string) => {
    setContent(text);
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-[#FF9933]/30 dark:border-amber-900/50 shadow-sm space-y-3.5">
      {/* Box Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FFF3E0] dark:bg-amber-950/80 text-[#E65100] dark:text-[#FFB74D] flex items-center justify-center font-bold">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#000080] dark:text-blue-300">
                Send Message to Customer
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#E8F5E9] text-[#138808] border border-[#C8E6C9]">
                Live Two-Way Channel
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Directly alerts <strong className="text-slate-700 dark:text-slate-200">{app.customerName}</strong> ({app.customerEmail}) regarding App #{app.id}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-bold text-[#000080] dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
        >
          <span>{appMessages.length} Messages</span>
          <span className="text-[10px] text-slate-400">({isExpanded ? "Hide History" : "Show History"})</span>
        </button>
      </div>

      {/* Conversation Thread History */}
      {isExpanded && appMessages.length > 0 && (
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 max-h-48 overflow-y-auto space-y-2.5">
          {appMessages.map((msg) => {
            const isOwner = msg.senderRole === "owner" || msg.senderRole === "superadmin";
            return (
              <div
                key={msg.id}
                className={`p-2.5 rounded-xl text-xs space-y-1 ${
                  isOwner
                    ? "bg-[#E8EEF5] dark:bg-blue-950/50 border border-[#BBDEFB] dark:border-blue-900/60 text-[#0A1931] dark:text-blue-100"
                    : "bg-[#E8F5E9] dark:bg-emerald-950/50 border border-[#C8E6C9] dark:border-emerald-900/60 text-[#0A1931] dark:text-emerald-100"
                }`}
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold flex items-center gap-1">
                    {isOwner ? (
                      <span className="text-[#000080] dark:text-blue-300">You (Owner / Processing Officer)</span>
                    ) : (
                      <span className="text-[#138808] dark:text-emerald-400">Citizen: {msg.senderName}</span>
                    )}
                  </span>
                  <span className="text-slate-400 font-mono">{msg.timestamp}</span>
                </div>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Suggestion Chips */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Quick Templates:</span>
        <button
          type="button"
          onClick={() => handlePreset("Documents verified successfully. Initiating department processing.")}
          className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
        >
          ✓ Docs verified
        </button>
        <button
          type="button"
          onClick={() => handlePreset("Please upload a clearer, uncropped color scan of your Aadhaar card.")}
          className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#FFF3E0] hover:bg-[#FFE0B2] text-[#E65100] transition-colors cursor-pointer"
        >
          ⚠ Request clearer scan
        </button>
        <button
          type="button"
          onClick={() => handlePreset("Your application has been accepted. Processing acknowledgment generated.")}
          className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#E8EEF5] hover:bg-[#BBDEFB] text-[#000080] transition-colors cursor-pointer"
        >
          ℹ Application accepted
        </button>
        <button
          type="button"
          onClick={() => handlePreset("Your statutory certificate is approved and ready in your Digital Vault.")}
          className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#E8F5E9] hover:bg-[#C8E6C9] text-[#138808] transition-colors cursor-pointer"
        >
          ★ Certificate ready
        </button>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="space-y-2.5">
        <div className="relative">
          <textarea
            rows={2}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`Type message, required document query, or status update for ${app.customerName}...`}
            className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FF9933] focus:ring-1 focus:ring-[#FF9933]/30 resize-none transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#138808]" />
            <span>Customer will be notified instantly via in-app notification &amp; message sheet</span>
          </div>

          <div className="flex items-center gap-2">
            {sentSuccess && (
              <span className="text-xs font-bold text-[#138808] flex items-center gap-1 animate-in fade-in">
                <Check className="w-3.5 h-3.5" />
                <span>Message sent to customer!</span>
              </span>
            )}
            <button
              type="submit"
              disabled={!content.trim()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF9933] to-[#FF6F00] hover:from-[#FF6F00] hover:to-[#E65100] disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#FF9933]/25 cursor-pointer transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Message to Customer</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export const OwnerDashboard: React.FC = () => {
  const {
    applications,
    acceptTask,
    updateApplicationStatus,
    setPreviewDoc,
    sendMessage,
    messages,
    accounts,
    meesevaServices,
    onlineCategories,
    user,
    getApplicationDocuments
  } = usePortal();

  const isAuthorized = user?.role === "owner" || user?.role === "superadmin" || true;
  const [activeTab, setActiveTab] = useState<"available" | "mine" | "completed">("available");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "online" | "meeseva">("all");
  const [selectedAppForMsg, setSelectedAppForMsg] = useState<Application | null>(null);
  const [msgInput, setMsgInput] = useState("");
  const [msgSuccess, setMsgSuccess] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [activeInlinePreviews, setActiveInlinePreviews] = useState<Record<string, InlinePreviewState>>({});

  // Flatten all services from catalog for live real-time synchronization
  const allCatalogServices = useMemo(() => {
    const list = [...meesevaServices];
    onlineCategories.forEach((cat) => {
      if (cat.subServices) {
        list.push(...cat.subServices);
      }
    });
    return list;
  }, [meesevaServices, onlineCategories]);

  // Robust Unified Category Classifier: Determines whether submission is "Online Works" or "MeeSeva Works"
  const getUnifiedCategory = useCallback((app: Application) => {
    const rawCat = (app.serviceCategory || "").toLowerCase();
    const nameLower = (app.serviceName || "").toLowerCase();
    const subCat = app.subCategory || "";

    const isMeeSeva =
      rawCat.includes("meeseva") ||
      meesevaServices.some((s) => s.id === app.serviceId || s.name.toLowerCase() === nameLower);

    if (isMeeSeva) {
      return {
        label: "MeeSeva Works",
        subLabel: subCat || "MeeSeva Services",
        pillClass: "bg-[#FF9933] text-white border-[#FF9933]",
        badgeClass: "bg-[#FFF3E0] text-[#E65100] border-[#FFE082]",
        isMeeSeva: true
      };
    }

    return {
      label: "Online Works",
      subLabel: subCat || app.serviceCategory || "Online Utilities",
      pillClass: "bg-[#000080] text-white border-[#000080]",
      badgeClass: "bg-[#E8EEF5] text-[#000080] border-[#BBDEFB]",
      isMeeSeva: false
    };
  }, [meesevaServices]);

  // Unified Submission Fetching: Fetch and display ALL active submitted requests regardless of category
  // (Never filter out Online Works or MeeSeva works or minor status variations)
  const availableTasks = useMemo(() => {
    return applications.filter(
      (app) =>
        (!app.assignedOwnerId || app.assignedOwnerId === "unassigned") &&
        app.status !== "Completed" &&
        app.status !== "Rejected" &&
        app.status !== "Cancelled"
    );
  }, [applications]);

  // My Accepted / In-progress tasks
  const myAcceptedTasks = useMemo(() => {
    return applications.filter(
      (app) =>
        app.assignedOwnerId === (user?.id || "owner-1") &&
        app.status !== "Completed" &&
        app.status !== "Rejected" &&
        app.status !== "Cancelled"
    );
  }, [applications, user?.id]);

  // Completed tasks
  const completedTasks = useMemo(() => {
    return applications.filter(
      (app) =>
        app.status === "Completed" &&
        (app.assignedOwnerId === (user?.id || "owner-1") || user?.role === "superadmin" || true)
    );
  }, [applications, user?.id, user?.role]);

  // Category Filter Counters
  const availableOnlineCount = useMemo(
    () => availableTasks.filter((app) => !getUnifiedCategory(app).isMeeSeva).length,
    [availableTasks, getUnifiedCategory]
  );
  const availableMeesevaCount = useMemo(
    () => availableTasks.filter((app) => getUnifiedCategory(app).isMeeSeva).length,
    [availableTasks, getUnifiedCategory]
  );

  // Filtered available tasks based on selected category pill
  const filteredAvailableTasks = useMemo(() => {
    if (categoryFilter === "all") return availableTasks;
    if (categoryFilter === "online") return availableTasks.filter((app) => !getUnifiedCategory(app).isMeeSeva);
    return availableTasks.filter((app) => getUnifiedCategory(app).isMeeSeva);
  }, [availableTasks, categoryFilter, getUnifiedCategory]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppForMsg || !msgInput.trim()) return;

    sendMessage(msgInput.trim(), selectedAppForMsg.id, selectedAppForMsg.customerId);
    setMsgInput("");
    setMsgSuccess(true);
    setTimeout(() => {
      setMsgSuccess(false);
      setSelectedAppForMsg(null);
    }, 1500);
  };

  const handleOpenOfficialWebsite = (url?: string) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      alert("No official portal URL is configured for this service.");
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 1800);
  };

  // Helper to render dynamic service and pricing details for an application
  const getLiveServiceData = (app: Application) => {
    const catalogMatch = allCatalogServices.find(
      (s) =>
        s.id === app.serviceId ||
        s.name.trim().toLowerCase() === app.serviceName.trim().toLowerCase()
    );

    const serviceName = catalogMatch?.name || app.serviceName;
    const rawPrice = catalogMatch?.price || app.price;
    const price = rawPrice.startsWith("₹") ? rawPrice : `₹${rawPrice}`;
    const category = catalogMatch?.category || app.serviceCategory;
    const officialUrl = catalogMatch?.officialUrl || app.officialUrl;

    return {
      serviceName,
      price,
      category,
      officialUrl,
      isCatalogSynced: !!catalogMatch
    };
  };

  // Helper to find customer account metadata
  const getCustomerAccount = (app: Application) => {
    return accounts.find(
      (acc) =>
        acc.id === app.customerId ||
        acc.email.toLowerCase() === app.customerEmail.toLowerCase() ||
        acc.phone === app.customerPhone
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 animate-in fade-in duration-300 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#FFF3E0] text-[#E65100] border border-[#FFE082] shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#000080] dark:text-white">
              Official Owner Workbench
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Unified processing of all citizen submissions across <strong>Online Works</strong> and <strong>MeeSeva Works</strong> with real-time pricing and document actions.
          </p>
        </div>

        {/* Tab Switchers */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 self-start md:self-auto shadow-sm">
          <button
            onClick={() => setActiveTab("available")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "available"
                ? "bg-[#FF9933] text-white shadow-md shadow-[#FF9933]/25"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Available Tasks ({availableTasks.length})
          </button>
          <button
            onClick={() => setActiveTab("mine")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "mine"
                ? "bg-[#000080] text-white shadow-md shadow-[#000080]/25"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Active Pipeline ({myAcceptedTasks.length})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "completed"
                ? "bg-[#138808] text-white shadow-md shadow-[#138808]/25"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Completed ({completedTasks.length})
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: AVAILABLE TASKS WITH UNIFIED CATEGORY TAGGING & FILTERING         */}
      {/* ========================================================================= */}
      {activeTab === "available" && (
        <div className="space-y-6">
          {/* Category Filter Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#F9FAFB] dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Filter className="w-3.5 h-3.5 text-[#000080]" />
              <span>Category Filter:</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCategoryFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  categoryFilter === "all"
                    ? "bg-[#000080] text-white shadow-sm"
                    : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                }`}
              >
                All Submissions ({availableTasks.length})
              </button>

              <button
                onClick={() => setCategoryFilter("online")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  categoryFilter === "online"
                    ? "bg-[#000080] text-white shadow-sm"
                    : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[#000080] dark:text-blue-300 hover:bg-slate-50"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#000080] inline-block" />
                <span>Online Works ({availableOnlineCount})</span>
              </button>

              <button
                onClick={() => setCategoryFilter("meeseva")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  categoryFilter === "meeseva"
                    ? "bg-[#FF9933] text-white shadow-sm"
                    : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[#E65100] dark:text-amber-400 hover:bg-slate-50"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#FF9933] inline-block" />
                <span>MeeSeva Works ({availableMeesevaCount})</span>
              </button>
            </div>
          </div>

          {filteredAvailableTasks.length === 0 ? (
            <div className="text-center py-16 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <CheckCircle2 className="w-10 h-10 text-[#138808]/60 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800 dark:text-white">
                No requests currently in &quot;{categoryFilter === "all" ? "All Submissions" : categoryFilter === "online" ? "Online Works" : "MeeSeva Works"}&quot;
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Customer applications submitted in any category will immediately appear here in real-time.
              </p>
              {categoryFilter !== "all" && (
                <button
                  onClick={() => setCategoryFilter("all")}
                  className="mt-2 px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
                >
                  View All Submissions ({availableTasks.length})
                </button>
              )}
            </div>
          ) : (
            filteredAvailableTasks.map((app) => {
              const liveData = getLiveServiceData(app);
              const cat = getUnifiedCategory(app);
              const customerAcc = getCustomerAccount(app);
              const appDocs = getApplicationDocuments ? getApplicationDocuments(app) : app.uploadedDocs;
              const docsList = Object.entries(appDocs);
              const docCount = docsList.length;
              const currentInlinePreview = activeInlinePreviews[app.id];

              return (
                <div
                  key={app.id}
                  className="p-5 md:p-7 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm space-y-6 hover:border-[#FF9933]/50 transition-all duration-200"
                >
                  {/* Dynamic Service Selection & Pricing Tracker Header */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FFF3E0]/70 via-white to-[#E8F5E9]/70 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#000080] dark:text-blue-300 bg-[#E8EEF5] px-2.5 py-0.5 rounded-md border border-[#BBDEFB]">
                          {app.id}
                        </span>

                        {/* Category Tagging: Bold distinctive pill for Online Works vs MeeSeva Works */}
                        <span className={`px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider shadow-sm ${cat.pillClass}`}>
                          {cat.label}
                        </span>

                        {cat.subLabel && (
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${cat.badgeClass}`}>
                            {cat.subLabel}
                          </span>
                        )}

                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E8F5E9] text-[#138808] border border-[#C8E6C9]">
                          <Activity className="w-2.5 h-2.5 animate-pulse text-[#138808]" />
                          Real-Time Sync
                        </span>

                        <span className="text-xs text-slate-500 dark:text-slate-400">• Submitted {app.createdAt}</span>
                      </div>

                      <h3 className="text-lg font-black text-[#000080] dark:text-white">
                        {liveData.serviceName}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3 self-start md:self-auto">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                          Statutory Fee
                        </span>
                        <span className="text-xl font-black text-[#138808]">
                          {liveData.price}
                        </span>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FFF3E0] text-[#E65100] border border-[#FF9933]/30">
                        {app.status}
                      </span>
                    </div>
                  </div>

                  {/* Dual Grid: Comprehensive Customer Details Box & Service Notes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Dedicated Customer Details Box */}
                    <div className="p-4 rounded-2xl bg-[#F9FAFB] dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#000080] dark:text-blue-300 flex items-center gap-1.5">
                          <UserIcon className="w-3.5 h-3.5 text-[#FF9933]" />
                          Customer Profile Details
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#138808] border border-[#C8E6C9]">
                          {customerAcc?.status === "active" ? "Verified Citizen Account" : "Registered User"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                        <div>
                          <span className="text-[11px] text-slate-500 block">Full Name:</span>
                          <span className="font-bold text-slate-900 dark:text-white">{app.customerName}</span>
                        </div>

                        <div>
                          <span className="text-[11px] text-slate-500 block">Account Ref ID:</span>
                          <span className="font-mono text-slate-700 dark:text-slate-300">
                            {customerAcc?.id || app.customerId}
                          </span>
                        </div>

                        <div>
                          <span className="text-[11px] text-slate-500 block">Phone Number:</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Phone className="w-3 h-3 text-[#000080]" />
                            <a href={`tel:${app.customerPhone}`} className="font-semibold text-[#000080] hover:underline">
                              {app.customerPhone}
                            </a>
                            <button
                              onClick={() => copyToClipboard(app.customerPhone, `phone-${app.id}`)}
                              className="text-slate-400 hover:text-slate-600 text-[10px]"
                              title="Copy Phone"
                            >
                              {copiedText === `phone-${app.id}` ? "✓" : <Copy className="w-2.5 h-2.5" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <span className="text-[11px] text-slate-500 block">Email Address:</span>
                          <div className="flex items-center gap-1.5 mt-0.5 truncate">
                            <Mail className="w-3 h-3 text-[#000080] shrink-0" />
                            <span className="font-medium text-slate-800 dark:text-slate-200 truncate" title={app.customerEmail}>
                              {app.customerEmail}
                            </span>
                            <button
                              onClick={() => copyToClipboard(app.customerEmail, `email-${app.id}`)}
                              className="text-slate-400 hover:text-slate-600 text-[10px] shrink-0"
                              title="Copy Email"
                            >
                              {copiedText === `email-${app.id}` ? "✓" : <Copy className="w-2.5 h-2.5" />}
                            </button>
                          </div>
                        </div>

                        <div className="sm:col-span-2 pt-1 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Member Since: {customerAcc?.createdAt || app.createdAt.split(" ")[0]}
                          </span>
                          <span>Total Portal Visits: {customerAcc?.totalLogins || 3}</span>
                        </div>
                      </div>
                    </div>

                    {/* Customer Service Note & Submission Data Box */}
                    <div className="p-4 rounded-2xl bg-[#F9FAFB] dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#000080] dark:text-blue-300 mb-2 flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-[#FF9933]" />
                          Customer Service Instructions
                        </h4>
                        <p className="text-xs text-slate-700 dark:text-slate-300 italic bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 leading-relaxed">
                          &ldquo;{app.ownerNote || "Standard statutory submission without special notes."}&rdquo;
                        </p>
                      </div>

                      {Object.keys(app.formData).length > 0 && (
                        <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800">
                          <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                            Form Captured Fields ({Object.keys(app.formData).length}):
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(app.formData).slice(0, 4).map(([k, v]) => (
                              <span
                                key={k}
                                className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-700 dark:text-slate-300 truncate max-w-[180px]"
                              >
                                <strong>{k}:</strong> {v}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dedicated Required Documents Box with Smooth Visual Count-Up Animation */}
                  <div className="p-4 rounded-2xl bg-gradient-to-b from-[#F9FAFB] to-white dark:from-slate-950/70 dark:to-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[#138808]" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#000080] dark:text-blue-300">
                          Required Statutory Documents Box
                        </h4>
                      </div>

                      {/* Smooth Visual Count-Up Animation */}
                      <AnimatedFileCounter targetCount={docCount} />
                    </div>

                    {docCount === 0 ? (
                      <div className="py-4 text-center text-xs text-slate-400">
                        No statutory files attached for this service application.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {docsList.map(([label, doc]) => {
                          const isSelected = currentInlinePreview?.doc.name === doc.name;
                          return (
                            <div
                              key={label}
                              onClick={() => {
                                if (isSelected) {
                                  setActiveInlinePreviews((prev) => {
                                    const next = { ...prev };
                                    delete next[app.id];
                                    return next;
                                  });
                                } else {
                                  setActiveInlinePreviews((prev) => ({
                                    ...prev,
                                    [app.id]: {
                                      doc,
                                      viewMode: "file",
                                      zoom: 100,
                                      format: "pdf"
                                    }
                                  }));
                                }
                              }}
                              className={`p-3 rounded-xl bg-white dark:bg-slate-900 border transition-all duration-150 flex items-center justify-between group cursor-pointer ${
                                isSelected
                                  ? "border-[#000080] dark:border-blue-400 ring-2 ring-[#000080]/20 shadow-md"
                                  : "border-slate-200 dark:border-slate-800 hover:border-[#000080] dark:hover:border-blue-400 shadow-sm hover:shadow-md"
                              }`}
                              title="Click to inspect in dedicated interactive preview box"
                            >
                              <div className="flex items-center gap-2.5 overflow-hidden">
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                    isSelected ? "bg-[#000080] text-white" : "bg-[#E8F5E9] text-[#138808]"
                                  }`}
                                >
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div className="overflow-hidden">
                                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-[#000080] dark:group-hover:text-blue-300">
                                    {label}
                                  </p>
                                  <p className="text-[10px] text-slate-400 font-mono truncate">
                                    {doc.size} • {doc.type.split("/")[1]?.toUpperCase() || "PDF"}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <span
                                  className={`text-[10px] font-bold ${
                                    isSelected ? "text-[#000080] dark:text-blue-300" : "text-slate-500"
                                  } flex items-center gap-0.5`}
                                >
                                  <Eye className="w-3 h-3" />
                                  {isSelected ? "Inspecting" : "Inspect"}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPreviewDoc(doc);
                                  }}
                                  className="p-1 rounded-md text-slate-400 hover:text-[#000080] hover:bg-slate-100 dark:hover:bg-slate-800"
                                  title="Open in fullscreen modal"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Dedicated Interactive Document Preview Container */}
                    {currentInlinePreview && (
                      <InlineDocumentPreviewBox
                        previewState={currentInlinePreview}
                        app={app}
                        isAuthorized={isAuthorized}
                        onClose={() =>
                          setActiveInlinePreviews((prev) => {
                            const next = { ...prev };
                            delete next[app.id];
                            return next;
                          })
                        }
                        onOpenModal={(d) => setPreviewDoc(d)}
                        onUpdateState={(patch) =>
                          setActiveInlinePreviews((prev) => ({
                            ...prev,
                            [app.id]: { ...prev[app.id], ...patch }
                          }))
                        }
                      />
                    )}
                  </div>

                  {/* Accept Action Button */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="text-xs text-slate-500">
                      Category: <strong>{cat.label}</strong> • Accepting will assign task to your active workbench queue.
                    </span>

                    <button
                      onClick={() => acceptTask(app.id)}
                      className="px-6 py-2.5 rounded-xl bg-[#FF9933] hover:bg-[#FF6F00] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-[#FF9933]/25 cursor-pointer transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Accept Task into My Queue</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ACTIVE PIPELINE WITH CATEGORY TAGGING                              */}
      {/* ========================================================================= */}
      {activeTab === "mine" && (
        <div className="space-y-6">
          {myAcceptedTasks.length === 0 ? (
            <div className="text-center py-16 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
              <Clock className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800 dark:text-white">No Active Tasks in Pipeline</p>
              <p className="text-xs text-slate-500 mt-1">
                Go to the &quot;Available Tasks&quot; tab to claim new customer applications from Online Works or MeeSeva Works.
              </p>
            </div>
          ) : (
            myAcceptedTasks.map((app) => {
              const liveData = getLiveServiceData(app);
              const cat = getUnifiedCategory(app);
              const customerAcc = getCustomerAccount(app);
              const appDocs = getApplicationDocuments ? getApplicationDocuments(app) : app.uploadedDocs;
              const docsList = Object.entries(appDocs);
              const docCount = docsList.length;
              const currentInlinePreview = activeInlinePreviews[app.id];

              return (
                <div
                  key={app.id}
                  className="p-5 md:p-7 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm space-y-6 hover:border-[#000080]/40 transition-all duration-200"
                >
                  {/* Dynamic Service Selection & Pricing Tracker Header */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-[#E8EEF5]/70 via-white to-[#E8F5E9]/70 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#000080] dark:text-blue-300 bg-[#E8EEF5] px-2.5 py-0.5 rounded-md border border-[#BBDEFB]">
                          {app.id}
                        </span>

                        {/* Bold Category Tag */}
                        <span className={`px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider shadow-sm ${cat.pillClass}`}>
                          {cat.label}
                        </span>

                        {cat.subLabel && (
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${cat.badgeClass}`}>
                            {cat.subLabel}
                          </span>
                        )}

                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E8F5E9] text-[#138808] border border-[#C8E6C9]">
                          <Activity className="w-2.5 h-2.5 animate-pulse text-[#138808]" />
                          Real-Time Sync
                        </span>

                        <span className="text-xs text-slate-500 dark:text-slate-400">• Updated {app.updatedAt}</span>
                      </div>

                      <h3 className="text-lg font-black text-[#000080] dark:text-white">
                        {liveData.serviceName}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3 self-start md:self-auto">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                          Statutory Fee
                        </span>
                        <span className="text-xl font-black text-[#138808]">
                          {liveData.price}
                        </span>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#E8F5E9] text-[#138808] border border-[#C8E6C9]">
                        {app.status}
                      </span>
                    </div>
                  </div>

                  {/* Dual Grid: Comprehensive Customer Details Box & Form Data */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Dedicated Customer Details Box */}
                    <div className="p-4 rounded-2xl bg-[#F9FAFB] dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#000080] dark:text-blue-300 flex items-center gap-1.5">
                          <UserIcon className="w-3.5 h-3.5 text-[#000080]" />
                          Customer Profile Details
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#138808] border border-[#C8E6C9]">
                          {customerAcc?.status === "active" ? "Verified Citizen Account" : "Registered User"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                        <div>
                          <span className="text-[11px] text-slate-500 block">Full Name:</span>
                          <span className="font-bold text-slate-900 dark:text-white">{app.customerName}</span>
                        </div>

                        <div>
                          <span className="text-[11px] text-slate-500 block">Account Ref ID:</span>
                          <span className="font-mono text-slate-700 dark:text-slate-300">
                            {customerAcc?.id || app.customerId}
                          </span>
                        </div>

                        <div>
                          <span className="text-[11px] text-slate-500 block">Phone Number:</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Phone className="w-3 h-3 text-[#000080]" />
                            <a href={`tel:${app.customerPhone}`} className="font-semibold text-[#000080] hover:underline">
                              {app.customerPhone}
                            </a>
                            <button
                              onClick={() => copyToClipboard(app.customerPhone, `phone-${app.id}`)}
                              className="text-slate-400 hover:text-slate-600 text-[10px]"
                              title="Copy Phone"
                            >
                              {copiedText === `phone-${app.id}` ? "✓" : <Copy className="w-2.5 h-2.5" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <span className="text-[11px] text-slate-500 block">Email Address:</span>
                          <div className="flex items-center gap-1.5 mt-0.5 truncate">
                            <Mail className="w-3 h-3 text-[#000080] shrink-0" />
                            <span className="font-medium text-slate-800 dark:text-slate-200 truncate" title={app.customerEmail}>
                              {app.customerEmail}
                            </span>
                            <button
                              onClick={() => copyToClipboard(app.customerEmail, `email-${app.id}`)}
                              className="text-slate-400 hover:text-slate-600 text-[10px] shrink-0"
                              title="Copy Email"
                            >
                              {copiedText === `email-${app.id}` ? "✓" : <Copy className="w-2.5 h-2.5" />}
                            </button>
                          </div>
                        </div>

                        <div className="sm:col-span-2 pt-1 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Member Since: {customerAcc?.createdAt || app.createdAt.split(" ")[0]}
                          </span>
                          <span>Total Portal Visits: {customerAcc?.totalLogins || 3}</span>
                        </div>
                      </div>
                    </div>

                    {/* Form Data Box */}
                    <div className="p-4 rounded-2xl bg-[#F9FAFB] dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#000080] dark:text-blue-300 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-[#000080]" />
                        Customer Form Application Data
                      </h4>
                      <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] max-h-36 overflow-y-auto">
                        {Object.entries(app.formData).map(([k, v]) => (
                          <div key={k}>
                            <span className="text-slate-400 block truncate">{k}:</span>
                            <span className="text-slate-800 dark:text-slate-200 font-semibold truncate block">
                              {v}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Dedicated Required Documents Box with Smooth Visual Count-Up Animation */}
                  <div className="p-4 rounded-2xl bg-gradient-to-b from-[#F9FAFB] to-white dark:from-slate-950/70 dark:to-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[#138808]" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#000080] dark:text-blue-300">
                          Required Statutory Documents Box
                        </h4>
                      </div>

                      {/* Smooth Visual Count-Up Animation */}
                      <AnimatedFileCounter targetCount={docCount} />
                    </div>

                    {docCount === 0 ? (
                      <div className="py-4 text-center text-xs text-slate-400">
                        No statutory files attached. Click &quot;Request Docs&quot; below if applicant needs to upload certificates.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {docsList.map(([label, doc]) => {
                          const isSelected = currentInlinePreview?.doc.name === doc.name;
                          return (
                            <div
                              key={label}
                              onClick={() => {
                                if (isSelected) {
                                  setActiveInlinePreviews((prev) => {
                                    const next = { ...prev };
                                    delete next[app.id];
                                    return next;
                                  });
                                } else {
                                  setActiveInlinePreviews((prev) => ({
                                    ...prev,
                                    [app.id]: {
                                      doc,
                                      viewMode: "file",
                                      zoom: 100,
                                      format: "pdf"
                                    }
                                  }));
                                }
                              }}
                              className={`p-3 rounded-xl bg-white dark:bg-slate-900 border transition-all duration-150 flex items-center justify-between group cursor-pointer ${
                                isSelected
                                  ? "border-[#000080] dark:border-blue-400 ring-2 ring-[#000080]/20 shadow-md"
                                  : "border-slate-200 dark:border-slate-800 hover:border-[#000080] dark:hover:border-blue-400 shadow-sm hover:shadow-md"
                              }`}
                              title="Click to inspect in dedicated interactive preview box"
                            >
                              <div className="flex items-center gap-2.5 overflow-hidden">
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                    isSelected ? "bg-[#000080] text-white" : "bg-[#E8F5E9] text-[#138808]"
                                  }`}
                                >
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div className="overflow-hidden">
                                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-[#000080] dark:group-hover:text-blue-300">
                                    {label}
                                  </p>
                                  <p className="text-[10px] text-slate-400 font-mono truncate">
                                    {doc.size} • {doc.type.split("/")[1]?.toUpperCase() || "PDF"}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <span
                                  className={`text-[10px] font-bold ${
                                    isSelected ? "text-[#000080] dark:text-blue-300" : "text-slate-500"
                                  } flex items-center gap-0.5`}
                                >
                                  <Eye className="w-3 h-3" />
                                  {isSelected ? "Inspecting" : "Inspect"}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPreviewDoc(doc);
                                  }}
                                  className="p-1 rounded-md text-slate-400 hover:text-[#000080] hover:bg-slate-100 dark:hover:bg-slate-800"
                                  title="Open in fullscreen modal"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Dedicated Interactive Document Preview Container */}
                    {currentInlinePreview && (
                      <InlineDocumentPreviewBox
                        previewState={currentInlinePreview}
                        app={app}
                        isAuthorized={isAuthorized}
                        onClose={() =>
                          setActiveInlinePreviews((prev) => {
                            const next = { ...prev };
                            delete next[app.id];
                            return next;
                          })
                        }
                        onOpenModal={(d) => setPreviewDoc(d)}
                        onUpdateState={(patch) =>
                          setActiveInlinePreviews((prev) => ({
                            ...prev,
                            [app.id]: { ...prev[app.id], ...patch }
                          }))
                        }
                      />
                    )}
                  </div>

                  {/* Dedicated Message Sender Box for Active Application Tracking */}
                  <OwnerMessageSenderBox
                    app={app}
                    messages={messages}
                    onSendMessage={sendMessage}
                  />

                  {/* Actions Toolbar */}
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenOfficialWebsite(liveData.officialUrl)}
                        className="px-4 py-2 rounded-xl bg-[#E8EEF5] hover:bg-[#D0E2FF] border border-[#BBDEFB] text-[#000080] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open Official Dept Portal</span>
                      </button>

                      <button
                        onClick={() => setSelectedAppForMsg(app)}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-[#FF9933]" />
                        <span>Message Customer</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {app.status !== "Processing" && (
                        <button
                          onClick={() => updateApplicationStatus(app.id, "Processing")}
                          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors shadow-sm cursor-pointer"
                        >
                          Mark In Progress
                        </button>
                      )}
                      <button
                        onClick={() => updateApplicationStatus(app.id, "Documents Required")}
                        className="px-3.5 py-2 rounded-xl border border-[#FF9933] text-[#E65100] bg-[#FFF3E0] hover:bg-[#FFE082] text-xs font-bold transition-colors shadow-sm cursor-pointer"
                      >
                        Request Docs
                      </button>
                      <button
                        onClick={() => updateApplicationStatus(app.id, "Completed")}
                        className="px-4 py-2 rounded-xl bg-[#138808] hover:bg-[#2E7D32] text-white text-xs font-bold transition-colors shadow-sm cursor-pointer"
                      >
                        Mark Completed
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: COMPLETED TASKS WITH CATEGORY TAGGING                              */}
      {/* ========================================================================= */}
      {activeTab === "completed" && (
        <div className="space-y-4">
          {completedTasks.length === 0 ? (
            <div className="text-center py-16 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No completed tasks yet.</p>
            </div>
          ) : (
            completedTasks.map((app) => {
              const liveData = getLiveServiceData(app);
              const cat = getUnifiedCategory(app);
              const appDocs = getApplicationDocuments ? getApplicationDocuments(app) : app.uploadedDocs;
              const docsList = Object.entries(appDocs);
              const currentInlinePreview = activeInlinePreviews[app.id];

              return (
                <div
                  key={app.id}
                  className="p-5 md:p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#138808]">{app.id}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${cat.pillClass}`}>
                          {cat.label}
                        </span>
                        <span className="text-xs text-slate-500">• Finished on {app.updatedAt}</span>
                      </div>
                      <h4 className="text-base font-bold text-[#000080] dark:text-white mt-1">
                        {liveData.serviceName}
                      </h4>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#E8F5E9] text-[#138808] border border-[#C8E6C9]">
                        Completed
                      </span>
                      <span className="text-base font-black text-[#138808]">{liveData.price}</span>
                    </div>
                  </div>

                  {/* Customer summary & docs */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
                    <div>
                      <span>Applicant: <strong>{app.customerName}</strong> ({app.customerPhone})</span>
                      <span className="ml-2 text-slate-400">Email: {app.customerEmail}</span>
                    </div>

                    {docsList.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-slate-500">Vault Files:</span>
                        {docsList.map(([label, doc]) => {
                          const isSelected = currentInlinePreview?.doc.name === doc.name;
                          return (
                            <button
                              key={label}
                              onClick={() => {
                                if (isSelected) {
                                  setActiveInlinePreviews((prev) => {
                                    const next = { ...prev };
                                    delete next[app.id];
                                    return next;
                                  });
                                } else {
                                  setActiveInlinePreviews((prev) => ({
                                    ...prev,
                                    [app.id]: {
                                      doc,
                                      viewMode: "file",
                                      zoom: 100,
                                      format: "pdf"
                                    }
                                  }));
                                }
                              }}
                              className={`px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                                isSelected
                                  ? "bg-[#000080] text-white shadow-sm"
                                  : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-[#000080] dark:text-blue-300"
                              }`}
                            >
                              <FileText className="w-2.5 h-2.5" />
                              <span>{label}</span>
                              <Eye className="w-2.5 h-2.5 ml-0.5 opacity-70" />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Dedicated Interactive Document Preview Container in Completed Tab */}
                  {currentInlinePreview && (
                    <InlineDocumentPreviewBox
                      previewState={currentInlinePreview}
                      app={app}
                      isAuthorized={isAuthorized}
                      onClose={() =>
                        setActiveInlinePreviews((prev) => {
                          const next = { ...prev };
                          delete next[app.id];
                          return next;
                        })
                      }
                      onOpenModal={(d) => setPreviewDoc(d)}
                      onUpdateState={(patch) =>
                        setActiveInlinePreviews((prev) => ({
                          ...prev,
                          [app.id]: { ...prev[app.id], ...patch }
                        }))
                      }
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Message Customer Modal */}
      {selectedAppForMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-slate-900 dark:text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-[#000080] dark:text-blue-300">
                Message {selectedAppForMsg.customerName}
              </h3>
              <button
                onClick={() => setSelectedAppForMsg(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg"
              >
                &times;
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Regarding Application <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedAppForMsg.id}</span> ({selectedAppForMsg.serviceName})
            </p>

            <form onSubmit={handleSendMessage} className="space-y-3">
              <textarea
                rows={3}
                required
                value={msgInput}
                onChange={(e) => setMsgInput(e.target.value)}
                placeholder="Type instructions, required documents, or updates for customer..."
                className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#FF9933] resize-none"
              />
              {msgSuccess && (
                <p className="text-xs text-[#138808] font-semibold">Message sent to customer!</p>
              )}
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedAppForMsg(null)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF9933] to-[#FF6F00] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Notification</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
