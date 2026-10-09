export interface GovPortalLink {
  id: string;
  name: string;
  shortName: string;
  category: "MeeSeva" | "Civil Supplies" | "Municipal" | "Land & Revenue" | "Identity & Police";
  url: string;
  badge: string;
  description: string;
  keyServices: string[];
  theme: "blue" | "emerald" | "amber" | "purple" | "indigo" | "rose" | "cyan" | "orange";
}

export const OFFICIAL_GOV_PORTALS: GovPortalLink[] = [
  {
    id: "meeseva-telangana",
    name: "MeeSeva Telangana Official Portal",
    shortName: "MeeSeva Telangana",
    category: "MeeSeva",
    url: "https://meeseva.telangana.gov.in",
    badge: "Official MeeSeva 2.0",
    description: "Official Telangana state digital services portal for citizen certificates, utility bills, revenue documents and Kiosk operations.",
    keyServices: ["Caste & Income Certificates", "Residence & Nativity", "Gap Certificate", "Police Clearances", "Aadhaar Services"],
    theme: "blue"
  },
  {
    id: "epds-telangana",
    name: "Telangana Food & Civil Supplies (EPDS)",
    shortName: "EPDS Civil Supplies",
    category: "Civil Supplies",
    url: "https://epds.telangana.gov.in",
    badge: "Ration & FSC",
    description: "Electronic Public Distribution System for Food Security Cards (FSC), new ration card applications, member corrections and allocation tracking.",
    keyServices: ["New Ration Card Apply", "Member Corrections", "FSC Card Search", "Deepam LPG Linking", "Ration Shop Allotment"],
    theme: "emerald"
  },
  {
    id: "cdma-telangana",
    name: "CDMA Municipal Administration & Urban Development",
    shortName: "CDMA Municipal",
    category: "Municipal",
    url: "https://cdma.cgg.gov.in",
    badge: "Birth & Death / CDMA",
    description: "Commissioner and Director of Municipal Administration portal for municipal births, deaths, non-availability certificates and trade licences.",
    keyServices: ["Birth Certificate Registration", "Death Certificate Registration", "Non-Availability Certificates", "Trade Licence Services"],
    theme: "amber"
  },
  {
    id: "ghmc-portal",
    name: "Greater Hyderabad Municipal Corporation (GHMC)",
    shortName: "GHMC Hyderabad",
    category: "Municipal",
    url: "https://www.ghmc.gov.in",
    badge: "GHMC / UBC",
    description: "Civic governance portal for Hyderabad municipal jurisdiction, Unregistered Birth Certificates (UBC), property tax and civic grievances.",
    keyServices: ["UBC Birth Certificates", "GHMC Death Registrations", "Property Tax Assessment", "Trade Licensing", "Town Planning"],
    theme: "purple"
  },
  {
    id: "dharani-portal",
    name: "Dharani Integrated Land Records Management",
    shortName: "Dharani Land Records",
    category: "Land & Revenue",
    url: "https://dharani.telangana.gov.in",
    badge: "Land Records / Dharani",
    description: "Telangana comprehensive agricultural land portal combining land registration, mutation, digital passbooks (Pattadar), and ROR-1B records.",
    keyServices: ["Pattadar Passbook Verification", "Land Mutation & Registration", "ROR-1B & Pahani", "Prohibited Lands Search"],
    theme: "emerald"
  },
  {
    id: "igrs-telangana",
    name: "IGRS Telangana Registration & Stamps Department",
    shortName: "IGRS Registration",
    category: "Land & Revenue",
    url: "https://registration.telangana.gov.in",
    badge: "EC / Property Search",
    description: "Property and non-agricultural asset registration portal for Encumbrance Certificates (EC), market value guidance, and certified copies.",
    keyServices: ["Encumbrance Certificate (EC)", "Market Value Search", "Certified Document Copies", "Challan Payment Verification"],
    theme: "cyan"
  },
  {
    id: "uidai-portal",
    name: "UIDAI myAadhaar Official Portal",
    shortName: "UIDAI myAadhaar",
    category: "Identity & Police",
    url: "https://myaadhaar.uidai.gov.in",
    badge: "Aadhaar / UIDAI",
    description: "Unique Identification Authority of India resident portal for Aadhaar download, PVC card ordering, demographic updates and biometric lock.",
    keyServices: ["e-Aadhaar Download", "Order Aadhaar PVC Card", "Address Update", "Biometric Lock/Unlock", "Verify Mobile & Email"],
    theme: "indigo"
  },
  {
    id: "tspolice-portal",
    name: "Telangana State Police Citizen Portal",
    shortName: "TS Police Citizen Portal",
    category: "Identity & Police",
    url: "https://tspolice.gov.in",
    badge: "TS Police / Verification",
    description: "State police citizen interface for police clearance certificates, character verification, missing articles and non-cognizable incident reports.",
    keyServices: ["Police Verification Report", "Lost Article / Document Report", "Domestic Help Verification", "Hawk Eye Citizen Services"],
    theme: "rose"
  },
  {
    id: "telangana-state-portal",
    name: "Government of Telangana Official State Portal",
    shortName: "Telangana State Govt",
    category: "MeeSeva",
    url: "https://telangana.gov.in",
    badge: "State Administration",
    description: "Central portal of Government of Telangana providing state gazette notifications, government orders (GOs), department directories and welfare initiatives.",
    keyServices: ["Government Orders (GOs)", "Department Directory", "State Welfare Schemes", "Official Press Notes"],
    theme: "orange"
  }
];
