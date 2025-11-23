/**
 * Company Settings API - TalentHR
 * Get and update company settings
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Company from "@/models/Company";
import { authenticateRequest } from "@/lib/auth-middleware";

/**
 * GET /api/settings
 * Get company settings (Admin only)
 */
export async function GET(request: NextRequest) {
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
                    message: "Only company admins can access settings",
                },
                { status: 403 }
            );
        }

        const company = await Company.findById(user.companyId);
        if (!company) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Company not found",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            settings: {
                id: String(company._id),
                name: company.name,
                industry: company.industry,
                size: company.size,
                website: company.website,
                address: company.address,
                phone: company.phone,
                status: company.status,
            },
        });
    } catch (error) {
        console.error("Get settings error:", error);
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
 * PUT /api/settings
 * Update company settings (Admin only)
 */
export async function PUT(request: NextRequest) {
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
                    message: "Only company admins can update settings",
                },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { name, industry, size, website, address, phone } = body;

        const company = await Company.findById(user.companyId);
        if (!company) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Company not found",
                },
                { status: 404 }
            );
        }

        // Update fields
        if (name) company.name = name;
        if (industry) company.industry = industry;
        if (size) company.size = size;
        if (website) company.website = website;
        if (address) company.address = address;
        if (phone) company.phone = phone;

        await company.save();

        return NextResponse.json({
            success: true,
            message: "Settings updated successfully",
        });
    } catch (error) {
        console.error("Update settings error:", error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : "Internal server error",
            },
            { status: 500 }
        );
    }
}
