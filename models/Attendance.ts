/**
 * Attendance Model - TalentHR
 * Tracks employee attendance with clock in/out times
 */

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAttendance extends Document {
    userId: mongoose.Types.ObjectId;
    employeeId: mongoose.Types.ObjectId;
    date: Date;
    clockIn: Date;
    clockOut?: Date;
    status: "present" | "absent" | "late" | "half-day";
    workHours: number;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const AttendanceSchema: Schema = new Schema(
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
        date: {
            type: Date,
            required: [true, "Date is required"],
        },
        clockIn: {
            type: Date,
            required: [true, "Clock in time is required"],
        },
        clockOut: {
            type: Date,
        },
        status: {
            type: String,
            enum: ["present", "absent", "late", "half-day"],
            default: "present",
        },
        workHours: {
            type: Number,
            default: 0,
            min: [0, "Work hours cannot be negative"],
        },
        notes: {
            type: String,
            maxlength: [500, "Notes must not exceed 500 characters"],
        },
    },
    {
        timestamps: true,
    }
);

// Create indexes
AttendanceSchema.index({ userId: 1, date: 1 }, { unique: true });
AttendanceSchema.index({ employeeId: 1, date: 1 });
AttendanceSchema.index({ date: 1 });
AttendanceSchema.index({ status: 1 });

// Calculate work hours before saving
AttendanceSchema.pre("save", function (next) {
    if (this.clockOut && this.clockIn) {
        const diffMs = this.clockOut.getTime() - this.clockIn.getTime();
        this.workHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100; // Round to 2 decimals
    }
    next();
});

// Export the model
const Attendance: Model<IAttendance> =
    mongoose.models.Attendance || mongoose.model<IAttendance>("Attendance", AttendanceSchema);

export default Attendance;
