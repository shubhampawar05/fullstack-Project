/**
 * Leave Requests API - TalentHR
 * Handle leave request creation, listing, and management
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import LeaveRequest from "@/models/LeaveRequest";
import LeaveBalance from "@/models/LeaveBalance";
import LeaveType from "@/models/LeaveType";
import Employee from "@/models/Employee";
import User from "@/models/User";
import { authenticateRequest } from "@/lib/auth-middleware";

/**
 * GET /api/leaves
 * List leave requests with filters
 */
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const auth = await authenticateRequest(request);
        if (!auth.success) return auth.response;

        const { user } = auth.data;
        const { searchParams } = new URL(request.url);

        const status = searchParams.get("status");
        const employeeId = searchParams.get("employeeId");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        // Build query
        const query: any = {};

        // Role-based access
        if (user.role === "employee") {
            query.userId = user._id;
        } else if (user.role === "manager") {
            const managedEmployees = await Employee.find({ managerId: user._id }).select("userId");
            const userIds = managedEmployees.map((e) => e.userId);
            query.userId = { $in: [...userIds, user._id] };
        } else if (user.role === "company_admin" || user.role === "hr_manager") {
            const companyUsers = await User.find({ companyId: user.companyId }).select("_id");
            const userIds = companyUsers.map((u) => u._id);
            query.userId = { $in: userIds };
        }

        // Apply filters
        if (status) query.status = status;
        if (employeeId) {
            const employee = await Employee.findById(employeeId);
            if (employee) query.userId = employee.userId;
        }
        if (startDate || endDate) {
            query.startDate = {};
            if (startDate) query.startDate.$gte = new Date(startDate);
            if (endDate) query.startDate.$lte = new Date(endDate);
        }

        const leaves = await LeaveRequest.find(query)
            .populate("userId", "name email")
            .populate("employeeId", "employeeId position")
            .populate("leaveTypeId", "name code color")
            .populate("approverId", "name email")
            .sort({ createdAt: -1 })
            .limit(100);

        return NextResponse.json({
            success: true,
            leaves: leaves.map((l: any) => ({
                id: String(l._id),
                userId: String(l.userId._id),
                userName: l.userId.name,
                userEmail: l.userId.email,
                employeeId: l.employeeId?.employeeId,
                position: l.employeeId?.position,
                leaveType: {
                    id: String(l.leaveTypeId._id),
                    name: l.leaveTypeId.name,
                    code: l.leaveTypeId.code,
                    color: l.leaveTypeId.color,
                },
                startDate: l.startDate.toISOString(),
                endDate: l.endDate.toISOString(),
                totalDays: l.totalDays,
                reason: l.reason,
                status: l.status,
                approver: l.approverId ? {
                    id: String(l.approverId._id),
                    name: l.approverId.name,
                } : null,
                approverComments: l.approverComments,
                approvedAt: l.approvedAt?.toISOString(),
                createdAt: l.createdAt.toISOString(),
            })),
            total: leaves.length,
        });
    } catch (error) {
        console.error("Get leaves error:", error);
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
 * POST /api/leaves
 * Create a new leave request
 */
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const auth = await authenticateRequest(request);
        if (!auth.success) return auth.response;

        const { user } = auth.data;
        const body = await request.json();
        const { leaveTypeId, startDate, endDate, totalDays, reason } = body;

        // Get employee record
        const employee = await Employee.findOne({ userId: user._id });
        if (!employee) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Employee record not found",
                },
                { status: 404 }
            );
        }

        // Validate leave type
        const leaveType = await LeaveType.findById(leaveTypeId);
        if (!leaveType || String(leaveType.companyId) !== String(user.companyId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid leave type",
                },
                { status: 400 }
            );
        }

        // Check leave balance
        const currentYear = new Date().getFullYear();
        let balance = await LeaveBalance.findOne({
            userId: user._id,
            leaveTypeId,
            year: currentYear,
        });

        // Create balance if doesn't exist
        if (!balance) {
            balance = await LeaveBalance.create({
                userId: user._id,
                employeeId: employee._id,
                leaveTypeId,
                year: currentYear,
                totalDays: leaveType.annualQuota,
                usedDays: 0,
                pendingDays: 0,
                carriedForward: 0,
            });
        }

        // Check if enough balance
        if (balance.availableDays < totalDays) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Insufficient leave balance. Available: ${balance.availableDays} days`,
                },
                { status: 400 }
            );
        }

        // Create leave request
        const leaveRequest = await LeaveRequest.create({
            userId: user._id,
            employeeId: employee._id,
            leaveTypeId,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            totalDays,
            reason,
            status: "pending",
        });

        // Update pending days in balance
        balance.pendingDays += totalDays;
        await balance.save();

        return NextResponse.json(
            {
                success: true,
                message: "Leave request submitted successfully",
                leave: {
                    id: String(leaveRequest._id),
                    status: leaveRequest.status,
                    totalDays: leaveRequest.totalDays,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Create leave request error:", error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : "Internal server error",
            },
            { status: 500 }
        );
    }
}
