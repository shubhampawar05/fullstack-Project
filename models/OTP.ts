/**
 * OTP Model - TalentHR
 * MongoDB schema for OTP (One-Time Password) verification
 */

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOTP extends Document {
  email: string;
  otp: string; // Hashed OTP
  type: "signup" | "login" | "password_reset";
  purpose: "company_admin_signup" | "invitation_signup" | "login" | "password_reset";
  expiresAt: Date;
  attempts: number; // Number of verification attempts
  maxAttempts: number;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OTPSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    otp: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["signup", "login", "password_reset"],
      required: true,
    },
    purpose: {
      type: String,
      enum: [
        "company_admin_signup",
        "invitation_signup",
        "login",
        "password_reset",
      ],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 5,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
OTPSchema.index({ email: 1, type: 1, purpose: 1 });
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired OTPs

// Method to check if OTP is expired
OTPSchema.methods.isExpired = function (): boolean {
  return this.expiresAt < new Date();
};

// Method to check if OTP is valid
OTPSchema.methods.isValid = function (): boolean {
  return (
    !this.verified &&
    !this.isExpired() &&
    this.attempts < this.maxAttempts
  );
};

// Static method to generate 6-digit OTP
OTPSchema.statics.generateOTP = function (): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Export the model
const OTP: Model<IOTP> =
  mongoose.models.OTP || mongoose.model<IOTP>("OTP", OTPSchema);

export default OTP;

