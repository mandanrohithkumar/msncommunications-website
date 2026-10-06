import { NextRequest, NextResponse } from "next/server";
import {
  verifyAadhaarDocument,
  verifyAadhaarSvgContent,
  STATUS_APPROVED,
  STATUS_REJECTED,
} from "@/lib/aadhaar-verifier";

/**
 * POST /api/verify-aadhaar
 *
 * Automated Aadhaar Verification Endpoint
 * Validates:
 * 1. Mandatory Markers ("Aadhaar", "Government of India", or "UIDAI")
 * 2. Layout Verification:
 *    - Left photo
 *    - Right QR code
 *    - Middle 12-digit Aadhaar number
 *    - Identity statement directly below: "నా ఆధార్, నా గుర్తింపు" or "Aadhaar - My Identity"
 * 3. Output Generation:
 *    - Approved: "STATUS: APPROVED - Identified as a genuine Aadhaar card."
 *    - Rejected: "STATUS: REJECTED - Wrong option / Incorrect document uploaded. Please upload a valid Aadhaar card."
 */
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // 1. JSON payload with text, svgContent, or dataUrl
    if (contentType.includes("application/json")) {
      const body = await req.json();
      const content = body.content || body.dataUrl || body.svg || body.text || "";
      const fileName = body.fileName || body.name || "";

      if (!content && !fileName) {
        return NextResponse.json(
          {
            status: "REJECTED",
            output: STATUS_REJECTED,
            message: STATUS_REJECTED,
            error: "No document content or file provided for Aadhaar verification.",
          },
          { status: 400 }
        );
      }

      const result = await verifyAadhaarDocument({
        name: fileName,
        dataUrl: content,
        docName: "Aadhaar Card",
      });

      return NextResponse.json({
        status: result.status,
        output: result.outputMessage,
        message: result.outputMessage,
        isGenuine: result.isGenuine,
        checks: result.checks,
        failureReasons: result.failureReasons,
        extractedNumber: result.extractedNumber,
      });
    }

    // 2. FormData (file upload)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json(
          {
            status: "REJECTED",
            output: STATUS_REJECTED,
            message: STATUS_REJECTED,
            error: "Missing file field in form data.",
          },
          { status: 400 }
        );
      }

      const fileText = await file.text();
      const result = await verifyAadhaarDocument(file);

      return NextResponse.json({
        status: result.status,
        output: result.outputMessage,
        message: result.outputMessage,
        isGenuine: result.isGenuine,
        checks: result.checks,
        failureReasons: result.failureReasons,
        extractedNumber: result.extractedNumber,
      });
    }

    // 3. Raw text or SVG body
    const rawBody = await req.text();
    const result = verifyAadhaarSvgContent(rawBody);

    return NextResponse.json({
      status: result.status,
      output: result.outputMessage,
      message: result.outputMessage,
      isGenuine: result.isGenuine,
      checks: result.checks,
      failureReasons: result.failureReasons,
    });
  } catch (error: unknown) {
    console.error("[Verify Aadhaar API Error]", error);
    return NextResponse.json(
      {
        status: "REJECTED",
        output: STATUS_REJECTED,
        message: STATUS_REJECTED,
        error: error instanceof Error ? error.message : "Verification exception",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/verify-aadhaar
 * Health-check & API specification
 */
export async function GET() {
  return NextResponse.json({
    status: "ACTIVE",
    service: "Aadhaar Document Verification & Layout Validation Engine",
    criteria: [
      "1. Mandatory Markers ('Aadhaar', 'Government of India', or 'UIDAI')",
      "2. Layout: Photo on left side (x < 45%)",
      "3. Layout: QR Code on right side (x > 55%)",
      "4. Layout: 12-digit Aadhaar Number located in the middle",
      "5. Layout: 'నా ఆధార్, నా గుర్తింపు' or 'Aadhaar - My Identity' directly below number"
    ],
    expectedOutputs: {
      approved: STATUS_APPROVED,
      rejected: STATUS_REJECTED
    }
  });
}
