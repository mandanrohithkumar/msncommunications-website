import { NextRequest, NextResponse } from "next/server";
import { linkDocumentToService, queryUserDocuments } from "@/lib/server-vault-store";

/**
 * POST /api/services/link-document
 * 
 * Binds an existing vault document ID to a specific service submission workflow.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const documentId = body.documentId || body.document_id || "";
    const userId = body.userId || body.user_id || "";
    const serviceId = body.serviceId || body.service_id || "";
    const applicationId = body.applicationId || body.application_id || "";
    const slotName = body.slotName || body.slot_name || "";
    const metadata = body.metadata || {};

    if (!documentId || !userId || !serviceId || !slotName) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameters: documentId, userId, serviceId, slotName"
        },
        { status: 400 }
      );
    }

    const linkedRecord = linkDocumentToService({
      documentId,
      userId,
      serviceId,
      applicationId,
      slotName,
      metadata
    });

    return NextResponse.json({
      success: true,
      message: "Document successfully linked to service submission workflow",
      linkedRecord
    });
  } catch (error) {
    console.error("[API POST /api/services/link-document Error]", error);
    return NextResponse.json(
      { success: false, error: "Failed to link document to service workflow" },
      { status: 500 }
    );
  }
}
