/**
 * Leave Balance API - TalentHR
 * Get leave balance for employees
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import LeaveBalance from "@/models/LeaveBalance";
import LeaveType from "@/models/LeaveType";
import Employee from "@/models/Employee";
import { authenticateRequest } from "@/lib/auth-middleware";

/**
 * GET /api/leaves/balance
 * Get leave balance for the current user or specified employee
 */
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const auth = await authenticateRequest(request);
        if (!auth.success) return auth.response;

        const { user } = auth.data;
        const { searchParams } = new URL(request.url);

        const employeeId = searchParams.get("employeeId");
        const year = searchParams.get("year") || new Date().getFullYear();

        let targetUserId = user._id;

        // If employeeId provided, check permissions
        if (employeeId) {
            const employee = await Employee.findById(employeeId);
            if (!employee) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Employee not found",
                    },
                    { status: 404 }
                );
            }

            // Only allow if user is admin/HR or the employee's manager
            if (
                user.role !== "company_admin" &&
                user.role !== "hr_manager" &&
                String(employee.managerId) !== String(user._id)
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "You don't have permission to view this employee's balance",
                    },
                    { status: 403 }
                );
            }

            targetUserId = employee.userId;
        }

        // Get all leave balances for the user
        const balances = await LeaveBalance.find({
            userId: targetUserId,
            year: Number(year),
        }).populate("leaveTypeId", "name code color");

        // If no balances exist, create them from leave types
        if (balances.length === 0) {
            const employee = await Employee.findOne({ userId: targetUserId });
            if (!employee) {
                return NextResponse.json({
                    success: true,
                    balances: [],
                    total: 0,
                });
            }

            const leaveTypes = await LeaveType.find({
                companyId: user.companyId,
                status: "active",
            });

            const newBalances = await Promise.all(
                leaveTypes.map((lt) =>
                    LeaveBalance.create({
                        userId: targetUserId,
                        employeeId: employee._id,
                        leaveTypeId: lt._id,
                        year: Number(year),
                        totalDays: lt.annualQuota,
                        usedDays: 0,
                        pendingDays: 0,
                        carriedForward: 0,
                    })
                )
            );

            const populatedBalances = await LeaveBalance.find({
                userId: targetUserId,
                year: Number(year),
            }).populate("leaveTypeId", "name code color");

            return NextResponse.json({
                success: true,
                balances: populatedBalances.map((b: any) => ({
                    id: String(b._id),
                    leaveType: {
                        id: String(b.leaveTypeId._id),
                        name: b.leaveTypeId.name,
                        code: b.leaveTypeId.code,
                        color: b.leaveTypeId.color,
                    },
                    year: b.year,
                    totalDays: b.totalDays,
                    usedDays: b.usedDays,
                    pendingDays: b.pendingDays,
                    availableDays: b.availableDays,
                    carriedForward: b.carriedForward,
                })),
                total: populatedBalances.length,
            });
        }

        return NextResponse.json({
            success: true,
            balances: balances.map((b: any) => ({
                id: String(b._id),
                leaveType: {
                    id: String(b.leaveTypeId._id),
                    name: b.leaveTypeId.name,
                    code: b.leaveTypeId.code,
                    color: b.leaveTypeId.color,
                },
                year: b.year,
                totalDays: b.totalDays,
                usedDays: b.usedDays,
                pendingDays: b.pendingDays,
                availableDays: b.availableDays,
                carriedForward: b.carriedForward,
            })),
            total: balances.length,
        });
    } catch (error) {
        console.error("Get leave balance error:", error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : "Internal server error",
            },
            { status: 500 }
        );
    }
}
