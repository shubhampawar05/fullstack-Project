/**
 * Login API Route - TalentHR
 * Handles user authentication with role-based access
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";
import { z } from "zod";
import { LoginCredentials, AuthResponse } from "@/types/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Company from "@/models/Company";
import { generateTokenPair, TokenPayload } from "@/lib/jwt";
import { authConfig } from "@/lib/config";

// Validation schema
const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
  role: z.enum([
    "company_admin",
    "hr_manager",
    "recruiter",
    "manager",
    "employee",
  ]),
});

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    const body = await request.json();

    // Validate input
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: firstError?.message || "Validation failed",
        },
        { status: 400 }
      );
    }

    const { email, password, role } = validationResult.data;

    // Find user (include password field for comparison)
    const user = await User.findOne({
      email: email.toLowerCase(),
      role: role,
    }).select("+password");

    if (!user) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: "Invalid email, password, or role",
        },
        { status: 401 }
      );
    }

    // Check if user is active
    if (user.status !== "active") {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message:
            user.status === "inactive"
              ? "Account is deactivated. Please contact support."
              : "Account is pending activation.",
        },
        { status: 403 }
      );
    }

    // Check company status
    const company = await Company.findById(user.companyId);
    if (!company) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: "Company not found",
        },
        { status: 404 }
      );
    }

    if (company.status !== "active") {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: "Company account is suspended. Please contact support.",
        },
        { status: 403 }
      );
    }

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: "Invalid email, password, or role",
        },
        { status: 401 }
      );
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT tokens
    const tokenPayload: TokenPayload = {
      userId: String(user._id),
      email: user.email,
      role: user.role,
    };

    const { accessToken, refreshToken } = generateTokenPair(tokenPayload);

    // Set cookies
    const cookieStore = await cookies();
    cookieStore.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: authConfig.jwtExpiresIn,
      path: "/",
    });

    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: authConfig.jwtRefreshExpiresIn,
      path: "/",
    });

    // Return success response
    return NextResponse.json<AuthResponse>({
      success: true,
      message: "Login successful",
      user: {
        id: String(user._id),
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: String(user.companyId),
        company: {
          id: String(company._id),
          name: company.name,
          slug: company.slug,
        },
        status: user.status,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json<AuthResponse>(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
