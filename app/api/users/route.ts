/**
 * Users API Route - TalentHR
 * Handles user listing and management
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Company from "@/models/Company";
import { authenticateRequest } from "@/lib/auth-middleware";

/**
 * GET /api/users
 * List all users in the company (Admin/HR only)
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Authenticate request
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    const { user } = auth.data;

    // Check permissions
    if (user.role !== "company_admin" && user.role !== "hr_manager") {
      return NextResponse.json(
        {
          success: false,
          message: "You don't have permission to view users",
        },
        { status: 403 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // Build query
    const query: any = {
      companyId: user.companyId,
    };

    if (role) {
      query.role = role;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Get all users for the company
    const users = await User.find(query)
      .select("-password") // Don't return passwords
      .populate("companyId", "name slug")
      .sort({ createdAt: -1 });

    // Get company info
    const company = await Company.findById(user.companyId);

    return NextResponse.json({
      success: true,
      users: users.map((u: any) => ({
        id: String(u._id),
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        companyId: String(u.companyId?._id || u.companyId),
        companyName: u.companyId?.name || company?.name,
        lastLogin: u.lastLogin?.toISOString(),
        createdAt: u.createdAt.toISOString(),
        updatedAt: u.updatedAt.toISOString(),
      })),
      total: users.length,
    });
  } catch (error) {
    console.error("Get users error:", error);
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

