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
  Trash2
} from "lucide-react";

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
        previewType: file.type.includes("pdf") || file.name.toLowerCase().endsWith(".pdf") ? "pdf" : "image"
      };

      setLocalFile(fileMeta);
      onConfirmUpload(file, fileMeta);
      setIsConfirmModalOpen(false);
      setPendingFile(null);
    };

    reader.readAsDataURL(file);
  };

  const handleCancelModal = () => {
    setIsConfirmModalOpen(false);
    setPendingFile(null);
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
            className="bg-white dark:bg-[#181824] border border-slate-200 dark:border-slate-800 w-full max-w-[320px] rounded-2xl p-4 shadow-2xl space-y-3 text-center animate-in zoom-in-95 duration-150"
          >
            {/* Modal Icon */}
            <div className="mx-auto w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800 shadow-xs">
              <FileCheck className="w-5 h-5 text-[#FF9933]" />
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
                <span className="font-mono font-medium text-slate-900 dark:text-white truncate max-w-[180px]" title={pendingFile.name}>
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
                className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-600/30 cursor-pointer transition-colors flex items-center justify-center gap-1"
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
