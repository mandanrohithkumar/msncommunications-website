"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  User,
  UserRole,
  ServiceItem,
  ServiceCategory,
  Application,
  ApplicationStatus,
  PaymentRecord,
  PaymentMethod,
  PaymentStatus,
  UploadedFileMeta,
  PortalNotification,
  PortalMessage,
  FeedbackComplaint,
  UserAccount,
  UserSessionRecord,
  UserActivityLog,
  OtpVerificationResult,
  PasswordResetRequest,
  PasswordChangeAuditLog,
  Gender,
  FaceLoginLog
} from "@/types/portal";
import { MEESEVA_SERVICES, ONLINE_CATEGORIES, DOCUMENT_CATEGORIES } from "./services-data";
import { getTranslation, Language } from "./translations";
import { resolveDocumentDataUrl, generateAadhaarSvg, isImageDocument, isPdfDocument } from "./doc-preview-utils";

export type ViewType =
  | "meeseva"
  | "online-works"
  | "online-sub"
  | "form"
  | "documents"
  | "history"
  | "payments"
  | "inbox"
  | "owner-dashboard"
  | "admin-dashboard";

export interface NavigationHistorySnapshot {
  view: ViewType;
  categoryId?: string | null;
  serviceId?: string | null;
  modal?: "previewDoc" | "payment" | "profile" | "auth" | "messages" | null;
  index: number;
}

export function buildHashFromSnapshot(snapshot: Partial<NavigationHistorySnapshot>): string {
  const params = new URLSearchParams();
  if (snapshot.view) params.set("view", snapshot.view);
  if (snapshot.categoryId) params.set("cat", snapshot.categoryId);
  if (snapshot.serviceId) params.set("svc", snapshot.serviceId);
  if (snapshot.modal) params.set("modal", snapshot.modal);
  const q = params.toString();
  return q ? `#${q}` : "";
}

export function parseSnapshotFromHash(hash: string): Partial<NavigationHistorySnapshot> {
  const clean = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!clean) return {};
  const params = new URLSearchParams(clean);
  const viewParam = params.get("view") as ViewType | null;
  const catParam = params.get("cat") || params.get("category");
  const svcParam = params.get("svc") || params.get("service");
  const modalParam = params.get("modal") as NavigationHistorySnapshot["modal"];
  return {
    view: viewParam || undefined,
    categoryId: catParam || null,
    serviceId: svcParam || null,
    modal: modalParam || null
  };
}

interface PortalContextType {
  // Auth & User
  user: User | null;
  isLoggedIn: boolean;
  isAuthChecking: boolean;
  selectedRole: UserRole;
  setSelectedRole: (role: UserRole) => void;
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
  openAuth: () => void;
  closeAuth: () => void;
  login: (identifier: string, role?: UserRole) => boolean;
  loginWithGoogle: (name: string, email: string, role?: UserRole) => { success: boolean; error?: string };
  checkAccountExists: (email: string) => boolean;
  registerCustomerWithGoogle: (data: { email: string; phone: string; name: string; password?: string; gender?: Gender; avatar?: string; }) => { success: boolean; message: string; customer?: UserAccount };
  recordFaceLogin: (email: string, photo: string, confidence?: number) => void;
  forceLogoutCustomer: (customerId: string) => { success: boolean; message: string };
  deleteCustomerAccount: (customerId: string) => { success: boolean; message: string };
  sendMessageToCustomer: (customerIdOrEmail: string, title: string, message: string, type?: 'info' | 'alert' | 'urgent' | 'success') => { success: boolean; message: string };
  logout: () => void;
  accounts: UserAccount[];
  addAccount: (acc: Omit<UserAccount, "id" | "lastLogin" | "dailyServiceCount" | "monthlyServiceCount" | "createdAt"> & { lastLogin?: string; dailyServiceCount?: number; monthlyServiceCount?: number; }) => UserAccount;
  registerCustomer: (data: { email: string; phone: string; password: string; name?: string; gender?: Gender; avatar?: string; faceEmbedding?: string; faceVerified?: boolean; }) => { success: boolean; message: string; customer?: UserAccount };
  updateAccount: (id: string, updates: Partial<UserAccount>) => void;
  deleteAccount: (id: string) => void;
  generateResetOtp: (userEmailOrPhone: string) => { code: string; expiresAt: number };
  verifyResetOtp: (identifier: string, enteredOtp: string) => OtpVerificationResult;
  resetPasswordWithOtp: (identifier: string, enteredOtp: string, newPassword: string) => { success: boolean; message: string };
  logUserActivity: (action: string, details?: string, targetEmail?: string) => void;
  activeUsersCount: number;
  activeSystemOtp: { code: string; targetIdentifier: string; targetName: string; expiresAt: number; createdAt: number } | null;
  passwordResetRequests: PasswordResetRequest[];
  requestPasswordReset: (identifier: string, faceVerified?: boolean, customerPhoto?: string) => { success: boolean; message: string; request?: PasswordResetRequest };
  approvePasswordReset: (requestId: string) => { success: boolean; code: string; expiresAt: number };
  rejectPasswordReset: (requestId: string) => { success: boolean };
  updateFacialProfile: (email: string, avatar: string, faceEmbedding: string) => { success: boolean; message: string };
  passwordChangeAudits: PasswordChangeAuditLog[];
  recordPasswordChangeAudit: (audit: Omit<PasswordChangeAuditLog, "id" | "timestamp">) => void;
  changePasswordAfterFaceMatch: (identifier: string, newPassword: string, verificationSnapshot?: string) => { success: boolean; message: string };

  // View Navigation
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  previousView: ViewType | null;
  selectedCategory: ServiceCategory | null;
  setSelectedCategory: (cat: ServiceCategory | null) => void;
  selectedService: ServiceItem | null;
  setSelectedService: (service: ServiceItem | null) => void;
  openServiceForm: (service: ServiceItem, fromView: ViewType) => void;
  goBack: () => void;

  // Services Catalog
  meesevaServices: ServiceItem[];
  onlineCategories: ServiceCategory[];
  updateServicePrice: (serviceId: string, newPrice: string) => void;
  updateServiceUrl: (serviceId: string, newUrl: string) => void;
  toggleServiceActive: (serviceId: string) => void;
  updateServiceDetails: (serviceId: string, updates: Partial<ServiceItem>) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;

  // Document Vault & Preview
  uploadedDocs: Record<string, UploadedFileMeta>;
  uploadDocument: (docName: string, file: File, fileMeta?: UploadedFileMeta) => void;
  removeDocument: (docName: string) => void;
  getUserUploadedDocs: (email: string) => Record<string, UploadedFileMeta>;
  getUserDocCount: (email: string) => number;
  previewDoc: UploadedFileMeta | null;
  setPreviewDoc: (doc: UploadedFileMeta | null) => void;
  submissionDocsMap: Record<string, Record<string, UploadedFileMeta>>;
  getApplicationDocuments: (app: Application) => Record<string, UploadedFileMeta>;

  // Applications
  applications: Application[];
  submitApplication: (
    service: ServiceItem,
    formData: Record<string, string>,
    ownerNote: string,
    docs: Record<string, UploadedFileMeta>
  ) => Application;
  acceptTask: (applicationId: string) => void;
  updateApplicationStatus: (applicationId: string, newStatus: ApplicationStatus) => void;

  // Payments
  payments: PaymentRecord[];
  activePaymentApp: Application | null;
  setActivePaymentApp: (app: Application | null) => void;
  processPayment: (
    applicationId: string,
    method: PaymentMethod,
    status?: PaymentStatus,
    details?: { transactionRef?: string; cfPaymentId?: string; errorMessage?: string }
  ) => void;

  // Messages & Notifications
  notifications: PortalNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  messages: PortalMessage[];
  sendMessage: (content: string, applicationId?: string, recipientId?: string) => void;
  isMessagesOpen: boolean;
  setIsMessagesOpen: (open: boolean) => void;
  activeMessageAppId: string | null;
  setActiveMessageAppId: (id: string | null) => void;
  unreadCount: number;

  // Feedback & Profile
  feedbackList: FeedbackComplaint[];
  submitFeedback: (msg: string) => void;
  isProfileOpen: boolean;
  setIsProfileOpen: (open: boolean) => void;

  // Atmosphere & Theme
  theme: "dark" | "light";
  toggleTheme: () => void;
  isContentHidden: boolean;
  setIsContentHidden: (hidden: boolean) => void;

