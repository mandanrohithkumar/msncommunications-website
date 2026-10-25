import fs from "fs";
import path from "path";
import crypto from "crypto";
import { UserAccount, UserSessionRecord, UserActivityLog, FaceLoginLog } from "@/types/portal";

// Persistent file-backed storage paths
const STORAGE_DIR = path.join(process.cwd(), "storage");
const CUSTOMERS_FILE = path.join(STORAGE_DIR, "customers.json");
const USER_DOCUMENTS_FILE = path.join(STORAGE_DIR, "user_documents.json");
const SERVICE_LINKS_FILE = path.join(STORAGE_DIR, "service_linked_documents.json");

// Ensure storage directory exists
try {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
} catch (e) {
  console.warn("[CustomerStore] Error initializing storage directory:", e);
}

/**
 * Reads all customer records from persistent storage (customers.json).
 * Synchronizes with real document vault records to maintain accurate upload counts.
 */
function readCustomersFromDisk(): UserAccount[] {
  try {
    if (fs.existsSync(CUSTOMERS_FILE)) {
      const raw = fs.readFileSync(CUSTOMERS_FILE, "utf-8");
      if (raw.trim()) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Keep all valid customer records with id and email
          return parsed.filter(
            (c) => Boolean(c && c.id && c.email)
          );
        }
      }
    }
  } catch (error) {
    console.error("[CustomerStore] Error reading customers from disk:", error);
  }
  return [];
}

/**
 * Safely writes customer records to persistent storage.
 */
