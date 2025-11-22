/**
 * Department Model - TalentHR
 * MongoDB schema for department/organizational structure
 */

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDepartment extends Document {
  companyId: mongoose.Types.ObjectId;
  name: string;
  code?: string; // Department code (e.g., "HR", "IT", "SALES")
  description?: string;
  parentDepartmentId?: mongoose.Types.ObjectId; // For hierarchy
  managerId?: mongoose.Types.ObjectId; // Reference to User (department manager)
  budget?: number; // Department budget
  location?: string; // Department location
  status: "active" | "inactive";
  employeeCount?: number; // Virtual or calculated
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema: Schema = new Schema(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company is required"],
    },
    name: {
      type: String,
      required: [true, "Department name is required"],
      trim: true,
      minlength: [2, "Department name must be at least 2 characters"],
      maxlength: [100, "Department name must not exceed 100 characters"],
    },
    code: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: [10, "Department code must not exceed 10 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description must not exceed 500 characters"],
    },
    parentDepartmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
    },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    budget: {
      type: Number,
      min: [0, "Budget must be positive"],
    },
    location: {
      type: String,
      trim: true,
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
DepartmentSchema.index({ companyId: 1, name: 1 }, { unique: true });
DepartmentSchema.index({ companyId: 1, code: 1 }, { unique: true, sparse: true });
DepartmentSchema.index({ parentDepartmentId: 1 });
DepartmentSchema.index({ managerId: 1 });
DepartmentSchema.index({ status: 1 });

// Virtual for employee count (will be calculated)
DepartmentSchema.virtual("employeeCount", {
  ref: "Employee",
  localField: "_id",
  foreignField: "departmentId",
  count: true,
});

// Export the model
const Department: Model<IDepartment> =
  mongoose.models.Department || mongoose.model<IDepartment>("Department", DepartmentSchema);

export default Department;

