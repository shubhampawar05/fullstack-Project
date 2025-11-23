/**
 * Signup API Route - TalentHR
 * Handles:
 * 1. Company Admin signup (creates company + user)
 * 2. Invitation-based signup (validates token + creates user)
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";
import { z } from "zod";
import { SignupCredentials, AuthResponse, UserRole } from "@/types/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Company from "@/models/Company";
import Employee from "@/models/Employee";
import Department from "@/models/Department";
import LeaveType from "@/models/LeaveType";
import Invitation from "@/models/Invitation";
import OTP from "@/models/OTP";
import { generateTokenPair, TokenPayload } from "@/lib/jwt";
import { authConfig } from "@/lib/config";

// Validation schema for company admin signup
const companyAdminSignupSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.literal("company_admin"),
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  otpVerified: z.boolean().optional(), // OTP verification flag
});

// Validation schema for invitation-based signup
const invitationSignupSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  token: z.string().min(1, "Invitation token is required"),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Determine signup type: company admin or invitation-based
    const isCompanyAdmin = body.role === "company_admin" && body.companyName;
    const isInvitationBased = !!body.token;

    if (isCompanyAdmin) {
      return await handleCompanyAdminSignup(body);
    } else if (isInvitationBased) {
      return await handleInvitationSignup(body);
    } else {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message:
            "Invalid signup request. Provide companyName for admin signup or token for invitation signup.",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json<AuthResponse>(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * Handle Company Admin Signup
 * Creates company + admin user
 */
