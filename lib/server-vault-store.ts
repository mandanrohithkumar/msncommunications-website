import fs from "fs";
import path from "path";
import crypto from "crypto";
import { UserDocumentRecord, ServiceDocumentLinkRecord, UserDocumentMetadata } from "@/types/portal";

// Path to persistent JSON store for user_documents
const STORAGE_DIR = path.join(process.cwd(), "storage");
const USER_DOCUMENTS_FILE = path.join(STORAGE_DIR, "user_documents.json");
const SERVICE_LINKS_FILE = path.join(STORAGE_DIR, "service_linked_documents.json");
const VAULT_UPLOADS_DIR = path.join(STORAGE_DIR, "vault_uploads");

// Ensure required storage directories exist
try {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
  if (!fs.existsSync(VAULT_UPLOADS_DIR)) {
    fs.mkdirSync(VAULT_UPLOADS_DIR, { recursive: true });
  }
} catch (e) {
  console.warn("[VaultStore] Error initializing storage directories:", e);
}

/**
 * Normalizes user-facing document labels or category names into canonical document_type_code.
 * e.g., "Aadhaar Card" -> "aadhaar_card", "Father's Aadhaar Card" -> "aadhaar_card" (with family_member_id: "father")
 */
export function normalizeDocumentTypeCode(
  label: string = "",
  categoryName?: string,
  familyMemberId?: string
): { code: string; detectedMemberId: string } {
  const clean = (label || "").trim().toLowerCase();
  let detectedMemberId = familyMemberId || "self";

  // Detect family member if embedded in prefix or label
  if (/\[father\]|father's|father\s+aadhaar/i.test(label)) {
    detectedMemberId = "father";
  } else if (/\[mother\]|mother's|mother\s+aadhaar/i.test(label)) {
    detectedMemberId = "mother";
  } else if (/\[wife\]|\[husband\]|\[spouse\]|spouse|wife|husband/i.test(label)) {
    detectedMemberId = "spouse";
  } else if (/\[son/i.test(label)) {
    detectedMemberId = "son";
  } else if (/\[daughter/i.test(label)) {
    detectedMemberId = "daughter";
  }

  // Remove bracket prefix like [Self], [Father], [Mother], etc. for code normalization
  const baseLabel = clean.replace(/\[[^\]]+\]/g, "").replace(/father's|mother's|spouse's/g, "").trim();

  let code = "general_document";

  if (/aadhaar|aadhar|uidai/i.test(baseLabel)) {
    code = "aadhaar_card";
  } else if (/\bpan\b|pan card|permanent account/i.test(baseLabel)) {
    code = "pan_card";
  } else if (/voter|epic|election/i.test(baseLabel)) {
    code = "voter_id";
  } else if (/driving|licence|license|\bdl\b/i.test(baseLabel)) {
    code = "driving_licence";
  } else if (/passport\s+doc|passport\s+copy|passport\s+book/i.test(baseLabel)) {
    code = "passport_doc";
  } else if (/passport.*photo|photograph|applicant.*photo/i.test(baseLabel)) {
    code = "passport_photo";
  } else if (/sign|signature/i.test(baseLabel)) {
    code = "signature";
  } else if (/ration/i.test(baseLabel)) {
    code = "ration_card";
  } else if (/gas\s*bill/i.test(baseLabel)) {
    code = "gas_bill";
  } else if (/electric|power\s*bill|current\s*bill/i.test(baseLabel)) {
    code = "electricity_bill";
  } else if (/income\s*cert/i.test(baseLabel)) {
    code = "income_certificate";
  } else if (/caste\s*cert/i.test(baseLabel)) {
    code = "caste_certificate";
  } else if (/birth\s*cert/i.test(baseLabel)) {
    code = "birth_certificate";
  } else if (/death\s*cert/i.test(baseLabel)) {
    code = "death_certificate";
  } else if (/bank|passbook|statement/i.test(baseLabel)) {
    code = "bank_passbook";
  } else if (/college|student\s*id/i.test(baseLabel)) {
    code = "college_id";
  } else if (/marksheet|degree|diploma/i.test(baseLabel)) {
    code = "academic_certificate";
  } else if (/pension/i.test(baseLabel)) {
    code = "pension_certificate";
  } else {
    // Fallback snake_case code
    code = baseLabel
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "document";
  }

  return { code, detectedMemberId };
}

// Initial demo seeded records for standard test users (e.g., usr-cust-1 Rohith Kumar)
const INITIAL_USER_DOCUMENTS: UserDocumentRecord[] = [
  {
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    user_id: "usr-cust-1",
    family_member_id: "self",
    document_type_code: "aadhaar_card",
    file_url: "/msn-logo.png",
    storage_path: "storage/secure_vault/vault_1790279028000_rahul_kumar_aadhaar.enc",
    uploaded_at: "2026-10-06T11:15:00.000Z",
    metadata: {
      fileName: "rohith_kumar_aadhaar_card.pdf",
      fileSize: "142.4 KB",
      fileType: "application/pdf",
      docName: "Aadhaar Card",
      categoryName: "Identity & Personal Documents",
      verificationStatus: "APPROVED",
      verificationMessage: "Verified Authentic UIDAI Document",
      isGenuine: true,
      documentNumber: "XXXX XXXX 9821",
      source: "vault"
    }
  },
  {
    id: "a31bc20c-68dd-4372-a567-1e02b2c3d480",
    user_id: "usr-cust-1",
    family_member_id: "self",
    document_type_code: "pan_card",
    file_url: "/msn-logo.png",
    storage_path: "storage/secure_vault/pan_usr_cust_1.enc",
    uploaded_at: "2026-10-06T11:20:00.000Z",
    metadata: {
      fileName: "rohith_kumar_pan_card.jpg",
      fileSize: "98.5 KB",
      fileType: "image/jpeg",
      docName: "PAN Card",
      categoryName: "Identity & Personal Documents",
      verificationStatus: "APPROVED",
      verificationMessage: "Verified PAN via NSDL",
      isGenuine: true,
      documentNumber: "ABCDE1234F",
      source: "vault"
    }
  },
  {
    id: "b42cd30d-78ee-4372-a567-2e02b2c3d481",
    user_id: "usr-cust-1",
    family_member_id: "self",
    document_type_code: "voter_id",
    file_url: "/msn-logo.png",
    storage_path: "storage/secure_vault/voter_usr_cust_1.enc",
    uploaded_at: "2026-10-06T11:25:00.000Z",
    metadata: {
      fileName: "rohith_kumar_voter_id.jpg",
      fileSize: "85.2 KB",
      fileType: "image/jpeg",
      docName: "Voter ID Card",
      categoryName: "Identity & Personal Documents",
      verificationStatus: "APPROVED",
      verificationMessage: "Verified Election Commission ID",
      isGenuine: true,
      documentNumber: "TS/88/123456",
      source: "vault"
    }
  }
];

// Helper to safely load persisted user documents from disk
function loadUserDocumentsFromDisk(): UserDocumentRecord[] {
  try {
    if (fs.existsSync(USER_DOCUMENTS_FILE)) {
      const data = fs.readFileSync(USER_DOCUMENTS_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("[VaultStore] Could not read user_documents.json, using defaults:", e);
  }
  return [...INITIAL_USER_DOCUMENTS];
}

// Helper to safely load service links from disk
function loadServiceLinksFromDisk(): ServiceDocumentLinkRecord[] {
  try {
    if (fs.existsSync(SERVICE_LINKS_FILE)) {
      const data = fs.readFileSync(SERVICE_LINKS_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("[VaultStore] Could not read service_linked_documents.json:", e);
  }
  return [];
}

// In-memory singletons during runtime
let inMemoryUserDocuments: UserDocumentRecord[] = loadUserDocumentsFromDisk();
let inMemoryServiceLinks: ServiceDocumentLinkRecord[] = loadServiceLinksFromDisk();

function persistUserDocumentsToDisk() {
  try {
    fs.writeFileSync(USER_DOCUMENTS_FILE, JSON.stringify(inMemoryUserDocuments, null, 2), "utf-8");
  } catch (e) {
    console.error("[VaultStore] Failed to write user_documents.json:", e);
  }
}

function persistServiceLinksToDisk() {
  try {
    fs.writeFileSync(SERVICE_LINKS_FILE, JSON.stringify(inMemoryServiceLinks, null, 2), "utf-8");
  } catch (e) {
    console.error("[VaultStore] Failed to write service_linked_documents.json:", e);
  }
}

/**
 * Normalizes user ID or email lookup key.
 * Allows matching either by primary customer id ("usr-cust-1") or email ("rohith.kumar@gmail.com").
 */
function isUserMatch(docUserId: string, targetIdOrEmail: string): boolean {
  if (!docUserId || !targetIdOrEmail) return false;
  const d = docUserId.toLowerCase().trim();
  const t = targetIdOrEmail.toLowerCase().trim();
  if (d === t) return true;
  // Common default aliases
  if ((d === "usr-cust-1" || d === "cust-1") && t.includes("rohith")) return true;
  if ((t === "usr-cust-1" || t === "cust-1") && d.includes("rohith")) return true;
  return false;
}

/**
 * Fetches user documents from the central table.
 * Supports filtering by userId, document_type_code, and family_member_id.
 */
export function queryUserDocuments(options: {
  userId: string;
  typeCode?: string;
  familyMemberId?: string;
}): UserDocumentRecord[] {
  const { userId, typeCode, familyMemberId } = options;
  if (!userId) return [];

  let matches = inMemoryUserDocuments.filter((doc) => isUserMatch(doc.user_id, userId));

  if (familyMemberId && familyMemberId !== "all") {
    const cleanMember = familyMemberId.toLowerCase().trim();
    matches = matches.filter(
      (doc) => (doc.family_member_id || "self").toLowerCase().trim() === cleanMember
    );
  }

  if (typeCode && typeCode !== "all") {
    const cleanType = typeCode.toLowerCase().trim();
    matches = matches.filter(
      (doc) => doc.document_type_code.toLowerCase().trim() === cleanType
    );
  }

  // Sort latest first
  return matches.sort(
    (a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
  );
}

/**
 * Saves or updates a centralized document in user_documents.
 * Implements Scenario C (Updates/Overrides):
 * If an existing document of same user_id + family_member_id + document_type_code exists,
 * it updates the record in-place, instantly updating its state everywhere.
 */
export function saveOrUpdateUserDocument(input: {
  id?: string;
  userId: string;
  familyMemberId?: string;
  documentTypeCode: string;
  fileUrl: string;
  storagePath?: string;
  metadata?: UserDocumentMetadata;
}): UserDocumentRecord {
  const familyMemberId = input.familyMemberId || "self";
  const now = new Date().toISOString();

  // Check if existing document matches
  const existingIdx = inMemoryUserDocuments.findIndex(
    (doc) =>
      (input.id && doc.id === input.id) ||
      (isUserMatch(doc.user_id, input.userId) &&
        (doc.family_member_id || "self").toLowerCase() === familyMemberId.toLowerCase() &&
        doc.document_type_code.toLowerCase() === input.documentTypeCode.toLowerCase())
  );

  let resultRecord: UserDocumentRecord;

  if (existingIdx !== -1) {
    // Update existing document in place (Scenario C Override)
    const existing = inMemoryUserDocuments[existingIdx];
    resultRecord = {
      ...existing,
      document_type_code: input.documentTypeCode,
      file_url: input.fileUrl || existing.file_url,
      storage_path: input.storagePath || existing.storage_path,
      uploaded_at: now,
      metadata: {
        ...existing.metadata,
        ...(input.metadata || {}),
        updatedAt: now
      }
    };
    inMemoryUserDocuments[existingIdx] = resultRecord;
  } else {
    // Create new document (UUID PK)
    resultRecord = {
      id: input.id || crypto.randomUUID(),
      user_id: input.userId,
      family_member_id: familyMemberId,
      document_type_code: input.documentTypeCode,
      file_url: input.fileUrl,
      storage_path: input.storagePath,
      uploaded_at: now,
      metadata: input.metadata || {}
    };
    inMemoryUserDocuments.unshift(resultRecord);
  }

  persistUserDocumentsToDisk();
  return resultRecord;
}

/**
 * Links an existing vault document ID to a service application submission workflow.
 */
export function linkDocumentToService(input: {
  documentId: string;
  userId: string;
  serviceId: string;
  applicationId?: string;
  slotName: string;
  metadata?: Record<string, any>;
}): ServiceDocumentLinkRecord {
  const existingDoc = inMemoryUserDocuments.find((doc) => doc.id === input.documentId);
  const now = new Date().toISOString();

  const linkRecord: ServiceDocumentLinkRecord = {
    id: crypto.randomUUID(),
    document_id: input.documentId,
    user_id: input.userId,
    service_id: input.serviceId,
    application_id: input.applicationId || `APP-${Date.now()}`,
    slot_name: input.slotName,
    linked_at: now,
    metadata: input.metadata || {},
    document: existingDoc
  };

  inMemoryServiceLinks.unshift(linkRecord);
  persistServiceLinksToDisk();
  return linkRecord;
}

/**
 * Helper to write uploaded file buffer to storage on disk.
 */
export function writeVaultFileToDisk(
  fileName: string,
  buffer: Buffer
): { fileUrl: string; storagePath: string } {
  const ext = path.extname(fileName) || ".bin";
  const cleanBase = path.basename(fileName, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
  const uniqueName = `vault_${Date.now()}_${cleanBase}${ext}`;
  const diskPath = path.join(VAULT_UPLOADS_DIR, uniqueName);

  fs.writeFileSync(diskPath, buffer);

  // Return local storage path and internal stream URL
  return {
    fileUrl: `/api/vault/stream/${uniqueName}`,
    storagePath: diskPath
  };
}
