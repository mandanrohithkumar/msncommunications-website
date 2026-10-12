import { NextRequest, NextResponse } from "next/server";
import { queryUserDocuments, normalizeDocumentTypeCode } from "@/lib/server-vault-store";

/**
 * GET /api/vault/documents?userId={id}&type={document_type}&familyMemberId={memberId}
 * 
 * Fetches the latest uploaded document for a specific category/type,
 * or all matching documents for the user.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || searchParams.get("user_id") || "";
    const rawType = searchParams.get("type") || searchParams.get("document_type") || searchParams.get("document_type_code") || "";
    const familyMemberId = searchParams.get("familyMemberId") || searchParams.get("family_member_id") || "self";

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: userId" },
        { status: 400 }
      );
    }

    let typeCode = rawType;
    let targetMember = familyMemberId;

    if (rawType && rawType !== "all") {
      const normalized = normalizeDocumentTypeCode(rawType, undefined, familyMemberId);
      typeCode = normalized.code;
      if (!familyMemberId || familyMemberId === "self") {
        targetMember = normalized.detectedMemberId;
      }
    }

    const documents = queryUserDocuments({
      userId,
      typeCode: typeCode || undefined,
      familyMemberId: targetMember || undefined
    });

    const latestDoc = documents.length > 0 ? documents[0] : null;

    return NextResponse.json({
      success: true,
      count: documents.length,
      document: latestDoc,
      documents
    });
  } catch (error) {
    console.error("[API GET /api/vault/documents Error]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch vault documents" },
      { status: 500 }
    );
  }
}
