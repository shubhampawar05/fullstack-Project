/**
 * Category Types
 * TypeScript types for categories
 */

export interface Category {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  parentCategory?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryInput {
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  parentCategory?: string;
}

export interface CategoryResponse {
  success: boolean;
  category?: Category;
  categories?: Category[];
  subCategories?: Category[];
  all?: Category[];
  error?: string;
}

