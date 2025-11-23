/**
 * Performance Reports API - TalentHR
 * Provides performance analytics and statistics
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Goal from "@/models/Goal";
import PerformanceReview from "@/models/PerformanceReview";
import Employee from "@/models/Employee";
import User from "@/models/User";
import { authenticateRequest } from "@/lib/auth-middleware";

/**
 * GET /api/reports/performance
 * Get performance statistics
 */
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const auth = await authenticateRequest(request);
        if (!auth.success) return auth.response;

        const { user } = auth.data;

        const query: any = {};

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

        const goals = await Goal.find(query);

        // Calculate goal statistics
        const totalGoals = goals.length;
        const completedGoals = goals.filter((g) => g.status === "completed").length;
        const inProgressGoals = goals.filter((g) => g.status === "in-progress").length;
        const notStartedGoals = goals.filter((g) => g.status === "not-started").length;

        const totalProgress = goals.reduce((sum, g) => sum + g.progress, 0);
        const avgProgress = totalGoals > 0 ? Math.round(totalProgress / totalGoals) : 0;

        // Get review statistics
        const reviewQuery: any = {};
        if (user.role === "employee") {
            const employee = await Employee.findOne({ userId: user._id });
            if (employee) {
                reviewQuery.employeeId = employee._id;
            }
        } else if (user.role === "manager") {
            const managedEmployees = await Employee.find({ managerId: user._id }).select("_id");
            const employeeIds = managedEmployees.map((e) => e._id);
            reviewQuery.employeeId = { $in: employeeIds };
        }

        const reviews = await PerformanceReview.find(reviewQuery);
        const totalReviews = reviews.length;
        const submittedReviews = reviews.filter((r) => r.status === "submitted" || r.status === "completed").length;

        const totalRating = reviews.reduce((sum, r) => sum + r.overallRating, 0);
        const avgRating = totalReviews > 0 ? Math.round((totalRating / totalReviews) * 10) / 10 : 0;

        return NextResponse.json({
            success: true,
            report: {
                goals: {
                    total: totalGoals,
                    completed: completedGoals,
                    inProgress: inProgressGoals,
                    notStarted: notStartedGoals,
                    completionRate: totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0,
                    avgProgress,
                },
                reviews: {
                    total: totalReviews,
                    submitted: submittedReviews,
                    avgRating,
                },
            },
        });
    } catch (error) {
        console.error("Get performance report error:", error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : "Internal server error",
            },
            { status: 500 }
        );
    }
}
