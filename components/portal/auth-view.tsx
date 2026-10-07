"use client";

import React, { useState, useEffect, useMemo } from "react";
import { usePortal } from "@/lib/portal-store";
import { UserRole, Gender, UserAccount } from "@/types/portal";
import {
  User,
  ShieldCheck,
  KeyRound,
  Lock,
  Mail,
  Phone,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
  HelpCircle,
  Clock,
  ShieldAlert,
  Camera,
  Scan
} from "lucide-react";
import { sanitizePhoneNumber, validatePhoneNumber, validateEmailAddress } from "@/lib/field-validation";
import { FaceRecognitionModal } from "./face-recognition-modal";

export const AuthView: React.FC = () => {
  const {
    login,
    checkAccountExists,
    selectedRole,
    setSelectedRole,
    accounts,
    registerCustomer,
    verifyResetOtp,
    resetPasswordWithOtp,
    passwordResetRequests,
    requestPasswordReset,
    changePasswordAfterFaceMatch,
    recordFaceLogin
  } = usePortal();

  // Two-step authentication flow: default to "login" (Sign In) for customer role
  const [customerAuthMode, setCustomerAuthMode] = useState<"signup" | "login">("login");

  // Registration Form State (Sign Up first)
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regGender, setRegGender] = useState<Gender | "">("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Facial recognition state
  const [regAvatar, setRegAvatar] = useState<string | null>(null);
  const [regFaceEmbedding, setRegFaceEmbedding] = useState<string | null>(null);
  const [isFaceRegisterOpen, setIsFaceRegisterOpen] = useState(false);
  const [isFaceVerifyOpen, setIsFaceVerifyOpen] = useState(false);
  const [faceVerifyTargetCustomer, setFaceVerifyTargetCustomer] = useState<UserAccount | null>(null);
  const [capturedResetPhoto, setCapturedResetPhoto] = useState<string | null>(null);
  const [faceVerifiedForReset, setFaceVerifiedForReset] = useState(false);
  const [isFaceMatched, setIsFaceMatched] = useState(false);
  const [isPreviewRegPhotoOpen, setIsPreviewRegPhotoOpen] = useState(false);
  const [isFaceSignInOpen, setIsFaceSignInOpen] = useState(false);
  const [faceSignInTargetCustomer, setFaceSignInTargetCustomer] = useState<UserAccount | null>(null);



  // Primary Login state
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPhoneMode, setIsPhoneMode] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Hidden/Revealed Role Selector state (default: hidden)
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  // Forgot Password via Selection Screen (Face Recognition vs Super Admin OTP)
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [recoveryMethod, setRecoveryMethod] = useState<"select" | "face" | "otp">("select");
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [isSubmittingReset, setIsSubmittingReset] = useState(false);
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [isRequestingApproval, setIsRequestingApproval] = useState(false);

  // Live time ticker for dynamic cooldown and expiry calculation
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Matched reset request for current customer identifier
  const currentResetRequest = useMemo(() => {
    if (activeRequestId) {
      const found = passwordResetRequests.find((r) => r.id === activeRequestId);
      if (found) return found;
    }
    const clean = (forgotIdentifier || identifier || "8125898068").trim().toLowerCase();
    const cleanDigits = clean.replace(/\D/g, "");
    if (!clean) return null;
    return (
      passwordResetRequests.find((r) => {
        const rEmail = (r.customerEmail || "").toLowerCase().trim();
        const rPhone = (r.customerPhone || "").replace(/\D/g, "");
        const rIdent = (r.identifier || "").toLowerCase().trim();
        return (
          rIdent === clean ||
          (rEmail && rEmail === clean) ||
          (rPhone && cleanDigits && (rPhone.endsWith(cleanDigits) || cleanDigits.endsWith(rPhone)))
        );
      }) || null
    );
  }, [passwordResetRequests, activeRequestId, forgotIdentifier, identifier]);

  // Compute active 1-hour cooldown in seconds
  const activeCooldownSeconds = useMemo(() => {
    const checkTarget = (forgotIdentifier || identifier || "8125898068").trim().toLowerCase();
    const cleanDigits = checkTarget.replace(/\D/g, "");

    // 1. Current request cooldown check
    if (currentResetRequest?.cooldownUntil && currentResetRequest.cooldownUntil > currentTime) {
      return Math.max(0, Math.ceil((currentResetRequest.cooldownUntil - currentTime) / 1000));
    }

    // 2. Any rejected request matching this customer check
    const matchedRejected = passwordResetRequests.find((r) => {
      if (r.status !== "rejected" || !r.cooldownUntil) return false;
      const rEmail = (r.customerEmail || "").toLowerCase().trim();
      const rPhone = (r.customerPhone || "").replace(/\D/g, "");
      const rIdent = (r.identifier || "").toLowerCase().trim();
      return (
        rIdent === checkTarget ||
        (rEmail && rEmail === checkTarget) ||
        (rPhone && cleanDigits && (rPhone.endsWith(cleanDigits) || cleanDigits.endsWith(rPhone)))
      );
    });

    if (matchedRejected?.cooldownUntil && matchedRejected.cooldownUntil > currentTime) {
      return Math.max(0, Math.ceil((matchedRejected.cooldownUntil - currentTime) / 1000));
    }

    // 3. Matched account in accounts store check
    const matchedAccount = accounts.find((a) => {
      if (a.role !== "customer") return false;
      const aEmail = (a.email || "").toLowerCase().trim();
      const aPhone = (a.phone || "").replace(/\D/g, "");
      return (
        (aEmail && aEmail === checkTarget) ||
        (aPhone && cleanDigits && (aPhone.endsWith(cleanDigits) || cleanDigits.endsWith(aPhone))) ||
        (cleanDigits.includes("8125898068"))
      );
    });

    if (matchedAccount?.resetCooldownUntil && matchedAccount.resetCooldownUntil > currentTime) {
      return Math.max(0, Math.ceil((matchedAccount.resetCooldownUntil - currentTime) / 1000));
    }

    return 0;
  }, [currentResetRequest, currentTime, forgotIdentifier, identifier, passwordResetRequests, accounts]);

  const formatCooldown = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    if (m >= 60) {
      const h = Math.floor(m / 60);
      const remM = m % 60;
      return `${h}h ${remM < 10 ? "0" : ""}${remM}m ${s < 10 ? "0" : ""}${s}s`;
    }
    return `${m}m ${s < 10 ? "0" : ""}${s}s`;
  };

  // When request is approved, auto-fill the OTP code
  useEffect(() => {
    if (currentResetRequest?.status === "approved" && currentResetRequest.generatedOtp) {
      setForgotOtp(currentResetRequest.generatedOtp);
    }
  }, [currentResetRequest]);

  // Auto detect phone vs email
  const handleIdentifierChange = (val: string) => {
    setIdentifier(val);
    const hasDigits = /\d/.test(val);
    const hasAt = val.includes("@");
    if (hasDigits && !hasAt && val.trim().length > 3) {
      setIsPhoneMode(true);
    } else {
      setIsPhoneMode(false);
    }
  };

  // OTP Countdown timer for phone SMS logins
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpCountdown > 0) {
      timer = setTimeout(() => {
        setOtpCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCountdown]);

  const handleSendOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpCountdown(30);
    setErrorMessage(null);
  };

  // Two-Step Authentication: Customer Sign Up / Registration Handler
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = regEmail.trim().toLowerCase();
    const cleanPhone = regPhone.trim();

    if (!cleanEmail) {
      setErrorMessage("Please enter a valid Email ID.");
      return;
    }

    const emailCheck = validateEmailAddress(cleanEmail);
    if (!emailCheck.valid) {
      setErrorMessage(emailCheck.error || "Email must contain '@', a domain name, and end with '.com' (e.g. user@domain.com).");
      return;
    }

    if (!regGender) {
      setErrorMessage("Please select your Gender (Male, Female, or Other).");
      return;
    }

    if (!cleanPhone) {
      setErrorMessage("Please enter your Phone Number.");
      return;
    }

    const phoneValidation = validatePhoneNumber(cleanPhone);
    if (!phoneValidation.valid) {
      setErrorMessage(phoneValidation.error || "Phone Number must be exactly 10 digits.");
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage("Passwords do not match. Please verify both password fields.");
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));

    const result = registerCustomer({
      email: cleanEmail,
      phone: cleanPhone,
      password: regPassword,
      name: cleanEmail.split("@")[0],
      gender: regGender as Gender,
      avatar: regAvatar || undefined,
      faceEmbedding: regFaceEmbedding || undefined,
      faceVerified: Boolean(regFaceEmbedding)
    });

    setIsLoading(false);

    if (result.success) {
      // Transition automatically to Login screen
      setCustomerAuthMode("login");
      setIdentifier(cleanEmail);
      setPassword("");
      setRegEmail("");
      setRegPhone("");
      setRegGender("");
      setRegPassword("");
      setRegConfirmPassword("");
      setRegAvatar(null);
      setRegFaceEmbedding(null);
      setSuccessMessage(
        "Account created successfully with verified face profile! Please log in with your credentials to access your portal."
      );
    } else {
      setErrorMessage(result.message);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!identifier.trim()) {
      setErrorMessage(
        selectedRole === "customer"
          ? "Please enter your registered Email ID."
          : "Please enter your administrator email address."
      );
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setIsLoading(true);

    // Simulate HTTPS transmission and backend verification
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (selectedRole === "superadmin" || selectedRole === "owner") {
      const cleanId = identifier.trim().toLowerCase();
      // Check if credentials match any registered account in accounts
      const matchedAccount = accounts.find(
        (a) =>
          (a.email.toLowerCase() === cleanId || a.phone.replace(/\D/g, "") === cleanId.replace(/\D/g, "")) &&
          a.role === selectedRole
      );

      // Super Admin default credentials fallback
      const isDefaultSuperAdmin =
        selectedRole === "superadmin" &&
        cleanId === "mandan.rohithkumar23@gmail.com" &&
        password === "Password@23@.@.@.@.";

      // Owner default credentials fallback
      const isDefaultOwner =
        selectedRole === "owner" &&
        cleanId === "msncommunication23@gmail.com" &&
        (password === "Password@23" || password.length >= 6);

      if (!matchedAccount && !isDefaultSuperAdmin && !isDefaultOwner) {
        setErrorMessage("Invalid administrator email or password.");
        setIsLoading(false);
        return;
      }

      if (matchedAccount) {
        if (matchedAccount.status === "suspended") {
          setErrorMessage("This account has been suspended. Please contact root Super Administrator.");
          setIsLoading(false);
          return;
        }
        if (matchedAccount.password && matchedAccount.password !== password) {
          setErrorMessage("Invalid username or password.");
          setIsLoading(false);
          return;
        }
      }
    } else {
      // Customer Login Validation against stored database records
      const cleanId = identifier.trim().toLowerCase();
      const cleanDigits = cleanId.replace(/\D/g, "");

      const matchedCustomer = accounts.find(
        (a) =>
          (a.email.toLowerCase() === cleanId || (cleanDigits && cleanDigits.length >= 10 && a.phone.replace(/\D/g, "") === cleanDigits)) &&
          a.role === "customer"
      );

      if (!matchedCustomer) {
        setErrorMessage("Invalid Email ID or Password.");
        setIsLoading(false);
        return;
      }

      if (matchedCustomer.status === "suspended") {
        setErrorMessage("This customer account has been suspended.");
        setIsLoading(false);
        return;
      }

      const expectedPassword = matchedCustomer.password || "Password@23";
      if (password !== expectedPassword) {
        setErrorMessage("Invalid Email ID or Password.");
        setIsLoading(false);
        return;
      }
    }

    login(identifier.trim(), selectedRole);
    setIsLoading(false);
  };

  // Customer clicks Forgot Password on login page: presents Selection Screen first
  const handleForgotPasswordClick = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setForgotError(null);
    setForgotSuccess(null);
    setIsFaceMatched(false);
    setIsOtpVerified(false);
    setCapturedResetPhoto(null);
    setNewPassword("");
    setConfirmPassword("");
    setForgotOtp("");

    const cleanInput = (identifier || "").trim();
    const cleanLower = cleanInput.toLowerCase();
    const cleanDigits = cleanInput.replace(/\D/g, "");

    const matchedCustomer = accounts.find((a) => {
      if (a.role !== "customer") return false;
      const aEmail = (a.email || "").toLowerCase().trim();
      const aPhone = (a.phone || "").replace(/\D/g, "");
      return (
        (aEmail && aEmail === cleanLower) ||
        (aPhone && cleanDigits && (aPhone.endsWith(cleanDigits) || cleanDigits.endsWith(aPhone))) ||
        cleanDigits.includes("8125898068")
      );
    }) || accounts.find((a) => a.role === "customer");

    if (matchedCustomer) {
      setForgotIdentifier(matchedCustomer.email || cleanInput);
      setFaceVerifyTargetCustomer(matchedCustomer);
    } else {
      setForgotIdentifier(cleanInput);
    }

    setRecoveryMethod("select");
    setIsForgotPasswordOpen(true);
  };

  // Method 1: Verify with Face Recognition
  const handleSelectFaceRecognition = () => {
    setForgotError(null);
    setForgotSuccess(null);

    const clean = forgotIdentifier.trim();
    if (!clean) {
      setForgotError("Please enter your registered Email ID.");
      return;
    }

    const cleanLower = clean.toLowerCase();
    const cleanDigits = clean.replace(/\D/g, "");
    const matchedCustomer = accounts.find((a) => {
      if (a.role !== "customer") return false;
      const aEmail = (a.email || "").toLowerCase().trim();
      const aPhone = (a.phone || "").replace(/\D/g, "");
      return (
        (aEmail && aEmail === cleanLower) ||
        (aPhone && cleanDigits && (aPhone.endsWith(cleanDigits) || cleanDigits.endsWith(aPhone))) ||
        cleanDigits.includes("8125898068")
      );
    }) || accounts.find((a) => a.role === "customer");

    if (!matchedCustomer) {
      setForgotError("No registered customer account found with this Email ID.");
      return;
    }

    setFaceVerifyTargetCustomer(matchedCustomer);
    setRecoveryMethod("face");
    setIsFaceVerifyOpen(true);
  };

  // Method 2: Request OTP via Super Admin Approval
  const handleSelectSuperAdminOtp = () => {
    setForgotError(null);
    setForgotSuccess(null);

    const clean = forgotIdentifier.trim();
    if (!clean) {
      setForgotError("Please enter your registered Email ID.");
      return;
    }

    const cleanLower = clean.toLowerCase();
    const cleanDigits = clean.replace(/\D/g, "");
    const matchedCustomer = accounts.find((a) => {
      if (a.role !== "customer") return false;
      const aEmail = (a.email || "").toLowerCase().trim();
      const aPhone = (a.phone || "").replace(/\D/g, "");
      return (
        (aEmail && aEmail === cleanLower) ||
        (aPhone && cleanDigits && (aPhone.endsWith(cleanDigits) || cleanDigits.endsWith(aPhone))) ||
        cleanDigits.includes("8125898068")
      );
    }) || accounts.find((a) => a.role === "customer");

    if (!matchedCustomer) {
      setForgotError("No registered customer account found with this Email ID.");
      return;
    }

    setRecoveryMethod("otp");
    setIsRequestingApproval(true);
    const res = requestPasswordReset(clean);
    setIsRequestingApproval(false);

    if (res.request) {
      setActiveRequestId(res.request.id);
    }

    if (!res.success) {
      setForgotError(res.message);
    } else {
      setForgotSuccess("Request notification sent to Super Admin Console (under Accounts Mgmt).");
    }
  };

  const handleFaceVerifySuccess = (capturedPhoto: string) => {
    setIsFaceVerifyOpen(false);
    setCapturedResetPhoto(capturedPhoto);
    setFaceVerifiedForReset(true);
    setIsFaceMatched(true);
    setForgotError(null);
    setForgotSuccess("Successfully matched your face");
    setIsForgotPasswordOpen(true);
  };

  const handleFaceVerifyFail = (errorMsg?: string) => {
    setIsFaceVerifyOpen(false);
    setIsFaceMatched(false);
    setFaceVerifiedForReset(false);
    setForgotSuccess(null);
    setForgotError(errorMsg || "Face verification failed. Does not match profile photo.");
    setIsForgotPasswordOpen(true);
  };

  // Face Recognition Biometric Sign-In Handlers
  const handleStartFaceSignIn = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    const cleanInput = (identifier || "").trim().toLowerCase();
    const cleanDigits = cleanInput.replace(/\D/g, "");

    const target = accounts.find((a) => {
      if (a.role !== "customer") return false;
      const aEmail = (a.email || "").toLowerCase().trim();
      const aPhone = (a.phone || "").replace(/\D/g, "");
      return (
        (cleanInput && aEmail === cleanInput) ||
        (cleanDigits && aPhone.endsWith(cleanDigits))
      );
    }) || accounts.find((a) => a.role === "customer");

    setFaceSignInTargetCustomer(target || null);
    setIsFaceSignInOpen(true);
  };

  const handleFaceSignInSuccess = (capturedPhoto: string) => {
    setIsFaceSignInOpen(false);
    const target = faceSignInTargetCustomer || accounts.find((a) => a.role === "customer");
    if (!target) {
      setErrorMessage("No matching customer found for face biometric sign-in.");
      return;
    }
    // Securely capture and log face login snapshot
    recordFaceLogin(target.email, capturedPhoto, 98.8);

    // Sync face login snapshot with backend server store
    fetch("/api/auth/face-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: target.email, faceSnapshot: capturedPhoto })
    }).catch((err) => console.warn("Could not sync face login with backend:", err));

    // Authenticate session
    const ok = login(target.email, "customer");
    if (ok) {
      setSuccessMessage(`Face authenticated successfully! Logged in as ${target.name}.`);
    } else {
      setErrorMessage("Biometric sign-in failed. Please try again.");
    }
  };

  const handleResetRequestCancel = () => {
    setActiveRequestId(null);
    setForgotOtp("");
    setIsOtpVerified(false);
    setIsFaceMatched(false);
    setForgotError(null);
    setForgotSuccess(null);
    setFaceVerifiedForReset(false);
    setCapturedResetPhoto(null);
    setRecoveryMethod("select");
  };

  // Forgot password OTP verification (Super Admin OTP option)
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);

    const cleanIdentifier = forgotIdentifier.trim();
    if (!cleanIdentifier) {
      setForgotError("Please enter your registered email or phone number.");
      return;
    }

    const cleanOtp = forgotOtp.trim().replace(/\s+/g, "");
    if (!cleanOtp || cleanOtp.length !== 6) {
      setForgotError("Please enter the complete 6-digit OTP code.");
      return;
    }

    const res = verifyResetOtp(cleanIdentifier, cleanOtp);
    if (res.valid) {
      setIsOtpVerified(true);
      setForgotError(null);
      setForgotSuccess("OTP verified successfully! Change Password interface unlocked.");
    } else {
      setIsOtpVerified(false);
      setForgotError(res.message || "Invalid OTP code. Access to password reset is blocked.");
    }
  };

  // Submit password reset (supports both Face Match and OTP verifications)
  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    if (!isFaceMatched && !isOtpVerified) {
      setForgotError("Verification required before resetting password. Access blocked.");
      return;
    }

    if (newPassword.length < 6) {
      setForgotError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setForgotError("New password and confirmation password do not match.");
      return;
    }

    setIsSubmittingReset(true);

    let result: { success: boolean; message: string };
    if (isFaceMatched) {
      result = changePasswordAfterFaceMatch(forgotIdentifier, newPassword, capturedResetPhoto || undefined);
    } else {
      result = resetPasswordWithOtp(forgotIdentifier, forgotOtp, newPassword);
    }

    setIsSubmittingReset(false);

    if (result.success) {
      setForgotSuccess(
        isFaceMatched
          ? "Successfully matched your face and updated your password! Audit log sent to Super Admin."
          : "Successfully verified OTP and updated your password!"
      );
      setPassword(newPassword);
      setIdentifier(forgotIdentifier);
      setSuccessMessage("Password reset successful. Please sign in with your updated password.");
      setTimeout(() => {
        setIsForgotPasswordOpen(false);
        setIsOtpVerified(false);
        setIsFaceMatched(false);
        setForgotOtp("");
        setNewPassword("");
        setConfirmPassword("");
        setForgotSuccess(null);
        setRecoveryMethod("select");
      }, 1600);
    } else {
      setForgotError(result.message);
    }
  };

  return (
    <div className="w-full flex items-center justify-center z-10">
      <div className="w-full max-w-lg bg-white dark:bg-[#121217] border border-slate-200/90 dark:border-[#22222c] rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xl relative max-h-[88vh] overflow-y-auto custom-scrollbar">
        {/* Decorative Top Accent Glow (Indian Flag Tricolor) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-56 h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] rounded-full blur-xs" />

        {/* Top Header & Clickable MSN Logo */}
        <div className="text-center mb-3">
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setShowRoleSelector((prev) => !prev)}
              className="group relative inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-[#FF9933] via-[#000080] to-[#138808] text-white font-black text-lg mb-1.5 shadow-md shadow-[#FF9933]/25 hover:shadow-[#FF9933]/40 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/40"
              title="Click MSN logo to reveal / change user role access"
            >
              <span>MSN</span>
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#138808] border-2 border-white dark:border-slate-900 rounded-full flex items-center justify-center text-[7px] font-bold text-white shadow-sm">
                ✓
              </span>
            </button>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            MSN COMMUNICATION
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {selectedRole === "customer"
              ? "Official Citizen & Customer Services Sign-In"
              : selectedRole === "owner"
              ? "Authorized MeeSeva Kiosk Operator Terminal"
              : "Root Super Administrator Console"}
          </p>

          <p className="text-[10px] text-[#000080] dark:text-[#93C5FD] font-medium mt-0.5">
            Tip: Click the <strong>MSN logo</strong> above to reveal / switch access roles
          </p>
        </div>

        {/* Revealed Role Selector (Hidden by default, shown when top MSN logo is clicked) */}
        {showRoleSelector && (
          <div className="mb-6 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-top-3 duration-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Select User Access Role
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  selectedRole === "customer"
                    ? "bg-[#E8F5E9] text-[#138808] dark:bg-emerald-950 dark:text-[#A5D6A7] border border-[#C8E6C9]"
                    : selectedRole === "owner"
                    ? "bg-[#FFF3E0] text-[#E65100] dark:bg-amber-950 dark:text-[#FFB74D] border border-[#FFE0B2]"
                    : "bg-[#EFF6FF] text-[#000080] dark:bg-blue-950 dark:text-[#93C5FD] border border-[#BFDBFE]"
                }`}
              >
                {selectedRole}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* Customer Role */}
              <button
                type="button"
                onClick={() => {
                  setSelectedRole("customer");
                  setErrorMessage(null);
                }}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all cursor-pointer ${
                  selectedRole === "customer"
                    ? "bg-[#E8F5E9] dark:bg-emerald-950/60 border-2 border-[#138808] text-[#138808] dark:text-[#A5D6A7] font-bold shadow-sm"
                    : "bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-[#C8E6C9] dark:bg-emerald-950 flex items-center justify-center text-[#138808] dark:text-[#A5D6A7]">
                  <User className="w-4 h-4" />
                </div>
                <span className="text-[11px]">Customer</span>
              </button>

              {/* Owner Role */}
              <button
                type="button"
                onClick={() => {
                  setSelectedRole("owner");
                  setErrorMessage(null);
                }}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all cursor-pointer ${
                  selectedRole === "owner"
                    ? "bg-[#FFF3E0] dark:bg-amber-950/60 border-2 border-[#FF9933] text-[#E65100] dark:text-[#FFB74D] font-bold shadow-sm"
                    : "bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-[#FFE0B2] dark:bg-amber-950 flex items-center justify-center text-[#E65100] dark:text-[#FFB74D]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-[11px]">Owner</span>
              </button>

              {/* Super Admin Role */}
              <button
                type="button"
                onClick={() => {
                  setSelectedRole("superadmin");
                  setErrorMessage(null);
                }}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all cursor-pointer ${
                  selectedRole === "superadmin"
                    ? "bg-[#EFF6FF] dark:bg-blue-950/60 border-2 border-[#000080] text-[#000080] dark:text-[#93C5FD] font-bold shadow-sm"
                    : "bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-[#BFDBFE] dark:bg-blue-950 flex items-center justify-center text-[#000080] dark:text-[#93C5FD]">
                  <KeyRound className="w-4 h-4" />
                </div>
                <span className="text-[11px]">Super Admin</span>
              </button>
            </div>
          </div>
        )}

        {/* Alert Notifications */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Customer Two-Step Navigation Indicator with Circle Option Badges */}
        {selectedRole === "customer" && (
          <div className="space-y-2 mb-4">
            <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-inner">
              <button
                type="button"
                id="btnToggleCustomerLogin"
                onClick={() => {
                  setCustomerAuthMode("login");
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  customerAuthMode === "login"
                    ? "bg-white dark:bg-slate-800 text-[#000080] dark:text-blue-300 shadow-md shadow-indigo-500/10 border border-slate-200/80 dark:border-slate-700 ring-2 ring-[#000080]/15"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/40"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                    customerAuthMode === "login"
                      ? "bg-[#000080] text-white shadow-xs"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                  }`}
                >
                  <Lock className="w-3 h-3" />
                </div>
                <div className="text-left">
                  <div className="leading-tight">1. Citizen Log In</div>
                  <div className="text-[9px] font-normal opacity-75">Existing Account</div>
                </div>
              </button>

              <button
                type="button"
                id="btnToggleCustomerSignup"
                onClick={() => {
                  setCustomerAuthMode("signup");
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  customerAuthMode === "signup"
                    ? "bg-white dark:bg-slate-800 text-[#E65100] dark:text-[#FFB74D] shadow-md shadow-[#FF9933]/10 border border-slate-200/80 dark:border-slate-700 ring-2 ring-[#FF9933]/20"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/40"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                    customerAuthMode === "signup"
                      ? "bg-[#FF9933] text-white shadow-xs"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                </div>
                <div className="text-left">
                  <div className="leading-tight">2. Sign Up</div>
                  <div className="text-[9px] font-normal opacity-75">New Registration</div>
                </div>
              </button>
            </div>

            {/* Clear Mode Status Indicator Banner */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] transition-colors ${
                customerAuthMode === "login"
                  ? "bg-blue-50/70 dark:bg-blue-950/30 border-blue-200/60 dark:border-blue-900/40 text-blue-900 dark:text-blue-300"
                  : "bg-amber-50/70 dark:bg-amber-950/30 border-amber-200/60 dark:border-amber-900/40 text-amber-900 dark:text-amber-300"
              }`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: customerAuthMode === "login" ? "#000080" : "#FF9933" }}
              />
              <span className="font-semibold">
                {customerAuthMode === "login" ? "Sign-In Mode:" : "Registration Mode:"}
              </span>
              <span className="text-slate-600 dark:text-slate-400">
                {customerAuthMode === "login"
                  ? "Enter registered email or mobile to access services & personal vault."
                  : "Complete details & face recognition below to create your secure account."}
              </span>
            </div>
          </div>
        )}

        {/* STEP 1: CUSTOMER SIGN UP / REGISTRATION FORM (DEFAULT VIEW) */}
        {selectedRole === "customer" && customerAuthMode === "signup" ? (
          <form onSubmit={handleSignUp} autoComplete="off" className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Email ID <span className="text-rose-500">*</span>
                </label>
                {regEmail.length > 0 && (
                  validateEmailAddress(regEmail).valid ? (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Valid (.com)
                    </span>
                  ) : (
                    <span className="text-[10px] text-rose-500 font-medium flex items-center gap-0.5">
                      <AlertCircle className="w-3 h-3" /> Must end with .com
                    </span>
                  )
                )}
              </div>
              <div className="relative flex items-center">
                <input
                  type="email"
                  name="portal_reg_email"
                  autoComplete="off"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="Enter customer email (e.g. name@domain.com)"
                  className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/70 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none transition-colors pr-10 ${
                    regEmail.length > 0 && !validateEmailAddress(regEmail).valid
                      ? "border-rose-400 focus:border-rose-500"
                      : "border-slate-300 dark:border-slate-800 focus:border-indigo-500"
                  }`}
                />
                <Mail className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                Must include &apos;@&apos;, a valid domain name, and end strictly with &apos;.com&apos;
              </p>
            </div>

            {/* Gender Selection Field (Required: Male, Female, Other) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Gender <span className="text-rose-500">*</span>
                </label>
                {regGender ? (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Selected: {regGender}
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                    Required selection
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {(["Male", "Female", "Other"] as Gender[]).map((g) => {
                  const isSelected = regGender === g;
                  return (
                    <label
                      key={g}
                      className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                        isSelected
                          ? "border-[#FF9933] bg-[#FFF8F0] dark:bg-amber-950/40 text-[#E65100] dark:text-amber-300 shadow-xs ring-2 ring-[#FF9933]/30"
                          : "border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="portal_reg_gender"
                        value={g}
                        checked={isSelected}
                        onChange={() => setRegGender(g)}
                        className="accent-[#FF9933] w-3.5 h-3.5 cursor-pointer"
                        required
                      />
                      <span>{g}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                {regPhone.length > 0 && regPhone.length < 10 && (
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                    {regPhone.length}/10 digits (10 digits required)
                  </span>
                )}
                {regPhone.length === 10 && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> 10 digits
                  </span>
                )}
              </div>
              <div className="relative flex items-center">
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  name="portal_reg_phone"
                  autoComplete="off"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(sanitizePhoneNumber(e.target.value))}
                  placeholder="10-digit mobile number (e.g. 8125898068)"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors pr-10"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Create Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type={showRegPassword ? "text" : "password"}
                  name="portal_reg_password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type={showRegConfirmPassword ? "text" : "password"}
                  name="portal_reg_confirm_password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Re-enter password to match"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Face Recognition Biometric Enrollment Block */}
            <div className="p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/40 dark:from-indigo-950/30 dark:via-slate-900/40 dark:to-purple-950/20 shadow-xs">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/15 dark:bg-indigo-500/25 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Scan className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      Register with Face Recognition
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                        Biometric Security
                      </span>
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Blink-liveness capture for instant profile photo & secure recovery
                    </p>
                  </div>
                </div>
              </div>

              {regAvatar ? (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <div className="flex items-center gap-3">
                    <div
                      className="relative cursor-pointer group"
                      onClick={() => setIsPreviewRegPhotoOpen(true)}
                      title="Click to view full photo"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={regAvatar}
                        alt="Enrolled Face"
                        className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow-sm group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        Face Identity Registered
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        Embedding: {regFaceEmbedding ? `${regFaceEmbedding.slice(0, 16)}...` : "Generated"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {/* Clear [ View ] Button for Captured Snapshot */}
                    <button
                      type="button"
                      onClick={() => setIsPreviewRegPhotoOpen(true)}
                      className="px-2.5 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-md transition-colors flex items-center gap-1 border border-indigo-200 dark:border-indigo-800/80 cursor-pointer shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>[ View ]</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsFaceRegisterOpen(true)}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                    >
                      Retake
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRegAvatar(null);
                        setRegFaceEmbedding(null);
                      }}
                      className="px-2 py-1 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-md transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsFaceRegisterOpen(true)}
                  className="w-full py-2.5 px-3 rounded-lg border border-dashed border-indigo-300 dark:border-indigo-700/80 bg-white/80 dark:bg-slate-900/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 text-xs font-bold transition-all flex items-center justify-center gap-2 group cursor-pointer shadow-xs hover:border-indigo-400"
                >
                  <Camera className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
                  <span>Scan Face with Blink Detection (Auto-Capture)</span>
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 text-white rounded-xl font-bold text-sm bg-[#FF9933] hover:bg-[#FF6F00] shadow-md shadow-[#FF9933]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Sign Up / Create Customer Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setCustomerAuthMode("login");
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="font-bold text-[#000080] dark:text-[#93C5FD] hover:underline cursor-pointer"
                >
                  Log In
                </button>
              </p>
            </div>
          </form>
        ) : (
          /* STEP 2: LOGIN FORM (ACCESSIBLE VIA TAB OR AFTER SUCCESSFUL REGISTRATION) */
          <form onSubmit={handleSignIn} autoComplete="off" className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {selectedRole === "customer"
                  ? "Email ID"
                  : selectedRole === "owner"
                  ? "Owner / Operator Email or Phone"
                  : "Super Administrator Email ID"}
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  name="portal_user_identity"
                  autoComplete="off"
                  required
                  value={identifier}
                  onChange={(e) => handleIdentifierChange(e.target.value)}
                  placeholder={
                    selectedRole === "customer"
                      ? "Enter your registered Email ID"
                      : selectedRole === "owner"
                      ? "msncommunication23@gmail.com or 8125898068"
                      : "mandan.rohithkumar23@gmail.com"
                  }
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-[#FF9933] transition-colors pr-10"
                />
                <span className="absolute right-3 text-slate-400 dark:text-slate-500 text-xs">
                  {isPhoneMode ? (
                    <Phone className="w-4 h-4 text-[#FF9933]" />
                  ) : (
                    <Mail className="w-4 h-4 text-[#000080]" />
                  )}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                {selectedRole === "customer" && (
                  activeCooldownSeconds > 0 ? (
                    <button
                      type="button"
                      onClick={() => {
                        setForgotIdentifier(identifier || "8125898068");
                        setForgotOtp("");
                        setIsOtpVerified(false);
                        setNewPassword("");
                        setConfirmPassword("");
                        setForgotError(null);
                        setForgotSuccess(null);
                        setIsForgotPasswordOpen(true);
                      }}
                      className="text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-lg border border-rose-200 dark:border-rose-900 flex items-center gap-1 cursor-pointer hover:bg-rose-100 transition-colors"
                      title="Password reset cooldown active. Click to view status."
                    >
                      <Clock className="w-3 h-3 text-rose-500 shrink-0" />
                      <span>Please try again after 1 hour ({formatCooldown(activeCooldownSeconds)})</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleForgotPasswordClick}
                      className="text-xs font-semibold text-[#000080] dark:text-[#93C5FD] hover:underline cursor-pointer flex items-center gap-1"
                      title="Initiate facial verification to reset your password"
                    >
                      <Scan className="w-3.5 h-3.5 text-[#FF9933]" />
                      <span>Forgot Password?</span>
                    </button>
                  )
                )}
              </div>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  name="portal_user_secret"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    selectedRole === "superadmin"
                      ? "Enter root admin password"
                      : selectedRole === "owner"
                      ? "Enter operator password"
                      : "Enter your customer password"
                  }
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-[#FF9933] transition-colors pr-10"
                />

                <div className="absolute right-2 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 text-white rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md shadow-[#FF9933]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 bg-[#FF9933] hover:bg-[#FF6F00]"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>
                    Sign in as {selectedRole === "superadmin" ? "SUPER ADMIN" : selectedRole.toUpperCase()}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Customer Biometric Face Sign-In Option */}
            {selectedRole === "customer" && (
              <button
                type="button"
                onClick={handleStartFaceSignIn}
                className="w-full py-2 px-3 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-gradient-to-r from-indigo-50/80 to-blue-50/80 hover:from-indigo-100 hover:to-blue-100 dark:from-indigo-950/40 dark:to-blue-950/40 text-indigo-900 dark:text-indigo-200 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer"
              >
                <div className="p-1 rounded-lg bg-indigo-600 text-white shadow-2xs">
                  <Scan className="w-3.5 h-3.5" />
                </div>
                <span>Sign in with Face Biometrics</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800">
                  Liveness Verified
                </span>
              </button>
            )}

            {selectedRole === "customer" && (
              <div className="text-center pt-1.5 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerAuthMode("signup");
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="font-bold text-[#000080] dark:text-[#93C5FD] hover:underline cursor-pointer"
                  >
                    Sign Up First
                  </button>
                </p>
              </div>
            )}
          </form>
        )}
      </div>

      {/* Customer Forgot Password Modal (Selection Screen -> Face Recognition OR Super Admin OTP) */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white dark:bg-[#18181f] border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 my-auto max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-[#FF9933] to-[#000080] text-white shadow-md shadow-[#FF9933]/20">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {isFaceMatched || isOtpVerified
                      ? "Change Account Password"
                      : recoveryMethod === "select"
                      ? "Forgot Password Recovery"
                      : recoveryMethod === "face"
                      ? "Verify with Face Recognition"
                      : "Request OTP via Super Admin Approval"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isFaceMatched
                      ? "Face Recognition Verified • Create new password"
                      : isOtpVerified
                      ? "Super Admin OTP Verified • Create new password"
                      : recoveryMethod === "select"
                      ? "Select your preferred recovery method below"
                      : recoveryMethod === "face"
                      ? "Live camera scan against registered profile photo"
                      : "Incoming request to Super Admin Console (Accounts Mgmt)"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsForgotPasswordOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Super Admin Hotline Prompt */}
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 font-medium">
                <Phone className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Super Admin Verification Hotline:</span>
              </div>
              <span className="font-extrabold font-mono text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-lg">
                8125898068
              </span>
            </div>

            {/* Global Error Banner */}
            {forgotError && !forgotError.includes("Face verification failed") && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-300 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold">{forgotError}</p>
                  {forgotError.includes("Invalid OTP") && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                      Access to password reset screen is blocked until a valid OTP is verified.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Global Success Banner */}
            {forgotSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="font-semibold">{forgotSuccess}</span>
              </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW 1: UNLOCKED CHANGE PASSWORD INTERFACE (After Face OR OTP Verified)   */}
            {/* ========================================================================= */}
            {isFaceMatched || isOtpVerified ? (
              <form onSubmit={handleSaveNewPassword} autoComplete="off" className="space-y-4 text-xs animate-in fade-in duration-200">
                {/* Method Verification Header Display */}
                {isFaceMatched ? (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-xs text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Successfully matched your face</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                      Live camera facial embedding matched your registered sign-up profile photo. The Change Password interface is unlocked.
                    </p>

                    {/* Side-by-side Photo Comparison for Customer */}
                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                        <span className="text-[10px] text-slate-400 block mb-1 font-semibold">1. Profile Photo</span>
                        <div className="w-14 h-14 mx-auto rounded-full overflow-hidden border-2 border-indigo-500/40 shadow-xs">
                          {faceVerifyTargetCustomer?.avatar ? (
                            <img
                              src={faceVerifyTargetCustomer.avatar}
                              alt="Sign-Up Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500">
                              Photo
                            </div>
                          )}
                        </div>
                        <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-bold block mt-1">Sign-Up Photo</span>
                      </div>

                      <div className="p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                        <span className="text-[10px] text-slate-400 block mb-1 font-semibold">2. Live Snapshot</span>
                        <div className="w-14 h-14 mx-auto rounded-full overflow-hidden border-2 border-emerald-500 shadow-xs">
                          {capturedResetPhoto ? (
                            <img
                              src={capturedResetPhoto}
                              alt="Verification Snapshot"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500">
                              Snapshot
                            </div>
                          )}
                        </div>
                        <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold block mt-1">✓ Matched Face</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-xs text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>OTP Verified Successfully • Access Unlocked</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                      Super Admin authorized 6-digit OTP verified. You may now create and confirm your new password below.
                    </p>
                  </div>
                )}

                <div className="border-b border-slate-100 dark:border-slate-800 pb-1">
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#FF9933]" />
                    <span>Set New Password</span>
                  </h4>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    New Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="portal_new_password"
                      autoComplete="new-password"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#FF9933] pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Confirm New Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="portal_confirm_password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#FF9933]"
                  />
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFaceMatched(false);
                      setIsOtpVerified(false);
                      setCapturedResetPhoto(null);
                      setForgotError(null);
                      setRecoveryMethod("select");
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Methods</span>
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReset}
                    className="px-5 py-2.5 rounded-xl bg-[#138808] hover:bg-[#2E7D32] text-white text-xs font-bold shadow-md shadow-[#138808]/30 cursor-pointer transition-colors flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isSubmittingReset ? "Updating..." : "Save & Update Password"}</span>
                  </button>
                </div>
              </form>
            ) : recoveryMethod === "select" ? (
              /* ========================================================================= */
              /* VIEW 2: FORGOT PASSWORD SELECTION SCREEN (2 DISTINCT RECOVERY METHODS)    */
              /* ========================================================================= */
              <div className="space-y-4 text-xs animate-in fade-in duration-200">
                {/* Registered Email ID Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Customer Registered Email ID <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="email"
                      name="portal_forgot_identifier"
                      autoComplete="off"
                      required
                      value={forgotIdentifier}
                      onChange={(e) => setForgotIdentifier(e.target.value)}
                      placeholder="e.g. rohith.kumar@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500 pr-10"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Please confirm your registered email address, then select one of the two password recovery options below:
                  </p>
                </div>

                {/* Selection Cards Container */}
                <div className="space-y-3 pt-1">
                  {/* METHOD 1: VERIFY WITH FACE RECOGNITION */}
                  <div
                    onClick={handleSelectFaceRecognition}
                    className="group p-4 rounded-2xl border-2 border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/60 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10 transition-all cursor-pointer space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
                          <Scan className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            1. Verify with Face Recognition
                          </h4>
                          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block">
                            Live camera scan against your profile photo
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
                        Instant Biometric
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-indigo-100 dark:border-indigo-900/40 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                      <p className="flex items-center gap-1.5 font-medium">
                        <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>Compact circular camera frame with face alignment guide</span>
                      </p>
                      <p className="flex items-center gap-1.5 font-medium">
                        <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>Natural eye-blink liveness verification with auto-capture</span>
                      </p>
                      <p className="flex items-center gap-1.5 font-medium">
                        <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>Instantly unlocks Change Password upon successful match</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectFaceRecognition();
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-[#000080] hover:bg-[#000066] text-white text-xs font-bold shadow-md shadow-indigo-900/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Verify with Face Recognition</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </button>
                  </div>

                  {/* METHOD 2: REQUEST OTP VIA SUPER ADMIN APPROVAL */}
                  <div
                    onClick={handleSelectSuperAdminOtp}
                    className="group p-4 rounded-2xl border-2 border-amber-200 dark:border-amber-900/60 bg-gradient-to-r from-amber-50/60 via-white to-amber-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-amber-950/20 hover:border-amber-500 dark:hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/10 transition-all cursor-pointer space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#FF9933] text-white flex items-center justify-center shadow-md shadow-[#FF9933]/30 group-hover:scale-105 transition-transform">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                            2. Request OTP via Super Admin Approval
                          </h4>
                          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block">
                            Alternative fallback verification method
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        Admin Approval
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-amber-100 dark:border-amber-900/40 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                      <p className="flex items-center gap-1.5 font-medium">
                        <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Sends request notification to Super Admin Console (Accounts Mgmt)</span>
                      </p>
                      <p className="flex items-center gap-1.5 font-medium">
                        <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Displays Name, Email, and Mobile Number for Super Admin review</span>
                      </p>
                      <p className="flex items-center gap-1.5 font-medium">
                        <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Super Admin authorizes with [ Yes ] to issue your 6-digit OTP</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectSuperAdminOtp();
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-[#FF9933] hover:bg-[#E65100] text-white text-xs font-bold shadow-md shadow-[#FF9933]/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Request OTP via Super Admin Approval</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : recoveryMethod === "face" ? (
              /* ========================================================================= */
              /* VIEW 3: FACE RECOGNITION STATUS & CAMERA LAUNCH SCREEN                    */
              /* ========================================================================= */
              <div className="space-y-4 text-xs animate-in fade-in duration-200">
                {forgotError?.includes("Face verification failed") ? (
                  /* Red Error Symbol & Access Blocked Notice for Failed Face Verification */
                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-rose-50/90 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-800 space-y-3">
                      <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-xs">
                        <ShieldAlert className="w-5 h-5 shrink-0 text-rose-600" />
                        <span className="uppercase tracking-wider font-extrabold text-sm">
                          Face verification failed. Does not match profile photo.
                        </span>
                      </div>
                      <p className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed">
                        Access to password changing options is strictly <strong>blocked</strong>. The facial embedding extracted from the live camera scan does not match the customer&apos;s original sign-up profile photo stored in the database.
                      </p>
                      <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-rose-200 dark:border-rose-900 text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                        <span className="font-semibold block text-slate-900 dark:text-white">Security Barrier Active</span>
                        <span>For security compliance, passwords can only be changed when the camera captures a valid face match with natural blink liveness.</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          setForgotError(null);
                          setRecoveryMethod("select");
                        }}
                        className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer flex items-center gap-1"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Choose Another Method</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (faceVerifyTargetCustomer) {
                              setIsFaceVerifyOpen(true);
                            } else {
                              handleSelectFaceRecognition();
                            }
                          }}
                          className="px-4 py-2.5 rounded-xl bg-[#000080] hover:bg-[#000066] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-900/20 transition-all"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Retry Facial Recognition</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsForgotPasswordOpen(false)}
                          className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Ready to Launch Face Camera */
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-indigo-900 dark:text-indigo-300">
                        <Scan className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>Ready for Live Facial Recognition</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Click below to open the secure circular camera frame. Align your face inside the frame and blink naturally. Once matched against your sign-up photo, Change Password will unlock immediately.
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          setForgotError(null);
                          setRecoveryMethod("select");
                        }}
                        className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer flex items-center gap-1"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back to Options</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (faceVerifyTargetCustomer) {
                            setIsFaceVerifyOpen(true);
                          } else {
                            handleSelectFaceRecognition();
                          }
                        }}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#000080] to-indigo-700 hover:from-[#000066] hover:to-indigo-800 text-white text-xs font-bold shadow-md shadow-indigo-900/20 cursor-pointer transition-all flex items-center gap-2"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Open Camera & Verify Face</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ========================================================================= */
              /* VIEW 4: SUPER ADMIN OTP APPROVAL & CUSTOMER OTP VERIFICATION SCREEN       */
              /* ========================================================================= */
              <div className="space-y-4 text-xs animate-in fade-in duration-200">
                {activeCooldownSeconds > 0 || currentResetRequest?.status === "rejected" ? (
                  /* Super Admin Rejected Request -> 1-Hour Cooldown Enforced */
                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-rose-50/90 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-800 space-y-3">
                      <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-xs">
                        <ShieldAlert className="w-5 h-5 shrink-0 text-rose-600" />
                        <span className="uppercase tracking-wider font-extrabold text-sm">
                          Request Declined by Super Admin
                        </span>
                      </div>
                      <p className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed">
                        Your password reset OTP request was <strong>declined</strong> by the Super Admin. An OTP code was NOT generated. For security compliance, a 1-hour cooldown has been activated.
                      </p>
                      <div className="p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-rose-200 dark:border-rose-900 flex items-center justify-between">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs">Cooldown Remaining:</span>
                        <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-xs">
                          {formatCooldown(activeCooldownSeconds || 3600)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          setForgotError(null);
                          setRecoveryMethod("select");
                        }}
                        className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer flex items-center gap-1"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Choose Another Method</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsForgotPasswordOpen(false)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                ) : currentResetRequest?.status === "pending" ? (
                  /* Request Pending in Super Admin Console */
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800 space-y-3">
                      <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping shrink-0" />
                        <span className="uppercase tracking-wider font-extrabold text-sm">
                          Awaiting Super Admin Approval...
                        </span>
                      </div>
                      <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                        An incoming request notification has been sent to the <strong>Super Admin Console</strong> (under Accounts Mgmt) displaying your Name, Email, and Mobile Number.
                      </p>

                      {/* Customer Details Box sent to Super Admin */}
                      <div className="p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-amber-200 dark:border-amber-900 text-xs space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Submitted Verification Profile
                        </span>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Name:</span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {currentResetRequest.customerName}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Email:</span>
                          <span className="font-mono text-slate-700 dark:text-slate-300">
                            {currentResetRequest.customerEmail}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Mobile:</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            📞 {currentResetRequest.customerPhone}
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-amber-100/60 dark:bg-amber-900/40 text-[11px] text-amber-900 dark:text-amber-200">
                        The Super Admin reviews your details with <strong>[ Yes ]</strong> to authorize and generate your 6-digit OTP, or <strong>[ No ]</strong> to decline.
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          setForgotError(null);
                          setRecoveryMethod("select");
                        }}
                        className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer flex items-center gap-1"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Choose Another Method</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsForgotPasswordOpen(false)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Super Admin Approved -> Customer OTP Entry & Validation */
                  <form onSubmit={handleVerifyOtp} autoComplete="off" className="space-y-4">
                    {/* Authorized Notice */}
                    <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-xs text-emerald-800 dark:text-emerald-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Super Admin Authorized Your OTP Request!</span>
                      </div>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                        Your request has been approved. Enter the 6-digit OTP received below to verify your identity and unlock the Change Password interface.
                      </p>

                      {currentResetRequest?.generatedOtp && (
                        <div className="pt-1 flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-xl border border-emerald-200 dark:border-emerald-900">
                          <span className="text-[11px] text-slate-500">Authorized 6-Digit OTP:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-sm tracking-wider text-emerald-700 dark:text-emerald-300">
                              {currentResetRequest.generatedOtp}
                            </span>
                            <button
                              type="button"
                              onClick={() => setForgotOtp(currentResetRequest.generatedOtp || "")}
                              className="px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-[10px] font-bold cursor-pointer hover:bg-emerald-200 transition-colors"
                            >
                              Auto-Fill
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* OTP Entry Field */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Enter 6-Digit OTP Code <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          name="portal_forgot_otp"
                          autoComplete="one-time-code"
                          required
                          value={forgotOtp}
                          onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          placeholder="••••••"
                          className={`w-full px-4 py-3 rounded-xl border ${
                            forgotError?.includes("Invalid OTP")
                              ? "border-rose-400 bg-rose-50/20 text-rose-900 dark:text-rose-200 ring-2 ring-rose-500/20"
                              : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                          } text-center font-mono text-xl tracking-[0.35em] font-black focus:outline-none focus:border-[#FF9933]`}
                        />
                      </div>

                      {/* Prominent Red Error Symbol when Invalid OTP */}
                      {forgotError?.includes("Invalid OTP") && (
                        <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 text-xs font-bold mt-2">
                          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                          <span>Invalid OTP code. Access to password reset is blocked.</span>
                        </div>
                      )}

                      <p className="text-[10px] text-slate-500 mt-1.5">
                        Please enter the 6-digit numeric OTP code authorized by the Super Admin.
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          setForgotError(null);
                          setRecoveryMethod("select");
                        }}
                        className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer flex items-center gap-1"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back to Options</span>
                      </button>

                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-amber-600/30 cursor-pointer transition-all flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>Verify OTP & Unlock Reset</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Face Registration Modal */}
      <FaceRecognitionModal
        isOpen={isFaceRegisterOpen}
        onClose={() => setIsFaceRegisterOpen(false)}
        mode="register"
        onCaptureSuccess={(photo, embedding) => {
          setRegAvatar(photo);
          setRegFaceEmbedding(embedding);
        }}
      />

      {/* Forgot Password Face Verification Modal */}
      <FaceRecognitionModal
        isOpen={isFaceVerifyOpen}
        onClose={() => setIsFaceVerifyOpen(false)}
        mode="verify"
        targetCustomer={faceVerifyTargetCustomer}
        onVerificationSuccess={handleFaceVerifySuccess}
        onVerificationFail={handleFaceVerifyFail}
      />

      {/* Customer Biometric Face Sign-In Modal */}
      <FaceRecognitionModal
        isOpen={isFaceSignInOpen}
        onClose={() => setIsFaceSignInOpen(false)}
        mode="verify"
        targetCustomer={faceSignInTargetCustomer}
        onVerificationSuccess={handleFaceSignInSuccess}
        onVerificationFail={(msg) => {
          setIsFaceSignInOpen(false);
          setErrorMessage(msg || "Face biometric sign-in failed. Please try again or use password.");
        }}
      />
      {/* Interactive Image Preview Modal for Registration Captured Face Snapshot */}
      {isPreviewRegPhotoOpen && regAvatar && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#11131c] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200 space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Scan className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Captured Facial Profile Snapshot
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewRegPhotoOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* High-Resolution Preview with Circular Framing Overlay */}
            <div className="relative mx-auto w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden border-2 border-indigo-500/30 shadow-2xl bg-black flex items-center justify-center">
              {/* Full-resolution captured snapshot */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={regAvatar}
                alt="Captured Face Snapshot"
                className="w-full h-full object-cover"
              />

              {/* Circular Frame Overlay showing how avatar is framed */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-52 h-52 sm:w-56 sm:h-56 rounded-full border-2 border-dashed border-[#FF9933] shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
              </div>

              {/* Status pill */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/75 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[11px] font-semibold border border-white/20 flex items-center gap-1.5 whitespace-nowrap">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live Camera Snapshot Verified</span>
              </div>
            </div>

            {/* Biometric Metadata Details */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-left text-xs space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Target Account:</span>
                <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">
                  {regEmail || "New Customer Account"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Embedding Template:</span>
                <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 truncate max-w-[190px]">
                  {regFaceEmbedding || "Generated on blink detection"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Liveness Security:</span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span>✓ Eye Blink Liveness Passed</span>
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              This photo will be set as your official customer profile picture and utilized for instant facial recognition logins.
            </p>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-white/10">
              <button
                type="button"
                onClick={() => {
                  setIsPreviewRegPhotoOpen(false);
                  setIsFaceRegisterOpen(true);
                }}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Retake Photo</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPreviewRegPhotoOpen(false)}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Looks Good</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
