/**
 * Listing Types
 * TypeScript types for marketplace listings
 */

export type ListingType = "item" | "service";
export type ListingStatus = "active" | "sold" | "expired" | "draft";

export interface ListingLocation {
  city: string;
  state: string;
  zipCode: string;
  coordinates?: [number, number]; // [latitude, longitude]
}

export interface Listing {
  _id: string;
  userId: string;
  type: ListingType;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  location: ListingLocation;
  status: ListingStatus;
  views: number;
  favorites: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateListingInput {
  type: ListingType;
  title: string;
  description: string;
  price: number;
  category: string;
  images?: string[];
  location: ListingLocation;
  status?: ListingStatus;
}

export interface UpdateListingInput {
  title?: string;
  description?: string;
  price?: number;
  category?: string;
  images?: string[];
  location?: ListingLocation;
  status?: ListingStatus;
}

export interface ListingFilters {
  type?: ListingType;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  state?: string;
  status?: ListingStatus;
  search?: string;
  sortBy?: "newest" | "oldest" | "price-low" | "price-high";
  page?: number;
  limit?: number;
}

export interface ListingResponse {
  success: boolean;
  listing?: Listing;
  listings?: Listing[];
  total?: number;
  page?: number;
  limit?: number;
  error?: string;
}

