import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyRefreshToken, generateTokenPair, TokenPayload } from "@/lib/jwt";
import { authConfig } from "@/lib/config";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 [Refresh Route] Refresh token request received");
    // Connect to database
    await connectDB();

    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) {
      console.log("❌ [Refresh Route] Refresh token not found in cookies");
      return NextResponse.json(
        {
          success: false,
          message: "Refresh token not found",
        },
        { status: 401 }
      );
    }

    console.log("✅ [Refresh Route] Refresh token found, verifying...");
    // Verify refresh token
    let payload: TokenPayload;
    try {
      payload = verifyRefreshToken(refreshToken);
      console.log(
        "✅ [Refresh Route] Refresh token verified for user:",
        payload.userId
      );
    } catch (error) {
      console.error(
        "❌ [Refresh Route] Refresh token invalid or expired:",
        error
      );
      // Clear invalid refresh token
      cookieStore.delete("refreshToken");
      cookieStore.delete("accessToken");
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired refresh token",
        },
        { status: 401 }
      );
    }

    // Verify user still exists
    const user = await User.findById(payload.userId);
    if (!user) {
      cookieStore.delete("refreshToken");
      cookieStore.delete("accessToken");
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 401 }
      );
    }

    // Generate new token pair
    const newTokenPayload: TokenPayload = {
      userId: String(user._id),
      email: user.email,
      role: user.role,
    };

    const { accessToken, refreshToken: newRefreshToken } =
      generateTokenPair(newTokenPayload);

    console.log("✅ [Refresh Route] New token pair generated");

    // Set new cookies
    cookieStore.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: authConfig.jwtExpiresIn, // 1 day
      path: "/",
    });

    cookieStore.set("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: authConfig.jwtRefreshExpiresIn, // 7 days
      path: "/",
    });

    console.log(
      "✅ [Refresh Route] New tokens set in cookies, returning success"
    );
    return NextResponse.json({
      success: true,
      message: "Tokens refreshed successfully",
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Server error",
      },
      { status: 500 }
    );
  }
}
