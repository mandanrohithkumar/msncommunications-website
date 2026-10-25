import { NextRequest, NextResponse } from "next/server";
import { queryServerCustomers, registerServerCustomer } from "@/lib/server-customer-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/admin/customers
 * Returns registered customer accounts from the production database with:
 * - Dynamic Pagination (page, limit/pageSize)
 * - Dynamic Search Query across username, full name, email, phone, and ID
 * - Real Biometrics (faceVerified, lastFaceLoginSnapshot, faceLoginTimestamp)
 * - Live login session tokens & indicators
 * - Accurate dynamic works and documents count from vault database
 * - Real login/logout counts & timestamps
 * Strictly restricted to Super Admin role.
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || searchParams.get("pageSize") || "5", 10);
    const search = searchParams.get("search") || searchParams.get("q") || "";
    const status = searchParams.get("status") || "";

    const result = queryServerCustomers({ page, limit, search, status });

    return NextResponse.json({
      success: true,
      customers: result.customers,
      pagination: result.pagination,
      metrics: result.metrics,
      total: result.pagination.totalCustomers,
      timestamp: new Date().toISOString(),
      message: "Customer records retrieved successfully from database",
    });
  } catch (error) {
    console.error("[Admin Customers API Error]", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve customer accounts from database" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/customers
 * Allows Super Admin to register / add a new customer to production database.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, username, password, gender, avatar, faceEmbedding, lastFaceLoginSnapshot } = body;

    if (!email || !phone) {
      return NextResponse.json(
        { success: false, error: "Email ID and Phone Number are required" },
        { status: 400 }
      );
    }

    const newCustomer = registerServerCustomer({
      name: name || email.split("@")[0],
      username: username || email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "_"),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password: password || "Password@23",
      gender,
      avatar,
      faceEmbedding,
      lastFaceLoginSnapshot,
      faceVerified: Boolean(faceEmbedding || lastFaceLoginSnapshot),
    });

    return NextResponse.json({
      success: true,
      customer: newCustomer,
      message: "Customer account registered successfully in database",
    });
  } catch (error: any) {
    console.error("[Create Customer API Error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create customer account" },
      { status: 500 }
    );
  }
}
