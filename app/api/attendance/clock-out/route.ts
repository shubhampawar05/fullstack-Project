/**
 * Clock Out API Route - TalentHR
 * Handles employee clock-out
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Attendance from "@/models/Attendance";
import Employee from "@/models/Employee";
import { authenticateRequest } from "@/lib/auth-middleware";

/**
 * POST /api/attendance/clock-out
 * Clock out for the current day
 */
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        // Authenticate request
        const auth = await authenticateRequest(request);
        if (!auth.success) return auth.response;

        const { user } = auth.data;

        // Get employee record
        const employee = await Employee.findOne({ userId: user._id });
        if (!employee) {
            return NextResponse.json(
                { success: false, message: "Employee record not found" },
                { status: 404 }
            );
        }

        // Get today's attendance record
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await Attendance.findOne({
            employeeId: employee._id,
            date: today,
        });

        if (!attendance) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You have not clocked in today",
                },
                { status: 404 }
            );
        }

        if (attendance.clockOut) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You have already clocked out today",
                },
                { status: 409 }
            );
        }

        // Calculate work duration
        const now = new Date();
        const start = new Date(attendance.clockIn).getTime();
        const end = now.getTime();
        const workDuration = Math.round((end - start) / (1000 * 60)); // Minutes

        // Update record
        attendance.clockOut = now;
        attendance.workDuration = workDuration;
        await attendance.save();

        return NextResponse.json({
            success: true,
            message: "Clocked out successfully",
            data: attendance,
        });
    } catch (error) {
        console.error("Clock out error:", error);
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
