/**
 * Attendance Model - TalentHR
 * MongoDB schema for tracking employee attendance
 */

import mongoose, { Schema, Document, Model } from "mongoose";

export type AttendanceStatus = "Present" | "Absent" | "Late" | "Half-day";

export interface IAttendance extends Document {
  employeeId: mongoose.Types.ObjectId; // Reference to Employee
  companyId: mongoose.Types.ObjectId; // Reference to Company
  date: Date; // The date of attendance (normalized to midnight)
  clockIn: Date;
  clockOut?: Date;
  status: AttendanceStatus;
  workDuration?: number; // In minutes
  breakDuration: number; // In minutes
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema: Schema = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: [true, "Employee ID is required"],
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company ID is required"],
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
      enum: ["Present", "Absent", "Late", "Half-day"],
      default: "Present",
    },
    workDuration: {
      type: Number, // In minutes
      default: 0,
    },
    breakDuration: {
      type: Number, // In minutes
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
AttendanceSchema.index({ employeeId: 1 });
AttendanceSchema.index({ companyId: 1 });
AttendanceSchema.index({ date: 1 });
AttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true }); // One record per employee per day
AttendanceSchema.index({ companyId: 1, date: 1 });

// Export the model
const Attendance: Model<IAttendance> =
  mongoose.models.Attendance ||
  mongoose.model<IAttendance>("Attendance", AttendanceSchema);

export default Attendance;
