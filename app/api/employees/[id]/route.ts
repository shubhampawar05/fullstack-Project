/**
 * Employee Management API Route - TalentHR
 * Handles individual employee operations (get, update, delete)
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Employee from "@/models/Employee";
import User from "@/models/User";
import Department from "@/models/Department";
import { authenticateRequest } from "@/lib/auth-middleware";
import { z } from "zod";

const updateEmployeeSchema = z.object({
  departmentId: z.string().optional(),
  position: z.string().min(2).max(100).optional(),
  hireDate: z.string().optional(),
  employmentType: z.enum(["full-time", "part-time", "contract", "intern"]).optional(),
  salary: z.number().min(0).optional(),
  managerId: z.string().optional(),
  workLocation: z.string().optional(),
  phone: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  emergencyContact: z.object({
    name: z.string(),
    relationship: z.string(),
    phone: z.string(),
  }).optional(),
  status: z.enum(["active", "on-leave", "terminated", "resigned"]).optional(),
});

/**
 * GET /api/employees/:id
 * Get employee details
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

    // Check permissions
    if (
      user.role !== "company_admin" &&
      user.role !== "hr_manager" &&
      user.role !== "manager"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "You don't have permission to view employee details",
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    const employeeId = id;

    // Find employee
    const employee = await Employee.findById(employeeId)
      .populate("userId", "name email role status companyId")
      .populate("departmentId", "name code")
      .populate("managerId", "name email");

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee not found",
        },
        { status: 404 }
      );
    }

    // Check if employee belongs to same company
    const employeeUser = employee.userId as any;
    if (String(employeeUser.companyId) !== String(user.companyId)) {
      return NextResponse.json(
        {
          success: false,
          message: "You don't have permission to view this employee",
        },
        { status: 403 }
      );
    }

    // Manager can only see their team
    if (user.role === "manager") {
      const emp = employee as any;
      if (String(emp.managerId?._id || emp.managerId) !== String(user._id)) {
        return NextResponse.json(
          {
            success: false,
            message: "You don't have permission to view this employee",
          },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      employee: {
        id: String(employee._id),
        userId: String(employee.userId),
        employeeId: employee.employeeId,
        name: (employee.userId as any)?.name,
        email: (employee.userId as any)?.email,
        role: (employee.userId as any)?.role,
        department: employee.departmentId
          ? {
              id: String((employee.departmentId as any)._id),
              name: (employee.departmentId as any).name,
              code: (employee.departmentId as any).code,
            }
          : null,
        position: employee.position,
        hireDate: employee.hireDate.toISOString(),
        employmentType: employee.employmentType,
        salary: employee.salary,
        manager: employee.managerId
          ? {
              id: String((employee.managerId as any)._id),
              name: (employee.managerId as any).name,
              email: (employee.managerId as any).email,
            }
          : null,
        workLocation: employee.workLocation,
        phone: employee.phone,
        address: employee.address,
        emergencyContact: employee.emergencyContact,
        skills: employee.skills,
        certifications: employee.certifications,
        status: employee.status,
        createdAt: employee.createdAt.toISOString(),
        updatedAt: employee.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Get employee error:", error);
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
 * PUT /api/employees/:id
 * Update employee details
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
          message: "You don't have permission to update employees",
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    const employeeId = id;
    const body = await request.json();
    const validationResult = updateEmployeeSchema.safeParse(body);

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

    // Find employee
    const employee = await Employee.findById(employeeId).populate("userId", "companyId");

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee not found",
        },
        { status: 404 }
      );
    }

    // Check if employee belongs to same company
    const employeeUser = employee.userId as any;
    if (String(employeeUser.companyId) !== String(currentUser.companyId)) {
      return NextResponse.json(
        {
          success: false,
          message: "You don't have permission to update this employee",
        },
        { status: 403 }
      );
    }

    // Validate department if provided
    if (updateData.departmentId) {
      const department = await Department.findById(updateData.departmentId);
      if (!department || String(department.companyId) !== String(currentUser.companyId)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid department",
          },
          { status: 400 }
        );
      }
      employee.departmentId = updateData.departmentId as any;
    }

    // Validate manager if provided
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
      employee.managerId = updateData.managerId as any;
    }

    // Update other fields
    if (updateData.position !== undefined) employee.position = updateData.position;
    if (updateData.hireDate) employee.hireDate = new Date(updateData.hireDate);
    if (updateData.employmentType) employee.employmentType = updateData.employmentType;
    if (updateData.salary !== undefined) employee.salary = updateData.salary;
    if (updateData.workLocation !== undefined) employee.workLocation = updateData.workLocation;
    if (updateData.phone !== undefined) employee.phone = updateData.phone;
    if (updateData.address) employee.address = updateData.address as any;
    if (updateData.emergencyContact) employee.emergencyContact = updateData.emergencyContact as any;
    if (updateData.status) employee.status = updateData.status;

    await employee.save();

    // Return updated employee
    const updatedEmployee = await Employee.findById(employeeId)
      .populate("userId", "name email role status")
      .populate("departmentId", "name code")
      .populate("managerId", "name email");

    return NextResponse.json({
      success: true,
      message: "Employee updated successfully",
      employee: {
        id: String(updatedEmployee!._id),
        employeeId: updatedEmployee!.employeeId,
        name: (updatedEmployee!.userId as any)?.name,
        email: (updatedEmployee!.userId as any)?.email,
        department: updatedEmployee!.departmentId
          ? {
              id: String((updatedEmployee!.departmentId as any)._id),
              name: (updatedEmployee!.departmentId as any).name,
            }
          : null,
        position: updatedEmployee!.position,
        status: updatedEmployee!.status,
      },
    });
  } catch (error) {
    console.error("Update employee error:", error);
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
 * DELETE /api/employees/:id
 * Delete employee record (soft delete by setting status to terminated)
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
          message: "You don't have permission to delete employees",
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    const employeeId = id;

    // Find employee
    const employee = await Employee.findById(employeeId).populate("userId", "companyId");

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee not found",
        },
        { status: 404 }
      );
    }

    // Check if employee belongs to same company
    const employeeUser = employee.userId as any;
    if (String(employeeUser.companyId) !== String(currentUser.companyId)) {
      return NextResponse.json(
        {
          success: false,
          message: "You don't have permission to delete this employee",
        },
        { status: 403 }
      );
    }

    // Soft delete by setting status to terminated
    employee.status = "terminated";
    await employee.save();

    return NextResponse.json({
      success: true,
      message: "Employee record deleted successfully",
    });
  } catch (error) {
    console.error("Delete employee error:", error);
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

