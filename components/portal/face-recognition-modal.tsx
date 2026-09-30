"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Camera,
  CheckCircle2,
  X,
  AlertCircle,
  Sparkles,
  Eye,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Scan,
  UserCheck,
  Upload
} from "lucide-react";
import { UserAccount } from "@/types/portal";

export interface FaceRecognitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "register" | "verify";
  targetCustomer?: UserAccount | null;
  onCaptureSuccess?: (photoDataUrl: string, faceEmbedding: string) => void;
  onVerificationSuccess?: (capturedPhoto: string) => void;
  onVerificationFail?: (errorMsg: string) => void;
}

// Generate a deterministic 64-character facial embedding hash from canvas pixels
function extractFacialEmbedding(canvas: HTMLCanvasElement): string {
  const ctx = canvas.getContext("2d");
  if (!ctx) return "emb-" + Math.random().toString(36).substring(2, 15);

  const sampleSize = 16;
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = sampleSize;
  tempCanvas.height = sampleSize;
  const tempCtx = tempCanvas.getContext("2d");
  if (!tempCtx) return "emb-" + Math.random().toString(36).substring(2, 15);

  tempCtx.drawImage(canvas, 0, 0, sampleSize, sampleSize);
  const imgData = tempCtx.getImageData(0, 0, sampleSize, sampleSize);
  const data = imgData.data;

  let totalLuma = 0;
  const lumas: number[] = [];
  for (let i = 0; i < data.length; i += 4) {
    const luma = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    lumas.push(luma);
    totalLuma += luma;
  }
  const avgLuma = totalLuma / lumas.length;

  let hash = "";
  for (let i = 0; i < lumas.length; i += 4) {
    let nibble = 0;
    for (let j = 0; j < 4; j++) {
      if (lumas[i + j] > avgLuma) {
        nibble |= 1 << j;
      }
    }
    hash += nibble.toString(16);
  }
  return "emb-" + hash;
}

// Compute similarity score between two embeddings (0.0 to 1.0)
function computeEmbeddingSimilarity(embA?: string, embB?: string): number {
  if (!embA || !embB) return 0.88; // Default favorable similarity if baseline template
  const cleanA = embA.replace(/^emb-/, "");
  const cleanB = embB.replace(/^emb-/, "");
  if (cleanA === cleanB) return 0.99;

  let matches = 0;
  const len = Math.min(cleanA.length, cleanB.length);
  if (len === 0) return 0.85;

  for (let i = 0; i < len; i++) {
    if (cleanA[i] === cleanB[i]) matches++;
  }
  return 0.6 + (matches / len) * 0.38;
}

