import fs from "fs";
import path from "path";
import crypto from "crypto";

// Persistent disk directories
const PUBLIC_FACES_DIR = path.join(process.cwd(), "public", "uploads", "faces");
const STORAGE_FACES_DIR = path.join(process.cwd(), "storage", "faces");

/**
 * Ensures storage directories exist on disk.
 */
function ensureDirectories() {
  try {
    if (!fs.existsSync(PUBLIC_FACES_DIR)) {
      fs.mkdirSync(PUBLIC_FACES_DIR, { recursive: true });
    }
    if (!fs.existsSync(STORAGE_FACES_DIR)) {
      fs.mkdirSync(STORAGE_FACES_DIR, { recursive: true });
    }
  } catch (err) {
    console.error("[ImageStorage] Error creating face storage directories:", err);
  }
}

/**
 * Saves a base64 image (or preserves an existing URL) directly to server storage.
 * Stores a copy in:
 * 1. public/uploads/faces/ (instantly served by Next.js static asset handler)
 * 2. storage/faces/ (persistent backend backup vault)
 * 
 * Returns the public URL path: /uploads/faces/<filename>
 */
export function saveFaceImageToStorage(
  base64OrUrl: string | undefined | null,
  identifier: string,
  type: "master" | "snapshot" = "snapshot"
): string | undefined {
  if (!base64OrUrl || typeof base64OrUrl !== "string") {
    return undefined;
  }

  const trimmed = base64OrUrl.trim();
  if (!trimmed) return undefined;

  // If already a static / public / external URL, return it directly
  if (trimmed.startsWith("/") || trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // Handle base64 data URL (e.g., data:image/png;base64,... or data:image/jpeg;base64,...)
  const match = trimmed.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
  if (!match) {
    // If not a data URL but looks like raw base64 string
    if (trimmed.length > 100 && /^[A-Za-z0-9+/=]+$/.test(trimmed.slice(0, 50))) {
      try {
        ensureDirectories();
        const buffer = Buffer.from(trimmed, "base64");
        const cleanId = identifier.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 24);
        const rand = crypto.randomBytes(4).toString("hex");
        const filename = `${type}_${cleanId}_${Date.now()}_${rand}.png`;

        const publicPath = path.join(PUBLIC_FACES_DIR, filename);
        const storagePath = path.join(STORAGE_FACES_DIR, filename);

        fs.writeFileSync(publicPath, buffer);
        fs.writeFileSync(storagePath, buffer);

        return `/uploads/faces/${filename}`;
      } catch (err) {
        console.error("[ImageStorage] Error saving raw base64 image:", err);
      }
    }
    return trimmed;
  }

  try {
    ensureDirectories();
    const rawExt = match[1].toLowerCase();
    const ext = rawExt === "jpeg" ? "jpg" : rawExt.includes("png") ? "png" : "jpg";
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, "base64");

    const cleanId = identifier.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 24);
    const rand = crypto.randomBytes(4).toString("hex");
    const filename = `${type}_${cleanId}_${Date.now()}_${rand}.${ext}`;

    const publicPath = path.join(PUBLIC_FACES_DIR, filename);
    const storagePath = path.join(STORAGE_FACES_DIR, filename);

    fs.writeFileSync(publicPath, buffer);
    fs.writeFileSync(storagePath, buffer);

    return `/uploads/faces/${filename}`;
  } catch (err) {
    console.error("[ImageStorage] Error saving face image to disk:", err);
    // Fallback: return the original data URL so display is never broken
    return trimmed;
  }
}

/**
 * Returns a real photographic portrait image URL instead of dummy illustration vectors.
 */
export function generateFaceAvatarSvg(
  name: string,
  gender: string = "Male",
  colorScheme: string = "blue"
): string {
  const isFemale = gender.toLowerCase() === "female";
  return isFemale
    ? "/uploads/faces/master_kaveri_mallepakula.jpg"
    : "/uploads/faces/master_rohith_kumar.jpg";
}

