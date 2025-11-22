/**
 * Feedback API Route - TalentHR
 * Handles user feedback submissions
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const feedbackSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
  rating: z.number().min(1).max(5).optional(),
  type: z.enum(["bug", "feature", "general", "other"]).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = feedbackSchema.safeParse(body);

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return NextResponse.json(
        {
          success: false,
          message: firstError?.message || "Validation failed",
        },
        { status: 400 }
      );
    }

    const feedback = validationResult.data;

    // In a real application, you would:
    // 1. Save to database
    // 2. Send email notification
    // 3. Create ticket in support system
    // For now, we'll just log it and return success

    console.log("📝 Feedback received:", {
      name: feedback.name || "Anonymous",
      email: feedback.email || "No email",
      message: feedback.message,
      rating: feedback.rating,
      type: feedback.type || "general",
      timestamp: new Date().toISOString(),
    });

    // TODO: Save to database
    // const feedbackDoc = await Feedback.create({
    //   name: feedback.name,
    //   email: feedback.email,
    //   message: feedback.message,
    //   rating: feedback.rating,
    //   type: feedback.type || "general",
    // });

    // TODO: Send email notification
    // await sendEmail({
    //   to: "support@talenthr.com",
    //   subject: `New Feedback: ${feedback.type}`,
    //   body: `Name: ${feedback.name}\nEmail: ${feedback.email}\nMessage: ${feedback.message}`,
    // });

    return NextResponse.json(
      {
        success: true,
        message: "Thank you for your feedback!",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Feedback submission error:", error);
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

