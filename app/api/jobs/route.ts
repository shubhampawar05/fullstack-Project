/**
 * Jobs API Route - TalentHR
 * Handles job posting listing and creation
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import JobPosting from "@/models/JobPosting";
import { authenticateRequest } from "@/lib/auth-middleware";

/**
 * GET /api/jobs
 * List all job postings in the company
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
    const status = searchParams.get("status");
    const departmentId = searchParams.get("departmentId");
    const employmentType = searchParams.get("employmentType");
    const search = searchParams.get("search");

    // Build query
    const query: any = {
      companyId: user.companyId,
    };

    if (status) {
      query.status = status;
    }

    if (departmentId) {
      query.departmentId = departmentId;
    }

    if (employmentType) {
      query.employmentType = employmentType;
    }

    // Get job postings
    let jobs = await JobPosting.find(query)
      .populate("departmentId", "name code")
      .populate("postedBy", "name email")
      .sort({ createdAt: -1 });

    // Filter by search term if provided
    if (search) {
      const searchLower = search.toLowerCase();
      jobs = jobs.filter((job: any) => {
        return (
          job.title?.toLowerCase().includes(searchLower) ||
          job.description?.toLowerCase().includes(searchLower) ||
          job.location?.toLowerCase().includes(searchLower) ||
          job.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower))
        );
      });
    }

    // Get applications count for each job
    const Candidate = (await import("@/models/Candidate")).default;
    const jobsWithCounts = await Promise.all(
      jobs.map(async (job: any) => {
        const count = await Candidate.countDocuments({
          jobPostingId: job._id,
        });
        return {
          id: String(job._id),
          title: job.title,
          description: job.description,
          departmentId: job.departmentId ? String(job.departmentId._id || job.departmentId) : null,
          department: job.departmentId
            ? {
                id: String(job.departmentId._id || job.departmentId),
                name: job.departmentId.name,
                code: job.departmentId.code,
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
            id: String(job.postedBy._id || job.postedBy),
            name: job.postedBy.name,
            email: job.postedBy.email,
          },
          status: job.status,
          applicationDeadline: job.applicationDeadline,
          numberOfOpenings: job.numberOfOpenings,
          experienceLevel: job.experienceLevel,
          tags: job.tags || [],
          views: job.views || 0,
          applicationsCount: count,
          createdAt: job.createdAt,
          updatedAt: job.updatedAt,
        };
      })
    );

    return NextResponse.json({
      success: true,
      jobs: jobsWithCounts,
    });
  } catch (error: any) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch jobs",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/jobs
 * Create a new job posting (Admin/HR/Recruiter only)
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
          message: "You don't have permission to create job postings",
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

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json(
        {
          success: false,
          message: "Title and description are required",
        },
        { status: 400 }
      );
    }

    // Create job posting
    const jobPosting = new JobPosting({
      companyId: user.companyId,
      title,
      description,
      departmentId: departmentId || undefined,
      employmentType: employmentType || "full-time",
      location: location || undefined,
      remote: remote || false,
      salaryRange: salaryRange || undefined,
      requirements: requirements || [],
      responsibilities: responsibilities || [],
      qualifications: qualifications || [],
      postedBy: user._id,
      status: status || "draft",
      applicationDeadline: applicationDeadline || undefined,
      numberOfOpenings: numberOfOpenings || 1,
      experienceLevel: experienceLevel || undefined,
      tags: tags || [],
      views: 0,
    });

    await jobPosting.save();

    // Populate references
    await jobPosting.populate("departmentId", "name code");
    await jobPosting.populate("postedBy", "name email");

    return NextResponse.json(
      {
        success: true,
        message: "Job posting created successfully",
        job: {
          id: String(jobPosting._id),
          title: jobPosting.title,
          description: jobPosting.description,
          departmentId: jobPosting.departmentId
            ? String(jobPosting.departmentId._id || jobPosting.departmentId)
            : null,
          department: jobPosting.departmentId
            ? {
                id: String((jobPosting.departmentId as any)._id || jobPosting.departmentId),
                name: (jobPosting.departmentId as any).name,
                code: (jobPosting.departmentId as any).code,
              }
            : null,
          employmentType: jobPosting.employmentType,
          location: jobPosting.location,
          remote: jobPosting.remote,
          salaryRange: jobPosting.salaryRange,
          requirements: jobPosting.requirements || [],
          responsibilities: jobPosting.responsibilities || [],
          qualifications: jobPosting.qualifications || [],
          postedBy: {
            id: String((jobPosting.postedBy as any)._id || jobPosting.postedBy),
            name: (jobPosting.postedBy as any).name,
            email: (jobPosting.postedBy as any).email,
          },
          status: jobPosting.status,
          applicationDeadline: jobPosting.applicationDeadline,
          numberOfOpenings: jobPosting.numberOfOpenings,
          experienceLevel: jobPosting.experienceLevel,
          tags: jobPosting.tags || [],
          views: jobPosting.views || 0,
          applicationsCount: 0,
          createdAt: jobPosting.createdAt,
          updatedAt: jobPosting.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating job posting:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create job posting",
      },
      { status: 500 }
    );
  }
}

