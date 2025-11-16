/**
 * Listings API Routes
 * GET /api/listings - Get all listings with filters
 * POST /api/listings - Create new listing
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-middleware";
import Listing from "@/models/Listing";
import connectDB from "@/lib/db";

// GET /api/listings - Get all listings with filters and pagination
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const city = searchParams.get("city");
    const state = searchParams.get("state");
    const status = searchParams.get("status") || "active";
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "newest";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build query
    const query: any = { status };

    if (type) query.type = type;
    if (category) query.category = category;
    if (city) query["location.city"] = new RegExp(city, "i");
    if (state) query["location.state"] = new RegExp(state, "i");

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Build sort
    let sort: any = {};
    switch (sortBy) {
      case "newest":
        sort = { createdAt: -1 };
        break;
      case "oldest":
        sort = { createdAt: 1 };
        break;
      case "price-low":
        sort = { price: 1 };
        break;
      case "price-high":
        sort = { price: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [listings, total] = await Promise.all([
      Listing.find(query)
        .sort(sort)
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
    console.error("Error fetching listings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}

// POST /api/listings - Create new listing
export async function POST(request: NextRequest) {
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
      type,
      title,
      description,
      price,
      category,
      images,
      location,
      status = "active",
    } = body;

    // Validation
    if (!type || !["item", "service"].includes(type)) {
      return NextResponse.json(
        { success: false, error: "Invalid listing type" },
        { status: 400 }
      );
    }

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Title is required" },
        { status: 400 }
      );
    }

    if (!description || description.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Description is required" },
        { status: 400 }
      );
    }

    if (price === undefined || price < 0) {
      return NextResponse.json(
        { success: false, error: "Valid price is required" },
        { status: 400 }
      );
    }

    if (!category || category.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Category is required" },
        { status: 400 }
      );
    }

    if (!location || !location.city || !location.state || !location.zipCode) {
      return NextResponse.json(
        { success: false, error: "Complete location is required" },
        { status: 400 }
      );
    }

    // Create listing
    const listing = new Listing({
      userId: user.id,
      type,
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price),
      category: category.trim(),
      images: images || [],
      location: {
        city: location.city.trim(),
        state: location.state.trim(),
        zipCode: location.zipCode.trim(),
        coordinates: location.coordinates,
      },
      status,
    });

    await listing.save();

    return NextResponse.json(
      {
        success: true,
        listing,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating listing:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create listing" },
      { status: 500 }
    );
  }
}

