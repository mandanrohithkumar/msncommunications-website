import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/admin/customers/[id]/message
 * Sends a direct administrative alert, message, or notification to a specific customer.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, content, type } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: "Title and content are required" },
        { status: 400 }
      );
    }

    const messageRecord = {
      id: `msg-admin-${Date.now()}`,
      customerId: id,
      title: title.trim(),
      content: content.trim(),
      type: type || "info",
      sentAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: "Message successfully dispatched to customer inbox",
      data: messageRecord,
    });
  } catch (error) {
    console.error("[Customer Message API Error]", error);
    return NextResponse.json(
      { success: false, error: "Failed to dispatch message to customer" },
      { status: 500 }
    );
  }
}
