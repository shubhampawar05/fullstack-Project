/**
 * Candidates API Route - TalentHR
 * Handles candidate listing and creation
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Candidate from "@/models/Candidate";
import { authenticateRequest } from "@/lib/auth-middleware";

/**
 * GET /api/candidates
 * List all candidates in the company
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
    const jobPostingId = searchParams.get("jobPostingId");
    const status = searchParams.get("status");
    const stage = searchParams.get("stage");
    const recruiterId = searchParams.get("recruiterId");
    const search = searchParams.get("search");

    // Build query
    const query: any = {
      companyId: (user as any).companyId,
    };

    if (jobPostingId) {
      query.jobPostingId = jobPostingId;
    }

    if (status) {
      query.status = status;
    }

    if (stage) {
      query.stage = stage;
    }

    if (recruiterId) {
      query.recruiterId = recruiterId;
    }

    // Get candidates
    let candidates = await Candidate.find(query)
      .populate("jobPostingId", "title status")
      .populate("recruiterId", "name email")
      .sort({ appliedAt: -1 });

    // Filter by search term if provided
    if (search) {
      const searchLower = search.toLowerCase();
      candidates = candidates.filter((candidate: any) => {
        return (
          candidate.firstName?.toLowerCase().includes(searchLower) ||
          candidate.lastName?.toLowerCase().includes(searchLower) ||
          candidate.email?.toLowerCase().includes(searchLower) ||
          candidate.currentPosition?.toLowerCase().includes(searchLower) ||
          candidate.currentCompany?.toLowerCase().includes(searchLower) ||
          candidate.skills?.some((skill: string) => skill.toLowerCase().includes(searchLower))
        );
      });
    }

    // Recruiter can only see their assigned candidates
    if ((user as any).role === "recruiter") {
      candidates = candidates.filter(
        (candidate: any) =>
          String(candidate.recruiterId?._id || candidate.recruiterId) === String((user as any)._id)
      );
    }

    return NextResponse.json({
      success: true,
      candidates: candidates.map((candidate: any) => ({
        id: String(candidate._id),
        jobPostingId: String(candidate.jobPostingId._id || candidate.jobPostingId),
        jobPosting: candidate.jobPostingId
          ? {
              id: String(candidate.jobPostingId._id || candidate.jobPostingId),
              title: candidate.jobPostingId.title,
              status: candidate.jobPostingId.status,
            }
          : null,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        email: candidate.email,
        phone: candidate.phone,
        resumeUrl: candidate.resumeUrl,
        coverLetter: candidate.coverLetter,
        linkedInUrl: candidate.linkedInUrl,
        portfolioUrl: candidate.portfolioUrl,
        experience: candidate.experience,
        currentPosition: candidate.currentPosition,
        currentCompany: candidate.currentCompany,
        expectedSalary: candidate.expectedSalary,
        noticePeriod: candidate.noticePeriod,
        availability: candidate.availability?.toISOString(),
        status: candidate.status,
        stage: candidate.stage,
        source: candidate.source,
        recruiterId: candidate.recruiterId
          ? String(candidate.recruiterId._id || candidate.recruiterId)
          : null,
        recruiter: candidate.recruiterId
          ? {
              id: String(candidate.recruiterId._id || candidate.recruiterId),
              name: candidate.recruiterId.name,
              email: candidate.recruiterId.email,
            }
          : null,
        notes: candidate.notes,
        rating: candidate.rating,
        skills: candidate.skills || [],
        documents: candidate.documents || [],
        appliedAt: candidate.appliedAt.toISOString(),
        createdAt: candidate.createdAt.toISOString(),
        updatedAt: candidate.updatedAt.toISOString(),
      })),
    });
  } catch (error: any) {
    console.error("Error fetching candidates:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch candidates",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/candidates
 * Create a new candidate application (Admin/HR/Recruiter only)
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Authenticate request
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    const { user } = auth.data;

    // Check permissions
    const userRole = (user as any).role;
    if (
      userRole !== "company_admin" &&
      userRole !== "hr_manager" &&
      userRole !== "recruiter"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "You don't have permission to create candidate applications",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      jobPostingId,
      firstName,
      lastName,
      email,
      phone,
      resumeUrl,
      coverLetter,
      linkedInUrl,
      portfolioUrl,
      experience,
      currentPosition,
      currentCompany,
      expectedSalary,
      noticePeriod,
      availability,
      status,
      stage,
      source,
      recruiterId,
      notes,
      rating,
      skills,
      documents,
    } = body;

    // Validate required fields
    if (!jobPostingId || !firstName || !lastName || !email) {
      return NextResponse.json(
        {
          success: false,
          message: "Job posting, first name, last name, and email are required",
        },
        { status: 400 }
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

    if (String(jobPosting.companyId) !== String((user as any).companyId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Job posting does not belong to your company",
        },
        { status: 403 }
      );
    }

    // Check if candidate already applied for this job
    const existingCandidate = await Candidate.findOne({
      jobPostingId,
      email: email.toLowerCase(),
    });

    if (existingCandidate) {
      return NextResponse.json(
        {
          success: false,
          message: "Candidate has already applied for this job",
        },
        { status: 400 }
      );
    }

    // Create candidate
    const candidate = new Candidate({
      jobPostingId,
      companyId: (user as any).companyId,
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone: phone || undefined,
      resumeUrl: resumeUrl || undefined,
      coverLetter: coverLetter || undefined,
      linkedInUrl: linkedInUrl || undefined,
      portfolioUrl: portfolioUrl || undefined,
      experience: experience || undefined,
      currentPosition: currentPosition || undefined,
      currentCompany: currentCompany || undefined,
      expectedSalary: expectedSalary || undefined,
      noticePeriod: noticePeriod || undefined,
      availability: availability ? new Date(availability) : undefined,
      status: status || "applied",
      stage: stage || "application",
      source: source || undefined,
      recruiterId: recruiterId || (user as any)._id, // Default to current user if not specified
      notes: notes || undefined,
      rating: rating || undefined,
      skills: skills || [],
      documents: documents || [],
      appliedAt: new Date(),
    });

    await candidate.save();

    // Populate references
    await candidate.populate("jobPostingId", "title status");
    await candidate.populate("recruiterId", "name email");

    return NextResponse.json(
      {
        success: true,
        message: "Candidate application created successfully",
        candidate: {
          id: String(candidate._id),
          jobPostingId: String(candidate.jobPostingId._id || candidate.jobPostingId),
          jobPosting: candidate.jobPostingId
            ? {
                id: String(candidate.jobPostingId._id || candidate.jobPostingId),
                title: (candidate.jobPostingId as any).title,
                status: (candidate.jobPostingId as any).status,
              }
            : null,
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          email: candidate.email,
          phone: candidate.phone,
          resumeUrl: candidate.resumeUrl,
          coverLetter: candidate.coverLetter,
          linkedInUrl: candidate.linkedInUrl,
          portfolioUrl: candidate.portfolioUrl,
          experience: candidate.experience,
          currentPosition: candidate.currentPosition,
          currentCompany: candidate.currentCompany,
          expectedSalary: candidate.expectedSalary,
          noticePeriod: candidate.noticePeriod,
          availability: candidate.availability?.toISOString(),
          status: candidate.status,
          stage: candidate.stage,
          source: candidate.source,
          recruiterId: candidate.recruiterId
            ? String(candidate.recruiterId._id || candidate.recruiterId)
            : null,
          recruiter: candidate.recruiterId
            ? {
                id: String(candidate.recruiterId._id || candidate.recruiterId),
                name: (candidate.recruiterId as any).name,
                email: (candidate.recruiterId as any).email,
              }
            : null,
          notes: candidate.notes,
          rating: candidate.rating,
          skills: candidate.skills || [],
          documents: candidate.documents || [],
          appliedAt: candidate.appliedAt.toISOString(),
          createdAt: candidate.createdAt.toISOString(),
          updatedAt: candidate.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating candidate:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create candidate application",
      },
      { status: 500 }
    );
  }
}

