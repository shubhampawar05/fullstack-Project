/**
 * Job Management API Route - TalentHR
 * Handles individual job posting operations (get, update, delete)
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import JobPosting from "@/models/JobPosting";
import { authenticateRequest } from "@/lib/auth-middleware";

/**
 * GET /api/jobs/:id
 * Get job posting details
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

    // Find job posting
    const job = await JobPosting.findById(id)
      .populate("departmentId", "name code")
      .populate("postedBy", "name email");

    if (!job) {
      return NextResponse.json(
        {
          success: false,
          message: "Job posting not found",
        },
        { status: 404 }
      );
    }

    // Check if job belongs to same company
    if (String(job.companyId) !== String(user.companyId)) {
      return NextResponse.json(
        {
          success: false,
          message: "You don't have permission to view this job posting",
        },
        { status: 403 }
      );
    }

    // Increment views
    job.views = (job.views || 0) + 1;
    await job.save();

    // Get applications count
    const Candidate = (await import("@/models/Candidate")).default;
    const applicationsCount = await Candidate.countDocuments({
      jobPostingId: job._id,
    });

    return NextResponse.json({
      success: true,
      job: {
        id: String(job._id),
        title: job.title,
        description: job.description,
        departmentId: job.departmentId
          ? String((job.departmentId as any)._id)
          : null,
        department: job.departmentId
          ? {
              id: String((job.departmentId as any)._id),
              name: (job.departmentId as any).name,
              code: (job.departmentId as any).code,
            }
          : null,
        employmentType: job.employmentType,
        location: job.location,
        remote: job.remote,
        salaryRange: job.salaryRange,
        requirements: job.requirements || [],
        responsibilities: job.responsibilities || [],
        qualifications: job.qualifications || [],
        postedBy: {
          id: String((job.postedBy as any)._id),
          name: (job.postedBy as any).name,
          email: (job.postedBy as any).email,
        },
        status: job.status,
        applicationDeadline: job.applicationDeadline?.toISOString(),
        numberOfOpenings: job.numberOfOpenings,
        experienceLevel: job.experienceLevel,
        tags: job.tags || [],
        views: job.views || 0,
        applicationsCount,
        createdAt: job.createdAt.toISOString(),
        updatedAt: job.updatedAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Error fetching job:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch job posting",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/jobs/:id
 * Update job posting (Admin/HR/Recruiter only)
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
    if (
      user.role !== "company_admin" &&
      user.role !== "hr_manager" &&
      user.role !== "recruiter"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "You don't have permission to update job postings",
        },
        { status: 403 }
      );
    }

    // Find job posting
    const job = await JobPosting.findById(id);

    if (!job) {
      return NextResponse.json(
        {
          success: false,
          message: "Job posting not found",
        },
        { status: 404 }
      );
    }

    // Check if job belongs to same company
    if (String(job.companyId) !== String(user.companyId)) {
      return NextResponse.json(
        {
          success: false,
          message: "You don't have permission to update this job posting",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      departmentId,
      employmentType,
      location,
      remote,
      salaryRange,
      requirements,
      responsibilities,
      qualifications,
      status,
      applicationDeadline,
      numberOfOpenings,
      experienceLevel,
      tags,
    } = body;

    // Update fields
    if (title !== undefined) job.title = title;
    if (description !== undefined) job.description = description;
    if (departmentId !== undefined) job.departmentId = departmentId || null;
    if (employmentType !== undefined) job.employmentType = employmentType;
    if (location !== undefined) job.location = location;
    if (remote !== undefined) job.remote = remote;
    if (salaryRange !== undefined) job.salaryRange = salaryRange;
    if (requirements !== undefined) job.requirements = requirements;
    if (responsibilities !== undefined) job.responsibilities = responsibilities;
    if (qualifications !== undefined) job.qualifications = qualifications;
    if (status !== undefined) job.status = status;
    if (applicationDeadline !== undefined)
      job.applicationDeadline = applicationDeadline ? new Date(applicationDeadline) : undefined;
    if (numberOfOpenings !== undefined) job.numberOfOpenings = numberOfOpenings;
    if (experienceLevel !== undefined) job.experienceLevel = experienceLevel;
    if (tags !== undefined) job.tags = tags;

    await job.save();

    // Populate references
    await job.populate("departmentId", "name code");
    await job.populate("postedBy", "name email");

    // Get applications count
    const Candidate = (await import("@/models/Candidate")).default;
    const applicationsCount = await Candidate.countDocuments({
      jobPostingId: job._id,
    });

    return NextResponse.json({
      success: true,
      message: "Job posting updated successfully",
      job: {
        id: String(job._id),
        title: job.title,
        description: job.description,
        departmentId: job.departmentId
          ? String((job.departmentId as any)._id)
          : null,
        department: job.departmentId
          ? {
              id: String((job.departmentId as any)._id),
              name: (job.departmentId as any).name,
              code: (job.departmentId as any).code,
            }
          : null,
        employmentType: job.employmentType,
        location: job.location,
        remote: job.remote,
        salaryRange: job.salaryRange,
        requirements: job.requirements || [],
        responsibilities: job.responsibilities || [],
        qualifications: job.qualifications || [],
        postedBy: {
          id: String((job.postedBy as any)._id),
          name: (job.postedBy as any).name,
          email: (job.postedBy as any).email,
        },
        status: job.status,
        applicationDeadline: job.applicationDeadline?.toISOString(),
        numberOfOpenings: job.numberOfOpenings,
        experienceLevel: job.experienceLevel,
        tags: job.tags || [],
        views: job.views || 0,
        applicationsCount,
        createdAt: job.createdAt.toISOString(),
        updatedAt: job.updatedAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Error updating job:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update job posting",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/jobs/:id
 * Delete job posting (Admin/HR/Recruiter only)
 */
export async function DELETE(
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
    if (
      user.role !== "company_admin" &&
      user.role !== "hr_manager" &&
      user.role !== "recruiter"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "You don't have permission to delete job postings",
        },
        { status: 403 }
      );
    }

    // Find job posting
    const job = await JobPosting.findById(id);

    if (!job) {
      return NextResponse.json(
        {
          success: false,
          message: "Job posting not found",
        },
        { status: 404 }
      );
    }

    // Check if job belongs to same company
    if (String(job.companyId) !== String(user.companyId)) {
      return NextResponse.json(
        {
          success: false,
          message: "You don't have permission to delete this job posting",
        },
        { status: 403 }
      );
    }

    // Soft delete: set status to cancelled
    job.status = "cancelled";
    await job.save();

    return NextResponse.json({
      success: true,
      message: "Job posting deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting job:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to delete job posting",
      },
      { status: 500 }
    );
  }
}

