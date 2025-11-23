/**
 * LeaveRequest Model - TalentHR
 * Manages employee leave requests and approvals
 */

import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILeaveRequest extends Document {
    userId: mongoose.Types.ObjectId;
    employeeId: mongoose.Types.ObjectId;
    leaveTypeId: mongoose.Types.ObjectId;
    startDate: Date;
    endDate: Date;
    totalDays: number;
    reason: string;
    status: "pending" | "approved" | "rejected" | "cancelled";
    approverId?: mongoose.Types.ObjectId;
    approverComments?: string;
    approvedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const LeaveRequestSchema: Schema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User reference is required"],
        },
        employeeId: {
            type: Schema.Types.ObjectId,
            ref: "Employee",
            required: [true, "Employee reference is required"],
        },
        leaveTypeId: {
            type: Schema.Types.ObjectId,
            ref: "LeaveType",
            required: [true, "Leave type reference is required"],
        },
        startDate: {
            type: Date,
            required: [true, "Start date is required"],
        },
        endDate: {
            type: Date,
            required: [true, "End date is required"],
        },
        totalDays: {
            type: Number,
            required: [true, "Total days is required"],
            min: [0.5, "Total days must be at least 0.5"],
        },
        reason: {
            type: String,
            required: [true, "Reason is required"],
            trim: true,
            maxlength: [500, "Reason must not exceed 500 characters"],
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected", "cancelled"],
            default: "pending",
        },
        approverId: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        approverComments: {
            type: String,
            trim: true,
            maxlength: [500, "Comments must not exceed 500 characters"],
        },
        approvedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Create indexes
LeaveRequestSchema.index({ userId: 1, createdAt: -1 });
LeaveRequestSchema.index({ employeeId: 1, status: 1 });
LeaveRequestSchema.index({ status: 1, createdAt: -1 });
LeaveRequestSchema.index({ startDate: 1, endDate: 1 });

// Validate end date is after start date
LeaveRequestSchema.pre("save", function (next) {
    if (this.endDate < this.startDate) {
        next(new Error("End date must be after start date"));
    } else {
        next();
    }
});

// Export the model
const LeaveRequest: Model<ILeaveRequest> =
    mongoose.models.LeaveRequest || mongoose.model<ILeaveRequest>("LeaveRequest", LeaveRequestSchema);

export default LeaveRequest;
