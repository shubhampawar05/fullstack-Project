/**
 * Seed Recruitment Data API Route - TalentHR
 * Populates database with dummy recruitment data for testing
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import JobPosting from "@/models/JobPosting";
import Candidate from "@/models/Candidate";
import Interview from "@/models/Interview";
import Department from "@/models/Department";
import User from "@/models/User";
import { authenticateRequest } from "@/lib/auth-middleware";

/**
 * POST /api/seed/recruitment
 * Seed database with dummy recruitment data
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Authenticate request
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    const { user } = auth.data;

    // Check permissions (Admin/HR/Recruiter only)
    if (
      user.role !== "company_admin" &&
      user.role !== "hr_manager" &&
      user.role !== "recruiter"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "You don't have permission to seed data",
        },
        { status: 403 }
      );
    }

    // Get company departments
    const departments = await Department.find({
      companyId: user.companyId,
      status: "active",
    }).limit(3);

    // Get recruiter users
    const recruiters = await User.find({
      companyId: user.companyId,
      role: { $in: ["recruiter", "hr_manager", "company_admin"] },
      status: "active",
    }).limit(2);

    if (recruiters.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No recruiters found. Please create a recruiter user first.",
        },
        { status: 400 }
      );
    }

    const recruiter = recruiters[0];

    // Sample job postings data
    const jobPostingsData = [
      {
        companyId: user.companyId,
        title: "Senior Full Stack Developer",
        description:
          "We are looking for an experienced Full Stack Developer to join our dynamic team. You will be responsible for developing and maintaining web applications using modern technologies.",
        departmentId: departments[0]?._id || null,
        employmentType: "full-time",
        location: "San Francisco, CA",
        remote: true,
        salaryRange: {
          min: 120000,
          max: 180000,
          currency: "USD",
        },
        requirements: [
          "5+ years of experience in full stack development",
          "Proficiency in React, Node.js, and TypeScript",
          "Experience with MongoDB and PostgreSQL",
          "Strong problem-solving skills",
        ],
        responsibilities: [
          "Design and develop scalable web applications",
          "Collaborate with cross-functional teams",
          "Write clean, maintainable code",
          "Participate in code reviews",
        ],
        qualifications: [
          "Bachelor's degree in Computer Science or related field",
          "Experience with cloud platforms (AWS, Azure, or GCP)",
          "Strong communication skills",
        ],
        postedBy: recruiter._id,
        status: "published",
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        numberOfOpenings: 2,
        experienceLevel: "senior",
        tags: ["react", "nodejs", "typescript", "mongodb", "fullstack"],
        views: 0,
      },
      {
        companyId: user.companyId,
        title: "Product Manager",
        description:
          "Join our product team as a Product Manager. You will work closely with engineering, design, and business teams to define and execute product strategy.",
        departmentId: departments[1]?._id || null,
        employmentType: "full-time",
        location: "New York, NY",
        remote: false,
        salaryRange: {
          min: 100000,
          max: 150000,
          currency: "USD",
        },
        requirements: [
          "3+ years of product management experience",
          "Strong analytical and strategic thinking",
          "Experience with agile methodologies",
        ],
        responsibilities: [
          "Define product roadmap and strategy",
          "Work with engineering teams on feature development",
          "Conduct user research and gather feedback",
          "Prioritize features and manage backlog",
        ],
        qualifications: [
          "MBA or equivalent experience",
          "Experience in SaaS products",
          "Excellent communication and leadership skills",
        ],
        postedBy: recruiter._id,
        status: "published",
        applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        numberOfOpenings: 1,
        experienceLevel: "mid",
        tags: ["product", "management", "strategy", "saas"],
        views: 0,
      },
      {
        companyId: user.companyId,
        title: "UX Designer",
        description:
          "We're seeking a talented UX Designer to create intuitive and engaging user experiences for our digital products.",
        departmentId: departments[0]?._id || null,
        employmentType: "full-time",
        location: "Remote",
        remote: true,
        salaryRange: {
          min: 80000,
          max: 120000,
          currency: "USD",
        },
        requirements: [
          "3+ years of UX design experience",
          "Portfolio demonstrating strong design skills",
          "Proficiency in Figma, Sketch, or Adobe XD",
        ],
        responsibilities: [
          "Create user flows and wireframes",
          "Design user interfaces and prototypes",
          "Conduct user research and usability testing",
          "Collaborate with developers on implementation",
        ],
        qualifications: [
          "Bachelor's degree in Design or related field",
          "Experience with design systems",
          "Strong portfolio of work",
        ],
        postedBy: recruiter._id,
        status: "published",
        applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        numberOfOpenings: 1,
        experienceLevel: "mid",
        tags: ["ux", "design", "figma", "ui", "user-experience"],
        views: 0,
      },
      {
        companyId: user.companyId,
        title: "DevOps Engineer",
        description:
          "Looking for a DevOps Engineer to help build and maintain our cloud infrastructure and CI/CD pipelines.",
        departmentId: departments[2]?._id || null,
        employmentType: "full-time",
        location: "Austin, TX",
        remote: true,
        salaryRange: {
          min: 110000,
          max: 160000,
          currency: "USD",
        },
        requirements: [
          "4+ years of DevOps experience",
          "Experience with AWS, Docker, and Kubernetes",
          "Strong knowledge of CI/CD pipelines",
        ],
        responsibilities: [
          "Manage cloud infrastructure",
          "Build and maintain CI/CD pipelines",
          "Monitor system performance and reliability",
          "Automate deployment processes",
        ],
        qualifications: [
          "Experience with Terraform or CloudFormation",
          "Knowledge of monitoring tools (Datadog, New Relic, etc.)",
          "Strong scripting skills (Python, Bash)",
        ],
        postedBy: recruiter._id,
        status: "draft",
        applicationDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        numberOfOpenings: 1,
        experienceLevel: "senior",
        tags: ["devops", "aws", "kubernetes", "docker", "ci-cd"],
        views: 0,
      },
    ];

    // Create job postings
    const createdJobs = await JobPosting.insertMany(jobPostingsData);

    // Sample candidates data
    const candidatesData = [
      {
        jobPostingId: createdJobs[0]._id,
        companyId: user.companyId,
        firstName: "John",
        lastName: "Smith",
        email: "john.smith@example.com",
        phone: "+1-555-0101",
        experience: 6,
        currentPosition: "Full Stack Developer",
        currentCompany: "Tech Corp",
        expectedSalary: {
          min: 130000,
          max: 170000,
          currency: "USD",
        },
        noticePeriod: 30,
        availability: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: "interview",
        stage: "technical",
        source: "LinkedIn",
        recruiterId: recruiter._id,
        notes: "Strong technical background, good communication skills",
        rating: 4,
        skills: ["React", "Node.js", "TypeScript", "MongoDB", "AWS"],
        appliedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        jobPostingId: createdJobs[0]._id,
        companyId: user.companyId,
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah.johnson@example.com",
        phone: "+1-555-0102",
        experience: 5,
        currentPosition: "Software Engineer",
        currentCompany: "StartupXYZ",
        expectedSalary: {
          min: 120000,
          max: 160000,
          currency: "USD",
        },
        noticePeriod: 14,
        availability: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: "screening",
        stage: "phone-screen",
        source: "Company Website",
        recruiterId: recruiter._id,
        notes: "Good portfolio, needs technical assessment",
        rating: 3,
        skills: ["React", "JavaScript", "Python", "PostgreSQL"],
        appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        jobPostingId: createdJobs[1]._id,
        companyId: user.companyId,
        firstName: "Michael",
        lastName: "Chen",
        email: "michael.chen@example.com",
        phone: "+1-555-0103",
        experience: 4,
        currentPosition: "Product Manager",
        currentCompany: "BigTech Inc",
        expectedSalary: {
          min: 110000,
          max: 140000,
          currency: "USD",
        },
        noticePeriod: 30,
        availability: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: "offer",
        stage: "offer",
        source: "Referral",
        recruiterId: recruiter._id,
        notes: "Excellent candidate, ready to make offer",
        rating: 5,
        skills: ["Product Strategy", "Agile", "Analytics", "User Research"],
        appliedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      },
      {
        jobPostingId: createdJobs[1]._id,
        companyId: user.companyId,
        firstName: "Emily",
        lastName: "Davis",
        email: "emily.davis@example.com",
        phone: "+1-555-0104",
        experience: 3,
        currentPosition: "Associate Product Manager",
        currentCompany: "MidSize Co",
        expectedSalary: {
          min: 95000,
          max: 120000,
          currency: "USD",
        },
        noticePeriod: 21,
        availability: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        status: "interview",
        stage: "final",
        source: "LinkedIn",
        recruiterId: recruiter._id,
        notes: "Promising candidate, final round scheduled",
        rating: 4,
        skills: ["Product Management", "Data Analysis", "User Stories"],
        appliedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      },
      {
        jobPostingId: createdJobs[2]._id,
        companyId: user.companyId,
        firstName: "David",
        lastName: "Wilson",
        email: "david.wilson@example.com",
        phone: "+1-555-0105",
        experience: 4,
        currentPosition: "UI/UX Designer",
        currentCompany: "Design Studio",
        expectedSalary: {
          min: 85000,
          max: 110000,
          currency: "USD",
        },
        noticePeriod: 14,
        availability: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: "applied",
        stage: "application",
        source: "Company Website",
        recruiterId: recruiter._id,
        notes: "Recently applied, portfolio review pending",
        rating: 3,
        skills: ["Figma", "Sketch", "User Research", "Prototyping"],
        appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        jobPostingId: createdJobs[2]._id,
        companyId: user.companyId,
        firstName: "Lisa",
        lastName: "Anderson",
        email: "lisa.anderson@example.com",
        phone: "+1-555-0106",
        experience: 5,
        currentPosition: "Senior UX Designer",
        currentCompany: "Creative Agency",
        expectedSalary: {
          min: 100000,
          max: 130000,
          currency: "USD",
        },
        noticePeriod: 30,
        availability: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: "screening",
        stage: "phone-screen",
        source: "LinkedIn",
        recruiterId: recruiter._id,
        notes: "Impressive portfolio, scheduling phone screen",
        rating: 4,
        skills: ["UX Design", "User Research", "Figma", "Design Systems"],
        appliedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    ];

    // Create candidates
    const createdCandidates = await Candidate.insertMany(candidatesData);

    // Sample interviews data
    const interviewsData = [
      {
        candidateId: createdCandidates[0]._id,
        jobPostingId: createdJobs[0]._id,
        companyId: user.companyId,
        type: "technical",
        scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        duration: 60,
        location: "Conference Room A",
        isRemote: false,
        interviewers: [recruiter._id],
        organizerId: recruiter._id,
        status: "scheduled",
        notes: "Technical assessment and coding challenge",
        reminderSent: false,
      },
      {
        candidateId: createdCandidates[1]._id,
        jobPostingId: createdJobs[0]._id,
        companyId: user.companyId,
        type: "phone-screen",
        scheduledAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        duration: 30,
        location: "Zoom",
        isRemote: true,
        interviewers: [recruiter._id],
        organizerId: recruiter._id,
        status: "scheduled",
        notes: "Initial phone screening",
        reminderSent: false,
      },
      {
        candidateId: createdCandidates[2]._id,
        jobPostingId: createdJobs[1]._id,
        companyId: user.companyId,
        type: "final",
        scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        duration: 45,
        location: "Main Office",
        isRemote: false,
        interviewers: [recruiter._id],
        organizerId: recruiter._id,
        status: "completed",
        notes: "Final round interview completed successfully",
        reminderSent: true,
        feedback: [
          {
            interviewerId: recruiter._id,
            rating: 5,
            notes: "Excellent candidate, highly recommended",
            strengths: ["Strong communication", "Great product sense"],
            weaknesses: [],
            recommendation: "hire",
            submittedAt: new Date(),
          },
        ],
      },
      {
        candidateId: createdCandidates[3]._id,
        jobPostingId: createdJobs[1]._id,
        companyId: user.companyId,
        type: "final",
        scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        duration: 45,
        location: "Zoom",
        isRemote: true,
        interviewers: [recruiter._id],
        organizerId: recruiter._id,
        status: "scheduled",
        notes: "Final round interview",
        reminderSent: false,
      },
      {
        candidateId: createdCandidates[4]._id,
        jobPostingId: createdJobs[2]._id,
        companyId: user.companyId,
        type: "behavioral",
        scheduledAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
        duration: 45,
        location: "Zoom",
        isRemote: true,
        interviewers: [recruiter._id],
        organizerId: recruiter._id,
        status: "scheduled",
        notes: "Portfolio review and behavioral interview",
        reminderSent: false,
      },
    ];

    // Create interviews
    const createdInterviews = await Interview.insertMany(interviewsData);

    return NextResponse.json({
      success: true,
      message: "Recruitment data seeded successfully",
      data: {
        jobs: createdJobs.length,
        candidates: createdCandidates.length,
        interviews: createdInterviews.length,
      },
    });
  } catch (error: any) {
    console.error("Error seeding recruitment data:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to seed recruitment data",
      },
      { status: 500 }
    );
  }
}

