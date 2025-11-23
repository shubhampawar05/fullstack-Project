/**
 * Attendance Summary API - TalentHR
 * Get monthly attendance summary and statistics
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Attendance from "@/models/Attendance";
import Employee from "@/models/Employee";
import User from "@/models/User";
import { authenticateRequest } from "@/lib/auth-middleware";

/**
 * GET /api/attendance/summary
 * Get attendance summary (monthly stats)
 */
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const auth = await authenticateRequest(request);
        if (!auth.success) return auth.response;

        const { user } = auth.data;
        const { searchParams } = new URL(request.url);

        const month = searchParams.get("month") || new Date().getMonth() + 1;
        const year = searchParams.get("year") || new Date().getFullYear();
        const employeeId = searchParams.get("employeeId");

        // Calculate date range for the month
        const startDate = new Date(Number(year), Number(month) - 1, 1);
        const endDate = new Date(Number(year), Number(month), 0);

        // Build query
        const query: any = {
            date: {
                $gte: startDate,
                $lte: endDate,
            },
        };

        // Role-based access
        if (user.role === "employee") {
            query.userId = user._id;
        } else if (user.role === "manager") {
            const managedEmployees = await Employee.find({ managerId: user._id }).select("userId");
            const userIds = managedEmployees.map((e) => e.userId);
            query.userId = { $in: [...userIds, user._id] };
        } else if (user.role === "company_admin" || user.role === "hr_manager") {
            const companyUsers = await User.find({ companyId: user.companyId }).select("_id");
            const userIds = companyUsers.map((u) => u._id);
            query.userId = { $in: userIds };
        }

        // Apply employee filter if provided
        if (employeeId) {
            const employee = await Employee.findById(employeeId);
            if (employee) {
                query.userId = employee.userId;
            }
        }

        const attendance = await Attendance.find(query);

        // Calculate statistics
        const totalDays = attendance.length;
        const presentDays = attendance.filter((a) => a.status === "present").length;
        const absentDays = attendance.filter((a) => a.status === "absent").length;
        const lateDays = attendance.filter((a) => a.status === "late").length;
        const halfDays = attendance.filter((a) => a.status === "half-day").length;

        const totalWorkHours = attendance.reduce((sum, a) => sum + (a.workHours || 0), 0);
        const avgWorkHours = totalDays > 0 ? totalWorkHours / totalDays : 0;

        return NextResponse.json({
            success: true,
            summary: {
                month: Number(month),
                year: Number(year),
                totalDays,
                presentDays,
                absentDays,
                lateDays,
                halfDays,
                totalWorkHours: Math.round(totalWorkHours * 100) / 100,
                avgWorkHours: Math.round(avgWorkHours * 100) / 100,
                attendanceRate: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0,
            },
        });
    } catch (error) {
        console.error("Get attendance summary error:", error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : "Internal server error",
            },
            { status: 500 }
        );
    }
}
