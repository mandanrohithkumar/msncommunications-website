import { ServiceItem, ServiceCategory, DocumentCategoryDef } from "@/types/portal";

export const MEESEVA_SERVICES: ServiceItem[] = [
  {
    id: "meeseva-police",
    name: "Police Verification",
    icon: "🛡️",
    price: "180",
    category: "Meeseva",
    key: "police",
    note: "Visit Police Station",
    waitingTime: "2-3 business days",
    officialUrl: "https://tspolice.gov.in",
    active: true,
    docs: [
      { label: "Aadhaar Card", required: true },
      { label: "Passport Size Photo", required: true },
      { label: "Signature", required: true },
      { label: "Add Alternate Document", required: false }
    ],
    fields: [
      { label: "Full Name", type: "text", full: true, required: true },
      { label: "Phone Number", type: "tel", full: true, required: true },
      { label: "State", type: "text", full: false, required: true },
      { label: "District", type: "text", full: false, required: true },
      { label: "Pin Code", type: "text", full: false, required: true },
      { label: "Mandal", type: "text", full: false, required: true },
      { label: "Aadhaar Number", type: "text", full: true, required: true },
      { label: "Email ID", type: "email", full: true, required: true }
    ]
  },
  {
    id: "meeseva-ration",
    name: "Ration Card",
    icon: "📇",
    price: "80",
    category: "Meeseva",
    key: "ration",
    note: "Visit MRO Office",
    waitingTime: "7-10 business days",
    officialUrl: "https://epds.telangana.gov.in",
    active: true,
    docs: [
      { label: "Aadhaar Card", required: true },
      { label: "Mother Aadhaar Card", required: true },
      { label: "Father Aadhaar Card", required: true },
      { label: "Gas Bill", required: true },
      { label: "Passport Size Photo", required: true },
      { label: "Signature", required: true },
      { label: "Add Alternate Document", required: false }
    ],
    fields: [
      { label: "Full Name", type: "text", full: true, required: true },
      { label: "Phone Number", type: "tel", full: true, required: true },
      { label: "State", type: "text", full: false, required: true },
      { label: "District", type: "text", full: false, required: true },
      { label: "Pin Code", type: "text", full: false, required: true },
      { label: "Mandal", type: "text", full: false, required: true },
      { label: "Aadhaar Number", type: "text", full: true, required: true },
      { label: "Mother Aadhaar Number", type: "text", full: true, required: true },
      { label: "Father Aadhaar Number", type: "text", full: true, required: true },
      { label: "Gas Bill Number", type: "text", full: true, required: true },
      { label: "Email ID", type: "email", full: true, required: true }
    ]
  },
  {
    id: "meeseva-ration-corr",
    name: "Ration Card Correction",
    icon: "✏️",
    price: "80",
    category: "Meeseva",
    key: "rationCorrection",
    note: "Visit MRO Office",
    waitingTime: "5-7 business days",
    officialUrl: "https://epds.telangana.gov.in",
    active: true,
    docs: [
      { label: "Ration Card Copy", required: true },
      { label: "Aadhaar Card", required: true },
      { label: "Passport Size Photo", required: true },
      { label: "Signature", required: true },
      { label: "Add Alternate Document", required: false }
    ],
    fields: [
      { label: "Full Name", type: "text", full: true, required: true },
      { label: "Phone Number", type: "tel", full: true, required: true },
      { label: "Aadhaar Number", type: "text", full: true, required: true },
      { label: "Ration Card Number", type: "text", full: true, required: true },
      { label: "State", type: "text", full: false, required: true },
      { label: "District", type: "text", full: false, required: true },
      { label: "Pin Code", type: "text", full: false, required: true },
      { label: "Mandal", type: "text", full: false, required: true },
      { label: "Email ID", type: "email", full: true, required: true }
    ]
  },
  {
    id: "meeseva-death",
    name: "Death Certificate",
    icon: "🕊️",
    price: "80",
    category: "Meeseva",
    key: "death",
    note: "Visit MRO Office",
    waitingTime: "3-5 business days",
    officialUrl: "https://cdma.cgg.gov.in",
    active: true,
    docs: [
      { label: "Hospital Death Summary", required: true },
      { label: "Aadhaar Application ID", required: true },
      { label: "Passport Size Photo", required: true },
      { label: "Signature", required: true },
      { label: "Add Alternate Document", required: false }
    ],
    fields: [
      { label: "Full Name of Deceased", type: "text", full: true, required: true },
      { label: "Phone Number", type: "tel", full: true, required: true },
      { label: "Aadhaar Number", type: "text", full: true, required: true },
      { label: "State", type: "text", full: false, required: true },
      { label: "District", type: "text", full: false, required: true },
      { label: "Pin Code", type: "text", full: false, required: true },
      { label: "Mandal", type: "text", full: false, required: true },
      { label: "Email ID", type: "email", full: true, required: true }
    ]
  },
  {
    id: "meeseva-birth",
    name: "Birth Certificate",
    icon: "👶",
    price: "130",
    category: "Meeseva",
    key: "birth",
    note: "Visit Municipal Office",
    waitingTime: "3-5 business days",
    officialUrl: "https://cdma.cgg.gov.in",
    active: true,
    docs: [
      { label: "Hospital Birth Discharge Slip", required: true },
      { label: "Father Aadhaar Card", required: true },
      { label: "Mother Aadhaar Card", required: true },
      { label: "Passport Size Photo", required: true },
      { label: "Signature", required: true },
      { label: "Add Alternate Document", required: false }
    ],
    fields: [
      { label: "Child / Applicant Full Name", type: "text", full: true, required: true },
      { label: "Mobile Number", type: "tel", full: true, required: true },
      { label: "Father Aadhaar Number", type: "text", full: true, required: true },
      { label: "Mother Aadhaar Number", type: "text", full: true, required: true },
      { label: "State", type: "text", full: false, required: true },
      { label: "District", type: "text", full: false, required: true },
      { label: "Pin Code", type: "text", full: false, required: true },
      { label: "Mandal", type: "text", full: false, required: true },
      { label: "Email ID", type: "email", full: true, required: true }
    ]
  },
  {
    id: "meeseva-missing",
    name: "Missing Document File",
    icon: "📂",
    price: "180",
    category: "Meeseva",
    key: "missingDoc",
    note: "Visit Police Station",
    waitingTime: "2-4 business days",
    officialUrl: "https://tspolice.gov.in",
    active: true,
    docs: [
      { label: "Aadhaar Card", required: true },
      { label: "Lost Document Details / Proof", required: true },
      { label: "Passport Size Photo", required: true },
      { label: "Signature", required: true },
      { label: "Add Alternate Document", required: false }
    ],
    fields: [
      { label: "Full Name", type: "text", full: true, required: true },
      { label: "Phone Number", type: "tel", full: true, required: true },
      { label: "Aadhaar Number", type: "text", full: true, required: true },
      { label: "State", type: "text", full: false, required: true },
      { label: "District", type: "text", full: false, required: true },
      { label: "Pin Code", type: "text", full: false, required: true },
      { label: "Mandal", type: "text", full: false, required: true },
      { label: "Email ID", type: "email", full: true, required: true }
    ]
  },
  {
    id: "meeseva-income",
    name: "Income Certificate",
    icon: "💵",
    price: "80",
    category: "Meeseva",
    key: "income",
    note: "Visit MRO Office",
    waitingTime: "5-7 business days",
    officialUrl: "https://meeseva.telangana.gov.in",
    active: true,
    docs: [
      { label: "Aadhaar Card", required: true },
      { label: "Salary Certificate or Tax Return", required: true },
      { label: "Passport Size Photo", required: true },
      { label: "Signature", required: true },
      { label: "Add Alternate Document", required: false }
    ],
    fields: [
      { label: "Full Name", type: "text", full: true, required: true },
      { label: "Phone Number", type: "tel", full: true, required: true },
      { label: "Aadhaar Number", type: "text", full: true, required: true },
      { label: "State", type: "text", full: false, required: true },
      { label: "District", type: "text", full: false, required: true },
      { label: "Pin Code", type: "text", full: false, required: true },
      { label: "Mandal", type: "text", full: false, required: true },
      { label: "Email ID", type: "email", full: true, required: true }
    ]
  },
  {
    id: "meeseva-caste",
    name: "Caste Certificate",
    icon: "🛡️",
    price: "80",
    category: "Meeseva",
    key: "caste",
    note: "Visit MRO Office",
    waitingTime: "7-10 business days",
    officialUrl: "https://meeseva.telangana.gov.in",
    active: true,
    docs: [
      { label: "Aadhaar Card", required: true },
      { label: "Ration Card Document", required: true },
      { label: "Old Caste Certificate", required: true },
      { label: "Passport Size Photo", required: true },
      { label: "Signature", required: true },
      { label: "Add Alternate Document", required: false }
    ],
    fields: [
      { label: "Full Name", type: "text", full: true, required: true },
      { label: "Phone Number", type: "tel", full: true, required: true },
      { label: "Aadhaar Number", type: "text", full: true, required: true },
      { label: "Ration Card Number", type: "text", full: true, required: true },
      { label: "State", type: "text", full: false, required: true },
      { label: "District", type: "text", full: false, required: true },
      { label: "Pin Code", type: "text", full: false, required: true },
      { label: "Mandal", type: "text", full: false, required: true },
      { label: "Email ID", type: "email", full: true, required: true }
    ]
  },
  {
    id: "meeseva-ncl",
    name: "Non-Creamy Layer (NCL) Certificate",
    icon: "📜",
    price: "80",
    category: "Meeseva",
    key: "ncl",
    note: "Visit MRO Office",
    waitingTime: "5-7 business days",
    officialUrl: "https://meeseva.telangana.gov.in",
    active: true,
    docs: [
      { label: "Aadhaar Card", required: true },
      { label: "Income Proof", required: true },
      { label: "Passport Size Photo", required: true },
      { label: "Signature", required: true },
      { label: "Add Alternate Document", required: false }
    ],
    fields: [
      { label: "Full Name", type: "text", full: true, required: true },
      { label: "Phone Number", type: "tel", full: true, required: true },
      { label: "Aadhaar Number", type: "text", full: true, required: true },
      { label: "Income Certificate Number", type: "text", full: true, required: true },
      { label: "State", type: "text", full: false, required: true },
      { label: "District", type: "text", full: false, required: true },
      { label: "Pin Code", type: "text", full: false, required: true },
      { label: "Mandal", type: "text", full: false, required: true },
      { label: "Email ID", type: "email", full: true, required: true }
    ]
  },
  {
    id: "meeseva-ews",
    name: "EWS Certificate",
    icon: "⭐",
    price: "80",
    category: "Meeseva",
    key: "ews",
    note: "Visit MRO Office",
    waitingTime: "7-10 business days",
    officialUrl: "https://meeseva.telangana.gov.in",
    active: true,
    docs: [
      { label: "Aadhaar Card", required: true },
      { label: "Income and Asset Certificate", required: true },
      { label: "Passport Size Photo", required: true },
      { label: "Signature", required: true },
      { label: "Add Alternate Document", required: false }
    ],
    fields: [
      { label: "Full Name", type: "text", full: true, required: true },
      { label: "Phone Number", type: "tel", full: true, required: true },
      { label: "Aadhaar Number", type: "text", full: true, required: true },
      { label: "Income Certificate Number", type: "text", full: true, required: true },
      { label: "Asset Certificate Number", type: "text", full: true, required: true },
      { label: "State", type: "text", full: false, required: true },
      { label: "District", type: "text", full: false, required: true },
      { label: "Pin Code", type: "text", full: false, required: true },
      { label: "Mandal", type: "text", full: false, required: true },
      { label: "Email ID", type: "email", full: true, required: true }
    ]
  },
  {
    id: "meeseva-obc",
    name: "OBC Certificate",
    icon: "📋",
    price: "80",
    category: "Meeseva",
    key: "obc",
    note: "Visit MRO Office",
    waitingTime: "7-10 business days",
    officialUrl: "https://meeseva.telangana.gov.in",
    active: true,
    docs: [
      { label: "Aadhaar Card", required: true },
      { label: "Caste Proof", required: true },
      { label: "Passport Size Photo", required: true },
      { label: "Signature", required: true },
      { label: "Add Alternate Document", required: false }
    ],
    fields: [
      { label: "Full Name", type: "text", full: true, required: true },
      { label: "Phone Number", type: "tel", full: true, required: true },
      { label: "Aadhaar Number", type: "text", full: true, required: true },
      { label: "Caste Proof Number", type: "text", full: true, required: true },
      { label: "State", type: "text", full: false, required: true },
      { label: "District", type: "text", full: false, required: true },
      { label: "Pin Code", type: "text", full: false, required: true },
      { label: "Mandal", type: "text", full: false, required: true },
      { label: "Email ID", type: "email", full: true, required: true }
    ]
  },
  {
    id: "meeseva-agri",
    name: "Agriculture Income",
    icon: "🌾",
    price: "80",
    category: "Meeseva",
    key: "agri",
    note: "Visit MRO Office",
    waitingTime: "5-7 business days",
    officialUrl: "https://meeseva.telangana.gov.in",
    active: true,
    docs: [
      { label: "Pattadar Passbook", required: true },
      { label: "Aadhaar Card", required: true },
      { label: "Passport Size Photo", required: true },
      { label: "Signature", required: true },
      { label: "Add Alternate Document", required: false }
    ],
    fields: [
      { label: "Full Name", type: "text", full: true, required: true },
      { label: "Phone Number", type: "tel", full: true, required: true },
      { label: "Pattadar Passbook Number", type: "text", full: true, required: true },
      { label: "Aadhaar Number", type: "text", full: true, required: true },
      { label: "State", type: "text", full: false, required: true },
      { label: "District", type: "text", full: false, required: true },
      { label: "Pin Code", type: "text", full: false, required: true },
      { label: "Mandal", type: "text", full: false, required: true },
      { label: "Email ID", type: "email", full: true, required: true }
    ]
  }
];

