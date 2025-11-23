/**
 * Leave Types API - TalentHR
 * Manage leave types (Sick, Vacation, etc.)
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import LeaveType from "@/models/LeaveType";
import { authenticateRequest } from "@/lib/auth-middleware";

/**
 * GET /api/leave-types
 * List all active leave types for the company
 */
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const auth = await authenticateRequest(request);
        if (!auth.success) return auth.response;

        const { user } = auth.data;

        const leaveTypes = await LeaveType.find({
            companyId: user.companyId,
            status: "active",
        }).sort({ name: 1 });

        return NextResponse.json({
            success: true,
            leaveTypes: leaveTypes.map((lt: any) => ({
                id: String(lt._id),
                name: lt.name,
                code: lt.code,
                annualQuota: lt.annualQuota,
                carryForward: lt.carryForward,
                maxCarryForward: lt.maxCarryForward,
                requiresApproval: lt.requiresApproval,
                color: lt.color,
                status: lt.status,
            })),
            total: leaveTypes.length,
        });
    } catch (error) {
        console.error("Get leave types error:", error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : "Internal server error",
            },
            { status: 500 }
        );
    }
}

/**
 * POST /api/leave-types
 * Create a new leave type (Admin/HR only)
 */
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const auth = await authenticateRequest(request);
        if (!auth.success) return auth.response;

        const { user } = auth.data;

        // Check permissions
        if (user.role !== "company_admin" && user.role !== "hr_manager") {
            return NextResponse.json(
                {
                    success: false,
                    message: "You don't have permission to create leave types",
                },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { name, code, annualQuota, carryForward, maxCarryForward, requiresApproval, color } = body;

        // Check if leave type with same code exists
        const existing = await LeaveType.findOne({
            companyId: user.companyId,
            code: code.toUpperCase(),
        });

        if (existing) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Leave type with this code already exists",
                },
                { status: 409 }
            );
        }

        const leaveType = await LeaveType.create({
            companyId: user.companyId,
            name,
            code: code.toUpperCase(),
            annualQuota,
            carryForward: carryForward || false,
            maxCarryForward: maxCarryForward || undefined,
            requiresApproval: requiresApproval !== false,
            color: color || "#667eea",
            status: "active",
        });

        return NextResponse.json(
            {
                success: true,
                message: "Leave type created successfully",
                leaveType: {
                    id: String(leaveType._id),
                    name: leaveType.name,
                    code: leaveType.code,
                    annualQuota: leaveType.annualQuota,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Create leave type error:", error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : "Internal server error",
            },
            { status: 500 }
        );
    }
}
