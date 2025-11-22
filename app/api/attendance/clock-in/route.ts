/**
 * Clock In API Route - TalentHR
 * Handles employee clock-in
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Attendance from "@/models/Attendance";
import Employee from "@/models/Employee";
import { authenticateRequest } from "@/lib/auth-middleware";

/**
 * POST /api/attendance/clock-in
 * Clock in for the current day
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

        // Get request body (optional location/notes)
        const body = await request.json().catch(() => ({}));
        const { notes } = body;

        // Check if already clocked in today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingRecord = await Attendance.findOne({
            employeeId: employee._id,
            date: today,
        });

        if (existingRecord) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You have already clocked in today",
                },
                { status: 409 }
            );
        }

        // Determine status based on time (simple logic for now)
        // TODO: Implement shift-based logic
        const now = new Date();
        const hour = now.getHours();
        let status = "Present";

        if (hour >= 10) {
            status = "Late"; // Late if after 10 AM
        }

        // Create attendance record
        const attendance = await Attendance.create({
            employeeId: employee._id,
            companyId: user.companyId,
            date: today,
            clockIn: now,
            status,
            notes,
        });

        return NextResponse.json(
            {
                success: true,
                message: "Clocked in successfully",
                data: attendance,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Clock in error:", error);
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
