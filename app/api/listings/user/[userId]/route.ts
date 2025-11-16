/**
 * User Listings API Route
 * GET /api/listings/user/[userId] - Get all listings for a specific user
 */

import { NextRequest, NextResponse } from "next/server";
import Listing from "@/models/Listing";
import connectDB from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await connectDB();

    const { userId } = await params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build query
    const query: any = { userId };
    if (status) query.status = status;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [listings, total] = await Promise.all([
      Listing.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Listing.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      listings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching user listings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user listings" },
      { status: 500 }
    );
  }
}

