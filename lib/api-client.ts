/**
 * API Client with Automatic Token Refresh
 * Handles automatic token refresh when access token expires
 */

import { apiConfig } from "@/lib/config";

const API_BASE_URL = apiConfig.publicUrl;

/**
 * Refresh the access token using the refresh token
 */
async function refreshTokens(): Promise<boolean> {
  try {
    console.log("🔄 [Token Refresh] Attempting to refresh tokens...");
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include", // Include cookies (refresh token)
    });

    if (response.ok) {
      console.log("✅ [Token Refresh] Tokens refreshed successfully!");
      return true;
    } else {
      console.error("❌ [Token Refresh] Failed:", response.status);
      return false;
    }
  } catch (error) {
    console.error("❌ [Token Refresh] Error:", error);
    return false;
  }
}

/**
 * Enhanced fetch with automatic token refresh
 * Automatically retries requests with refreshed tokens if access token expires
 */
export async function apiFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  console.log(`📤 [API Client] Making request to: ${url}`);
  // Make the initial request
  let response = await fetch(url, {
    ...options,
    credentials: "include", // Always include cookies
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  console.log(`📥 [API Client] Response status: ${response.status} for ${url}`);

  // If we get a 401 (Unauthorized), try to refresh the token
  if (response.status === 401) {
    console.log("⚠️ [API Client] Access token expired (401), refreshing...");
    // Try to refresh tokens
    const refreshSuccess = await refreshTokens();

    if (refreshSuccess) {
      console.log(
        "🔄 [API Client] Retrying original request with new tokens..."
      );
      // Retry the original request with new tokens
      response = await fetch(url, {
        ...options,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });
      if (response.ok) {
        console.log("✅ [API Client] Request succeeded after token refresh!");
      } else {
        console.error(
          "❌ [API Client] Request failed after refresh:",
          response.status
        );
      }
    } else {
      console.error(
        "❌ [API Client] Token refresh failed, redirecting to login..."
      );
      // Refresh failed - tokens are expired, redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  }

  return response;
}

/**
 * Make an authenticated API request
 * Automatically handles token refresh
 */
export async function authenticatedFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  return apiFetch(url, options);
}

/**
 * Helper to parse JSON response
 */
export async function apiJson<T>(response: Response): Promise<T> {
  // Clone response so we can read it multiple times if needed
  const clonedResponse = response.clone();

  if (!response.ok) {
    let errorMessage = "Request failed";

    try {
      const text = await clonedResponse.text();
      console.error(`❌ [API JSON] Response error (${response.status}):`, text);

      if (text) {
        try {
          const errorData = JSON.parse(text);
          errorMessage =
            errorData.message ||
            errorData.error ||
            `HTTP ${response.status}: ${response.statusText}`;
        } catch {
          errorMessage =
            text || `HTTP ${response.status}: ${response.statusText}`;
        }
      } else {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
    } catch (parseError) {
      console.error(
        "❌ [API JSON] Failed to parse error response:",
        parseError
      );
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }

    throw new Error(errorMessage);
  }

  try {
    const data = await response.json();
    return data as T;
  } catch (parseError) {
    console.error(
      "❌ [API JSON] Failed to parse success response:",
      parseError
    );
    // Try to get text for debugging
    try {
      const text = await clonedResponse.text();
      console.error("❌ [API JSON] Response text:", text);
    } catch {}
    throw new Error("Invalid JSON response from server");
  }
}
