import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Secret for signing session tokens (fallback to secure constant in development)
const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  "msn_portal_super_secure_session_secret_key_2026_isolated_sessions";

interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  createdAt: number;
  expiresAt: number;
}

/**
 * Sign session data using HMAC SHA-256
 */
function signToken(data: SessionPayload): string {
  const payloadStr = Buffer.from(JSON.stringify(data)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payloadStr)
    .digest("base64url");
  return `${payloadStr}.${signature}`;
}

/**
 * Verify and decode session token
 */
function verifyToken(token: string): SessionPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [payloadStr, signature] = parts;
    const expectedSig = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(payloadStr)
      .digest("base64url");

    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature, "utf-8"),
        Buffer.from(expectedSig, "utf-8")
      )
    ) {
      return null;
    }

    const payload: SessionPayload = JSON.parse(
      Buffer.from(payloadStr, "base64url").toString("utf-8")
    );

    // Check expiration
    if (Date.now() > payload.expiresAt) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * POST /api/auth/session
 * Establishes a secure, HTTP-only session cookie for the authenticated user.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, email, name, role } = body;

    if (!userId || !email) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: userId, email" },
        { status: 400 }
      );
    }

    const now = Date.now();
    const expiresAt = now + 7 * 24 * 60 * 60 * 1000; // 7 days

    const payload: SessionPayload = {
      userId: String(userId),
      email: String(email).toLowerCase().trim(),
      name: String(name || email.split("@")[0]),
      role: String(role || "customer"),
      createdAt: now,
      expiresAt,
    };

    const token = signToken(payload);

    const response = NextResponse.json({
      success: true,
      message: "Secure session initialized",
      session: {
        userId: payload.userId,
        email: payload.email,
        name: payload.name,
        role: payload.role,
        expiresAt: payload.expiresAt,
      },
    });

    // Set secure HTTP-only cookies strictly scoped to this user
    response.cookies.set("msn_session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    });

    response.cookies.set("msn_user_id", payload.userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("[Session Auth Error]", error);
    return NextResponse.json(
      { success: false, error: "Failed to establish secure session" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/session
 * Reads and verifies the HTTP-only session cookie.
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("msn_session_token")?.value;

    if (!token) {
      return NextResponse.json(
        { authenticated: false, session: null },
        { status: 200 }
      );
    }

    const session = verifyToken(token);
    if (!session) {
      // Invalid or expired token: clear cookie
      const res = NextResponse.json(
        { authenticated: false, session: null },
        { status: 200 }
      );
      res.cookies.delete("msn_session_token");
      res.cookies.delete("msn_user_id");
      return res;
    }

    return NextResponse.json({
      authenticated: true,
      session: {
        userId: session.userId,
        email: session.email,
        name: session.name,
        role: session.role,
        expiresAt: session.expiresAt,
      },
    });
  } catch (error) {
    console.error("[Session Verify Error]", error);
    return NextResponse.json(
      { authenticated: false, session: null },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/session
 * Completely destroys the HTTP-only session cookie on logout.
 */
export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: "Session terminated and cookies cleared",
  });

  response.cookies.delete("msn_session_token");
  response.cookies.delete("msn_user_id");

  return response;
}
