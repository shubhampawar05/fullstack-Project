/**
 * Interview Management API Route - TalentHR
 * Handles individual interview operations (get, update)
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Interview from "@/models/Interview";
import { authenticateRequest } from "@/lib/auth-middleware";

/**
 * GET /api/interviews/:id
 * Get interview details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // Authenticate request
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    const { user } = auth.data;
    const { id } = await params;

    // Find interview
    const interview = await Interview.findById(id)
      .populate("candidateId", "firstName lastName email")
      .populate("jobPostingId", "title")
      .populate("interviewers", "name email")
      .populate("organizerId", "name email");

    if (!interview) {
      return NextResponse.json(
        {
          success: false,
          message: "Interview not found",
        },
        { status: 404 }
      );
    }

    // Check if interview belongs to same company
    if (String(interview.companyId) !== String(user.companyId)) {
      return NextResponse.json(
        {
          success: false,
          message: "You don't have permission to view this interview",
        },
        { status: 403 }
      );
    }

    // Check if user is interviewer or organizer
    if (user.role === "recruiter" || user.role === "manager") {
      const interviewerIds = interview.interviewers.map((iv: any) =>
        String(iv._id || iv)
      );
      const isInterviewer = interviewerIds.includes(String(user._id));
      const isOrganizer =
        String(interview.organizerId?._id || interview.organizerId) === String(user._id);

      if (!isInterviewer && !isOrganizer) {
        return NextResponse.json(
          {
            success: false,
            message: "You don't have permission to view this interview",
          },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      interview: {
        id: String(interview._id),
        candidateId: String(interview.candidateId._id || interview.candidateId),
        candidate: interview.candidateId
          ? {
              id: String(interview.candidateId._id || interview.candidateId),
              firstName: (interview.candidateId as any).firstName,
              lastName: (interview.candidateId as any).lastName,
              email: (interview.candidateId as any).email,
            }
          : null,
        jobPostingId: String(interview.jobPostingId._id || interview.jobPostingId),
        jobPosting: interview.jobPostingId
          ? {
              id: String(interview.jobPostingId._id || interview.jobPostingId),
              title: (interview.jobPostingId as any).title,
            }
          : null,
        type: interview.type,
        scheduledAt: interview.scheduledAt.toISOString(),
        duration: interview.duration,
        location: interview.location,
        isRemote: interview.isRemote,
        interviewers: interview.interviewers.map((iv: any) => ({
          id: String(iv._id || iv),
          name: iv.name,
          email: iv.email,
        })),
        organizerId: String(interview.organizerId._id || interview.organizerId),
        organizer: interview.organizerId
          ? {
              id: String(interview.organizerId._id || interview.organizerId),
              name: (interview.organizerId as any).name,
              email: (interview.organizerId as any).email,
            }
          : null,
        status: interview.status,
        feedback: interview.feedback || [],
        notes: interview.notes,
        reminderSent: interview.reminderSent || false,
        createdAt: interview.createdAt.toISOString(),
        updatedAt: interview.updatedAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Error fetching interview:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch interview",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/interviews/:id
 * Update interview (Admin/HR/Recruiter/Interviewer only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // Authenticate request
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    const { user } = auth.data;
    const { id } = await params;

    // Find interview
    const interview = await Interview.findById(id);

    if (!interview) {
      return NextResponse.json(
        {
          success: false,
          message: "Interview not found",
        },
        { status: 404 }
      );
    }

    // Check if interview belongs to same company
    if (String(interview.companyId) !== String(user.companyId)) {
      return NextResponse.json(
        {
          success: false,
          message: "You don't have permission to update this interview",
        },
        { status: 403 }
      );
    }

    // Check permissions - Admin/HR can update, Recruiter/Manager can update if they're organizer or interviewer
    if (
      user.role !== "company_admin" &&
      user.role !== "hr_manager"
    ) {
      const interviewerIds = interview.interviewers.map((iv: any) =>
        String(iv._id || iv)
      );
      const isInterviewer = interviewerIds.includes(String(user._id));
      const isOrganizer =
        String(interview.organizerId?._id || interview.organizerId) === String(user._id);

      if (!isInterviewer && !isOrganizer) {
        return NextResponse.json(
          {
            success: false,
            message: "You don't have permission to update this interview",
          },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const {
      type,
      scheduledAt,
      duration,
      location,
      isRemote,
      interviewers,
      status,
      feedback,
      notes,
      reminderSent,
    } = body;

    // Update fields
    if (type !== undefined) interview.type = type;
    if (scheduledAt !== undefined) interview.scheduledAt = new Date(scheduledAt);
    if (duration !== undefined) interview.duration = duration;
    if (location !== undefined) interview.location = location;
    if (isRemote !== undefined) interview.isRemote = isRemote;
    if (interviewers !== undefined) interview.interviewers = interviewers;
    if (status !== undefined) interview.status = status;
    if (feedback !== undefined) interview.feedback = feedback;
    if (notes !== undefined) interview.notes = notes;
    if (reminderSent !== undefined) interview.reminderSent = reminderSent;

    await interview.save();

    // Populate references
    await interview.populate("candidateId", "firstName lastName email");
    await interview.populate("jobPostingId", "title");
    await interview.populate("interviewers", "name email");
    await interview.populate("organizerId", "name email");

    return NextResponse.json({
      success: true,
      message: "Interview updated successfully",
      interview: {
        id: String(interview._id),
        candidateId: String(interview.candidateId._id || interview.candidateId),
        candidate: interview.candidateId
          ? {
              id: String(interview.candidateId._id || interview.candidateId),
              firstName: (interview.candidateId as any).firstName,
              lastName: (interview.candidateId as any).lastName,
              email: (interview.candidateId as any).email,
            }
          : null,
        jobPostingId: String(interview.jobPostingId._id || interview.jobPostingId),
        jobPosting: interview.jobPostingId
          ? {
              id: String(interview.jobPostingId._id || interview.jobPostingId),
              title: (interview.jobPostingId as any).title,
            }
          : null,
        type: interview.type,
        scheduledAt: interview.scheduledAt.toISOString(),
        duration: interview.duration,
        location: interview.location,
        isRemote: interview.isRemote,
        interviewers: interview.interviewers.map((iv: any) => ({
          id: String(iv._id || iv),
          name: iv.name,
          email: iv.email,
        })),
        organizerId: String(interview.organizerId._id || interview.organizerId),
        organizer: interview.organizerId
          ? {
              id: String(interview.organizerId._id || interview.organizerId),
              name: (interview.organizerId as any).name,
              email: (interview.organizerId as any).email,
            }
          : null,
        status: interview.status,
        feedback: interview.feedback || [],
        notes: interview.notes,
        reminderSent: interview.reminderSent || false,
        createdAt: interview.createdAt.toISOString(),
        updatedAt: interview.updatedAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Error updating interview:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update interview",
      },
      { status: 500 }
    );
  }
}

