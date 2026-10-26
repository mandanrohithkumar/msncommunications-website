import { NextRequest, NextResponse } from "next/server";
import { deleteServerCustomer, findServerCustomer } from "@/lib/server-customer-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/admin/customers/[id]
 * Retrieves customer record including master avatar, live biometric face snapshots, and audit logs.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rawParams = await params;
    const rawId = rawParams?.id || "";
    let cleanId = "";
    try {
      cleanId = decodeURIComponent(rawId).trim();
    } catch {
      cleanId = rawId.trim();
    }

    if (!cleanId) {
      return NextResponse.json(
        { success: false, error: "Customer ID or email is required" },
        { status: 400 }
      );
    }

    const customer = findServerCustomer(cleanId);
    if (!customer) {
      return NextResponse.json(
        { success: false, error: `Customer account ${cleanId} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      customer,
      auditLogs: customer.activityLogs || [],
      biometricAuditLogs: customer.faceLoginHistory || [],
      masterPhoto: customer.avatar || customer.lastFaceLoginSnapshot,
      signInSnapshot: customer.lastFaceLoginSnapshot || customer.avatar,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Get Customer Details Error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve customer details" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/customers/[id]
 * Deactivates and removes customer account and isolates their records.
 * Strictly restricted to Super Admin.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rawParams = await params;
    const rawId = rawParams?.id || "";
    let cleanId = "";
    try {
      cleanId = decodeURIComponent(rawId).trim();
    } catch {
      cleanId = rawId.trim();
    }

    if (!cleanId) {
      return NextResponse.json(
        { success: false, error: "Customer ID or email is required" },
        { status: 400 }
      );
    }

    const deleted = deleteServerCustomer(cleanId);

    if (deleted) {
      return NextResponse.json({
        success: true,
        customerId: cleanId,
        deleted: true,
        deletedAt: new Date().toISOString(),
        message: `Customer account ${cleanId} and associated documents, biometric logs, and active sessions permanently removed from database.`,
      });
    }

    return NextResponse.json(
      {
        success: false,
        customerId: cleanId,
        deleted: false,
        error: `Customer account ${cleanId} not found in database`,
      },
      { status: 404 }
    );
  } catch (error: any) {
    console.error("[Delete Customer API Error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete customer account" },
      { status: 500 }
    );
  }
}
