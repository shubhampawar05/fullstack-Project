/**
 * Production-Ready API Client with Automatic Token Refresh
 * 
 * Improvements:
 * - Token refresh queue (prevents race conditions)
 * - Request deduplication
 * - Request cancellation support
 * - No console.logs in production
 * - Better error handling
 */

import { apiConfig } from "@/lib/config";

const API_BASE_URL = apiConfig.publicUrl;
const isDev = process.env.NODE_ENV === "development";

// Token refresh queue - prevents multiple simultaneous refresh calls
let refreshPromise: Promise<boolean> | null = null;

/**
 * Refresh the access token using the refresh token
 * Uses a queue to prevent race conditions
 */
async function refreshTokens(): Promise<boolean> {
  // If refresh is already in progress, wait for it instead of starting a new one
  if (refreshPromise) {
    if (isDev) {
      console.log("🔄 [Token Refresh] Waiting for ongoing refresh...");
    }
    return refreshPromise;
  }

  // Start new refresh
  refreshPromise = (async () => {
    try {
      if (isDev) {
        console.log("🔄 [Token Refresh] Attempting to refresh tokens...");
      }
      
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include", // Include cookies (refresh token)
      });

      if (response.ok) {
        if (isDev) {
          console.log("✅ [Token Refresh] Tokens refreshed successfully!");
        }
        return true;
      } else {
        if (isDev) {
          console.error("❌ [Token Refresh] Failed:", response.status);
        }
        return false;
      }
    } catch (error) {
      if (isDev) {
        console.error("❌ [Token Refresh] Error:", error);
      }
      return false;
    } finally {
      // Clear the promise so next refresh can start
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// Request deduplication cache
const pendingRequests = new Map<string, Promise<Response>>();

/**
 * Create a unique key for request deduplication
 */
function getRequestKey(url: string, options: RequestInit): string {
  const method = options.method || "GET";
  const body = options.body ? JSON.stringify(options.body) : "";
  return `${method}:${url}:${body}`;
}

/**
 * Enhanced fetch with automatic token refresh and request deduplication
 * Automatically retries requests with refreshed tokens if access token expires
 */
export async function apiFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Check for request deduplication (only for GET requests to be safe)
  const isGetRequest = !options.method || options.method === "GET";
  const requestKey = isGetRequest ? getRequestKey(url, options) : null;

  // If same GET request is pending, return that promise
  if (requestKey && pendingRequests.has(requestKey)) {
    if (isDev) {
      console.log(`♻️ [API Client] Deduplicating request: ${url}`);
    }
    return pendingRequests.get(requestKey)!;
  }

  // Create the request function
  const makeRequest = async (): Promise<Response> => {
    if (isDev) {
      console.log(`📤 [API Client] Making request to: ${url}`);
    }

    // Make the initial request
    let response = await fetch(url, {
      ...options,
      credentials: "include", // Always include cookies
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (isDev) {
      console.log(`📥 [API Client] Response status: ${response.status} for ${url}`);
    }

    // If we get a 401 (Unauthorized), try to refresh the token
    if (response.status === 401) {
      if (isDev) {
        console.log("⚠️ [API Client] Access token expired (401), refreshing...");
      }

      // Try to refresh tokens (uses queue to prevent race conditions)
      const refreshSuccess = await refreshTokens();

      if (refreshSuccess) {
        if (isDev) {
          console.log("🔄 [API Client] Retrying original request with new tokens...");
        }

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
          if (isDev) {
            console.log("✅ [API Client] Request succeeded after token refresh!");
          }
        } else {
          if (isDev) {
            console.error(
              "❌ [API Client] Request failed after refresh:",
              response.status
            );
          }
        }
      } else {
        if (isDev) {
          console.error(
            "❌ [API Client] Token refresh failed, redirecting to login..."
          );
        }
        // Refresh failed - tokens are expired, redirect to login
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }

    return response;
  };

  // Create the request promise
  const requestPromise = makeRequest().finally(() => {
    // Clean up deduplication cache after request completes
    if (requestKey) {
      pendingRequests.delete(requestKey);
    }
  });

  // Store in deduplication cache if it's a GET request
  if (requestKey) {
    pendingRequests.set(requestKey, requestPromise);
  }

  return requestPromise;
}

/**
 * Make an authenticated API request
 * Automatically handles token refresh and supports request cancellation
 */
export async function authenticatedFetch(
  endpoint: string,
  options: RequestInit & { signal?: AbortSignal } = {}
): Promise<Response> {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  return apiFetch(url, options);
}

/**
 * Helper to parse JSON response with better error handling
 */
export async function apiJson<T>(response: Response): Promise<T> {
  // Clone response so we can read it multiple times if needed
  const clonedResponse = response.clone();

  if (!response.ok) {
    let errorMessage = "Request failed";

    try {
      const text = await clonedResponse.text();

      if (isDev) {
        console.error(`❌ [API JSON] Response error (${response.status}):`, text);
      }

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
      if (isDev) {
        console.error(
          "❌ [API JSON] Failed to parse error response:",
          parseError
        );
      }
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }

    throw new Error(errorMessage);
  }

  try {
    const data = await response.json();
    return data as T;
  } catch (parseError) {
    if (isDev) {
      console.error(
        "❌ [API JSON] Failed to parse success response:",
        parseError
      );
      // Try to get text for debugging
      try {
        const text = await clonedResponse.text();
        console.error("❌ [API JSON] Response text:", text);
      } catch {}
    }
    throw new Error("Invalid JSON response from server");
  }
}

/**
 * Clear request cache (useful for testing or manual cache invalidation)
 */
export function clearRequestCache(): void {
  pendingRequests.clear();
  if (isDev) {
    console.log("🧹 [API Client] Request cache cleared");
  }
}

