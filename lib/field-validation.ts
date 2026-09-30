/**
 * Field Classification and Input Constraints Utilities
 */

export type FieldConstraintType = "phone" | "aadhaar" | "pan" | "general";

/**
 * Determine the constraint type based on field label and input type
 */
export function getFieldConstraintType(label: string, inputType?: string): FieldConstraintType {
  const norm = (label || "").trim().toLowerCase();

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
