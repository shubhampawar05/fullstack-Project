/**
 * Production-Ready API Client
 *
 * Features:
 * - Token refresh queue (prevents race conditions)
 * - Request deduplication
 * - Request cancellation
 * - Retry with exponential backoff
 * - Structured logging (no console.logs in production)
 * - Error tracking ready
 * - Performance monitoring ready
 *
 * Based on industry best practices from:
 * - Vercel, GitHub, Stripe, Auth0 patterns
 * - React Query, SWR patterns
 * - OAuth 2.0 best practices
 */

import { apiConfig } from "@/lib/config";

const API_BASE_URL = apiConfig.publicUrl;
const isDev = process.env.NODE_ENV === "development";

// ============================================
// Token Refresh Queue (Critical for Scale)
// ============================================

interface RefreshState {
  promise: Promise<boolean>;
  timestamp: number;
}

let refreshState: RefreshState | null = null;
const REFRESH_COOLDOWN = 1000; // 1 second cooldown between refreshes

/**
 * Refresh tokens with queue to prevent race conditions
 * Industry standard: Only ONE refresh call, even with 1000 simultaneous requests
 */
async function refreshTokens(): Promise<boolean> {
  const now = Date.now();

  // If refresh is in progress, wait for it
  if (refreshState && now - refreshState.timestamp < REFRESH_COOLDOWN) {
    if (isDev) {
      console.log("🔄 [Token Refresh] Waiting for ongoing refresh...");
    }
    return refreshState.promise;
  }

  // Start new refresh
  refreshState = {
    promise: (async () => {
      try {
        if (isDev) {
          console.log("🔄 [Token Refresh] Starting refresh...");
        }

        const startTime = performance.now();
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const duration = performance.now() - startTime;

        if (response.ok) {
          if (isDev) {
            console.log(`✅ [Token Refresh] Success (${duration.toFixed(2)}ms)`);
          }

          // TODO: Add analytics tracking in production
          // if (!isDev && typeof window !== "undefined") {
          //   analytics.track('token_refresh_success', { duration });
          // }

          return true;
        } else {
          if (isDev) {
            console.error(`❌ [Token Refresh] Failed: ${response.status}`);
          }

          // TODO: Add error tracking in production
          // if (!isDev) {
          //   errorTracker.captureException(new Error(`Token refresh failed: ${response.status}`));
          // }

          return false;
        }
      } catch (error) {
        if (isDev) {
          console.error("❌ [Token Refresh] Error:", error);
        }

        // TODO: Add error tracking in production
        // if (!isDev && error instanceof Error) {
        //   errorTracker.captureException(error);
        // }

        return false;
      } finally {
        // Clear state after cooldown
        setTimeout(() => {
          refreshState = null;
        }, REFRESH_COOLDOWN);
      }
    })(),
    timestamp: now,
  };

  return refreshState.promise;
}

// ============================================
// Request Deduplication Cache
// ============================================

interface PendingRequest {
  promise: Promise<Response>;
  timestamp: number;
  abortController: AbortController;
}

const pendingRequests = new Map<string, PendingRequest>();
const DEDUPE_TTL = 5000; // 5 seconds

/**
 * Create unique key for request deduplication
 */
function getRequestKey(
  url: string,
  method: string,
  body?: string
): string {
  return `${method}:${url}:${body || ""}`;
}

/**
 * Clean up stale pending requests
 */
function cleanupStaleRequests(): void {
  const now = Date.now();
  for (const [key, request] of pendingRequests.entries()) {
    if (now - request.timestamp > DEDUPE_TTL) {
      request.abortController.abort();
      pendingRequests.delete(key);
    }
  }
}

// Clean up every 10 seconds
if (typeof window !== "undefined") {
  setInterval(cleanupStaleRequests, 10000);
}

// ============================================
// Retry Logic with Exponential Backoff
// ============================================

interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  retryableStatuses?: number[];
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  retryableStatuses: [408, 429, 500, 502, 503, 504], // Timeout, Rate limit, Server errors
};