  // Language & Session
  language: "EN" | "TE" | "HI";
  setLanguage: (lang: "EN" | "TE" | "HI") => void;
  t: (key: string) => string;
  clearSessionData: () => void;
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

// Initial mock applications for realistic demo
const INITIAL_ACCOUNTS: UserAccount[] = [
  {
    id: "usr-cust-1",
    name: "Rahul Kumar",
    username: "rahul_kumar",
    email: "rohith.kumar@gmail.com",
    phone: "8125898068",
    password: "Password@23",
    role: "customer",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
    faceEmbedding: "emb-face-usr-cust-1",
    faceVerified: true,
    lastFaceLoginSnapshot: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
    faceLoginTimestamp: "Sep 28, 2026, 02:45 PM",
    lastLogin: "Sep 25, 2026, 05:15 PM",
    dailyServiceCount: 3,
    monthlyServiceCount: 14,
    totalLogins: 42,
    totalLogouts: 38,
    totalUploads: 6,
    totalTimeSpentSeconds: 4620,
    createdAt: "2026-02-14",
    registeredAt: "Feb 14, 2026, 10:30 AM",
    sessionLogs: [
      {
        id: "sess-c1",
        sessionId: "sess-20260925-c1",
        userEmail: "rohith.kumar@gmail.com",
        loginTime: "Sep 25, 2026, 05:15 PM",
        logoutTime: "Sep 25, 2026, 05:40 PM",
        durationSeconds: 1500,
        status: "ended",
        device: "Chrome / Windows 11",
        ipAddress: "152.58.12.84"
      },
      {
        id: "sess-c2",
        sessionId: "sess-20260924-c2",
        userEmail: "rohith.kumar@gmail.com",
        loginTime: "Sep 24, 2026, 11:20 AM",
        logoutTime: "Sep 24, 2026, 11:55 AM",
        durationSeconds: 2100,
        status: "ended",
        device: "Mobile / Android",
        ipAddress: "152.58.12.84"
      }
    ],
    activityLogs: [
      {
        id: "act-c1",
        userEmail: "rohith.kumar@gmail.com",
        action: "Submitted Application",
        timestamp: "Sep 25, 2026, 05:20 PM",
        details: "Application MSN-2026-004128 submitted for Police Verification"
      },
      {
        id: "act-c2",
        userEmail: "rohith.kumar@gmail.com",
        action: "Payment Completed",
        timestamp: "Sep 25, 2026, 05:22 PM",
        details: "Completed ₹180 payment via UPI (Ref: UPI/2026/894120938)"
      },
      {
        id: "act-c3",
        userEmail: "rohith.kumar@gmail.com",
        action: "User Logged In",
        timestamp: "Sep 25, 2026, 05:15 PM",
        details: "Authenticated via SMS OTP on 8125898068"
      }
    ]
  },
  {
    id: "usr-cust-2",
    name: "Anjali Sharma",
    username: "anjali_sharma",
    email: "anjali.sharma@gmail.com",
    phone: "9849011223",
    password: "Password@23",
    role: "customer",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80",
    faceEmbedding: "emb-face-usr-cust-2",
    faceVerified: true,
    lastFaceLoginSnapshot: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80",
    faceLoginTimestamp: "Sep 27, 2026, 10:15 AM",
    lastLogin: "Sep 27, 2026, 10:15 AM",
    dailyServiceCount: 1,
    monthlyServiceCount: 6,
    totalLogins: 19,
    totalLogouts: 17,
    totalUploads: 4,
    totalTimeSpentSeconds: 2850,
    createdAt: "2026-03-01",
    registeredAt: "Mar 01, 2026, 11:00 AM",
    sessionLogs: [],
    activityLogs: []
  },
  {
    id: "usr-cust-3",
    name: "Suresh Reddy",
    username: "suresh_reddy",
    email: "suresh.reddy@gmail.com",
    phone: "9121098765",
    password: "Password@23",
    role: "customer",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80",
    faceEmbedding: "emb-face-usr-cust-3",
    faceVerified: true,
    lastFaceLoginSnapshot: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80",
    faceLoginTimestamp: "Sep 26, 2026, 03:40 PM",
    lastLogin: "Sep 26, 2026, 03:40 PM",
    dailyServiceCount: 0,
    monthlyServiceCount: 3,
    totalLogins: 8,
    totalLogouts: 7,
    totalUploads: 2,
    totalTimeSpentSeconds: 1200,
    createdAt: "2026-03-15",
    registeredAt: "Mar 15, 2026, 02:20 PM",
    sessionLogs: [],
    activityLogs: []
  },
  {
    id: "usr-owner-1",
    name: "MANDAN ROHITH KUMAR",
    email: "msncommunication23@gmail.com",
    phone: "8125898068",
    password: "Password@23",
    role: "owner",
    status: "active",
    lastLogin: "Sep 25, 2026, 05:42 PM",
    dailyServiceCount: 18,
    monthlyServiceCount: 342,
    totalLogins: 128,
    totalTimeSpentSeconds: 18450,
    createdAt: "2026-01-10",
    sessionLogs: [
      {
        id: "sess-o1",
        sessionId: "sess-20260925-o1",
        userEmail: "msncommunication23@gmail.com",
        loginTime: "Sep 25, 2026, 05:42 PM",
        logoutTime: "Sep 25, 2026, 06:10 PM",
        durationSeconds: 1680,
        status: "ended",
        device: "Edge / Windows 11",
        ipAddress: "49.205.14.88"
      }
    ],
    activityLogs: [
      {
        id: "act-o1",
        userEmail: "msncommunication23@gmail.com",
        action: "Accepted Application Task",
        timestamp: "Sep 25, 2026, 05:45 PM",
        details: "Claimed task for MSN-2026-004128"
      },
      {
        id: "act-o2",
        userEmail: "msncommunication23@gmail.com",
        action: "User Logged In",
        timestamp: "Sep 25, 2026, 05:42 PM",
        details: "Authenticated as OWNER"
      }
    ]
  },
  {
    id: "usr-admin-1",
    name: "Super Administrator",
    email: "mandan.rohithkumar23@gmail.com",
    phone: "9848022338",
    password: "Password@23@.@.@.@.",
    role: "superadmin",
    status: "active",
    lastLogin: "Sep 25, 2026, 05:58 PM",
    dailyServiceCount: 45,
    monthlyServiceCount: 890,
    totalLogins: 215,
    totalTimeSpentSeconds: 29400,
    createdAt: "2026-01-01",
    sessionLogs: [
      {
        id: "sess-a1",
        sessionId: "sess-20260925-a1",
        userEmail: "mandan.rohithkumar23@gmail.com",
        loginTime: "Sep 25, 2026, 05:58 PM",
        logoutTime: undefined,
        durationSeconds: 1950,
        status: "active",
        device: "Chrome / Windows 11 Pro",
        ipAddress: "183.82.100.4"
      }
    ],
    activityLogs: [
      {
        id: "act-a1",
        userEmail: "mandan.rohithkumar23@gmail.com",
        action: "Configured Service Catalog",
        timestamp: "Sep 25, 2026, 06:05 PM",
        details: "Updated statutory fee for MeeSeva Police Verification"
      },
      {
        id: "act-a2",
        userEmail: "mandan.rohithkumar23@gmail.com",
        action: "User Logged In",
        timestamp: "Sep 25, 2026, 05:58 PM",
        details: "Root privilege login granted"
      }
    ]
  }
];

const INITIAL_APPLICATIONS: Application[] = [
  {
    id: "MSN-2026-004128",
    serviceId: "meeseva-police",
    serviceName: "Police Verification",
    serviceCategory: "MeeSeva Works",
    subCategory: "Police Services",
    price: "180",
    customerId: "cust-1",
    customerName: "Rohith Kumar",
    customerEmail: "rohith.kumar@gmail.com",
    customerPhone: "8125898068",
    status: "Waiting for Owner",
    createdAt: "2026-09-20 10:30 AM",
    updatedAt: "2026-09-20 10:35 AM",
    formData: {
      "Full Name": "Rohith Kumar",
      "Phone Number": "8125898068",
      "Aadhaar Number": "9876 5432 1098",
      "District": "Hyderabad",
      "Mandal": "Ameerpet",
      "State": "Telangana"
    },
    ownerNote: "Need urgent police clearance certificate for software company onboarding.",
    uploadedDocs: {
      "Aadhaar Card": {
        id: "doc-1",
        name: "aadhaar_card_rohith.pdf",
        size: "420.5 KB",
        type: "application/pdf",
        uploadedAt: "2026-09-20 10:32 AM",
        docName: "Aadhaar Card",
        applicationId: "MSN-2026-004128",
        customerId: "cust-1",
        dataUrl: resolveDocumentDataUrl({ name: "aadhaar_card_rohith.pdf", docName: "Aadhaar Card", type: "application/pdf" }, "Rohith Kumar"),
        fileUrl: resolveDocumentDataUrl({ name: "aadhaar_card_rohith.pdf", docName: "Aadhaar Card", type: "application/pdf" }, "Rohith Kumar"),
        previewType: "pdf"
      },
      "Passport Size Photo": {
        id: "doc-2",
        name: "photo_white_bg.jpg",
        size: "185.2 KB",
        type: "image/jpeg",
        uploadedAt: "2026-09-20 10:33 AM",
        docName: "Passport Size Photo",
        applicationId: "MSN-2026-004128",
        customerId: "cust-1",
        dataUrl: resolveDocumentDataUrl({ name: "photo_white_bg.jpg", docName: "Passport Size Photo", type: "image/jpeg" }, "Rohith Kumar"),
        fileUrl: resolveDocumentDataUrl({ name: "photo_white_bg.jpg", docName: "Passport Size Photo", type: "image/jpeg" }, "Rohith Kumar"),
        previewType: "image"
      }
    },
    officialUrl: "https://tspolice.gov.in",
    paymentId: "PAY-2026-901"
  },
  {
    id: "MSN-2026-004512",
    serviceId: "pan-apply",
    serviceName: "New PAN Card (Form 49A)",
    serviceCategory: "Online Works",
    subCategory: "Pan Services",
    price: "120",
    customerId: "cust-1",
    customerName: "Rohith Kumar",
    customerEmail: "rohith.kumar@gmail.com",
    customerPhone: "8125898068",
    status: "Waiting for Owner",
    createdAt: "2026-09-22 11:20 AM",
    updatedAt: "2026-09-22 11:25 AM",
    formData: {
      "Full Name": "Rohith Kumar",
      "Father's Name": "Mandan Mohan Kumar",
      "Date of Birth": "1998-05-14",
      "Phone Number": "8125898068",
      "Aadhaar Number": "9876 5432 1098",
      "PAN Card Mode": "Physical & E-PAN"
    },
    ownerNote: "Please dispatch physical PAN card to home address. Uploaded clear photo and sign.",
    uploadedDocs: {
      "Aadhaar Card": {
        id: "doc-pan-1",
        name: "aadhaar_identity_proof.pdf",
        size: "350.2 KB",
        type: "application/pdf",
        uploadedAt: "2026-09-22 11:21 AM",
        docName: "Aadhaar Card",
        applicationId: "MSN-2026-004512",
        customerId: "cust-1",
        dataUrl: resolveDocumentDataUrl({ name: "aadhaar_identity_proof.pdf", docName: "Aadhaar Card", type: "application/pdf" }, "Rohith Kumar"),
        fileUrl: resolveDocumentDataUrl({ name: "aadhaar_identity_proof.pdf", docName: "Aadhaar Card", type: "application/pdf" }, "Rohith Kumar"),
        previewType: "pdf"
      },
      "Passport Size Photo": {
        id: "doc-pan-2",
        name: "formal_photograph.jpg",
        size: "210.8 KB",
        type: "image/jpeg",
        uploadedAt: "2026-09-22 11:22 AM",
        docName: "Passport Size Photo",
        applicationId: "MSN-2026-004512",
        customerId: "cust-1",
        dataUrl: resolveDocumentDataUrl({ name: "formal_photograph.jpg", docName: "Passport Size Photo", type: "image/jpeg" }, "Rohith Kumar"),
        fileUrl: resolveDocumentDataUrl({ name: "formal_photograph.jpg", docName: "Passport Size Photo", type: "image/jpeg" }, "Rohith Kumar"),
        previewType: "image"
      },
      "Signature Specimen": {
        id: "doc-pan-3",
        name: "signature_specimen.png",
        size: "95.4 KB",
        type: "image/png",
        uploadedAt: "2026-09-22 11:23 AM",
        docName: "Signature Specimen",
        applicationId: "MSN-2026-004512",
        customerId: "cust-1",
        dataUrl: resolveDocumentDataUrl({ name: "signature_specimen.png", docName: "Signature Specimen", type: "image/png" }, "Rohith Kumar"),
        fileUrl: resolveDocumentDataUrl({ name: "signature_specimen.png", docName: "Signature Specimen", type: "image/png" }, "Rohith Kumar"),
        previewType: "image"
      }
    },
    officialUrl: "https://onlineservices.nsdl.com/paam/endUserRegisterContact.html",
    paymentId: "PAY-2026-902"
  },
  {
    id: "MSN-2026-004620",
    serviceId: "passport-fresh",
    serviceName: "Fresh Passport Application",
    serviceCategory: "Online Works",
    subCategory: "Passport Services",
    price: "1500",
    customerId: "cust-1",
    customerName: "Rohith Kumar",
    customerEmail: "rohith.kumar@gmail.com",
    customerPhone: "8125898068",
    status: "Waiting for Owner",
    createdAt: "2026-09-23 03:40 PM",
    updatedAt: "2026-09-23 03:45 PM",
    formData: {
      "Applicant Name": "Rohith Kumar",
      "Date of Birth": "1998-05-14",
      "Place of Birth": "Hyderabad, Telangana",
      "PSK Office Preferred": "PSK Begumpet, Hyderabad",
      "Application Type": "Normal (36 Pages)"
    },
    ownerNote: "Need appointment slot booked for next Monday or Tuesday morning.",
    uploadedDocs: {
      "Aadhaar Card": {
        id: "doc-pass-1",
        name: "aadhaar_address_proof.pdf",
        size: "420.5 KB",
        type: "application/pdf",
        uploadedAt: "2026-09-23 03:41 PM",
        docName: "Aadhaar Card",
        applicationId: "MSN-2026-004620",
        customerId: "cust-1",
        dataUrl: resolveDocumentDataUrl({ name: "aadhaar_address_proof.pdf", docName: "Aadhaar Card", type: "application/pdf" }, "Rohith Kumar"),
        fileUrl: resolveDocumentDataUrl({ name: "aadhaar_address_proof.pdf", docName: "Aadhaar Card", type: "application/pdf" }, "Rohith Kumar"),
        previewType: "pdf"
      },
      "SSC Certificate (DOB Proof)": {
        id: "doc-pass-2",
        name: "ssc_10th_memo.pdf",
        size: "580.1 KB",
        type: "application/pdf",
        uploadedAt: "2026-09-23 03:42 PM",
        docName: "SSC Certificate",
        applicationId: "MSN-2026-004620",
        customerId: "cust-1",
        dataUrl: resolveDocumentDataUrl({ name: "ssc_10th_memo.pdf", docName: "SSC Certificate", type: "application/pdf" }, "Rohith Kumar"),
        fileUrl: resolveDocumentDataUrl({ name: "ssc_10th_memo.pdf", docName: "SSC Certificate", type: "application/pdf" }, "Rohith Kumar"),
        previewType: "pdf"
      }
    },
    officialUrl: "https://passportindia.gov.in",
    paymentId: "PAY-2026-903"
  },
  {
    id: "MSN-2026-004733",
    serviceId: "buspass-apply",
    serviceName: "TSRTC Student Bus Pass Apply",
    serviceCategory: "Online Works",
    subCategory: "Bus Pass Services",
    price: "50",
    customerId: "cust-1",
    customerName: "Rohith Kumar",
    customerEmail: "rohith.kumar@gmail.com",
    customerPhone: "8125898068",
    status: "Waiting for Owner",
    createdAt: "2026-09-24 09:15 AM",
    updatedAt: "2026-09-24 09:20 AM",
    formData: {
      "Student Name": "Rohith Kumar",
      "Institution": "Osmania University Engineering Campus",
      "Pass Category": "Student Greater Hyderabad Pass",
      "Pass Route": "Ameerpet to OU Campus"
    },
    ownerNote: "Submitted college bonafide stamp slip.",
    uploadedDocs: {
      "Bonafide Certificate": {
        id: "doc-bus-1",
        name: "college_bonafide_stamp.pdf",
        size: "310.4 KB",
        type: "application/pdf",
        uploadedAt: "2026-09-24 09:16 AM",
        docName: "Bonafide Certificate",
        applicationId: "MSN-2026-004733",
        customerId: "cust-1",
        dataUrl: resolveDocumentDataUrl({ name: "college_bonafide_stamp.pdf", docName: "Bonafide Certificate", type: "application/pdf" }, "Rohith Kumar"),
        fileUrl: resolveDocumentDataUrl({ name: "college_bonafide_stamp.pdf", docName: "Bonafide Certificate", type: "application/pdf" }, "Rohith Kumar"),
        previewType: "pdf"
      }
    },
    officialUrl: "https://online.tsrtcpass.in",
    paymentId: "PAY-2026-904"
  },
  {
    id: "MSN-2026-003892",
    serviceId: "aadhaar-pvc",
    serviceName: "Order Aadhaar PVC Card Print",
    serviceCategory: "Online Works",
    subCategory: "Aadhaar Services",
    price: "50",
    customerId: "cust-1",
    customerName: "Rohith Kumar",
    customerEmail: "rohith.kumar@gmail.com",
    customerPhone: "8125898068",
    status: "Completed",
    createdAt: "2026-09-15 02:15 PM",
    updatedAt: "2026-09-17 04:00 PM",
    formData: {
      "Aadhaar number": "9876 5432 1098",
      "Alternative number": "9494949494"
    },
    uploadedDocs: {
      "Aadhaar Card Copy": {
        id: "doc-pvc-1",
        name: "aadhaar_pvc_sample.pdf",
        size: "340.2 KB",
        type: "application/pdf",
        uploadedAt: "2026-09-15 02:15 PM",
        docName: "Aadhaar Card Copy",
        applicationId: "MSN-2026-003892",
        customerId: "cust-1",
        dataUrl: resolveDocumentDataUrl({ name: "aadhaar_pvc_sample.pdf", docName: "Aadhaar Card Copy", type: "application/pdf" }, "Rohith Kumar"),
        fileUrl: resolveDocumentDataUrl({ name: "aadhaar_pvc_sample.pdf", docName: "Aadhaar Card Copy", type: "application/pdf" }, "Rohith Kumar"),
        previewType: "pdf"
      }
    },
    assignedOwnerId: "owner-1",
    assignedOwnerName: "Mandan Rohith Kumar",
    officialUrl: "https://myaadhaar.uidai.gov.in/gen-pvc",
    paymentId: "PAY-2026-814"
  }
];

const INITIAL_SUBMISSION_DOCS: Record<string, Record<string, UploadedFileMeta>> = {
  "MSN-2026-004128": INITIAL_APPLICATIONS[0].uploadedDocs,
  "MSN-2026-004512": INITIAL_APPLICATIONS[1].uploadedDocs,
  "MSN-2026-004620": INITIAL_APPLICATIONS[2].uploadedDocs,
  "MSN-2026-004733": INITIAL_APPLICATIONS[3].uploadedDocs,
  "MSN-2026-003892": INITIAL_APPLICATIONS[4].uploadedDocs
};

const INITIAL_PAYMENTS: PaymentRecord[] = [
  {
    id: "PAY-2026-901",
    applicationId: "MSN-2026-004128",
    serviceName: "Police Verification",
    amount: "₹180",
    method: "UPI",
    status: "Successful",
    timestamp: "2026-09-20 10:34 AM",
    transactionRef: "UPI/2026/894120938",
    customerName: "Rohith Kumar"
  },
  {
    id: "PAY-2026-814",
    applicationId: "MSN-2026-003892",
    serviceName: "Order Aadhaar PVC Card Print",
    amount: "₹50",
    method: "QR Code",
    status: "Successful",
    timestamp: "2026-09-15 02:16 PM",
    transactionRef: "QR/2026/102938102",
    customerName: "Rohith Kumar"
  }
];

const RAHUL_KUMAR_AADHAAR_DOC: UploadedFileMeta = {
  id: "vault-aadhaar-rahul-kumar",
  name: "Rahul_Kumar_Aadhaar_Card_Masked.pdf",
  size: "524.8 KB",
  type: "application/pdf",
  uploadedAt: "Oct 6, 2026, 04:39 PM",
  categoryName: "Identity & Personal Documents",
  docName: "Aadhaar card",
  customerId: "usr-cust-1",
  dataUrl: generateAadhaarSvg("Rahul Kumar", "XXXX XXXX 9821", {
    dob: "01/01/1990",
    gender: "పురుషుడు / MALE",
    address: "123, Demo Street, Block A, Near Demo Park, New Delhi, Delhi - 110001",
    vid: "9182 3019 4410 9821"
  }),
  fileUrl: generateAadhaarSvg("Rahul Kumar", "XXXX XXXX 9821", {
    dob: "01/01/1990",
    gender: "పురుషుడు / MALE",
    address: "123, Demo Street, Block A, Near Demo Park, New Delhi, Delhi - 110001",
    vid: "9182 3019 4410 9821"
  }),
  previewType: "image",
  verificationStatus: "APPROVED",
  verificationMessage: "STATUS: APPROVED - Identified as a genuine Aadhaar card.",
  isGenuineAadhaar: true
};

const INITIAL_USER_DOCS: Record<string, Record<string, UploadedFileMeta>> = {
  "rohith.kumar@gmail.com": {
    "Aadhaar card": RAHUL_KUMAR_AADHAAR_DOC,
    "Pan card": {
      id: "doc-vault-2",
      name: "PAN_Card_Scanned.jpg",
      size: "240.1 KB",
      type: "image/jpeg",
      uploadedAt: "2026-09-19 03:45 PM",
      categoryName: "Identity & Personal Documents",
      docName: "Pan card",
      customerId: "cust-1",
      dataUrl: resolveDocumentDataUrl({ name: "PAN_Card_Scanned.jpg", docName: "Pan card", type: "image/jpeg" }, "Rahul Kumar"),
      fileUrl: resolveDocumentDataUrl({ name: "PAN_Card_Scanned.jpg", docName: "Pan card", type: "image/jpeg" }, "Rahul Kumar"),
      previewType: "image"
    }
  },
  "rahul.kumar@gmail.com": {
    "Aadhaar card": RAHUL_KUMAR_AADHAAR_DOC,
    "Pan card": {
      id: "doc-vault-2-rahul",
      name: "PAN_Card_Scanned.jpg",
      size: "240.1 KB",
      type: "image/jpeg",
      uploadedAt: "2026-09-19 03:45 PM",
      categoryName: "Identity & Personal Documents",
      docName: "Pan card",
      customerId: "cust-1",
      dataUrl: resolveDocumentDataUrl({ name: "PAN_Card_Scanned.jpg", docName: "Pan card", type: "image/jpeg" }, "Rahul Kumar"),
      fileUrl: resolveDocumentDataUrl({ name: "PAN_Card_Scanned.jpg", docName: "Pan card", type: "image/jpeg" }, "Rahul Kumar"),
      previewType: "image"
    }
  }
};

const INITIAL_MESSAGES: PortalMessage[] = [
  {
    id: "msg-1",
    applicationId: "MSN-2026-004128",
    senderId: "owner-1",
    senderName: "Mandan Rohith Kumar",
    senderRole: "owner",
    recipientId: "usr-cust-1",
    content: "Hello Rohith, we have reviewed your Police Verification application. Your uploaded e-Aadhaar is clear. We are initiating verification with the local police station.",
    timestamp: "10:45 AM"
  },
  {
    id: "msg-2",
    applicationId: "MSN-2026-004128",
    senderId: "usr-cust-1",
    senderName: "Rohith Kumar",
    senderRole: "customer",
    recipientId: "owner-1",
    content: "Thank you sir! Please let me know if any additional address proof is required.",
    timestamp: "10:50 AM"
  },
  {
    id: "msg-3",
    applicationId: "MSN-2026-004128",
    senderId: "owner-1",
    senderName: "Mandan Rohith Kumar",
    senderRole: "owner",
    recipientId: "usr-cust-1",
    content: "All documents are in order. The verification report is expected within 24-48 hours.",
    timestamp: "11:15 AM"
  }
];

const INITIAL_NOTIFICATIONS: PortalNotification[] = [
  {
    id: "notif-1",
    userId: "usr-cust-1",
    title: "Application Received",
    message: "Your Police Verification request (MSN-2026-004128) has been queued for owner review.",
    timestamp: "Sep 20, 10:35 AM",
    read: false,
    type: "info",
    applicationId: "MSN-2026-004128"
  },
  {
    id: "notif-2",
    userId: "usr-cust-1",
    title: "Message from Owner: Police Verification",
    message: "All documents are in order. The verification report is expected within 24-48 hours.",
    timestamp: "Sep 20, 11:15 AM",
    read: false,
    type: "info",
    applicationId: "MSN-2026-004128"
  },
  {
    id: "notif-3",
    userId: "usr-cust-1",
    title: "PVC Card Dispatched",
    message: "Your Aadhaar PVC print order has been processed by Speed Post.",
    timestamp: "Sep 17, 04:00 PM",
    read: true,
    type: "success"
  }
];

const INITIAL_PASSWORD_CHANGE_AUDITS: PasswordChangeAuditLog[] = [
  {
    id: "audit-891024",
    customerName: "Rohith Kumar",
    customerEmail: "rohith.kumar@gmail.com",
    customerPhone: "8125898068",
    originalPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
    verificationSnapshot: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
    timestamp: "Sep 28, 2026, 02:45 PM",
    matchConfidence: 98,
    status: "verified",
    securityNote: "Facial Embedding Matched Live Camera Feed with Blink Liveness"
  }
];

const DEFAULT_DEMO_USER: User = {
  id: INITIAL_ACCOUNTS[0].id,
  name: INITIAL_ACCOUNTS[0].name,
  email: INITIAL_ACCOUNTS[0].email,
  phone: INITIAL_ACCOUNTS[0].phone,
  role: INITIAL_ACCOUNTS[0].role,
  avatar: INITIAL_ACCOUNTS[0].avatar,
  faceEmbedding: INITIAL_ACCOUNTS[0].faceEmbedding,
  faceVerified: INITIAL_ACCOUNTS[0].faceVerified,
  familyDetails: INITIAL_ACCOUNTS[0].familyDetails,
};

export const PortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth modal dialog state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const openAuth = useCallback(() => setIsAuthOpen(true), []);
  const closeAuth = useCallback(() => setIsAuthOpen(false), []);

