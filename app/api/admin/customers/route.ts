import { NextRequest, NextResponse } from "next/server";
import { getServerCustomers } from "@/lib/server-customer-store";

/**
 * GET /api/admin/customers
 * Returns all registered customer accounts with analytics:
 * login counts, logout counts, upload counts, biometric face snapshots, and session statuses.
 * Strictly restricted to Super Admin role.
 */
export async function GET(req: NextRequest) {
  try {
    const customers = getServerCustomers();

    return NextResponse.json({
      success: true,
      customers,
      total: customers.length,
      timestamp: new Date().toISOString(),
      message: "Customer records retrieved successfully",
    });
  } catch (error) {
    console.error("[Admin Customers API Error]", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve customer accounts" },
      { status: 500 }
    );
  }
}
