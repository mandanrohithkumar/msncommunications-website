export type UserRole = 'customer' | 'owner' | 'superadmin';
export type Gender = 'Male' | 'Female' | 'Other';
export type MaritalStatus = 'Single' | 'Married' | 'Divorced' | 'Widowed';

export interface FamilySibling {
  id?: string;
  name: string;
  age?: string;
  phone?: string;
  occupation?: string;
}

export interface FamilyChild {
  id?: string;
  name: string;
  gender: 'Son' | 'Daughter';
  age?: string;
  dob?: string;
  aadhaar?: string;
}

export interface ExtendedFamilyDetails {
  maritalStatus: MaritalStatus;
  // Parents
  fatherName?: string;
  fatherPhone?: string;
  fatherAadhaar?: string;
  fatherOccupation?: string;
  motherName?: string;
  motherPhone?: string;
  motherAadhaar?: string;
  motherOccupation?: string;
  // Brothers & Sisters
  brothers: FamilySibling[];
  sisters: FamilySibling[];
  // Conditional fields if Married
  spouseName?: string;
  spousePhone?: string;
  spouseAadhaar?: string;
  spouseOccupation?: string;
  children: FamilyChild[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  gender?: Gender;
  role: UserRole;
  avatar?: string;
  faceEmbedding?: string;
  faceVerified?: boolean;
  familyDetails?: ExtendedFamilyDetails;
}

export interface UserSessionRecord {
  id: string;
  sessionId: string;
  userEmail: string;
  loginTime: string;
  logoutTime?: string;
  durationSeconds: number;
  device?: string;
  ipAddress?: string;
  status: 'active' | 'ended';
}

export interface UserActivityLog {
  id: string;
  userEmail: string;
  action: string;
  timestamp: string;
  details?: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  gender?: Gender;
  role: UserRole;
  status: 'active' | 'suspended';
  lastLogin: string;
  dailyServiceCount: number;
  monthlyServiceCount: number;
  createdAt: string;
  registeredAt?: string;
  totalLogins?: number;
  totalTimeSpentSeconds?: number;
  activeSessionId?: string;
  resetOtp?: string;
  resetOtpGeneratedAt?: string;
  resetOtpExpiresAt?: number;
  resetCooldownUntil?: number;
  sessionLogs?: UserSessionRecord[];
  activityLogs?: UserActivityLog[];
  familyDetails?: ExtendedFamilyDetails;
  avatar?: string;
  faceEmbedding?: string;
  faceVerified?: boolean;
}

export interface OtpVerificationResult {
  valid: boolean;
  reason?: 'invalid' | 'expired' | 'missing';
  message: string;
}

export interface PasswordResetRequest {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  identifier: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  generatedOtp?: string;
  expiresAt?: number;
  cooldownUntil?: number;
  faceVerified?: boolean;
  customerPhoto?: string;
}

export interface PasswordChangeAuditLog {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  originalPhoto?: string;
  verificationSnapshot?: string;
  timestamp: string;
  matchConfidence: number;
  status: 'verified' | 'flagged';
  securityNote?: string;
}

export interface FormField {
  label: string;
  type: 'text' | 'tel' | 'email' | 'date' | 'number' | 'textarea' | 'select';
  full?: boolean;
  required?: boolean;
  placeholder?: string;
  options?: string[];
}

export interface DocumentRequirement {
  label: string;
  required?: boolean;
  acceptedTypes?: string[];
}

export interface ServiceItem {
  id: string;
  name: string;
  icon: string;
  price: string;
  category: string;
  key?: string;
  note?: string;
  waitingTime?: string;
  officialUrl?: string;
  docs: DocumentRequirement[];
  fields: FormField[];
  active?: boolean;
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  subServices: ServiceItem[];
}

export interface UploadedFileMeta {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
  dataUrl?: string;
  fileUrl?: string;
  applicationId?: string;
  customerId?: string;
  categoryName?: string;
  docName?: string;
  previewType?: 'image' | 'pdf' | 'certificate';
}

export type ApplicationStatus =
  | 'Submitted'
  | 'Payment Pending'
  | 'Payment Successful'
  | 'Waiting for Owner'
  | 'Accepted'
  | 'Processing'
  | 'Documents Required'
  | 'Completed'
  | 'Rejected'
  | 'Cancelled';

export interface Application {
  id: string; // e.g. MSN-2026-001234
  serviceId: string;
  serviceName: string;
  serviceCategory: string;
  subCategory?: string;
  price: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  formData: Record<string, string>;
  ownerNote?: string;
  uploadedDocs: Record<string, UploadedFileMeta>;
  assignedOwnerId?: string;
  assignedOwnerName?: string;
  officialUrl?: string;
  paymentId?: string;
}

export type PaymentMethod = 'UPI' | 'QR Code' | 'Net Banking' | 'Debit Card' | 'Credit Card';
export type PaymentStatus = 'Pending' | 'Successful' | 'Failed' | 'Refunded';

export interface PaymentRecord {
  id: string;
  applicationId: string;
  serviceName: string;
  amount: string;
  method: PaymentMethod;
  status: PaymentStatus;
  timestamp: string;
  transactionRef: string;
  customerName: string;
}

export interface PortalNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  linkView?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  applicationId?: string;
}

export interface PortalMessage {
  id: string;
  applicationId?: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientId: string;
  content: string;
  timestamp: string;
}

export interface FeedbackComplaint {
  id: string;
  customerId: string;
  customerName: string;
  message: string;
  timestamp: string;
  status: 'Open' | 'Resolved';
}

export interface DocumentCategoryDef {
  name: string;
  icon: string;
  items: string[];
}
