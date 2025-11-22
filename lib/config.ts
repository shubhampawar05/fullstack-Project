/**
 * Application Configuration
 * Centralized configuration for all environment variables
 * This file provides a single source of truth for all config values
 */

// Helper function to get required env variable
function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

// Helper function to get optional env variable with default
function getOptionalEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

// Helper function to get number from env variable
function getNumberEnv(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

// Helper function to get boolean from env variable
function getBooleanEnv(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.toLowerCase() === "true";
}

/**
 * Application Configuration Object
 * All environment variables are accessed through this object
 */
export const config = {
  // ============================================
  // Application Configuration
  // ============================================
  app: {
    env: getOptionalEnv("NODE_ENV", "development") as
      | "development"
      | "production"
      | "test",
    url: getOptionalEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
    isDevelopment: process.env.NODE_ENV === "development",
    isProduction: process.env.NODE_ENV === "production",
    isTest: process.env.NODE_ENV === "test",
  },

  // ============================================
  // API Configuration
  // ============================================
  api: {
    // Public API URL (accessible from client-side)
    publicUrl: getOptionalEnv("NEXT_PUBLIC_API_URL", "/api"),
    // Internal API URL (server-side only, optional)
    internalUrl: getOptionalEnv("API_URL", ""),
  },

  // ============================================
  // Authentication & Security
  // ============================================
  auth: {
    jwtSecret: getOptionalEnv(
      "JWT_SECRET",
      "dev-jwt-secret-change-in-production"
    ),
    jwtExpiresIn: getNumberEnv("JWT_EXPIRES_IN", 86400), // 1 day in seconds (24 * 60 * 60)
    jwtRefreshExpiresIn: getNumberEnv("JWT_REFRESH_EXPIRES_IN", 604800), // 7 days in seconds (7 * 24 * 60 * 60)
    jwtRefreshSecret: getOptionalEnv(
      "JWT_REFRESH_SECRET",
      "dev-refresh-secret-change-in-production"
    ),
    bcryptSaltRounds: getNumberEnv("BCRYPT_SALT_ROUNDS", 10),
    sessionSecret: getOptionalEnv(
      "SESSION_SECRET",
      "dev-session-secret-change-in-production"
    ),
  },

  // ============================================
  // Database Configuration
  // ============================================
  database: {
    url: getOptionalEnv("DATABASE_URL", ""),
    // MongoDB
    mongodbUri: getOptionalEnv("MONGODB_URI", ""),
    // MySQL
    mysql: {
      host: getOptionalEnv("MYSQL_HOST", "localhost"),
      port: getNumberEnv("MYSQL_PORT", 3306),
      user: getOptionalEnv("MYSQL_USER", "root"),
      password: getOptionalEnv("MYSQL_PASSWORD", ""),
      database: getOptionalEnv("MYSQL_DATABASE", ""),
    },
  },

  // ============================================
  // OAuth Providers
  // ============================================
  oauth: {
    google: {
      clientId: getOptionalEnv("GOOGLE_CLIENT_ID", ""),
      clientSecret: getOptionalEnv("GOOGLE_CLIENT_SECRET", ""),
    },
    github: {
      clientId: getOptionalEnv("GITHUB_CLIENT_ID", ""),
      clientSecret: getOptionalEnv("GITHUB_CLIENT_SECRET", ""),
    },
  },

  // ============================================
  // Email Configuration
  // ============================================
  email: {
    host: getOptionalEnv("EMAIL_HOST", ""),
    port: getNumberEnv("EMAIL_PORT", 587),
    user: getOptionalEnv("EMAIL_USER", ""),
    password: getOptionalEnv("EMAIL_PASSWORD", ""),
    from: getOptionalEnv("EMAIL_FROM", "noreply@yourapp.com"),
  },

  // ============================================
  // AWS S3 Configuration
  // ============================================
  aws: {
    accessKeyId: getOptionalEnv("AWS_ACCESS_KEY_ID", ""),
    secretAccessKey: getOptionalEnv("AWS_SECRET_ACCESS_KEY", ""),
    region: getOptionalEnv("AWS_REGION", "us-east-1"),
    s3Bucket: getOptionalEnv("AWS_S3_BUCKET", ""),
  },

  // ============================================
  // Third-Party Services
  // ============================================
  services: {
    redis: {
      url: getOptionalEnv("REDIS_URL", ""),
    },
    stripe: {
      secretKey: getOptionalEnv("STRIPE_SECRET_KEY", ""),
      publishableKey: getOptionalEnv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", ""),
    },
  },

  // ============================================
  // Development & Debugging
  // ============================================
  debug: {
    enabled: getBooleanEnv("DEBUG", false),
    logLevel: getOptionalEnv("LOG_LEVEL", "info") as
      | "error"
      | "warn"
      | "info"
      | "debug",
  },
} as const;

/**
 * Type-safe config access
 * Export individual sections for easier imports
 */
export const appConfig = config.app;
export const apiConfig = config.api;
export const authConfig = config.auth;
export const dbConfig = config.database;
export const oauthConfig = config.oauth;
export const emailConfig = config.email;
export const awsConfig = config.aws;
export const servicesConfig = config.services;
export const debugConfig = config.debug;

// Export default config object
export default config;
