import { NextRequest, NextResponse } from "next/server";
import { registerServerCustomer } from "@/lib/server-customer-store";

/**
 * POST /api/auth/register
 * Customer Self-Registration Endpoint.
 * Saves newly registered customers directly into the production database.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, phone, name, password, gender, avatar, photo, faceSnapshot, image, faceEmbedding, faceVerified } = body || {};
    const masterPhoto = avatar || photo || faceSnapshot || image;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email ID is required for registration" },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const cleanPhone = String(phone || "").trim();

    const newCustomer = registerServerCustomer({
      email: cleanEmail,
      phone: cleanPhone,
      name: name || cleanEmail.split("@")[0],
      password: password || "Password@23",
      gender: gender || "Male",
      avatar: masterPhoto || undefined,
      faceEmbedding: faceEmbedding || undefined,
      faceVerified: Boolean(faceVerified || faceEmbedding || masterPhoto),
      lastFaceLoginSnapshot: masterPhoto || undefined,
      role: "customer",
      status: "active",
    });

    return NextResponse.json({
      success: true,
      message: "Customer account registered successfully in database",
      customer: newCustomer,
    });
  } catch (error: any) {
    console.error("[Customer Registration API Error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to register customer" },
      { status: 500 }
    );
  }
}
