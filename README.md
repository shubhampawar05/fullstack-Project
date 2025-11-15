This is a [Next.js](https://nextjs.org) project with full-stack authentication setup.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

**Required variables:**

- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens (generate with `openssl rand -base64 32`)
- `JWT_REFRESH_SECRET` - Secret key for refresh tokens

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

**That's it!** Both frontend and backend run on the same server. No separate backend needed!

## 📁 Project Structure

```
frontend/
├── app/
│   ├── api/              # Backend API routes (Next.js API Routes)
│   │   └── auth/        # Authentication endpoints
│   ├── (auth)/          # Auth pages (login, signup)
│   └── home/            # Protected home page
├── components/           # React components
├── lib/                 # Utilities (db, jwt, auth, config)
├── models/              # MongoDB models
└── types/               # TypeScript types
```

## 🔑 Features

- ✅ **Full-stack authentication** with JWT (access + refresh tokens)
- ✅ **Password hashing** with bcrypt
- ✅ **MongoDB** integration with Mongoose
- ✅ **Cookie-based** token storage (httpOnly, secure)
- ✅ **Type-safe** with TypeScript
- ✅ **shadcn/ui** components
- ✅ **Form validation** with Zod + react-hook-form

## 📚 Backend Architecture

**No separate backend server needed!** Next.js API routes handle everything.

- API routes in `app/api/` become backend endpoints
- Everything runs on one port (3000)
- See `BACKEND_GUIDE.md` for detailed explanation

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Check TypeScript types

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
