/**
 * User Profile Model
 * Extended profile information for marketplace users
 */

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserProfile extends Document {
  userId: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  location: {
    city: string;
    state: string;
  };
  phone?: string;
  verified: boolean;
  rating: number; // Average rating (0-5)
  totalReviews: number;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserProfileSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      unique: true,
      index: true,
    },
    displayName: {
      type: String,
      required: [true, "Display name is required"],
      trim: true,
      maxlength: [50, "Display name must be less than 50 characters"],
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, "Bio must be less than 500 characters"],
    },
    avatar: {
      type: String,
      trim: true,
    },
    location: {
      city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
      },
      state: {
        type: String,
        required: [true, "State is required"],
        trim: true,
      },
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s-()]+$/, "Please enter a valid phone number"],
    },
    verified: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
UserProfileSchema.index({ location: 1 });
UserProfileSchema.index({ rating: -1 });

// Export the model
const UserProfile: Model<IUserProfile> =
  mongoose.models.UserProfile ||
  mongoose.model<IUserProfile>("UserProfile", UserProfileSchema);

export default UserProfile;

