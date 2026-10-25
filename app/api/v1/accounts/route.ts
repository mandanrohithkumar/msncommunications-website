import { NextRequest, NextResponse } from "next/server";
import { queryServerCustomers, registerServerCustomer } from "@/lib/server-customer-store";

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
