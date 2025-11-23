/**
 * Review Update API - TalentHR
 * Update and submit performance reviews
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import PerformanceReview from "@/models/PerformanceReview";
import { authenticateRequest } from "@/lib/auth-middleware";

/**
 * PUT /api/reviews/[id]
 * Update review or submit
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
        const { action, ...updateData } = body;

        const review = await PerformanceReview.findById(id);
        if (!review) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Review not found",
                },
                { status: 404 }
            );
        }

        // Check permissions (only reviewer can update)
        if (String(review.reviewerId) !== String(user._id)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You don't have permission to update this review",
                },
                { status: 403 }
            );
        }

        if (action === "submit") {
            if (review.status !== "draft") {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Review has already been submitted",
                    },
                    { status: 400 }
                );
            }

            review.status = "submitted";
            review.submittedAt = new Date();
            await review.save();

            return NextResponse.json({
                success: true,
                message: "Review submitted successfully",
                review: {
                    id: String(review._id),
                    status: review.status,
                },
            });
        } else {
            // Update review fields
            if (updateData.overallRating !== undefined) review.overallRating = updateData.overallRating;
            if (updateData.strengths) review.strengths = updateData.strengths;
            if (updateData.areasForImprovement) review.areasForImprovement = updateData.areasForImprovement;
            if (updateData.goals) review.goals = updateData.goals;
            if (updateData.comments !== undefined) review.comments = updateData.comments;

            await review.save();

            return NextResponse.json({
                success: true,
                message: "Review updated successfully",
                review: {
                    id: String(review._id),
                    status: review.status,
                },
            });
        }
    } catch (error) {
        console.error("Update review error:", error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : "Internal server error",
            },
            { status: 500 }
        );
    }
}
