/**
 * User Management API Route - TalentHR
 * Handles individual user operations (get, update, delete)
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { authenticateRequest } from "@/lib/auth-middleware";
import { z } from "zod";
import bcrypt from "bcrypt";
import { authConfig } from "@/lib/config";

const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  role: z
    .enum(["company_admin", "hr_manager", "recruiter", "manager", "employee"])
    .optional(),
  status: z.enum(["active", "inactive", "pending"]).optional(),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
});

/**
 * GET /api/users/:id
 * Get user details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
          message: "You don't have permission to view user details",
        },
        { status: 403 }
      );
    }

    const userId = params.id;

    // Find user
    const targetUser = await User.findById(userId)
      .select("-password")
      .populate("companyId", "name slug");

    if (!targetUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // Check if user belongs to same company
    if (String(targetUser.companyId) !== String(user.companyId)) {
      return NextResponse.json(
        {
          success: false,
          message: "You don't have permission to view this user",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: String(targetUser._id),
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        status: targetUser.status,
        companyId: String(targetUser.companyId),
        companyName: (targetUser.companyId as any)?.name,
        lastLogin: targetUser.lastLogin?.toISOString(),
        createdAt: targetUser.createdAt.toISOString(),
        updatedAt: targetUser.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
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

/**
 * PUT /api/users/:id
 * Update user details
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Authenticate request
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    const { user: currentUser } = auth.data;

    // Check permissions
    if (currentUser.role !== "company_admin" && currentUser.role !== "hr_manager") {
      return NextResponse.json(
        {
          success: false,
          message: "You don't have permission to update users",
        },
        { status: 403 }
      );
    }

    const userId = params.id;
    const body = await request.json();
    const validationResult = updateUserSchema.safeParse(body);

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

    const updateData = validationResult.data;

    // Find user
    const targetUser = await User.findById(userId);

    if (!targetUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // Check if user belongs to same company
    if (String(targetUser.companyId) !== String(currentUser.companyId)) {
      return NextResponse.json(
        {
          success: false,
          message: "You don't have permission to update this user",
        },
        { status: 403 }
      );
    }

    // HR Manager restrictions
    if (currentUser.role === "hr_manager") {
      // HR Manager cannot change roles to company_admin or hr_manager
      if (updateData.role === "company_admin" || updateData.role === "hr_manager") {
        return NextResponse.json(
          {
            success: false,
            message: "HR Managers cannot assign admin or HR manager roles",
          },
          { status: 403 }
        );
      }
      // HR Manager cannot change existing company_admin or hr_manager roles
      if (targetUser.role === "company_admin" || targetUser.role === "hr_manager") {
        return NextResponse.json(
          {
            success: false,
            message: "You don't have permission to modify this user",
          },
          { status: 403 }
        );
      }
    }

    // Update user fields
    if (updateData.name) {
      targetUser.name = updateData.name;
    }

    if (updateData.role) {
      targetUser.role = updateData.role;
    }

    if (updateData.status) {
      targetUser.status = updateData.status;
    }

    if (updateData.password) {
      const hashedPassword = await bcrypt.hash(
        updateData.password,
        authConfig.bcryptSaltRounds
      );
      targetUser.password = hashedPassword;
    }

    await targetUser.save();

    // Return updated user (without password)
    const updatedUser = await User.findById(userId)
      .select("-password")
      .populate("companyId", "name slug");

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      user: {
        id: String(updatedUser!._id),
        name: updatedUser!.name,
        email: updatedUser!.email,
        role: updatedUser!.role,
        status: updatedUser!.status,
        companyId: String(updatedUser!.companyId),
        companyName: (updatedUser!.companyId as any)?.name,
        lastLogin: updatedUser!.lastLogin?.toISOString(),
        createdAt: updatedUser!.createdAt.toISOString(),
        updatedAt: updatedUser!.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Update user error:", error);
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

/**
 * DELETE /api/users/:id
 * Deactivate user (soft delete by setting status to inactive)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Authenticate request
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    const { user: currentUser } = auth.data;

    // Check permissions
    if (currentUser.role !== "company_admin" && currentUser.role !== "hr_manager") {
      return NextResponse.json(
        {
          success: false,
          message: "You don't have permission to deactivate users",
        },
        { status: 403 }
      );
    }

    const userId = params.id;

    // Find user
    const targetUser = await User.findById(userId);

    if (!targetUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // Check if user belongs to same company
    if (String(targetUser.companyId) !== String(currentUser.companyId)) {
      return NextResponse.json(
        {
          success: false,
          message: "You don't have permission to deactivate this user",
        },
        { status: 403 }
      );
    }

    // Prevent deactivating yourself
    if (String(targetUser._id) === String(currentUser._id)) {
      return NextResponse.json(
        {
          success: false,
          message: "You cannot deactivate your own account",
        },
        { status: 400 }
      );
    }

    // HR Manager restrictions
    if (currentUser.role === "hr_manager") {
      if (
        targetUser.role === "company_admin" ||
        targetUser.role === "hr_manager"
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "You don't have permission to deactivate this user",
          },
          { status: 403 }
        );
      }
    }

    // Deactivate user (soft delete)
    targetUser.status = "inactive";
    await targetUser.save();

    return NextResponse.json({
      success: true,
      message: "User deactivated successfully",
    });
  } catch (error) {
    console.error("Deactivate user error:", error);
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

