/**
 * User Profile Types
 * TypeScript types for user profiles
 */

export interface UserProfile {
  _id: string;
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
  rating: number;
  totalReviews: number;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProfileInput {
  displayName: string;
  bio?: string;
  avatar?: string;
  location: {
    city: string;
    state: string;
  };
  phone?: string;
}

export interface UpdateProfileInput {
  displayName?: string;
  bio?: string;
  avatar?: string;
  location?: {
    city: string;
    state: string;
  };
  phone?: string;
}

export interface ProfileResponse {
  success: boolean;
  profile?: UserProfile;
  error?: string;
}

