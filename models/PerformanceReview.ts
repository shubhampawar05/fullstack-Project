/**
 * PerformanceReview Model - TalentHR
 * Manages employee performance reviews
 */

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPerformanceReview extends Document {
    employeeId: mongoose.Types.ObjectId;
    reviewerId: mongoose.Types.ObjectId;
    reviewPeriod: {
        startDate: Date;
        endDate: Date;
    };
    overallRating: number;
    strengths: string;
    areasForImprovement: string;
    goals: string;
    comments: string;
    status: "draft" | "submitted" | "completed";
    submittedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const PerformanceReviewSchema: Schema = new Schema(
    {
        employeeId: {
            type: Schema.Types.ObjectId,
            ref: "Employee",
            required: [true, "Employee reference is required"],
        },
        reviewerId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Reviewer reference is required"],
        },
        reviewPeriod: {
            startDate: {
                type: Date,
                required: [true, "Review period start date is required"],
            },
            endDate: {
                type: Date,
                required: [true, "Review period end date is required"],
            },
        },
        overallRating: {
            type: Number,
            required: [true, "Overall rating is required"],
            min: [1, "Rating must be at least 1"],
            max: [5, "Rating cannot exceed 5"],
        },
        strengths: {
            type: String,
            required: [true, "Strengths are required"],
            trim: true,
            maxlength: [1000, "Strengths must not exceed 1000 characters"],
        },
        areasForImprovement: {
            type: String,
            required: [true, "Areas for improvement are required"],
            trim: true,
            maxlength: [1000, "Areas for improvement must not exceed 1000 characters"],
        },
        goals: {
            type: String,
            required: [true, "Goals are required"],
            trim: true,
            maxlength: [1000, "Goals must not exceed 1000 characters"],
        },
        comments: {
            type: String,
            trim: true,
            maxlength: [2000, "Comments must not exceed 2000 characters"],
        },
        status: {
            type: String,
            enum: ["draft", "submitted", "completed"],
            default: "draft",
        },
        submittedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Create indexes
PerformanceReviewSchema.index({ employeeId: 1, createdAt: -1 });
PerformanceReviewSchema.index({ reviewerId: 1, status: 1 });
PerformanceReviewSchema.index({ "reviewPeriod.startDate": 1, "reviewPeriod.endDate": 1 });
PerformanceReviewSchema.index({ status: 1 });

// Validate review period
PerformanceReviewSchema.pre("save", function (next) {
    if (this.reviewPeriod.endDate < this.reviewPeriod.startDate) {
        next(new Error("Review period end date must be after start date"));
    } else {
        next();
    }
});

// Export the model
const PerformanceReview: Model<IPerformanceReview> =
    mongoose.models.PerformanceReview ||
    mongoose.model<IPerformanceReview>("PerformanceReview", PerformanceReviewSchema);

export default PerformanceReview;