async function handleCompanyAdminSignup(body: any) {
  const validationResult = companyAdminSignupSchema.safeParse(body);
  if (!validationResult.success) {
    const firstError = validationResult.error.issues[0];
    return NextResponse.json<AuthResponse>(
      {
        success: false,
        message: firstError?.message || "Validation failed",
      },
      { status: 400 }
    );
  }

  const { email, password, name, companyName } = validationResult.data;

  // Verify OTP was verified
  const otpRecord = await OTP.findOne({
    email: email.toLowerCase(),
    purpose: "company_admin_signup",
    verified: true,
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    return NextResponse.json<AuthResponse>(
      {
        success: false,
        message: "Email not verified. Please verify your email with OTP first.",
      },
      { status: 400 }
    );
  }

  // Check if OTP is still valid (not too old - e.g., within 30 minutes)
  const otpAge = Date.now() - otpRecord.createdAt.getTime();
  const maxOtpAge = 30 * 60 * 1000; // 30 minutes
  if (otpAge > maxOtpAge) {
    return NextResponse.json<AuthResponse>(
      {
        success: false,
        message: "OTP verification expired. Please verify your email again.",
      },
      { status: 400 }
    );
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return NextResponse.json<AuthResponse>(
      {
        success: false,
        message: "User with this email already exists",
      },
      { status: 409 }
    );
  }

  // Check if company name already exists (case-insensitive)
  const existingCompany = await Company.findOne({
    name: { $regex: new RegExp(`^${companyName.trim()}$`, "i") },
  });

  if (existingCompany) {
    return NextResponse.json<AuthResponse>(
      {
        success: false,
        message:
          "Company with this name already exists. Please contact support or use an invitation link.",
      },
      { status: 409 }
    );
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(
    password,
    authConfig.bcryptSaltRounds
  );

  // Create company and user atomically
  const session = await User.db.startSession();
  session.startTransaction();

  try {
    // Generate slug from company name
    const generateSlug = (name: string): string => {
      return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "") // Remove special characters
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/-+/g, "-") // Replace multiple hyphens with single
        .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
    };

    const slug = generateSlug(companyName);

    // Create company
    const company = await Company.create(
      [
        {
          name: companyName.trim(),
          slug: slug,
          status: "active",
        },
      ],
      { session }
    );

    const newCompany = company[0];

    // Create admin user
    const user = await User.create(
      [
        {
          email: email.toLowerCase(),
          password: hashedPassword,
          name: name.trim(),
          role: "company_admin",
          companyId: newCompany._id,
          status: "active",
        },
      ],
      { session }
    );

    const newUser = user[0];

    // Create employee record for the admin
    const employee = await Employee.create(
      [
        {
          userId: newUser._id,
          hireDate: new Date(),
          employmentType: "full-time",
          position: "Company Administrator",
          status: "active",
        },
      ],
      { session }
    );

    // Auto-seed departments and leave types for new company
    const DEFAULT_DEPARTMENTS = [
      { name: "Engineering", description: "Software development and technical teams", companyId: newCompany._id, status: "active" },
      { name: "Human Resources", description: "HR and people operations", companyId: newCompany._id, status: "active" },
      { name: "Sales", description: "Sales and business development", companyId: newCompany._id, status: "active" },
      { name: "Marketing", description: "Marketing and brand management", companyId: newCompany._id, status: "active" },
      { name: "Finance", description: "Finance and accounting", companyId: newCompany._id, status: "active" },
      { name: "Operations", description: "Operations and logistics", companyId: newCompany._id, status: "active" },
      { name: "Customer Support", description: "Customer service and support", companyId: newCompany._id, status: "active" },
      { name: "Product", description: "Product management and strategy", companyId: newCompany._id, status: "active" },
    ];

    const DEFAULT_LEAVE_TYPES = [
      { companyId: newCompany._id, name: "Sick Leave", code: "SL", annualQuota: 10, carryForward: false, requiresApproval: true, color: "#f44336", status: "active" },
      { companyId: newCompany._id, name: "Vacation Leave", code: "VL", annualQuota: 15, carryForward: true, maxCarryForward: 5, requiresApproval: true, color: "#2196f3", status: "active" },
      { companyId: newCompany._id, name: "Personal Leave", code: "PL", annualQuota: 5, carryForward: false, requiresApproval: true, color: "#ff9800", status: "active" },
      { companyId: newCompany._id, name: "Casual Leave", code: "CL", annualQuota: 12, carryForward: false, requiresApproval: false, color: "#4caf50", status: "active" },
    ];

    await Department.insertMany(DEFAULT_DEPARTMENTS, { session });
    await LeaveType.insertMany(DEFAULT_LEAVE_TYPES, { session });

    await session.commitTransaction();

    // Generate JWT tokens
    const tokenPayload: TokenPayload = {
      userId: String(newUser._id),
      email: newUser.email,
      role: newUser.role,
    };

    const { accessToken, refreshToken } = generateTokenPair(tokenPayload);

    // Set cookies
    const cookieStore = await cookies();
    cookieStore.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: authConfig.jwtExpiresIn,
      path: "/",
    });

    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: authConfig.jwtRefreshExpiresIn,
      path: "/",
    });

    // Return success response
    return NextResponse.json<AuthResponse>(
      {
        success: true,
        message: "Company and account created successfully",
        user: {
          id: String(newUser._id),
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          companyId: String(newCompany._id),
          company: {
            id: String(newCompany._id),
            name: newCompany.name,
            slug: newCompany.slug,
          },
          status: newUser.status,
          createdAt: newUser.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * Handle Invitation-Based Signup
 * Validates invitation token and creates user
 */
async function handleInvitationSignup(body: any) {
  const validationResult = invitationSignupSchema.safeParse(body);
  if (!validationResult.success) {
    const firstError = validationResult.error.issues[0];
    return NextResponse.json<AuthResponse>(
      {
        success: false,
        message: firstError?.message || "Validation failed",
      },
      { status: 400 }
    );
  }

  const { email, password, name, token } = validationResult.data;

  // Hash the token to find invitation (tokens are stored hashed)
  const InvitationModel = Invitation as any;
  const hashedToken = InvitationModel.hashToken(token);

  // Find invitation
  const invitation = await Invitation.findOne({
    token: hashedToken,
    status: "pending",
  }).populate("companyId");

  if (!invitation) {
    return NextResponse.json<AuthResponse>(
      {
        success: false,
        message: "Invalid or expired invitation link",
      },
      { status: 400 }
    );
  }

  // Check if invitation is expired
  if (invitation.isExpired()) {
    invitation.status = "expired";
    await invitation.save();
    return NextResponse.json<AuthResponse>(
      {
        success: false,
        message: "Invitation link has expired",
      },
      { status: 400 }
    );
  }

  // Validate email matches invitation
  if (invitation.email.toLowerCase() !== email.toLowerCase()) {
    return NextResponse.json<AuthResponse>(
      {
        success: false,
        message: "Email does not match invitation",
      },
      { status: 400 }
    );
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return NextResponse.json<AuthResponse>(
      {
        success: false,
        message: "User with this email already exists",
      },
      { status: 409 }
    );
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(
    password,
    authConfig.bcryptSaltRounds
  );

  // Create user and update invitation atomically
  const session = await User.db.startSession();
  session.startTransaction();

  try {
    // Create user
    const user = await User.create(
      [
        {
          email: email.toLowerCase(),
          password: hashedPassword,
          name: name.trim(),
          role: invitation.role,
          companyId: invitation.companyId,
          status: "active",
        },
      ],
      { session }
    );

    const newUser = user[0];

    // Mark invitation as accepted
    invitation.status = "accepted";
    invitation.acceptedAt = new Date();
    invitation.acceptedBy = newUser._id as any;
    await invitation.save({ session });

    await session.commitTransaction();

    // Generate JWT tokens
    const tokenPayload: TokenPayload = {
      userId: String(newUser._id),
      email: newUser.email,
      role: newUser.role,
    };

    const { accessToken, refreshToken } = generateTokenPair(tokenPayload);

    // Set cookies
    const cookieStore = await cookies();
    cookieStore.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: authConfig.jwtExpiresIn,
      path: "/",
    });

    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: authConfig.jwtRefreshExpiresIn,
      path: "/",
    });

    // Get company info
    const company = await Company.findById(invitation.companyId);

    // Return success response
    return NextResponse.json<AuthResponse>(
      {
        success: true,
        message: "Account created successfully",
        user: {
          id: String(newUser._id),
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          companyId: String(invitation.companyId),
          company: company
            ? {
              id: String(company._id),
              name: company.name,
              slug: company.slug,
            }
            : undefined,
          status: newUser.status,
          createdAt: newUser.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
