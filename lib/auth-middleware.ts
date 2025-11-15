/**
 * Authentication Middleware
 * Provides utilities for handling authentication in API routes
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenPair,
} from "@/lib/jwt";
import { authConfig } from "@/lib/config";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { TokenPayload } from "@/lib/jwt";

export interface AuthenticatedRequest {
  userId: string;
  email: string;
  user: Awaited<ReturnType<typeof User.findById>>;
}

/**
 * Authenticate request using access token
 * Automatically refreshes if access token is expired
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<
  | { success: true; data: AuthenticatedRequest }
  | { success: false; response: NextResponse }
> {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return {
        success: false,
        response: NextResponse.json(
          { success: false, message: "Not authenticated" },
          { status: 401 }
        ),
      };
    }

    // Try to verify access token
    let payload: TokenPayload;
    try {
      payload = verifyAccessToken(accessToken);
    } catch (error) {
      // Access token expired - try to refresh
      return await refreshAndRetry(cookieStore);
    }

    // Get user from database
    const user = await User.findById(payload.userId);
    if (!user) {
      cookieStore.delete("accessToken");
      cookieStore.delete("refreshToken");
      return {
        success: false,
        response: NextResponse.json(
          { success: false, message: "User not found" },
          { status: 404 }
        ),
      };
    }

    return {
      success: true,
      data: {
        userId: String(user._id),
        email: user.email,
        user,
      },
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          message:
            error instanceof Error ? error.message : "Authentication failed",
        },
        { status: 500 }
      ),
    };
  }
}

/**
 * Refresh tokens and retry authentication
 */
async function refreshAndRetry(
  cookieStore: Awaited<ReturnType<typeof cookies>>
): Promise<
  | { success: true; data: AuthenticatedRequest }
  | { success: false; response: NextResponse }
> {
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) {
    cookieStore.delete("accessToken");
    return {
      success: false,
      response: NextResponse.json(
        { success: false, message: "Session expired. Please login again." },
        { status: 401 }
      ),
    };
  }

  try {
    // Verify refresh token
    const refreshPayload = verifyRefreshToken(refreshToken);

    // Get user
    const user = await User.findById(refreshPayload.userId);
    if (!user) {
      cookieStore.delete("refreshToken");
      cookieStore.delete("accessToken");
      return {
        success: false,
        response: NextResponse.json(
          { success: false, message: "User not found" },
          { status: 404 }
        ),
      };
    }

    // Generate new tokens
    const newTokenPayload: TokenPayload = {
      userId: String(user._id),
      email: user.email,
    };

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      generateTokenPair(newTokenPayload);

    // Set new cookies
    cookieStore.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: authConfig.jwtExpiresIn,
      path: "/",
    });

    cookieStore.set("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: authConfig.jwtRefreshExpiresIn, // 10 minutes
      path: "/",
    });

    return {
      success: true,
      data: {
        userId: String(user._id),
        email: user.email,
        user,
      },
    };
  } catch (error) {
    // Refresh token expired or invalid
    cookieStore.delete("refreshToken");
    cookieStore.delete("accessToken");
    return {
      success: false,
      response: NextResponse.json(
        { success: false, message: "Session expired. Please login again." },
        { status: 401 }
      ),
    };
  }
}
