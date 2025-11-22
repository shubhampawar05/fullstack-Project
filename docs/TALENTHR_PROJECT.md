# TalentHR Clone - Project Documentation

## Project Overview

TalentHR is a comprehensive Human Resources Management System (HRMS) designed for companies to manage their workforce, recruitment, employee lifecycle, and HR operations.

## Core Features

### Phase 1: Authentication & User Management
- **User Roles:**
  - **Company Admin**: Full system access, can manage all company settings, users, and data
  - **Employer/HR Manager**: Can manage employees, recruitment, and HR operations within their assigned company
  - **Employee**: (Future) Access to personal dashboard, leave requests, etc.

- **Authentication Flow:**
  - Sign up with role selection (Company Admin or Employer)
  - Secure login with JWT tokens
  - Role-based access control (RBAC)
  - Token refresh mechanism
  - Password reset functionality (Future)

### Phase 2: Company Management (Future)
- Company profile and settings
- Multi-company support
- Company branding and customization

### Phase 3: Employee Management (Future)
- Employee database
- Employee profiles and documents
- Organizational chart
- Department management

### Phase 4: Recruitment (Future)
- Job posting and management
- Applicant tracking system (ATS)
- Interview scheduling
- Candidate evaluation

### Phase 5: Attendance & Leave Management (Future)
- Time tracking
- Leave requests and approvals
- Attendance reports

### Phase 6: Payroll & Benefits (Future)
- Salary management
- Benefits administration
- Payslip generation

## Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: Material-UI (MUI) v5/v6
- **State Management**: React Context / Zustand (Future)
- **Form Handling**: React Hook Form + Zod
- **Styling**: MUI Theme System
- **Icons**: MUI Icons

### Backend
- **Runtime**: Node.js
- **Framework**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (Access + Refresh Tokens)
- **Password Hashing**: bcrypt
- **Validation**: Zod

### Infrastructure
- **Containerization**: Docker
- **Database**: MongoDB (Docker container)
- **Environment**: Development, Staging, Production

## Project Structure

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx          # Login page (role selection)
│   │   └── signup/
│   │       └── page.tsx          # Signup page (role selection)
│   ├── api/
│   │   └── auth/
│   │       ├── login/
│   │       │   └── route.ts      # Login endpoint
│   │       ├── signup/
│   │       │   └── route.ts      # Signup endpoint
│   │       ├── refresh/
│   │       │   └── route.ts      # Token refresh
│   │       └── me/
│   │           └── route.ts     # Current user info
│   ├── dashboard/
│   │   ├── admin/                # Company Admin dashboard
│   │   └── employer/             # Employer dashboard
│   └── layout.tsx
├── components/
│   ├── auth/
│   │   ├── login-form.tsx        # MUI login form
│   │   └── signup-form.tsx       # MUI signup form
│   └── layout/
│       └── auth-layout.tsx       # Auth page layout
├── lib/
│   ├── db.ts                     # MongoDB connection
│   ├── jwt.ts                    # JWT utilities
│   ├── auth.ts                   # Auth utilities
│   └── api-client.ts             # API client
├── models/
│   ├── User.ts                   # User model with roles
│   └── Company.ts                # Company model (Future)
├── types/
│   └── auth.ts                   # TypeScript types
└── docs/
    └── TALENTHR_PROJECT.md       # This file
```

## User Roles & Permissions

### Company Admin
- Full access to all company features
- Manage company settings
- Create and manage Employer accounts
- Access all employee data
- Manage all HR operations

### Employer/HR Manager
- Manage employees within assigned company
- Post jobs and manage recruitment
- Process leave requests
- View reports and analytics
- Limited company settings access

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration with role
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout user

### Future Endpoints
- Company management
- Employee management
- Recruitment
- Attendance & Leave
- Payroll

## Security Best Practices

1. **Password Security**
   - Minimum 8 characters
   - Bcrypt hashing with salt rounds
   - Password strength validation

2. **JWT Tokens**
   - Short-lived access tokens (15 minutes)
   - Long-lived refresh tokens (7 days)
   - HttpOnly cookies for token storage
   - Secure flag in production

3. **API Security**
   - Input validation with Zod
   - Rate limiting (Future)
   - CORS configuration
   - Role-based access control

4. **Database**
   - Indexed fields for performance
   - Input sanitization
   - Connection pooling

## Development Guidelines

### Code Standards
- TypeScript strict mode
- ESLint + Prettier
- Consistent naming conventions
- Component-based architecture
- Reusable utility functions

### Testing (Future)
- Unit tests for utilities
- Integration tests for API routes
- E2E tests for critical flows

### Deployment
- Docker containerization
- Environment variable management
- Database migrations
- CI/CD pipeline (Future)

## Getting Started

1. Install dependencies: `npm install`
2. Set up environment variables (see `.env.example`)
3. Start MongoDB: `docker-compose up -d mongodb`
4. Run development server: `npm run dev`
5. Access application: `http://localhost:3000`

## Next Steps

1. ✅ Project documentation
2. ✅ MUI setup and theme configuration
3. ✅ User model with roles
4. ✅ Authentication API endpoints
5. ✅ Login/Signup UI with MUI
6. ⏳ Company Admin dashboard
7. ⏳ Employer dashboard
8. ⏳ Company management
9. ⏳ Employee management

