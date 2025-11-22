/**
 * Invitation Model - TalentHR
 * MongoDB schema for user invitations
 */

import mongoose, { Schema, Document, Model } from "mongoose";
import crypto from "crypto";

export type InvitationStatus = "pending" | "accepted" | "expired" | "cancelled";
export type UserRole =
  | "company_admin"
  | "hr_manager"
  | "recruiter"
  | "manager"
  | "employee";

export interface IInvitation extends Document {
  companyId: mongoose.Types.ObjectId;
  email: string;
  role: UserRole;
  invitedBy: mongoose.Types.ObjectId;
  token: string; // Hashed token stored in DB
  rawToken?: string; // Raw token for link generation (stored temporarily, not hashed)
  status: InvitationStatus;
  expiresAt: Date;
  acceptedAt?: Date;
  acceptedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const InvitationSchema: Schema = new Schema(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company ID is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    role: {
      type: String,
      enum: ["company_admin", "hr_manager", "recruiter", "manager", "employee"],
      required: [true, "Role is required"],
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Invited by user ID is required"],
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    rawToken: {
      type: String,
      select: false, // Don't return by default for security
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "expired", "cancelled"],
      default: "pending",
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
    acceptedAt: {
      type: Date,
    },
    acceptedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
InvitationSchema.index({ token: 1 }, { unique: true });
InvitationSchema.index({ companyId: 1, email: 1 });
InvitationSchema.index({ status: 1 });
InvitationSchema.index({ expiresAt: 1 });

// Compound unique index: one pending invitation per email per company
InvitationSchema.index(
  { companyId: 1, email: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "pending" },
  }
);

// Static method to generate secure token
InvitationSchema.statics.generateToken = function (): string {
  return crypto.randomBytes(32).toString("hex");
};

// Method to hash token (for storage)
InvitationSchema.statics.hashToken = function (token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
};

// Method to check if invitation is expired
InvitationSchema.methods.isExpired = function (): boolean {
  return this.expiresAt < new Date();
};

// Method to check if invitation is valid
InvitationSchema.methods.isValid = function (): boolean {
  return (
    this.status === "pending" &&
    !this.isExpired() &&
    this.expiresAt > new Date()
  );
};

// Export the model
const Invitation: Model<IInvitation> =
  mongoose.models.Invitation ||
  mongoose.model<IInvitation>("Invitation", InvitationSchema);

export default Invitation;

