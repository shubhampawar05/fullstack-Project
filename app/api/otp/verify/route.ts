/**
 * Verify OTP API Route - TalentHR
 * Verifies OTP code
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import OTP from "@/models/OTP";
import bcrypt from "bcrypt";
import { z } from "zod";

const verifyOTPSchema = z.object({
  email: z.string().email("Invalid email format"),
  otp: z.string().length(6, "OTP must be 6 digits"),
  purpose: z.enum([
    "company_admin_signup",
    "invitation_signup",
    "login",
    "password_reset",
  ]),
});

/**
 * POST /api/otp/verify
 * Verify OTP code
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validationResult = verifyOTPSchema.safeParse(body);

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

    const { email, otp, purpose } = validationResult.data;

    // Find OTP record
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      purpose: purpose,
      verified: false,
    }).sort({ createdAt: -1 }); // Get most recent

    if (!otpRecord) {
      return NextResponse.json(
        {
          success: false,
          message: "OTP not found or already used",
        },
        { status: 400 }
      );
    }

    // Check if expired
    if (otpRecord.isExpired()) {
      return NextResponse.json(
        {
          success: false,
          message: "OTP has expired. Please request a new one.",
        },
        { status: 400 }
      );
    }

    // Check attempts
    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Maximum verification attempts exceeded. Please request a new OTP.",
        },
        { status: 400 }
      );
    }

    // Verify OTP
    const isValid = await bcrypt.compare(otp, otpRecord.otp);

    if (!isValid) {
      // Increment attempts
      otpRecord.attempts += 1;
      await otpRecord.save();

      return NextResponse.json(
        {
          success: false,
          message: "Invalid OTP code",
          remainingAttempts: otpRecord.maxAttempts - otpRecord.attempts,
        },
        { status: 400 }
      );
    }

    // Mark as verified
    otpRecord.verified = true;
    await otpRecord.save();

    return NextResponse.json(
      {
        success: true,
        message: "OTP verified successfully",
        verified: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verify OTP error:", error);
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

