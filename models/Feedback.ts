/**
 * Feedback Model
 * MongoDB schema for user feedback
 */

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFeedback extends Document {
  userId?: string;
  email?: string;
  name?: string;
  type: "bug" | "feature" | "improvement" | "other";
  subject: string;
  message: string;
  rating?: number;
  status: "pending" | "reviewed" | "resolved";
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["bug", "feature", "improvement", "other"],
      required: [true, "Feedback type is required"],
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      maxlength: [200, "Subject must be less than 200 characters"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [2000, "Message must be less than 2000 characters"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
FeedbackSchema.index({ userId: 1 });
FeedbackSchema.index({ status: 1 });
FeedbackSchema.index({ createdAt: -1 });

// Export the model
const Feedback: Model<IFeedback> =
  mongoose.models.Feedback ||
  mongoose.model<IFeedback>("Feedback", FeedbackSchema);

export default Feedback;
