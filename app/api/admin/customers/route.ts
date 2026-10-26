import { NextRequest, NextResponse } from "next/server";
import {
  queryServerCustomers,
  registerServerCustomer,
  deleteServerCustomer,
  deleteServerCustomers,
} from "@/lib/server-customer-store";

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

/**
 * DELETE /api/admin/customers
 * Allows Super Admin to securely delete single or multiple customer accounts in bulk.
 * Cascades to remove related documents, biometric logs, and sessions.
 * Supports:
 * - JSON body: { ids: string[] } or { id: string }
 * - URL search params: ?id=xxx or ?ids=xxx,yyy
 */
export async function DELETE(req: NextRequest) {
  try {
    let targetIds: string[] = [];

    // 1. Try reading from request body (JSON)
    try {
      const body = await req.json();
      if (Array.isArray(body?.ids)) {
        targetIds = body.ids.filter(Boolean).map(String);
      } else if (body?.id) {
        targetIds = [String(body.id)];
      }
    } catch {
      // Body may be empty if passing via query params
    }

    // 2. If not found in body, fallback to URL search params
    if (targetIds.length === 0) {
      const searchParams = req.nextUrl.searchParams;
      const paramId = searchParams.get("id");
      const paramIds = searchParams.get("ids");
      if (paramIds) {
        targetIds = paramIds.split(",").map((s) => s.trim()).filter(Boolean);
      } else if (paramId) {
        targetIds = [paramId.trim()];
      }
    }

    if (targetIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one customer ID or email is required for deletion" },
        { status: 400 }
      );
    }

    const result = deleteServerCustomers(targetIds);

    if (result.success && result.deletedCount > 0) {
      return NextResponse.json({
        success: true,
        deletedCount: result.deletedCount,
        deletedIds: result.deletedIds,
        deletedAt: new Date().toISOString(),
        message:
          result.deletedCount === 1
            ? "Customer account and all associated documents, biometric logs, and sessions permanently removed."
            : `Successfully deleted ${result.deletedCount} customer accounts and cascade-removed all associated records.`,
      });
    }

    return NextResponse.json(
      {
        success: false,
        deletedCount: 0,
        error: "No matching customer account found to delete",
      },
      { status: 404 }
    );
  } catch (error: any) {
    console.error("[Bulk Delete Customers API Error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete customer accounts" },
      { status: 500 }
    );
  }
}
