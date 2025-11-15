import {
  AuthResponse,
  LoginCredentials,
  SignupCredentials,
} from "@/types/auth";
import { apiConfig } from "@/lib/config";

const API_BASE_URL = apiConfig.publicUrl;

export async function login(
  credentials: LoginCredentials
): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Login failed",
      };
    }

    // Tokens are automatically stored in httpOnly cookies by the server
    return data;
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Network error",
    };
  }
}

export async function signup(
  credentials: SignupCredentials
): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Signup failed",
      };
    }

    // Tokens are automatically stored in httpOnly cookies by the server
    return data;
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Network error",
    };
  }
}

export async function logout(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include", // Include cookies
    });
  } catch (error) {
    // Ignore errors on logout
    console.error("Logout error:", error);
  }
}

/**
 * Check if user is authenticated by verifying the access token
 * Automatically refreshes tokens if access token is expired
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    // Use authenticatedFetch to automatically handle token refresh
    // Note: authenticatedFetch already adds API_BASE_URL, so just pass the path
    const { authenticatedFetch } = await import("./api-client");
    const response = await authenticatedFetch("/auth/me", {
      method: "GET",
    });
    return response.ok;
  } catch (error) {
    console.error("❌ [Auth] Authentication check failed:", error);
    return false;
  }
}

/**
 * Get current user information
 * Automatically handles token refresh if needed
 */
export async function getCurrentUser(): Promise<AuthResponse> {
  try {
    const { authenticatedFetch, apiJson } = await import("./api-client");
    // Note: authenticatedFetch already adds API_BASE_URL, so just pass the path
    const response = await authenticatedFetch("/auth/me", {
      method: "GET",
    });

    return await apiJson<AuthResponse>(response);
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Network error",
    };
  }
}

/**
 * Refresh tokens manually (if needed)
 */
export async function refreshTokens(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}