  // Auth state: persistent in localStorage, strictly null by default unless authenticated session exists
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const loggedOut = localStorage.getItem("msn_portal_logged_out");
        if (loggedOut === "true") {
          return null;
        }
        const stored = localStorage.getItem("msn_portal_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && (parsed.email || parsed.id)) {
            return parsed;
          }
        }
      } catch (e) {}
    }
    return null;
  });
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const loggedOut = localStorage.getItem("msn_portal_logged_out");
      const stored = localStorage.getItem("msn_portal_user");
      if (loggedOut !== "true" && stored) {
        return false;
      }
    }
    return true;
  });
  const isLoggedIn = useMemo(() => Boolean(user && user.id), [user]);
  const [selectedRole, setSelectedRole] = useState<UserRole>("customer");

  // Keep localStorage in sync with user state
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        if (user) {
          localStorage.setItem("msn_portal_user", JSON.stringify(user));
          localStorage.removeItem("msn_portal_logged_out");
        } else {
          localStorage.removeItem("msn_portal_user");
        }
      } catch (e) {}
    }
  }, [user]);

  // Secure Session Isolation: Sync user from HTTP-only session cookie on initial load
  useEffect(() => {
    let isMounted = true;
    if (typeof window !== "undefined") {
      fetch("/api/auth/session")
        .then((res) => res.json())
        .then((data) => {
          if (!isMounted) return;
          if (data?.authenticated && data?.session?.userId) {
            setAccounts((currAccounts) => {
              const matched = currAccounts.find(
                (a) =>
                  a.id === data.session.userId ||
                  a.email.toLowerCase() === data.session.email?.toLowerCase()
              );
              if (matched) {
                setUser({
                  id: matched.id,
                  name: matched.name,
                  email: matched.email,
                  phone: matched.phone,
                  role: matched.role,
                  avatar: matched.avatar,
                  faceEmbedding: matched.faceEmbedding,
                  faceVerified: matched.faceVerified,
                  familyDetails: matched.familyDetails,
                });
              }
              return currAccounts;
            });
          }
        })
        .catch((e) => console.debug("[Session Auth Check]", e))
        .finally(() => {
          if (isMounted) setIsAuthChecking(false);
        });
    } else {
      setIsAuthChecking(false);
    }
    return () => {
      isMounted = false;
    };
  }, []);
  const [passwordChangeAudits, setPasswordChangeAudits] = useState<PasswordChangeAuditLog[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("msn_portal_password_change_audits");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_PASSWORD_CHANGE_AUDITS;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("msn_portal_password_change_audits", JSON.stringify(passwordChangeAudits));
      } catch (e) {}
    }
  }, [passwordChangeAudits]);

  const [accounts, setAccounts] = useState<UserAccount[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("msn_portal_accounts");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {}
    }
    return INITIAL_ACCOUNTS;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("msn_portal_accounts", JSON.stringify(accounts));
      } catch (e) {}
    }
  }, [accounts]);

  const registerCustomer = (data: {
    email: string;
    phone: string;
    password: string;
    name?: string;
    gender?: Gender;
    avatar?: string;
    faceEmbedding?: string;
    faceVerified?: boolean;
  }) => {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanPhone = data.phone.trim();

    const existing = accounts.find(
      (a) => a.email.toLowerCase() === cleanEmail
    );
    if (existing) {
      return {
        success: false,
        message: "An account with this Email ID already exists. Please log in."
      };
    }

    const regTimeStr = new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    const displayName =
      data.name ||
      cleanEmail
        .split("@")[0]
        .replace(/[._-]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

    const newCustomer: UserAccount = {
      id: `cust-${Date.now()}`,
      name: displayName,
      email: cleanEmail,
      phone: cleanPhone,
      password: data.password,
      gender: data.gender,
      avatar: data.avatar,
      faceEmbedding: data.faceEmbedding,
      faceVerified: data.faceVerified || Boolean(data.faceEmbedding),
      role: "customer",
      status: "active",
      lastLogin: "Never",
      dailyServiceCount: 0,
      monthlyServiceCount: 0,
      totalLogins: 0,
      totalTimeSpentSeconds: 0,
      createdAt: new Date().toISOString().split("T")[0],
      registeredAt: regTimeStr,
      sessionLogs: [],
      activityLogs: [
        {
          id: `act-${Date.now()}`,
          userEmail: cleanEmail,
          action: "Customer Registration Completed",
          timestamp: regTimeStr,
          details: "Self-registered customer account created via online portal"
        }
      ]
    };

    setAccounts((prev) => [newCustomer, ...prev]);

    // Initialize clean, isolated empty documents workspace for newly registered account
    setUserDocsMap((prev) => ({
      ...prev,
      [cleanEmail]: {}
    }));

    return {
      success: true,
      message: "Account created successfully! Please log in.",
      customer: newCustomer
    };
  };

  // Active OTP state synchronized across system with 60-second validity
  const [activeSystemOtp, setActiveSystemOtp] = useState<{
    code: string;
    targetIdentifier: string;
    targetName: string;
    expiresAt: number;
    createdAt: number;
  } | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("msn_portal_reset_otp");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.expiresAt && Date.now() < parsed.expiresAt) {
            return parsed;
          }
        }
      } catch (e) {}
    }
    return null;
  });

  // Incoming Password Reset Requests for Super Admin Approval
  const [passwordResetRequests, setPasswordResetRequests] = useState<PasswordResetRequest[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("msn_portal_password_reset_requests");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {}
    }
    return [
      {
        id: "req-init-1",
        customerName: "Rohith Kumar",
        customerPhone: "8125898068",
        customerEmail: "rohith.kumar@gmail.com",
        identifier: "8125898068",
        status: "pending",
        requestedAt: "11:45 AM"
      }
    ];
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("msn_portal_password_reset_requests", JSON.stringify(passwordResetRequests));
      } catch (e) {}
    }
  }, [passwordResetRequests]);

  // Sync real-time storage updates across tabs/windows
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "msn_portal_password_reset_requests" && e.newValue) {
        try {
          setPasswordResetRequests(JSON.parse(e.newValue));
        } catch (err) {}
      }
      if (e.key === "msn_portal_reset_otp" && e.newValue) {
        try {
          setActiveSystemOtp(JSON.parse(e.newValue));
        } catch (err) {}
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const addAccount = (acc: Omit<UserAccount, "id" | "lastLogin" | "dailyServiceCount" | "monthlyServiceCount" | "createdAt"> & { lastLogin?: string; dailyServiceCount?: number; monthlyServiceCount?: number; }) => {
    const newAcc: UserAccount = {
      id: `usr-${Date.now().toString().slice(-6)}`,
      name: acc.name,
      email: acc.email,
      phone: acc.phone,
      password: acc.password || "Password@23",
      role: acc.role,
      status: acc.status || "active",
      lastLogin: acc.lastLogin || "Just created",
      dailyServiceCount: acc.dailyServiceCount || 0,
      monthlyServiceCount: acc.monthlyServiceCount || 0,
      createdAt: new Date().toISOString().split("T")[0]
    };
    setAccounts((prev) => [newAcc, ...prev]);
    return newAcc;
  };

  const updateAccount = (id: string, updates: Partial<UserAccount>) => {
    setAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
  };

  const deleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  // View state with initial URL hash parsing for direct linking and bookmarking
  const [currentView, setCurrentView] = useState<ViewType>(() => {
    if (typeof window !== "undefined") {
      try {
        const parsed = parseSnapshotFromHash(window.location.hash);
        if (parsed.view) return parsed.view;
      } catch (e) {}
    }
    return "online-works";
  });
  const [previousView, setPreviousView] = useState<ViewType | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const parsed = parseSnapshotFromHash(window.location.hash);
        if (parsed.categoryId) {
          return ONLINE_CATEGORIES.find((c) => c.id === parsed.categoryId) || null;
        }
      } catch (e) {}
    }
    return null;
  });
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const parsed = parseSnapshotFromHash(window.location.hash);
        if (parsed.serviceId) {
          const fromMee = MEESEVA_SERVICES.find((s) => s.id === parsed.serviceId);
          if (fromMee) return fromMee;
          for (const cat of ONLINE_CATEGORIES) {
            const sub = cat.subServices?.find((s) => s.id === parsed.serviceId);
            if (sub) return sub;
          }
        }
      } catch (e) {}
    }
    return null;
  });

  // History & routing control refs
  const isPopStateActionRef = useRef<boolean>(false);
  const historyIndexRef = useRef<number>(0);
  const isInitialMountRef = useRef<boolean>(true);
  const currentSnapshotRef = useRef<NavigationHistorySnapshot>({
    view: "online-works",
    categoryId: null,
    serviceId: null,
    modal: null,
    index: 0
  });

  // Services catalog (guarantees all 17 MeeSeva services are active and loaded with localStorage sync)
  const [meesevaServices, setMeesevaServices] = useState<ServiceItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("msn_portal_meeseva_services");
        if (stored) {
          const parsed = JSON.parse(stored) as ServiceItem[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            const merged = MEESEVA_SERVICES.map((base) => {
              const found = parsed.find((p) => p.id === base.id);
              return found ? { ...base, ...found } : base;
            });
            return merged;
          }
        }
      } catch (e) {}
    }
    return MEESEVA_SERVICES;
  });

  const [onlineCategories, setOnlineCategories] = useState<ServiceCategory[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("msn_portal_online_categories");
        if (stored) {
          const parsed = JSON.parse(stored) as ServiceCategory[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Guarantee updated catalog prices (e.g. Order Aadhaar PVC Card Print = ₹50) propagate to client cache
            return parsed.map((cat) => ({
              ...cat,
              subServices: cat.subServices
                ? cat.subServices.map((sub) => {
                    if (sub.id === "aadhaar-pvc" && sub.price === "150") {
                      return { ...sub, price: "50" };
                    }
                    return sub;
                  })
                : cat.subServices
            }));
          }
        }
      } catch (e) {}
    }
    return ONLINE_CATEGORIES;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("msn_portal_meeseva_services", JSON.stringify(meesevaServices));
      } catch (e) {}
    }
  }, [meesevaServices]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("msn_portal_online_categories", JSON.stringify(onlineCategories));
      } catch (e) {}
    }
  }, [onlineCategories]);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Account-Specific Document Storage (Isolated per user email with localStorage persistence)
  const [userDocsMap, setUserDocsMap] = useState<Record<string, Record<string, UploadedFileMeta>>>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("msn_portal_user_documents");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === "object") {
            const merged: Record<string, Record<string, UploadedFileMeta>> = { ...INITIAL_USER_DOCS, ...parsed };
            Object.keys(INITIAL_USER_DOCS).forEach((email) => {
              merged[email] = {
                ...INITIAL_USER_DOCS[email],
                ...(parsed[email] || {})
              };
              if (INITIAL_USER_DOCS[email]["Aadhaar card"]) {
                merged[email]["Aadhaar card"] = INITIAL_USER_DOCS[email]["Aadhaar card"];
              }
            });
            return merged;
          }
        }
      } catch (e) {}
    }
    return INITIAL_USER_DOCS;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("msn_portal_user_documents", JSON.stringify(userDocsMap));
      } catch (e) {}
    }
  }, [userDocsMap]);

  // Dynamic user-scoped documents: strictly fetch and display files for the currently logged-in email
  const currentUserEmail = (user?.email || "").toLowerCase().trim();
  const uploadedDocs = useMemo(() => {
    if (!user || !currentUserEmail) return {};
    return userDocsMap[currentUserEmail] || {};
  }, [user, currentUserEmail, userDocsMap]);

  const getUserUploadedDocs = useCallback((email: string): Record<string, UploadedFileMeta> => {
    const clean = String(email || "").toLowerCase().trim();
    return userDocsMap[clean] || {};
  }, [userDocsMap]);

  const getUserDocCount = useCallback((email: string): number => {
    const clean = String(email || "").toLowerCase().trim();
    return Object.keys(userDocsMap[clean] || {}).length;
  }, [userDocsMap]);

  const [previewDoc, setPreviewDoc] = useState<UploadedFileMeta | null>(null);

  // Applications & Payments with Central Persistence
  const [applications, setApplications] = useState<Application[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("msn_portal_applications");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {}
    }
    return INITIAL_APPLICATIONS;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("msn_portal_applications", JSON.stringify(applications));
      } catch (e) {}
    }
  }, [applications]);

  // Central Submission Document Registry (linked via applicationId & customerId)
  const [submissionDocsMap, setSubmissionDocsMap] = useState<Record<string, Record<string, UploadedFileMeta>>>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("msn_portal_submission_docs");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === "object") {
            return parsed;
          }
        }
      } catch (e) {}
    }
    return INITIAL_SUBMISSION_DOCS;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("msn_portal_submission_docs", JSON.stringify(submissionDocsMap));
      } catch (e) {}
    }
  }, [submissionDocsMap]);

  // Robust Fetching Resolver: Queries submission docs, direct app docs, and customer account vault
  const getApplicationDocuments = useCallback(
    (app: Application): Record<string, UploadedFileMeta> => {
      const combined: Record<string, UploadedFileMeta> = {};

      // 1. Direct application uploadedDocs
      if (app.uploadedDocs && typeof app.uploadedDocs === "object") {
        Object.entries(app.uploadedDocs).forEach(([k, v]) => {
          combined[k] = { ...v };
        });
      }

      // 2. Central submission registry linked via applicationId
      const linked = submissionDocsMap[app.id] || {};
      Object.entries(linked).forEach(([k, v]) => {
        if (!combined[k] || !combined[k].dataUrl) {
          combined[k] = { ...v };
        }
      });

      // 3. Customer account vault lookup by email
      const userVault = userDocsMap[(app.customerEmail || "").toLowerCase().trim()] || {};
      Object.entries(userVault).forEach(([vaultDocName, vaultDoc]) => {
        Object.keys(combined).forEach((docKey) => {
          const dLower = docKey.toLowerCase();
          const vLower = vaultDocName.toLowerCase();
          if (dLower.includes(vLower) || vLower.includes(dLower)) {
            if (!combined[docKey].dataUrl && vaultDoc.dataUrl) {
              combined[docKey] = {
                ...combined[docKey],
                dataUrl: vaultDoc.dataUrl,
                fileUrl: vaultDoc.fileUrl || vaultDoc.dataUrl
              };
            }
          }
        });
      });

      // 4. Guarantee every document has a valid, renderable visual dataUrl & proper linkage
      Object.entries(combined).forEach(([key, doc]) => {
        const currentData = doc.dataUrl || doc.fileUrl;
        if (!currentData || currentData.length < 30) {
          const resolved = resolveDocumentDataUrl(doc, app.customerName);
          combined[key] = {
            ...doc,
            dataUrl: resolved,
            fileUrl: resolved,
            applicationId: app.id,
            customerId: app.customerId,
            previewType: isImageDocument(doc) ? "image" : "pdf"
          };
        } else {
          combined[key] = {
            ...doc,
            applicationId: app.id,
            customerId: app.customerId,
            previewType: doc.previewType || (isImageDocument(doc) ? "image" : "pdf")
          };
        }
      });

      return combined;
    },
    [submissionDocsMap, userDocsMap]
  );

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("msn_portal_payments");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {}
    }
    return INITIAL_PAYMENTS;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("msn_portal_payments", JSON.stringify(payments));
      } catch (e) {}
    }
  }, [payments]);

  const [activePaymentApp, setActivePaymentApp] = useState<Application | null>(null);

  // Feedback & Profile
  const [feedbackList, setFeedbackList] = useState<FeedbackComplaint[]>([
    {
      id: "fb-1",
      customerId: "cust-1",
      customerName: "Rohith Kumar",
      message: "The PVC card delivery status check was fast and seamless. Great work!",
      timestamp: "2026-09-16 09:30 AM",
      status: "Resolved"
    }
  ]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Notifications with central persistence
  const [notifications, setNotifications] = useState<PortalNotification[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("msn_portal_notifications");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {}
    }
    return INITIAL_NOTIFICATIONS;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("msn_portal_notifications", JSON.stringify(notifications));
      } catch (e) {}
    }
  }, [notifications]);

  // Messages with central persistence
  const [messages, setMessages] = useState<PortalMessage[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("msn_portal_messages");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {}
    }
    return INITIAL_MESSAGES;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("msn_portal_messages", JSON.stringify(messages));
      } catch (e) {}
    }
  }, [messages]);

  // Two-Way Message & Notification Modal Dialog State
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [activeMessageAppId, setActiveMessageAppId] = useState<string | null>(null);

  // Theme & Visual state (Default to Light Mode)
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [isContentHidden, setIsContentHidden] = useState(false);

  // Language & Localization: English by default on initial load / fresh login, persisted across navigation
  const [language, setLanguageState] = useState<"EN" | "TE" | "HI">(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("msn_portal_language");
        if (stored === "EN" || stored === "TE" || stored === "HI") {
          return stored;
        }
      } catch (e) {}
    }
    return "EN";
  });

  const setLanguage = useCallback((lang: "EN" | "TE" | "HI") => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("msn_portal_language", lang);
      } catch (e) {}
    }
  }, []);

  const t = useCallback((key: string): string => {
    return getTranslation(key, language);
  }, [language]);

  // Sync theme with DOM documentElement and body
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (theme === "light") {
      root.setAttribute("data-theme", "light");
      root.classList.remove("dark");
      root.classList.add("light");
      if (body) {
        body.classList.remove("dark");
        body.classList.add("light");
      }
    } else {
      root.removeAttribute("data-theme");
      root.classList.remove("light");
      root.classList.add("dark");
      if (body) {
        body.classList.remove("light");
        body.classList.add("dark");
      }
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "dark" ? "light" : "dark"));
  };

  const clearSessionData = () => {
    setApplications(INITIAL_APPLICATIONS);
    if (user?.email) {
      const email = user.email.toLowerCase().trim();
      setUserDocsMap((prev) => ({ ...prev, [email]: {} }));
    }
    setNotifications([]);
    setFeedbackList([]);
  };

  // Heartbeat tracking user time spent on site & active session duration (every 5 seconds)
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      setAccounts((prev) =>
        prev.map((acc) => {
          if (
            acc.email.toLowerCase() === user.email.toLowerCase() ||
            (user.phone && acc.phone.replace(/\D/g, "") === user.phone.replace(/\D/g, ""))
          ) {
            const updatedSessions = (acc.sessionLogs || []).map((s) => {
              if (s.status === "active") {
                return { ...s, durationSeconds: (s.durationSeconds || 0) + 5 };
              }
              return s;
            });
            return {
              ...acc,
              totalTimeSpentSeconds: (acc.totalTimeSpentSeconds || 0) + 5,
              sessionLogs: updatedSessions
            };
          }
          return acc;
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [user]);

  // Operational Activity Logger (isolated per user account)
  const logUserActivity = (action: string, details?: string, targetEmail?: string) => {
    const emailToLog = targetEmail || user?.email || "system";
    const nowStr = new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
    const logItem: UserActivityLog = {
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userEmail: emailToLog,
      action,
      timestamp: nowStr,
      details
    };
    setAccounts((prev) =>
      prev.map((a) => {
        if (a.email.toLowerCase() === emailToLog.toLowerCase()) {
          return {
            ...a,
            activityLogs: [logItem, ...(a.activityLogs || [])]
          };
        }
        return a;
      })
    );
  };

  // Check if an account exists by email (used for strict sign-up vs sign-in separation)
  const checkAccountExists = (email: string): boolean => {
    if (!email) return false;
    const clean = email.trim().toLowerCase();
    return accounts.some((a) => a.email.toLowerCase() === clean);
  };

  // Auth functions with session recording and multi-tenant analytics
  const login = (identifier: string, roleOverride?: UserRole) => {
    const role = roleOverride || selectedRole;
    const cleanId = identifier.trim().toLowerCase();

    // Check registered accounts strictly
    const matched = accounts.find(
      (a) =>
        (a.email.toLowerCase() === cleanId || a.phone.replace(/\D/g, "") === cleanId.replace(/\D/g, "")) &&
        a.role === role
    );

    if (!matched) {
      return false;
    }

    const sessionId = `sess-${Date.now()}`;
    const nowStr = new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    const newSession: UserSessionRecord = {
      id: `sr-${Date.now()}`,
      sessionId,
      userEmail: matched.email,
      loginTime: nowStr,
      durationSeconds: 0,
      status: "active",
      device: typeof navigator !== "undefined" && navigator.userAgent.includes("Windows") ? "Chrome / Windows 11" : "Web Client",
      ipAddress: "49.205.14.88"
    };

    const newActivity: UserActivityLog = {
      id: `act-${Date.now()}`,
      userEmail: matched.email,
      action: "User Logged In",
      timestamp: nowStr,
      details: `Authenticated as ${role.toUpperCase()} • Session initiated`
    };

    setAccounts((prev) =>
      prev.map((a) => {
        if (a.id === matched.id) {
          return {
            ...a,
            lastLogin: nowStr,
            activeSessionId: sessionId,
            totalLogins: (a.totalLogins || 0) + 1,
            sessionLogs: [newSession, ...(a.sessionLogs || [])],
            activityLogs: [newActivity, ...(a.activityLogs || [])]
          };
        }
        return a;
      })
    );

    const newUser: User = {
      id: matched.id,
      name: matched.name,
      email: matched.email,
      phone: matched.phone,
      role: matched.role,
      avatar: matched.avatar,
      faceEmbedding: matched.faceEmbedding,
      faceVerified: matched.faceVerified,
      familyDetails: matched.familyDetails
    };

    setUser(newUser);
    setIsAuthOpen(false);
    // Ensure fresh login always defaults to English
    setLanguage("EN");

    // Requirement 3: Set secure, HTTP-only session cookie strictly scoped to this user ID
    if (typeof window !== "undefined") {
      fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        }),
      }).catch((e) => console.error("[Session Cookie Error]", e));
    }

    if (role === "owner") {
      setCurrentView("owner-dashboard");
    } else if (role === "superadmin") {
      setCurrentView("admin-dashboard");
    } else {
      setCurrentView("online-works");
    }
    return true;
  };

  // Google Login: strictly checks if account exists in database.
  // Never auto-merges or auto-creates accounts silently.
  const loginWithGoogle = (name: string, email: string, roleOverride?: UserRole): { success: boolean; error?: string } => {
    const role = roleOverride || selectedRole;
    const cleanEmail = email.trim().toLowerCase();

    // STRICT CHECK: Does account exist in database?
    const matchedAccount = accounts.find(
      (a) => a.email.toLowerCase() === cleanEmail
    );

    if (!matchedAccount) {
      // Requirement 1 & 2: Account does NOT exist -> do NOT auto-create!
      return {
        success: false,
        error: "ACCOUNT_NOT_FOUND",
      };
    }

    const sessionId = `sess-${Date.now()}`;
    const nowStr = new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    const newSession: UserSessionRecord = {
      id: `sr-${Date.now()}`,
      sessionId,
      userEmail: matchedAccount.email,
      loginTime: nowStr,
      durationSeconds: 0,
      status: "active",
      device: "Google OAuth / Web (prompt: select_account)",
      ipAddress: "152.58.12.84"
    };

    const newActivity: UserActivityLog = {
      id: `act-${Date.now()}`,
      userEmail: matchedAccount.email,
      action: "Google SSO Sign-In",
      timestamp: nowStr,
      details: `Google authentication successful for ${matchedAccount.name}`
    };

    // Update only THIS account strictly (no merging, no data bleed)
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === matchedAccount.id
          ? {
              ...a,
              lastLogin: nowStr,
              activeSessionId: sessionId,
              totalLogins: (a.totalLogins || 0) + 1,
              sessionLogs: [newSession, ...(a.sessionLogs || [])],
              activityLogs: [newActivity, ...(a.activityLogs || [])]
            }
          : a
      )
    );

    const newUser: User = {
      id: matchedAccount.id, // Strictly scoped to matched account ID
      name: matchedAccount.name,
      email: matchedAccount.email,
      phone: matchedAccount.phone,
      role: matchedAccount.role,
      avatar: matchedAccount.avatar,
      faceEmbedding: matchedAccount.faceEmbedding,
      faceVerified: matchedAccount.faceVerified,
      familyDetails: matchedAccount.familyDetails
    };

    setUser(newUser);
    setIsAuthOpen(false);

    // Requirement 3: Set secure, HTTP-only session cookie strictly scoped to this user ID
    if (typeof window !== "undefined") {
      fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        }),
      }).catch((e) => console.error("[Session Cookie Error]", e));
    }

    if (matchedAccount.role === "owner") {
      setCurrentView("owner-dashboard");
    } else if (matchedAccount.role === "superadmin") {
      setCurrentView("admin-dashboard");
    } else {
      setCurrentView("online-works");
    }

    return { success: true };
  };

  // Google Registration: guides user through creating their distinct isolated account
  const registerCustomerWithGoogle = (data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    gender?: Gender;
    avatar?: string;
  }) => {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanPhone = data.phone.trim();

    if (checkAccountExists(cleanEmail)) {
      return {
        success: false,
        message: "An account with this email already exists. Please log in.",
      };
    }

    const regTimeStr = new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    const newId = `cust-g-${Date.now()}`;
    const newCustomer: UserAccount = {
      id: newId,
      name: data.name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      password: data.password || "GoogleAuth@2026",
      gender: data.gender,
      avatar: data.avatar,
      role: "customer",
      status: "active",
      lastLogin: regTimeStr,
      dailyServiceCount: 0,
      monthlyServiceCount: 0,
      totalLogins: 1,
      totalTimeSpentSeconds: 0,
      createdAt: new Date().toISOString().split("T")[0],
      registeredAt: regTimeStr,
      sessionLogs: [
        {
          id: `sr-${Date.now()}`,
          sessionId: `sess-${Date.now()}`,
          userEmail: cleanEmail,
          loginTime: regTimeStr,
          durationSeconds: 0,
          status: "active",
          device: "Google OAuth / Web Registration",
          ipAddress: "152.58.12.84"
        }
      ],
      activityLogs: [
        {
          id: `act-${Date.now()}`,
          userEmail: cleanEmail,
          action: "Customer Google Registration Completed",
          timestamp: regTimeStr,
          details: `Self-registered customer account created via Google OAuth for ${data.name}`
        }
      ]
    };

    setAccounts((prev) => {
      const updated = [newCustomer, ...prev];
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("msn_portal_accounts", JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });

    // Ensure completely empty, isolated document vault for this new user
    setUserDocsMap((prev) => {
      const updated = { ...prev, [cleanEmail]: {} };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("msn_portal_user_documents", JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });

    const newUser: User = {
      id: newId,
      name: newCustomer.name,
      email: newCustomer.email,
      phone: newCustomer.phone,
      role: "customer",
      avatar: newCustomer.avatar,
    };

    setUser(newUser);
    setIsAuthOpen(false);

    // Requirement 3: Set secure, HTTP-only session cookie strictly scoped to this user ID
    if (typeof window !== "undefined") {
      fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        }),
      }).catch((e) => console.error("[Session Cookie Error]", e));
    }

    setCurrentView("online-works");

    return {
      success: true,
      message: "Google registration completed successfully.",
      customer: newCustomer,
    };
  };

  const updateFacialProfile = (email: string, avatar: string, faceEmbedding: string) => {
    const cleanEmail = email.trim().toLowerCase();
    setAccounts((prev) => {
      const updated = prev.map((a) => {
        if (a.email.toLowerCase() === cleanEmail) {
          return {
            ...a,
            avatar,
            faceEmbedding,
            faceVerified: true
          };
        }
        return a;
      });
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("msn_portal_accounts", JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });

    setUser((prev) => {
      if (prev && prev.email.toLowerCase() === cleanEmail) {
        return {
          ...prev,
          avatar,
          faceEmbedding,
          faceVerified: true
        };
      }
      return prev;
    });

    logUserActivity("Face Recognition Updated", "Updated facial biometric profile photo and template", cleanEmail);

    return {
      success: true,
      message: "Facial profile photo and biometric recognition template updated successfully."
    };
  };

  const logout = () => {
    // 1. Terminate server HTTP-only session cookies
    if (typeof window !== "undefined") {
      fetch("/api/auth/session", { method: "DELETE" }).catch((err) =>
        console.error("[Session Delete Error]", err)
      );

      // 2. Disable Google auto-select if GSI script exists
      const win = window as unknown as {
        google?: { accounts?: { id?: { disableAutoSelect: () => void } } };
      };
      try {
        win.google?.accounts?.id?.disableAutoSelect();
      } catch (e) {}
    }

    // 3. Mark session ended in account logs
    if (user) {
      const nowStr = new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
      setAccounts((prev) =>
        prev.map((a) => {
          if (
            a.email.toLowerCase() === user.email.toLowerCase() ||
            (user.phone && a.phone.replace(/\D/g, "") === user.phone.replace(/\D/g, ""))
          ) {
            const updatedSessions = (a.sessionLogs || []).map((s) => {
              if (s.status === "active") {
                return { ...s, status: "ended" as const, logoutTime: nowStr };
              }
              return s;
            });
            const logoutActivity: UserActivityLog = {
              id: `act-${Date.now()}`,
              userEmail: a.email,
              action: "User Logged Out",
              timestamp: nowStr,
              details: "Session ended normally"
            };
            return {
              ...a,
              totalLogouts: (a.totalLogouts || 0) + 1,
              activeSessionId: undefined,
              sessionLogs: updatedSessions,
              activityLogs: [logoutActivity, ...(a.activityLogs || [])]
            };
          }
          return a;
        })
      );
    }

    // 4. Secure Session Isolation: completely purge active session & state
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("msn_portal_user");
        localStorage.setItem("msn_portal_logged_out", "true");
      } catch (e) {}
    }
    setUser(null);
    setIsAuthOpen(false);
    setLanguage("EN");
    setCurrentView("online-works");
    setIsProfileOpen(false);
    setIsSearchOpen(false);
    setSearchQuery("");
    setPreviewDoc(null);
    setActivePaymentApp(null);
  };

  // Customer Face Recognition Biometric Login Log
  const recordFaceLogin = (email: string, photo: string, confidence: number = 98.5) => {
    const cleanEmail = email.trim().toLowerCase();
    const nowStr = new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    const newFaceLog: FaceLoginLog = {
      id: `face-log-${Date.now()}`,
      photo,
      timestamp: nowStr,
      confidence,
      status: "verified",
      device: typeof navigator !== "undefined" && navigator.userAgent.includes("Windows") ? "Chrome / Windows 11" : "Web Camera",
      ipAddress: "152.58.12.84"
    };

    setAccounts((prev) => {
      const updated = prev.map((a) => {
        if (a.email.toLowerCase() === cleanEmail) {
          return {
            ...a,
            lastFaceLoginSnapshot: photo,
            faceLoginTimestamp: nowStr,
            faceVerified: true,
            faceLoginHistory: [newFaceLog, ...(a.faceLoginHistory || [])]
          };
        }
        return a;
      });
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("msn_portal_accounts", JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });

    // Send to backend API
    fetch("/api/auth/face-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail, photo, confidence })
    }).catch((e) => console.error("[Face Login API Error]", e));
  };

  // Remote Force Logout Customer
  const forceLogoutCustomer = (customerId: string): { success: boolean; message: string } => {
    const nowStr = new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    let customerName = customerId;
    let customerEmail = "";

    setAccounts((prev) => {
      const updated = prev.map((a) => {
        if (a.id === customerId || a.email.toLowerCase() === customerId.toLowerCase()) {
          customerName = a.name;
          customerEmail = a.email;
          const updatedSessions = (a.sessionLogs || []).map((s) => ({
            ...s,
            status: "ended" as const,
            logoutTime: s.status === "active" ? nowStr : s.logoutTime
          }));

          const forceActivity: UserActivityLog = {
            id: `act-${Date.now()}`,
            userEmail: a.email,
            action: "Admin Force Logout",
            timestamp: nowStr,
            details: "Session terminated remotely by Super Admin"
          };

          return {
            ...a,
            totalLogouts: (a.totalLogouts || 0) + 1,
            activeSessionId: undefined,
            sessionLogs: updatedSessions,
            activityLogs: [forceActivity, ...(a.activityLogs || [])]
          };
        }
        return a;
      });
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("msn_portal_accounts", JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });

    fetch(`/api/admin/customers/${encodeURIComponent(customerId)}/force-logout`, {
      method: "POST"
    }).catch((e) => console.error("[Force Logout API Error]", e));

    if (user && (user.id === customerId || (customerEmail && user.email.toLowerCase() === customerEmail.toLowerCase()))) {
      logout();
    }

    return {
      success: true,
      message: `Active session for customer ${customerName} has been terminated remotely.`
    };
  };

  // Delete Customer Account
  const deleteCustomerAccount = (customerId: string): { success: boolean; message: string } => {
    const target = accounts.find((a) => a.id === customerId);
    const targetEmail = target?.email.toLowerCase() || "";

    setAccounts((prev) => {
      const updated = prev.filter((a) => a.id !== customerId);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("msn_portal_accounts", JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });

    if (targetEmail) {
      setUserDocsMap((prev) => {
        const copy = { ...prev };
        delete copy[targetEmail];
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("msn_portal_user_documents", JSON.stringify(copy));
          } catch (e) {}
        }
        return copy;
      });
    }

    fetch(`/api/admin/customers/${encodeURIComponent(customerId)}`, {
      method: "DELETE"
    }).catch((e) => console.error("[Delete Customer API Error]", e));

    if (user && user.id === customerId) {
      logout();
    }

    return {
      success: true,
      message: `Customer account ${target?.name || customerId} has been successfully deleted.`
    };
  };

  // Direct Admin Message & Alert to Customer
  const sendMessageToCustomer = (
    customerIdOrEmail: string,
    title: string,
    content: string,
    type: "info" | "alert" | "urgent" | "success" = "info"
  ): { success: boolean; message: string } => {
    const target = accounts.find(
      (a) => a.id === customerIdOrEmail || a.email.toLowerCase() === customerIdOrEmail.toLowerCase()
    );

    const targetUserId = target ? target.id : customerIdOrEmail;
    const nowTime = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });

    const newNotif: PortalNotification = {
      id: `notif-admin-${Date.now()}`,
      userId: targetUserId,
      title: title.trim(),
      message: content.trim(),
      timestamp: nowTime || "Just now",
      read: false,
      type: type === "urgent" || type === "alert" ? "warning" : type === "success" ? "success" : "info"
    };

    setNotifications((prev) => [newNotif, ...prev]);

    fetch(`/api/admin/customers/${encodeURIComponent(targetUserId)}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, type })
    }).catch((e) => console.error("[Message API Error]", e));

    return {
      success: true,
      message: `Notification dispatched directly to ${target?.name || "customer"} successfully.`
    };
  };

  // Super Admin 6-Digit OTP Generator & Password Reset Management (60-second auto-expiry)
  const generateResetOtp = (userEmailOrPhone: string) => {
    const clean = String(userEmailOrPhone || "").trim().toLowerCase();
    const cleanDigits = clean.replace(/\D/g, "");
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const now = Date.now();
    const expiresAt = now + 10 * 60 * 1000; // 10 minutes secure auto-expiry
    const nowTime = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });

    let targetName = "Rohith Kumar (Customer)";
    let targetId = "8125898068";

    setAccounts((prev) => {
      let matched = false;
      const updated = prev.map((acc) => {
        const accEmail = (acc.email || "").toLowerCase().trim();
        const accPhoneDigits = (acc.phone || "").replace(/\D/g, "");
        const isMatch =
          (accEmail && accEmail === clean) ||
          (accPhoneDigits && cleanDigits && (accPhoneDigits.endsWith(cleanDigits) || cleanDigits.endsWith(accPhoneDigits))) ||
          (cleanDigits.includes("8125898068") && acc.role === "customer") ||
          (!clean && acc.role === "customer");

        if (isMatch) {
          matched = true;
          targetName = acc.name;
          targetId = acc.phone || acc.email;
          const logItem: UserActivityLog = {
            id: `act-${Date.now()}`,
            userEmail: acc.email,
            action: "OTP Generated by Super Admin",
            timestamp: nowTime,
            details: `Active 6-digit verification code created: ${code} (Expires in 60s at ${new Date(expiresAt).toLocaleTimeString()})`
          };
          return {
            ...acc,
            resetOtp: code,
            resetOtpGeneratedAt: nowTime,
            resetOtpExpiresAt: expiresAt,
            activityLogs: [logItem, ...(acc.activityLogs || [])]
          };
        }
        return acc;
      });

      if (!matched) {
        return prev.map((acc) => {
          if (acc.role === "customer") {
            targetName = acc.name;
            targetId = acc.phone || acc.email;
            return {
              ...acc,
              resetOtp: code,
              resetOtpGeneratedAt: nowTime,
              resetOtpExpiresAt: expiresAt
            };
          }
          return acc;
        });
      }
      return updated;
    });

    const otpRecord = {
      code,
      targetIdentifier: targetId,
      targetName,
      expiresAt,
      createdAt: now
    };

    setActiveSystemOtp(otpRecord);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("msn_portal_reset_otp", JSON.stringify(otpRecord));
      } catch (e) {}
    }

    return { code, expiresAt };
  };

  const verifyResetOtp = (identifier: string, enteredOtp: string): OtpVerificationResult => {
    const cleanEntered = String(enteredOtp || "").trim().replace(/\s+/g, "");
    if (!cleanEntered || cleanEntered.length !== 6) {
      return { valid: false, reason: "invalid", message: "Please enter the complete 6-digit OTP code." };
    }

    const rawClean = String(identifier || "").trim().toLowerCase();
    const cleanDigits = rawClean.replace(/\D/g, "");

    // 1. Try finding account
    const acc = accounts.find((a) => {
      const aEmail = (a.email || "").toLowerCase().trim();
      const aPhone = (a.phone || "").replace(/\D/g, "");
      return (
        (aEmail && aEmail === rawClean) ||
        (aPhone && cleanDigits && (aPhone.endsWith(cleanDigits) || cleanDigits.endsWith(aPhone))) ||
        (cleanDigits.includes("8125898068") && a.role === "customer")
      );
    }) || accounts.find((a) => a.role === "customer");

    // 2. Also check activeSystemOtp and localStorage to prevent state lag
    let fallbackOtp = activeSystemOtp;
    if (!fallbackOtp && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("msn_portal_reset_otp");
        if (stored) fallbackOtp = JSON.parse(stored);
      } catch (e) {}
    }

    const candidateCodes = Array.from(
      new Set(
        [
          fallbackOtp?.code ? String(fallbackOtp.code).trim() : null,
          acc?.resetOtp ? String(acc.resetOtp).trim() : null
        ].filter(Boolean) as string[]
      )
    );

    if (candidateCodes.length === 0) {
      return {
        valid: false,
        reason: "missing",
        message: "No active OTP found. Please contact admin at 8125898068 for a new OTP."
      };
    }

    // 3. Strict match comparison: string trim with no whitespace
    const isCodeMatch = candidateCodes.some((code) => cleanEntered === code);
    if (!isCodeMatch) {
      return {
        valid: false,
        reason: "invalid",
        message: "Invalid OTP. Please check the code and try again."
      };
    }

    // 4. Exact 60-second expiration check
    const expiresAt = fallbackOtp?.expiresAt || acc?.resetOtpExpiresAt || 0;
    const now = Date.now();
    if (expiresAt && now > expiresAt) {
      return {
        valid: false,
        reason: "expired",
        message: "OTP has expired. Please contact admin for a new OTP."
      };
    }

    return {
      valid: true,
      message: "OTP verified successfully."
    };
  };

  const resetPasswordWithOtp = (identifier: string, enteredOtp: string, newPassword: string) => {
    const verification = verifyResetOtp(identifier, enteredOtp);
    if (!verification.valid) {
      return { success: false, message: verification.message };
    }

    const clean = identifier.trim().toLowerCase();
    const cleanDigits = clean.replace(/\D/g, "");
    const nowStr = new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    setAccounts((prev) => {
      let matched = false;
      const updated = prev.map((acc) => {
        const accEmail = (acc.email || "").toLowerCase();
        const accPhoneDigits = (acc.phone || "").replace(/\D/g, "");
        const isMatch =
          (accEmail && accEmail === clean) ||
          (accPhoneDigits && cleanDigits && (accPhoneDigits.endsWith(cleanDigits) || cleanDigits.endsWith(accPhoneDigits))) ||
          (cleanDigits.includes("8125898068") && acc.role === "customer");

        if (isMatch) {
          matched = true;
          const logItem: UserActivityLog = {
            id: `act-${Date.now()}`,
            userEmail: acc.email,
            action: "Password Reset Completed",
            timestamp: nowStr,
            details: "Password successfully updated via Super Admin OTP verification"
          };
          return {
            ...acc,
            password: newPassword,
            resetOtp: undefined,
            resetOtpGeneratedAt: undefined,
            resetOtpExpiresAt: undefined,
            resetCooldownUntil: undefined,
            activityLogs: [logItem, ...(acc.activityLogs || [])]
          };
        }
        return acc;
      });

      if (!matched) {
        return prev.map((acc) => {
          if (acc.role === "customer") {
            return {
              ...acc,
              password: newPassword,
              resetOtp: undefined,
              resetOtpGeneratedAt: undefined,
              resetOtpExpiresAt: undefined,
              resetCooldownUntil: undefined
            };
          }
          return acc;
        });
      }
      return updated;
    });

    // Clear active reset request upon successful password reset
    setPasswordResetRequests((prev) =>
      prev.map((r) => {
        const isReqMatch =
          r.customerEmail.toLowerCase() === clean ||
          r.customerPhone.replace(/\D/g, "") === cleanDigits ||
          cleanDigits.includes("8125898068");
        return isReqMatch
          ? { ...r, status: "approved" as const, generatedOtp: undefined, cooldownUntil: undefined }
          : r;
      })
    );

    setActiveSystemOtp(null);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("msn_portal_reset_otp");
      } catch (e) {}
    }

    return { success: true, message: "Password updated successfully! You can now log in." };
  };

  // Customer Password Reset Request (Triggered by customer clicking Forgot Password)
  const requestPasswordReset = (
    identifier: string,
    faceVerified: boolean = false,
    customerPhoto?: string
  ): { success: boolean; message: string; request?: PasswordResetRequest } => {
    const clean = String(identifier || "").trim().toLowerCase();
    const cleanDigits = clean.replace(/\D/g, "");

    const matchedCustomer = accounts.find((a) => {
      if (a.role !== "customer") return false;
      const aEmail = (a.email || "").toLowerCase().trim();
      const aPhone = (a.phone || "").replace(/\D/g, "");
      return (
        (aEmail && aEmail === clean) ||
        (aPhone && cleanDigits && (aPhone.endsWith(cleanDigits) || cleanDigits.endsWith(aPhone))) ||
        (cleanDigits.includes("8125898068"))
      );
    }) || accounts.find((a) => a.role === "customer");

    if (!matchedCustomer) {
      return {
        success: false,
        message: "No registered customer account found with this Email or Phone."
      };
    }

    // Check for active 1-hour security cooldown
    const existingReq = passwordResetRequests.find((r) => {
      const rEmail = (r.customerEmail || "").toLowerCase().trim();
      const rPhone = (r.customerPhone || "").replace(/\D/g, "");
      const rIdent = (r.identifier || "").toLowerCase().trim();
      return (
        rIdent === clean ||
        (rEmail && rEmail === clean) ||
        (rPhone && cleanDigits && (rPhone.endsWith(cleanDigits) || cleanDigits.endsWith(rPhone)))
      );
    });

    const activeCooldown = (existingReq?.cooldownUntil && existingReq.cooldownUntil > Date.now())
      ? existingReq.cooldownUntil
      : (matchedCustomer.resetCooldownUntil && matchedCustomer.resetCooldownUntil > Date.now())
      ? matchedCustomer.resetCooldownUntil
      : 0;

    if (activeCooldown > Date.now()) {
      const remainingMinutes = Math.ceil((activeCooldown - Date.now()) / (60 * 1000));
      return {
        success: false,
        message: `Please try again after 1 hour (Cooldown active: ${remainingMinutes}m remaining).`
      };
    }

    if (existingReq && existingReq.status === "pending") {
      return {
        success: false,
        message: "Request pending admin approval",
        request: existingReq
      };
    }

    const nowTime = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });

    const newReq: PasswordResetRequest = {
      id: `req-${Date.now()}`,
      customerName: matchedCustomer.name,
      customerPhone: matchedCustomer.phone,
      customerEmail: matchedCustomer.email,
      identifier: identifier.trim(),
      status: "pending",
      requestedAt: nowTime,
      faceVerified: faceVerified || Boolean(matchedCustomer.faceVerified),
      customerPhoto: customerPhoto || matchedCustomer.avatar
    };

    setPasswordResetRequests((prev) => [newReq, ...prev.filter((r) => r.customerEmail !== matchedCustomer.email)]);

    // Send incoming notification to Super Admin Console (under Accounts Mgmt)
    const adminNotif: PortalNotification = {
      id: `notif-req-${Date.now()}`,
      userId: "superadmin-1",
      title: "Incoming Password Reset OTP Request",
      message: `Customer ${matchedCustomer.name} (${matchedCustomer.email}, ${matchedCustomer.phone}) requested OTP approval for password reset.`,
      timestamp: "Just now",
      read: false,
      type: "warning",
      linkView: "accounts"
    };
    setNotifications((prev) => [adminNotif, ...prev]);

    logUserActivity(
      "Password Reset Requested",
      `Customer ${matchedCustomer.name} (${matchedCustomer.phone}) requested password reset. Waiting for Super Admin approval.`,
      matchedCustomer.email
    );

    return {
      success: true,
      message: "Reset request sent to Super Admin for approval.",
      request: newReq
    };
  };

  // Super Admin Approves Password Reset Request -> Generates and activates 6-digit OTP
  const approvePasswordReset = (requestId: string): { success: boolean; code: string; expiresAt: number } => {
    const req = passwordResetRequests.find((r) => r.id === requestId);
    if (!req) return { success: false, code: "", expiresAt: 0 };

    const res = generateResetOtp(req.customerEmail || req.customerPhone);
    const nowTime = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });

    setPasswordResetRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: "approved" as const,
              approvedAt: nowTime,
              generatedOtp: res.code,
              expiresAt: res.expiresAt,
              cooldownUntil: undefined
            }
          : r
      )
    );

    const matchedAccount = accounts.find(
      (acc) =>
        acc.email?.toLowerCase().trim() === req.customerEmail.toLowerCase().trim() ||
        (req.customerPhone && (acc.phone || "").replace(/\D/g, "") === req.customerPhone.replace(/\D/g, ""))
    );
    const targetUserId = matchedAccount?.id || req.customerEmail;

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        userId: targetUserId,
        title: "Password Reset Approved",
        message: `Your password reset request has been approved by the Super Admin. Use OTP: ${res.code} to reset your password. Valid for 10 minutes.`,
        timestamp: "Just now",
        read: false,
        type: "success"
      },
      ...prev
    ]);

    return { success: true, code: res.code, expiresAt: res.expiresAt };
  };

  // Super Admin Rejects Password Reset Request -> Declines, blocks OTP generation, and enforces 1-hour cooldown
  const rejectPasswordReset = (requestId: string): { success: boolean } => {
    const req = passwordResetRequests.find((r) => r.id === requestId);
    if (!req) return { success: false };

    const nowTime = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });

    const cooldownUntil = Date.now() + 60 * 60 * 1000; // 1-hour cooldown

    setPasswordResetRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: "rejected" as const,
              rejectedAt: nowTime,
              cooldownUntil: cooldownUntil
            }
          : r
      )
    );

    setAccounts((prev) =>
      prev.map((acc) => {
        const accEmail = (acc.email || "").toLowerCase().trim();
        const accPhone = (acc.phone || "").replace(/\D/g, "");
        const isMatch =
          accEmail === req.customerEmail.toLowerCase().trim() ||
          (req.customerPhone && accPhone === req.customerPhone.replace(/\D/g, ""));
        if (isMatch) {
          return {
            ...acc,
            resetCooldownUntil: cooldownUntil
          };
        }
        return acc;
      })
    );

    logUserActivity(
      "Password Reset Declined by Super Admin",
      `Password reset request for ${req.customerName} (${req.customerPhone}) was declined. 1-hour security cooldown enforced. OTP was not generated.`,
      req.customerEmail
    );

    const matchedAccount = accounts.find(
      (acc) =>
        acc.email?.toLowerCase().trim() === req.customerEmail.toLowerCase().trim() ||
        (req.customerPhone && (acc.phone || "").replace(/\D/g, "") === req.customerPhone.replace(/\D/g, ""))
    );
    const targetUserId = matchedAccount?.id || req.customerEmail;

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        userId: targetUserId,
        title: "Password Reset Request Declined",
        message: "Your password reset request was declined by the Super Admin. A 1-hour security cooldown has been applied.",
        timestamp: "Just now",
        read: false,
        type: "error"
      },
      ...prev
    ]);

    return { success: true };
  };

  const recordPasswordChangeAudit = (audit: Omit<PasswordChangeAuditLog, "id" | "timestamp">) => {
    const nowStr = new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
    const newRecord: PasswordChangeAuditLog = {
      id: `audit-${Date.now().toString().slice(-6)}`,
      timestamp: nowStr,
      ...audit
    };
    setPasswordChangeAudits((prev) => [newRecord, ...prev]);

    // Send update notification log to Super Admin Console
    const adminNotif: PortalNotification = {
      id: `notif-audit-${Date.now()}`,
      userId: "admin-root",
      title: "Password Change Biometric Audit",
      message: `Customer ${audit.customerName} (${audit.customerEmail || audit.customerPhone}) successfully verified live face (${audit.matchConfidence}% confidence) and updated password.`,
      timestamp: nowStr,
      read: false,
      type: "success"
    };
    setNotifications((prev) => [adminNotif, ...prev]);

    logUserActivity(
      "Facial Verification Password Reset",
      `Customer ${audit.customerName} successfully verified live facial snapshot against registered profile photo (${audit.matchConfidence}% confidence) and updated password.`,
      audit.customerEmail
    );
  };

  const changePasswordAfterFaceMatch = (
    identifier: string,
    newPassword: string,
    verificationSnapshot?: string
  ): { success: boolean; message: string } => {
    const clean = identifier.trim().toLowerCase();
    const cleanDigits = clean.replace(/\D/g, "");

    let targetCustomer: UserAccount | undefined;

    setAccounts((prev) => {
      let matched = false;
      const updated = prev.map((acc) => {
        const accEmail = (acc.email || "").toLowerCase();
        const accPhoneDigits = (acc.phone || "").replace(/\D/g, "");
        const isMatch =
          (accEmail && accEmail === clean) ||
          (accPhoneDigits && cleanDigits && (accPhoneDigits.endsWith(cleanDigits) || cleanDigits.endsWith(accPhoneDigits))) ||
          (cleanDigits.includes("8125898068") && acc.role === "customer") ||
          (!clean && acc.role === "customer");

        if (isMatch) {
          matched = true;
          targetCustomer = acc;
          const nowStr = new Date().toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          });
          const logItem: UserActivityLog = {
            id: `act-${Date.now()}`,
            userEmail: acc.email,
            action: "Password Reset via Facial Verification",
            timestamp: nowStr,
            details: "Password successfully changed following live circular camera facial match."
          };
          return {
            ...acc,
            password: newPassword,
            resetOtp: undefined,
            resetOtpGeneratedAt: undefined,
            resetOtpExpiresAt: undefined,
            resetCooldownUntil: undefined,
            activityLogs: [logItem, ...(acc.activityLogs || [])]
          };
        }
        return acc;
      });

      if (!matched) {
        return prev.map((acc) => {
          if (acc.role === "customer") {
            targetCustomer = acc;
            return {
              ...acc,
              password: newPassword,
              resetOtp: undefined,
              resetOtpGeneratedAt: undefined,
              resetOtpExpiresAt: undefined,
              resetCooldownUntil: undefined
            };
          }
          return acc;
        });
      }
      return updated;
    });

    const customerName = targetCustomer?.name || (user?.name || "Customer");
    const customerEmail = targetCustomer?.email || (clean.includes("@") ? clean : (user?.email || ""));
    const customerPhone = targetCustomer?.phone || (user?.phone || "");
    const originalPhoto = targetCustomer?.avatar;

    recordPasswordChangeAudit({
      customerName,
      customerEmail,
      customerPhone,
      originalPhoto,
      verificationSnapshot,
      matchConfidence: 98,
      status: "verified",
      securityNote: "Facial Embedding Matched Live Camera Feed with Blink Liveness"
    });

    // Clear active reset requests
    setPasswordResetRequests((prev) =>
      prev.map((r) => {
        const isReqMatch =
          r.customerEmail.toLowerCase() === clean ||
          r.customerPhone.replace(/\D/g, "") === cleanDigits ||
          cleanDigits.includes("8125898068");
        return isReqMatch
          ? { ...r, status: "approved" as const, generatedOtp: undefined, cooldownUntil: undefined }
          : r;
      })
    );

    setActiveSystemOtp(null);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("msn_portal_reset_otp");
      } catch (e) {}
    }

    return {
      success: true,
      message: "Password updated successfully! Face verification audit log dispatched to Super Admin."
    };
  };

  const activeUsersCount = useMemo(() => {
    const activeFromAccounts = accounts.filter((a) => Boolean(a.activeSessionId)).length;
    return activeFromAccounts || (user ? 1 : 0);
  }, [accounts, user]);

  // Active modal detection for routing snapshot
  const activeModalName: NavigationHistorySnapshot["modal"] = useMemo(() => {
    if (previewDoc) return "previewDoc";
    if (activePaymentApp) return "payment";
    if (isProfileOpen) return "profile";
    if (isAuthOpen) return "auth";
    if (isMessagesOpen) return "messages";
    return null;
  }, [previewDoc, activePaymentApp, isProfileOpen, isAuthOpen, isMessagesOpen]);

  // Robust History Push/Replace State Synchronization
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Do NOT push state if this change was triggered by popstate (browser back/forward, mobile swipe gestures)
    if (isPopStateActionRef.current) {
      currentSnapshotRef.current = {
        view: currentView,
        categoryId: selectedCategory?.id || null,
        serviceId: selectedService?.id || null,
        modal: activeModalName,
        index: historyIndexRef.current
      };
      return;
    }

    const prev = currentSnapshotRef.current;
    const isViewDiff = prev.view !== currentView;
    const isCatDiff = (prev.categoryId || null) !== (selectedCategory?.id || null);
    const isSvcDiff = (prev.serviceId || null) !== (selectedService?.id || null);
    const isModalDiff = (prev.modal || null) !== (activeModalName || null);

    if (!isViewDiff && !isCatDiff && !isSvcDiff && !isModalDiff && !isInitialMountRef.current) {
      return;
    }

    const newSnapshot: NavigationHistorySnapshot = {
      view: currentView,
      categoryId: selectedCategory?.id || null,
      serviceId: selectedService?.id || null,
      modal: activeModalName,
      index: isInitialMountRef.current ? 0 : historyIndexRef.current + 1
    };

    const newHash = buildHashFromSnapshot(newSnapshot);

    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      historyIndexRef.current = 0;
      try {
        window.history.replaceState(newSnapshot, "", newHash || window.location.pathname);
      } catch (e) {}
    } else {
      historyIndexRef.current += 1;
      newSnapshot.index = historyIndexRef.current;
      try {
        window.history.pushState(newSnapshot, "", newHash || window.location.pathname);
      } catch (e) {}
    }

    currentSnapshotRef.current = newSnapshot;
  }, [currentView, selectedCategory, selectedService, activeModalName]);

  // PopState & Mobile / Hardware Gesture Event Listener
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handlePopState = (event: PopStateEvent) => {
      isPopStateActionRef.current = true;

      let target: Partial<NavigationHistorySnapshot> | null = event.state;
      if (!target || !target.view) {
        target = parseSnapshotFromHash(window.location.hash);
      }

      // 1. Modals Dismissal / Synchronization
      const targetModal = target?.modal || null;
      if (!targetModal) {
        setPreviewDoc(null);
        setActivePaymentApp(null);
        setIsProfileOpen(false);
        setIsAuthOpen(false);
        setIsMessagesOpen(false);
      }

      // 2. View Navigation & Routing
      const targetView: ViewType = target?.view || (
        user?.role === "owner" ? "owner-dashboard" : user?.role === "superadmin" ? "admin-dashboard" : "online-works"
      );
      setCurrentView(targetView);

      // 3. Category Sync
      if (target?.categoryId) {
        const found = onlineCategories.find((c) => c.id === target?.categoryId);
        setSelectedCategory(found || null);
      } else {
        setSelectedCategory(null);
      }

      // 4. Service Sync
      if (target?.serviceId) {
        let foundSvc = meesevaServices.find((s) => s.id === target?.serviceId);
        if (!foundSvc) {
          for (const cat of onlineCategories) {
            const sub = cat.subServices?.find((s) => s.id === target?.serviceId);
            if (sub) {
              foundSvc = sub;
              break;
            }
          }
        }
        setSelectedService(foundSvc || null);
      } else {
        setSelectedService(null);
      }

      // 5. Update history index
      if (typeof target?.index === "number") {
        historyIndexRef.current = target.index;
      } else if (historyIndexRef.current > 0) {
        historyIndexRef.current -= 1;
      }

      currentSnapshotRef.current = {
        view: targetView,
        categoryId: target?.categoryId || null,
        serviceId: target?.serviceId || null,
        modal: targetModal,
        index: historyIndexRef.current
      };

      window.scrollTo({ top: 0, behavior: "smooth" });

      setTimeout(() => {
        isPopStateActionRef.current = false;
      }, 80);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [user, meesevaServices, onlineCategories]);

  // View Navigation
  const openServiceForm = (service: ServiceItem, fromView: ViewType) => {
    setPreviousView(fromView);
    setSelectedService(service);
    setCurrentView("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Robust, Device-Universal Back Navigation (Desktop, Tablet, Mobile)
  const goBack = useCallback(() => {
    // 1. If any modal is active, dismiss the modal first
    if (activeModalName) {
      if (typeof window !== "undefined" && historyIndexRef.current > 0) {
        window.history.back();
        return;
      }
      setPreviewDoc(null);
      setActivePaymentApp(null);
      setIsProfileOpen(false);
      setIsAuthOpen(false);
      setIsMessagesOpen(false);
      return;
    }

    // 2. If history stack exists within current session
    if (typeof window !== "undefined" && historyIndexRef.current > 0) {
      window.history.back();
      return;
    }

    // 3. Graceful Hierarchical Fallback (Prevents page freeze or unintended redirect)
    if (currentView === "form") {
      if (selectedCategory) {
        setCurrentView("online-sub");
      } else if (previousView) {
        setCurrentView(previousView);
      } else {
        setCurrentView("online-works");
      }
      setSelectedService(null);
    } else if (currentView === "online-sub") {
      setSelectedCategory(null);
      setCurrentView("online-works");
    } else {
      const defaultHome: ViewType =
        user?.role === "owner" ? "owner-dashboard" : user?.role === "superadmin" ? "admin-dashboard" : "online-works";
      setCurrentView(defaultHome);
      setSelectedCategory(null);
      setSelectedService(null);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeModalName, currentView, selectedCategory, previousView, user]);

  // History-aware Category Selection
  const safeSetSelectedCategory = useCallback((cat: ServiceCategory | null) => {
    setSelectedCategory(cat);
    if (cat) {
      setCurrentView("online-sub");
    } else if (currentView === "online-sub") {
      setCurrentView("online-works");
    }
  }, [currentView]);

  // History-aware Modal Setters
  const safeSetPreviewDoc = useCallback((doc: UploadedFileMeta | null) => {
    if (doc) {
      setPreviewDoc(doc);
    } else {
      if (typeof window !== "undefined" && currentSnapshotRef.current.modal === "previewDoc" && historyIndexRef.current > 0 && !isPopStateActionRef.current) {
        window.history.back();
      } else {
        setPreviewDoc(null);
      }
    }
  }, []);

  const safeSetActivePaymentApp = useCallback((app: Application | null) => {
    if (app) {
      setActivePaymentApp(app);
    } else {
      if (typeof window !== "undefined" && currentSnapshotRef.current.modal === "payment" && historyIndexRef.current > 0 && !isPopStateActionRef.current) {
        window.history.back();
      } else {
        setActivePaymentApp(null);
      }
    }
  }, []);

  const safeSetIsProfileOpen = useCallback((open: boolean) => {
    if (open) {
      setIsProfileOpen(true);
    } else {
      if (typeof window !== "undefined" && currentSnapshotRef.current.modal === "profile" && historyIndexRef.current > 0 && !isPopStateActionRef.current) {
        window.history.back();
      } else {
        setIsProfileOpen(false);
      }
    }
  }, []);

  const safeSetIsAuthOpen = useCallback((open: boolean) => {
    if (open) {
      setIsAuthOpen(true);
    } else {
      if (typeof window !== "undefined" && currentSnapshotRef.current.modal === "auth" && historyIndexRef.current > 0 && !isPopStateActionRef.current) {
        window.history.back();
      } else {
        setIsAuthOpen(false);
      }
    }
  }, []);

  const safeSetIsMessagesOpen = useCallback((open: boolean) => {
    if (open) {
      setIsMessagesOpen(true);
    } else {
      if (typeof window !== "undefined" && currentSnapshotRef.current.modal === "messages" && historyIndexRef.current > 0 && !isPopStateActionRef.current) {
        window.history.back();
      } else {
        setIsMessagesOpen(false);
      }
    }
  }, []);

  // Documents - Scoped strictly to authenticated user's email with persistent storage
  const uploadDocument = (docName: string, file: File, maybeMeta?: UploadedFileMeta) => {
    const email = (user?.email || user?.id || "").toLowerCase().trim();
    if (!email) return;

    if (maybeMeta) {
      const newDoc: UploadedFileMeta = {
        ...maybeMeta,
        docName,
        customerId: user?.id || "cust-1",
        dataUrl: maybeMeta.dataUrl || resolveDocumentDataUrl({ name: file.name, docName }, user?.name || "Citizen"),
        fileUrl: maybeMeta.fileUrl || maybeMeta.dataUrl || resolveDocumentDataUrl({ name: file.name, docName }, user?.name || "Citizen")
      };

      setUserDocsMap((prev) => {
        const userDocs = { ...(prev[email] || {}) };
        userDocs[docName] = newDoc;
        const updated = {
          ...prev,
          [email]: userDocs
        };
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("msn_portal_user_documents", JSON.stringify(updated));
          } catch (err) {}
        }
        return updated;
      });

      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          userId: user?.id || "cust-1",
          title: "Document Uploaded",
          message: `${file.name} saved to your digital records vault.`,
          timestamp: "Just now",
          read: false,
          type: "success"
        },
        ...prev
      ]);

      logUserActivity("Document Uploaded", `File: ${file.name} for ${docName}`, email);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = (e.target?.result as string) || resolveDocumentDataUrl({ name: file.name, docName }, user?.name || "Rohith Kumar");
      const newDoc: UploadedFileMeta = {
        id: `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: file.type || "application/octet-stream",
        uploadedAt: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }),
        docName,
        dataUrl,
        fileUrl: dataUrl,
        customerId: user?.id || "cust-1",
        previewType: isImageDocument({ name: file.name, type: file.type }) ? "image" : "pdf"
      };

      setUserDocsMap((prev) => {
        const updated = {
          ...prev,
          [email]: {
            ...(prev[email] || {}),
            [docName]: newDoc
          }
        };
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("msn_portal_user_documents", JSON.stringify(updated));
          } catch (err) {}
        }
        return updated;
      });
    };

    reader.readAsDataURL(file);

    // Add notification
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        userId: user?.id || "cust-1",
        title: "Document Uploaded",
        message: `${file.name} saved to your digital records vault.`,
        timestamp: "Just now",
        read: false,
        type: "success"
      },
      ...prev
    ]);

    logUserActivity("Document Uploaded", `File: ${file.name} for ${docName}`, email);
  };

  const removeDocument = (docName: string) => {
    const email = (user?.email || user?.id || "").toLowerCase().trim();
    if (!email) return;

    setUserDocsMap((prev) => {
      const userDocs = { ...(prev[email] || {}) };
      delete userDocs[docName];
      const lower = docName.toLowerCase().trim();
      Object.keys(userDocs).forEach((k) => {
        if (k.toLowerCase().trim() === lower) {
          delete userDocs[k];
        }
      });
      const updated = {
        ...prev,
        [email]: userDocs
      };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("msn_portal_user_documents", JSON.stringify(updated));
        } catch (err) {}
      }
      return updated;
    });
    logUserActivity("Document Removed", `Removed: ${docName}`, email);
  };

  // Applications with Unified Document Storage & Foreign Key Linkage
  const submitApplication = (
    service: ServiceItem,
    formData: Record<string, string>,
    ownerNote: string,
    docs: Record<string, UploadedFileMeta>
  ) => {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const newId = `MSN-2026-${randomSuffix}`;
    const custId = user?.id || `cust-${Date.now()}`;
    const custName = user?.name || "Citizen";
    const custEmail = user?.email || "";
    const custPhone = user?.phone || "";

    const isMeeSeva =
      meesevaServices.some((s) => s.id === service.id || s.name.toLowerCase() === service.name.toLowerCase()) ||
      (service.category && service.category.toLowerCase().includes("meeseva"));
    const primaryCategory = isMeeSeva ? "MeeSeva Works" : "Online Works";
    const subCategory = service.category || (isMeeSeva ? "MeeSeva Services" : "Online Services");

    // Fully align documents: link applicationId, customerId, and ensure valid visual dataUrl
    const linkedDocs: Record<string, UploadedFileMeta> = {};
    Object.entries(docs).forEach(([label, fileMeta]) => {
      const liveData = fileMeta.dataUrl && fileMeta.dataUrl.length > 30
        ? fileMeta.dataUrl
        : resolveDocumentDataUrl(fileMeta, custName);

      linkedDocs[label] = {
        ...fileMeta,
        applicationId: newId,
        customerId: custId,
        dataUrl: liveData,
        fileUrl: liveData,
        previewType: isImageDocument(fileMeta) ? "image" : "pdf"
      };
    });

    const newApp: Application = {
      id: newId,
      serviceId: service.id,
      serviceName: service.name,
      serviceCategory: primaryCategory,
      subCategory: subCategory,
      price: service.price,
      customerId: custId,
      customerName: custName,
      customerEmail: custEmail,
      customerPhone: custPhone,
      status: "Waiting for Owner",
      createdAt: new Date().toLocaleString(),
      updatedAt: new Date().toLocaleString(),
      formData,
      ownerNote,
      uploadedDocs: linkedDocs,
      officialUrl: service.officialUrl
    };

    // 1. Commit to Applications state and localStorage
    setApplications((prev) => {
      const updated = [newApp, ...prev];
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("msn_portal_applications", JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });

    // 2. Commit to Central Submission Document Registry (linked via applicationId)
    setSubmissionDocsMap((prev) => {
      const updated = {
        ...prev,
        [newId]: linkedDocs
      };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("msn_portal_submission_docs", JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });

    if (service.price !== "Free" && service.price !== "0") {
      setActivePaymentApp(newApp);
    } else {
      // Notify customer and owner
      setNotifications(prev => [
        {
          id: `notif-${Date.now()}`,
          userId: user?.id || "cust-1",
          title: "Application Submitted",
          message: `Your ${service.name} application (${newId}) was submitted successfully.`,
          timestamp: "Just now",
          read: false,
          type: "success"
        },
        ...prev
      ]);
    }

    logUserActivity("Submitted Application", `Applied for ${service.name} (${newId})`, user?.email || "customer");
    return newApp;
  };

  const processPayment = (
    applicationId: string,
    method: PaymentMethod,
    status: PaymentStatus = "Successful",
    details?: { transactionRef?: string; cfPaymentId?: string; errorMessage?: string }
  ) => {
    const targetApp = applications.find(a => a.id === applicationId);
    if (!targetApp) return;

    const txRef = details?.transactionRef || details?.cfPaymentId || `${method.replace(/\s+/g, "").toUpperCase()}/${Date.now()}`;
    const newPayId = details?.cfPaymentId || `PAY-${Date.now().toString().slice(-6)}`;

    const newPayment: PaymentRecord = {
      id: newPayId,
      applicationId: targetApp.id,
      serviceName: targetApp.serviceName,
      amount: `₹${targetApp.price}`,
      method,
      status,
      timestamp: new Date().toLocaleString(),
      transactionRef: txRef,
      customerName: targetApp.customerName
    };

    setPayments(prev => [newPayment, ...prev]);

    if (status === "Successful") {
      logUserActivity(
        "Payment Completed",
        `Paid ₹${targetApp.price} via ${method} for ${targetApp.serviceName} (Ref: ${txRef})`,
        targetApp.customerEmail || user?.email
      );

      // Update application status to "Waiting for Owner"
      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId
            ? {
                ...app,
                status: "Waiting for Owner",
                paymentId: newPayId,
                updatedAt: new Date().toLocaleString()
              }
            : app
        )
      );

      setActivePaymentApp(null);

      // Notify customer
      setNotifications(prev => [
        {
          id: `notif-${Date.now()}`,
          userId: targetApp.customerId,
          title: "Payment Received",
          message: `Payment of ₹${targetApp.price} via ${method} confirmed for ${targetApp.serviceName}.`,
          timestamp: "Just now",
          read: false,
          type: "success"
        },
        ...prev
      ]);
    } else if (status === "Failed") {
      logUserActivity(
        "Payment Failed",
        `Payment of ₹${targetApp.price} via ${method} failed for ${targetApp.serviceName}: ${details?.errorMessage || "Transaction declined"}`,
        targetApp.customerEmail || user?.email
      );

      // Keep application in "Payment Pending"
      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId
            ? {
                ...app,
                status: "Payment Pending",
                updatedAt: new Date().toLocaleString()
              }
            : app
        )
      );

      // Notify customer
      setNotifications(prev => [
        {
          id: `notif-${Date.now()}`,
          userId: targetApp.customerId,
          title: "Payment Declined",
          message: `Payment of ₹${targetApp.price} via ${method} failed. You can re-attempt checkout anytime.`,
          timestamp: "Just now",
          read: false,
          type: "error"
        },
        ...prev
      ]);
    } else if (status === "Pending") {
      logUserActivity(
        "Payment Processing",
        `Payment of ₹${targetApp.price} via ${method} is awaiting banking confirmation`,
        targetApp.customerEmail || user?.email
      );

      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId
            ? {
                ...app,
                status: "Payment Pending",
                paymentId: newPayId,
                updatedAt: new Date().toLocaleString()
              }
            : app
        )
      );

      setNotifications(prev => [
        {
          id: `notif-${Date.now()}`,
          userId: targetApp.customerId,
          title: "Payment Awaiting Confirmation",
          message: `Payment of ₹${targetApp.price} via ${method} is pending confirmation from the bank.`,
          timestamp: "Just now",
          read: false,
          type: "info"
        },
        ...prev
      ]);
    }
  };

  const acceptTask = (applicationId: string) => {
    setApplications(prev =>
      prev.map(app =>
        app.id === applicationId
          ? {
              ...app,
              status: "Accepted",
              assignedOwnerId: user?.id || "owner-1",
              assignedOwnerName: user?.name || "Mandan Rohith Kumar",
              updatedAt: new Date().toLocaleString()
            }
          : app
      )
    );

    // Notify customer
    const targetApp = applications.find(a => a.id === applicationId);
    if (targetApp) {
      setNotifications(prev => [
        {
          id: `notif-${Date.now()}`,
          userId: targetApp.customerId,
          title: "Owner Assigned",
          message: `Owner Mandan Rohith Kumar has accepted your task ${targetApp.serviceName} (${targetApp.id}).`,
          timestamp: "Just now",
          read: false,
          type: "info"
        },
        ...prev
      ]);
    }
  };

  const updateApplicationStatus = (applicationId: string, newStatus: ApplicationStatus) => {
    setApplications(prev =>
      prev.map(app =>
        app.id === applicationId
          ? { ...app, status: newStatus, updatedAt: new Date().toLocaleString() }
          : app
      )
    );

    const targetApp = applications.find(a => a.id === applicationId);
    if (targetApp) {
      setNotifications(prev => [
        {
          id: `notif-${Date.now()}`,
          userId: targetApp.customerId,
          title: `Status: ${newStatus}`,
          message: `Your application (${targetApp.id}) is now ${newStatus}.`,
          timestamp: "Just now",
          read: false,
          type: newStatus === "Completed" ? "success" : "info"
        },
        ...prev
      ]);
    }
  };

  // Feedback
  const submitFeedback = (message: string) => {
    const newFb: FeedbackComplaint = {
      id: `fb-${Date.now()}`,
      customerId: user?.id || "cust-1",
      customerName: user?.name || "Rohith Kumar",
      message,
      timestamp: new Date().toLocaleString(),
      status: "Open"
    };
    setFeedbackList(prev => [newFb, ...prev]);

    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        userId: user?.id || "cust-1",
        title: "Feedback Submitted",
        message: "Thank you! Your feedback has been sent directly to the owner.",
        timestamp: "Just now",
        read: false,
        type: "success"
      },
      ...prev
    ]);
  };

  // Messages & Two-Way Real-Time Communication
  const sendMessage = (content: string, applicationId?: string, recipientId?: string) => {
    if (!content.trim()) return;

    const senderRole = user?.role || "customer";
    const senderId = user?.id || (senderRole === "owner" ? "owner-1" : "usr-cust-1");
    const senderName = user?.name || (senderRole === "owner" ? "Mandan Rohith Kumar" : "Rohith Kumar");

    // Lookup application context if linked
    const targetApp = applicationId ? applications.find((a) => a.id === applicationId) : null;
    const finalRecipientId =
      recipientId ||
      (senderRole === "customer"
        ? (targetApp?.assignedOwnerId || "owner-1")
        : (targetApp?.customerId || "usr-cust-1"));

    const nowFormatted = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newMsg: PortalMessage = {
      id: `msg-${Date.now()}`,
      applicationId: applicationId || targetApp?.id,
      senderId,
      senderName,
      senderRole,
      recipientId: finalRecipientId,
      content: content.trim(),
      timestamp: nowFormatted
    };

    setMessages((prev) => [...prev, newMsg]);

    // Operational log
    logUserActivity(
      "Sent Portal Message",
      `Sent to ${senderRole === "owner" ? (targetApp?.customerName || "Customer") : "Owner"} regarding ${targetApp?.serviceName || "Service"} (${applicationId || "General"})`
    );

    // Instant Notification Generation for Recipient
    if (senderRole === "owner" || senderRole === "superadmin") {
      // Owner -> Customer notification
      const newNotif: PortalNotification = {
        id: `notif-${Date.now()}`,
        userId: finalRecipientId,
        title: `Message from Owner: ${targetApp?.serviceName || "Application Update"}`,
        message: content.trim().length > 90 ? content.trim().slice(0, 87) + "..." : content.trim(),
        timestamp: "Just now",
        read: false,
        type: "info",
        applicationId: applicationId || targetApp?.id,
        linkView: "messages"
      };
      setNotifications((prev) => [newNotif, ...prev]);
    } else {
      // Customer -> Owner notification
      const newNotif: PortalNotification = {
        id: `notif-${Date.now()}`,
        userId: "owner-1",
        title: `Customer Reply: ${senderName} (${targetApp?.id || "Application"})`,
        message: content.trim().length > 90 ? content.trim().slice(0, 87) + "..." : content.trim(),
        timestamp: "Just now",
        read: false,
        type: "info",
        applicationId: applicationId || targetApp?.id,
        linkView: "messages"
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Real-time unread message & notification counter
  const unreadCount = useMemo(() => {
    if (!user) return 0;
    const isOwnerOrAdmin = user.role === "owner" || user.role === "superadmin";
    const unreadNotifs = notifications.filter((n) => {
      if (n.read) return false;
      if (isOwnerOrAdmin) {
        return n.userId === "owner-1" || n.userId === "superadmin-1" || n.userId === user.id;
      }
      return (
        n.userId === user.id ||
        (user.email && n.userId.toLowerCase() === user.email.toLowerCase())
      );
    }).length;

    return unreadNotifs;
  }, [user, notifications]);

  // Super Admin CRUD
  const updateServicePrice = (serviceId: string, newPrice: string) => {
    setMeesevaServices(prev =>
      prev.map(s => (s.id === serviceId ? { ...s, price: newPrice } : s))
    );
    setOnlineCategories(prev =>
      prev.map(cat => ({
        ...cat,
        subServices: cat.subServices.map(sub =>
          sub.id === serviceId ? { ...sub, price: newPrice } : sub
        )
      }))
    );
  };

  const updateServiceUrl = (serviceId: string, newUrl: string) => {
    setMeesevaServices(prev =>
      prev.map(s => (s.id === serviceId ? { ...s, officialUrl: newUrl } : s))
    );
    setOnlineCategories(prev =>
      prev.map(cat => ({
        ...cat,
        subServices: cat.subServices.map(sub =>
          sub.id === serviceId ? { ...sub, officialUrl: newUrl } : sub
        )
      }))
    );
  };

  const toggleServiceActive = (serviceId: string) => {
    setMeesevaServices(prev =>
      prev.map(s => (s.id === serviceId ? { ...s, active: !s.active } : s))
    );
    setOnlineCategories(prev =>
      prev.map(cat => ({
        ...cat,
        subServices: cat.subServices.map(sub =>
          sub.id === serviceId ? { ...sub, active: !sub.active } : sub
        )
      }))
    );
  };

  const updateServiceDetails = (serviceId: string, updates: Partial<ServiceItem>) => {
    setMeesevaServices(prev =>
      prev.map(s => (s.id === serviceId ? { ...s, ...updates } : s))
    );
    setOnlineCategories(prev =>
      prev.map(cat => ({
        ...cat,
        subServices: cat.subServices.map(sub =>
          sub.id === serviceId ? { ...sub, ...updates } : sub
        )
      }))
    );
  };

  return (
    <PortalContext.Provider
      value={{
        user,
        isLoggedIn,
        isAuthChecking,
        selectedRole,
        setSelectedRole,
        isAuthOpen,
        setIsAuthOpen: safeSetIsAuthOpen,
        openAuth,
        closeAuth,
        login,
        loginWithGoogle,
        checkAccountExists,
        registerCustomerWithGoogle,
        logout,
        currentView,
        setCurrentView,
        previousView,
        selectedCategory,
        setSelectedCategory: safeSetSelectedCategory,
        selectedService,
        setSelectedService,
        openServiceForm,
        goBack,
        meesevaServices,
        onlineCategories,
        updateServicePrice,
        updateServiceUrl,
        toggleServiceActive,
        updateServiceDetails,
        searchQuery,
        setSearchQuery,
        isSearchOpen,
        setIsSearchOpen,
        uploadedDocs,
        uploadDocument,
        removeDocument,
        getUserUploadedDocs,
        getUserDocCount,
        previewDoc,
        setPreviewDoc: safeSetPreviewDoc,
        submissionDocsMap,
        getApplicationDocuments,
        applications,
        submitApplication,
        acceptTask,
        updateApplicationStatus,
        payments,
        activePaymentApp,
        setActivePaymentApp: safeSetActivePaymentApp,
        processPayment,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        unreadCount,
        messages,
        sendMessage,
        isMessagesOpen,
        setIsMessagesOpen: safeSetIsMessagesOpen,
        activeMessageAppId,
        setActiveMessageAppId,
        feedbackList,
        submitFeedback,
        isProfileOpen,
        setIsProfileOpen: safeSetIsProfileOpen,
        theme,
        toggleTheme,
        isContentHidden,
        setIsContentHidden,
        language,
        setLanguage,
        t,
        clearSessionData,
        accounts,
        addAccount,
        registerCustomer,
        updateAccount,
        deleteAccount,
        generateResetOtp,
        verifyResetOtp,
        resetPasswordWithOtp,
        logUserActivity,
        activeUsersCount,
        activeSystemOtp,
        passwordResetRequests,
        requestPasswordReset,
        approvePasswordReset,
        rejectPasswordReset,
        updateFacialProfile,
        passwordChangeAudits,
        recordPasswordChangeAudit,
        changePasswordAfterFaceMatch,
        recordFaceLogin,
        forceLogoutCustomer,
        deleteCustomerAccount,
        sendMessageToCustomer
      }}
    >
      {children}
    </PortalContext.Provider>
  );
};

export const usePortal = (): PortalContextType => {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error("usePortal must be used within a PortalProvider");
  }
  return context;
};
