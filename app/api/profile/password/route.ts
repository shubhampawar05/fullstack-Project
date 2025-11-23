/**
 * Password Change API - TalentHR
 * Change user password
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { authenticateRequest } from "@/lib/auth-middleware";
import bcrypt from "bcrypt";

/**
 * PUT /api/profile/password
 * Change user password
 */
export async function PUT(request: NextRequest) {
    try {
        await connectDB();

        const auth = await authenticateRequest(request);
        if (!auth.success) return auth.response;

        const { user } = auth.data;
        const body = await request.json();
        const { currentPassword, newPassword } = body;

        // Get user with password
        const userDoc = await User.findById(user._id).select("+password");
        if (!userDoc) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found",
                },
                { status: 404 }
            );
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, userDoc.password);
        if (!isPasswordValid) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Current password is incorrect",
                },
                { status: 401 }
            );
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        userDoc.password = hashedPassword;
        await userDoc.save();

        return NextResponse.json({
            success: true,
            message: "Password changed successfully",
        });
    } catch (error) {
        console.error("Change password error:", error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : "Internal server error",
            },
            { status: 500 }
        );
    }
}
