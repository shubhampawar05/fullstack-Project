/**
 * Categories API Routes
 * GET /api/categories - Get all categories
 * POST /api/categories - Create category (admin only - for future use)
 */

import { NextRequest, NextResponse } from "next/server";
import Category from "@/models/Category";
import connectDB from "@/lib/db";

// GET /api/categories - Get all active categories
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    const query: any = {};
    if (!includeInactive) {
      query.isActive = true;
    }

    const categories = await Category.find(query)
      .sort({ name: 1 })
      .lean()
      .exec();

    // Organize categories by parent (for future hierarchy support)
    const rootCategories = categories.filter((cat) => !cat.parentCategory);
    const subCategories = categories.filter((cat) => cat.parentCategory);

    return NextResponse.json({
      success: true,
      categories: rootCategories,
      subCategories,
      all: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create category (admin only - for future use)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // TODO: Add admin authentication check
    // const user = await getCurrentUser();
    // if (!user || !user.isAdmin) {
    //   return NextResponse.json(
    //     { success: false, error: "Unauthorized" },
    //     { status: 403 }
    //   );
    // }

    const body = await request.json();
    const { name, slug, icon, description, parentCategory } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: "Name and slug are required" },
        { status: 400 }
      );
    }

    // Check if category with same slug exists
    const existing = await Category.findOne({ slug: slug.toLowerCase() }).exec();
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Category with this slug already exists" },
        { status: 400 }
      );
    }

    const category = new Category({
      name: name.trim(),
      slug: slug.toLowerCase().trim(),
      icon: icon?.trim(),
      description: description?.trim(),
      parentCategory: parentCategory || null,
      isActive: true,
    });

    await category.save();

    return NextResponse.json(
      {
        success: true,
        category,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create category" },
      { status: 500 }
    );
  }
}

