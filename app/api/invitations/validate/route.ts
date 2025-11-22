/**
 * Validate Invitation Token API Route - TalentHR
 * Validates invitation token and returns invitation info
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Invitation from "@/models/Invitation";
import Company from "@/models/Company";
import { InvitationInfo } from "@/types/auth";

/**
 * GET /api/invitations/validate?token=abc123
 * Validate invitation token and return invitation details
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json<InvitationInfo>(
        {
          valid: false,
          message: "Invitation token is required",
        },
        { status: 400 }
      );
    }

    // Hash the token to find invitation
    const InvitationModel = Invitation as any;
    const hashedToken = InvitationModel.hashToken(token);

    // Find invitation
    const invitation = await Invitation.findOne({
      token: hashedToken,
    }).populate("companyId");

    if (!invitation) {
      return NextResponse.json<InvitationInfo>(
        {
          valid: false,
          message: "Invalid invitation token",
        },
        { status: 400 }
      );
    }

    // Check if already accepted
    if (invitation.status === "accepted") {
      return NextResponse.json<InvitationInfo>(
        {
          valid: false,
          message: "This invitation has already been accepted",
        },
        { status: 400 }
      );
    }

    // Check if cancelled
    if (invitation.status === "cancelled") {
      return NextResponse.json<InvitationInfo>(
        {
          valid: false,
          message: "This invitation has been cancelled",
        },
        { status: 400 }
      );
    }

    // Check if expired
    if (invitation.isExpired()) {
      invitation.status = "expired";
      await invitation.save();
      return NextResponse.json<InvitationInfo>(
        {
          valid: false,
          message: "This invitation has expired",
        },
        { status: 400 }
      );
    }

    // Get company info
    const company = await Company.findById(invitation.companyId);

    if (!company) {
      return NextResponse.json<InvitationInfo>(
        {
          valid: false,
          message: "Company not found",
        },
        { status: 404 }
      );
    }

    // Return valid invitation info
    return NextResponse.json<InvitationInfo>({
      valid: true,
      invitation: {
        email: invitation.email,
        role: invitation.role,
        company: {
          id: String(company._id),
          name: company.name,
          slug: company.slug,
        },
        expiresAt: invitation.expiresAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Validate invitation error:", error);
    return NextResponse.json<InvitationInfo>(
      {
        valid: false,
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

