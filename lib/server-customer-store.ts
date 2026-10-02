import { UserAccount } from "@/types/portal";

// Server-side persistent customer ledger for Super Admin Customer Views
export const INITIAL_SERVER_CUSTOMERS: UserAccount[] = [
  {
    id: "usr-cust-1",
    name: "Rohith Kumar",
    username: "rohith_kumar",
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
    lastLogin: "Sep 28, 2026, 02:45 PM",
    dailyServiceCount: 3,
    monthlyServiceCount: 14,
    totalLogins: 42,
    totalLogouts: 38,
    totalUploads: 6,
    totalTimeSpentSeconds: 4620,
    activeSessionId: "sess-20260928-c1",
    createdAt: "2026-02-14",
    registeredAt: "Feb 14, 2026, 10:30 AM",
    sessionLogs: [
      {
        id: "sess-c1",
        sessionId: "sess-20260928-c1",
        userEmail: "rohith.kumar@gmail.com",
        loginTime: "Sep 28, 2026, 02:45 PM",
        durationSeconds: 1800,
        status: "active",
        device: "Chrome / Windows 11",
        ipAddress: "152.58.12.84"
      },
      {
        id: "sess-c2",
        sessionId: "sess-20260925-c2",
        userEmail: "rohith.kumar@gmail.com",
        loginTime: "Sep 25, 2026, 05:15 PM",
        logoutTime: "Sep 25, 2026, 05:40 PM",
        durationSeconds: 1500,
        status: "ended",
        device: "Chrome / Windows 11",
        ipAddress: "152.58.12.84"
      }
    ],
    activityLogs: [
      {
        id: "act-c1",
        userEmail: "rohith.kumar@gmail.com",
        action: "Face Recognition Login",
        timestamp: "Sep 28, 2026, 02:45 PM",
        details: "Authenticated via live camera blink detection (98.8% match confidence)"
      },
      {
        id: "act-c2",
        userEmail: "rohith.kumar@gmail.com",
        action: "Submitted Application",
        timestamp: "Sep 25, 2026, 05:20 PM",
        details: "Application MSN-2026-004128 submitted for Police Verification"
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
    monthlyServiceCount: 5,
    totalLogins: 19,
    totalLogouts: 18,
    totalUploads: 4,
    totalTimeSpentSeconds: 2400,
    createdAt: "2026-03-01",
    registeredAt: "Mar 1, 2026, 09:15 AM",
    sessionLogs: [
      {
        id: "sess-c3",
        sessionId: "sess-20260927-c3",
        userEmail: "anjali.sharma@gmail.com",
        loginTime: "Sep 27, 2026, 10:15 AM",
        logoutTime: "Sep 27, 2026, 10:45 AM",
        durationSeconds: 1800,
        status: "ended",
        device: "Safari / iPhone 15",
        ipAddress: "49.205.18.22"
      }
    ],
    activityLogs: [
      {
        id: "act-c4",
        userEmail: "anjali.sharma@gmail.com",
        action: "Uploaded Document",
        timestamp: "Sep 27, 2026, 10:20 AM",
        details: "Uploaded Aadhaar Card & Income Certificate to records vault"
      }
    ]
  },
  {
    id: "usr-cust-3",
    name: "Vikram Reddy",
    username: "vikram_reddy",
    email: "vikram.reddy@gmail.com",
    phone: "9440123456",
    password: "Password@23",
    role: "customer",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80",
    faceEmbedding: "emb-face-usr-cust-3",
    faceVerified: true,
    lastFaceLoginSnapshot: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80",
    faceLoginTimestamp: "Sep 29, 2026, 03:40 PM",
    lastLogin: "Sep 29, 2026, 03:40 PM",
    dailyServiceCount: 4,
    monthlyServiceCount: 18,
    totalLogins: 31,
    totalLogouts: 29,
    totalUploads: 8,
    totalTimeSpentSeconds: 3900,
    activeSessionId: "sess-20260929-c4",
    createdAt: "2026-01-20",
    registeredAt: "Jan 20, 2026, 11:45 AM",
    sessionLogs: [
      {
        id: "sess-c4",
        sessionId: "sess-20260929-c4",
        userEmail: "vikram.reddy@gmail.com",
        loginTime: "Sep 29, 2026, 03:40 PM",
        durationSeconds: 1200,
        status: "active",
        device: "Edge / Windows 11",
        ipAddress: "106.51.74.19"
      }
    ],
    activityLogs: [
      {
        id: "act-c5",
        userEmail: "vikram.reddy@gmail.com",
        action: "Application Status Tracked",
        timestamp: "Sep 29, 2026, 03:42 PM",
        details: "Checked status for Caste Certificate application MSN-2026-003891"
      }
    ]
  },
  {
    id: "usr-cust-4",
    name: "Sneha Patel",
    username: "sneha_patel",
    email: "sneha.patel@gmail.com",
    phone: "9988776655",
    password: "Password@23",
    role: "customer",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=256&q=80",
    faceEmbedding: "emb-face-usr-cust-4",
    faceVerified: true,
    lastFaceLoginSnapshot: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=256&q=80",
    faceLoginTimestamp: "Sep 30, 2026, 11:00 AM",
    lastLogin: "Sep 30, 2026, 11:00 AM",
    dailyServiceCount: 2,
    monthlyServiceCount: 8,
    totalLogins: 15,
    totalLogouts: 14,
    totalUploads: 5,
    totalTimeSpentSeconds: 1950,
    createdAt: "2026-03-10",
    registeredAt: "Mar 10, 2026, 02:10 PM",
    sessionLogs: [
      {
        id: "sess-c5",
        sessionId: "sess-20260930-c5",
        userEmail: "sneha.patel@gmail.com",
        loginTime: "Sep 30, 2026, 11:00 AM",
        logoutTime: "Sep 30, 2026, 11:35 AM",
        durationSeconds: 2100,
        status: "ended",
        device: "Chrome / macOS",
        ipAddress: "117.211.89.3"
      }
    ],
    activityLogs: [
      {
        id: "act-c6",
        userEmail: "sneha.patel@gmail.com",
        action: "Paid Registration Fee",
        timestamp: "Sep 30, 2026, 11:15 AM",
        details: "Paid ₹250 for Land Records (Pahani) search"
      }
    ]
  }
];

// In-memory global store preserved during development runtime
let serverCustomers: UserAccount[] = [...INITIAL_SERVER_CUSTOMERS];

export function getServerCustomers(): UserAccount[] {
  return serverCustomers;
}

export function findServerCustomer(idOrEmail: string): UserAccount | undefined {
  const clean = idOrEmail.toLowerCase().trim();
  return serverCustomers.find(
    (c) => c.id === idOrEmail || c.email.toLowerCase() === clean
  );
}

export function updateServerCustomer(id: string, updates: Partial<UserAccount>): UserAccount | null {
  let updatedRecord: UserAccount | null = null;
  serverCustomers = serverCustomers.map((c) => {
    if (c.id === id || c.email.toLowerCase() === id.toLowerCase()) {
      updatedRecord = { ...c, ...updates };
      return updatedRecord;
    }
    return c;
  });
  return updatedRecord;
}

export function deleteServerCustomer(id: string): boolean {
  const initialLen = serverCustomers.length;
  serverCustomers = serverCustomers.filter(
    (c) => c.id !== id && c.email.toLowerCase() !== id.toLowerCase()
  );
  return serverCustomers.length < initialLen;
}

export function recordServerFaceLogin(email: string, photo: string, confidence: number = 98.8): UserAccount | null {
  const clean = email.toLowerCase().trim();
  const nowStr = new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  let target = serverCustomers.find((c) => c.email.toLowerCase() === clean);
  if (!target) {
    // Create new customer record if email not registered yet
    target = {
      id: `usr-cust-${Date.now()}`,
      name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      username: email.split("@")[0],
      email: clean,
      phone: "8125898068",
      role: "customer",
      status: "active",
      avatar: photo,
      lastFaceLoginSnapshot: photo,
      faceLoginTimestamp: nowStr,
      faceVerified: true,
      lastLogin: nowStr,
      dailyServiceCount: 1,
      monthlyServiceCount: 1,
      totalLogins: 1,
      totalLogouts: 0,
      totalUploads: 0,
      activeSessionId: `sess-${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
      registeredAt: nowStr
    };
    serverCustomers.unshift(target);
    return target;
  }

  return updateServerCustomer(target.id, {
    lastFaceLoginSnapshot: photo,
    faceLoginTimestamp: nowStr,
    faceVerified: true,
    lastLogin: nowStr,
    totalLogins: (target.totalLogins || 0) + 1,
    activeSessionId: `sess-${Date.now()}`
  });
}

export function forceLogoutServerCustomer(id: string): UserAccount | null {
  const target = findServerCustomer(id);
  if (!target) return null;

  const nowStr = new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const updatedSessions = (target.sessionLogs || []).map((s) => ({
    ...s,
    status: "ended" as const,
    logoutTime: s.status === "active" ? nowStr : s.logoutTime
  }));

  return updateServerCustomer(target.id, {
    activeSessionId: undefined,
    totalLogouts: (target.totalLogouts || 0) + 1,
    sessionLogs: updatedSessions
  });
}
