/**
 * Attendance API Routes - TalentHR
 * Handles clock in/out and attendance tracking
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Attendance from "@/models/Attendance";
import Employee from "@/models/Employee";
import { authenticateRequest } from "@/lib/auth-middleware";

/**
 * GET /api/attendance
 * List attendance records with filters
 */
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const auth = await authenticateRequest(request);
        if (!auth.success) return auth.response;

        const { user } = auth.data;
        const { searchParams } = new URL(request.url);

        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const employeeId = searchParams.get("employeeId");
        const status = searchParams.get("status");

        // Build query
        const query: any = {};

        // Managers can only see their team, employees can only see their own
        if (user.role === "employee") {
            query.userId = user._id;
        } else if (user.role === "manager") {
            // Get employees managed by this manager
            const managedEmployees = await Employee.find({ managerId: user._id }).select("userId");
            const userIds = managedEmployees.map((e) => e.userId);
            query.userId = { $in: [...userIds, user._id] }; // Include manager's own records
        }
        // Admin and HR can see all company records
        else if (user.role === "company_admin" || user.role === "hr_manager") {
            // Get all employees in the company
            const Employee = (await import("@/models/Employee")).default;
            const User = (await import("@/models/User")).default;
            const companyUsers = await User.find({ companyId: user.companyId }).select("_id");
            const userIds = companyUsers.map((u) => u._id);
            query.userId = { $in: userIds };
        }

        // Apply filters
        if (employeeId) {
            const employee = await Employee.findById(employeeId);
            if (employee) {
                query.userId = employee.userId;
            }
        }

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        if (status) {
            query.status = status;
        }

        const attendance = await Attendance.find(query)
            .populate("userId", "name email")
            .populate("employeeId", "employeeId position")
            .sort({ date: -1, clockIn: -1 })
            .limit(100);

        return NextResponse.json({
            success: true,
            attendance: attendance.map((a: any) => ({
                id: String(a._id),
                userId: String(a.userId._id),
                userName: a.userId.name,
                userEmail: a.userId.email,
                employeeId: a.employeeId?.employeeId,
                position: a.employeeId?.position,
                date: a.date.toISOString(),
                clockIn: a.clockIn.toISOString(),
                clockOut: a.clockOut?.toISOString(),
                status: a.status,
                workHours: a.workHours,
                notes: a.notes,
                createdAt: a.createdAt.toISOString(),
            })),
            total: attendance.length,
        });
    } catch (error) {
        console.error("Get attendance error:", error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : "Internal server error",
            },
            { status: 500 }
        );
    }
}

/**
 * POST /api/attendance
 * Clock in (create new attendance record)
 */
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const auth = await authenticateRequest(request);
        if (!auth.success) return auth.response;

        const { user } = auth.data;
        const body = await request.json();
        const { action, notes } = body;

        // Get employee record
        const employee = await Employee.findOne({ userId: user._id });
        if (!employee) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Employee record not found",
                },
                { status: 404 }
            );
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (action === "clock-in") {
            // Check if already clocked in today
            const existingAttendance = await Attendance.findOne({
                userId: user._id,
                date: today,
            });

            if (existingAttendance) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Already clocked in today",
                    },
                    { status: 400 }
                );
            }

            // Create new attendance record
            const attendance = await Attendance.create({
                userId: user._id,
                employeeId: employee._id,
                date: today,
                clockIn: new Date(),
                status: "present",
                notes: notes || undefined,
            });

            return NextResponse.json(
                {
                    success: true,
                    message: "Clocked in successfully",
                    attendance: {
                        id: String(attendance._id),
                        clockIn: attendance.clockIn.toISOString(),
                        status: attendance.status,
                    },
                },
                { status: 201 }
            );
        } else if (action === "clock-out") {
            // Find today's attendance record
            const attendance = await Attendance.findOne({
                userId: user._id,
                date: today,
            });

            if (!attendance) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "No clock-in record found for today",
                    },
                    { status: 404 }
                );
            }

            if (attendance.clockOut) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Already clocked out today",
                    },
                    { status: 400 }
                );
            }

            // Update with clock out time
            attendance.clockOut = new Date();
            if (notes) attendance.notes = notes;
            await attendance.save();

            return NextResponse.json({
                success: true,
                message: "Clocked out successfully",
                attendance: {
                    id: String(attendance._id),
                    clockIn: attendance.clockIn.toISOString(),
                    clockOut: attendance.clockOut.toISOString(),
                    workHours: attendance.workHours,
                    status: attendance.status,
                },
            });
        } else {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid action. Use 'clock-in' or 'clock-out'",
                },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error("Attendance action error:", error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : "Internal server error",
            },
            { status: 500 }
        );
    }
}
