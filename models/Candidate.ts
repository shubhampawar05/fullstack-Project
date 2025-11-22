/**
 * Candidate Model - TalentHR
 * MongoDB schema for candidate/job applicant management
 */

import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICandidate extends Document {
  jobPostingId: mongoose.Types.ObjectId; // Reference to JobPosting
  companyId: mongoose.Types.ObjectId; // Reference to Company
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  coverLetter?: string;
  linkedInUrl?: string;
  portfolioUrl?: string;
  experience?: number; // Years of experience
  currentPosition?: string;
  currentCompany?: string;
  expectedSalary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  noticePeriod?: number; // Days
  availability?: Date; // Available start date
  status: "applied" | "screening" | "interview" | "offer" | "hired" | "rejected" | "withdrawn";
  stage?: "application" | "phone-screen" | "technical" | "final" | "offer";
  source?: string; // How they found the job (LinkedIn, referral, etc.)
  recruiterId?: mongoose.Types.ObjectId; // Reference to User (assigned recruiter)
  notes?: string; // Internal notes
  rating?: number; // 1-5 rating
  skills?: string[]; // Array of skills
  documents?: Array<{
    name: string;
    type: string;
    url: string;
    uploadedAt: Date;
  }>;
  appliedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CandidateSchema: Schema = new Schema(
  {
    jobPostingId: {
      type: Schema.Types.ObjectId,
      ref: "JobPosting",
      required: [true, "Job posting is required"],
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company is required"],
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [100, "First name must not exceed 100 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [100, "Last name must not exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, "Invalid phone number"],
    },
    resumeUrl: {
      type: String,
      trim: true,
    },
    coverLetter: {
      type: String,
      trim: true,
      maxlength: [5000, "Cover letter must not exceed 5000 characters"],
    },
    linkedInUrl: {
      type: String,
      trim: true,
    },
    portfolioUrl: {
      type: String,
      trim: true,
    },
    experience: {
      type: Number,
      min: [0, "Experience cannot be negative"],
    },
    currentPosition: {
      type: String,
      trim: true,
      maxlength: [200, "Current position must not exceed 200 characters"],
    },
    currentCompany: {
      type: String,
      trim: true,
      maxlength: [200, "Current company must not exceed 200 characters"],
    },
    expectedSalary: {
      min: {
        type: Number,
        min: [0, "Minimum expected salary must be positive"],
      },
      max: {
        type: Number,
        min: [0, "Maximum expected salary must be positive"],
      },
      currency: {
        type: String,
        default: "USD",
        uppercase: true,
      },
    },
    noticePeriod: {
      type: Number,
      min: [0, "Notice period cannot be negative"],
    },
    availability: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["applied", "screening", "interview", "offer", "hired", "rejected", "withdrawn"],
      default: "applied",
    },
    stage: {
      type: String,
      enum: ["application", "phone-screen", "technical", "final", "offer"],
      default: "application",
    },
    source: {
      type: String,
      trim: true,
    },
    recruiterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    notes: {
      type: String,
      maxlength: [2000, "Notes must not exceed 2000 characters"],
    },
    rating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating must be at most 5"],
    },
    skills: [{
      type: String,
      trim: true,
    }],
    documents: [{
      name: { type: String, required: true, trim: true },
      type: { type: String, required: true, trim: true },
      url: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now },
    }],
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
CandidateSchema.index({ jobPostingId: 1 });
CandidateSchema.index({ companyId: 1 });
CandidateSchema.index({ email: 1 });
CandidateSchema.index({ status: 1 });
CandidateSchema.index({ stage: 1 });
CandidateSchema.index({ recruiterId: 1 });
CandidateSchema.index({ appliedAt: -1 });
CandidateSchema.index({ companyId: 1, status: 1 }); // Compound index for company + status queries
CandidateSchema.index({ jobPostingId: 1, status: 1 }); // Compound index for job + status queries

// Ensure unique email per job posting (one application per candidate per job)
CandidateSchema.index({ jobPostingId: 1, email: 1 }, { unique: true });

// Export the model
const Candidate: Model<ICandidate> =
  mongoose.models.Candidate || mongoose.model<ICandidate>("Candidate", CandidateSchema);

export default Candidate;