/**
 * Retry fetch with exponential backoff
 * Industry standard: Retry on network errors and 5xx status codes
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retryOptions: RetryOptions = {}
): Promise<Response> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...retryOptions };

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // Don't retry on success or client errors (4xx except specific ones)
      if (
        response.ok ||
        (response.status < 500 &&
          !config.retryableStatuses.includes(response.status))
      ) {
        return response;
      }

      // Retry on retryable status codes
      if (
        config.retryableStatuses.includes(response.status) &&
        attempt < config.maxRetries
      ) {
        const delay = config.retryDelay * Math.pow(2, attempt); // Exponential backoff
        if (isDev) {
          console.log(
            `⏳ [Retry] Attempt ${attempt + 1}/${config.maxRetries + 1} after ${delay}ms`
          );
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      return response;
    } catch (error) {
      // Network error - retry
      if (attempt < config.maxRetries) {
        const delay = config.retryDelay * Math.pow(2, attempt);
        if (isDev) {
          console.log(
            `⏳ [Retry] Network error, retry ${attempt + 1}/${config.maxRetries + 1} after ${delay}ms`
          );
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }

  throw new Error("Max retries exceeded");
}

// ============================================
// Main API Fetch Function
// ============================================

export interface ApiFetchOptions extends RequestInit {
  skipDeduplication?: boolean;
  skipRetry?: boolean;
  retryOptions?: RetryOptions;
}

/**
 * Enhanced fetch with all production features
 */
export async function apiFetch(
  url: string,
  options: ApiFetchOptions = {}
): Promise<Response> {
  const {
    skipDeduplication = false,
    skipRetry = false,
    retryOptions,
    ...fetchOptions
  } = options;

  const method = fetchOptions.method || "GET";
  const body = fetchOptions.body
    ? typeof fetchOptions.body === "string"
      ? fetchOptions.body
      : JSON.stringify(fetchOptions.body)
    : undefined;

  // Request deduplication (only for GET requests by default)
  const shouldDedupe = !skipDeduplication && method === "GET";
  const requestKey = shouldDedupe
    ? getRequestKey(url, method, body)
    : null;

  // Check if same request is pending
  if (requestKey && pendingRequests.has(requestKey)) {
    const pending = pendingRequests.get(requestKey)!;
    if (isDev) {
      console.log(`♻️ [API Client] Deduplicating request: ${url}`);
    }
    return pending.promise;
  }

  // Create abort controller for cancellation
  const abortController = new AbortController();
  if (fetchOptions.signal) {
    fetchOptions.signal.addEventListener("abort", () => {
      abortController.abort();
    });
  }

  // Create the request function
  const makeRequest = async (): Promise<Response> => {
    const startTime = performance.now();

    try {
      if (isDev) {
        console.log(`📤 [API Client] ${method} ${url}`);
      }

      // Make the request (with retry if enabled)
      const response = skipRetry
        ? await fetch(url, {
            ...fetchOptions,
            body,
            signal: abortController.signal,
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              ...fetchOptions.headers,
            },
          })
        : await fetchWithRetry(
            url,
            {
              ...fetchOptions,
              body,
              signal: abortController.signal,
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
                ...fetchOptions.headers,
              },
            },
            retryOptions
          );

      const duration = performance.now() - startTime;

      if (isDev) {
        console.log(
          `📥 [API Client] ${method} ${url} - ${response.status} (${duration.toFixed(2)}ms)`
        );
      }

      // TODO: Add performance monitoring in production
      // if (!isDev && typeof window !== "undefined") {
      //   analytics.track('api_request', {
      //     method,
      //     url,
      //     status: response.status,
      //     duration,
      //   });
      // }

      // Handle 401 (Unauthorized) - Token expired
      if (response.status === 401) {
        if (isDev) {
          console.log("⚠️ [API Client] Token expired, refreshing...");
        }

        // Refresh tokens (uses queue to prevent race conditions)
        const refreshSuccess = await refreshTokens();

        if (refreshSuccess) {
          if (isDev) {
            console.log("🔄 [API Client] Retrying with new token...");
          }

          // Retry the original request with new tokens
          const retryResponse = skipRetry
            ? await fetch(url, {
                ...fetchOptions,
                body,
                signal: abortController.signal,
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                  ...fetchOptions.headers,
                },
              })
            : await fetchWithRetry(
                url,
                {
                  ...fetchOptions,
                  body,
                  signal: abortController.signal,
                  credentials: "include",
                  headers: {
                    "Content-Type": "application/json",
                    ...fetchOptions.headers,
                  },
                },
                retryOptions
              );

          if (retryResponse.ok) {
            if (isDev) {
              console.log("✅ [API Client] Request succeeded after refresh");
            }
          }

          return retryResponse;
        } else {
          if (isDev) {
            console.error("❌ [API Client] Token refresh failed, redirecting...");
          }

          // Refresh failed - redirect to login
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }

          return response; // Return original 401 response
        }
      }

      // Handle rate limiting (429)
      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After");
        if (retryAfter && isDev) {
          console.warn(
            `⚠️ [API Client] Rate limited. Retry after ${retryAfter} seconds`
          );
        }

        // TODO: Add rate limit tracking in production
        // if (!isDev) {
        //   analytics.track('rate_limit_hit', { url, retryAfter });
        // }
      }

      return response;
    } catch (error) {
      const duration = performance.now() - startTime;

      if (error instanceof Error && error.name === "AbortError") {
        if (isDev) {
          console.log(`🚫 [API Client] Request cancelled: ${url}`);
        }
        throw error;
      }

      if (isDev) {
        console.error(`❌ [API Client] Error: ${url}`, error);
      }

      // TODO: Add error tracking in production
      // if (!isDev && error instanceof Error) {
      //   errorTracker.captureException(error, {
      //     tags: { url, method, duration },
      //   });
      // }

      throw error;
    }
  };

  // Create the request promise
  const requestPromise = makeRequest().finally(() => {
    // Clean up deduplication cache
    if (requestKey) {
      pendingRequests.delete(requestKey);
    }
  });

  // Store in deduplication cache
  if (requestKey) {
    pendingRequests.set(requestKey, {
      promise: requestPromise,
      timestamp: Date.now(),
      abortController,
    });
  }

  return requestPromise;
}

