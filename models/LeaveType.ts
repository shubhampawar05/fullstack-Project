/**
 * LeaveType Model - TalentHR
 * Defines different types of leaves (Sick, Vacation, etc.)
 */

import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILeaveType extends Document {
    companyId: mongoose.Types.ObjectId;
    name: string;
    code: string;
    annualQuota: number;
    carryForward: boolean;
    maxCarryForward?: number;
    requiresApproval: boolean;
    color: string;
    status: "active" | "inactive";
    createdAt: Date;
    updatedAt: Date;
}

const LeaveTypeSchema: Schema = new Schema(
    {
        companyId: {
            type: Schema.Types.ObjectId,
            ref: "Company",
            required: [true, "Company reference is required"],
        },
        name: {
            type: String,
            required: [true, "Leave type name is required"],
            trim: true,
            maxlength: [100, "Name must not exceed 100 characters"],
        },
        code: {
            type: String,
            required: [true, "Leave type code is required"],
            trim: true,
            uppercase: true,
            maxlength: [10, "Code must not exceed 10 characters"],
        },
        annualQuota: {
            type: Number,
            required: [true, "Annual quota is required"],
            min: [0, "Annual quota cannot be negative"],
        },
        carryForward: {
            type: Boolean,
            default: false,
        },
        maxCarryForward: {
            type: Number,
            min: [0, "Max carry forward cannot be negative"],
        },
        requiresApproval: {
            type: Boolean,
            default: true,
        },
        color: {
            type: String,
            default: "#667eea",
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },
    },
    {
        timestamps: true,
    }
);

// Create indexes
LeaveTypeSchema.index({ companyId: 1, code: 1 }, { unique: true });
LeaveTypeSchema.index({ companyId: 1, status: 1 });

// Export the model
const LeaveType: Model<ILeaveType> =
    mongoose.models.LeaveType || mongoose.model<ILeaveType>("LeaveType", LeaveTypeSchema);

export default LeaveType;
