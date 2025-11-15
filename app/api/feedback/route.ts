import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/jwt";
import connectDB from "@/lib/db";
import Feedback from "@/models/Feedback";
import { FeedbackResponse, FeedbackFormData } from "@/types/feedback";

export async function POST(request: NextRequest) {
  try {
    console.log("📝 [Feedback API] Feedback submission received");
    await connectDB();

    const body: FeedbackFormData = await request.json();
    const { type, subject, message, rating, name, email } = body;

    // Validation
    if (!type || !subject || !message) {
      return NextResponse.json<FeedbackResponse>(
        {
          success: false,
          message: "Type, subject, and message are required",
        },
        { status: 400 }
      );
    }

    if (subject.length > 200) {
      return NextResponse.json<FeedbackResponse>(
        {
          success: false,
          message: "Subject must be less than 200 characters",
        },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json<FeedbackResponse>(
        {
          success: false,
          message: "Message must be less than 2000 characters",
        },
        { status: 400 }
      );
    }

    // Try to get user ID from token (optional - feedback can be anonymous)
    let userId: string | undefined;
    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("accessToken")?.value;
      if (accessToken) {
        const payload = verifyAccessToken(accessToken);
        userId = payload.userId;
        console.log("✅ [Feedback API] User authenticated:", userId);
      }
    } catch (error) {
      // User not authenticated - allow anonymous feedback
      console.log("ℹ️ [Feedback API] Anonymous feedback submission");
    }

    // Create feedback
    const feedback = await Feedback.create({
      userId,
      email: email?.trim().toLowerCase(),
      name: name?.trim(),
      type,
      subject: subject.trim(),
      message: message.trim(),
      rating,
      status: "pending",
    });

    console.log("✅ [Feedback API] Feedback saved:", feedback._id);

    return NextResponse.json<FeedbackResponse>(
      {
        success: true,
        message: "Thank you for your feedback! We'll review it soon.",
        feedbackId: String(feedback._id),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ [Feedback API] Error:", error);
    return NextResponse.json<FeedbackResponse>(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to submit feedback",
      },
      { status: 500 }
    );
  }
}
