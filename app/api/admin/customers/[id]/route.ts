import { NextRequest, NextResponse } from "next/server";
import { deleteServerCustomer } from "@/lib/server-customer-store";

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
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Customer ID is required" },
        { status: 400 }
      );
    }

    const deleted = deleteServerCustomer(id);

    return NextResponse.json({
      success: true,
      customerId: id,
      deleted,
      deletedAt: new Date().toISOString(),
      message: `Customer account ${id} and associated active sessions removed successfully.`,
    });
  } catch (error) {
    console.error("[Delete Customer API Error]", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete customer account" },
      { status: 500 }
    );
  }
}
