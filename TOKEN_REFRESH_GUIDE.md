# Token Refresh Flow Guide

## How Token Refresh Works

### Token Types

1. **Access Token** (Short-lived: 1 hour)
   - Used for API authentication
   - Expires quickly for security
   - Stored in httpOnly cookie

2. **Refresh Token** (Long-lived: 7 days)
   - Used to get new access tokens
   - Expires after 7 days
   - Stored in httpOnly cookie

### Token Refresh Flow

```
┌─────────────────────────────────────────────────────────┐
│                    User Makes Request                   │
└────────────────────┬──────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │  Access Token Valid?  │
         └───────┬───────────────┘
                 │
        ┌────────┴────────┐
        │                 │
       YES               NO
        │                 │
        ▼                 ▼
   ┌─────────┐    ┌──────────────────┐
   │ Process │    │ Try Refresh Token│
   │ Request │    └────────┬─────────┘
   └─────────┘             │
                    ┌──────┴──────┐
                    │             │
                  Valid        Expired
                    │             │
                    ▼             ▼
            ┌──────────────┐  ┌────────────┐
            │ Generate New │  │ Redirect to│
            │ Token Pair   │  │   Login    │
            └──────┬───────┘  └────────────┘
                   │
                   ▼
            ┌──────────────┐
            │ Retry Request│
            └──────────────┘
```

## Implementation Details

### 1. Frontend Automatic Refresh (`lib/api-client.ts`)

The `apiFetch` function automatically handles token refresh:

```typescript
// When you make an API call
const response = await authenticatedFetch("/api/some-endpoint");

// If access token expired:
// 1. Automatically calls /api/auth/refresh
// 2. Gets new tokens
// 3. Retries original request
// 4. Returns response
```

**Usage:**

```typescript
import { authenticatedFetch, apiJson } from "@/lib/api-client";

// Make authenticated request
const response = await authenticatedFetch("/api/protected-endpoint", {
  method: "GET",
});

const data = await apiJson(response);
```

### 2. Backend Automatic Refresh (`app/api/auth/me/route.ts`)

The `/api/auth/me` endpoint automatically refreshes tokens if access token is expired:

```typescript
// When access token expires:
// 1. Checks for refresh token
// 2. Verifies refresh token
// 3. Generates new token pair
// 4. Sets new cookies
// 5. Returns user data
```

### 3. Manual Refresh Endpoint (`app/api/auth/refresh/route.ts`)

You can manually refresh tokens:

```typescript
POST / api / auth / refresh;

// Uses refresh token from cookie
// Returns new access + refresh tokens
// Sets new cookies automatically
```

## Scenarios

### Scenario 1: Access Token Expires (Refresh Token Valid)

```
1. User makes API request
2. Access token expired (401 error)
3. Frontend automatically calls /api/auth/refresh
4. Backend validates refresh token
5. Backend generates new token pair
6. Frontend retries original request
7. Request succeeds ✅
```

### Scenario 2: Both Tokens Expired

```
1. User makes API request
2. Access token expired (401 error)
3. Frontend tries to refresh
4. Refresh token also expired (401 error)
5. Frontend redirects to /login
6. User must login again 🔐
```

### Scenario 3: Backend Auto-Refresh (in /api/auth/me)

```
1. Frontend calls /api/auth/me
2. Backend checks access token
3. Access token expired
4. Backend automatically uses refresh token
5. Backend generates new tokens
6. Backend returns user data
7. Frontend gets response with new tokens ✅
```

## Code Examples

### Frontend: Making Authenticated Requests

```typescript
// Use authenticatedFetch for automatic refresh
import { authenticatedFetch, apiJson } from "@/lib/api-client";

// Example: Get user data
async function getUserData() {
  try {
    const response = await authenticatedFetch("/api/user/profile");
    const data = await apiJson(response);
    return data;
  } catch (error) {
    console.error("Failed to get user data:", error);
  }
}

// Example: Update user
async function updateUser(userData: any) {
  try {
    const response = await authenticatedFetch("/api/user/profile", {
      method: "PUT",
      body: JSON.stringify(userData),
    });
    const data = await apiJson(response);
    return data;
  } catch (error) {
    console.error("Failed to update user:", error);
  }
}
```

### Backend: Using Auth Middleware

```typescript
import { authenticateRequest } from "@/lib/auth-middleware";

export async function GET(request: NextRequest) {
  // Authenticate request (auto-refreshes if needed)
  const auth = await authenticateRequest(request);

  if (!auth.success) {
    return auth.response; // Returns 401 with proper error
  }

  // Use authenticated user data
  const { userId, email, user } = auth.data;

  // Your protected route logic here
  return NextResponse.json({ userId, email });
}
```

## Token Lifecycle

```
Login/Signup
    │
    ▼
┌─────────────────┐
│ Generate Tokens │
│ - Access: 1h    │
│ - Refresh: 7d   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Store in Cookies│
│ (httpOnly)      │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
Access    Refresh
Token     Token
(1h)      (7d)
    │         │
    │         │ (when access expires)
    │         ▼
    │    ┌─────────────┐
    │    │ Use Refresh │
    │    │ to Get New  │
    │    │ Token Pair  │
    │    └─────┬───────┘
    │          │
    └──────────┘
         │
         ▼
    Continue Using
    (until refresh expires)
```

## Important Notes

### ✅ What Happens Automatically

- Access token refresh when expired
- Retry failed requests after refresh
- Cookie management (httpOnly, secure)
- Redirect to login when refresh token expires

### ⚠️ What You Need to Do

- Use `authenticatedFetch` for API calls (not regular `fetch`)
- Handle redirects to login when both tokens expire
- Don't manually manage tokens (cookies handle it)

### 🔒 Security Features

- **httpOnly cookies**: Tokens not accessible via JavaScript
- **Secure flag**: HTTPS only in production
- **SameSite**: CSRF protection
- **Short-lived access tokens**: Minimize damage if compromised
- **Separate refresh tokens**: Can revoke without affecting access

## Testing Token Refresh

### Test Access Token Expiry

1. Login to get tokens
2. Wait 1 hour (or manually expire token)
3. Make API request
4. Should automatically refresh and succeed

### Test Refresh Token Expiry

1. Login to get tokens
2. Wait 7 days (or manually expire refresh token)
3. Make API request
4. Should redirect to login page

### Manual Testing

```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  -c cookies.txt

# 2. Get user (uses access token)
curl -X GET http://localhost:3000/api/auth/me \
  -b cookies.txt

# 3. Refresh tokens manually
curl -X POST http://localhost:3000/api/auth/refresh \
  -b cookies.txt \
  -c cookies.txt

# 4. Get user again (with new tokens)
curl -X GET http://localhost:3000/api/auth/me \
  -b cookies.txt
```

## Summary

✅ **Automatic token refresh** on frontend and backend  
✅ **Seamless user experience** - no manual token management  
✅ **Secure** - httpOnly cookies, short-lived access tokens  
✅ **Production ready** - handles all edge cases

Just use `authenticatedFetch` for all API calls and everything works automatically! 🚀
