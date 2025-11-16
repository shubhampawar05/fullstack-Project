/**
 * Single Listing API Routes
 * GET /api/listings/[id] - Get single listing
 * PATCH /api/listings/[id] - Update listing
 * DELETE /api/listings/[id] - Delete listing
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-middleware";
import Listing from "@/models/Listing";
import connectDB from "@/lib/db";

// GET /api/listings/[id] - Get single listing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const listing = await Listing.findById(id).lean().exec();

    if (!listing) {
      return NextResponse.json(
        { success: false, error: "Listing not found" },
        { status: 404 }
      );
    }

    // Increment view count
    await Listing.findByIdAndUpdate(id, {
      $inc: { views: 1 },
    }).exec();

    return NextResponse.json({
      success: true,
      listing: {
        ...listing,
        views: (listing.views || 0) + 1,
      },
    });
  } catch (error) {
    console.error("Error fetching listing:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch listing" },
      { status: 500 }
    );
  }
}

// PATCH /api/listings/[id] - Update listing
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if listing exists and belongs to user
    const existingListing = await Listing.findById(id).exec();
    if (!existingListing) {
      return NextResponse.json(
        { success: false, error: "Listing not found" },
        { status: 404 }
      );
    }

    if (existingListing.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: "Not authorized to update this listing" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updateData: any = {};

    // Only update provided fields
    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.description !== undefined)
      updateData.description = body.description.trim();
    if (body.price !== undefined) updateData.price = parseFloat(body.price);
    if (body.category !== undefined) updateData.category = body.category.trim();
    if (body.images !== undefined) updateData.images = body.images;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.location !== undefined) {
      updateData.location = {
        city: body.location.city?.trim(),
        state: body.location.state?.trim(),
        zipCode: body.location.zipCode?.trim(),
        coordinates: body.location.coordinates,
      };
    }

    const listing = await Listing.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).exec();

    return NextResponse.json({
      success: true,
      listing,
    });
  } catch (error) {
    console.error("Error updating listing:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update listing" },
      { status: 500 }
    );
  }
}

// DELETE /api/listings/[id] - Delete listing
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if listing exists and belongs to user
    const listing = await Listing.findById(id).exec();
    if (!listing) {
      return NextResponse.json(
        { success: false, error: "Listing not found" },
        { status: 404 }
      );
    }

    if (listing.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: "Not authorized to delete this listing" },
        { status: 403 }
      );
    }

    await Listing.findByIdAndDelete(id).exec();

    return NextResponse.json({
      success: true,
      message: "Listing deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting listing:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete listing" },
      { status: 500 }
    );
  }
}

