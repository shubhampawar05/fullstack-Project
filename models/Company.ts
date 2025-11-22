/**
 * Company Model - TalentHR
 * MongoDB schema for company/organization management
 */

import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICompany extends Document {
  name: string;
  slug: string;
  domain?: string;
  status: "active" | "pending" | "suspended";
  settings: {
    timezone?: string;
    currency?: string;
    dateFormat?: string;
  };
  subscription?: {
    plan: "free" | "basic" | "premium";
    expiresAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Company name is required"],
      unique: true,
      trim: true,
      minlength: [2, "Company name must be at least 2 characters"],
      maxlength: [100, "Company name must not exceed 100 characters"],
    },
    slug: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null/undefined values
      lowercase: true,
      trim: true,
    },
    domain: {
      type: String,
      trim: true,
      lowercase: true,
    },
    status: {
      type: String,
      enum: ["active", "pending", "suspended"],
      default: "active",
    },
    settings: {
      timezone: {
        type: String,
        default: "UTC",
      },
      currency: {
        type: String,
        default: "USD",
      },
      dateFormat: {
        type: String,
        default: "MM/DD/YYYY",
      },
    },
    subscription: {
      plan: {
        type: String,
        enum: ["free", "basic", "premium"],
        default: "free",
      },
      expiresAt: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
CompanySchema.index({ name: 1 }, { unique: true });
CompanySchema.index({ slug: 1 }, { unique: true, sparse: true });
CompanySchema.index({ status: 1 });

// Generate slug from name before saving
CompanySchema.pre("save", function (next) {
  // Generate slug if it doesn't exist or if name is modified
  if ((!this.slug || this.isModified("name")) && this.name) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
  }
  next();
});

// Export the model
const Company: Model<ICompany> =
  mongoose.models.Company || mongoose.model<ICompany>("Company", CompanySchema);

export default Company;

