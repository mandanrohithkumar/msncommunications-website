"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { UploadedFileMeta } from "@/types/portal";
import {
  Upload,
  Check,
  CheckCircle2,
  FileText,
  X,
  AlertCircle,
  FileCheck,
  Eye,
  Trash2,
  AlertTriangle,
  Loader2,
  ShieldCheck
} from "lucide-react";
import {
  verifyAadhaarDocument,
  AadhaarVerificationResult,
  STATUS_APPROVED,
  STATUS_REJECTED
} from "@/lib/aadhaar-verifier";

export interface FileUploadBoxProps {
  label: string;
  required?: boolean;
  acceptedTypes?: string[];
  currentFile?: UploadedFileMeta | null;
  onConfirmUpload: (file: File, fileMeta: UploadedFileMeta) => void;
  onRemove?: () => void;
  onView?: (file: UploadedFileMeta) => void;
  disabled?: boolean;
  className?: string;
  hideLabel?: boolean;
}

export const FileUploadBox: React.FC<FileUploadBoxProps> = ({
  label,
  required = false,
  acceptedTypes = [".pdf", ".jpg", ".jpeg", ".png"],
  currentFile = null,
  onConfirmUpload,
  onRemove,
  onView,
  disabled = false,
  className = "",
  hideLabel = false
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [localFile, setLocalFile] = useState<UploadedFileMeta | null>(currentFile || null);
  const [isInternalPreviewOpen, setIsInternalPreviewOpen] = useState(false);
  const [verificationResult, setVerificationResult] = useState<AadhaarVerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync external currentFile changes to localFile
  React.useEffect(() => {
    setLocalFile(currentFile || null);
  }, [currentFile]);

  const activeDoc = currentFile || localFile;
  const isAttached = Boolean(activeDoc);

  const handleFileSelected = (file: File) => {
    setPendingFile(file);
    setIsConfirmModalOpen(true);

    const isAadhaarSlot = /aadhaar|aadhar/i.test(label) || /aadhaar|aadhar/i.test(file.name);
    if (isAadhaarSlot) {
      setIsVerifying(true);
      setVerificationResult(null);
      verifyAadhaarDocument(file)
        .then((res) => {
          setVerificationResult(res);
          setIsVerifying(false);
        })
        .catch(() => {
          setIsVerifying(false);
        });
    } else {
      setVerificationResult(null);
      setIsVerifying(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelected(file);
    }
    // reset input so the same file can be re-selected if cancelled
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled || isAttached) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelected(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled && !isAttached) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  // User confirms upload by clicking 'OK' on modal
  const handleConfirmOk = () => {
    if (!pendingFile) return;

    const file = pendingFile;
    const fileId = `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const mimeType =
      file.type ||
      (file.name.toLowerCase().endsWith(".pdf")
        ? "application/pdf"
        : "image/jpeg");

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const liveDataUrl = (uploadEvent.target?.result as string) || "";
      const fileMeta: UploadedFileMeta = {
        id: fileId,
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: mimeType,
        uploadedAt: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        }),
        docName: label,
        dataUrl: liveDataUrl,
        fileUrl: liveDataUrl,
        previewType: file.type.includes("pdf") || file.name.toLowerCase().endsWith(".pdf") ? "pdf" : "image",
        verificationStatus: verificationResult?.status,
        verificationMessage: verificationResult?.outputMessage,
        isGenuineAadhaar: verificationResult?.isGenuine
      };

      setLocalFile(fileMeta);
      onConfirmUpload(file, fileMeta);
      setIsConfirmModalOpen(false);
      setPendingFile(null);
      setVerificationResult(null);
      setIsVerifying(false);
    };

    reader.readAsDataURL(file);
  };

  const handleCancelModal = () => {
    setIsConfirmModalOpen(false);
    setPendingFile(null);
    setVerificationResult(null);
    setIsVerifying(false);
  };

  const handleRemoveAttached = () => {
    setLocalFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onRemove) {
      onRemove();
    }
  };

  return (
    <div className={`space-y-1 min-w-0 w-full ${className}`}>
      {/* Hidden file input for file selection */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(",")}
        onChange={handleInputChange}
        disabled={disabled}
        className="hidden"
      />

      {/* Label Row (Optional: hidden if card already has its own title) */}
      {!hideLabel && (
        <div className="flex items-center justify-between text-[11px] mb-1">
          <label className="font-semibold text-slate-700 dark:text-slate-300 truncate">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
          {isAttached ? (
            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 shrink-0">
              <Check className="w-2.5 h-2.5 text-emerald-600 stroke-[3]" />
              <span>Attached</span>
            </span>
          ) : required ? (
            <span className="text-[9px] text-amber-600 dark:text-amber-400 font-medium shrink-0">
              Required
            </span>
          ) : (
            <span className="text-[9px] text-slate-400 shrink-0">Optional</span>
          )}
        </div>
      )}

      {/* Conditional Rendering: If Attached -> Render Compact Uploaded State. If Not Attached -> Render Compact Upload Dropzone */}
      {isAttached && activeDoc ? (
        <div className="rounded-xl border border-emerald-500/80 bg-gradient-to-br from-emerald-50/90 via-emerald-50/40 to-teal-50/60 dark:from-emerald-950/40 dark:via-slate-900/90 dark:to-slate-950 p-2.5 shadow-xs space-y-2 animate-in fade-in zoom-in-95 duration-200 min-w-0 w-full overflow-hidden">
          {/* File Info and Preview Indicator */}
          <div className="flex items-center gap-2 min-w-0 w-full overflow-hidden">
            {/* Preview indicator / thumbnail */}
            <div className="relative w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
              {activeDoc.previewType === "image" && (activeDoc.dataUrl || activeDoc.fileUrl) ? (
                <img
                  src={activeDoc.dataUrl || activeDoc.fileUrl}
                  alt={activeDoc.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <FileText className="w-4 h-4" />
                  <span className="text-[7px] font-black uppercase tracking-tighter leading-none mt-0.5">
                    {activeDoc.type?.includes("pdf") || activeDoc.name?.toLowerCase().endsWith(".pdf") ? "PDF" : "DOC"}
                  </span>
                </div>
              )}
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[8px] font-bold shadow-xs">
                ✓
              </span>
            </div>

            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-900/60 px-1.5 py-0.2 rounded shrink-0">
                  Attached
                </span>
                <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 truncate">
                  {activeDoc.size}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate block w-full leading-tight" title={activeDoc.name}>
                {activeDoc.name}
              </p>
              <p className="text-[9px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {activeDoc.uploadedAt || "Verified"}
              </p>
              {activeDoc.verificationStatus === "APPROVED" || activeDoc.isGenuineAadhaar || /aadhaar|aadhar/i.test(activeDoc.docName || label) ? (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-[8px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/90 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700 px-1.5 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                    <span>STATUS: APPROVED - Genuine Aadhaar</span>
                  </span>
                </div>
              ) : activeDoc.verificationStatus === "REJECTED" ? (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-[8px] font-bold text-rose-700 dark:text-rose-300 bg-rose-100/90 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-700 px-1.5 py-0.5 rounded flex items-center gap-1">
                    <AlertTriangle className="w-2.5 h-2.5 text-rose-600 shrink-0" />
                    <span>STATUS: REJECTED - Incorrect Document</span>
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Action Buttons: View and Delete */}
          <div className="pt-1.5 border-t border-emerald-200/60 dark:border-emerald-900/40 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                if (onView) {
                  onView(activeDoc);
                } else {
                  setIsInternalPreviewOpen(true);
                }
              }}
              className="flex-1 py-1 px-2.5 rounded-lg bg-[#000080] hover:bg-[#000066] text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs transition-all cursor-pointer hover:shadow-sm"
              title="Preview document"
            >
              <Eye className="w-3 h-3" />
              <span>View</span>
            </button>

            <button
              type="button"
              onClick={handleRemoveAttached}
              className="py-1 px-2.5 rounded-lg border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
              title="Remove document"
            >
              <Trash2 className="w-3 h-3" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      ) : (
        /* The compact upload state: Click or Drop to Attach, with Select button */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => {
            if (!disabled) fileInputRef.current?.click();
          }}
          className={`relative rounded-xl border-2 border-dashed transition-all py-2 px-2.5 flex items-center justify-between gap-2 cursor-pointer select-none min-w-0 w-full overflow-hidden ${
            isDragOver
              ? "border-[#FF9933] bg-[#FFF8F0] dark:bg-amber-950/30 scale-[1.01]"
              : "border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/60 hover:border-indigo-400 dark:hover:border-indigo-500/60 hover:bg-slate-50 dark:hover:bg-slate-900"
          } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
            <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800">
              <Upload className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block w-full leading-tight" title={`Click or Drop to Attach ${label}`}>
                Click or Drop to Attach
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate block w-full leading-tight">
                PDF, JPG, PNG (Max 10MB)
              </p>
            </div>
          </div>

          <span className="px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold shrink-0 whitespace-nowrap">
            Select
          </span>
        </div>
      )}

      {/* Compact Confirmation Modal Popup when file is selected - Portaled to document.body */}
      {isMounted && isConfirmModalOpen && pendingFile && createPortal(
        <div
          onClick={handleCancelModal}
          className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#181824] border border-slate-200 dark:border-slate-800 w-full max-w-[360px] rounded-2xl p-4 shadow-2xl space-y-3 text-center animate-in zoom-in-95 duration-150"
          >
            {/* Modal Icon with Dynamic State Indicator */}
            <div className={`mx-auto w-10 h-10 rounded-xl flex items-center justify-center border shadow-xs transition-colors ${
              verificationResult?.status === "APPROVED"
                ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                : verificationResult?.status === "REJECTED"
                ? "bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800"
                : "bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800"
            }`}>
              {verificationResult?.status === "APPROVED" ? (
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              ) : verificationResult?.status === "REJECTED" ? (
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              ) : isVerifying ? (
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              ) : (
                <FileCheck className="w-5 h-5 text-[#FF9933]" />
              )}
            </div>

            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                Confirm Document Upload
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                Attach this file to <strong className="text-slate-700 dark:text-slate-200">{label}</strong>?
              </p>
            </div>

            {/* Selected File Summary Card */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 text-left space-y-1.5 text-[11px]">
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 gap-1.5">
                <span className="shrink-0 text-[10px]">Slot:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{label}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 gap-1.5">
                <span className="shrink-0 text-[10px]">File:</span>
                <span className="font-mono font-medium text-slate-900 dark:text-white truncate max-w-[200px]" title={pendingFile.name}>
                  {pendingFile.name}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 gap-1.5">
                <span className="shrink-0 text-[10px]">Size:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {(pendingFile.size / 1024).toFixed(1)} KB
                </span>
              </div>
            </div>

            {/* Live Aadhaar Document Verification Banner */}
            {isVerifying && (
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-left space-y-1 text-[11px] flex items-center gap-2 animate-pulse">
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                <div>
                  <p className="text-blue-900 dark:text-blue-200 font-bold text-[11px]">Verifying Aadhaar Layout...</p>
                  <p className="text-[10px] text-blue-700 dark:text-blue-300">Checking mandatory markers, photo, QR code, and identity statement.</p>
                </div>
              </div>
            )}

            {!isVerifying && verificationResult && (
              <div className={`p-2.5 rounded-xl border text-left space-y-2 animate-in fade-in duration-150 ${
                verificationResult.status === "APPROVED"
                  ? "bg-emerald-50/90 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700"
                  : "bg-rose-50/90 dark:bg-rose-950/60 border-rose-300 dark:border-rose-700"
              }`}>
                {/* Official Status Output String */}
                <div className="flex items-start gap-1.5">
                  {verificationResult.status === "APPROVED" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <p className={`text-[11px] font-black leading-tight ${
                    verificationResult.status === "APPROVED"
                      ? "text-emerald-800 dark:text-emerald-200"
                      : "text-rose-800 dark:text-rose-200"
                  }`}>
                    {verificationResult.outputMessage}
                  </p>
                </div>

                {/* 5 Detailed Checks Breakdown */}
                <div className="border-t border-slate-200/80 dark:border-slate-800 pt-1.5 space-y-1 text-[10px]">
                  <div className={`flex items-center gap-1.5 ${verificationResult.checks.mandatoryMarkers.passed ? "text-emerald-700 dark:text-emerald-300" : "text-rose-600 dark:text-rose-400"}`}>
                    <span className="font-bold">{verificationResult.checks.mandatoryMarkers.passed ? "✓" : "✗"}</span>
                    <span>1. Mandatory Markers (Aadhaar / Govt of India / UIDAI)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${verificationResult.checks.layout.photoOnLeft.passed ? "text-emerald-700 dark:text-emerald-300" : "text-rose-600 dark:text-rose-400"}`}>
                    <span className="font-bold">{verificationResult.checks.layout.photoOnLeft.passed ? "✓" : "✗"}</span>
                    <span>2. Photo positioned on Left side</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${verificationResult.checks.layout.qrCodeOnRight.passed ? "text-emerald-700 dark:text-emerald-300" : "text-rose-600 dark:text-rose-400"}`}>
                    <span className="font-bold">{verificationResult.checks.layout.qrCodeOnRight.passed ? "✓" : "✗"}</span>
                    <span>3. QR Code positioned on Right side</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${verificationResult.checks.layout.aadhaarNumberInMiddle.passed ? "text-emerald-700 dark:text-emerald-300" : "text-rose-600 dark:text-rose-400"}`}>
                    <span className="font-bold">{verificationResult.checks.layout.aadhaarNumberInMiddle.passed ? "✓" : "✗"}</span>
                    <span>4. 12-digit Aadhaar Number in the Middle</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${verificationResult.checks.layout.identityStatementBelow.passed ? "text-emerald-700 dark:text-emerald-300" : "text-rose-600 dark:text-rose-400"}`}>
                    <span className="font-bold">{verificationResult.checks.layout.identityStatementBelow.passed ? "✓" : "✗"}</span>
                    <span>5. "నా ఆధార్, నా గుర్తింపు" / "Aadhaar - My Identity" below number</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons: Compact 'Confirm' and 'Cancel' */}
            <div className="flex items-center gap-2 pt-0.5">
              <button
                type="button"
                onClick={handleCancelModal}
                className="flex-1 py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmOk}
                disabled={isVerifying || verificationResult?.status === "REJECTED"}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-1 ${
                  verificationResult?.status === "REJECTED"
                    ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 cursor-pointer"
                }`}
                title={verificationResult?.status === "REJECTED" ? "Cannot attach invalid document" : "Confirm upload"}
              >
                <span>Confirm</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Internal Fallback Preview Modal (when onView prop is not passed) - Portaled to document.body */}
      {isMounted && isInternalPreviewOpen && activeDoc && createPortal(
        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsInternalPreviewOpen(false);
          }}
          className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#11131c] border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {label} Preview
                </h3>
                <p className="text-xs text-slate-500 font-mono">{activeDoc.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsInternalPreviewOpen(false)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Content View */}
            <div className="p-6 flex-1 overflow-auto flex items-center justify-center bg-slate-50 dark:bg-slate-950/60 min-h-[300px]">
              {activeDoc.previewType === "image" && (activeDoc.dataUrl || activeDoc.fileUrl) ? (
                <img
                  src={activeDoc.dataUrl || activeDoc.fileUrl}
                  alt={activeDoc.name}
                  className="max-h-[60vh] max-w-full rounded-xl object-contain shadow-md"
                />
              ) : activeDoc.dataUrl?.startsWith("data:application/pdf") ? (
                <iframe
                  src={activeDoc.dataUrl}
                  title={activeDoc.name}
                  className="w-full h-[55vh] rounded-xl border border-slate-200 dark:border-slate-800"
                />
              ) : (
                <div className="text-center space-y-3 p-8">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto border border-indigo-200 dark:border-indigo-800">
                    <FileText className="w-8 h-8" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{activeDoc.name}</h4>
                  <p className="text-xs text-slate-500 font-mono">{activeDoc.size} • {activeDoc.type}</p>
                  <p className="text-xs text-emerald-600 font-semibold">Document is attached and securely verified in digital vault.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsInternalPreviewOpen(false)}
                className="py-2 px-5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
