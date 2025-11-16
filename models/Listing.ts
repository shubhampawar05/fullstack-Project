/**
 * Listing Model
 * MongoDB schema for marketplace listings (items and services)
 */

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IListing extends Document {
  userId: string;
  type: "item" | "service";
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  location: {
    city: string;
    state: string;
    zipCode: string;
    coordinates?: [number, number]; // [latitude, longitude]
  };
  status: "active" | "sold" | "expired" | "draft";
  views: number;
  favorites: number;
  createdAt: Date;
  updatedAt: Date;
}

const ListingSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      index: true,
    },
    type: {
      type: String,
      enum: ["item", "service"],
      required: [true, "Listing type is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title must be less than 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [2000, "Description must be less than 2000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function (images: string[]) {
          return images.length <= 10; // Max 10 images
        },
        message: "Cannot have more than 10 images",
      },
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
      zipCode: {
        type: String,
        required: [true, "Zip code is required"],
        trim: true,
      },
      coordinates: {
        type: [Number],
        default: undefined,
        validate: {
          validator: function (coords: [number, number] | undefined) {
            if (!coords) return true;
            return (
              coords.length === 2 &&
              coords[0] >= -90 &&
              coords[0] <= 90 &&
              coords[1] >= -180 &&
              coords[1] <= 180
            );
          },
          message: "Invalid coordinates",
        },
      },
    },
    status: {
      type: String,
      enum: ["active", "sold", "expired", "draft"],
      default: "active",
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    favorites: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
ListingSchema.index({ userId: 1, status: 1 });
ListingSchema.index({ category: 1, status: 1 });
ListingSchema.index({ location: "2dsphere" }); // For geospatial queries
ListingSchema.index({ createdAt: -1 });
ListingSchema.index({ price: 1 });
ListingSchema.index({ title: "text", description: "text" }); // For text search

// Export the model
const Listing: Model<IListing> =
  mongoose.models.Listing || mongoose.model<IListing>("Listing", ListingSchema);

export default Listing;

