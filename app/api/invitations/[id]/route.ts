/**
 * Invitation Management API Route - TalentHR
 * Handles individual invitation operations (cancel, resend)
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Invitation from "@/models/Invitation";
import User from "@/models/User";
import { authenticateRequest } from "@/lib/auth-middleware";

/**
 * DELETE /api/invitations/:id
 * Cancel an invitation (Admin/HR only)
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

    // Check permissions
    if (user.role !== "company_admin" && user.role !== "hr_manager") {
      return NextResponse.json(
        {
          success: false,
          message: "You don't have permission to cancel invitations",
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    const invitationId = id;

    // Find invitation
    const invitation = await Invitation.findById(invitationId);

    if (!invitation) {
      return NextResponse.json(
        {
          success: false,
          message: "Invitation not found",
        },
        { status: 404 }
      );
    }

    // Check if invitation belongs to user's company
    if (String(invitation.companyId) !== String(user.companyId)) {
      return NextResponse.json(
        {
          success: false,
          message: "You don't have permission to cancel this invitation",
        },
        { status: 403 }
      );
    }

    // Check if already accepted
    if (invitation.status === "accepted") {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot cancel an accepted invitation",
        },
        { status: 400 }
      );
    }

    // Cancel invitation
    invitation.status = "cancelled";
    await invitation.save();

    return NextResponse.json(
      {
        success: true,
        message: "Invitation cancelled successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Cancel invitation error:", error);
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

