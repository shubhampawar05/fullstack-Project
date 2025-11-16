/**
 * User Profile API Routes
 * GET /api/profile - Get current user profile
 * PATCH /api/profile - Update current user profile
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-middleware";
import UserProfile from "@/models/UserProfile";
import connectDB from "@/lib/db";

// GET /api/profile - Get current user profile
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    let profile = await UserProfile.findOne({ userId: user.id }).lean().exec();

    // If profile doesn't exist, create a default one
    if (!profile) {
      const newProfile = new UserProfile({
        userId: user.id,
        displayName: user.email?.split("@")[0] || "User",
        location: {
          city: "",
          state: "",
        },
      });

      await newProfile.save();
      profile = await UserProfile.findById(newProfile._id).lean().exec();
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// PATCH /api/profile - Update current user profile
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      displayName,
      bio,
      avatar,
      location,
      phone,
    } = body;

    // Build update object
    const updateData: any = {};

    if (displayName !== undefined) {
      if (!displayName.trim()) {
        return NextResponse.json(
          { success: false, error: "Display name cannot be empty" },
          { status: 400 }
        );
      }
      updateData.displayName = displayName.trim();
    }

    if (bio !== undefined) {
      updateData.bio = bio?.trim() || "";
    }

    if (avatar !== undefined) {
      updateData.avatar = avatar?.trim() || "";
    }

    if (phone !== undefined) {
      updateData.phone = phone?.trim() || "";
    }

    if (location !== undefined) {
      if (!location.city || !location.state) {
        return NextResponse.json(
          { success: false, error: "City and state are required" },
          { status: 400 }
        );
      }
      updateData.location = {
        city: location.city.trim(),
        state: location.state.trim(),
      };
    }

    // Find or create profile
    let profile = await UserProfile.findOne({ userId: user.id }).exec();

    if (!profile) {
      // Create new profile if it doesn't exist
      profile = new UserProfile({
        userId: user.id,
        displayName: displayName || user.email?.split("@")[0] || "User",
        location: location || { city: "", state: "" },
        ...updateData,
      });
      await profile.save();
    } else {
      // Update existing profile
      Object.assign(profile, updateData);
      await profile.save();
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

