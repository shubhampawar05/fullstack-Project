/**
 * Leave Approval API - TalentHR
 * Approve or reject leave requests
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import LeaveRequest from "@/models/LeaveRequest";
import LeaveBalance from "@/models/LeaveBalance";
import Employee from "@/models/Employee";
import { authenticateRequest } from "@/lib/auth-middleware";

/**
 * PUT /api/leaves/[id]/route
 * Update leave request (approve/reject/cancel)
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();

        const auth = await authenticateRequest(request);
        if (!auth.success) return auth.response;

        const { user } = auth.data;
        const { id } = params;
        const body = await request.json();
        const { action, comments } = body;

        const leaveRequest = await LeaveRequest.findById(id);
        if (!leaveRequest) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Leave request not found",
                },
                { status: 404 }
            );
        }

        // Handle different actions
        if (action === "approve" || action === "reject") {
            // Check permissions (Manager/HR/Admin only)
            if (
                user.role !== "company_admin" &&
                user.role !== "hr_manager" &&
                user.role !== "manager"
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "You don't have permission to approve/reject leave requests",
                    },
                    { status: 403 }
                );
            }

            // Managers can only approve their team's requests
            if (user.role === "manager") {
                const employee = await Employee.findById(leaveRequest.employeeId);
                if (!employee || String(employee.managerId) !== String(user._id)) {
                    return NextResponse.json(
                        {
                            success: false,
                            message: "You can only approve leave requests for your team members",
                        },
                        { status: 403 }
                    );
                }
            }

            if (leaveRequest.status !== "pending") {
                return NextResponse.json(
                    {
                        success: false,
                        message: `Leave request is already ${leaveRequest.status}`,
                    },
                    { status: 400 }
                );
            }

            // Update leave request
            leaveRequest.status = action === "approve" ? "approved" : "rejected";
            leaveRequest.approverId = user._id;
            leaveRequest.approverComments = comments || undefined;
            leaveRequest.approvedAt = new Date();
            await leaveRequest.save();

            // Update leave balance
            const balance = await LeaveBalance.findOne({
                userId: leaveRequest.userId,
                leaveTypeId: leaveRequest.leaveTypeId,
                year: new Date(leaveRequest.startDate).getFullYear(),
            });

            if (balance) {
                balance.pendingDays -= leaveRequest.totalDays;
                if (action === "approve") {
                    balance.usedDays += leaveRequest.totalDays;
                }
                await balance.save();
            }

            return NextResponse.json({
                success: true,
                message: `Leave request ${action}d successfully`,
                leave: {
                    id: String(leaveRequest._id),
                    status: leaveRequest.status,
                },
            });
        } else if (action === "cancel") {
            // Only the employee can cancel their own request
            if (String(leaveRequest.userId) !== String(user._id)) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "You can only cancel your own leave requests",
                    },
                    { status: 403 }
                );
            }

            if (leaveRequest.status !== "pending") {
                return NextResponse.json(
                    {
                        success: false,
                        message: `Cannot cancel ${leaveRequest.status} leave request`,
                    },
                    { status: 400 }
                );
            }

            leaveRequest.status = "cancelled";
            await leaveRequest.save();

            // Update leave balance
            const balance = await LeaveBalance.findOne({
                userId: leaveRequest.userId,
                leaveTypeId: leaveRequest.leaveTypeId,
                year: new Date(leaveRequest.startDate).getFullYear(),
            });

            if (balance) {
                balance.pendingDays -= leaveRequest.totalDays;
                await balance.save();
            }

            return NextResponse.json({
                success: true,
                message: "Leave request cancelled successfully",
                leave: {
                    id: String(leaveRequest._id),
                    status: leaveRequest.status,
                },
            });
        } else {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid action. Use 'approve', 'reject', or 'cancel'",
                },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error("Update leave request error:", error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : "Internal server error",
            },
            { status: 500 }
        );
    }
}
