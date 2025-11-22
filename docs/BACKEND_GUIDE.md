# Backend Architecture Guide

## How Next.js Handles Backend

**You DON'T need a separate backend server!** Next.js has built-in API routes that act as your backend.

### Architecture Overview

```
┌─────────────────────────────────────┐
│         Next.js Application         │
│                                     │
│  ┌──────────────┐  ┌─────────────┐ │
│  │   Frontend   │  │   Backend   │ │
│  │   (React)    │  │  (API Routes)│ │
│  │              │  │              │ │
│  │  Components  │  │  /api/auth/ │ │
│  │  Pages       │  │  /api/*     │ │
│  └──────────────┘  └─────────────┘ │
│                                     │
│         Single Server Process       │
└─────────────────────────────────────┘
```

### How It Works

1. **Single Server**: Next.js runs both frontend and backend on the same server
2. **API Routes**: Files in `app/api/` become API endpoints
3. **Same Port**: Everything runs on one port (default: 3000)

### Your Current Setup

```
frontend/
├── app/
│   ├── api/              ← Backend API Routes
│   │   └── auth/
│   │       ├── login/route.ts
│   │       ├── signup/route.ts
│   │       ├── logout/route.ts
│   │       ├── refresh/route.ts
│   │       └── me/route.ts
│   ├── (auth)/           ← Frontend Pages
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   └── home/page.tsx
├── lib/                   ← Shared utilities
│   ├── db.ts             ← MongoDB connection
│   ├── jwt.ts            ← JWT utilities
│   └── auth.ts           ← Auth helpers
└── models/                ← Database models
    └── User.ts
```

## Running the Application

### Development Mode

```bash
npm run dev
```

This starts:

- Frontend on: `http://localhost:3000`
- API routes on: `http://localhost:3000/api/*`

**Example API endpoints:**

- `POST http://localhost:3000/api/auth/login`
- `POST http://localhost:3000/api/auth/signup`
- `GET http://localhost:3000/api/auth/me`

### Production Mode

```bash
npm run build    # Build the application
npm run start    # Start production server
```

## API Route Structure

Next.js API routes use the **App Router** pattern:

```
app/api/auth/login/route.ts
                    └─ route.ts = HTTP handler file
                └─ login = endpoint name
            └─ auth = route group
        └─ api = API routes folder
```

### HTTP Methods

Each `route.ts` file can export functions for different HTTP methods:

```typescript
// app/api/auth/login/route.ts
export async function POST(request: NextRequest) {
  // Handle POST requests
}

export async function GET(request: NextRequest) {
  // Handle GET requests
}
```

## Environment Setup

### Required Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/your-db-name
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# JWT Secrets (generate secure keys)
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRES_IN=3600
BCRYPT_SALT_ROUNDS=10

# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Generate Secure Secrets

```bash
# Generate JWT secrets
openssl rand -base64 32
```

## How API Routes Work

### Request Flow

```
1. Frontend makes request
   fetch('/api/auth/login', { ... })

2. Next.js routes to
   app/api/auth/login/route.ts

3. Route handler processes request
   - Connects to MongoDB
   - Validates data
   - Generates JWT tokens
   - Sets cookies
   - Returns response

4. Response sent back to frontend
```

### Example: Login Flow

```typescript
// Frontend (components/auth/login-form.tsx)
const response = await fetch("/api/auth/login", {
  method: "POST",
  credentials: "include", // Important for cookies
  body: JSON.stringify({ email, password }),
});

// Backend (app/api/auth/login/route.ts)
export async function POST(request: NextRequest) {
  await connectDB(); // Connect to MongoDB
  const body = await request.json();
  // ... authentication logic
  return NextResponse.json({ success: true });
}
```

## Advantages of Next.js API Routes

✅ **No Separate Server**: Everything in one codebase  
✅ **Type Safety**: Full TypeScript support  
✅ **Automatic Routing**: File-based routing  
✅ **Serverless Ready**: Can deploy to Vercel, AWS Lambda, etc.  
✅ **Shared Code**: Frontend and backend can share utilities  
✅ **Fast Development**: No need to manage multiple servers

## When You Might Need a Separate Backend

You might consider a separate Express/Fastify server if:

- You need WebSocket support (Next.js has limited support)
- You have very complex middleware requirements
- You need to run on a different port
- You have existing Express/Fastify codebase

**For most applications, Next.js API routes are perfect!**

## Database Connection

MongoDB connection is handled in `lib/db.ts`:

- **Connection Pooling**: Reuses connections
- **Hot Reload Safe**: Works with Next.js dev server
- **Production Ready**: Optimized for serverless

## Testing Your Backend

### Using curl

```bash
# Signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt

# Get current user (with cookies)
curl -X GET http://localhost:3000/api/auth/me \
  -b cookies.txt
```

### Using Browser DevTools

1. Open Network tab
2. Make a request from your frontend
3. Check the request/response
4. Cookies are automatically included

## Troubleshooting

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
mongosh  # or mongo

# Test connection string
mongosh "your-connection-string"
```

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Environment Variables Not Loading

- Make sure `.env` is in the `frontend/` directory
- Restart the dev server after changing `.env`
- Use `NEXT_PUBLIC_` prefix for client-side variables

## Production Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Other Platforms

- **Docker**: Build and run as container
- **AWS**: Use AWS Amplify or Lambda
- **Railway/Render**: Connect GitHub repo

## Summary

✅ **No separate backend server needed**  
✅ **Everything runs on one port**  
✅ **API routes in `app/api/`**  
✅ **Just run `npm run dev`**  
✅ **MongoDB connection handled automatically**  
✅ **Production ready**

Your backend is already set up and working! Just add your MongoDB URI to `.env` and you're good to go! 🚀
