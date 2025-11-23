/**
 * LeaveBalance Model - TalentHR
 * Tracks employee leave balances per leave type
 */

import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILeaveBalance extends Document {
    userId: mongoose.Types.ObjectId;
    employeeId: mongoose.Types.ObjectId;
    leaveTypeId: mongoose.Types.ObjectId;
    year: number;
    totalDays: number;
    usedDays: number;
    pendingDays: number;
    carriedForward: number;
    availableDays: number;
    createdAt: Date;
    updatedAt: Date;
}

const LeaveBalanceSchema: Schema = new Schema(
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
        year: {
            type: Number,
            required: [true, "Year is required"],
        },
        totalDays: {
            type: Number,
            required: [true, "Total days is required"],
            min: [0, "Total days cannot be negative"],
        },
        usedDays: {
            type: Number,
            default: 0,
            min: [0, "Used days cannot be negative"],
        },
        pendingDays: {
            type: Number,
            default: 0,
            min: [0, "Pending days cannot be negative"],
        },
        carriedForward: {
            type: Number,
            default: 0,
            min: [0, "Carried forward days cannot be negative"],
        },
        availableDays: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Create indexes
LeaveBalanceSchema.index({ userId: 1, leaveTypeId: 1, year: 1 }, { unique: true });
LeaveBalanceSchema.index({ employeeId: 1, year: 1 });

// Calculate available days before saving
LeaveBalanceSchema.pre("save", function (next) {
    this.availableDays = this.totalDays - this.usedDays - this.pendingDays;
    next();
});

// Export the model
const LeaveBalance: Model<ILeaveBalance> =
    mongoose.models.LeaveBalance || mongoose.model<ILeaveBalance>("LeaveBalance", LeaveBalanceSchema);

export default LeaveBalance;
