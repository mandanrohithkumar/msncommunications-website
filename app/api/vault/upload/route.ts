import { NextRequest, NextResponse } from "next/server";
import {
  saveOrUpdateUserDocument,
  normalizeDocumentTypeCode,
  writeVaultFileToDisk
} from "@/lib/server-vault-store";

/**
 * POST /api/vault/upload
 * 
 * Handles document uploads from either the Digital Vault or any Service Form.
 * Saves centrally to user_documents and returns the persistent file_url and record.
 * Implements Scenario B (Service -> Vault) and Scenario C (Updates/Overrides).
 */
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let userId = "";
    let familyMemberId = "self";
    let documentTypeCode = "";
    let docName = "";
    let categoryName = "Identity & Personal Documents";
    let fileUrl = "";
    let storagePath = "";
    let fileName = "";
    let fileSizeBytes = 0;
    let mimeType = "application/octet-stream";
    let extraMeta: Record<string, any> = {};

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      userId = (formData.get("userId") as string) || (formData.get("user_id") as string) || "";
      familyMemberId = (formData.get("familyMemberId") as string) || (formData.get("family_member_id") as string) || "self";
      docName = (formData.get("docName") as string) || (formData.get("label") as string) || "";
      categoryName = (formData.get("categoryName") as string) || categoryName;
      documentTypeCode = (formData.get("documentTypeCode") as string) || (formData.get("document_type_code") as string) || "";

      const rawMetadata = formData.get("metadata") as string;
      if (rawMetadata) {
        try {
          extraMeta = JSON.parse(rawMetadata);
        } catch (e) {}
      }

      if (!file) {
        return NextResponse.json(
          { success: false, error: "No file provided in multipart upload" },
          { status: 400 }
        );
      }

      fileName = file.name;
      fileSizeBytes = file.size;
      mimeType = file.type || "application/octet-stream";

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const diskSaved = writeVaultFileToDisk(file.name, buffer);
      fileUrl = diskSaved.fileUrl;
      storagePath = diskSaved.storagePath;

    } else {
      // JSON body (supports base64 dataUrl, previewUrl, or external link)
      const body = await req.json();
      userId = body.userId || body.user_id || "";
      familyMemberId = body.familyMemberId || body.family_member_id || "self";
      docName = body.docName || body.label || body.name || "";
      categoryName = body.categoryName || categoryName;
      documentTypeCode = body.documentTypeCode || body.document_type_code || "";
      fileUrl = body.fileUrl || body.dataUrl || "";
      fileName = body.fileName || body.name || "document.pdf";
      fileSizeBytes = body.fileSizeBytes || (body.size ? parseInt(body.size, 10) : 0);
      mimeType = body.mimeType || body.type || "application/octet-stream";
      extraMeta = body.metadata || {};

      // If raw base64 dataUrl is sent, save a copy to disk if needed
      if (fileUrl.startsWith("data:") && !storagePath) {
        try {
          const match = fileUrl.match(/^data:([^;]+);base64,(.+)$/);
          if (match) {
            const buffer = Buffer.from(match[2], "base64");
            const diskSaved = writeVaultFileToDisk(fileName, buffer);
            storagePath = diskSaved.storagePath;
          }
        } catch (e) {
          console.warn("[Vault Upload] Could not buffer base64 to disk:", e);
        }
      }
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: userId" },
        { status: 400 }
      );
    }

    if (!fileUrl) {
      return NextResponse.json(
        { success: false, error: "Missing fileUrl or file data" },
        { status: 400 }
      );
    }

    // Canonical normalization of document_type_code and family member
    const normalized = normalizeDocumentTypeCode(
      documentTypeCode || docName,
      categoryName,
      familyMemberId
    );
    const finalTypeCode = documentTypeCode || normalized.code;
    const finalMemberId = familyMemberId || normalized.detectedMemberId;

    const formattedSize = fileSizeBytes > 0
      ? `${(fileSizeBytes / 1024).toFixed(1)} KB`
      : extraMeta.fileSize || "120 KB";

    const savedRecord = saveOrUpdateUserDocument({
      userId,
      familyMemberId: finalMemberId,
      documentTypeCode: finalTypeCode,
      fileUrl,
      storagePath,
      metadata: {
        fileName,
        fileSize: formattedSize,
        fileSizeBytes,
        fileType: mimeType,
        docName: docName || finalTypeCode,
        categoryName,
        verificationStatus: extraMeta.verificationStatus || "APPROVED",
        verificationMessage: extraMeta.verificationMessage || "Verified and secured in Family Digital Vault",
        isGenuine: extraMeta.isGenuine !== undefined ? extraMeta.isGenuine : true,
        source: extraMeta.source || "service_form",
        serviceId: extraMeta.serviceId,
        applicationId: extraMeta.applicationId,
        slotName: extraMeta.slotName || docName,
        ...extraMeta
      }
    });

    return NextResponse.json({
      success: true,
      message: "Document uploaded and synchronized with Digital Vault",
      file_url: savedRecord.file_url,
      storage_path: savedRecord.storage_path,
      document: savedRecord
    });
  } catch (error) {
    console.error("[API POST /api/vault/upload Error]", error);
    return NextResponse.json(
      { success: false, error: "Failed to process vault document upload" },
      { status: 500 }
    );
  }
}
