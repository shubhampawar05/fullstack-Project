/**
 * Leave Reports API - TalentHR
 * Provides leave analytics and statistics
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import LeaveRequest from "@/models/LeaveRequest";
import Employee from "@/models/Employee";
import User from "@/models/User";
import { authenticateRequest } from "@/lib/auth-middleware";

/**
 * GET /api/reports/leaves
 * Get leave statistics
 */
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const auth = await authenticateRequest(request);
        if (!auth.success) return auth.response;

        const { user } = auth.data;
        const { searchParams } = new URL(request.url);

        const year = searchParams.get("year") || new Date().getFullYear();

        const query: any = {
            startDate: {
                $gte: new Date(Number(year), 0, 1),
                $lte: new Date(Number(year), 11, 31),
            },
        };

        // Role-based filtering
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

        const leaves = await LeaveRequest.find(query).populate("leaveTypeId", "name code");

        // Calculate statistics
        const totalRequests = leaves.length;
        const approvedRequests = leaves.filter((l) => l.status === "approved").length;
        const pendingRequests = leaves.filter((l) => l.status === "pending").length;
        const rejectedRequests = leaves.filter((l) => l.status === "rejected").length;

        // Group by leave type
        const byLeaveType: any = {};
        leaves.forEach((leave: any) => {
            const typeName = leave.leaveTypeId?.name || "Unknown";
            if (!byLeaveType[typeName]) {
                byLeaveType[typeName] = 0;
            }
            byLeaveType[typeName]++;
        });

        const leaveTypeBreakdown = Object.entries(byLeaveType).map(([type, count]) => ({
            type,
            count,
        }));

        return NextResponse.json({
            success: true,
            report: {
                year: Number(year),
                totalRequests,
                approvedRequests,
                pendingRequests,
                rejectedRequests,
                approvalRate: totalRequests > 0 ? Math.round((approvedRequests / totalRequests) * 100) : 0,
                byLeaveType: leaveTypeBreakdown,
            },
        });
    } catch (error) {
        console.error("Get leave report error:", error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : "Internal server error",
            },
            { status: 500 }
        );
    }
}
