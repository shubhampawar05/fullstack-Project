/**
 * Department Management API Route - TalentHR
 * Handles individual department operations (get, update, delete)
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Department from "@/models/Department";
import User from "@/models/User";
import { authenticateRequest } from "@/lib/auth-middleware";
import { z } from "zod";

const updateDepartmentSchema = z.object({
  name: z.string().min(2).optional(),
  code: z.string().optional(),
  description: z.string().optional(),
  parentDepartmentId: z.string().optional(),
  managerId: z.string().optional(),
  budget: z.number().min(0).optional(),
  location: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

/**
 * GET /api/departments/:id
 * Get department details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // Authenticate request
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    const { user } = auth.data;

    const { id } = await params;
    const departmentId = id;

    // Find department
    const department = await Department.findById(departmentId)
      .populate("managerId", "name email")
      .populate("parentDepartmentId", "name code");

    if (!department) {
      return NextResponse.json(
        {
          success: false,
          message: "Department not found",
        },
        { status: 404 }
      );
    }

    // Check if department belongs to same company
    if (String(department.companyId) !== String(user.companyId)) {
      return NextResponse.json(
        {
          success: false,
          message: "You don't have permission to view this department",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      department: {
        id: String(department._id),
        name: department.name,
        code: department.code,
        description: department.description,
        parentDepartment: department.parentDepartmentId
          ? {
              id: String((department.parentDepartmentId as any)._id),
              name: (department.parentDepartmentId as any).name,
              code: (department.parentDepartmentId as any).code,
            }
          : null,
        manager: department.managerId
          ? {
              id: String((department.managerId as any)._id),
              name: (department.managerId as any).name,
              email: (department.managerId as any).email,
            }
          : null,
        budget: department.budget,
        location: department.location,
        status: department.status,
        createdAt: department.createdAt.toISOString(),
        updatedAt: department.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Get department error:", error);
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
 * PUT /api/departments/:id
 * Update department
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
          message: "You don't have permission to update departments",
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    const departmentId = id;
    const body = await request.json();
    const validationResult = updateDepartmentSchema.safeParse(body);

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

    // Find department
    const department = await Department.findById(departmentId);

    if (!department) {
      return NextResponse.json(
        {
          success: false,
          message: "Department not found",
        },
        { status: 404 }
      );
    }

    // Check if department belongs to same company
    if (String(department.companyId) !== String(currentUser.companyId)) {
      return NextResponse.json(
        {
          success: false,
          message: "You don't have permission to update this department",
        },
        { status: 403 }
      );
    }

    // Check name uniqueness if name is being updated
    if (updateData.name && updateData.name !== department.name) {
      const existingDept = await Department.findOne({
        companyId: currentUser.companyId,
        name: updateData.name.trim(),
        _id: { $ne: departmentId },
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
      department.name = updateData.name.trim();
    }

    // Validate parent department if provided
    if (updateData.parentDepartmentId !== undefined) {
      if (updateData.parentDepartmentId) {
        const parentDept = await Department.findById(updateData.parentDepartmentId);
        if (!parentDept || String(parentDept.companyId) !== String(currentUser.companyId)) {
          return NextResponse.json(
            {
              success: false,
              message: "Invalid parent department",
            },
            { status: 400 }
          );
        }
        // Prevent circular reference
        if (String(parentDept._id) === String(departmentId)) {
          return NextResponse.json(
            {
              success: false,
              message: "Department cannot be its own parent",
            },
            { status: 400 }
          );
        }
        department.parentDepartmentId = updateData.parentDepartmentId as any;
      } else {
        department.parentDepartmentId = undefined;
      }
    }

    // Validate manager if provided
    if (updateData.managerId !== undefined) {
      if (updateData.managerId) {
        const manager = await User.findById(updateData.managerId);
        if (!manager || String(manager.companyId) !== String(currentUser.companyId)) {
          return NextResponse.json(
            {
              success: false,
              message: "Invalid manager",
            },
            { status: 400 }
          );
        }
        department.managerId = updateData.managerId as any;
      } else {
        department.managerId = undefined;
      }
    }

    // Update other fields
    if (updateData.code !== undefined) department.code = updateData.code?.toUpperCase() || undefined;
    if (updateData.description !== undefined) department.description = updateData.description || undefined;
    if (updateData.budget !== undefined) department.budget = updateData.budget || undefined;
    if (updateData.location !== undefined) department.location = updateData.location || undefined;
    if (updateData.status) department.status = updateData.status;

    await department.save();

    // Return updated department
    const updatedDept = await Department.findById(departmentId)
      .populate("managerId", "name email")
      .populate("parentDepartmentId", "name code");

    return NextResponse.json({
      success: true,
      message: "Department updated successfully",
      department: {
        id: String(updatedDept!._id),
        name: updatedDept!.name,
        code: updatedDept!.code,
        status: updatedDept!.status,
      },
    });
  } catch (error) {
    console.error("Update department error:", error);
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
 * DELETE /api/departments/:id
 * Delete department (soft delete by setting status to inactive)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
          message: "You don't have permission to delete departments",
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    const departmentId = id;

    // Find department
    const department = await Department.findById(departmentId);

    if (!department) {
      return NextResponse.json(
        {
          success: false,
          message: "Department not found",
        },
        { status: 404 }
      );
    }

    // Check if department belongs to same company
    if (String(department.companyId) !== String(currentUser.companyId)) {
      return NextResponse.json(
        {
          success: false,
          message: "You don't have permission to delete this department",
        },
        { status: 403 }
      );
    }

    // Check if department has employees
    const Employee = (await import("@/models/Employee")).default;
    const employeeCount = await Employee.countDocuments({
      departmentId: departmentId,
      status: "active",
    });

    if (employeeCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot delete department. It has ${employeeCount} active employee(s). Please reassign them first.`,
        },
        { status: 400 }
      );
    }

    // Check if department has child departments
    const childCount = await Department.countDocuments({
      parentDepartmentId: departmentId,
      status: "active",
    });

    if (childCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot delete department. It has ${childCount} sub-department(s). Please delete or reassign them first.`,
        },
        { status: 400 }
      );
    }

    // Soft delete by setting status to inactive
    department.status = "inactive";
    await department.save();

    return NextResponse.json({
      success: true,
      message: "Department deleted successfully",
    });
  } catch (error) {
    console.error("Delete department error:", error);
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

