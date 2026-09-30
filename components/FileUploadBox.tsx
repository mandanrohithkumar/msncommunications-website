"use client";

import React, { useState, useRef } from "react";
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
  disabled?: boolean;
  className?: string;
}

export const FileUploadBox: React.FC<FileUploadBoxProps> = ({
  label,
  required = false,
  acceptedTypes = [".pdf", ".jpg", ".jpeg", ".png"],
  currentFile = null,
  onConfirmUpload,
  onRemove,
  disabled = false,
  className = ""
}) => {
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isAttached = Boolean(currentFile);

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
    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelected(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
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
        previewType: file.type.includes("pdf") ? "pdf" : "image"
      };

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

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Label Row */}
      <div className="flex items-center justify-between text-xs">
        <label className="font-semibold text-slate-700 dark:text-slate-300">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {isAttached ? (
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
            <span>Attached</span>
          </span>
        ) : required ? (
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
            Required
          </span>
        ) : (
          <span className="text-[10px] text-slate-400">Optional</span>
        )}
      </div>

      {/* Main Upload Box UI */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => {
          if (!disabled) fileInputRef.current?.click();
        }}
        className={`relative rounded-2xl border-2 transition-all p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none ${
          isAttached
            ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 shadow-xs"
            : isDragOver
            ? "border-[#FF9933] bg-[#FFF8F0] dark:bg-amber-950/30 scale-[1.01]"
            : "border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/60 hover:border-indigo-400 dark:hover:border-indigo-500/60 hover:bg-slate-50 dark:hover:bg-slate-900"
        } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(",")}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />

        {/* Left Side: Icon & Status */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {isAttached ? (
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-300 dark:border-emerald-700">
              <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-300 stroke-[3]" />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800">
              <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            {isAttached ? (
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 tracking-wide uppercase">
                    Attached ✓
                  </span>
                  <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400 font-mono">
                    ({currentFile?.size || "Verified"})
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate" title={currentFile?.name}>
                  {currentFile?.name}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  Click or Drop to Attach {label}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  Supported formats: PDF, JPG, PNG (Max 10MB)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side Action Indicator */}
        <div className="shrink-0 flex items-center gap-2">
          {isAttached ? (
            <div className="flex items-center gap-1.5">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-black text-[11px] flex items-center gap-1 shadow-xs">
                <span>✓</span>
                <span>Attached</span>
              </span>
              {onRemove && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                  className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                  title="Remove document"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <span className="px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold">
              Select
            </span>
          )}
        </div>
      </div>

      {/* Confirmation Modal Popup when file is selected */}
      {isConfirmModalOpen && pendingFile && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white dark:bg-[#181824] border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            {/* Modal Icon */}
            <div className="mx-auto w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800 shadow-sm">
              <FileCheck className="w-6 h-6 text-[#FF9933]" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Confirm Document Upload
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Please verify the file details before attaching it to <strong>{label}</strong>.
              </p>
            </div>

            {/* Selected File Summary Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-left space-y-1.5 text-xs">
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span className="text-[11px]">Document Requirement:</span>
                <span className="font-bold text-slate-900 dark:text-white">{label}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span className="text-[11px]">Selected File Name:</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white truncate max-w-[160px]" title={pendingFile.name}>
                  {pendingFile.name}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span className="text-[11px]">File Size:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {(pendingFile.size / 1024).toFixed(1)} KB
                </span>
              </div>
            </div>

            {/* Action Buttons: Explicit 'OK' and 'Cancel' */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleCancelModal}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmOk}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 cursor-pointer transition-colors flex items-center justify-center gap-1.5"
              >
                <span>OK</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
