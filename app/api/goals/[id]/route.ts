/**
 * Goal Update API - TalentHR
 * Update goal details and progress
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Goal from "@/models/Goal";
import { authenticateRequest } from "@/lib/auth-middleware";

/**
 * PUT /api/goals/[id]
 * Update goal or progress
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();

        const auth = await authenticateRequest(request);
        if (!auth.success) return auth.response;

        const { user } = auth.data;
        const { id } = params;
        const body = await request.json();
        const { action, progress, title, description, targetDate, priority, status } = body;

        const goal = await Goal.findById(id);
        if (!goal) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Goal not found",
                },
                { status: 404 }
            );
        }

        // Check permissions
        const isOwner = String(goal.userId) === String(user._id);
        const isManager = user.role === "manager" || user.role === "hr_manager" || user.role === "company_admin";

        if (!isOwner && !isManager) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You don't have permission to update this goal",
                },
                { status: 403 }
            );
        }

        // Handle different actions
        if (action === "update-progress") {
            if (progress !== undefined) {
                goal.progress = Math.min(100, Math.max(0, progress));
                await goal.save();

                return NextResponse.json({
                    success: true,
                    message: "Progress updated successfully",
                    goal: {
                        id: String(goal._id),
                        progress: goal.progress,
                        status: goal.status,
                    },
                });
            }
        } else {
            // Update goal details
            if (title) goal.title = title;
            if (description) goal.description = description;
            if (targetDate) goal.targetDate = new Date(targetDate);
            if (priority) goal.priority = priority;
            if (status) goal.status = status;

            await goal.save();

            return NextResponse.json({
                success: true,
                message: "Goal updated successfully",
                goal: {
                    id: String(goal._id),
                    title: goal.title,
                    status: goal.status,
                },
            });
        }

        return NextResponse.json(
            {
                success: false,
                message: "Invalid action",
            },
            { status: 400 }
        );
    } catch (error) {
        console.error("Update goal error:", error);
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
 * DELETE /api/goals/[id]
 * Delete a goal
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();

        const auth = await authenticateRequest(request);
        if (!auth.success) return auth.response;

        const { user } = auth.data;
        const { id } = params;

        const goal = await Goal.findById(id);
        if (!goal) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Goal not found",
                },
                { status: 404 }
            );
        }

        // Check permissions
        const isOwner = String(goal.userId) === String(user._id);
        const isManager = user.role === "manager" || user.role === "hr_manager" || user.role === "company_admin";

        if (!isOwner && !isManager) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You don't have permission to delete this goal",
                },
                { status: 403 }
            );
        }

        await Goal.findByIdAndDelete(id);

        return NextResponse.json({
            success: true,
            message: "Goal deleted successfully",
        });
    } catch (error) {
        console.error("Delete goal error:", error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : "Internal server error",
            },
            { status: 500 }
        );
    }
}
