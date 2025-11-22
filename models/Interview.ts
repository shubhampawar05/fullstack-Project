/**
 * Interview Model - TalentHR
 * MongoDB schema for interview scheduling and management
 */

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInterview extends Document {
  candidateId: mongoose.Types.ObjectId; // Reference to Candidate
  jobPostingId: mongoose.Types.ObjectId; // Reference to JobPosting
  companyId: mongoose.Types.ObjectId; // Reference to Company
  type: "phone-screen" | "technical" | "behavioral" | "final" | "panel";
  scheduledAt: Date;
  duration?: number; // Duration in minutes
  location?: string; // Physical location or video link
  isRemote?: boolean;
  interviewers: mongoose.Types.ObjectId[]; // Array of User references
  organizerId: mongoose.Types.ObjectId; // Reference to User (who scheduled)
  status: "scheduled" | "completed" | "cancelled" | "rescheduled" | "no-show";
  feedback?: {
    interviewerId: mongoose.Types.ObjectId; // Reference to User
    rating?: number; // 1-5 rating
    notes?: string;
    strengths?: string[];
    weaknesses?: string[];
    recommendation?: "hire" | "maybe" | "reject";
    submittedAt: Date;
  }[];
  notes?: string; // General notes
  reminderSent?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const InterviewSchema: Schema = new Schema(
  {
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: "Candidate",
      required: [true, "Candidate is required"],
    },
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
    type: {
      type: String,
      enum: ["phone-screen", "technical", "behavioral", "final", "panel"],
      required: [true, "Interview type is required"],
    },
    scheduledAt: {
      type: Date,
      required: [true, "Scheduled time is required"],
    },
    duration: {
      type: Number,
      min: [15, "Duration must be at least 15 minutes"],
      default: 60, // Default 1 hour
    },
    location: {
      type: String,
      trim: true,
    },
    isRemote: {
      type: Boolean,
      default: false,
    },
    interviewers: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
    organizerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Organizer is required"],
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled", "rescheduled", "no-show"],
      default: "scheduled",
    },
    feedback: [{
      interviewerId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      rating: {
        type: Number,
        min: [1, "Rating must be at least 1"],
        max: [5, "Rating must be at most 5"],
      },
      notes: {
        type: String,
        maxlength: [2000, "Feedback notes must not exceed 2000 characters"],
      },
      strengths: [{
        type: String,
        trim: true,
      }],
      weaknesses: [{
        type: String,
        trim: true,
      }],
      recommendation: {
        type: String,
        enum: ["hire", "maybe", "reject"],
      },
      submittedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    notes: {
      type: String,
      maxlength: [2000, "Notes must not exceed 2000 characters"],
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
InterviewSchema.index({ candidateId: 1 });
InterviewSchema.index({ jobPostingId: 1 });
InterviewSchema.index({ companyId: 1 });
InterviewSchema.index({ organizerId: 1 });
InterviewSchema.index({ scheduledAt: 1 });
InterviewSchema.index({ status: 1 });
InterviewSchema.index({ type: 1 });
InterviewSchema.index({ "interviewers": 1 }); // For finding interviews by interviewer
InterviewSchema.index({ companyId: 1, scheduledAt: 1 }); // Compound index for company + date queries
InterviewSchema.index({ candidateId: 1, status: 1 }); // Compound index for candidate + status queries

// Export the model
const Interview: Model<IInterview> =
  mongoose.models.Interview || mongoose.model<IInterview>("Interview", InterviewSchema);

export default Interview;

