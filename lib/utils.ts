/**
 * Utility Functions - TalentHR
 */

import { clsx, type ClassValue } from "clsx";

/**
 * Combine class names (simplified version without tailwind-merge)
 * Can be used for conditional class names
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