export const ONLINE_CATEGORIES: ServiceCategory[] = [
  {
    id: "cat-aadhaar",
    name: "Aadhaar Services",
    icon: "📇",
    subServices: [
      {
        id: "aadhaar-login",
        name: "Aadhaar Login",
        icon: "📇",
        price: "20",
        category: "Aadhaar Services",
        note: "OTP received on the registered mobile number.",
        officialUrl: "https://myaadhaar.uidai.gov.in",
        active: true,
        docs: [{ label: "Aadhaar card" }, { label: "Virtual ID" }],
        fields: [
          { label: "Aadhaar number", type: "text", full: true, required: true },
          { label: "Virtual ID number", type: "text", full: true },
          { label: "Name", type: "text", full: true, required: true },
          { label: "Mail ID", type: "email", full: true, required: true },
          { label: "Phone number", type: "tel", full: true, required: true },
          { label: "State", type: "text", full: false },
          { label: "District", type: "text", full: false },
          { label: "Mandal", type: "text", full: false },
          { label: "Colony", type: "text", full: false },
          { label: "Pin code", type: "text", full: false }
        ]
      },
      {
        id: "aadhaar-verify",
        name: "Aadhaar Verify (Mobile No.)",
        icon: "📇",
        price: "20",
        category: "Aadhaar Services",
        note: "Aadhaar number and the mobile number to be verified.",
        officialUrl: "https://myaadhaar.uidai.gov.in/verify-email-mobile",
        active: true,
        docs: [{ label: "Aadhaar card" }],
        fields: [
          { label: "Aadhaar number", type: "text", full: true, required: true },
          { label: "Mobile number", type: "tel", full: true, required: true }
        ]
      },
      {
        id: "aadhaar-status",
        name: "Check Aadhaar Status",
        icon: "📇",
        price: "10",
        category: "Aadhaar Services",
        note: "M-sign Enrolment (EID) or service request number (SRN) along with the date and time stamp.",
        officialUrl: "https://myaadhaar.uidai.gov.in/CheckAadhaarStatus",
        active: true,
        docs: [{ label: "Enrolment / Update Acknowledgement Slip" }],
        fields: [
          { label: "Digit Enrolment ID number", type: "text", full: true, required: true },
          { label: "Service Request Number (SRN)", type: "text", full: true }
        ]
      },
      {
        id: "aadhaar-download",
        name: "Aadhaar Download",
        icon: "📇",
        price: "20",
        category: "Aadhaar Services",
        note: "Download secure digital e-Aadhaar.",
        officialUrl: "https://myaadhaar.uidai.gov.in/gen-download-eaadhaar",
        active: true,
        docs: [
          { label: "Aadhaar card" },
          { label: "Enrolment ID Slip (EID) (optional)" },
          { label: "Virtual ID (VID) (optional)" },
          { label: "PAN Card (optional)" }
        ],
        fields: [
          { label: "Aadhaar number", type: "text", full: true, required: true },
          { label: "Enrolment ID (EID) number", type: "text", full: true },
          { label: "Virtual ID (VID)", type: "text", full: true },
          { label: "PAN card number", type: "text", full: true }
        ]
      },
      {
        id: "aadhaar-pvc",
        name: "Order Aadhaar PVC Card Print",
        icon: "📇",
        price: "150",
        category: "Aadhaar Services",
        note: "Order official PVC Aadhaar card print delivered by Speed Post.",
        officialUrl: "https://myaadhaar.uidai.gov.in/gen-pvc",
        active: true,
        docs: [{ label: "Aadhaar card" }],
        fields: [
          { label: "Aadhaar number", type: "text", full: true, required: true },
          { label: "Alternative number (works plus OTP)", type: "text", full: true }
        ]
      },
      {
        id: "aadhaar-pvc-status",
        name: "Check Aadhaar PVC Card Print Status",
        icon: "📇",
        price: "10",
        category: "Aadhaar Services",
        note: "Track PVC card delivery status.",
        officialUrl: "https://myaadhaar.uidai.gov.in/checkStatus",
        active: true,
        docs: [{ label: "Aadhaar card" }],
        fields: [
          { label: "Aadhaar number", type: "text", full: true, required: true },
          { label: "28-digit Service Request Number", type: "text", full: true }
        ]
      },
      {
        id: "aadhaar-update-history",
        name: "Aadhaar Update History",
        icon: "📇",
        price: "10",
        category: "Aadhaar Services",
        note: "Registered mobile number for OTP verification.",
        officialUrl: "https://myaadhaar.uidai.gov.in",
        active: true,
        docs: [{ label: "Aadhaar card" }, { label: "Virtual ID" }],
        fields: [
          { label: "Aadhaar number", type: "text", full: true, required: true },
          { label: "Virtual ID number", type: "text", full: true },
          { label: "Service Request Number (SRN)", type: "text", full: true }
        ]
      },
      {
        id: "aadhaar-auth-history",
        name: "Aadhaar Authentication History",
        icon: "📇",
        price: "10",
        category: "Aadhaar Services",
        note: "Check previous biometric/demographic authentications.",
        officialUrl: "https://myaadhaar.uidai.gov.in",
        active: true,
        docs: [{ label: "Aadhaar card" }],
        fields: [
          { label: "Aadhaar number", type: "text", full: true, required: true },
          { label: "Mobile number", type: "tel", full: true, required: true }
        ]
      }
    ]
  },
  {
    id: "cat-passport",
    name: "Passport Services",
    icon: "🛂",
    subServices: [
      {
        id: "passport-new",
        name: "New Passport Application",
        icon: "🛂",
        price: "3000",
        category: "Passport Services",
        note: "Visit Passport Seva Kendra (PSK) with appointment slip.",
        officialUrl: "https://passportindia.gov.in",
        active: true,
        docs: [
          { label: "PAN card" },
          { label: "Proof of Identity (Voter ID, Utility bill, Bank Passbook, Aadhaar)" },
          { label: "Proof of Address" },
          { label: "Proof of Date of Birth" },
          { label: "Driving licence" },
          { label: "Passport site photo" },
          { label: "Signature" }
        ],
        fields: [
          { label: "Full legal name", type: "text", full: true, required: true },
          { label: "Parents' legal names", type: "text", full: true, required: true },
          { label: "Date of birth", type: "date", full: false, required: true },
          { label: "Place of birth", type: "text", full: false, required: true },
          { label: "Residential address", type: "text", full: true, required: true },
          { label: "Mobile number", type: "tel", full: false, required: true },
          { label: "Email address", type: "email", full: false, required: true },
          { label: "Employment type", type: "text", full: false },
          { label: "Aadhaar number", type: "text", full: false },
          { label: "PAN number", type: "text", full: false }
        ]
      },
      {
        id: "passport-track",
        name: "Track Application Status",
        icon: "🛂",
        price: "20",
        category: "Passport Services",
        note: "Check real-time passport application status.",
        officialUrl: "https://passportindia.gov.in",
        active: true,
        docs: [{ label: "Application receipt / Aadhaar card" }],
        fields: [
          { label: "15-digit File Number", type: "text", full: true, required: true },
          { label: "Applicant's Date of Birth", type: "date", full: true, required: true }
        ]
      }
    ]
  },
  {
    id: "cat-police",
    name: "Police Department",
    icon: "🛡️",
    subServices: [
      {
        id: "police-echallan",
        name: "Traffic Police e-Challan Payment",
        icon: "🛡️",
        price: "100",
        category: "Police Department",
        note: "Pay pending traffic challans securely.",
        officialUrl: "https://echallan.tspolice.gov.in",
        active: true,
        docs: [{ label: "Aadhaar card" }, { label: "Driving licence" }, { label: "Vehicle RC" }],
        fields: [
          { label: "Driving licence number", type: "text", full: true },
          { label: "Vehicle registration number", type: "text", full: true, required: true },
          { label: "Challan number", type: "text", full: true },
          { label: "Mobile number", type: "tel", full: true, required: true }
        ]
      },
      {
        id: "police-hyd",
        name: "Hyderabad City Police Services",
        icon: "🛡️",
        price: "100",
        category: "Police Department",
        note: "Access Hyderabad city police online portals.",
        officialUrl: "https://hyderabadpolice.gov.in",
        active: true,
        docs: [{ label: "Aadhaar card" }, { label: "Passport photo" }, { label: "Incident-specific supporting documents" }],
        fields: [
          { label: "Aadhaar number", type: "text", full: true, required: true },
          { label: "Residential address", type: "text", full: true },
          { label: "Specific service subject details", type: "text", full: true, required: true },
          { label: "Full name", type: "text", full: false, required: true },
          { label: "Contact phone number", type: "tel", full: false, required: true }
        ]
      },
      {
        id: "police-tspolice",
        name: "TS Police Citizen Services",
        icon: "🛡️",
        price: "100",
        category: "Police Department",
        note: "Telangana state citizen safety and verification services.",
        officialUrl: "https://tspolice.gov.in",
        active: true,
        docs: [{ label: "Aadhaar card" }, { label: "Parents' name" }, { label: "Passport / Voter ID" }, { label: "Driving licence" }, { label: "PAN card" }],
        fields: [
          { label: "Applicant's name", type: "text", full: true, required: true },
          { label: "Phone number", type: "tel", full: false, required: true },
          { label: "Email ID", type: "email", full: false },
          { label: "Exact nature of request", type: "text", full: true, required: true }
        ]
      }
    ]
  },
  {
    id: "cat-rta",
    name: "RTA Services",
    icon: "🚗",
    subServices: [
      {
        id: "rta-aos",
        name: "Automated Online Services (AOS)",
        icon: "🚗",
        price: "100",
        category: "RTA Services",
        note: "RTA automated transport services.",
        officialUrl: "https://transport.telangana.gov.in",
        active: true,
        docs: [{ label: "Driving licence" }, { label: "Vehicle documents" }],
        fields: [
          { label: "Licence number", type: "text", full: true, required: true },
          { label: "Mobile number", type: "tel", full: true, required: true }
        ]
      },
      {
        id: "rta-numbers",
        name: "Registration Numbers Search",
        icon: "🚗",
        price: "20",
        category: "RTA Services",
        note: "Search available RTA vehicle registration numbers.",
        officialUrl: "https://transport.telangana.gov.in",
        active: true,
        docs: [{ label: "Vehicle documents" }],
        fields: [
          { label: "Application number", type: "text", full: true, required: true },
          { label: "Mobile number", type: "tel", full: true, required: true }
        ]
      },
      {
        id: "rta-delivery",
        name: "Document Delivery Status",
        icon: "🚗",
        price: "20",
        category: "RTA Services",
        note: "Track status of DL or RC card delivery.",
        officialUrl: "https://transport.telangana.gov.in",
        active: true,
        docs: [{ label: "Receipt slip" }],
        fields: [
          { label: "Application number", type: "text", full: true, required: true },
          { label: "Date of birth", type: "date", full: true, required: true }
        ]
      },
      {
        id: "rta-status-reg",
        name: "Status of Registration Numbers",
        icon: "🚗",
        price: "20",
        category: "RTA Services",
        note: "Check vanity or normal registration number status.",
        officialUrl: "https://transport.telangana.gov.in",
        active: true,
        docs: [{ label: "Receipt slip" }],
        fields: [{ label: "Application number", type: "text", full: true, required: true }]
      }
    ]
  },
  {
    id: "cat-election",
    name: "Election / Voter Services",
    icon: "🗳️",
    subServices: [
      {
        id: "voter-form6",
        name: "New Voter id Card (Form-6)",
        icon: "🗳️",
        price: "100",
        category: "Election / Voter Services",
        note: "Apply for new voter registration card (Form 6).",
        officialUrl: "https://voters.eci.gov.in",
        active: true,
        docs: [
          { label: "Birth certificate" },
          { label: "10th memo" },
          { label: "PAN card" },
          { label: "Electricity/water bill" },
          { label: "Aadhaar" },
          { label: "Passport-size photo" }
        ],
        fields: [
          { label: "Full name", type: "text", full: true, required: true },
          { label: "Relatives' name (Father/Mother/Husband)", type: "text", full: true, required: true },
          { label: "Date of birth", type: "date", full: false, required: true },
          { label: "Gender", type: "text", full: false, required: true },
          { label: "Full residential address", type: "text", full: true, required: true },
          { label: "Mobile number", type: "tel", full: false, required: true },
          { label: "Email address", type: "email", full: false }
        ]
      },
      {
        id: "voter-form8",
        name: "Correction Voter id card (Form-8)",
        icon: "🗳️",
        price: "100",
        category: "Election / Voter Services",
        note: "Apply for corrections in existing voter ID card (Form 8).",
        officialUrl: "https://voters.eci.gov.in",
        active: true,
        docs: [
          { label: "Existing EPIC (Voter ID) copy" },
          { label: "Marriage certificate" },
          { label: "Aadhaar card" },
          { label: "Birth certificate" }
        ],
        fields: [
          { label: "EPIC number", type: "text", full: true, required: true },
          { label: "Applicant's name", type: "text", full: true, required: true },
          { label: "Details requiring correction", type: "text", full: true, required: true },
          { label: "Mobile number", type: "tel", full: true, required: true }
        ]
      },
      {
        id: "voter-track",
        name: "Track Application Status",
        icon: "🗳️",
        price: "20",
        category: "Election / Voter Services",
        note: "Track voter card application status.",
        officialUrl: "https://voters.eci.gov.in",
        active: true,
        docs: [{ label: "Application Reference Slip" }],
        fields: [{ label: "Reference ID Number", type: "text", full: true, required: true }]
      },
      {
        id: "voter-search",
        name: "Name Based Search",
        icon: "🗳️",
        price: "20",
        category: "Election / Voter Services",
        note: "Search voter list by name.",
        officialUrl: "https://electoralsearch.eci.gov.in",
        active: true,
        docs: [{ label: "Aadhaar card" }],
        fields: [
          { label: "Full Name", type: "text", full: false, required: true },
          { label: "District", type: "text", full: false, required: true },
          { label: "Assembly Constituency", type: "text", full: true, required: true }
        ]
      }
    ]
  },
  {
    id: "cat-updates",
    name: "Latest Updates",
    icon: "⚡",
    subServices: [
      {
        id: "updates-iti",
        name: "TG ITI Admissions",
        icon: "⚡",
        price: "150",
        category: "Latest Updates",
        note: "Telangana ITI admissions online counseling.",
        officialUrl: "https://iti.telangana.gov.in",
        active: true,
        docs: [{ label: "SSC / 10th Class Marks Memo" }, { label: "Study Certificates" }, { label: "Transfer Certificate (TC)" }, { label: "Caste & Income Certificates" }, { label: "Aadhaar Card" }],
        fields: [
          { label: "Candidate's full name", type: "text", full: true, required: true },
          { label: "Date of birth", type: "date", full: false, required: true },
          { label: "Father's name", type: "text", full: false },
          { label: "SSC Hall Ticket number", type: "text", full: true, required: true },
          { label: "Mobile number", type: "tel", full: false, required: true },
          { label: "Email address", type: "email", full: false }
        ]
      },
      {
        id: "updates-cpget",
        name: "TG CPGET",
        icon: "⚡",
        price: "100",
        category: "Latest Updates",
        note: "Common Post Graduate Entrance Tests counseling.",
        officialUrl: "https://cpget.tsche.ac.in",
        active: true,
        docs: [{ label: "Degree Provisional & Marks Memos" }, { label: "Intermediate Memo" }, { label: "SSC Certificate" }, { label: "Study Certificates" }, { label: "TC" }],
        fields: [
          { label: "Candidate's full name", type: "text", full: true, required: true },
          { label: "Date of birth", type: "date", full: false, required: true },
          { label: "Qualifying Degree Hall Ticket number", type: "text", full: true, required: true },
          { label: "Mobile number", type: "tel", full: false, required: true },
          { label: "Aadhar number", type: "text", full: false }
        ]
      },
      {
        id: "updates-dost",
        name: "TG DOST (Degree Online Services)",
        icon: "⚡",
        price: "200",
        category: "Latest Updates",
        note: "Degree Online Services Telangana (DOST) admissions.",
        officialUrl: "https://dost.cgg.gov.in",
        active: true,
        docs: [{ label: "Intermediate Pass Certificate" }, { label: "SSC Certificate" }, { label: "Transfer Certificate (TC)" }, { label: "Caste and Income Certificates" }, { label: "Aadhaar card" }],
        fields: [
          { label: "Candidate's full name", type: "text", full: true, required: true },
          { label: "Date of birth", type: "date", full: false, required: true },
          { label: "Intermediate Hall Ticket number", type: "text", full: true, required: true },
          { label: "Aadhaar number", type: "text", full: true, required: true },
          { label: "Mobile number", type: "tel", full: false, required: true }
        ]
      },
      {
        id: "updates-ssc",
        name: "TG SSC Results",
        icon: "⚡",
        price: "20",
        category: "Latest Updates",
        note: "View TS SSC Public Examination results.",
        officialUrl: "https://bse.telangana.gov.in",
        active: true,
        docs: [{ label: "Hall Ticket" }],
        fields: [
          { label: "SSC Hall Ticket number", type: "text", full: true, required: true },
          { label: "Date of birth", type: "date", full: true, required: true }
        ]
      },
      {
        id: "updates-inter",
        name: "TG Inter Results",
        icon: "⚡",
        price: "20",
        category: "Latest Updates",
        note: "View Telangana Intermediate 1st/2nd year results.",
        officialUrl: "https://tsbie.cgg.gov.in",
        active: true,
        docs: [{ label: "Hall Ticket" }],
        fields: [
          { label: "Intermediate Hall Ticket number", type: "text", full: true, required: true },
          { label: "Date of birth", type: "date", full: true, required: true }
        ]
      },
      {
        id: "updates-rgukt",
        name: "TG RGUKT (Basar, Mahabubnagar) Admissions",
        icon: "⚡",
        price: "200",
        category: "Latest Updates",
        note: "RGUKT IIIT Basar and Mahabubnagar admissions.",
        officialUrl: "https://admissions.rgukt.ac.in",
        active: true,
        docs: [{ label: "SSC Public Exam Marks Sheet" }, { label: "Study Certificates" }, { label: "TC & Conduct Certificate" }, { label: "Caste & Income Certificates" }],
        fields: [
          { label: "Candidate's full name", type: "text", full: true, required: true },
          { label: "Date of birth", type: "date", full: false, required: true },
          { label: "SSC Hall Ticket number", type: "text", full: true, required: true },
          { label: "GPA/Marks secured", type: "text", full: false },
          { label: "Mobile number", type: "tel", full: false, required: true }
        ]
      },
      {
        id: "updates-swrjc",
        name: "TGSWRJC CET (Inter)",
        icon: "⚡",
        price: "100",
        category: "Latest Updates",
        note: "Social Welfare Residential Junior Colleges entrance test.",
        officialUrl: "https://tswreis.ac.in",
        active: true,
        docs: [{ label: "Study Certificate" }, { label: "SSC Hall Ticket" }, { label: "Caste & Income Certificates" }],
        fields: [
          { label: "Candidate's full name", type: "text", full: true, required: true },
          { label: "Date of birth", type: "date", full: false, required: true },
          { label: "Parent's name", type: "text", full: false },
          { label: "Mobile number", type: "tel", full: true, required: true }
        ]
      },
      {
        id: "updates-rjc",
        name: "TG RJC & KGBVY IIOE (GIRLS)",
        icon: "⚡",
        price: "100",
        category: "Latest Updates",
        note: "Residential Junior Colleges & KGBV admissions.",
        officialUrl: "https://tsrjdc.cgg.gov.in",
        active: true,
        docs: [{ label: "SSC Hall Ticket and Marks Memo" }, { label: "Study Certificates" }, { label: "Caste & Income Certificates" }],
        fields: [
          { label: "Candidate's full name", type: "text", full: true, required: true },
          { label: "Date of birth", type: "date", full: false, required: true },
          { label: "Mobile number", type: "tel", full: true, required: true }
        ]
      },
      {
        id: "updates-model",
        name: "Telangana Model Schools (VI & VII-X)",
        icon: "⚡",
        price: "100",
        category: "Latest Updates",
        note: "Telangana Model Schools entrance test.",
        officialUrl: "https://telanganams.cgg.gov.in",
        active: true,
        docs: [{ label: "Previous class passing certificate" }, { label: "Aadhaar card" }, { label: "Caste & Income Certificates" }],
        fields: [
          { label: "Student's full name", type: "text", full: true, required: true },
          { label: "Date of birth", type: "date", full: false, required: true },
          { label: "Class applied for", type: "text", full: false, required: true },
          { label: "Mobile number", type: "tel", full: true, required: true }
        ]
      },
      {
        id: "updates-halltickets",
        name: "TGSWREI Society Hall Tickets",
        icon: "⚡",
        price: "100",
        category: "Latest Updates",
        note: "Download social welfare society hall tickets.",
        officialUrl: "https://tswreis.ac.in",
        active: true,
        docs: [{ label: "Online Application Registration Number" }],
        fields: [
          { label: "Registration number", type: "text", full: true, required: true },
          { label: "Date of birth", type: "date", full: true, required: true }
        ]
      },
      {
        id: "updates-epcet",
        name: "TG EPCET (Eamcet)",
        icon: "⚡",
        price: "20",
        category: "Latest Updates",
        note: "Engineering, Agriculture & Pharmacy Common Entrance Test.",
        officialUrl: "https://eapcet.tsche.ac.in",
        active: true,
        docs: [{ label: "Intermediate Hall Ticket / Marks Memo" }, { label: "SSC Certificate" }, { label: "Study Certificates" }],
        fields: [
          { label: "Candidate's full name", type: "text", full: true, required: true },
          { label: "Intermediate Hall Ticket number", type: "text", full: true, required: true },
          { label: "Mobile number", type: "tel", full: true, required: true }
        ]
      },
      {
        id: "updates-ecet",
        name: "TG ECET",
        icon: "⚡",
        price: "200",
        category: "Latest Updates",
        note: "Engineering Common Entrance Test for Diploma/B.Sc holders.",
        officialUrl: "https://ecet.tsche.ac.in",
        active: true,
        docs: [{ label: "Diploma / B.Sc. Provisional Certificate" }, { label: "SSC Marks Memo" }, { label: "Study Certificates" }],
        fields: [
          { label: "Candidate's full name", type: "text", full: true, required: true },
          { label: "Diploma/B.Sc. Hall Ticket number", type: "text", full: true, required: true },
          { label: "Mobile number", type: "tel", full: true, required: true }
        ]
      },
      {
        id: "updates-icet",
        name: "TG ICET",
        icon: "⚡",
        price: "150",
        category: "Latest Updates",
        note: "Integrated Common Entrance Test for MBA & MCA.",
        officialUrl: "https://icet.tsche.ac.in",
        active: true,
        docs: [{ label: "Degree Marks Memos & Provisional Certificate" }, { label: "SSC Certificate" }, { label: "Study Certificates" }],
        fields: [
          { label: "Candidate's full name", type: "text", full: true, required: true },
          { label: "Degree Hall Ticket number", type: "text", full: true, required: true },
          { label: "Mobile number", type: "tel", full: true, required: true }
        ]
      },
      {
        id: "updates-pgecet",
        name: "TG PGECET",
        icon: "⚡",
        price: "200",
        category: "Latest Updates",
        note: "Post Graduate Engineering Common Entrance Test.",
        officialUrl: "https://pgecet.tsche.ac.in",
        active: true,
        docs: [{ label: "B.Tech / B.E. / Pharmacy Marks Memos" }, { label: "GATE Score Card (if any)" }, { label: "SSC & Intermediate Certificates" }],
        fields: [
          { label: "Candidate's full name", type: "text", full: true, required: true },
          { label: "Graduation Hall Ticket number", type: "text", full: true, required: true },
          { label: "Mobile number", type: "tel", full: true, required: true }
        ]
      },
      {
        id: "updates-lawcet",
        name: "TG LAWCET",
        icon: "⚡",
        price: "150",
        category: "Latest Updates",
        note: "Law Common Entrance Test for 3-Year / 5-Year LLB.",
        officialUrl: "https://lawcet.tsche.ac.in",
        active: true,
        docs: [{ label: "Qualifying Examination Certificate" }, { label: "SSC Certificate" }, { label: "Study Certificates" }],
        fields: [
          { label: "Candidate's full name", type: "text", full: true, required: true },
          { label: "Qualifying exam hall ticket number", type: "text", full: true, required: true },
          { label: "Mobile number", type: "tel", full: true, required: true }
        ]
      },
      {
        id: "updates-polycet",
        name: "TG POLYCET",
        icon: "⚡",
        price: "100",
        category: "Latest Updates",
        note: "Polytechnic Common Entrance Test.",
        officialUrl: "https://polycet.sbtet.telangana.gov.in",
        active: true,
        docs: [{ label: "SSC Hall Ticket or Passed Certificate" }, { label: "Study Certificates" }, { label: "Caste & Income Certificates" }],
        fields: [
          { label: "Candidate's full name", type: "text", full: true, required: true },
          { label: "SSC Hall Ticket number", type: "text", full: true, required: true },
          { label: "Mobile number", type: "tel", full: true, required: true }
        ]
      },
      {
        id: "updates-minorities",
        name: "Common Entrance Test For Minorities (TMR)",
        icon: "⚡",
        price: "100",
        category: "Latest Updates",
        note: "Minority residential schools entrance exam.",
        officialUrl: "https://tmreis.telangana.gov.in",
        active: true,
        docs: [{ label: "Minority Status Declaration" }, { label: "Previous Class Study Certificate" }, { label: "SSC Certificate" }],
        fields: [
          { label: "Candidate's full name", type: "text", full: true, required: true },
          { label: "Previous hall ticket number", type: "text", full: true, required: true },
          { label: "Mobile number", type: "tel", full: true, required: true }
        ]
      },
      {
        id: "updates-ssctg",
        name: "SSC Results (TG)",
        icon: "⚡",
        price: "10",
        category: "Latest Updates",
        note: "Quick SSC result archives.",
        officialUrl: "https://bse.telangana.gov.in",
        active: true,
        docs: [{ label: "SSC Hall Ticket" }],
        fields: [
          { label: "SSC Hall Ticket number", type: "text", full: true, required: true },
          { label: "Date of birth", type: "date", full: true, required: true }
        ]
      },
      {
        id: "updates-intermemo",
        name: "Telangana Inter Results Marks Memo",
        icon: "⚡",
        price: "20",
        category: "Latest Updates",
        note: "Detailed inter marks memo download.",
        officialUrl: "https://tsbie.cgg.gov.in",
        active: true,
        docs: [{ label: "Intermediate Hall Ticket Number" }],
        fields: [
          { label: "Hall Ticket number", type: "text", full: true, required: true },
          { label: "Year of examination", type: "text", full: false },
          { label: "Date of birth", type: "date", full: false }
        ]
      }
    ]
  },
  {
    id: "cat-schemes",
    name: "TS Govt Schemes",
    icon: "🏛️",
    subServices: [
      {
        id: "schemes-aasara",
        name: "Search Aasara Pension Status",
        icon: "🏛️",
        price: "Free",
        category: "TS Govt Schemes",
        note: "Check Aasara pension disbursement status.",
        officialUrl: "https://aasara.telangana.gov.in",
        active: true,
        docs: [{ label: "Pension Card" }, { label: "Application Receipt" }],
        fields: [
          { label: "Pensioner ID / Sanketika Vidhanam Number", type: "text", full: true, required: true },
          { label: "District", type: "text", full: false },
          { label: "Mandal", type: "text", full: false },
          { label: "Name", type: "text", full: true }
        ]
      },
      {
        id: "schemes-wise",
        name: "Search Schemes Wise Status",
        icon: "🏛️",
        price: "20",
        category: "TS Govt Schemes",
        note: "Check welfare scheme status (Kalyanalaxmi, Scholarships, etc.).",
        officialUrl: "https://telanganaepass.cgg.gov.in",
        active: true,
        docs: [{ label: "Aadhaar Card" }, { label: "Application ID" }],
        fields: [
          { label: "Academic Year / Sanction Year", type: "text", full: false },
          { label: "Application ID", type: "text", full: true, required: true },
          { label: "Student / Applicant Aadhaar Number", type: "text", full: true, required: true },
          { label: "Mobile Number", type: "tel", full: false }
        ]
      },
      {
        id: "schemes-kalyana",
        name: "Kalyana Lakshmi & Shaadi Mubarak Apply",
        icon: "🏛️",
        price: "20",
        category: "TS Govt Schemes",
        note: "Apply for Kalyana Lakshmi & Shaadi Mubarak financial assistance.",
        officialUrl: "https://telanganaepass.cgg.gov.in",
        active: true,
        docs: [
          { label: "Bride's Aadhaar Card" },
          { label: "Groom's Aadhaar Card" },
          { label: "SSC Memo" },
          { label: "Marriage Invitation Card" },
          { label: "Caste & Income Certificates" },
          { label: "Bank Passbook" }
        ],
        fields: [
          { label: "Bride's and Groom's Name", type: "text", full: true, required: true },
          { label: "Date of Birth", type: "date", full: false, required: true },
          { label: "Parent's Name", type: "text", full: false },
          { label: "Complete Address", type: "text", full: true, required: true },
          { label: "Mobile Number", type: "tel", full: false, required: true },
          { label: "Bank Account Number & IFSC", type: "text", full: true, required: true },
          { label: "Marriage Date", type: "date", full: false }
        ]
      }
    ]
  },
  {
    id: "cat-pmkisan",
    name: "PM-Kisan Samman Nidhi",
    icon: "🌾",
    subServices: [
      {
        id: "pmkisan-ekyc",
        name: "PM Kisan Ekyc",
        icon: "🌾",
        price: "50",
        category: "PM-Kisan Samman Nidhi",
        note: "Aadhaar-linked active mobile number for OTP.",
        officialUrl: "https://pmkisan.gov.in",
        active: true,
        docs: [{ label: "Aadhaar card" }, { label: "PM-Kisan document" }],
        fields: [
          { label: "Aadhaar number", type: "text", full: true, required: true },
          { label: "PM-Kisan registration number", type: "text", full: true, required: true }
        ]
      },
      {
        id: "pmkisan-new",
        name: "PM Kisan New Farmer Registration",
        icon: "🌾",
        price: "50",
        category: "PM-Kisan Samman Nidhi",
        note: "Register new farmer for PM-Kisan scheme.",
        officialUrl: "https://pmkisan.gov.in",
        active: true,
        docs: [{ label: "Aadhaar card" }, { label: "Bank passbook" }, { label: "Land ownership paper (Patta / Adangal / Title Deed)" }],
        fields: [
          { label: "Farmer's full name", type: "text", full: true, required: true },
          { label: "Gender", type: "text", full: false },
          { label: "Category (General/SC/ST)", type: "text", full: false },
          { label: "Mobile number", type: "tel", full: false, required: true },
          { label: "Bank account details & IFSC code", type: "text", full: true, required: true },
          { label: "Complete land survey khata numbers", type: "text", full: true, required: true }
        ]
      },
      {
        id: "pmkisan-status",
        name: "PM Kisan Beneficiary Status",
        icon: "🌾",
        price: "20",
        category: "PM-Kisan Samman Nidhi",
        note: "Check installment payment status.",
        officialUrl: "https://pmkisan.gov.in",
        active: true,
        docs: [{ label: "Aadhaar card" }],
        fields: [
          { label: "Aadhaar number", type: "text", full: true, required: true },
          { label: "Account number", type: "text", full: true },
          { label: "Mobile number", type: "tel", full: true }
        ]
      }
    ]
  },
  {
    id: "cat-employees",
    name: "TS Govt. Employee Services",
    icon: "👨‍💼",
    subServices: [
      {
        id: "emp-health",
        name: "TS Govt. Employee Health Cards",
        icon: "👨‍💼",
        price: "100",
        category: "TS Govt. Employee Services",
        note: "Apply for or manage Telangana state employee health cards (EHS).",
        officialUrl: "https://ehs.telangana.gov.in",
        active: true,
        docs: [{ label: "Employee ID" }, { label: "Pay slip copy" }, { label: "Dependent family member identity details/photography" }],
        fields: [
          { label: "Employee code", type: "text", full: false },
          { label: "Treasury ID", type: "text", full: false, required: true },
          { label: "Name", type: "text", full: true, required: true },
          { label: "Designation", type: "text", full: false },
          { label: "Department", type: "text", full: false },
          { label: "Date of birth", type: "date", full: false },
          { label: "Mobile number", type: "tel", full: false, required: true },
          { label: "Email ID", type: "email", full: false }
        ]
      },
      {
        id: "emp-payslips",
        name: "TS Employee Payslips",
        icon: "👨‍💼",
        price: "20",
        category: "TS Govt. Employee Services",
        note: "Download digital treasury payslips.",
        officialUrl: "https://treasury.telangana.gov.in",
        active: true,
        docs: [{ label: "Employee ID card" }],
        fields: [
          { label: "Employee ID", type: "text", full: false },
          { label: "Treasury ID", type: "text", full: false, required: true },
          { label: "Month & Year", type: "text", full: false, required: true },
          { label: "Mobile Number", type: "tel", full: false }
        ]
      },
      {
        id: "emp-tsgli",
        name: "TSGLI Bonds",
        icon: "👨‍💼",
        price: "50",
        category: "TS Govt. Employee Services",
        note: "Telangana Government Life Insurance policy services.",
        officialUrl: "https://tsgli.telangana.gov.in",
        active: true,
        docs: [{ label: "Policy bond number" }],
        fields: [
          { label: "Policy number", type: "text", full: true, required: true },
          { label: "DDO code", type: "text", full: false },
          { label: "Employee ID", type: "text", full: false },
          { label: "Date of birth", type: "date", full: false },
          { label: "Registered mobile number", type: "tel", full: false }
        ]
      },
      {
        id: "emp-apgli",
        name: "APGLI Bonds",
        icon: "👨‍💼",
        price: "50",
        category: "TS Govt. Employee Services",
        note: "Andhra Pradesh Government Life Insurance policy services.",
        officialUrl: "https://apgli.ap.gov.in",
        active: true,
        docs: [{ label: "Policy bond number" }],
        fields: [
          { label: "Policy number", type: "text", full: true, required: true },
          { label: "DDO code", type: "text", full: false },
          { label: "Employee ID", type: "text", full: false },
          { label: "Date of birth", type: "date", full: false },
          { label: "Registered mobile number", type: "tel", full: false }
        ]
      }
    ]
  },
  {
    id: "cat-registration",
    name: "Telangana Registration Department",
    icon: "🏢",
    subServices: [
      {
        id: "reg-ec",
        name: "Encumbrance Search (EC)",
        icon: "🏢",
        price: "100",
        category: "Telangana Registration Department",
        note: "Search encumbrance certificate (EC) records.",
        officialUrl: "https://registration.telangana.gov.in",
        active: true,
        docs: [{ label: "Property details reference documents" }, { label: "Previous deed copy" }],
        fields: [
          { label: "District", type: "text", full: false, required: true },
          { label: "Mandal", type: "text", full: false, required: true },
          { label: "Village / Ward", type: "text", full: false, required: true },
          { label: "Survey Number / House Number", type: "text", full: false, required: true },
          { label: "Period / Year Range", type: "text", full: true }
        ]
      },
      {
        id: "reg-certified",
        name: "Certified Copy of Document",
        icon: "🏢",
        price: "600",
        category: "Telangana Registration Department",
        note: "Apply for certified copy of registered property deeds.",
        officialUrl: "https://registration.telangana.gov.in",
        active: true,
        docs: [{ label: "Sale deed reference / Old document details" }, { label: "Registration details" }],
        fields: [
          { label: "Document Number", type: "text", full: false, required: true },
          { label: "Year of Registration", type: "text", full: false, required: true },
          { label: "SRO Location", type: "text", full: true, required: true },
          { label: "Applicant's Mobile Number", type: "tel", full: true, required: true }
        ]
      },
      {
        id: "reg-prohibited",
        name: "Prohibited Properties",
        icon: "🏢",
        price: "50",
        category: "Telangana Registration Department",
        note: "Check prohibited properties list.",
        officialUrl: "https://registration.telangana.gov.in",
        active: true,
        docs: [{ label: "No specific hard documents required" }],
        fields: [
          { label: "District", type: "text", full: false, required: true },
          { label: "Mandal", type: "text", full: false, required: true },
          { label: "Village", type: "text", full: false, required: true },
          { label: "Survey / Plot Number", type: "text", full: true, required: true }
        ]
      },
      {
        id: "reg-market",
        name: "Market Value Search",
        icon: "🏢",
        price: "50",
        category: "Telangana Registration Department",
        note: "Search official land and building market values.",
        officialUrl: "https://registration.telangana.gov.in",
        active: true,
        docs: [{ label: "No specific documents required" }],
        fields: [
          { label: "District", type: "text", full: false, required: true },
          { label: "Mandal", type: "text", full: false, required: true },
          { label: "Village", type: "text", full: false, required: true },
          { label: "Property Type (Land or Apartment)", type: "text", full: false, required: true },
          { label: "Land Classification", type: "text", full: false }
        ]
      },
      {
        id: "reg-marriage",
        name: "Marriage Registration",
        icon: "🏢",
        price: "200",
        category: "Telangana Registration Department",
        note: "Register marriage officially under Telangana registration department.",
        officialUrl: "https://registration.telangana.gov.in",
        active: true,
        docs: [
          { label: "Marriage invitation card" },
          { label: "Joint photograph of bride and groom" },
          { label: "Birth certificate / SSC memo" },
          { label: "Address proof" },
          { label: "Aadhaar / Voter card" }
        ],
        fields: [
          { label: "Bride and groom full names", type: "text", full: true, required: true },
          { label: "Parents' names", type: "text", full: true, required: true },
          { label: "Dates of birth", type: "text", full: false, required: true },
          { label: "Residential addresses", type: "text", full: true, required: true },
          { label: "Date and place of marriage", type: "text", full: false, required: true },
          { label: "Mobile number", type: "tel", full: false, required: true },
          { label: "Witness details", type: "text", full: true }
        ]
      }
    ]
  },
  {
    id: "cat-students",
    name: "Student Services",
    icon: "🎓",
    subServices: [
      {
        id: "stu-ssc",
        name: "TS SSC Short Memo Download",
        icon: "🎓",
        price: "50",
        category: "Student Services",
        note: "Download SSC short marks memo.",
        officialUrl: "https://bse.telangana.gov.in",
        active: true,
        docs: [{ label: "Hall ticket" }],
        fields: [
          { label: "Hall ticket number", type: "text", full: true, required: true },
          { label: "Year of pass", type: "text", full: false },
          { label: "Date of birth", type: "date", full: false }
        ]
      },
      {
        id: "stu-inter",
        name: "TS Intermediate Student Services",
        icon: "🎓",
        price: "100",
        category: "Student Services",
        note: "Intermediate student verification and certificates.",
        officialUrl: "https://tsbie.cgg.gov.in",
        active: true,
        docs: [{ label: "10th memo" }, { label: "1st year hall ticket" }, { label: "2nd year hall ticket" }],
        fields: [
          { label: "First year hall ticket number", type: "text", full: false },
          { label: "Second year hall ticket number", type: "text", full: false },
          { label: "Date of birth", type: "date", full: false },
          { label: "Stream (MPC/BiPC/CEC/HEC)", type: "text", full: false }
        ]
      },
      {
        id: "stu-ou",
        name: "Osmania University Student Services",
        icon: "🎓",
        price: "100",
        category: "Student Services",
        note: "Osmania University online student utilities.",
        officialUrl: "https://osmania.ac.in",
        active: true,
        docs: [{ label: "University Hall ticket" }, { label: "Previous semester marks sheets" }, { label: "College ID card" }],
        fields: [
          { label: "Student name", type: "text", full: true, required: true },
          { label: "Enrollment number / Hall ticket number", type: "text", full: true, required: true },
          { label: "Branch", type: "text", full: false },
          { label: "Year of study", type: "text", full: false },
          { label: "Mobile number", type: "tel", full: true, required: true }
        ]
      },
      {
        id: "stu-jntu",
        name: "JNTU Student Services",
        icon: "🎓",
        price: "100",
        category: "Student Services",
        note: "JNTU Hyderabad student transcript and certificate requests.",
        officialUrl: "https://jntuh.ac.in",
        active: true,
        docs: [{ label: "University Hall ticket" }, { label: "Previous semester marks sheets" }, { label: "College ID card" }],
        fields: [
          { label: "Student name", type: "text", full: true, required: true },
          { label: "Enrollment number / Hall ticket number", type: "text", full: true, required: true },
          { label: "Branch", type: "text", full: false },
          { label: "Year of study", type: "text", full: false },
          { label: "Mobile number", type: "tel", full: true, required: true }
        ]
      },
      {
        id: "stu-braou",
        name: "Dr. B.R. Ambedkar Open University Online Admissions",
        icon: "🎓",
        price: "200",
        category: "Student Services",
        note: "BRAOU online admissions.",
        officialUrl: "https://braouonline.in",
        active: true,
        docs: [{ label: "Qualifying degree certificate" }, { label: "Intermediate certificate" }, { label: "Transfer certificate" }, { label: "Passport photo" }],
        fields: [
          { label: "Full name", type: "text", full: true, required: true },
          { label: "Father's name", type: "text", full: false },
          { label: "Mother's name", type: "text", full: false },
          { label: "Date of birth", type: "date", full: false, required: true },
          { label: "Address", type: "text", full: true, required: true },
          { label: "Mobile number", type: "tel", full: false, required: true },
          { label: "Study center preference", type: "text", full: true }
        ]
      },
      {
        id: "stu-scholarships",
        name: "TS Scholarships (Pre & Post Metric)",
        icon: "🎓",
        price: "200",
        category: "Student Services",
        note: "Apply for Telangana e-PASS pre-metric and post-metric scholarships.",
        officialUrl: "https://telanganaepass.cgg.gov.in",
        active: true,
        docs: [{ label: "SSC memo" }, { label: "Bonafide certificate" }, { label: "Caste & Income certificates" }, { label: "Bank passbook" }, { label: "Student Aadhaar card" }],
        fields: [
          { label: "Application ID number", type: "text", full: true },
          { label: "SSC hall ticket number", type: "text", full: false, required: true },
          { label: "Mobile number", type: "tel", full: false, required: true },
          { label: "Bank account IFSC & number", type: "text", full: true, required: true }
        ]
      }
    ]
  },
  {
    id: "cat-gas",
    name: "Gas Bookings",
    icon: "🔥",
    subServices: [
      {
        id: "gas-bharat",
        name: "Bharat Gas LPG Booking",
        icon: "🔥",
        price: "50",
        category: "Gas Bookings",
        note: "Book Bharat Gas LPG refill or manage connection.",
        officialUrl: "https://ebharatgas.com",
        active: true,
        docs: [{ label: "Proof of identity / Address proof" }],
        fields: [
          { label: "17-digit LPG Consumer ID", type: "text", full: true, required: true },
          { label: "Distributor name", type: "text", full: false },
          { label: "Registered mobile number", type: "tel", full: false, required: true },
          { label: "Delivery pin code", type: "text", full: false }
        ]
      },
      {
        id: "gas-hp",
        name: "HP Gas LPG Booking",
        icon: "🔥",
        price: "50",
        category: "Gas Bookings",
        note: "Book HP Gas LPG refill or manage connection.",
        officialUrl: "https://myhpgas.in",
        active: true,
        docs: [{ label: "Proof of identity / Address proof" }],
        fields: [
          { label: "17-digit LPG Consumer ID", type: "text", full: true, required: true },
          { label: "Distributor name", type: "text", full: false },
          { label: "Registered mobile number", type: "tel", full: false, required: true },
          { label: "Delivery pin code", type: "text", full: false }
        ]
      },
      {
        id: "gas-indane",
        name: "Indane LPG Gas Booking",
        icon: "🔥",
        price: "50",
        category: "Gas Bookings",
        note: "Book Indane LPG cylinder refill.",
        officialUrl: "https://cx.indianoil.in",
        active: true,
        docs: [{ label: "Proof of identity / Address proof" }],
        fields: [
          { label: "17-digit LPG Consumer ID", type: "text", full: true, required: true },
          { label: "Distributor name", type: "text", full: false },
          { label: "Registered mobile number", type: "tel", full: false, required: true },
          { label: "Delivery pin code", type: "text", full: false }
        ]
      }
    ]
  },
  {
    id: "cat-pan",
    name: "PAN Services",
    icon: "💳",
    subServices: [
      {
        id: "pan-instant",
        name: "Instant PAN Card",
        icon: "💳",
        price: "100",
        category: "PAN Services",
        note: "Get instant e-PAN via Aadhaar e-KYC.",
        officialUrl: "https://incometax.gov.in",
        active: true,
        docs: [{ label: "Aadhaar card" }, { label: "Mobile number linked with Aadhaar for OTP" }],
        fields: [
          { label: "Full name", type: "text", full: true, required: true },
          { label: "Aadhaar number", type: "text", full: true, required: true },
          { label: "Date of birth", type: "date", full: false, required: true },
          { label: "Gender", type: "text", full: false, required: true },
          { label: "Mobile number", type: "tel", full: false, required: true }
        ]
      },
      {
        id: "pan-new",
        name: "PAN Card Application (New)",
        icon: "💳",
        price: "250",
        category: "PAN Services",
        note: "Apply for a fresh Form 49A PAN card (covering NSDL and UTIITSL processing).",
        officialUrl: "https://onlineservices.nsdl.com/paam/endUserRegisterContact.html",
        active: true,
        docs: [
          { label: "Aadhaar Card", required: true },
          { label: "10th Memo / Proof of Date of Birth", required: true },
          { label: "Passport-sized photograph", required: true },
          { label: "Signature", required: true },
          { label: "Add Alternate Document", required: false }
        ],
        fields: [
          { label: "Full Name", type: "text", full: true, required: true },
          { label: "Father's Name", type: "text", full: true, required: true },
          { label: "Date of Birth", type: "date", full: false, required: true },
          { label: "Gender", type: "text", full: false, required: true },
          { label: "Mobile Number", type: "tel", full: false, required: true },
          { label: "Email Address", type: "email", full: false, required: true },
          { label: "Aadhaar Number", type: "text", full: true, required: true },
          { label: "Physical Address", type: "text", full: true, required: true },
          { label: "Processing Agency (NSDL / UTIITSL)", type: "text", full: false, placeholder: "NSDL or UTIITSL" }
        ]
      },
      {
        id: "pan-correction",
        name: "PAN Card Application (Correction)",
        icon: "💳",
        price: "250",
        category: "PAN Services",
        note: "Correction, name/DOB change or reprint of existing PAN card (covering NSDL and UTIITSL).",
        officialUrl: "https://onlineservices.nsdl.com/paam/endUserRegisterContact.html",
        active: true,
        docs: [
          { label: "Existing PAN Card Copy", required: true },
          { label: "Aadhaar Card", required: true },
          { label: "Proof of Correction / Supporting Document", required: true },
          { label: "Passport-sized photograph", required: true },
          { label: "Signature", required: true },
          { label: "Add Alternate Document", required: false }
        ],
        fields: [
          { label: "Existing PAN Card Number", type: "text", full: true, required: true, placeholder: "10-character PAN to be corrected (e.g. ABCDE1234F)" },
          { label: "Full Name", type: "text", full: true, required: true },
          { label: "Father's Name", type: "text", full: true, required: true },
          { label: "Date of Birth", type: "date", full: false, required: true },
          { label: "Mobile Number", type: "tel", full: false, required: true },
          { label: "Email Address", type: "email", full: false, required: true },
          { label: "Aadhaar Number", type: "text", full: true, required: true },
          { label: "Correction Details / Reason", type: "text", full: true, placeholder: "e.g. Name spelling correction, Date of birth change" },
          { label: "Physical Address", type: "text", full: true, required: true },
          { label: "Processing Agency (NSDL / UTIITSL)", type: "text", full: false, placeholder: "NSDL or UTIITSL" }
        ]
      },
      {
        id: "pan-verify",
        name: "Verify your PAN",
        icon: "💳",
        price: "20",
        category: "PAN Services",
        note: "Verify PAN card authenticity.",
        officialUrl: "https://incometax.gov.in",
        active: true,
        docs: [{ label: "Mobile number for OTP" }],
        fields: [
          { label: "PAN number", type: "text", full: true, required: true },
          { label: "Full name (as per PAN)", type: "text", full: true, required: true },
          { label: "Date of birth", type: "date", full: false, required: true },
          { label: "Mobile number", type: "tel", full: false }
        ]
      },
      {
        id: "pan-download",
        name: "Download e-PAN",
        icon: "💳",
        price: "100",
        category: "PAN Services",
        note: "Download digital e-PAN card copy.",
        officialUrl: "https://onlineservices.nsdl.com",
        active: true,
        docs: [{ label: "Aadhaar card" }, { label: "PAN card" }],
        fields: [
          { label: "PAN number", type: "text", full: true, required: true },
          { label: "Aadhaar number", type: "text", full: true, required: true },
          { label: "Date of birth", type: "date", full: false, required: true },
          { label: "Registered mobile number or email for OTP", type: "tel", full: true, required: true }
        ]
      }
    ]
  },
  {
    id: "cat-welfare",
    name: "Telangana Govt. Welfare Schemes",
    icon: "✅",
    subServices: [
      {
        id: "welfare-obmms",
        name: "OBMMS Subsidy Loan Application",
        icon: "✅",
        price: "100",
        category: "Telangana Govt. Welfare Schemes",
        note: "OBMMS subsidy loan application and monitoring.",
        officialUrl: "https://obmms.cgg.gov.in",
        active: true,
        docs: [{ label: "Caste certificate" }, { label: "Income certificate" }, { label: "Bank passbook" }, { label: "Aadhaar card" }],
        fields: [
          { label: "Beneficiary name", type: "text", full: true, required: true },
          { label: "Caste/sub-caste", type: "text", full: false },
          { label: "District", type: "text", full: false, required: true },
          { label: "Mandal", type: "text", full: false, required: true },
          { label: "Village", type: "text", full: false },
          { label: "Mobile number", type: "tel", full: false, required: true },
          { label: "Project/scheme type", type: "text", full: true, required: true }
        ]
      }
    ]
  },
  {
    id: "cat-rationcard",
    name: "Ration Card (Food Security Card)",
    icon: "🍞",
    subServices: [
      {
        id: "ration-fsc",
        name: "Food Security Card (FSC) Ration Card",
        icon: "🍞",
        price: "20",
        category: "Ration Card (Food Security Card)",
        note: "Apply for Food Security Card (Ration Card) in Telangana.",
        officialUrl: "https://epds.telangana.gov.in",
        active: true,
        docs: [{ label: "Aadhaar card" }, { label: "Father's & Mother's Aadhaar cards" }, { label: "Income certificate" }, { label: "Birth certificate" }],
        fields: [
          { label: "Head of family name", type: "text", full: true, required: true },
          { label: "Total number of family members", type: "text", full: false },
          { label: "Age & Gender", type: "text", full: false },
          { label: "Residential address", type: "text", full: true, required: true },
          { label: "Mobile number", type: "tel", full: false, required: true },
          { label: "Existing gas connection details", type: "text", full: true }
        ]
      }
    ]
  },
  {
    id: "cat-udyam",
    name: "Udyam (Udyog Aadhaar)",
    icon: "🏭",
    subServices: [
      {
        id: "udyam-new",
        name: "Udyam New Registration (Udyog Aadhaar)",
        icon: "🏭",
        price: "250",
        category: "Udyam (Udyog Aadhaar)",
        note: "Register MSME under Udyam portal.",
        officialUrl: "https://udyamregistration.gov.in",
        active: true,
        docs: [{ label: "Proprietor's/Partner's Aadhaar card" }, { label: "Business PAN card" }, { label: "GSTIN / Bank account details" }],
        fields: [
          { label: "Entrepreneur's name", type: "text", full: true, required: true },
          { label: "Mobile number & Email", type: "text", full: false, required: true },
          { label: "Social category", type: "text", full: false },
          { label: "Enterprise name", type: "text", full: true, required: true },
          { label: "Official address", type: "text", full: true, required: true },
          { label: "Partner bank account number & IFSC", type: "text", full: true },
          { label: "Major business activity code (NIC code)", type: "text", full: false },
          { label: "Number of employees", type: "text", full: false }
        ]
      },
      {
        id: "udyam-print",
        name: "Print Udyam Certificate",
        icon: "🏭",
        price: "100",
        category: "Udyam (Udyog Aadhaar)",
        note: "Download & print Udyam registration certificate.",
        officialUrl: "https://udyamregistration.gov.in",
        active: true,
        docs: [{ label: "Udyam Registration Number" }],
        fields: [
          { label: "Udyam registration number", type: "text", full: true, required: true },
          { label: "Registered mobile/email verification", type: "text", full: true, required: true }
        ]
      }
    ]
  },
  {
    id: "cat-buspass",
    name: "TS RTC Student Bus Pass Services",
    icon: "🚌",
    subServices: [
      {
        id: "bus-ssc-dist",
        name: "Student Bus Pass Upto SSC (District)",
        icon: "🚌",
        price: "100",
        category: "TS RTC Student Bus Pass Services",
        note: "District student bus pass for classes 1-10.",
        officialUrl: "https://online.tsrtcpass.in",
        active: true,
        docs: [{ label: "Bonafide / study certificate" }, { label: "Fee receipt" }, { label: "Passport-size photograph" }],
        fields: [
          { label: "Student's full name", type: "text", full: true, required: true },
          { label: "Father's name", type: "text", full: false },
          { label: "Date of birth", type: "date", full: false, required: true },
          { label: "School name", type: "text", full: true, required: true },
          { label: "Residential address", type: "text", full: true, required: true },
          { label: "Bus route details (from/to)", type: "text", full: true, required: true },
          { label: "Mobile number", type: "tel", full: false, required: true }
        ]
      },
      {
        id: "bus-college-dist",
        name: "Student Bus Pass Above SSC (District)",
        icon: "🚌",
        price: "100",
        category: "TS RTC Student Bus Pass Services",
        note: "District college student bus pass.",
        officialUrl: "https://online.tsrtcpass.in",
        active: true,
        docs: [{ label: "Bonafide / study certificate from college" }, { label: "Fee receipt" }, { label: "Passport-size photograph" }],
        fields: [
          { label: "Student's full name", type: "text", full: true, required: true },
          { label: "Father's name", type: "text", full: false },
          { label: "Date of birth", type: "date", full: false, required: true },
          { label: "College name", type: "text", full: true, required: true },
          { label: "Residential address", type: "text", full: true, required: true },
          { label: "Bus route details (from/to)", type: "text", full: true, required: true },
          { label: "Mobile number", type: "tel", full: false, required: true }
        ]
      },
      {
        id: "bus-ssc-ghmc",
        name: "Student Bus Pass Upto SSC (GHMC)",
        icon: "🚌",
        price: "100",
        category: "TS RTC Student Bus Pass Services",
        note: "GHMC city bus pass for classes 1-10.",
        officialUrl: "https://online.tsrtcpass.in",
        active: true,
        docs: [{ label: "Bonafide / study certificate" }, { label: "Fee receipt" }, { label: "Passport-size photograph" }],
        fields: [
          { label: "Student's full name", type: "text", full: true, required: true },
          { label: "Father's name", type: "text", full: false },
          { label: "Date of birth", type: "date", full: false, required: true },
          { label: "School name", type: "text", full: true, required: true },
          { label: "Residential address", type: "text", full: true, required: true },
          { label: "Bus route details (from/to)", type: "text", full: true, required: true },
          { label: "Mobile number", type: "tel", full: false, required: true }
        ]
      },
      {
        id: "bus-college-ghmc",
        name: "Student Bus Pass Above SSC (GHMC)",
        icon: "🚌",
        price: "100",
        category: "TS RTC Student Bus Pass Services",
        note: "GHMC college student bus pass.",
        officialUrl: "https://online.tsrtcpass.in",
        active: true,
        docs: [{ label: "Bonafide / study certificate from college" }, { label: "Fee receipt" }, { label: "Passport-size photograph" }],
        fields: [
          { label: "Student's full name", type: "text", full: true, required: true },
          { label: "Father's name", type: "text", full: false },
          { label: "Date of birth", type: "date", full: false, required: true },
          { label: "College name", type: "text", full: true, required: true },
          { label: "Residential address", type: "text", full: true, required: true },
          { label: "Bus route details (from/to)", type: "text", full: true, required: true },
          { label: "Mobile number", type: "tel", full: false, required: true }
        ]
      }
    ]
  },
  {
    id: "cat-employment",
    name: "TS Employment Exchange Services",
    icon: "📈",
    subServices: [
      {
        id: "emp-card-new",
        name: "Employment Card New Application",
        icon: "📈",
        price: "200",
        category: "TS Employment Exchange Services",
        note: "Register new employment exchange registration card.",
        officialUrl: "https://employment.telangana.gov.in",
        active: true,
        docs: [{ label: "SSC certificate" }, { label: "Intermediate & Degree certificates" }, { label: "Study certificate" }, { label: "Caste certificate" }],
        fields: [
          { label: "Full name", type: "text", full: true, required: true },
          { label: "Parents' names", type: "text", full: true },
          { label: "Date of birth", type: "date", full: false, required: true },
          { label: "Gender", type: "text", full: false, required: true },
          { label: "Residential address", type: "text", full: true, required: true },
          { label: "Educational qualifications", type: "text", full: true, required: true },
          { label: "Technical skills", type: "text", full: true },
          { label: "Mobile number & Email", type: "text", full: false, required: true }
        ]
      },
      {
        id: "emp-card-download",
        name: "TS Employment Card Download",
        icon: "📈",
        price: "100",
        category: "TS Employment Exchange Services",
        note: "Download renewal or registered employment card.",
        officialUrl: "https://employment.telangana.gov.in",
        active: true,
        docs: [{ label: "Registration ID" }, { label: "Renewal receipt" }],
        fields: [
          { label: "Registration number", type: "text", full: true, required: true },
          { label: "Date of birth", type: "date", full: true, required: true }
        ]
      }
    ]
  },
  {
    id: "cat-temples",
    name: "Temples Reservations",
    icon: "🛕",
    subServices: [
      {
        id: "temple-ttd",
        name: "Tirumala Tirupathi Devasthanams (TTD)",
        icon: "🛕",
        price: "200",
        category: "Temples Reservations",
        note: "Book TTD darshan, accommodation or sevas.",
        officialUrl: "https://ttdevasthanams.ap.gov.in",
        active: true,
        docs: [{ label: "Government photo ID card (Aadhaar / Voter / DL)" }],
        fields: [
          { label: "Pilgrim's full name", type: "text", full: true, required: true },
          { label: "Age & Gender", type: "text", full: false, required: true },
          { label: "ID card type and number", type: "text", full: true, required: true },
          { label: "Mobile number & Email ID", type: "text", full: false, required: true },
          { label: "Preferred darshan slot date and timing", type: "text", full: true, required: true }
        ]
      },
      {
        id: "temple-shirdi",
        name: "Shri Sai Baba (Shirdi)",
        icon: "🛕",
        price: "100",
        category: "Temples Reservations",
        note: "Shirdi Sai Baba Sansthan darshan booking.",
        officialUrl: "https://online.sai.org.in",
        active: true,
        docs: [{ label: "Government photo ID card" }],
        fields: [
          { label: "Pilgrim's full name", type: "text", full: true, required: true },
          { label: "Age & Gender", type: "text", full: false, required: true },
          { label: "ID card type and number", type: "text", full: true, required: true },
          { label: "Mobile number & Email ID", type: "text", full: false, required: true },
          { label: "Preferred darshan slot date and timing", type: "text", full: true, required: true }
        ]
      },
      {
        id: "temple-vemulawada",
        name: "Raja Rajeshwara Swamy (Vemulawada)",
        icon: "🛕",
        price: "100",
        category: "Temples Reservations",
        note: "Vemulawada temple darshan and puja booking.",
        officialUrl: "https://srirajarajeshwaraswamytemple.telangana.gov.in",
        active: true,
        docs: [{ label: "Government photo ID card" }],
        fields: [
          { label: "Pilgrim's full name", type: "text", full: true, required: true },
          { label: "Age & Gender", type: "text", full: false, required: true },
          { label: "ID card type and number", type: "text", full: true, required: true },
          { label: "Mobile number & Email ID", type: "text", full: false, required: true },
          { label: "Preferred darshan slot date", type: "date", full: true, required: true }
        ]
      },
      {
        id: "temple-basara",
        name: "Sri Gnana Saraswathi Devi (Basara)",
        icon: "🛕",
        price: "100",
        category: "Temples Reservations",
        note: "Basara temple Aksharabhyasam and darshan booking.",
        officialUrl: "https://srimahakaleshwar.telangana.gov.in",
        active: true,
        docs: [{ label: "Government photo ID card" }],
        fields: [
          { label: "Pilgrim's full name", type: "text", full: true, required: true },
          { label: "Age & Gender", type: "text", full: false, required: true },
          { label: "ID card type and number", type: "text", full: true, required: true },
          { label: "Mobile number & Email ID", type: "text", full: false, required: true },
          { label: "Preferred Aksharabhyasam date", type: "date", full: true, required: true }
        ]
      },
      {
        id: "temple-yadadri",
        name: "Sri Lakshmi Narasimha Swamy (Yadadri)",
        icon: "🛕",
        price: "100",
        category: "Temples Reservations",
        note: "Yadadri temple VIP darshan and puja reservations.",
        officialUrl: "https://yadadritemple.telangana.gov.in",
        active: true,
        docs: [{ label: "Government photo ID card" }],
        fields: [
          { label: "Pilgrim's full name", type: "text", full: true, required: true },
          { label: "Age & Gender", type: "text", full: false, required: true },
          { label: "ID card type and number", type: "text", full: true, required: true },
          { label: "Mobile number & Email ID", type: "text", full: false, required: true },
          { label: "Preferred puja/darshan slot", type: "text", full: true, required: true }
        ]
      }
    ]
  },
  {
    id: "cat-bills",
    name: "Online Bill Payments",
    icon: "💡",
    subServices: [
      {
        id: "bill-bsnl",
        name: "BSNL Land Line Bill Payment",
        icon: "💡",
        price: "50",
        category: "Online Bill Payments",
        note: "Pay BSNL landline bills online.",
        officialUrl: "https://portal2.bsnl.in",
        active: true,
        docs: [{ label: "Previous utility bill statement" }],
        fields: [
          { label: "BSNL telephone number with STD code", type: "text", full: true, required: true },
          { label: "Mobile number", type: "tel", full: false, required: true },
          { label: "Email ID", type: "email", full: false }
        ]
      },
      {
        id: "bill-npdcl",
        name: "NPDCL Electricity Bill Payment",
        icon: "💡",
        price: "50",
        category: "Online Bill Payments",
        note: "Pay Northern Power Distribution Company of Telangana electricity bills.",
        officialUrl: "https://tsnpdcl.in",
        active: true,
        docs: [{ label: "Previous utility bill statement" }],
        fields: [
          { label: "Consumer number / unique service number (USN)", type: "text", full: true, required: true },
          { label: "Mobile number", type: "tel", full: false, required: true },
          { label: "Email ID", type: "email", full: false }
        ]
      },
      {
        id: "bill-tsspdcl",
        name: "TSSPDCL Electricity Bill Payment",
        icon: "💡",
        price: "50",
        category: "Online Bill Payments",
        note: "Pay Southern Power Distribution Company of Telangana electricity bills.",
        officialUrl: "https://www.tssouthernpower.com",
        active: true,
        docs: [{ label: "Previous utility bill statement" }],
        fields: [
          { label: "Consumer number / unique service number (USN)", type: "text", full: true, required: true },
          { label: "Mobile number", type: "tel", full: false, required: true },
          { label: "Email ID", type: "email", full: false }
        ]
      }
    ]
  },
  {
    id: "cat-ghmc",
    name: "GHMC",
    icon: "🏙️",
    subServices: [
      {
        id: "ghmc-services",
        name: "GHMC Municipal Services",
        icon: "🏙️",
        price: "100",
        category: "GHMC",
        note: "GHMC municipal services, property tax and trade license.",
        officialUrl: "https://ghmc.gov.in",
        active: true,
        docs: [{ label: "Property tax receipt" }, { label: "Trade license certificate" }, { label: "Building permission papers" }],
        fields: [
          { label: "Assessment number", type: "text", full: false },
          { label: "PTIN number", type: "text", full: false },
          { label: "Mobile number", type: "tel", full: false, required: true },
          { label: "Applicant name", type: "text", full: true, required: true },
          { label: "Property address", type: "text", full: true, required: true }
        ]
      }
    ]
  },
  {
    id: "cat-cdma",
    name: "Municipal (C D M A)",
    icon: "🏘️",
    subServices: [
      {
        id: "cdma-services",
        name: "Telangana Municipal Online Services",
        icon: "🏘️",
        price: "100",
        category: "Municipal (C D M A)",
        note: "Director of Municipal Administration online citizen services.",
        officialUrl: "https://cdma.cgg.gov.in",
        active: true,
        docs: [{ label: "Property tax receipt" }, { label: "Trade license certificate" }, { label: "Building permission papers" }],
        fields: [
          { label: "Assessment number", type: "text", full: false },
          { label: "PTIN number", type: "text", full: false },
          { label: "Mobile number", type: "tel", full: false, required: true },
          { label: "Applicant name", type: "text", full: true, required: true },
          { label: "Property address", type: "text", full: true, required: true }
        ]
      }
    ]
  }
];

