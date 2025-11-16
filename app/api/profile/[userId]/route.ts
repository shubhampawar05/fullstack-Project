/**
 * Public User Profile API Route
 * GET /api/profile/[userId] - Get public user profile
 */

import { NextRequest, NextResponse } from "next/server";
import UserProfile from "@/models/UserProfile";
import connectDB from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await connectDB();

    const { userId } = await params;
    const profile = await UserProfile.findOne({
      userId,
    })
      .select("-phone") // Don't expose phone number in public profile
      .lean()
      .exec();

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Error fetching public profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

