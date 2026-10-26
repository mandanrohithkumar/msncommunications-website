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
 * GET /api/v1/accounts
 * Dynamic API endpoint returning registered customer accounts from the production database.
 * Supports:
 * - Pagination: ?page=1&limit=5
 * - Search: ?search=query
 * - Status: ?status=active
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
      accounts: result.customers,
      customers: result.customers,
      pagination: result.pagination,
      metrics: result.metrics,
      total: result.pagination.totalCustomers,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[v1 Accounts API Error]", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve accounts from database" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/accounts
 * Creates a new customer account in the database.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, username, password, gender, avatar, faceEmbedding } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email ID is required" },
        { status: 400 }
      );
    }

    const customer = registerServerCustomer({
      name: name || email.split("@")[0],
      username: username || email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "_"),
      email: email.toLowerCase().trim(),
      phone: phone || "8125898068",
      password: password || "Password@23",
      gender,
      avatar,
      faceEmbedding,
      faceVerified: Boolean(faceEmbedding),
    });

    return NextResponse.json({
      success: true,
      account: customer,
      customer,
      message: "Customer account created successfully in database",
    });
  } catch (error: any) {
    console.error("[Create Account Error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create account" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/accounts
 * Deletes customer account(s) and cascades to remove documents and sessions.
 */
export async function DELETE(req: NextRequest) {
  try {
    let targetIds: string[] = [];

    try {
      const body = await req.json();
      if (Array.isArray(body?.ids)) {
        targetIds = body.ids.filter(Boolean).map(String);
      } else if (body?.id) {
        targetIds = [String(body.id)];
      }
    } catch {
      // Body may not be JSON
    }

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
        { success: false, error: "At least one customer ID or email is required" },
        { status: 400 }
      );
    }

    const result = deleteServerCustomers(targetIds);

    return NextResponse.json({
      success: result.deletedCount > 0,
      deletedCount: result.deletedCount,
      deletedIds: result.deletedIds,
      message:
        result.deletedCount > 0
          ? `Successfully removed ${result.deletedCount} account(s) and cascade-deleted associated records.`
          : "No accounts found matching the specified ID(s).",
    });
  } catch (error: any) {
    console.error("[Delete Accounts API Error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete accounts" },
      { status: 500 }
    );
  }
}
