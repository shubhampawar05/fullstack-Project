/**
 * Send OTP API Route - TalentHR
 * Sends OTP to email for verification
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import OTP from "@/models/OTP";
import bcrypt from "bcrypt";
import { z } from "zod";
import { sendOTPEmail } from "@/lib/email";

const sendOTPSchema = z.object({
  email: z.string().email("Invalid email format"),
  purpose: z.enum([
    "company_admin_signup",
    "invitation_signup",
    "login",
    "password_reset",
  ]),
});

/**
 * POST /api/otp/send
 * Send OTP to email
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validationResult = sendOTPSchema.safeParse(body);

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return NextResponse.json(
        {
          success: false,
          message: firstError?.message || "Validation failed",
        },
        { status: 400 }
      );
    }

    const { email, purpose } = validationResult.data;

    // Generate 6-digit OTP
    const OTPModel = OTP as any;
    const otpCode = OTPModel.generateOTP();
    const hashedOTP = await bcrypt.hash(otpCode, 10);

    // Delete any existing OTPs for this email and purpose
    await OTP.deleteMany({
      email: email.toLowerCase(),
      purpose: purpose,
      verified: false,
    });

    // Create new OTP
    const otp = await OTP.create({
      email: email.toLowerCase(),
      otp: hashedOTP,
      type: purpose === "password_reset" ? "password_reset" : "signup",
      purpose: purpose,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      attempts: 0,
      maxAttempts: 5,
      verified: false,
    });

    // Send OTP email
    try {
      await sendOTPEmail(email.toLowerCase(), otpCode, purpose);
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      // Still return success if email fails (for development)
      // In production, you might want to return an error
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          {
            success: false,
            message: "Failed to send OTP email. Please try again.",
          },
          { status: 500 }
        );
      }
    }

    // In development, also log OTP to console for testing
    if (process.env.NODE_ENV === "development") {
      console.log(`📧 OTP for ${email}: ${otpCode}`);
    }

    return NextResponse.json(
      {
        success: true,
        message: "OTP sent successfully to your email",
        ...(process.env.NODE_ENV === "development" && { otp: otpCode }), // Only in development
        expiresIn: 600, // 10 minutes in seconds
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

