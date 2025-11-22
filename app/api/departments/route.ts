/**
 * Departments API Route - TalentHR
 * Handles department listing and management
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Department from "@/models/Department";
import { authenticateRequest } from "@/lib/auth-middleware";
import { z } from "zod";

const createDepartmentSchema = z.object({
  name: z.string().min(2, "Department name must be at least 2 characters"),
  code: z.string().optional(),
  description: z.string().optional(),
  parentDepartmentId: z.string().optional(),
  managerId: z.string().optional(),
  budget: z.number().min(0).optional(),
  location: z.string().optional(),
});

/**
 * GET /api/departments
 * List all departments in the company
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Authenticate request
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    const { user } = auth.data;

    // Get all departments for the company
    const departments = await Department.find({
      companyId: user.companyId,
    })
      .populate("managerId", "name email")
      .populate("parentDepartmentId", "name code")
      .sort({ name: 1 });

    return NextResponse.json({
      success: true,
      departments: departments.map((dept: any) => ({
        id: String(dept._id),
        name: dept.name,
        code: dept.code,
        description: dept.description,
        parentDepartment: dept.parentDepartmentId
          ? {
              id: String(dept.parentDepartmentId._id),
              name: dept.parentDepartmentId.name,
              code: dept.parentDepartmentId.code,
            }
          : null,
        manager: dept.managerId
          ? {
              id: String(dept.managerId._id),
              name: dept.managerId.name,
              email: dept.managerId.email,
            }
          : null,
        budget: dept.budget,
        location: dept.location,
        status: dept.status,
        createdAt: dept.createdAt.toISOString(),
        updatedAt: dept.updatedAt.toISOString(),
      })),
      total: departments.length,
    });
  } catch (error) {
    console.error("Get departments error:", error);
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
 * POST /api/departments
 * Create a new department (Admin/HR only)
 */
export async function POST(request: NextRequest) {
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
          message: "You don't have permission to create departments",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validationResult = createDepartmentSchema.safeParse(body);

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

    const { name, code, description, parentDepartmentId, managerId, budget, location } = validationResult.data;

    // Check if department name already exists in company
    const existingDept = await Department.findOne({
      companyId: user.companyId,
      name: name.trim(),
    });

    if (existingDept) {
      return NextResponse.json(
        {
          success: false,
          message: "Department with this name already exists",
        },
        { status: 409 }
      );
    }

    // Validate parent department if provided
    if (parentDepartmentId) {
      const parentDept = await Department.findById(parentDepartmentId);
      if (!parentDept || String(parentDept.companyId) !== String(user.companyId)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid parent department",
          },
          { status: 400 }
        );
      }
    }

    // Validate manager if provided
    if (managerId) {
      const User = (await import("@/models/User")).default;
      const manager = await User.findById(managerId);
      if (!manager || String(manager.companyId) !== String(user.companyId)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid manager",
          },
          { status: 400 }
        );
      }
    }

    // Create department
    const department = await Department.create({
      companyId: user.companyId,
      name: name.trim(),
      code: code?.trim().toUpperCase() || undefined,
      description: description?.trim() || undefined,
      parentDepartmentId: parentDepartmentId || undefined,
      managerId: managerId || undefined,
      budget: budget || undefined,
      location: location?.trim() || undefined,
      status: "active",
    });

    // Populate and return
    const populatedDept = await Department.findById(department._id)
      .populate("managerId", "name email")
      .populate("parentDepartmentId", "name code");

    return NextResponse.json(
      {
        success: true,
        message: "Department created successfully",
        department: {
          id: String(populatedDept!._id),
          name: populatedDept!.name,
          code: populatedDept!.code,
          description: populatedDept!.description,
          parentDepartment: populatedDept!.parentDepartmentId
            ? {
                id: String((populatedDept!.parentDepartmentId as any)._id),
                name: (populatedDept!.parentDepartmentId as any).name,
              }
            : null,
          manager: populatedDept!.managerId
            ? {
                id: String((populatedDept!.managerId as any)._id),
                name: (populatedDept!.managerId as any).name,
              }
            : null,
          status: populatedDept!.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create department error:", error);
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

