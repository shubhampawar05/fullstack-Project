import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";
import { SignupCredentials, AuthResponse } from "@/types/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { generateTokenPair, TokenPayload } from "@/lib/jwt";
import { authConfig } from "@/lib/config";

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    const body: SignupCredentials = await request.json();
    const { email, password, name } = body;

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

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: "Invalid email format",
        },
        { status: 400 }
      );
    }

    // Password validation
    if (password.length < 6) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: "Password must be at least 6 characters",
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: "User with this email already exists",
        },
        { status: 409 }
      );
    }

    // Hash password using bcrypt
    const hashedPassword = await bcrypt.hash(
      password,
      authConfig.bcryptSaltRounds
    );

    // Create new user
    const newUser = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name?.trim(),
    });

    // Generate JWT tokens
    const tokenPayload: TokenPayload = {
      userId: String(newUser._id),
      email: newUser.email,
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
    return NextResponse.json<AuthResponse>(
      {
        success: true,
        message: "Account created successfully",
        user: {
          id: String(newUser._id),
          email: newUser.email,
          name: newUser.name,
          createdAt: newUser.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json<AuthResponse>(
      {
        success: false,
        message: error instanceof Error ? error.message : "Server error",
      },
      { status: 500 }
    );
  }
}
