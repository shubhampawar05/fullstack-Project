/**
 * User Model - TalentHR
 * MongoDB schema for user authentication with role-based access
 */

import mongoose, { Schema, Document, Model } from "mongoose";

export type UserRole =
  | "company_admin"
  | "hr_manager"
  | "recruiter"
  | "manager"
  | "employee";

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  companyId: mongoose.Types.ObjectId; // Reference to Company (REQUIRED)
  status: "active" | "inactive" | "pending";
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Don't return password by default
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    role: {
      type: String,
      enum: [
        "company_admin",
        "hr_manager",
        "recruiter",
        "manager",
        "employee",
      ],
      required: [true, "Role is required"],
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company ID is required"],
    },
    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "active",
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Create indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ companyId: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ companyId: 1, role: 1 }); // Compound index for company + role queries

// Export the model
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
