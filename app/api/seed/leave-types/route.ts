/**
 * Seed Leave Types API - TalentHR
 * Create default leave types for a company
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import LeaveType from "@/models/LeaveType";
import { authenticateRequest } from "@/lib/auth-middleware";

/**
 * POST /api/seed/leave-types
 * Create default leave types (Admin only)
 */
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const auth = await authenticateRequest(request);
        if (!auth.success) return auth.response;

        const { user } = auth.data;

        // Check permissions
        if (user.role !== "company_admin") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Only company admins can seed leave types",
                },
                { status: 403 }
            );
        }

        // Check if leave types already exist
        const existing = await LeaveType.findOne({ companyId: user.companyId });
        if (existing) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Leave types already exist for this company",
                },
                { status: 400 }
            );
        }

        // Default leave types
        const defaultLeaveTypes = [
            {
                companyId: user.companyId,
                name: "Sick Leave",
                code: "SL",
                annualQuota: 10,
                carryForward: false,
                requiresApproval: true,
                color: "#f44336",
                status: "active",
            },
            {
                companyId: user.companyId,
                name: "Vacation Leave",
                code: "VL",
                annualQuota: 15,
                carryForward: true,
                maxCarryForward: 5,
                requiresApproval: true,
                color: "#2196f3",
                status: "active",
            },
            {
                companyId: user.companyId,
                name: "Personal Leave",
                code: "PL",
                annualQuota: 5,
                carryForward: false,
                requiresApproval: true,
                color: "#ff9800",
                status: "active",
            },
            {
                companyId: user.companyId,
                name: "Casual Leave",
                code: "CL",
                annualQuota: 12,
                carryForward: false,
                requiresApproval: false,
                color: "#4caf50",
                status: "active",
            },
        ];

        await LeaveType.insertMany(defaultLeaveTypes);

        return NextResponse.json(
            {
                success: true,
                message: "Default leave types created successfully",
                count: defaultLeaveTypes.length,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Seed leave types error:", error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : "Internal server error",
            },
            { status: 500 }
        );
    }
}