// ============================================
// Authenticated Fetch Helper
// ============================================

/**
 * Make an authenticated API request
 * Automatically handles token refresh and supports cancellation
 */
export async function authenticatedFetch(
  endpoint: string,
  options: ApiFetchOptions = {}
): Promise<Response> {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  return apiFetch(url, options);
}

// ============================================
// JSON Response Parser
// ============================================

/**
 * Parse JSON response with comprehensive error handling
 */
export async function apiJson<T>(response: Response): Promise<T> {
  const clonedResponse = response.clone();

  if (!response.ok) {
    let errorMessage = "Request failed";
    let errorData: any = null;

    try {
      const text = await clonedResponse.text();

      if (text) {
        try {
          errorData = JSON.parse(text);
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
        console.error("❌ [API JSON] Failed to parse error:", parseError);
      }
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }

    // Create error with additional context
    const error = new Error(errorMessage) as Error & {
      status: number;
      statusText: string;
      data?: any;
    };
    error.status = response.status;
    error.statusText = response.statusText;
    error.data = errorData;

    throw error;
  }

  try {
    const data = await response.json();
    return data as T;
  } catch (parseError) {
    if (isDev) {
      console.error("❌ [API JSON] Failed to parse response:", parseError);
      try {
        const text = await clonedResponse.text();
        console.error("❌ [API JSON] Response text:", text);
      } catch {}
    }

    throw new Error("Invalid JSON response from server");
  }
}

// ============================================
// Utility Functions
// ============================================

/**
 * Clear request cache (useful for testing or manual cache invalidation)
 */
export function clearRequestCache(): void {
  pendingRequests.clear();
  if (isDev) {
    console.log("🧹 [API Client] Request cache cleared");
  }
}

/**
 * Get pending requests count (for debugging)
 */
export function getPendingRequestsCount(): number {
  return pendingRequests.size;
}

// Export types
export type { RetryOptions };