export const DOCUMENT_CATEGORIES: DocumentCategoryDef[] = [
  {
    name: "Identity & Personal Documents",
    icon: "📇",
    items: [
      "Aadhaar card",
      "Pan card",
      "Driving licence",
      "Passport Document",
      "Voter ID card",
      "Health ID card (ABHA / PM-JAY)",
      "Passport Size Photograph",
      "Scanned Signature",
      "College Identity Card"
    ]
  },
  {
    name: "Vehicles & Travel",
    icon: "🚗",
    items: [
      "Vehicle Registration certificate (RC)",
      "Vehicle Insurance Policy",
      "Pollution Under Control (PUC)",
      "Previous Utility Bill statement"
    ]
  },
  {
    name: "Academic & Education",
    icon: "🎓",
    items: [
      "Class X Marksheet",
      "Class XII Marksheet",
      "School Bonafide Certificate",
      "University Degree Certificate",
      "Diploma certificate",
      "Graduation marksheet",
      "Skill Development certificate",
      "Academic Bank of Credits (ABC) card",
      "Admit cards (JEE, NEET, CBSE)",
      "Transfer certificate (TC)",
      "Hall Tickets"
    ]
  },
  {
    name: "Family, Civil & Status",
    icon: "👨‍👩‍👧‍👦",
    items: [
      "Ration card",
      "Birth Certificate",
      "Death Certificate",
      "Marriage Certificate",
      "Character certificate",
      "Domicile certificate"
    ]
  },
  {
    name: "Employment & Professional",
    icon: "💼",
    items: [
      "Appointment letter",
      "Salary slip",
      "Service certificate",
      "Trade License Certificate",
      "Incorporation Deed",
      "Intellectual Property certificate"
    ]
  },
  {
    name: "Financial & Property",
    icon: "🏦",
    items: [
      "Income certificate",
      "Caste certificate",
      "Life Insurance Policy",
      "Medical test report",
      "Property Tax Receipt",
      "Land Ownership Papers",
      "GSTIN Registration",
      "Bank passbook",
      "Electricity utility Bill"
    ]
  }
];
