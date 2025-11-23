/**
 * Seed Departments API - TalentHR
 * Create default departments for a company
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Department from "@/models/Department";
import { authenticateRequest } from "@/lib/auth-middleware";

const DEFAULT_DEPARTMENTS = [
    { name: "Engineering", description: "Software development and technical teams" },
    { name: "Human Resources", description: "HR and people operations" },
    { name: "Sales", description: "Sales and business development" },
    { name: "Marketing", description: "Marketing and brand management" },
    { name: "Finance", description: "Finance and accounting" },
    { name: "Operations", description: "Operations and logistics" },
    { name: "Customer Support", description: "Customer service and support" },
    { name: "Product", description: "Product management and strategy" },
    { name: "Design", description: "Design and creative" },
    { name: "Legal", description: "Legal and compliance" },
];

/**
 * POST /api/seed/departments
 * Create default departments (Admin only)
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
                    message: "Only company admins can seed departments",
                },
                { status: 403 }
            );
        }

        // Check if departments already exist
        const existing = await Department.findOne({ companyId: user.companyId });
        if (existing) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Departments already exist for this company",
                },
                { status: 400 }
            );
        }

        // Create default departments
        const departments = DEFAULT_DEPARTMENTS.map((dept) => ({
            ...dept,
            companyId: user.companyId,
            status: "active",
        }));

        await Department.insertMany(departments);

        return NextResponse.json(
            {
                success: true,
                message: "Default departments created successfully",
                count: departments.length,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Seed departments error:", error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : "Internal server error",
            },
            { status: 500 }
        );
    }
}
