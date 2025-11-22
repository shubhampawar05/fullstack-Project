# TalentHR - Human Resources Management System

A comprehensive HRMS built with Next.js, Material-UI, and MongoDB.

## Features

- **Role-Based Authentication**: Company Admin and Employer roles
- **Secure JWT Authentication**: Access and refresh token system
- **Modern UI**: Built with Material-UI (MUI)
- **Production Ready**: Scalable architecture with proper error handling

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Material-UI
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with HttpOnly cookies
- **Validation**: Zod schemas
- **Form Handling**: React Hook Form

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB (via Docker or local installation)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file in the `frontend` directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/talenthrm
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
   NODE_ENV=development
   ```

3. **Start MongoDB:**
   ```bash
   # Using Docker
   docker-compose up -d mongodb
   
   # Or use local MongoDB
   mongod
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/          # Login page
│   │   └── signup/         # Signup page
│   ├── api/
│   │   └── auth/          # Authentication API endpoints
│   ├── dashboard/
│   │   ├── admin/         # Company Admin dashboard
│   │   └── employer/      # Employer dashboard
│   └── layout.tsx         # Root layout
├── components/
│   ├── auth/              # Authentication components
│   └── theme-provider.tsx # MUI theme provider
├── lib/
│   ├── db.ts              # MongoDB connection
│   ├── jwt.ts             # JWT utilities
│   └── theme.tsx           # MUI theme configuration
├── models/
│   └── User.ts            # User model with roles
├── types/
│   └── auth.ts            # TypeScript types
└── docs/                  # Documentation
```

## User Roles

### Company Admin
- Full system access
- Manage company settings
- Create and manage Employer accounts
- Access all employee data

### Employer/HR Manager
- Manage employees within assigned company
- Post jobs and manage recruitment
- Process leave requests
- View reports and analytics

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Code Style

- TypeScript strict mode
- ESLint + Prettier
- Consistent naming conventions

## Security

- Passwords hashed with bcrypt (salt rounds: 10)
- JWT tokens stored in HttpOnly cookies
- Input validation with Zod
- Role-based access control

## Next Steps

1. ✅ Authentication system
2. ⏳ Company management
3. ⏳ Employee management
4. ⏳ Recruitment system
5. ⏳ Attendance & Leave management
6. ⏳ Payroll system

## Documentation

See the `docs/` directory for detailed documentation:
- `TALENTHR_PROJECT.md` - Project overview
- `TALENTHR_AUTH_GUIDE.md` - Authentication guide

## License

Private project - All rights reserved
