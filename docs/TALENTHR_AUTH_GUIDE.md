# TalentHR Authentication Guide

## Overview

TalentHR uses a role-based authentication system with JWT tokens. The system supports two primary user roles:
- **Company Admin**: Full system access
- **Employer**: HR management access within assigned company

## Authentication Flow

### Sign Up Flow

1. User selects role (Company Admin or Employer)
2. User provides:
   - Email
   - Password (min 8 characters)
   - Name
   - Company name (for Company Admin) or Company code (for Employer)
3. System validates input
4. Password is hashed with bcrypt
5. User is created with selected role
6. JWT tokens are generated and set as HttpOnly cookies
7. User is redirected to appropriate dashboard

### Login Flow

1. User selects role
2. User provides email and password
3. System validates credentials
4. If valid, JWT tokens are generated
5. User is redirected to role-specific dashboard

### Token Management

- **Access Token**: Short-lived (15 minutes), contains user ID and role
- **Refresh Token**: Long-lived (7 days), stored in HttpOnly cookie
- **Auto Refresh**: Access token is automatically refreshed using refresh token
- **Logout**: Both tokens are cleared from cookies

## API Endpoints

### POST /api/auth/signup

**Request Body:**
```json
{
  "email": "admin@company.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "role": "company_admin",
  "companyName": "Acme Corp" // Required for company_admin
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "id": "user_id",
    "email": "admin@company.com",
    "name": "John Doe",
    "role": "company_admin"
  }
}
```

### POST /api/auth/login

**Request Body:**
```json
{
  "email": "admin@company.com",
  "password": "SecurePass123!",
  "role": "company_admin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "email": "admin@company.com",
    "name": "John Doe",
    "role": "company_admin"
  }
}
```

### GET /api/auth/me

**Headers:**
- Cookie: accessToken (automatically sent)

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "email": "admin@company.com",
    "name": "John Doe",
    "role": "company_admin"
  }
}
```

### POST /api/auth/refresh

**Headers:**
- Cookie: refreshToken (automatically sent)

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed"
}
```

## Role-Based Access Control

### Middleware Protection

API routes can be protected using role-based middleware:

```typescript
import { authenticateRequest } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;
  
  const { user } = auth.data;
  
  // Check role
  if (user.role !== 'company_admin') {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 403 }
    );
  }
  
  // Protected route logic
}
```

## Frontend Usage

### Login Component

```typescript
import { login } from '@/lib/api-client';

const handleLogin = async (email: string, password: string, role: string) => {
  try {
    const response = await login({ email, password, role });
    if (response.success) {
      // Redirect based on role
      router.push(`/dashboard/${role === 'company_admin' ? 'admin' : 'employer'}`);
    }
  } catch (error) {
    // Handle error
  }
};
```

### Protected Routes

Use middleware to protect routes:

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  // Check authentication
  // Redirect to login if not authenticated
}
```

## Security Considerations

1. **Password Requirements**
   - Minimum 8 characters
   - Recommended: Mix of uppercase, lowercase, numbers, special characters

2. **Token Storage**
   - Tokens stored in HttpOnly cookies (not accessible via JavaScript)
   - Secure flag enabled in production
   - SameSite: 'lax' for CSRF protection

3. **Rate Limiting** (Future)
   - Limit login attempts per IP
   - Lock account after multiple failed attempts

4. **Input Validation**
   - All inputs validated with Zod schemas
   - Email format validation
   - SQL injection prevention (MongoDB)

## Error Handling

### Common Errors

- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Invalid credentials or expired token
- `403 Forbidden`: Insufficient permissions
- `409 Conflict`: User already exists
- `500 Internal Server Error`: Server error

### Error Response Format

```json
{
  "success": false,
  "message": "Error message here"
}
```

