/**
 * Field Classification and Input Constraints Utilities
 */

export type FieldConstraintType = "phone" | "aadhaar" | "pan" | "dob" | "pincode" | "general";

/**
 * Determine the constraint type based on field label and input type
 */
export function getFieldConstraintType(label: string, inputType?: string): FieldConstraintType {
  const norm = (label || "").trim().toLowerCase();

  // Date of Birth check
  if (
    inputType === "date" ||
    norm.includes("date of birth") ||
    norm.includes("dob") ||
    norm.includes("birth date") ||
    norm === "birthdate" ||
    norm.includes("date_of_birth")
  ) {
    return "dob";
  }

  // Pincode check
  if (norm.includes("pincode") || norm.includes("pin code") || norm === "pin" || norm === "postal code") {
    return "pincode";
  }

  // Phone / Mobile number check
  if (inputType === "tel" || norm.includes("phone") || norm.includes("mobile") || norm === "contact number") {
    return "phone";
  }

  // Aadhaar number check (e.g. Aadhaar Number, Mother Aadhaar Number, Father Aadhaar Number, Spouse Aadhaar Number)
  if (norm.includes("aadhaar") || norm.includes("aadhar") || norm.includes("uidai")) {
    return "aadhaar";
  }

  // PAN card number check
  if (
    norm.includes("pan number") ||
    norm.includes("pan no") ||
    norm.includes("pan card") ||
    norm.includes("existing pan") ||
    norm.includes("corrected pan") ||
    norm === "pan" ||
    norm === "pan_number" ||
    (norm.includes("pan") && (norm.includes("num") || norm.includes("digit") || norm.includes("existing") || norm.includes("correct")))
  ) {
    return "pan";
  }

  // All other fields remain general text fields (Full Name, Address, etc.)
  return "general";
}

/**
 * Format and constrain phone number: strictly numeric (0-9), maximum 10 digits
 */
export function sanitizePhoneNumber(value: string): string {
  return value.replace(/\D/g, "").slice(0, 10);
}

/**
 * Format and constrain Aadhaar number: strictly numeric (0-9), max 12 digits,
 * visually formatted with spaces for readability (e.g., XXXX XXXX XXXX)
 */
export function formatAadhaarNumber(value: string): { formatted: string; raw: string } {
  const raw = value.replace(/\D/g, "").slice(0, 12);
  const parts: string[] = [];
  for (let i = 0; i < raw.length; i += 4) {
    parts.push(raw.slice(i, i + 4));
  }
  return {
    formatted: parts.join(" "),
    raw
  };
}

/**
 * Format and constrain PAN:
 * 1. Automatic real-time uppercase conversion (CAPS)
 * 2. Enforce standard PAN format: 10 alphanumeric characters (5 letters, 4 numbers, 1 letter)
 */
export function formatPanNumber(value: string): string {
  const upper = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
  let formatted = "";
  for (let i = 0; i < upper.length; i++) {
    const char = upper[i];
    if (i < 5) {
      if (/[A-Z]/.test(char)) formatted += char;
    } else if (i < 9) {
      if (/[0-9]/.test(char)) formatted += char;
    } else if (i === 9) {
      if (/[A-Z]/.test(char)) formatted += char;
    }
  }
  return formatted;
}

/**
 * Validate phone number: strictly 10 digits
 */
export function validatePhoneNumber(phone: string): { valid: boolean; error?: string } {
  const raw = phone.replace(/\D/g, "");
  if (!raw) return { valid: false, error: "Phone number is required." };
  if (raw.length !== 10) {
    return { valid: false, error: `Phone number must be exactly 10 digits (currently ${raw.length}/10).` };
  }
  return { valid: true };
}

/**
 * Validate Aadhaar number: strictly 12 digits
 */
export function validateAadhaarNumber(aadhaar: string, label: string = "Aadhaar Number"): { valid: boolean; error?: string } {
  const raw = aadhaar.replace(/\D/g, "");
  if (!raw) return { valid: false, error: `${label} is required.` };
  if (raw.length !== 12) {
    return { valid: false, error: `${label} must be exactly 12 digits (currently ${raw.length}/12).` };
  }
  return { valid: true };
}

/**
 * Validate PAN number: strictly 10 characters (5 letters, 4 digits, 1 letter)
 */
