/**
 * Employees API Route - TalentHR
 * Handles employee listing and management
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Employee from "@/models/Employee";
import User from "@/models/User";
import Department from "@/models/Department";
import { authenticateRequest } from "@/lib/auth-middleware";

/**
 * GET /api/employees
 * List all employees in the company (Admin/HR/Manager only)
 */
export async function GET(request: NextRequest) {
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
          message: "You don't have permission to view employees",
        },
        { status: 403 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get("departmentId");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // Build query
    const query: any = {};

    // Get all users in the company first
    const companyUsers = await User.find({ companyId: user.companyId }).select("_id");
    const userIds = companyUsers.map((u) => u._id);

    query.userId = { $in: userIds };

    if (departmentId) {
      query.departmentId = departmentId;
    }

    if (status) {
      query.status = status;
    }

    // Get employees with populated data
    let employees = await Employee.find(query)
      .populate("userId", "name email role status")
      .populate("departmentId", "name code")
      .populate("managerId", "name email")
      .sort({ createdAt: -1 });

    // Filter by search term if provided
    if (search) {
      const searchLower = search.toLowerCase();
      employees = employees.filter((emp: any) => {
        const user = emp.userId;
        return (
          emp.employeeId?.toLowerCase().includes(searchLower) ||
          user?.name?.toLowerCase().includes(searchLower) ||
          user?.email?.toLowerCase().includes(searchLower) ||
          emp.position?.toLowerCase().includes(searchLower) ||
          emp.departmentId?.name?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Manager can only see their team
    if (user.role === "manager") {
      employees = employees.filter(
        (emp: any) =>
          String(emp.managerId?._id || emp.managerId) === String(user._id)
      );
    }

    return NextResponse.json({
      success: true,
      employees: employees.map((emp: any) => ({
        id: String(emp._id),
        userId: String(emp.userId?._id || emp.userId),
        employeeId: emp.employeeId,
        name: emp.userId?.name,
        email: emp.userId?.email,
        role: emp.userId?.role,
        userStatus: emp.userId?.status,
        department: emp.departmentId
          ? {
            id: String(emp.departmentId._id),
            name: emp.departmentId.name,
            code: emp.departmentId.code,
          }
          : null,
        position: emp.position,
        hireDate: emp.hireDate?.toISOString(),
        employmentType: emp.employmentType,
        salary: emp.salary,
        manager: emp.managerId
          ? {
            id: String(emp.managerId._id),
            name: emp.managerId.name,
            email: emp.managerId.email,
          }
          : null,
        workLocation: emp.workLocation,
        phone: emp.phone,
        status: emp.status,
        createdAt: emp.createdAt.toISOString(),
        updatedAt: emp.updatedAt.toISOString(),
      })),
      total: employees.length,
    });
  } catch (error) {
    console.error("Get employees error:", error);
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
 * POST /api/employees
 * Create a new employee record (Admin/HR only)
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
          message: "You don't have permission to create employees",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      userId,
      newUser,
      departmentId,
      position,
      hireDate,
      employmentType,
      salary,
      managerId,
      workLocation,
      phone,
      address,
      emergencyContact,
    } = body;

    // Start a session for transaction
    const session = await User.db.startSession();
    session.startTransaction();

    try {
      let targetUserId = userId;

      // Case 1: Create new user
      if (newUser) {
        const { name, email, password } = newUser;

        if (!name || !email || !password) {
          throw new Error("Name, email, and password are required for new user");
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
          throw new Error("User with this email already exists");
        }

        // Hash password
        const bcrypt = require("bcrypt");
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUserData = await User.create(
          [
            {
              name,
              email: email.toLowerCase(),
              password: hashedPassword,
              role: "employee",
              companyId: user.companyId,
              status: "active",
            },
          ],
          { session }
        );

        targetUserId = newUserData[0]._id;
      }
      // Case 2: Use existing user
      else {
        if (!targetUserId) {
          throw new Error("User ID is required");
        }

        // Check if user exists and belongs to same company
        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
          throw new Error("User not found");
        }

        if (String(targetUser.companyId) !== String(user.companyId)) {
          throw new Error("User does not belong to your company");
        }
      }

      // Check if employee record already exists
      const existingEmployee = await Employee.findOne({ userId: targetUserId });
      if (existingEmployee) {
        throw new Error("Employee record already exists for this user");
      }

      // Validate department if provided
      if (departmentId) {
        const department = await Department.findById(departmentId);
        if (
          !department ||
          String(department.companyId) !== String(user.companyId)
        ) {
          throw new Error("Invalid department");
        }
      }

      // Validate manager if provided
      if (managerId) {
        const manager = await User.findById(managerId);
        if (!manager || String(manager.companyId) !== String(user.companyId)) {
          throw new Error("Invalid manager");
        }
      }

      // Create employee record
      const employee = await Employee.create(
        [
          {
            userId: targetUserId,
            departmentId: departmentId || undefined,
            position: position || undefined,
            hireDate: hireDate ? new Date(hireDate) : new Date(),
            employmentType: employmentType || "full-time",
            salary: salary || undefined,
            managerId: managerId || undefined,
            workLocation: workLocation || undefined,
            phone: phone || undefined,
            address: address || undefined,
            emergencyContact: emergencyContact || undefined,
            status: "active",
          },
        ],
        { session }
      );

      await session.commitTransaction();

      // Populate and return
      const populatedEmployee = await Employee.findById(employee[0]._id)
        .populate("userId", "name email role status")
        .populate("departmentId", "name code")
        .populate("managerId", "name email");

      return NextResponse.json(
        {
          success: true,
          message: "Employee created successfully",
          employee: {
            id: String(populatedEmployee!._id),
            userId: String(populatedEmployee!.userId),
            employeeId: populatedEmployee!.employeeId,
            name: (populatedEmployee!.userId as any)?.name,
            email: (populatedEmployee!.userId as any)?.email,
            department: populatedEmployee!.departmentId
              ? {
                id: String((populatedEmployee!.departmentId as any)._id),
                name: (populatedEmployee!.departmentId as any).name,
              }
              : null,
            position: populatedEmployee!.position,
            hireDate: populatedEmployee!.hireDate.toISOString(),
            status: populatedEmployee!.status,
          },
        },
        { status: 201 }
      );
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("Create employee error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: error instanceof Error && error.message.includes("exists") ? 409 : 500 }
    );
  }
}
