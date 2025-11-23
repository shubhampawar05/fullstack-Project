/**
 * Performance Reviews API - TalentHR
 * Manage performance reviews
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import PerformanceReview from "@/models/PerformanceReview";
import Employee from "@/models/Employee";
import User from "@/models/User";
import { authenticateRequest } from "@/lib/auth-middleware";

/**
 * GET /api/reviews
 * List performance reviews
 */
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const auth = await authenticateRequest(request);
        if (!auth.success) return auth.response;

        const { user } = auth.data;
        const { searchParams } = new URL(request.url);

        const employeeId = searchParams.get("employeeId");
        const status = searchParams.get("status");

        // Build query
        const query: any = {};

        // Role-based access
        if (user.role === "employee") {
            const employee = await Employee.findOne({ userId: user._id });
            if (employee) {
                query.employeeId = employee._id;
            }
        } else if (user.role === "manager") {
            const managedEmployees = await Employee.find({ managerId: user._id }).select("_id");
            const employeeIds = managedEmployees.map((e) => e._id);
            query.$or = [
                { employeeId: { $in: employeeIds } },
                { reviewerId: user._id },
            ];
        } else if (user.role === "company_admin" || user.role === "hr_manager") {
            // Can see all reviews
        }

        // Apply filters
        if (employeeId) query.employeeId = employeeId;
        if (status) query.status = status;

        const reviews = await PerformanceReview.find(query)
            .populate("employeeId")
            .populate({
                path: "employeeId",
                populate: { path: "userId", select: "name email" },
            })
            .populate("reviewerId", "name email")
            .sort({ createdAt: -1 })
            .limit(100);

        return NextResponse.json({
            success: true,
            reviews: reviews.map((r: any) => ({
                id: String(r._id),
                employee: {
                    id: String(r.employeeId._id),
                    employeeId: r.employeeId.employeeId,
                    name: r.employeeId.userId?.name,
                    position: r.employeeId.position,
                },
                reviewer: {
                    id: String(r.reviewerId._id),
                    name: r.reviewerId.name,
                },
                reviewPeriod: {
                    startDate: r.reviewPeriod.startDate.toISOString(),
                    endDate: r.reviewPeriod.endDate.toISOString(),
                },
                overallRating: r.overallRating,
                strengths: r.strengths,
                areasForImprovement: r.areasForImprovement,
                goals: r.goals,
                comments: r.comments,
                status: r.status,
                submittedAt: r.submittedAt?.toISOString(),
                createdAt: r.createdAt.toISOString(),
            })),
            total: reviews.length,
        });
    } catch (error) {
        console.error("Get reviews error:", error);
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
 * POST /api/reviews
 * Create a new performance review
 */
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const auth = await authenticateRequest(request);
        if (!auth.success) return auth.response;

        const { user } = auth.data;
        const body = await request.json();
        const {
            employeeId,
            reviewPeriod,
            overallRating,
            strengths,
            areasForImprovement,
            goals,
            comments,
        } = body;

        // Check permissions (Manager/HR/Admin only)
        if (user.role !== "company_admin" && user.role !== "hr_manager" && user.role !== "manager") {
            return NextResponse.json(
                {
                    success: false,
                    message: "You don't have permission to create reviews",
                },
                { status: 403 }
            );
        }

        // Validate employee
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Employee not found",
                },
                { status: 404 }
            );
        }

        // Managers can only review their team
        if (user.role === "manager" && String(employee.managerId) !== String(user._id)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You can only review your team members",
                },
                { status: 403 }
            );
        }

        const review = await PerformanceReview.create({
            employeeId,
            reviewerId: user._id,
            reviewPeriod: {
                startDate: new Date(reviewPeriod.startDate),
                endDate: new Date(reviewPeriod.endDate),
            },
            overallRating,
            strengths,
            areasForImprovement,
            goals,
            comments: comments || "",
            status: "draft",
        });

        return NextResponse.json(
            {
                success: true,
                message: "Review created successfully",
                review: {
                    id: String(review._id),
                    status: review.status,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Create review error:", error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : "Internal server error",
            },
            { status: 500 }
        );
    }
}
