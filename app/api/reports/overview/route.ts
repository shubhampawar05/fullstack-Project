/**
 * Reports Overview API - TalentHR
 * Provides dashboard overview statistics
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Employee from "@/models/Employee";
import Department from "@/models/Department";
import Goal from "@/models/Goal";
import LeaveRequest from "@/models/LeaveRequest";
import JobPosting from "@/models/JobPosting";
import Candidate from "@/models/Candidate";
import User from "@/models/User";
import { authenticateRequest } from "@/lib/auth-middleware";

/**
 * GET /api/reports/overview
 * Get overview statistics for dashboard
 */
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const auth = await authenticateRequest(request);
        if (!auth.success) return auth.response;

        const { user } = auth.data;

        // Get company-wide stats (Admin/HR only)
        const isAdminOrHR = user.role === "company_admin" || user.role === "hr_manager";

        let stats: any = {};

        if (isAdminOrHR) {
            // Company-wide statistics
            const [
                totalEmployees,
                activeEmployees,
                totalDepartments,
                totalGoals,
                completedGoals,
                pendingLeaves,
                activeJobs,
                totalCandidates,
            ] = await Promise.all([
                Employee.countDocuments({ status: { $ne: "terminated" } }),
                Employee.countDocuments({ status: "active" }),
                Department.countDocuments({ status: "active" }),
                Goal.countDocuments(),
                Goal.countDocuments({ status: "completed" }),
                LeaveRequest.countDocuments({ status: "pending" }),
                JobPosting.countDocuments({ status: "published" }),
                Candidate.countDocuments(),
            ]);

            stats = {
                totalEmployees,
                activeEmployees,
                totalDepartments,
                totalGoals,
                completedGoals,
                goalsCompletionRate: totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0,
                pendingLeaves,
                activeJobs,
                totalCandidates,
            };
        } else {
            // Personal statistics for employees
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

            const [myGoals, completedGoals, myLeaves, pendingLeaves] = await Promise.all([
                Goal.countDocuments({ userId: user._id }),
                Goal.countDocuments({ userId: user._id, status: "completed" }),
                LeaveRequest.countDocuments({ userId: user._id }),
                LeaveRequest.countDocuments({ userId: user._id, status: "pending" }),
            ]);

            stats = {
                myGoals,
                completedGoals,
                goalsCompletionRate: myGoals > 0 ? Math.round((completedGoals / myGoals) * 100) : 0,
                myLeaves,
                pendingLeaves,
            };
        }

        return NextResponse.json({
            success: true,
            stats,
        });
    } catch (error) {
        console.error("Get overview stats error:", error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : "Internal server error",
            },
            { status: 500 }
        );
    }
}
