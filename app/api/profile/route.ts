/**
 * User Profile API - TalentHR
 * Get and update user profile
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Employee from "@/models/Employee";
import { authenticateRequest } from "@/lib/auth-middleware";
import bcrypt from "bcrypt";

/**
 * GET /api/profile
 * Get current user profile
 */
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const auth = await authenticateRequest(request);
        if (!auth.success) return auth.response;

        const { user } = auth.data;

        const userProfile = await User.findById(user._id).select("-password");
        const employee = await Employee.findOne({ userId: user._id }).populate("departmentId");

        return NextResponse.json({
            success: true,
            profile: {
                id: String(userProfile._id),
                name: userProfile.name,
                email: userProfile.email,
                role: userProfile.role,
                status: userProfile.status,
                employee: employee ? {
                    id: String(employee._id),
                    employeeId: employee.employeeId,
                    position: employee.position,
                    department: employee.departmentId ? {
                        id: String(employee.departmentId._id),
                        name: employee.departmentId.name,
                    } : null,
                    hireDate: employee.hireDate,
                    employmentType: employee.employmentType,
                    phone: employee.phone,
                    address: employee.address,
                    emergencyContact: employee.emergencyContact,
                } : null,
            },
        });
    } catch (error) {
        console.error("Get profile error:", error);
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
 * PUT /api/profile
 * Update user profile
 */
export async function PUT(request: NextRequest) {
    try {
        await connectDB();

        const auth = await authenticateRequest(request);
        if (!auth.success) return auth.response;

        const { user } = auth.data;
        const body = await request.json();
        const { name, phone, address, emergencyContact } = body;

        // Update user name
        if (name) {
            await User.findByIdAndUpdate(user._id, { name });
        }

        // Update employee details
        const employee = await Employee.findOne({ userId: user._id });
        if (employee) {
            if (phone) employee.phone = phone;
            if (address) employee.address = address;
            if (emergencyContact) employee.emergencyContact = emergencyContact;
            await employee.save();
        }

        return NextResponse.json({
            success: true,
            message: "Profile updated successfully",
        });
    } catch (error) {
        console.error("Update profile error:", error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : "Internal server error",
            },
            { status: 500 }
        );
    }
}
