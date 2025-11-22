# Deployment Guide

This guide will help you deploy your Next.js application to free hosting services.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Docker Setup](#docker-setup)
3. [Deployment Options](#deployment-options)
   - [Vercel (Recommended)](#vercel-recommended)
   - [Railway](#railway)
   - [Render](#render)
   - [Fly.io](#flyio)
4. [Environment Variables](#environment-variables)
5. [MongoDB Setup](#mongodb-setup)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Node.js 20+ installed
- Docker installed (for local testing)
- Git repository set up
- MongoDB database (free tier available)

---

## Docker Setup

### 1. Build Docker Image Locally

```bash
cd frontend
docker build -t fullstack-app .
```

### 2. Run Docker Container Locally

```bash
docker run -p 3000:3000 \
  -e MONGODB_URI="your_mongodb_uri" \
  -e JWT_SECRET="your_jwt_secret" \
  -e JWT_REFRESH_SECRET="your_refresh_secret" \
  fullstack-app
```

### 3. Using Docker Compose

```bash
# Create .env file with your variables
cp .env.example .env
# Edit .env with your values

# Run with docker-compose
docker-compose up -d
```

---

## Deployment Options

### Vercel (Recommended) ⭐

**Best for:** Next.js applications, automatic deployments, zero configuration

**Steps:**

1. **Sign up at [vercel.com](https://vercel.com)**

2. **Install Vercel CLI:**

   ```bash
   npm i -g vercel
   ```

3. **Deploy:**

   ```bash
   cd frontend
   vercel
   ```

4. **Add Environment Variables:**
   - Go to your project dashboard
   - Settings → Environment Variables
   - Add all variables from `.env.example`

5. **Connect MongoDB:**
   - Use MongoDB Atlas (free tier)
   - Get connection string
   - Add as `MONGODB_URI`

**Pros:**

- ✅ Zero configuration
- ✅ Automatic deployments on git push
- ✅ Free SSL certificate
- ✅ Global CDN
- ✅ Built-in analytics

**Cons:**

- ❌ Serverless functions (may have cold starts)
- ❌ Limited to Next.js

---

### Railway

**Best for:** Full-stack apps, Docker support, easy database setup

**Steps:**

1. **Sign up at [railway.app](https://railway.app)**

2. **Create New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure Build:**
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Start Command: `npm start`

4. **Add Environment Variables:**
   - Variables tab → Add all from `.env.example`

5. **Add MongoDB:**
   - Click "New" → "Database" → "MongoDB"
   - Railway automatically provides `MONGODB_URI`

6. **Deploy:**
   - Railway auto-deploys on git push

**Pros:**

- ✅ $5 free credit monthly
- ✅ Easy database setup
- ✅ Docker support
- ✅ Simple deployment

**Cons:**

- ❌ Limited free tier
- ❌ May need credit card

---

### Render

**Best for:** Docker deployments, free tier with limitations

**Steps:**

1. **Sign up at [render.com](https://render.com)**

2. **Create New Web Service:**
   - Connect your GitHub repository
   - Select "Docker"

3. **Configure:**
   - Name: `fullstack-app`
   - Root Directory: `frontend`
   - Dockerfile Path: `frontend/Dockerfile`
   - Build Command: (auto-detected)
   - Start Command: (auto-detected)

4. **Environment Variables:**
   - Add all from `.env.example`

5. **Add MongoDB:**
   - Create new MongoDB service
   - Use provided connection string

6. **Deploy:**
   - Render auto-deploys on git push

**Pros:**

- ✅ Free tier available
  - ✅ Docker support
  - ✅ Auto-deployments
  - ✅ Free SSL

**Cons:**

- ❌ Free tier spins down after inactivity
- ❌ Slower cold starts

---

### Fly.io

**Best for:** Global deployment, Docker support, generous free tier

**Steps:**

1. **Install Fly CLI:**

   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Sign up at [fly.io](https://fly.io)**

3. **Login:**

   ```bash
   fly auth login
   ```

4. **Initialize App:**

   ```bash
   cd frontend
   fly launch
   ```

5. **Create fly.toml:**

   ```toml
   app = "your-app-name"
   primary_region = "iad"

   [build]
     dockerfile = "Dockerfile"

   [env]
     PORT = "3000"
     NODE_ENV = "production"

   [[services]]
     internal_port = 3000
     protocol = "tcp"

     [[services.ports]]
       handlers = ["http"]
       port = 80

     [[services.ports]]
       handlers = ["tls", "http"]
       port = 443
   ```

6. **Set Secrets:**

   ```bash
   fly secrets set MONGODB_URI="your_mongodb_uri"
   fly secrets set JWT_SECRET="your_jwt_secret"
   fly secrets set JWT_REFRESH_SECRET="your_refresh_secret"
   ```

7. **Deploy:**
   ```bash
   fly deploy
   ```

**Pros:**

- ✅ Generous free tier
- ✅ Global edge network
- ✅ Docker support
- ✅ Fast deployments

**Cons:**

- ❌ CLI required
- ❌ More complex setup

---

## Environment Variables

### Required Variables

Create these in your hosting platform:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# JWT Secrets (generate strong random strings)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars

# API Configuration
NEXT_PUBLIC_API_URL=https://your-domain.com/api
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Optional
NODE_ENV=production
PORT=3000
```

### Generate JWT Secrets

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

---

## MongoDB Setup

### MongoDB Atlas (Free Tier)

1. **Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)**

2. **Create Cluster:**
   - Choose free tier (M0)
   - Select region closest to your app
   - Create cluster

3. **Create Database User:**
   - Database Access → Add New User
   - Username and password
   - Save credentials

4. **Whitelist IP:**
   - Network Access → Add IP Address
   - Add `0.0.0.0/0` for all IPs (or specific IPs)

5. **Get Connection String:**
   - Clusters → Connect → Connect your application
   - Copy connection string
   - Replace `<password>` with your user password

**Example:**

```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/dbname?retryWrites=true&w=majority
```

---

## Troubleshooting

### Build Fails

**Issue:** Build errors during deployment

**Solutions:**

- Check Node.js version (should be 20+)
- Verify all dependencies in `package.json`
- Check build logs for specific errors
- Ensure `.env` variables are set correctly

### Database Connection Fails

**Issue:** Cannot connect to MongoDB

**Solutions:**

- Verify `MONGODB_URI` is correct
- Check IP whitelist in MongoDB Atlas
- Ensure database user has correct permissions
- Check network connectivity

### Environment Variables Not Working

**Issue:** Variables not accessible in app

**Solutions:**

- Variables starting with `NEXT_PUBLIC_` are client-side
- Restart application after adding variables
- Check variable names match exactly
- Verify no typos in variable names

### Docker Build Fails

**Issue:** Docker build errors

**Solutions:**

- Check Dockerfile syntax
- Verify Node.js version in Dockerfile
- Ensure `.dockerignore` is correct
- Check for missing files

### Port Issues

**Issue:** Application not accessible

**Solutions:**

- Verify PORT environment variable
- Check platform port configuration
- Ensure firewall allows connections
- Verify health check endpoint

---

## Quick Start Checklist

- [ ] Set up MongoDB Atlas account
- [ ] Create MongoDB cluster and database
- [ ] Generate JWT secrets
- [ ] Choose hosting platform
- [ ] Create account on hosting platform
- [ ] Connect GitHub repository
- [ ] Add all environment variables
- [ ] Deploy application
- [ ] Test application
- [ ] Set up custom domain (optional)

---

## Recommended Setup

**For Beginners:**

1. Vercel + MongoDB Atlas
2. Easiest setup, zero configuration

**For Docker:**

1. Railway + MongoDB Atlas
2. Good free tier, easy database setup

**For Global Scale:**

1. Fly.io + MongoDB Atlas
2. Best performance, global edge network

---

## Support

If you encounter issues:

1. Check platform documentation
2. Review application logs
3. Verify environment variables
4. Test locally with Docker first
5. Check MongoDB connection

---

**Good luck with your deployment! 🚀**
