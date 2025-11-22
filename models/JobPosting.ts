/**
 * Job Posting Model - TalentHR
 * MongoDB schema for job postings/positions
 */

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IJobPosting extends Document {
  companyId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  departmentId?: mongoose.Types.ObjectId; // Reference to Department
  employmentType: "full-time" | "part-time" | "contract" | "intern";
  location?: string;
  remote?: boolean;
  salaryRange?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  requirements?: string[]; // Array of requirements
  responsibilities?: string[]; // Array of responsibilities
  qualifications?: string[]; // Array of qualifications
  postedBy: mongoose.Types.ObjectId; // Reference to User (who posted)
  status: "draft" | "published" | "closed" | "cancelled";
  applicationDeadline?: Date;
  numberOfOpenings?: number;
  experienceLevel?: "entry" | "mid" | "senior" | "executive";
  tags?: string[]; // Skills, keywords, etc.
  views?: number; // Number of views
  applicationsCount?: number; // Virtual or calculated
  createdAt: Date;
  updatedAt: Date;
}

const JobPostingSchema: Schema = new Schema(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company is required"],
    },
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      minlength: [3, "Job title must be at least 3 characters"],
      maxlength: [200, "Job title must not exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
      trim: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
    },
    employmentType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "intern"],
      default: "full-time",
    },
    location: {
      type: String,
      trim: true,
    },
    remote: {
      type: Boolean,
      default: false,
    },
    salaryRange: {
      min: {
        type: Number,
        min: [0, "Minimum salary must be positive"],
      },
      max: {
        type: Number,
        min: [0, "Maximum salary must be positive"],
      },
      currency: {
        type: String,
        default: "USD",
        uppercase: true,
      },
    },
    requirements: [{
      type: String,
      trim: true,
    }],
    responsibilities: [{
      type: String,
      trim: true,
    }],
    qualifications: [{
      type: String,
      trim: true,
    }],
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Posted by user is required"],
    },
    status: {
      type: String,
      enum: ["draft", "published", "closed", "cancelled"],
      default: "draft",
    },
    applicationDeadline: {
      type: Date,
    },
    numberOfOpenings: {
      type: Number,
      min: [1, "Number of openings must be at least 1"],
      default: 1,
    },
    experienceLevel: {
      type: String,
      enum: ["entry", "mid", "senior", "executive"],
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    views: {
      type: Number,
      default: 0,
      min: [0, "Views cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
JobPostingSchema.index({ companyId: 1 });
JobPostingSchema.index({ departmentId: 1 });
JobPostingSchema.index({ postedBy: 1 });
JobPostingSchema.index({ status: 1 });
JobPostingSchema.index({ employmentType: 1 });
JobPostingSchema.index({ experienceLevel: 1 });
JobPostingSchema.index({ createdAt: -1 });
JobPostingSchema.index({ companyId: 1, status: 1 }); // Compound index for company + status queries
JobPostingSchema.index({ tags: 1 }); // For tag-based searches

// Virtual for applications count
JobPostingSchema.virtual("applicationsCount", {
  ref: "Candidate",
  localField: "_id",
  foreignField: "jobPostingId",
  count: true,
});

// Export the model
const JobPosting: Model<IJobPosting> =
  mongoose.models.JobPosting || mongoose.model<IJobPosting>("JobPosting", JobPostingSchema);

export default JobPosting;

