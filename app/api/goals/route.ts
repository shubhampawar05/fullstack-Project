/**
 * Goals API - TalentHR
 * Manage employee goals and progress tracking
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Goal from "@/models/Goal";
import Employee from "@/models/Employee";
import User from "@/models/User";
import { authenticateRequest } from "@/lib/auth-middleware";

/**
 * GET /api/goals
 * List goals with filters
 */
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const auth = await authenticateRequest(request);
        if (!auth.success) return auth.response;

        const { user } = auth.data;
        const { searchParams } = new URL(request.url);

        const status = searchParams.get("status");
        const category = searchParams.get("category");
        const employeeId = searchParams.get("employeeId");

        // Build query
        const query: any = {};

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

        // Apply filters
        if (status) query.status = status;
        if (category) query.category = category;
        if (employeeId) {
            const employee = await Employee.findById(employeeId);
            if (employee) query.userId = employee.userId;
        }

        const goals = await Goal.find(query)
            .populate("userId", "name email")
            .populate("employeeId", "employeeId position")
            .populate("assignedBy", "name email")
            .sort({ targetDate: 1, createdAt: -1 })
            .limit(100);

        return NextResponse.json({
            success: true,
            goals: goals.map((g: any) => ({
                id: String(g._id),
                userId: String(g.userId._id),
                userName: g.userId.name,
                userEmail: g.userId.email,
                employeeId: g.employeeId?.employeeId,
                position: g.employeeId?.position,
                title: g.title,
                description: g.description,
                category: g.category,
                targetDate: g.targetDate.toISOString(),
                status: g.status,
                progress: g.progress,
                priority: g.priority,
                assignedBy: g.assignedBy ? {
                    id: String(g.assignedBy._id),
                    name: g.assignedBy.name,
                } : null,
                createdAt: g.createdAt.toISOString(),
            })),
            total: goals.length,
        });
    } catch (error) {
        console.error("Get goals error:", error);
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
 * POST /api/goals
 * Create a new goal
 */
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const auth = await authenticateRequest(request);
        if (!auth.success) return auth.response;

        const { user } = auth.data;
        const body = await request.json();
        const { title, description, category, targetDate, priority, assignToUserId } = body;

        // Determine target user
        let targetUserId = assignToUserId || user._id;

        // Get employee record
        const employee = await Employee.findOne({ userId: targetUserId });
        if (!employee) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Employee record not found",
                },
                { status: 404 }
            );
        }

        // Check permissions for assigning to others
        if (assignToUserId && assignToUserId !== String(user._id)) {
            if (user.role !== "company_admin" && user.role !== "hr_manager" && user.role !== "manager") {
                return NextResponse.json(
                    {
                        success: false,
                        message: "You don't have permission to assign goals to others",
                    },
                    { status: 403 }
                );
            }
        }

        const goal = await Goal.create({
            userId: targetUserId,
            employeeId: employee._id,
            title,
            description,
            category: category || "individual",
            targetDate: new Date(targetDate),
            priority: priority || "medium",
            status: "not-started",
            progress: 0,
            assignedBy: assignToUserId ? user._id : undefined,
        });

        return NextResponse.json(
            {
                success: true,
                message: "Goal created successfully",
                goal: {
                    id: String(goal._id),
                    title: goal.title,
                    status: goal.status,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Create goal error:", error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : "Internal server error",
            },
            { status: 500 }
        );
    }
}
