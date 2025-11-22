/**
 * Interviews API Route - TalentHR
 * Handles interview listing and scheduling
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Interview from "@/models/Interview";
import { authenticateRequest } from "@/lib/auth-middleware";

/**
 * GET /api/interviews
 * List all interviews in the company
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Authenticate request
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    const { user } = auth.data;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get("candidateId");
    const jobPostingId = searchParams.get("jobPostingId");
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build query
    const query: any = {
      companyId: user.companyId,
    };

    if (candidateId) {
      query.candidateId = candidateId;
    }

    if (jobPostingId) {
      query.jobPostingId = jobPostingId;
    }

    if (status) {
      query.status = status;
    }

    if (type) {
      query.type = type;
    }

    if (startDate || endDate) {
      query.scheduledAt = {};
      if (startDate) {
        query.scheduledAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.scheduledAt.$lte = new Date(endDate);
      }
    }

    // Get interviews
    let interviews = await Interview.find(query)
      .populate("candidateId", "firstName lastName email")
      .populate("jobPostingId", "title")
      .populate("interviewers", "name email")
      .populate("organizerId", "name email")
      .sort({ scheduledAt: 1 });

    // Filter by interviewer if user is not admin/HR
    if (user.role === "recruiter" || user.role === "manager") {
      interviews = interviews.filter((interview: any) => {
        const interviewerIds = interview.interviewers.map((iv: any) =>
          String(iv._id || iv)
        );
        return (
          interviewerIds.includes(String(user._id)) ||
          String(interview.organizerId?._id || interview.organizerId) === String(user._id)
        );
      });
    }

    return NextResponse.json({
      success: true,
      interviews: interviews.map((interview: any) => ({
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
      })),
    });
  } catch (error: any) {
    console.error("Error fetching interviews:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch interviews",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/interviews
 * Schedule a new interview (Admin/HR/Recruiter only)
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Authenticate request
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    const { user } = auth.data;

    // Check permissions
    if (
      user.role !== "company_admin" &&
      user.role !== "hr_manager" &&
      user.role !== "recruiter"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "You don't have permission to schedule interviews",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      candidateId,
      jobPostingId,
      type,
      scheduledAt,
      duration,
      location,
      isRemote,
      interviewers,
      status,
      notes,
    } = body;

    // Validate required fields
    if (!candidateId || !jobPostingId || !type || !scheduledAt) {
      return NextResponse.json(
        {
          success: false,
          message: "Candidate, job posting, type, and scheduled time are required",
        },
        { status: 400 }
      );
    }

    // Verify candidate exists and belongs to company
    const Candidate = (await import("@/models/Candidate")).default;
    const candidate = await Candidate.findById(candidateId);

    if (!candidate) {
      return NextResponse.json(
        {
          success: false,
          message: "Candidate not found",
        },
        { status: 404 }
      );
    }

    if (String(candidate.companyId) !== String(user.companyId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Candidate does not belong to your company",
        },
        { status: 403 }
      );
    }

    // Verify job posting exists and belongs to company
    const JobPosting = (await import("@/models/JobPosting")).default;
    const jobPosting = await JobPosting.findById(jobPostingId);

    if (!jobPosting) {
      return NextResponse.json(
        {
          success: false,
          message: "Job posting not found",
        },
        { status: 404 }
      );
    }

    if (String(jobPosting.companyId) !== String(user.companyId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Job posting does not belong to your company",
        },
        { status: 403 }
      );
    }

    // Create interview
    const interview = new Interview({
      candidateId,
      jobPostingId,
      companyId: user.companyId,
      type,
      scheduledAt: new Date(scheduledAt),
      duration: duration || 60,
      location: location || undefined,
      isRemote: isRemote || false,
      interviewers: interviewers || [],
      organizerId: user._id,
      status: status || "scheduled",
      notes: notes || undefined,
      reminderSent: false,
    });

    await interview.save();

    // Populate references
    await interview.populate("candidateId", "firstName lastName email");
    await interview.populate("jobPostingId", "title");
    await interview.populate("interviewers", "name email");
    await interview.populate("organizerId", "name email");

    return NextResponse.json(
      {
        success: true,
        message: "Interview scheduled successfully",
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
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error scheduling interview:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to schedule interview",
      },
      { status: 500 }
    );
  }
}

