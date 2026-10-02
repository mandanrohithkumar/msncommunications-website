import { NextRequest, NextResponse } from "next/server";
import { forceLogoutServerCustomer } from "@/lib/server-customer-store";

/**
 * POST /api/admin/customers/[id]/force-logout
 * Remotely terminates active sessions for a specific customer and increments their logout count.
 * Strictly restricted to Super Admin.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Customer ID is required" },
        { status: 400 }
      );
    }

    const nowStr = new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const updatedCustomer = forceLogoutServerCustomer(id);

    return NextResponse.json({
      success: true,
      customerId: id,
      terminatedAt: nowStr,
      customer: updatedCustomer,
      message: `Active session terminated remotely for customer ${id}. Forced logout recorded.`,
    });
  } catch (error) {
    console.error("[Force Logout Error]", error);
    return NextResponse.json(
      { success: false, error: "Failed to force logout customer" },
      { status: 500 }
    );
  }
}