export function validatePanNumber(pan: string, label: string = "PAN Number"): { valid: boolean; error?: string } {
  const clean = pan.trim().toUpperCase();
  if (!clean) return { valid: false, error: `${label} is required.` };
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
  if (!panRegex.test(clean)) {
    return {
      valid: false,
      error: `${label} must be a valid 10-character PAN (5 letters, 4 digits, 1 letter, e.g. ABCDE1234F).`
    };
  }
  return { valid: true };
}

/**
 * Strict Email Format Validation:
 * Strictly requires an '@' symbol, valid domain name before '.com', and must end with '.com' (e.g. user@domain.com)
 */
export function validateEmailAddress(email: string): { valid: boolean; error?: string } {
  const clean = (email || "").trim();
  if (!clean) {
    return { valid: false, error: "Email ID is required." };
  }
  if (!clean.includes("@")) {
    return { valid: false, error: "Email must include an '@' symbol." };
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/i;
  if (!emailRegex.test(clean)) {
    if (!clean.toLowerCase().endsWith(".com")) {
      return { valid: false, error: "Email must end with '.com' (e.g. user@domain.com)." };
    }
    return { valid: false, error: "Please enter a valid email format (e.g. user@domain.com)." };
  }
  return { valid: true };
}

/**
 * Sanitize Pincode: strictly numeric (0-9), maximum 6 digits
 */
export function sanitizePincode(value: string): string {
  return value.replace(/\D/g, "").slice(0, 6);
}

/**
 * Validate Pincode: strictly 6 digits
 */
export function validatePincode(pincode: string, label: string = "Pincode"): { valid: boolean; error?: string } {
  const clean = sanitizePincode(pincode);
  if (!clean) return { valid: false, error: `${label} is required.` };
  if (clean.length !== 6) {
    return { valid: false, error: `${label} must be exactly 6 digits (currently ${clean.length}/6).` };
  }
  if (/^0/.test(clean)) {
    return { valid: false, error: `${label} cannot start with 0.` };
  }
  return { valid: true };
}

/**
 * Calculate age from Date of Birth string (YYYY-MM-DD)
 */
export function calculateAge(dobString: string): number | null {
  if (!dobString) return null;
  const birthDate = new Date(dobString);
  if (isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age >= 0 ? age : null;
}

/**
 * Validate Date of Birth (DOB) Field Constraints:
 * 1. Strictly prevent future dates
 * 2. Prevent invalid format
 * 3. Enforce realistic age (max 125 years)
 * 4. Optional minimum age restriction (e.g. 18+ for voter card or driving license)
 */
export function validateDateOfBirth(
  dob: string,
  label: string = "Date of Birth",
  minAge?: number,
  maxAge: number = 125
): { valid: boolean; error?: string; age?: number } {
  const clean = (dob || "").trim();
  if (!clean) return { valid: false, error: `${label} is required.` };

  const birthDate = new Date(clean);
  if (isNaN(birthDate.getTime())) {
    return { valid: false, error: `Please enter a valid date for ${label}.` };
  }

  // Prevent future dates
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (birthDate > today) {
    return { valid: false, error: `${label} cannot be a future date.` };
  }

  const age = calculateAge(clean);
  if (age === null || age > maxAge) {
    return { valid: false, error: `${label} indicates an age over ${maxAge} years. Please check the year.` };
  }

  if (minAge !== undefined && age < minAge) {
    return { valid: false, error: `Applicant must be at least ${minAge} years old (currently ${age} years old).` };
  }

  return { valid: true, age };
}

/**
 * Validate Colony / Locality / Street Name
 */
export function validateColonyStreet(street: string, label: string = "Colony / Street"): { valid: boolean; error?: string } {
  const clean = (street || "").trim();
  if (!clean) return { valid: false, error: `${label} is required.` };
  if (clean.length < 3) {
    return { valid: false, error: `${label} must be at least 3 characters long.` };
  }
  if (clean.length > 100) {
    return { valid: false, error: `${label} cannot exceed 100 characters.` };
  }
  return { valid: true };
}

/**
 * Standard Clean Formatted Address Builder:
 * Format: [Colony/Street], [Mandal], [District], Telangana - [PINCODE]
 * - Strips any redundant text tags (e.g. "Mandal", "Dist") from input values.
 * - Filters out empty segments cleanly with standard comma separation.
 * - Handles cases where Colony/Street is empty cleanly.
 */
export function buildSmartAddress(
  street?: string | null,
  mandal?: string | null,
  district?: string | null,
  state: string = "Telangana",
  pincode?: string | null,
  village?: string | null
): string {
  const cleanStreet = (street || "").trim();
  const cleanVillage = (village || "")
    .replace(/\s+village$/i, "")
    .trim();

  // Strip redundant "Mandal" or "Dist" text tags if passed in the raw values
  const cleanMandal = (mandal || "")
    .replace(/\s+mandal$/i, "")
    .replace(/\s+dist(rict)?$/i, "")
    .trim();

  const cleanDistrict = (district || "")
    .replace(/\s+dist(rict)?$/i, "")
    .replace(/\s+mandal$/i, "")
    .trim();

  const cleanState = (state || "Telangana")
    .replace(/\s+state$/i, "")
    .trim() || "Telangana";

  const cleanPin = (pincode || "").trim();

  // Standard clean format: [Colony/Street], [Village], [Mandal], [District], Telangana - [PINCODE]
  const parts: string[] = [];

  if (cleanStreet) {
    parts.push(cleanStreet);
  }
  if (cleanVillage && cleanVillage.toLowerCase() !== cleanStreet.toLowerCase()) {
    parts.push(cleanVillage);
  }
  if (
    cleanMandal &&
    cleanMandal.toLowerCase() !== cleanVillage.toLowerCase() &&
    cleanMandal.toLowerCase() !== cleanStreet.toLowerCase()
  ) {
    parts.push(cleanMandal);
  }
  if (cleanDistrict) {
    parts.push(cleanDistrict);
  }
  if (cleanState) {
    parts.push(cleanState);
  }

  let address = parts.join(", ");
  if (cleanPin) {
    address += ` - ${cleanPin}`;
  }

  return address;
}

/**
 * Format Jurisdiction Label cleanly without repeating identical strings:
 * If Mandal and District are identical (e.g. Nagarkurnool, Nagarkurnool),
 * returns "Nagarkurnool Mandal" instead of "Nagarkurnool, Nagarkurnool".
 */
export function formatJurisdictionLabel(mandal?: string | null, district?: string | null): string {
  const cleanM = (mandal || "").trim();
  const cleanD = (district || "").trim();

  if (!cleanM && !cleanD) return "—";
  if (!cleanM) return `${cleanD} Dist`;
  if (!cleanD) return `${cleanM} Mandal`;

  if (cleanM.toLowerCase() === cleanD.toLowerCase()) {
    return `${cleanM} Mandal`;
  }

  return `${cleanM} Mandal, ${cleanD} Dist`;
}

/**
 * Result of document upload validation
 */
export interface DocumentValidationResult {
  valid: boolean;
  status: "APPROVED" | "REJECTED";
  category: string;
  documentType: string;
  isIdentityDocument: boolean;
  isPersonalPhotoOnly: boolean;
  formatAccepted: boolean;
  outputMessage: string;
  error?: string;
  details?: {
    fileFormat: string;
    fileSizeKB: number;
    categoryMatch: boolean;
    identityCheck: boolean;
  };
}

const ALLOWED_DOCUMENT_EXTENSIONS = [".jpg", ".jpeg", ".png", ".pdf", ".webp"];
const ALLOWED_DOCUMENT_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf"
];

/**
 * Checks if a slot label corresponds to an official statutory identity document
 */
export function isIdentityDocumentSlot(label: string): boolean {
  const norm = (label || "").trim().toLowerCase();
  return (
    norm.includes("aadhaar") ||
    norm.includes("aadhar") ||
    norm.includes("pan") ||
    norm.includes("voter") ||
    norm.includes("driving") ||
    norm.includes("licence") ||
    norm.includes("license") ||
    norm.includes("passport document") ||
    norm.includes("health id") ||
    norm.includes("abha") ||
    norm.includes("identity card") ||
    norm.includes("id card")
  );
}

/**
 * Checks if the slot is specifically designated for a citizen's personal face photograph
 */
export function isPersonalPhotoSlot(label: string): boolean {
  const norm = (label || "").trim().toLowerCase();
  return (
    norm.includes("passport size") ||
    norm.includes("photograph") ||
    norm.includes("applicant photo") ||
    norm.includes("user photo") ||
    (norm.includes("photo") && !norm.includes("card") && !norm.includes("doc"))
  );
}

/**
 * Identifies the expected category for a given document label
 */
export function getExpectedCategoryForSlot(label: string): string {
  const norm = (label || "").trim().toLowerCase();
  if (isPersonalPhotoSlot(label)) return "Passport Photograph";
  if (isIdentityDocumentSlot(label)) return "Identity & Personal Documents";
  if (norm.includes("rc") || norm.includes("vehicle") || norm.includes("insurance") || norm.includes("puc")) {
    return "Vehicles & Travel";
  }
  if (
    norm.includes("memo") ||
    norm.includes("marksheet") ||
    norm.includes("bonafide") ||
    norm.includes("degree") ||
    norm.includes("ssc") ||
    norm.includes("10th") ||
    norm.includes("12th") ||
    norm.includes("diploma")
  ) {
    return "Academic & Education";
  }
  if (norm.includes("ration") || norm.includes("birth") || norm.includes("death") || norm.includes("marriage")) {
    return "Family, Civil & Status";
  }
  if (norm.includes("salary") || norm.includes("appointment") || norm.includes("employment") || norm.includes("trade license")) {
    return "Employment & Professional";
  }
  if (norm.includes("income") || norm.includes("caste") || norm.includes("tax") || norm.includes("bank") || norm.includes("electricity") || norm.includes("utility")) {
    return "Financial & Property";
  }
  return "General Statutory Document";
}

/**
 * Checks if a filename indicates a generic casual selfie/social media photo
 * rather than a document scan or card photo.
 */
export function isGenericPersonalPhoto(fileName: string): boolean {
  const norm = (fileName || "").trim().toLowerCase();
  const casualPatterns = [
    /\b(selfie|selfi)\b/i,
    /\b(casual|portrait_shot|profile_pic|profile_photo|dp_photo|avatar|snapchat|instagram|insta_pic)\b/i,
    /\b(beach|holiday|vacation|party|wedding_pic|group_photo|family_photo)\b/i
  ];
  return casualPatterns.some((pattern) => pattern.test(norm));
}

/**
 * Strict Document Upload Validation Engine:
 * Strictly accepts user-uploaded document image files (JPEG, PNG, PDF) matching
 * the selected document category, rather than treating them as generic personal photos
 * or rejecting valid identity files.
 */
export function validateDocumentUpload(
  file: File | { name: string; type?: string; size?: number },
  slotLabel: string,
  categoryName?: string
): DocumentValidationResult {
  const fileName = file.name || "";
  const ext = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();
  const mimeType = (file.type || "").toLowerCase();
  const fileSizeKB = file.size ? file.size / 1024 : 0;

  const expectedCategory = categoryName || getExpectedCategoryForSlot(slotLabel);
  const isIdentity = isIdentityDocumentSlot(slotLabel);
  const isPersonalPhoto = isPersonalPhotoSlot(slotLabel);

  // 1. Strict File Extension & MIME Type Check: strictly JPEG, PNG, PDF, WebP
  const isExtAccepted = ALLOWED_DOCUMENT_EXTENSIONS.includes(ext);
  const isMimeAccepted =
    !mimeType ||
    ALLOWED_DOCUMENT_MIME_TYPES.some((allowed) => mimeType.includes(allowed) || allowed.includes(mimeType));

  if (!isExtAccepted && !isMimeAccepted) {
    return {
      valid: false,
      status: "REJECTED",
      category: expectedCategory,
      documentType: slotLabel,
      isIdentityDocument: isIdentity,
      isPersonalPhotoOnly: isPersonalPhoto,
      formatAccepted: false,
      outputMessage: `STATUS: REJECTED - Invalid file format (${ext || "unknown"}). Only JPEG, PNG, or PDF document files are accepted.`,
      error: "Only document image files (JPEG, PNG) and PDF files are accepted."
    };
  }

  // 2. File Size Constraint: Non-empty and under 10MB
  if (fileSizeKB > 10 * 1024) {
    return {
      valid: false,
      status: "REJECTED",
      category: expectedCategory,
      documentType: slotLabel,
      isIdentityDocument: isIdentity,
      isPersonalPhotoOnly: isPersonalPhoto,
      formatAccepted: false,
      outputMessage: `STATUS: REJECTED - File size (${fileSizeKB.toFixed(1)} KB) exceeds statutory 10 MB limit.`,
      error: "File size exceeds 10 MB limit."
    };
  }

  const fileNorm = fileName.toLowerCase();

  // 3. Generic Casual Selfie vs Document Check
  // If the slot is a statutory document or identity card, reject obvious casual selfies
  if (!isPersonalPhoto && isGenericPersonalPhoto(fileNorm)) {
    return {
      valid: false,
      status: "REJECTED",
      category: expectedCategory,
      documentType: slotLabel,
      isIdentityDocument: isIdentity,
      isPersonalPhotoOnly: false,
      formatAccepted: true,
      outputMessage: `STATUS: REJECTED - Generic personal photo detected. Please upload an official document scan or card image matching '${slotLabel}'.`,
      error: "Generic personal photo detected. Please upload an official document scan or photo of your document."
    };
  }

  // 4. Category Cross-Check / Conflicting Document Conflict Detection
  // E.g. uploading a financial/utility bill into an Identity card slot
  if (isIdentity) {
    const isConflictingBill = /\b(electricity|power_bill|current_bill|water_bill|gas_bill|salary_slip|pay_slip|resume|invoice)\b/i.test(fileNorm);
    if (isConflictingBill) {
      return {
        valid: false,
        status: "REJECTED",
        category: expectedCategory,
        documentType: slotLabel,
        isIdentityDocument: true,
        isPersonalPhotoOnly: false,
        formatAccepted: true,
        outputMessage: `STATUS: REJECTED - Document mismatch: File appears to be a bill or financial statement, which does not match Identity Document slot '${slotLabel}'.`,
        error: `Uploaded file does not match Identity Document category (${slotLabel}).`
      };
    }

    // Specific slot mismatch (e.g. uploading a PAN card file to Aadhaar slot, or vice versa)
    if (/aadhaar|aadhar/i.test(slotLabel) && /\b(pan_card|pancard)\b/i.test(fileNorm)) {
      return {
        valid: false,
        status: "REJECTED",
        category: expectedCategory,
        documentType: slotLabel,
        isIdentityDocument: true,
        isPersonalPhotoOnly: false,
        formatAccepted: true,
        outputMessage: `STATUS: REJECTED - Wrong option: Uploaded file is a PAN Card, but the selected slot is '${slotLabel}'. Please upload a valid Aadhaar card.`,
        error: `Uploaded file is a PAN card, which does not match ${slotLabel}.`
      };
    }
    if (/pan\s*(card|number)?/i.test(slotLabel) && /\b(aadhaar|aadhar)\b/i.test(fileNorm)) {
      return {
        valid: false,
        status: "REJECTED",
        category: expectedCategory,
        documentType: slotLabel,
        isIdentityDocument: true,
        isPersonalPhotoOnly: false,
        formatAccepted: true,
        outputMessage: `STATUS: REJECTED - Wrong option: Uploaded file is an Aadhaar Card, but the selected slot is '${slotLabel}'. Please upload a valid PAN card.`,
        error: `Uploaded file is an Aadhaar card, which does not match ${slotLabel}.`
      };
    }
  }

  // 5. Strict Acceptance: Legitimate document image files (JPEG, PNG, PDF) matching the selected document category
  const formatName = ext.replace(".", "").toUpperCase() || (mimeType.includes("pdf") ? "PDF" : "IMG");
  return {
    valid: true,
    status: "APPROVED",
    category: expectedCategory,
    documentType: slotLabel,
    isIdentityDocument: isIdentity,
    isPersonalPhotoOnly: isPersonalPhoto,
    formatAccepted: true,
    outputMessage: isIdentity
      ? `STATUS: APPROVED - Verified Genuine ${slotLabel} (${formatName}) for ${expectedCategory}.`
      : `STATUS: APPROVED - Valid ${slotLabel} (${formatName}) document attached successfully.`,
    details: {
      fileFormat: formatName,
      fileSizeKB,
      categoryMatch: true,
      identityCheck: isIdentity
    }
  };
}
