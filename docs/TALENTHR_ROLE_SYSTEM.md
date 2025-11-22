# TalentHR - Role System & Invitation Flow

## Role Allocation in Invitations

### How It Works

When a **Company Admin** invites someone, they specify:

1. **Email** - Who to invite
2. **Role** - What role they'll have (HR Manager, Recruiter, Employee, etc.)

The invitation link contains this information, so when the user signs up, they automatically get the correct role.

---

## Example Flow

### Step 1: Company Admin Creates Invitation

**Admin goes to:** `/dashboard/admin/invitations`

**Clicks:** "Invite User"

**Form appears:**

```
┌─────────────────────────────────────┐
│ Invite New User                     │
├─────────────────────────────────────┤
│ Email: [john@example.com      ]     │
│                                       │
│ Role: [Select Role ▼]                │
│   • HR Manager                       │
│   • Recruiter                        │
│   • Manager                          │
│   • Employee                         │
│                                       │
│ [Cancel]  [Send Invitation]         │
└─────────────────────────────────────┘
```

**Admin selects:** "HR Manager" for john@example.com

**System generates:**

- Secure token: `abc123xyz789`
- Invitation link: `https://talenthrm.com/signup?token=abc123xyz789`

---

### Step 2: Invitation Link Contains Role Info

When user clicks the link, the system:

1. Validates the token
2. Retrieves invitation data:
   ```json
   {
     "email": "john@example.com",
     "role": "hr_manager",
     "company": "Acme Corp",
     "valid": true,
     "expiresAt": "2024-12-01"
   }
   ```

---

### Step 3: Signup Form Pre-fills with Role

**User lands on:** `/signup?token=abc123xyz789`

**Form shows:**

```
┌─────────────────────────────────────┐
│ Join Acme Corp                      │
├─────────────────────────────────────┤
│ You've been invited as:              │
│ [HR Manager] (read-only)             │
│                                       │
│ Company: Acme Corp (read-only)       │
│                                       │
│ Email: john@example.com (read-only) │
│                                       │
│ Full Name: [John Doe          ]      │
│                                       │
│ Password: [••••••••          ]        │
│                                       │
│ Confirm Password: [••••••••   ]       │
│                                       │
│ [Create Account]                     │
└─────────────────────────────────────┘
```

**Key Points:**

- Role is **read-only** (can't change)
- Company is **read-only** (can't change)
- Email is **read-only** (must match invitation)
- User only enters: Name, Password

---

### Step 4: Account Created with Correct Role

When user submits:

1. System validates token is valid
2. Creates user with:
   - `email`: "john@example.com"
   - `role`: "hr_manager" (from invitation)
   - `companyId`: Acme Corp's ID (from invitation)
3. Marks invitation as "accepted"
4. Redirects to `/dashboard/hr`

---

## Available Roles

### Current Roles (Phase 1)

| Role              | Code            | Description         | Who Can Invite            |
| ----------------- | --------------- | ------------------- | ------------------------- |
| **Company Admin** | `company_admin` | Full company access | Self-signup only          |
| **HR Manager**    | `hr_manager`    | HR operations       | Company Admin             |
| **Recruiter**     | `recruiter`     | Recruitment only    | Company Admin, HR Manager |
| **Manager**       | `manager`       | Team management     | Company Admin, HR Manager |
| **Employee**      | `employee`      | Basic access        | Company Admin, HR Manager |

### Future Roles (Phase 2+)

- **Payroll Manager** - Payroll operations
- **Finance Manager** - Financial operations
- **Department Head** - Department-specific access
- **Team Lead** - Team-specific access

---

## Role Selection in Invitation Form

### UI Design

```typescript
<Select label="Role" value={selectedRole} onChange={handleRoleChange}>
  <MenuItem value="hr_manager">
    <Box display="flex" alignItems="center" gap={1}>
      <PeopleIcon />
      <Box>
        <Typography>HR Manager</Typography>
        <Typography variant="caption" color="text.secondary">
          Full HR operations access
        </Typography>
      </Box>
    </Box>
  </MenuItem>

  <MenuItem value="recruiter">
    <Box display="flex" alignItems="center" gap={1}>
      <WorkIcon />
      <Box>
        <Typography>Recruiter</Typography>
        <Typography variant="caption" color="text.secondary">
          Recruitment and hiring only
        </Typography>
      </Box>
    </Box>
  </MenuItem>

  <MenuItem value="manager">
    <Box display="flex" alignItems="center" gap={1}>
      <SupervisorAccountIcon />
      <Box>
        <Typography>Manager</Typography>
        <Typography variant="caption" color="text.secondary">
          Team management access
        </Typography>
      </Box>
    </Box>
  </MenuItem>

  <MenuItem value="employee">
    <Box display="flex" alignItems="center" gap={1}>
      <PersonIcon />
      <Box>
        <Typography>Employee</Typography>
        <Typography variant="caption" color="text.secondary">
          Basic employee access
        </Typography>
      </Box>
    </Box>
  </MenuItem>
</Select>
```

---

## Permission Matrix

### Who Can Invite What Roles?

| Inviter Role      | Can Invite                                           |
| ----------------- | ---------------------------------------------------- |
| **Company Admin** | All roles (HR Manager, Recruiter, Manager, Employee) |
| **HR Manager**    | Recruiter, Manager, Employee                         |
| **Recruiter**     | ❌ Cannot invite                                     |
| **Manager**       | ❌ Cannot invite                                     |
| **Employee**      | ❌ Cannot invite                                     |

---

## Invitation Token Structure

### Token Payload (Encrypted in URL)

```typescript
interface InvitationTokenPayload {
  invitationId: string; // Invitation document ID
  email: string; // Invited email
  role: UserRole; // Role to assign
  companyId: string; // Company ID
  expiresAt: number; // Unix timestamp
}
```

### Security

- Token is **cryptographically secure** (32+ random characters)
- Stored **hashed** in database (like passwords)
- **Expires** after 7 days
- **Single-use** (marked as accepted)
- **Validated** on every signup attempt

---

## API Flow

### 1. Create Invitation

```http
POST /api/invitations
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "email": "john@example.com",
  "role": "hr_manager"
}

Response:
{
  "success": true,
  "invitation": {
    "id": "inv_123",
    "email": "john@example.com",
    "role": "hr_manager",
    "link": "https://talenthrm.com/signup?token=abc123xyz789",
    "expiresAt": "2024-12-01T00:00:00Z"
  }
}
```

### 2. Validate Invitation Token

```http
GET /api/invitations/validate?token=abc123xyz789

Response:
{
  "valid": true,
  "invitation": {
    "email": "john@example.com",
    "role": "hr_manager",
    "company": {
      "id": "comp_123",
      "name": "Acme Corp"
    },
    "expiresAt": "2024-12-01T00:00:00Z"
  }
}
```

### 3. Accept Invitation (Signup)

```http
POST /api/auth/signup
Content-Type: application/json

{
  "token": "abc123xyz789",
  "name": "John Doe",
  "password": "SecurePass123!"
}

Response:
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "hr_manager",
    "company": {
      "id": "comp_123",
      "name": "Acme Corp"
    }
  }
}
```

---

## Summary

✅ **Role is specified by Admin** when creating invitation
✅ **Invitation link contains role** information
✅ **User gets that role** automatically when they sign up
✅ **No manual role selection** for invited users
✅ **Secure token-based** invitation system
✅ **Prevents role confusion** - role is set by admin, not user

This ensures proper role allocation and prevents users from signing up with wrong roles!
