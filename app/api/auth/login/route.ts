import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";
import { LoginCredentials, AuthResponse } from "@/types/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { generateTokenPair, TokenPayload } from "@/lib/jwt";
import { authConfig } from "@/lib/config";

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    const body: LoginCredentials = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: "Email and password are required",
        },
        { status: 400 }
      );
    }

    // Find user (include password field for comparison)
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    // Generate JWT tokens
    const tokenPayload: TokenPayload = {
      userId: String(user._id),
      email: user.email,
    };

    const { accessToken, refreshToken } = generateTokenPair(tokenPayload);

    // Set cookies
    const cookieStore = await cookies();
    cookieStore.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: authConfig.jwtExpiresIn, // 2 minutes
      path: "/",
    });

    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: authConfig.jwtRefreshExpiresIn, // 10 minutes
      path: "/",
    });

    // Return success response (don't send tokens in body, they're in cookies)
    return NextResponse.json<AuthResponse>({
      success: true,
      message: "Login successful",
      user: {
        id: String(user._id),
        email: user.email,
        name: user.name,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json<AuthResponse>(
      {
        success: false,
        message: error instanceof Error ? error.message : "Server error",
      },
      { status: 500 }
    );
  }
}
