# TalentHR - System Design & Architecture

## Overview

This document defines the complete system architecture, data models, user flows, and design patterns for TalentHR HRMS.

---

## 1. Core Data Models

### 1.1 Company Model

```typescript
interface Company {
  _id: ObjectId;
  name: string; // Unique company name
  slug: string; // URL-friendly unique identifier
  domain?: string; // Optional company domain for email validation
  status: "active" | "pending" | "suspended";
  settings: {
    timezone: string;
    currency: string;
    dateFormat: string;
    // ... other company settings
  };
  subscription?: {
    plan: "free" | "basic" | "premium";
    expiresAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

**Key Points:**

- Company name must be unique
- Slug is auto-generated from name (e.g., "Acme Corp" → "acme-corp")
- Status controls company access

### 1.2 User Model (Updated)

```typescript
interface User {
  _id: ObjectId;
  email: string; // Unique email
  password: string; // Hashed
  name: string;
  role: UserRole;
  companyId: ObjectId; // Reference to Company (REQUIRED)
  status: "active" | "inactive" | "pending";
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

type UserRole =
  | "company_admin" // Full company access
  | "hr_manager" // HR operations (renamed from "employer")
  | "recruiter" // Recruitment only
  | "manager" // Team management
  | "employee"; // Basic employee access
```

**Key Changes:**

- `companyId` is now REQUIRED (no user without company)
- `companyName` removed (use companyId reference)
- Role expanded for future roles
- Status field for user management

### 1.3 Invitation Model (NEW)

```typescript
interface Invitation {
  _id: ObjectId;
  companyId: ObjectId; // Which company
  email: string; // Invited email
  role: UserRole; // Role being invited for
  invitedBy: ObjectId; // User who created invitation
  token: string; // Secure unique token
  status: "pending" | "accepted" | "expired" | "cancelled";
  expiresAt: Date; // Invitation expiry (e.g., 7 days)
  acceptedAt?: Date;
  acceptedBy?: ObjectId; // User who accepted
  createdAt: Date;
  updatedAt: Date;
}
```

**Key Points:**

- Token is unique, secure, non-guessable
- Expires after set time (default: 7 days)
- One invitation per email per company (prevent duplicates)
- Role is set at invitation creation

---

## 2. User Flows

### 2.1 Company Admin Signup Flow

```
1. User visits /signup
2. Selects "Company Admin" role
3. Enters:
   - Name
   - Email
   - Company Name (NEW company)
   - Password
4. System checks:
   - Email not already registered
   - Company name not already taken
5. If valid:
   - Create Company (status: "active")
   - Create User (role: "company_admin", companyId: newCompany._id)
   - Generate JWT tokens
   - Redirect to /dashboard/admin
6. If company exists:
   - Show error: "Company already exists. Contact support or use invitation link."
```

**API Endpoint:** `POST /api/auth/signup`

- Validates company name uniqueness
- Creates company + user atomically
- Returns user with company info

### 2.2 Employer/HR Manager Signup Flow (Via Invitation)

```
1. Company Admin creates invitation:
   - Goes to /dashboard/admin/invitations
   - Clicks "Invite User"
   - Enters: Email, Selects Role (HR Manager, Recruiter, etc.)
   - System generates invitation link

2. Invitation email sent (or link copied):
   - Link: /signup?token=abc123xyz
   - Contains encrypted role + company info

3. User clicks invitation link:
   - Lands on /signup page
   - Form pre-filled with:
     * Role (read-only, from invitation)
     * Company name (read-only, from invitation)
   - User enters:
     * Name
     * Email (pre-filled, can't change)
     * Password
     * Confirm Password

4. System validates:
   - Token is valid and not expired
   - Email matches invitation
   - User doesn't already exist

5. If valid:
   - Create User (role from invitation, companyId from invitation)
   - Mark invitation as "accepted"
   - Generate JWT tokens
   - Redirect to appropriate dashboard

6. If invalid:
   - Show error: "Invalid or expired invitation link"
```

**API Endpoints:**

- `POST /api/invitations` - Create invitation (Admin only)
- `GET /api/invitations/:token` - Validate invitation token
- `POST /api/auth/signup` - Accept invitation and create user

### 2.3 Login Flow

```
1. User visits /login
2. Selects role (Company Admin, HR Manager, etc.)
3. Enters email + password
4. System validates:
   - User exists with that email + role
   - Password matches
   - User is active
   - Company is active
5. If valid:
   - Generate JWT tokens
   - Redirect to role-specific dashboard
```

**API Endpoint:** `POST /api/auth/login`

- Validates role matches user's actual role
- Checks company status

---

## 3. Role-Based Access Control (RBAC)

### 3.1 Role Hierarchy & Permissions

| Role              | Company Settings | User Management  | Employees    | Recruitment  | Reports      | Payroll      |
| ----------------- | ---------------- | ---------------- | ------------ | ------------ | ------------ | ------------ |
| **Company Admin** | ✅ Full          | ✅ Full          | ✅ Full      | ✅ Full      | ✅ Full      | ✅ Full      |
| **HR Manager**    | ❌ View Only     | ✅ Invite/Manage | ✅ Full      | ✅ Full      | ✅ Full      | ✅ View      |
| **Recruiter**     | ❌ No Access     | ❌ No Access     | ❌ View Only | ✅ Full      | ✅ Limited   | ❌ No Access |
| **Manager**       | ❌ No Access     | ❌ No Access     | ✅ Team Only | ❌ No Access | ✅ Team Only | ❌ No Access |
| **Employee**      | ❌ No Access     | ❌ No Access     | ❌ Self Only | ❌ No Access | ❌ Self Only | ❌ Self Only |

### 3.2 Permission Implementation

```typescript
// Middleware for role-based access
export async function requireRole(
  request: NextRequest,
  allowedRoles: UserRole[]
): Promise<NextResponse | null> {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;

  const { user } = auth.data;

  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json(
      { success: false, message: "Insufficient permissions" },
      { status: 403 }
    );
  }

  return null; // Access granted
}
```

---

## 4. API Endpoints Design

### 4.1 Authentication Endpoints

```
POST   /api/auth/signup
  - Body: { name, email, password, role, companyName? }
  - Creates company (if admin) or uses invitation (if employer)

POST   /api/auth/login
  - Body: { email, password, role }
  - Returns: { success, user, tokens }

POST   /api/auth/refresh
  - Refreshes access token

GET    /api/auth/me
  - Returns current user with company info

POST   /api/auth/logout
  - Clears tokens
```

### 4.2 Company Endpoints

```
GET    /api/companies/me
  - Returns current user's company

PUT    /api/companies/me
  - Update company settings (Admin only)

GET    /api/companies/me/users
  - List all users in company (Admin/HR only)
```

### 4.3 Invitation Endpoints

```
POST   /api/invitations
  - Body: { email, role }
  - Creates invitation (Admin/HR only)
  - Returns: { invitation, link }

GET    /api/invitations
  - List all invitations for company (Admin/HR only)

GET    /api/invitations/:token
  - Validate invitation token
  - Returns: { valid, company, role, email }

POST   /api/invitations/:token/accept
  - Accept invitation and create user

DELETE /api/invitations/:id
  - Cancel invitation (Admin/HR only)
```

---

## 5. Database Schema Relationships

```
Company (1) ──< (Many) Users
Company (1) ──< (Many) Invitations
User (1) ──< (Many) Invitations (as invitedBy)
```

**Indexes:**

- `Company.slug` - Unique index
- `Company.name` - Unique index
- `User.email` - Unique index
- `User.companyId` - Index
- `Invitation.token` - Unique index
- `Invitation.email + companyId` - Compound unique index

---

## 6. Security Considerations

### 6.1 Invitation Token Security

- Token: Cryptographically secure random string (32+ chars)
- Stored hashed in database (like passwords)
- Expires after 7 days
- Single-use (marked as accepted after use)
- Validated on signup

### 6.2 Company Name Validation

- Case-insensitive uniqueness check
- Slug generation: lowercase, replace spaces with hyphens
- Prevent reserved names (admin, api, etc.)
- Minimum length: 2 characters
- Maximum length: 50 characters

### 6.3 Email Validation

- Standard email format validation
- Domain validation (optional, if company.domain set)
- Prevent duplicate emails across system

---

## 7. UI/UX Design Patterns

### 7.1 Signup Page States

**State 1: Direct Signup (Company Admin)**

- Role selector: "Company Admin"
- Fields: Name, Email, Company Name, Password
- Submit creates company + user

**State 2: Invitation Signup (HR/Employee)**

- URL: `/signup?token=abc123`
- Role: Pre-filled, read-only (from invitation)
- Company: Pre-filled, read-only (from invitation)
- Email: Pre-filled, read-only (from invitation)
- Fields: Name, Password, Confirm Password
- Submit accepts invitation + creates user

### 7.2 Dashboard Routes

```
/dashboard/admin          - Company Admin Dashboard
/dashboard/hr            - HR Manager Dashboard
/dashboard/recruiter     - Recruiter Dashboard
/dashboard/manager       - Manager Dashboard
/dashboard/employee      - Employee Dashboard
```

### 7.3 Invitation Management UI

**Admin Dashboard → Users → Invitations**

- List of pending invitations
- Create new invitation form
- Resend invitation
- Cancel invitation
- View invitation link (copy to clipboard)

---

## 8. Implementation Phases

### Phase 1: Foundation (Current)

- ✅ User model with roles
- ✅ Basic authentication
- ⏳ Company model
- ⏳ Invitation model
- ⏳ Updated signup flow

### Phase 2: Invitation System

- Invitation creation
- Invitation validation
- Invitation-based signup
- Email notifications (optional)

### Phase 3: Company Management

- Company settings
- User management
- Role management

### Phase 4: Core HR Features

- Employee management
- Department management
- Organizational chart

---

## 9. Error Handling

### 9.1 Signup Errors

```typescript
// Company Admin Signup
-"Company name already exists"(409) -
  "Email already registered"(409) -
  "Invalid company name"(400) -
  // Invitation Signup
  "Invalid invitation token"(400) -
  "Invitation expired"(400) -
  "Invitation already used"(400) -
  "Email mismatch"(400);
```

### 9.2 Login Errors

```typescript
-"Invalid email or password"(401) -
  "Account inactive"(403) -
  "Company suspended"(403) -
  "Role mismatch"(401);
```

---

## 10. Testing Strategy

### 10.1 Unit Tests

- Company name uniqueness
- Invitation token generation
- Role validation
- Password hashing

### 10.2 Integration Tests

- Complete signup flows
- Invitation acceptance
- Role-based access control
- Company creation

### 10.3 E2E Tests

- Company Admin signup → Create company
- Admin invites HR → HR signs up
- Login with different roles
- Permission checks

---

## Questions Resolved

✅ **How to allocate roles in invitations?**

- Role is specified when Company Admin creates invitation
- Invitation link contains role information
- User gets that role when they accept invitation

✅ **Company uniqueness?**

- Company name must be unique
- Slug auto-generated and unique
- Prevents duplicate companies

✅ **Employer signup flow?**

- No manual company code
- Uses secure invitation link
- Role pre-determined by admin

✅ **Multiple admins per company?**

- Currently: One admin per company (first signup)
- Future: Can add "Add Admin" feature with proper verification

---

## Next Steps

1. Create Company model
2. Create Invitation model
3. Update User model (add companyId, remove companyName)
4. Update signup API to handle company creation
5. Create invitation API endpoints
6. Update signup form to handle invitation tokens
7. Create invitation management UI in admin dashboard
