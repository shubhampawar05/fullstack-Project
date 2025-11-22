/**
 * JWT Utility Functions
 * Handles generation and verification of access and refresh tokens
 */

import jwt from "jsonwebtoken";
import { authConfig } from "@/lib/config";

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Generate access token (1 day)
 */
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, authConfig.jwtSecret, {
    expiresIn: authConfig.jwtExpiresIn, // 1 day (86400 seconds)
  });
}

/**
 * Generate refresh token (7 days)
 */
export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, authConfig.jwtRefreshSecret, {
    expiresIn: authConfig.jwtRefreshExpiresIn, // 7 days (604800 seconds)
  });
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, authConfig.jwtSecret) as TokenPayload;
  } catch (error) {
    throw new Error("Invalid or expired access token");
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, authConfig.jwtRefreshSecret) as TokenPayload;
  } catch (error) {
    throw new Error("Invalid or expired refresh token");
  }
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokenPair(payload: TokenPayload): {
  accessToken: string;
  refreshToken: string;
} {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}
