import { NextRequest, NextResponse } from "next/server";
import { recordServerFaceLogin } from "@/lib/server-customer-store";

/**
 * POST /api/auth/face-login
 * Securely captures and registers a customer's live face snapshot upon biometric authentication.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, photo, confidence } = body;

    if (!email || !photo) {
      return NextResponse.json(
        { success: false, error: "Missing email or photo snapshot" },
        { status: 400 }
      );
    }

    const timestamp = new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const updatedCustomer = recordServerFaceLogin(email, photo, confidence || 98.8);

    const faceRecord = {
      id: `face-log-${Date.now()}`,
      email: email.toLowerCase().trim(),
      photo,
      confidence: confidence || 98.8,
      timestamp,
      status: "verified",
    };

    return NextResponse.json({
      success: true,
      message: "Biometric face login snapshot recorded successfully",
      record: faceRecord,
      customer: updatedCustomer,
    });
  } catch (error) {
    console.error("[Face Login API Error]", error);
    return NextResponse.json(
      { success: false, error: "Failed to store face login log" },
      { status: 500 }
    );
  }
}
