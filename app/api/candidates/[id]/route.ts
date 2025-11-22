/**
 * Candidate Management API Route - TalentHR
 * Handles individual candidate operations (get, update)
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Candidate from "@/models/Candidate";
import { authenticateRequest } from "@/lib/auth-middleware";

/**
 * GET /api/candidates/:id
 * Get candidate details
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

    // Find candidate
    const candidate = await Candidate.findById(id)
      .populate("jobPostingId", "title description status")
      .populate("recruiterId", "name email");

    if (!candidate) {
      return NextResponse.json(
        {
          success: false,
          message: "Candidate not found",
        },
        { status: 404 }
      );
    }

    // Check if candidate belongs to same company
    if (String(candidate.companyId) !== String((user as any).companyId)) {
      return NextResponse.json(
        {
          success: false,
          message: "You don't have permission to view this candidate",
        },
        { status: 403 }
      );
    }

    // Recruiter can only see their assigned candidates
    if ((user as any).role === "recruiter") {
      if (String(candidate.recruiterId?._id || candidate.recruiterId) !== String((user as any)._id)) {
        return NextResponse.json(
          {
            success: false,
            message: "You don't have permission to view this candidate",
          },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      candidate: {
        id: String(candidate._id),
        jobPostingId: String(candidate.jobPostingId._id || candidate.jobPostingId),
        jobPosting: candidate.jobPostingId
          ? {
              id: String(candidate.jobPostingId._id || candidate.jobPostingId),
              title: (candidate.jobPostingId as any).title,
              description: (candidate.jobPostingId as any).description,
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
    });
  } catch (error: any) {
    console.error("Error fetching candidate:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch candidate",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/candidates/:id
 * Update candidate (Admin/HR/Recruiter only)
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
          message: "You don't have permission to update candidates",
        },
        { status: 403 }
      );
    }

    // Find candidate
    const candidate = await Candidate.findById(id);

    if (!candidate) {
      return NextResponse.json(
        {
          success: false,
          message: "Candidate not found",
        },
        { status: 404 }
      );
    }

    // Check if candidate belongs to same company
    if (String(candidate.companyId) !== String((user as any).companyId)) {
      return NextResponse.json(
        {
          success: false,
          message: "You don't have permission to update this candidate",
        },
        { status: 403 }
      );
    }

    // Recruiter can only update their assigned candidates
    if (userRole === "recruiter") {
      if (String(candidate.recruiterId?._id || candidate.recruiterId) !== String((user as any)._id)) {
        return NextResponse.json(
          {
            success: false,
            message: "You don't have permission to update this candidate",
          },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const {
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

    // Update fields
    if (firstName !== undefined) candidate.firstName = firstName;
    if (lastName !== undefined) candidate.lastName = lastName;
    if (email !== undefined) candidate.email = email.toLowerCase();
    if (phone !== undefined) candidate.phone = phone;
    if (resumeUrl !== undefined) candidate.resumeUrl = resumeUrl;
    if (coverLetter !== undefined) candidate.coverLetter = coverLetter;
    if (linkedInUrl !== undefined) candidate.linkedInUrl = linkedInUrl;
    if (portfolioUrl !== undefined) candidate.portfolioUrl = portfolioUrl;
    if (experience !== undefined) candidate.experience = experience;
    if (currentPosition !== undefined) candidate.currentPosition = currentPosition;
    if (currentCompany !== undefined) candidate.currentCompany = currentCompany;
    if (expectedSalary !== undefined) candidate.expectedSalary = expectedSalary;
    if (noticePeriod !== undefined) candidate.noticePeriod = noticePeriod;
    if (availability !== undefined)
      candidate.availability = availability ? new Date(availability) : undefined;
    if (status !== undefined) candidate.status = status;
    if (stage !== undefined) candidate.stage = stage;
    if (source !== undefined) candidate.source = source;
    if (recruiterId !== undefined) candidate.recruiterId = recruiterId || null;
    if (notes !== undefined) candidate.notes = notes;
    if (rating !== undefined) candidate.rating = rating;
    if (skills !== undefined) candidate.skills = skills;
    if (documents !== undefined) candidate.documents = documents;

    await candidate.save();

    // Populate references
    await candidate.populate("jobPostingId", "title description status");
    await candidate.populate("recruiterId", "name email");

    return NextResponse.json({
      success: true,
      message: "Candidate updated successfully",
      candidate: {
        id: String(candidate._id),
        jobPostingId: String(candidate.jobPostingId._id || candidate.jobPostingId),
        jobPosting: candidate.jobPostingId
          ? {
              id: String(candidate.jobPostingId._id || candidate.jobPostingId),
              title: (candidate.jobPostingId as any).title,
              description: (candidate.jobPostingId as any).description,
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
    });
  } catch (error: any) {
    console.error("Error updating candidate:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update candidate",
      },
      { status: 500 }
    );
  }
}