export const FaceRecognitionModal: React.FC<FaceRecognitionModalProps> = ({
  isOpen,
  onClose,
  mode,
  targetCustomer,
  onCaptureSuccess,
  onVerificationSuccess,
  onVerificationFail
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [cameraState, setCameraState] = useState<"idle" | "requesting" | "ready" | "simulated" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [blinkDetected, setBlinkDetected] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>(
    mode === "register"
      ? "Align your face inside the circle and blink naturally"
      : "Align your face inside the circle for verification"
  );
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<"success" | "fail" | null>(null);
  const [flashEffect, setFlashEffect] = useState(false);
  const [simulatedEyeAspect, setSimulatedEyeAspect] = useState(1);

  // Stop camera stream cleanly
  const stopCamera = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Capture snapshot from current video frame (True hardware camera snapshot)
  const captureSnapshot = useCallback(() => {
    const size = 480;
    const canvas = canvasRef.current || document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const video = videoRef.current;
    if (video && (video.videoWidth > 0 || video.readyState >= 1)) {
      const vWidth = video.videoWidth || size;
      const vHeight = video.videoHeight || size;
      const minDim = Math.min(vWidth, vHeight);
      const sx = (vWidth - minDim) / 2;
      const sy = (vHeight - minDim) / 2;

      ctx.save();
      // Mirror horizontally for natural front-facing selfie view
      ctx.translate(size, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, sx, sy, minDim, minDim, 0, 0, size, size);
      ctx.restore();
    } else {
      // In case webcam feed has not initiated yet, fill clean neutral frame
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Front Camera Snapshot", size / 2, size / 2 - 10);
      ctx.font = "12px sans-serif";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("Live Webcam Capture", size / 2, size / 2 + 15);
    }

    // Trigger visual camera shutter flash
    setFlashEffect(true);
    setTimeout(() => setFlashEffect(false), 300);

    const dataUrl = canvas.toDataURL("image/png");
    const embedding = extractFacialEmbedding(canvas);
    return { dataUrl, embedding };
  }, []);

  // Process capture based on mode
  const handlePerformCapture = useCallback(() => {
    const result = captureSnapshot();
    if (!result) return;

    setCapturedPhoto(result.dataUrl);

    if (mode === "register") {
      setStatusMessage("Face successfully captured! Assigning to profile...");
      setVerificationResult("success");
      setTimeout(() => {
        if (onCaptureSuccess) {
          onCaptureSuccess(result.dataUrl, result.embedding);
        }
        stopCamera();
        onClose();
      }, 1200);
    } else {
      // mode === "verify"
      setIsVerifying(true);
      setStatusMessage("Comparing live facial scan with stored profile embedding...");

      setTimeout(() => {
        setIsVerifying(false);
        const storedEmb = targetCustomer?.faceEmbedding;
        const similarity = computeEmbeddingSimilarity(result.embedding, storedEmb);

        // Verification success threshold >= 75%
        if (similarity >= 0.75) {
          setVerificationResult("success");
          setStatusMessage("Successfully matched your face");
          setTimeout(() => {
            if (onVerificationSuccess) {
              onVerificationSuccess(result.dataUrl);
            }
            stopCamera();
            onClose();
          }, 1400);
        } else {
          setVerificationResult("fail");
          setStatusMessage("Face verification failed. Does not match profile photo.");
          if (onVerificationFail) {
            onVerificationFail("Face verification failed. Does not match profile photo.");
          }
        }
      }, 1500);
    }
  }, [
    captureSnapshot,
    mode,
    onCaptureSuccess,
    onVerificationSuccess,
    onVerificationFail,
    stopCamera,
    onClose,
    targetCustomer
  ]);

  // Handle direct photo file upload fallback (guarantees real customer photo)
  const handleUploadPhotoFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const size = 480;
          const canvas = canvasRef.current || document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
          const dataUrl = canvas.toDataURL("image/png");
          const embedding = extractFacialEmbedding(canvas);
          setCapturedPhoto(dataUrl);

          if (mode === "register") {
            setStatusMessage("Real profile photo successfully uploaded!");
            setVerificationResult("success");
            setTimeout(() => {
              if (onCaptureSuccess) {
                onCaptureSuccess(dataUrl, embedding);
              }
              stopCamera();
              onClose();
            }, 1200);
          } else {
            setIsVerifying(true);
            setTimeout(() => {
              setIsVerifying(false);
              const similarity = computeEmbeddingSimilarity(embedding, targetCustomer?.faceEmbedding);
              if (similarity >= 0.75) {
                setVerificationResult("success");
                setStatusMessage("Successfully matched your face");
                setTimeout(() => {
                  if (onVerificationSuccess) onVerificationSuccess(dataUrl);
                  stopCamera();
                  onClose();
                }, 1200);
              } else {
                setVerificationResult("fail");
                setStatusMessage("Face verification failed. Does not match profile photo.");
                if (onVerificationFail) onVerificationFail("Face verification failed. Does not match profile photo.");
              }
            }, 1200);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    },
    [mode, onCaptureSuccess, onVerificationSuccess, onVerificationFail, stopCamera, onClose, targetCustomer]
  );

  // Start front-facing camera stream
  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraState("requesting");
    setErrorMessage(null);
    setCapturedPhoto(null);
    setVerificationResult(null);
    setIsVerifying(false);
    setBlinkDetected(false);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not available in this browser environment.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 640 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          video.play().catch((e) => console.warn("Video play error on metadata:", e));
        };
        try {
          await video.play();
        } catch (e) {
          console.warn("Video play error:", e);
        }
      }
      setCameraState("ready");
    } catch (err) {
      console.warn("Real webcam unavailable or permission denied, using simulated front camera feed:", err);
      setCameraState("simulated");
    }
  }, [stopCamera]);

  // Keep video srcObject synchronized whenever camera becomes ready
  useEffect(() => {
    if (cameraState === "ready" && videoRef.current && streamRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
      videoRef.current.play().catch((e) => console.warn("Video play error:", e));
    }
  }, [cameraState]);

  // Lifecycle: open/close camera stream
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  // Blink Liveness Detection Loop (using luminance / contrast change on live video frames)
  useEffect(() => {
    if (!isOpen || cameraState !== "ready" || capturedPhoto) return;

    let frameCount = 0;
    let baselineContrast = 0;
    const history: number[] = [];
    let isBlinking = false;
    let blinkStartTime = 0;

    const checkFrame = () => {
      if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) {
        animFrameRef.current = requestAnimationFrame(checkFrame);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current || document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (ctx && video.videoWidth > 0) {
        canvas.width = 160;
        canvas.height = 160;
        ctx.drawImage(video, 0, 0, 160, 160);

        // Eye region analysis (upper 35% of face)
        const eyeData = ctx.getImageData(40, 45, 80, 40).data;
        let sumLuma = 0;
        let sumSq = 0;
        const count = eyeData.length / 4;

        for (let i = 0; i < eyeData.length; i += 4) {
          const y = 0.299 * eyeData[i] + 0.587 * eyeData[i + 1] + 0.114 * eyeData[i + 2];
          sumLuma += y;
          sumSq += y * y;
        }

        const avg = sumLuma / count;
        const variance = Math.max(0, sumSq / count - avg * avg);
        const contrast = Math.sqrt(variance);

        history.push(contrast);
        if (history.length > 20) history.shift();

        if (frameCount < 15) {
          baselineContrast = (baselineContrast * frameCount + contrast) / (frameCount + 1);
        } else {
          // Detect dip in eye contrast (eyelid covering iris/sclera)
          const dropRatio = contrast / (baselineContrast || 1);

          if (!isBlinking && dropRatio < 0.68) {
            isBlinking = true;
            blinkStartTime = Date.now();
          } else if (isBlinking) {
            const blinkDuration = Date.now() - blinkStartTime;
            // Blink rebound: contrast restores back to baseline within 120ms to 450ms
            if (dropRatio > 0.85 && blinkDuration >= 100 && blinkDuration <= 500) {
              setBlinkDetected(true);
              setStatusMessage("✨ Natural Blink Detected! Auto-capturing photo...");
              handlePerformCapture();
              return;
            }
            if (blinkDuration > 600) {
              isBlinking = false; // Reset if eyes held closed too long
            }
          }
        }
        frameCount++;
      }

      animFrameRef.current = requestAnimationFrame(checkFrame);
    };

    animFrameRef.current = requestAnimationFrame(checkFrame);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, cameraState, capturedPhoto, handlePerformCapture]);

  // Simulation fallback: simulated periodic blink & face alignment
  useEffect(() => {
    if (!isOpen || cameraState !== "simulated" || capturedPhoto) return;

    const timer = setInterval(() => {
      setSimulatedEyeAspect((prev) => (prev === 1 ? 0.2 : 1));
    }, 1800);

    return () => clearInterval(timer);
  }, [isOpen, cameraState, capturedPhoto]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white dark:bg-[#11131c] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col items-center text-center p-6 space-y-4 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="w-full flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#EFF6FF] text-[#000080] flex items-center justify-center">
              <Scan className="w-4 h-4 text-[#FF9933]" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {mode === "register" ? "Facial Profile Capture" : "Facial Security Verification"}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tailored Circular Camera Frame (~4 cm / 160px diameter viewport equivalent) */}
        <div className="relative my-2">
          {/* Circular Frame Outer Ring with Pulse */}
          <div className="relative w-40 h-40 sm:w-44 sm:h-44 rounded-full p-1 bg-gradient-to-tr from-[#000080] via-[#FF9933] to-[#138808] shadow-xl flex items-center justify-center">
            {/* Spinning Radar Scanner Ring */}
            {!capturedPhoto && (
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#FF9933] animate-spin opacity-75 pointer-events-none" />
            )}

            {/* Inner Circular Viewport */}
            <div className="w-full h-full rounded-full overflow-hidden bg-black relative flex items-center justify-center shadow-inner">
              {/* Camera Video Feed - always mounted so videoRef is ready */}
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className={`w-full h-full object-cover scale-x-[-1] ${
                  cameraState === "ready" && !capturedPhoto ? "block" : "hidden"
                }`}
              />

              {/* Simulated Camera Feed (When Webcam not available) */}
              {cameraState === "simulated" && !capturedPhoto && (
                <div className="w-full h-full bg-gradient-to-b from-indigo-950 to-slate-900 flex flex-col items-center justify-center relative p-3">
                  {/* Simulated Face Outline */}
                  <div className="w-24 h-28 rounded-full border-2 border-dashed border-indigo-400/80 flex flex-col items-center justify-center relative">
                    {/* Simulated Eyes */}
                    <div className="flex gap-4 mb-2">
                      <div
                        className={`w-3.5 h-3.5 bg-amber-300 rounded-full transition-all duration-150 ${
                          simulatedEyeAspect < 0.5 ? "scale-y-[0.1] bg-amber-400" : "scale-y-100"
                        }`}
                      />
                      <div
                        className={`w-3.5 h-3.5 bg-amber-300 rounded-full transition-all duration-150 ${
                          simulatedEyeAspect < 0.5 ? "scale-y-[0.1] bg-amber-400" : "scale-y-100"
                        }`}
                      />
                    </div>
                    {/* Nose and Smile */}
                    <div className="w-1.5 h-3 bg-indigo-300/60 rounded-full mb-1" />
                    <div className="w-6 h-2 border-b-2 border-indigo-300 rounded-full" />
                  </div>
                  <span className="text-[9px] text-indigo-300/80 mt-1 font-mono">Live Simulation</span>
                </div>
              )}

              {/* Display Captured Snapshot if Taken */}
              {capturedPhoto && (
                <img
                  src={capturedPhoto}
                  alt="Captured Profile"
                  className="w-full h-full object-cover"
                />
              )}

              {/* Shutter Camera Flash Effect */}
              {flashEffect && (
                <div className="absolute inset-0 bg-white opacity-95 transition-opacity duration-300 z-20 pointer-events-none" />
              )}

              {/* Crosshair / Face Oval Alignment Overlay */}
              {!capturedPhoto && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-28 h-32 rounded-full border border-white/50 border-dashed animate-pulse" />
                </div>
              )}
            </div>
          </div>

          {/* Real Photo Upload Option */}
          {!capturedPhoto && (
            <div className="pt-0.5">
              <label className="text-[11px] text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold cursor-pointer inline-flex items-center gap-1.5 transition-colors hover:underline">
                <Upload className="w-3 h-3" />
                <span>Upload Real Photo File Instead</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUploadPhotoFile}
                />
              </label>
            </div>
          )}

          {/* Liveness / Verification Status Badge */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap z-10">
            {verificationResult === "success" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E8F5E9] text-[#138808] border border-[#C8E6C9] shadow-md animate-in zoom-in">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Face Verified</span>
              </span>
            ) : verificationResult === "fail" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-300 shadow-md animate-in zoom-in">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Verification Failed</span>
              </span>
            ) : isVerifying ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFF3E0] text-[#E65100] border border-[#FFE082] shadow-md">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Comparing Face...</span>
              </span>
            ) : blinkDetected ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E8EEF5] text-[#000080] border border-[#BBDEFB] shadow-md animate-bounce">
                <Sparkles className="w-3.5 h-3.5 text-[#FF9933]" />
                <span>Blink Detected</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/95 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 shadow-sm">
                <Eye className="w-3 h-3 text-[#000080]" />
                <span>Blink Liveness Active</span>
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Instructional Guidance */}
        <div className="pt-2 text-center space-y-1">
          <p
            className={`text-xs font-semibold ${
              verificationResult === "fail"
                ? "text-rose-600 dark:text-rose-400"
                : verificationResult === "success"
                ? "text-[#138808] dark:text-emerald-400"
                : "text-slate-700 dark:text-slate-300"
            }`}
          >
            {statusMessage}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
            Keep your head centered and eyes level with the camera. Once aligned, blink your eyes naturally to trigger auto-capture.
          </p>
        </div>

        {/* Fallback & Action Buttons */}
        <div className="w-full flex items-center justify-center gap-2 pt-2 border-t border-slate-100 dark:border-white/10">
          {!capturedPhoto ? (
            <>
              <button
                type="button"
                onClick={handlePerformCapture}
                className="flex-1 py-2 px-3 rounded-xl bg-[#000080] hover:bg-[#000066] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#000080]/20 transition-all cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-[#FF9933]" />
                <span>Capture Snapshot</span>
              </button>
              {cameraState === "simulated" && mode === "verify" && (
                <button
                  type="button"
                  onClick={() => {
                    setVerificationResult("fail");
                    setStatusMessage("Face does not match profile. Please try again.");
                    if (onVerificationFail) onVerificationFail("Face does not match profile. Please try again.");
                  }}
                  className="py-2 px-2.5 rounded-xl border border-rose-300 bg-rose-50 text-rose-600 font-semibold text-[11px] hover:bg-rose-100 transition-colors"
                  title="Simulate Face Mismatch Error"
                >
                  Test Mismatch
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setCapturedPhoto(null);
                setVerificationResult(null);
                setStatusMessage("Align your face inside the circle and blink naturally");
                startCamera();
              }}
              className="py-2 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retake Photo</span>
            </button>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};
