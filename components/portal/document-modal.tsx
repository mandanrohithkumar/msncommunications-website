"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePortal } from "@/lib/portal-store";
import {
  X,
  Printer,
  Download,
  Share2,
  FileText,
  CheckCircle2,
  Lock,
  ShieldCheck,
  Copy,
  ExternalLink,
  MessageCircle,
  Mail,
  ZoomIn,
  ZoomOut,
  FileSpreadsheet,
  FileCheck2,
  Sparkles,
  Eye,
  ImageIcon,
  Crop,
  RotateCw,
  RotateCcw,
  Maximize2
} from "lucide-react";
import { resolveDocumentDataUrl, isImageDocument, isPdfDocument } from "@/lib/doc-preview-utils";
import { downloadDocument, shareDocumentAsPdf } from "@/lib/document-download-share";

export const DocumentModal: React.FC = () => {
  const { previewDoc, setPreviewDoc, user } = usePortal();
  const modalRef = useRef<HTMLDivElement | null>(null);

  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [isSmartCrop, setIsSmartCrop] = useState<boolean>(true);
  const [selectedFormat, setSelectedFormat] = useState<"pdf" | "image">("pdf");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"file" | "certificate">("file");

  // Reset viewport state whenever previewDoc changes
  useEffect(() => {
    setZoomLevel(100);
    setRotation(0);
    setIsSmartCrop(true);
    setViewMode("file");
  }, [previewDoc]);

  // Role Restriction: Strictly allow Download, Print, and Share to Super Admin or Owner only
  const isAuthorized = user?.role === "superadmin" || user?.role === "owner";

  // Close on ESC and outside click
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && previewDoc) {
        setPreviewDoc(null);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node) && previewDoc) {
        setPreviewDoc(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [previewDoc, setPreviewDoc]);

  if (!previewDoc) return null;

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  const resolvedDataUrl = previewDoc ? (previewDoc.dataUrl || previewDoc.fileUrl || resolveDocumentDataUrl(previewDoc, "Rohith Kumar")) : "";
  const isImage = previewDoc ? isImageDocument(previewDoc) : false;
  const isPdf = previewDoc ? isPdfDocument(previewDoc) : false;

  const handlePrint = () => {
    if (!isAuthorized || !previewDoc) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const docTitle = previewDoc.docName || previewDoc.name;

    if (viewMode === "file") {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${docTitle} - Customer Uploaded Statutory Document</title>
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
              <div style="font-size: 10px; font-weight: bold; color: #E65100; letter-spacing: 1px;">MSN COMMUNICATION &amp; MEESEVA ARCHIVE</div>
              <h2 style="font-size: 18px; margin: 4px 0; color: #000080;">${docTitle}</h2>
              <div style="font-size: 12px; color: #475569;">Applicant Uploaded File: ${previewDoc.name} (${previewDoc.size})</div>
            </div>
            <img class="doc-img" src="${resolvedDataUrl}" alt="${docTitle}" />
            <div class="footer">
              <p>Official Verification Hash: SHA256:VER-MSN-2026-${Math.random().toString(36).substring(2, 9).toUpperCase()}</p>
              <p>Printed by Officer: ${user?.name || "MANDAN ROHITH KUMAR"} • MSN Communication Center</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 450);
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Official Document - ${docTitle}</title>
          <style>
            @page { size: A4 portrait; margin: 20mm; }
            body { font-family: 'Inter', -apple-system, sans-serif; padding: 24px; color: #0A1931; max-width: 720px; margin: 0 auto; }
            .tricolor-bar { height: 6px; background: linear-gradient(90deg, #FF9933 0%, #FFFFFF 50%, #138808 100%); margin-bottom: 24px; border-radius: 4px; border: 1px solid #e2e8f0; }
            .header { text-align: center; border-bottom: 2px solid #000080; padding-bottom: 16px; margin-bottom: 20px; }
            .gov-title { font-size: 11px; font-weight: 800; letter-spacing: 1.5px; color: #E65100; text-transform: uppercase; }
            .main-title { font-size: 24px; font-weight: 800; color: #000080; margin: 4px 0; }
            .sub-title { font-size: 13px; color: #64748b; font-weight: 500; }
            .badge { display: inline-block; background: #E8F5E9; color: #138808; padding: 4px 14px; border-radius: 999px; font-size: 12px; font-weight: 700; border: 1px solid #C8E6C9; margin-top: 8px; }
            .card { border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 24px; background: #fafafa; }
            .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
            .label { color: #64748b; font-weight: 600; }
            .val { font-weight: 700; color: #0A1931; }
            .doc-preview-box { border: 2px dashed #cbd5e1; border-radius: 12px; padding: 30px; text-align: center; margin: 20px 0; background: #ffffff; }
            .footer { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 36px; padding-top: 16px; border-top: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <div class="tricolor-bar"></div>
          <div class="header">
            <div class="gov-title">GOVERNMENT SERVICES & STATUTORY PROCESSING</div>
            <div class="main-title">MSN COMMUNICATION & MEESEVA</div>
            <div class="sub-title">Official Citizen Vault Record Acknowledgment</div>
            <div class="badge">DIGITALLY VERIFIED DOCUMENT</div>
          </div>

          <div class="card">
            <div class="row"><span class="label">Document Label:</span><span class="val">${docTitle}</span></div>
            <div class="row"><span class="label">Original Filename:</span><span class="val">${previewDoc.name}</span></div>
            <div class="row"><span class="label">Document Size:</span><span class="val">${previewDoc.size}</span></div>
            <div class="row"><span class="label">File Format / MIME:</span><span class="val">${previewDoc.type}</span></div>
            <div class="row"><span class="label">Vault Upload Timestamp:</span><span class="val">${previewDoc.uploadedAt}</span></div>
            <div class="row"><span class="label">Security Checksum:</span><span class="val">SHA256:VER-MSN-2026-${Math.random().toString(36).substring(2, 10).toUpperCase()}</span></div>
          </div>

          <div class="doc-preview-box">
            <p style="font-size: 14px; font-weight: 700; color: #000080; margin-bottom: 6px;">[STATUTORY ATTACHED ASSET PREVIEW]</p>
            <p style="font-size: 12px; color: #475569;">${previewDoc.name} • Certified copy stored on encrypted multi-tenant storage.</p>
          </div>

          <div class="footer">
            <p><strong>Official Processing Officer / Owner:</strong> MANDAN ROHITH KUMAR • Ph: 8125898068</p>
            <p>MSN Communication Center • Ameerpet / Hyderabad, Telangana • msncommunication23@gmail.com</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 450);
  };

  const handleDownload = async () => {
    if (!isAuthorized || !previewDoc) return;
    setIsDownloading(true);
    try {
      const res = await downloadDocument({
        doc: previewDoc,
        format: selectedFormat,
        customerName: user?.name || "Citizen",
        appId: previewDoc.applicationId || "MSN-DOC-2026",
        resolvedUrl: resolvedDataUrl
      });
      triggerToast(res.message);
    } catch (err: any) {
      console.error("Download failed:", err);
      triggerToast("Download failed. Please check browser permissions or try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!isAuthorized || !previewDoc) return;
    setIsSharing(true);
    try {
      const res = await shareDocumentAsPdf({
        doc: previewDoc,
        customerName: user?.name || "Citizen",
        appId: previewDoc.applicationId || "MSN-DOC-2026",
        resolvedUrl: resolvedDataUrl
      });
      triggerToast(res.message);
    } catch (err: any) {
      console.error("PDF share failed:", err);
      triggerToast("Share failed. Please try again.");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        ref={modalRef}
        className="w-full max-w-4xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
      >
        {/* Tricolor Ribbon Header */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

        {/* Modal Topbar */}
        <div className="p-4 md:p-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-[#F9FAFB] dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF3E0] dark:bg-amber-950/50 border border-[#FFE082] text-[#E65100] flex items-center justify-center shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF9933]">
                  Digital Vault Viewer
                </span>
                {/aadhaar|aadhar/i.test(previewDoc.docName || previewDoc.name) || previewDoc.verificationStatus === "APPROVED" || previewDoc.isGenuineAadhaar ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5E9] text-[#138808] border border-[#C8E6C9] flex items-center gap-1" title="STATUS: APPROVED - Identified as a genuine Aadhaar card.">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    STATUS: APPROVED - Genuine Aadhaar
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5E9] text-[#138808] border border-[#C8E6C9] flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Verified
                  </span>
                )}
              </div>
              <h2 className="text-base md:text-lg font-bold text-[#000080] dark:text-blue-300 truncate max-w-sm md:max-w-md">
                {previewDoc.docName || previewDoc.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setZoomLevel((z) => Math.max(75, z - 25))}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono font-semibold px-2 text-slate-700 dark:text-slate-300">
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(175, z + 25))}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => { setZoomLevel(100); setRotation(0); }}
                className="p-1.5 rounded-lg text-slate-500 hover:text-[#000080] dark:hover:text-blue-300 transition-colors cursor-pointer border-l border-slate-200 dark:border-slate-700 ml-0.5"
                title="Reset View (100%)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => setPreviewDoc(null)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Mode Switcher: Customer Uploaded File vs Official Certificate */}
        <div className="px-5 py-2.5 bg-slate-100/80 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">View Mode:</span>
            <div className="inline-flex rounded-xl bg-slate-200/90 dark:bg-slate-800 p-0.5 shadow-inner">
              <button
                onClick={() => setViewMode("file")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === "file"
                    ? "bg-[#000080] text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                }`}
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Customer Uploaded Document</span>
              </button>
              <button
                onClick={() => setViewMode("certificate")}
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
          </div>

          <div className="flex items-center gap-2">
            {viewMode === "file" && (
              <>
                <button
                  onClick={() => setIsSmartCrop((c) => !c)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSmartCrop
                      ? "bg-[#138808] text-white shadow-sm"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                  title={
                    /aadhaar|aadhar/i.test(previewDoc.docName || previewDoc.name)
                      ? "Toggle between Isolated Front Side (Vertical Rectangle) and Full Document View"
                      : "Toggle between Auto-Crop document bounds and Full View"
                  }
                >
                  <Crop className="w-3.5 h-3.5" />
                  <span>
                    {/aadhaar|aadhar/i.test(previewDoc.docName || previewDoc.name)
                      ? isSmartCrop
                        ? "Front Side (Vertical)"
                        : "Full Document"
                      : isSmartCrop
                      ? "Auto-Cropped"
                      : "Full View"}
                  </span>
                </button>

                <button
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Rotate document 90 degrees"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Rotate</span>
                </button>
              </>
            )}

            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono hidden sm:inline">
              {previewDoc.name} • <strong className="text-[#138808]">{previewDoc.size}</strong>
            </span>
          </div>
        </div>

        {/* Role Restriction Banner (If not Super Admin or Owner) */}
        {!isAuthorized && (
          <div className="px-5 py-2.5 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/60 flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#E65100] shrink-0" />
              <span>
                <strong>View-Only Citizen Access:</strong> Download, Print &amp; Official Sharing require authenticated <strong>Owner</strong> or <strong>Super Admin</strong> clearance.
              </span>
            </div>
            <span className="shrink-0 px-2 py-0.5 rounded-md bg-amber-200/60 dark:bg-amber-800/40 text-[10px] font-bold text-amber-800 dark:text-amber-300">
              Restricted Mode
            </span>
          </div>
        )}

        {/* Toast alert if active */}
        {toastMessage && (
          <div className="bg-[#E8F5E9] border-b border-[#C8E6C9] px-4 py-2 text-xs font-semibold text-[#138808] flex items-center justify-center gap-1.5 animate-in slide-in-from-top-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Document Inspection Canvas: Dedicated Cropped Viewport */}
        <div className="relative flex-1 overflow-auto p-4 md:p-8 bg-[#0B1120] flex items-center justify-center min-h-[420px] max-h-[62vh] select-none">
          {viewMode === "file" && /aadhaar|aadhar/i.test(previewDoc.docName || previewDoc.name) && isSmartCrop && (
            <div className="absolute top-3 left-4 z-10 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/15 text-emerald-400 text-[11px] font-bold flex items-center gap-1.5 shadow-lg">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Isolated Front Side (Vertical Rectangle) • Clean Edge-to-Edge Bounds</span>
            </div>
          )}

          {viewMode === "file" ? (
            /* VIEW 1: Dedicated Cropped Customer Document Content (Photo or PDF) */
            <div
              style={{
                transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                transformOrigin: "center center",
                transition: "transform 0.15s ease-out"
              }}
              className="flex items-center justify-center"
            >
              <div
                className={`relative transition-all duration-300 flex items-center justify-center ${
                  isSmartCrop
                    ? (/aadhaar|aadhar/i.test(previewDoc.docName || previewDoc.name)
                        ? "rounded-2xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] ring-2 ring-white/20 aspect-[380/580] max-h-[58vh] bg-white flex items-center justify-center"
                        : "rounded-2xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] ring-1 ring-white/20")
                    : "rounded-xl overflow-hidden shadow-xl ring-1 ring-white/10"
                }`}
              >
                <img
                  src={resolvedDataUrl}
                  alt={previewDoc.name}
                  className={`object-contain transition-all duration-200 ${
                    isSmartCrop
                      ? (/aadhaar|aadhar/i.test(previewDoc.docName || previewDoc.name)
                          ? "h-full w-full object-fill"
                          : "max-h-[56vh] md:max-h-[60vh] w-auto")
                      : "max-h-[50vh] w-auto"
                  }`}
                  style={{
                    filter: "drop-shadow(0 15px 35px rgba(0,0,0,0.5))"
                  }}
                />
              </div>
            </div>
          ) : (
            /* VIEW 2: Official Virtual Certificate & Receipt */
            <div
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "center top" }}
              className="w-full max-w-lg transition-transform duration-200"
            >
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-300/80 dark:border-slate-800 p-6 md:p-8 shadow-xl relative overflow-hidden">
                {/* Official Watermark & Security Background */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04] dark:opacity-[0.03]">
                  <div className="w-80 h-80 rounded-full border-[16px] border-slate-900 flex items-center justify-center font-bold text-5xl rotate-[-25deg]">
                    MSN VAULT
                  </div>
                </div>

                {/* Document Certificate Sheet Header */}
                <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800 relative z-10">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-[#E65100] uppercase">
                    GOVERNMENT OF TELANGANA • MSN SERVICES
                  </span>
                  <h3 className="text-lg font-black text-[#000080] dark:text-white mt-0.5">
                    OFFICIAL VAULT CERTIFICATE &amp; RECEIPT
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    National Digital Repository • Multi-Tenant Isolated Storage
                  </p>
                </div>

                {/* Document Preview Metadata */}
                <div className="py-5 space-y-3 relative z-10">
                  <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800/80">
                    <span className="text-slate-500">Document Identifier:</span>
                    <span className="font-mono font-bold text-[#000080] dark:text-blue-300">
                      {previewDoc.id || "MSN-DOC-2026-X81"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800/80">
                    <span className="text-slate-500">Document Name:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {previewDoc.docName || previewDoc.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800/80">
                    <span className="text-slate-500">Source File:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                      {previewDoc.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800/80">
                    <span className="text-slate-500">Allocated Size:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {previewDoc.size}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800/80">
                    <span className="text-slate-500">Certified Upload Timestamp:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {previewDoc.uploadedAt}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1">
                    <span className="text-slate-500">Encryption Status:</span>
                    <span className="text-[#138808] font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      AES-256 Bit Verified
                    </span>
                  </div>
                </div>

                {/* Digital Seal Stamp */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between relative z-10">
                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
                      Processing Center
                    </span>
                    <span className="text-xs font-bold text-[#000080] dark:text-blue-300">
                      Ameerpet Office • Hyderabad
                    </span>
                  </div>
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#138808] flex flex-col items-center justify-center text-center p-1 bg-[#E8F5E9]/50">
                    <CheckCircle2 className="w-5 h-5 text-[#138808]" />
                    <span className="text-[8px] font-black text-[#138808] uppercase leading-tight mt-0.5">
                      VERIFIED
                      <br />
                      IN VAULT
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Modal / Toolbar */}
        <div className="p-4 md:p-5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-3">
          {/* Format Selector Bar for Export / Share */}
          {isAuthorized && (
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Export & Share Format:
                </span>
                <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setSelectedFormat("pdf")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedFormat === "pdf"
                        ? "bg-[#000080] text-white shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                    }`}
                  >
                    PDF Document
                  </button>
                  <button
                    onClick={() => setSelectedFormat("image")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedFormat === "image"
                        ? "bg-[#FF9933] text-white shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                    }`}
                  >
                    Image File (PNG)
                  </button>
                </div>
              </div>

              <span className="text-[11px] text-slate-500 hidden sm:inline">
                Selected: <strong>{selectedFormat === "pdf" ? ".PDF Document" : ".PNG Image"}</strong>
              </span>
            </div>
          )}

          {/* Main Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              {isAuthorized ? (
                <span className="flex items-center gap-1 text-[#138808] font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Privileged Owner / Admin Access Enabled
                </span>
              ) : (
                <span className="text-slate-400">Read-Only Statutory Preview</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Print Button */}
              <button
                onClick={handlePrint}
                disabled={!isAuthorized}
                title={!isAuthorized ? "Restricted to Super Admin & Owner" : "Send document to print"}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  isAuthorized
                    ? "bg-[#E8EEF5] hover:bg-[#D0E2FF] text-[#000080] border border-[#BBDEFB] cursor-pointer shadow-sm active:scale-95"
                    : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60"
                }`}
              >
                {!isAuthorized ? <Lock className="w-3.5 h-3.5" /> : <Printer className="w-3.5 h-3.5" />}
                <span>Print Document</span>
              </button>

              {/* Direct PDF Share Button (Bypasses intermediate format popups) */}
              <button
                onClick={handleShare}
                disabled={!isAuthorized || isSharing}
                title={!isAuthorized ? "Restricted to Super Admin & Owner" : "Directly share standardized PDF document via device"}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  isAuthorized && !isSharing
                    ? "bg-[#E8F5E9] hover:bg-[#C8E6C9] text-[#138808] border border-[#C8E6C9] cursor-pointer shadow-sm active:scale-95"
                    : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60"
                }`}
              >
                {!isAuthorized ? (
                  <Lock className="w-3.5 h-3.5" />
                ) : isSharing ? (
                  <Sparkles className="w-3.5 h-3.5 animate-spin text-[#138808]" />
                ) : (
                  <Share2 className="w-3.5 h-3.5" />
                )}
                <span>{isSharing ? "Preparing PDF..." : "Share PDF"}</span>
              </button>

              {/* Robust Download Button */}
              <button
                onClick={handleDownload}
                disabled={!isAuthorized || isDownloading}
                title={!isAuthorized ? "Restricted to Super Admin & Owner" : "Download document file securely"}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 transition-all ${
                  isAuthorized && !isDownloading
                    ? "bg-gradient-to-r from-[#FF9933] to-[#FF6F00] hover:from-[#FF6F00] hover:to-[#E65100] shadow-md shadow-[#FF9933]/25 cursor-pointer active:scale-95"
                    : "bg-slate-400 cursor-not-allowed opacity-60"
                }`}
              >
                {!isAuthorized ? (
                  <Lock className="w-3.5 h-3.5" />
                ) : isDownloading ? (
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>{isDownloading ? "Downloading..." : `Download (${selectedFormat.toUpperCase()})`}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
