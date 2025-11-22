/**
 * Invitations API Route - TalentHR
 * Handles invitation creation and listing
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Invitation from "@/models/Invitation";
import User from "@/models/User";
import Company from "@/models/Company";
import { authenticateRequest } from "@/lib/auth-middleware";
import { sendInvitationEmail } from "@/lib/email";
import { z } from "zod";

// Validation schema for creating invitation
const createInvitationSchema = z.object({
  email: z.string().email("Invalid email format"),
  role: z.enum(["hr_manager", "recruiter", "manager", "employee"], {
    message: "Invalid role. Must be hr_manager, recruiter, manager, or employee",
  }),
});

/**
 * POST /api/invitations
 * Create a new invitation (Admin/HR only)
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Authenticate request
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    const { user } = auth.data;

    // Check permissions: Only company_admin and hr_manager can create invitations
    if (user.role !== "company_admin" && user.role !== "hr_manager") {
      return NextResponse.json(
        {
          success: false,
          message: "You don't have permission to create invitations",
        },
        { status: 403 }
      );
    }

    // Check role permissions for who can invite what
    const body = await request.json();
    const validationResult = createInvitationSchema.safeParse(body);

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

    const { email, role } = validationResult.data;

    // HR Manager can only invite: recruiter, manager, employee (not hr_manager)
    if (user.role === "hr_manager" && role === "hr_manager") {
      return NextResponse.json(
        {
          success: false,
          message: "HR Managers cannot invite other HR Managers",
        },
        { status: 403 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
      companyId: user.companyId,
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User with this email already exists in your company",
        },
        { status: 409 }
      );
    }

    // Check if pending invitation already exists
    const existingInvitation = await Invitation.findOne({
      companyId: user.companyId,
      email: email.toLowerCase(),
      status: "pending",
    });

    if (existingInvitation) {
      // Check if expired
      if (existingInvitation.isExpired()) {
        existingInvitation.status = "expired";
        await existingInvitation.save();
      } else {
        return NextResponse.json(
          {
            success: false,
            message: "A pending invitation already exists for this email",
          },
          { status: 409 }
        );
      }
    }

    // Generate secure token
    const InvitationModel = Invitation as any;
    const rawToken = InvitationModel.generateToken();
    const hashedToken = InvitationModel.hashToken(rawToken);

    // Create invitation
    const invitation = await Invitation.create({
      companyId: user.companyId,
      email: email.toLowerCase(),
      role: role,
      invitedBy: user._id,
      token: hashedToken,
      rawToken: rawToken, // Store raw token for link generation (only accessible to admins)
      status: "pending",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    // Get company info
    const company = await Company.findById(user.companyId);
    if (!company) {
      return NextResponse.json(
        {
          success: false,
          message: "Company not found",
        },
        { status: 404 }
      );
    }

    // Generate invitation link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const invitationLink = `${baseUrl}/signup?token=${rawToken}`;

    // Send invitation email
    try {
      const invitedByName = user.name || user.email;
      await sendInvitationEmail(
        email.toLowerCase(),
        invitationLink,
        role,
        company.name,
        invitedByName
      );
    } catch (emailError) {
      console.error("Failed to send invitation email:", emailError);
      // Still return success if email fails (for development)
      // In production, you might want to log this but still create the invitation
      if (process.env.NODE_ENV === "production") {
        // Log error but don't fail the invitation creation
        console.error("Invitation created but email failed to send");
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Invitation created and sent successfully",
        invitation: {
          id: String(invitation._id),
          email: invitation.email,
          role: invitation.role,
          link: invitationLink,
          expiresAt: invitation.expiresAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create invitation error:", error);
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

/**
 * GET /api/invitations
 * List all invitations for the company (Admin/HR only)
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Authenticate request
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    const { user } = auth.data;

    // Check permissions
    if (user.role !== "company_admin" && user.role !== "hr_manager") {
      return NextResponse.json(
        {
          success: false,
          message: "You don't have permission to view invitations",
        },
        { status: 403 }
      );
    }

    // Get all invitations for the company (include rawToken for link generation)
    const invitations = await Invitation.find({
      companyId: user.companyId,
    })
      .select("+rawToken") // Include rawToken field
      .populate("invitedBy", "name email")
      .sort({ createdAt: -1 });

    // Check and update expired invitations
    const now = new Date();
    for (const invitation of invitations) {
      if (invitation.status === "pending" && invitation.expiresAt < now) {
        invitation.status = "expired";
        await invitation.save();
      }
    }

    // Get base URL for links
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    return NextResponse.json({
      success: true,
      invitations: invitations.map((inv: any) => {
        const link = inv.rawToken
          ? `${baseUrl}/signup?token=${inv.rawToken}`
          : null;

        return {
          id: String(inv._id),
          email: inv.email,
          role: inv.role,
          status: inv.status,
          invitedBy: inv.invitedBy,
          link: link, // Include invitation link
          expiresAt: inv.expiresAt.toISOString(),
          acceptedAt: inv.acceptedAt?.toISOString(),
          createdAt: inv.createdAt.toISOString(),
        };
      }),
    });
  } catch (error) {
    console.error("Get invitations error:", error);
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