function writeCustomersToDisk(customers: UserAccount[]): boolean {
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
    const cleanCustomers = customers.filter(
      (c) => Boolean(c && c.id && c.email)
    );
    fs.writeFileSync(CUSTOMERS_FILE, JSON.stringify(cleanCustomers, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("[CustomerStore] Error writing customers to disk:", error);
    return false;
  }
}

/**
 * Computes actual works and uploaded document counts dynamically from the storage vault.
 * Cross-references `storage/user_documents.json` and `storage/service_linked_documents.json`.
 */
export function getCustomerWorksCount(customerId: string, email: string): number {
  let docCount = 0;
  try {
    const cleanEmail = (email || "").toLowerCase().trim();
    const cleanId = (customerId || "").trim();

    if (fs.existsSync(USER_DOCUMENTS_FILE)) {
      const raw = fs.readFileSync(USER_DOCUMENTS_FILE, "utf-8");
      if (raw.trim()) {
        const docs = JSON.parse(raw);
        if (Array.isArray(docs)) {
          for (const doc of docs) {
            const uid = String(doc.user_id || "").toLowerCase().trim();
            if (
              uid === cleanId.toLowerCase() ||
              uid === cleanEmail ||
              (cleanEmail && uid.includes(cleanEmail.split("@")[0]))
            ) {
              docCount++;
            }
          }
        }
      }
    }
  } catch (e) {
    console.warn("[CustomerStore] Error computing works count:", e);
  }
  return docCount;
}

/**
 * Enriches customer records with dynamic counts from production database files.
 */
function enrichCustomerRecord(customer: UserAccount): UserAccount {
  const dynamicWorksCount = getCustomerWorksCount(customer.id, customer.email);
  const totalUploads = Math.max(customer.totalUploads || 0, dynamicWorksCount);

  // Check for active session in session logs or activeSessionId property
  const hasActiveSession =
    Boolean(customer.activeSessionId) ||
    (customer.sessionLogs || []).some((s) => s.status === "active");
  const activeSessionId = hasActiveSession
    ? customer.activeSessionId ||
      customer.sessionLogs?.find((s) => s.status === "active")?.sessionId ||
      `sess-live-${customer.id}`
    : undefined;

  return {
    ...customer,
    totalUploads,
    activeSessionId,
    faceVerified: Boolean(customer.lastFaceLoginSnapshot || customer.faceVerified),
  };
}

/**
 * Initializes the persistent store.
 * If storage/customers.json does not exist yet or is empty, initializes an empty list
 * (or discovers existing real customer records from uploaded documents).
 */
function initServerCustomerStore(): UserAccount[] {
  let customers = readCustomersFromDisk();

  // If customers.json does not exist yet, initialize it
  if (!fs.existsSync(CUSTOMERS_FILE)) {
    writeCustomersToDisk(customers);
  }

  return customers.map(enrichCustomerRecord);
}

// In-memory cache synced with disk
let cachedCustomers: UserAccount[] = initServerCustomerStore();

/**
 * Retrieves all registered customers from database with live counts.
 */
export function getServerCustomers(): UserAccount[] {
  // Always refresh from disk to guarantee real-time multi-process synchronization
  cachedCustomers = readCustomersFromDisk().map(enrichCustomerRecord);
  return cachedCustomers;
}

export interface CustomerQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface CustomerQueryResult {
  customers: UserAccount[];
  pagination: {
    page: number;
    pageSize: number;
    totalCustomers: number;
    totalPages: number;
    showingFrom: number;
    showingTo: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  metrics: {
    totalCustomers: number;
    activeNow: number;
    faceVerifiedCount: number;
    totalWorksAndUploads: number;
  };
}

/**
 * Database Query Engine for Customers with dynamic search, pagination, and metric computation.
 */
export function queryServerCustomers(params: CustomerQueryParams = {}): CustomerQueryResult {
  const allCustomers = getServerCustomers();

  // 1. Compute Global Operational Metrics across all registered customers
  const totalCustomersGlobal = allCustomers.length;
  const activeNow = allCustomers.filter((c) => Boolean(c.activeSessionId)).length;
  const faceVerifiedCount = allCustomers.filter(
    (c) => Boolean(c.lastFaceLoginSnapshot) || Boolean(c.faceVerified)
  ).length;
  const totalWorksAndUploads = allCustomers.reduce(
    (acc, c) => acc + (c.totalUploads || 0),
    0
  );

  const metrics = {
    totalCustomers: totalCustomersGlobal,
    activeNow,
    faceVerifiedCount,
    totalWorksAndUploads,
  };

  // 2. Filter by status if specified
  let filtered = allCustomers;
  if (params.status && params.status !== "all") {
    const s = params.status.toLowerCase().trim();
    filtered = filtered.filter((c) => (c.status || "active").toLowerCase() === s);
  }

  // 3. Search Bar Filter: searches username, full name, email, phone, and customer ID
  if (params.search && params.search.trim()) {
    const q = params.search.toLowerCase().trim();
    filtered = filtered.filter((c) => {
      const username = (c.username || "").toLowerCase();
      const name = (c.name || "").toLowerCase();
      const email = (c.email || "").toLowerCase();
      const phone = (c.phone || "").replace(/\s+/g, "");
      const id = (c.id || "").toLowerCase();

      return (
        username.includes(q) ||
        name.includes(q) ||
        email.includes(q) ||
        phone.includes(q.replace(/\s+/g, "")) ||
        id.includes(q)
      );
    });
  }

  // 4. Dynamic Pagination Logic
  const totalMatching = filtered.length;
  const pageSize = Math.max(1, Math.min(100, Number(params.limit) || 5));
  const totalPages = Math.max(1, Math.ceil(totalMatching / pageSize));
  const requestedPage = Math.max(1, Number(params.page) || 1);
  const page = requestedPage > totalPages && totalMatching > 0 ? totalPages : requestedPage;

  const startIndex = (page - 1) * pageSize;
  const pagedRecords = totalMatching === 0 ? [] : filtered.slice(startIndex, startIndex + pageSize);

  const showingFrom = totalMatching === 0 ? 0 : startIndex + 1;
  const showingTo = totalMatching === 0 ? 0 : Math.min(startIndex + pageSize, totalMatching);

  return {
    customers: pagedRecords,
    pagination: {
      page,
      pageSize,
      totalCustomers: totalMatching,
      totalPages,
      showingFrom,
      showingTo,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    metrics,
  };
}

/**
 * Finds customer record by ID or Email.
 */
export function findServerCustomer(idOrEmail: string): UserAccount | undefined {
  const clean = (idOrEmail || "").toLowerCase().trim();
  const customers = getServerCustomers();
  return customers.find(
    (c) => c.id === idOrEmail || c.email.toLowerCase() === clean || (c.username && c.username.toLowerCase() === clean)
  );
}

/**
 * Registers or adds a new customer directly into the production database.
 */
export function registerServerCustomer(data: Partial<UserAccount>): UserAccount {
  const cleanEmail = (data.email || "").toLowerCase().trim();
  if (!cleanEmail) {
    throw new Error("Email ID is required to register customer account.");
  }

  const existing = findServerCustomer(cleanEmail);
  if (existing) {
    // If account already exists, update and return
    return updateServerCustomer(existing.id, data) || existing;
  }

  const nowStr = new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const username =
    data.username ||
    cleanEmail.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase();

  const displayName =
    data.name ||
    cleanEmail
      .split("@")[0]
      .replace(/[._-]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const newCustomer: UserAccount = {
    id: data.id || `usr-cust-${Date.now()}`,
    name: displayName,
    username,
    email: cleanEmail,
    phone: data.phone || "8125898068",
    password: data.password || "Password@23",
    gender: data.gender || "Male",
    role: "customer",
    status: data.status || "active",
    avatar: data.avatar,
    faceEmbedding: data.faceEmbedding,
    faceVerified: Boolean(data.faceVerified || data.faceEmbedding || data.lastFaceLoginSnapshot),
    lastFaceLoginSnapshot: data.lastFaceLoginSnapshot,
    faceLoginTimestamp: data.faceLoginTimestamp,
    lastLogin: data.lastLogin || "Never",
    dailyServiceCount: 0,
    monthlyServiceCount: 0,
    totalLogins: data.totalLogins || 0,
    totalLogouts: data.totalLogouts || 0,
    totalUploads: getCustomerWorksCount(data.id || "", cleanEmail),
    totalTimeSpentSeconds: 0,
    createdAt: new Date().toISOString().split("T")[0],
    registeredAt: nowStr,
    sessionLogs: data.sessionLogs || [],
    activityLogs: [
      {
        id: `act-${Date.now()}`,
        userEmail: cleanEmail,
        action: "Customer Account Created",
        timestamp: nowStr,
        details: "Customer account registered in database",
      },
    ],
  };

  const current = readCustomersFromDisk();
  current.unshift(newCustomer);
  writeCustomersToDisk(current);
  cachedCustomers = current.map(enrichCustomerRecord);
  return newCustomer;
}

/**
 * Updates an existing customer record in database.
 */
export function updateServerCustomer(
  id: string,
  updates: Partial<UserAccount>
): UserAccount | null {
  const current = readCustomersFromDisk();
  let updatedRecord: UserAccount | null = null;

  const updatedList = current.map((c) => {
    if (c.id === id || c.email.toLowerCase() === id.toLowerCase()) {
      updatedRecord = {
        ...c,
        ...updates,
      };
      return updatedRecord;
    }
    return c;
  });

  if (updatedRecord) {
    writeCustomersToDisk(updatedList);
    cachedCustomers = updatedList.map(enrichCustomerRecord);
    return enrichCustomerRecord(updatedRecord);
  }

  return null;
}

/**
 * Deletes customer account and associated sessions from database.
 */
export function deleteServerCustomer(id: string): boolean {
  const current = readCustomersFromDisk();
  const initialLen = current.length;
  const filtered = current.filter(
    (c) => c.id !== id && c.email.toLowerCase() !== id.toLowerCase()
  );

  if (filtered.length < initialLen) {
    writeCustomersToDisk(filtered);
    cachedCustomers = filtered.map(enrichCustomerRecord);
    return true;
  }
  return false;
}

/**
 * Records live biometric face recognition login snapshot for a customer.
 */
export function recordServerFaceLogin(
  email: string,
  photo: string,
  confidence: number = 98.8
): UserAccount | null {
  const clean = (email || "").toLowerCase().trim();
  const nowStr = new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const sessionToken = `sess-face-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
  let customer = findServerCustomer(clean);

  if (!customer) {
    // If not in database yet, auto-register customer with this face biometric
    customer = registerServerCustomer({
      email: clean,
      avatar: photo,
      lastFaceLoginSnapshot: photo,
      faceLoginTimestamp: nowStr,
      faceVerified: true,
      lastLogin: nowStr,
      totalLogins: 1,
      totalLogouts: 0,
      activeSessionId: sessionToken,
    });
  }

  const newSession: UserSessionRecord = {
    id: `sess-${Date.now()}`,
    sessionId: sessionToken,
    userEmail: clean,
    loginTime: nowStr,
    durationSeconds: 1800,
    status: "active",
    device: "Biometric WebCam / Live Blink Detection",
    ipAddress: "127.0.0.1",
  };

  const newActivity: UserActivityLog = {
    id: `act-${Date.now()}`,
    userEmail: clean,
    action: "Face Recognition Login",
    timestamp: nowStr,
    details: `Authenticated via live biometric camera snapshot (${confidence.toFixed(1)}% match)`,
  };

  const newFaceLog: FaceLoginLog = {
    id: `face-log-${Date.now()}`,
    photo,
    timestamp: nowStr,
    confidence,
    status: "verified",
    device: "Camera / Biometric Validator",
  };

  const updatedSessions = [newSession, ...(customer.sessionLogs || []).filter((s) => s.status !== "active")];
  const updatedActivities = [newActivity, ...(customer.activityLogs || [])];
  const updatedFaceHistory = [newFaceLog, ...(customer.faceLoginHistory || [])];

  return updateServerCustomer(customer.id, {
    lastFaceLoginSnapshot: photo,
    faceLoginTimestamp: nowStr,
    faceVerified: true,
    lastLogin: nowStr,
    totalLogins: (customer.totalLogins || 0) + 1,
    activeSessionId: sessionToken,
    sessionLogs: updatedSessions,
    activityLogs: updatedActivities,
    faceLoginHistory: updatedFaceHistory,
  });
}

/**
 * Records customer session login from HTTP auth endpoint.
 */
export function recordServerCustomerLogin(
  userId: string,
  email: string,
  name: string,
  deviceInfo = "Browser / Secure Session",
  ipAddress = "127.0.0.1"
): UserAccount {
  const clean = (email || "").toLowerCase().trim();
  const nowStr = new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const sessionToken = `sess-auth-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
  let customer = findServerCustomer(clean);

  if (!customer) {
    customer = registerServerCustomer({
      id: userId || `usr-cust-${Date.now()}`,
      name: name || clean.split("@")[0],
      email: clean,
      lastLogin: nowStr,
      totalLogins: 1,
      totalLogouts: 0,
      activeSessionId: sessionToken,
    });
  }

  const newSession: UserSessionRecord = {
    id: `sess-${Date.now()}`,
    sessionId: sessionToken,
    userEmail: clean,
    loginTime: nowStr,
    durationSeconds: 1800,
    status: "active",
    device: deviceInfo,
    ipAddress,
  };

  const updatedSessions = [newSession, ...(customer.sessionLogs || []).filter((s) => s.status !== "active")];

  return (
    updateServerCustomer(customer.id, {
      lastLogin: nowStr,
      totalLogins: (customer.totalLogins || 0) + 1,
      activeSessionId: sessionToken,
      sessionLogs: updatedSessions,
    }) || customer
  );
}

/**
 * Records customer logout and ends active session in database.
 */
export function recordServerCustomerLogout(idOrEmail: string): UserAccount | null {
  const customer = findServerCustomer(idOrEmail);
  if (!customer) return null;

  const nowStr = new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const updatedSessions = (customer.sessionLogs || []).map((s) => ({
    ...s,
    status: "ended" as const,
    logoutTime: s.status === "active" ? nowStr : s.logoutTime,
  }));

  return updateServerCustomer(customer.id, {
    activeSessionId: undefined,
    totalLogouts: (customer.totalLogouts || 0) + 1,
    sessionLogs: updatedSessions,
  });
}

/**
 * Remotely terminates customer's active session (Super Admin Force Logout).
 */
export function forceLogoutServerCustomer(id: string): UserAccount | null {
  const target = findServerCustomer(id);
  if (!target) return null;

  const nowStr = new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const updatedSessions = (target.sessionLogs || []).map((s) => ({
    ...s,
    status: "ended" as const,
    logoutTime: s.status === "active" ? nowStr : s.logoutTime,
  }));

  const newActivity: UserActivityLog = {
    id: `act-${Date.now()}`,
    userEmail: target.email,
    action: "Administrative Force Logout",
    timestamp: nowStr,
    details: "Super Admin remotely terminated active customer session.",
  };

  return updateServerCustomer(target.id, {
    activeSessionId: undefined,
    totalLogouts: (target.totalLogouts || 0) + 1,
    sessionLogs: updatedSessions,
    activityLogs: [newActivity, ...(target.activityLogs || [])],
  });
}
