/**
 * Goal Model - TalentHR
 * Tracks employee goals and progress
 */

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGoal extends Document {
    userId: mongoose.Types.ObjectId;
    employeeId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    category: "individual" | "team" | "company";
    targetDate: Date;
    status: "not-started" | "in-progress" | "completed" | "cancelled";
    progress: number;
    priority: "low" | "medium" | "high";
    assignedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const GoalSchema: Schema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User reference is required"],
        },
        employeeId: {
            type: Schema.Types.ObjectId,
            ref: "Employee",
            required: [true, "Employee reference is required"],
        },
        title: {
            type: String,
            required: [true, "Goal title is required"],
            trim: true,
            maxlength: [200, "Title must not exceed 200 characters"],
        },
        description: {
            type: String,
            required: [true, "Goal description is required"],
            trim: true,
            maxlength: [1000, "Description must not exceed 1000 characters"],
        },
        category: {
            type: String,
            enum: ["individual", "team", "company"],
            default: "individual",
        },
        targetDate: {
            type: Date,
            required: [true, "Target date is required"],
        },
        status: {
            type: String,
            enum: ["not-started", "in-progress", "completed", "cancelled"],
            default: "not-started",
        },
        progress: {
            type: Number,
            default: 0,
            min: [0, "Progress cannot be negative"],
            max: [100, "Progress cannot exceed 100"],
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium",
        },
        assignedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

// Create indexes
GoalSchema.index({ userId: 1, status: 1 });
GoalSchema.index({ employeeId: 1, status: 1 });
GoalSchema.index({ category: 1, status: 1 });
GoalSchema.index({ targetDate: 1 });

// Auto-update status based on progress
GoalSchema.pre("save", function (next) {
    if (this.progress === 100 && this.status !== "completed") {
        this.status = "completed";
    } else if (this.progress > 0 && this.status === "not-started") {
        this.status = "in-progress";
    }
    next();
});

// Export the model
const Goal: Model<IGoal> =
    mongoose.models.Goal || mongoose.model<IGoal>("Goal", GoalSchema);

export default Goal;
