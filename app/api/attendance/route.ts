/**
 * Attendance API Route - TalentHR
 * Handles attendance listing and manual creation
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Attendance from "@/models/Attendance";
import Employee from "@/models/Employee";
import User from "@/models/User";
import { authenticateRequest } from "@/lib/auth-middleware";

/**
 * GET /api/attendance
 * List attendance records
 * - Admin/HR: Can view all records
 * - Manager: Can view team records
 * - Employee: Can view own records
 */
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // Authenticate request
        const auth = await authenticateRequest(request);
        if (!auth.success) return auth.response;

        const { user } = auth.data;

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const employeeId = searchParams.get("employeeId");

        // Build query
        const query: any = {
            companyId: user.companyId,
        };

        // Date range filter
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        // Role-based access control
        if (user.role === "employee") {
            // Employees can only see their own attendance
            const employee = await Employee.findOne({ userId: user._id });
            if (!employee) {
                return NextResponse.json(
                    { success: false, message: "Employee record not found" },
                    { status: 404 }
                );
            }
            query.employeeId = employee._id;
        } else if (user.role === "manager") {
            // Managers can see their team's attendance + their own
            if (employeeId) {
                // If specific employee requested, verify they are in manager's team
                const targetEmployee = await Employee.findById(employeeId);
                if (
                    targetEmployee &&
                    String(targetEmployee.managerId) === String(user._id)
                ) {
                    query.employeeId = employeeId;
                } else {
                    // If not in team, only allow if it's the manager themselves
                    const managerEmployee = await Employee.findOne({ userId: user._id });
                    if (
                        managerEmployee &&
                        String(managerEmployee._id) === String(employeeId)
                    ) {
                        query.employeeId = employeeId;
                    } else {
                        return NextResponse.json(
                            {
                                success: false,
                                message: "You don't have permission to view this employee's attendance",
                            },
                            { status: 403 }
                        );
                    }
                }
            } else {
                // List all team members + self
                const teamMembers = await Employee.find({ managerId: user._id }).select(
                    "_id"
                );
                const managerEmployee = await Employee.findOne({ userId: user._id }).select(
                    "_id"
                );

                const allowedIds = teamMembers.map((e) => e._id);
                if (managerEmployee) allowedIds.push(managerEmployee._id);

                query.employeeId = { $in: allowedIds };
            }
        } else {
            // Admin/HR can see everyone
            if (employeeId) {
                query.employeeId = employeeId;
            }
        }

        // Execute query
        const attendanceRecords = await Attendance.find(query)
            .populate({
                path: "employeeId",
                select: "userId position departmentId",
                populate: {
                    path: "userId",
                    select: "name email",
                },
            })
            .sort({ date: -1 });

        return NextResponse.json({
            success: true,
            count: attendanceRecords.length,
            data: attendanceRecords,
        });
    } catch (error) {
        console.error("Get attendance error:", error);
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
 * POST /api/attendance
 * Create attendance record manually (Admin/HR only)
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
                    message: "You don't have permission to create attendance records",
                },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { employeeId, date, clockIn, clockOut, status, notes } = body;

        // Validate required fields
        if (!employeeId || !date || !clockIn) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Employee ID, date, and clock in time are required",
                },
                { status: 400 }
            );
        }

        // Verify employee belongs to company
        const employee = await Employee.findById(employeeId).populate("userId");
        if (!employee) {
            return NextResponse.json(
                { success: false, message: "Employee not found" },
                { status: 404 }
            );
        }

        const employeeUser = employee.userId as any;
        if (String(employeeUser.companyId) !== String(user.companyId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Employee does not belong to your company",
                },
                { status: 403 }
            );
        }

        // Calculate duration if clockOut is provided
        let workDuration = 0;
        if (clockOut) {
            const start = new Date(clockIn).getTime();
            const end = new Date(clockOut).getTime();
            workDuration = Math.round((end - start) / (1000 * 60)); // Minutes
        }

        // Check for existing record
        const existingRecord = await Attendance.findOne({
            employeeId,
            date: new Date(date),
        });

        if (existingRecord) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Attendance record already exists for this date",
                },
                { status: 409 }
            );
        }

        // Create record
        const attendance = await Attendance.create({
            employeeId,
            companyId: user.companyId,
            date: new Date(date),
            clockIn: new Date(clockIn),
            clockOut: clockOut ? new Date(clockOut) : undefined,
            status: status || "Present",
            workDuration,
            notes,
        });

        return NextResponse.json(
            {
                success: true,
                message: "Attendance record created successfully",
                data: attendance,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Create attendance error:", error);
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
