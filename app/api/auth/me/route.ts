import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenPair,
  TokenPayload,
} from "@/lib/jwt";
import { authConfig } from "@/lib/config";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Company from "@/models/Company";
import Employee from "@/models/Employee";
import { AuthResponse } from "@/types/auth";

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 }
      );
    }

    // Verify access token
    let payload;
    try {
      payload = verifyAccessToken(accessToken);
    } catch (error) {
      // Access token expired - try to refresh using refresh token
      const refreshToken = cookieStore.get("refreshToken")?.value;

      if (refreshToken) {
        try {
          // Verify refresh token
          const refreshPayload = verifyRefreshToken(refreshToken);

          // Get user
          const user = await User.findById(refreshPayload.userId);
          if (!user) {
            cookieStore.delete("refreshToken");
            cookieStore.delete("accessToken");
            return NextResponse.json<AuthResponse>(
              {
                success: false,
                message: "User not found",
              },
              { status: 401 }
            );
          }

          // Generate new tokens
          const newTokenPayload: TokenPayload = {
            userId: String(user._id),
            email: user.email,
            role: user.role,
          };

          const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
            generateTokenPair(newTokenPayload);

          // Set new cookies
          cookieStore.set("accessToken", newAccessToken, {
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

          // Use the new payload
          payload = newTokenPayload;
        } catch (refreshError) {
          // Refresh token also expired or invalid
          cookieStore.delete("refreshToken");
          cookieStore.delete("accessToken");
          return NextResponse.json<AuthResponse>(
            {
              success: false,
              message: "Session expired. Please login again.",
            },
            { status: 401 }
          );
        }
      } else {
        // No refresh token available
        return NextResponse.json<AuthResponse>(
          {
            success: false,
            message: "Invalid or expired token",
          },
          { status: 401 }
        );
      }
    }

    // Get user from database
    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // Get company info
    const company = await Company.findById(user.companyId);

    // Get employee info if exists
    const employee = await Employee.findOne({ userId: user._id });

    return NextResponse.json<AuthResponse>({
      success: true,
      message: "User authenticated",
      user: {
        id: String(user._id),
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: String(user.companyId),
        employeeId: employee ? String(employee._id) : undefined,
        company: company
          ? {
            id: String(company._id),
            name: company.name,
            slug: company.slug,
          }
          : undefined,
        status: user.status,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return NextResponse.json<AuthResponse>(
      {
        success: false,
        message: error instanceof Error ? error.message : "Server error",
      },
      { status: 500 }
    );
  }
}
