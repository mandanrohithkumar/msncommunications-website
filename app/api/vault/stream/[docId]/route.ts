import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const VAULT_UPLOADS_DIR = path.join(process.cwd(), "storage", "vault_uploads");

/**
 * GET /api/vault/stream/[docId]
 * Streams safely stored vault documents with appropriate Content-Type.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ docId: string }> }
) {
  try {
    const { docId } = await params;
    // Prevent path traversal
    const safeDocId = path.basename(docId);
    const filePath = path.join(VAULT_UPLOADS_DIR, safeDocId);

    if (!fs.existsSync(filePath)) {
      // Fallback: check if it exists in secure_vault
      const altPath = path.join(process.cwd(), "storage", "secure_vault", safeDocId);
      if (!fs.existsSync(altPath)) {
        return new NextResponse("File not found in vault storage", { status: 404 });
      }
    }

    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(safeDocId).toLowerCase();

    let contentType = "application/octet-stream";
    if (ext === ".pdf") contentType = "application/pdf";
    else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    else if (ext === ".png") contentType = "image/png";
    else if (ext === ".xml") contentType = "application/xml";

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
        "Content-Disposition": `inline; filename="${safeDocId}"`
      }
    });
  } catch (error) {
    console.error("[Vault Stream Error]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
