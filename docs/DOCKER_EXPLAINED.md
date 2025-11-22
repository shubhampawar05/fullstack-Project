# Docker & GitHub Actions - Complete Explanation 🐳

## Overview

You have **two main components** working together:

1. **`Dockerfile`** - Instructions for building your app into a Docker image
2. **`.github/workflows/docker-build.yml`** - GitHub Actions workflow that automatically builds your Docker image when you push code

---

## Part 1: Dockerfile Explained

### What is a Dockerfile?

A **Dockerfile** is like a recipe that tells Docker:

- What base image to use (like Node.js)
- What files to copy
- What commands to run
- How to start your application

### Your Dockerfile - Step by Step

Your Dockerfile uses **multi-stage builds** (3 stages) to create an optimized, production-ready image.

#### **Stage 1: Dependencies (`deps`)**

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
```

**What's happening:**

1. **`FROM node:20-alpine`** - Start with Node.js 20 on Alpine Linux (small, lightweight)
2. **`WORKDIR /app`** - Set working directory to `/app`
3. **`COPY package.json package-lock.json* ./`** - Copy only package files (not all code yet)
4. **`RUN npm ci`** - Install dependencies (faster than `npm install` for production)

**Why this stage?**

- Separates dependency installation from code
- Docker can cache this layer (if package.json doesn't change, it reuses cached dependencies)
- Makes builds faster

**Result:** A layer with all `node_modules` installed

---

#### **Stage 2: Builder (`builder`)**

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build
```

**What's happening:**

1. **`FROM node:20-alpine AS builder`** - Start fresh with Node.js
2. **`COPY --from=deps /app/node_modules ./node_modules`** - Copy dependencies from Stage 1
3. **`COPY . .`** - Copy ALL your source code
4. **`ENV NODE_ENV=production`** - Set production mode
5. **`RUN npm run build`** - Build your Next.js app

**What does `npm run build` do?**

- Compiles TypeScript → JavaScript
- Optimizes React components
- Creates production bundles
- Generates static files
- Creates `.next` folder with optimized code

**Because of `output: "standalone"` in `next.config.ts`:**

- Next.js creates a `.next/standalone` folder
- This contains ONLY the files needed to run (no dev dependencies)
- Much smaller final image!

**Result:** A built Next.js application ready to run

---

#### **Stage 3: Runner (`runner`)**

```dockerfile
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
```

**What's happening:**

1. **`FROM node:20-alpine AS runner`** - Start fresh (smallest possible)
2. **`RUN adduser --system --uid 1001 nextjs`** - Create non-root user (security!)
3. **`COPY --from=builder ...`** - Copy ONLY what's needed:
   - `public/` - Static assets (images, etc.)
   - `.next/standalone/` - Minimal runtime files
   - `.next/static/` - Static assets
4. **`USER nextjs`** - Run as non-root user (security best practice)
5. **`EXPOSE 3000`** - Document that app uses port 3000
6. **`CMD ["node", "server.js"]`** - Start the app

**Why this stage?**

- **Security:** Runs as non-root user
- **Size:** Only includes runtime files (no build tools, no source code)
- **Final image is ~100-200MB** instead of 1GB+

**Result:** A minimal, secure, production-ready Docker image

---

### Visual Flow of Dockerfile

```
┌─────────────────────────────────────────┐
│  Stage 1: deps                          │
│  ├─ Node.js 20                          │
│  ├─ package.json                        │
│  └─ node_modules (all dependencies)     │
│     Size: ~500MB                         │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Stage 2: builder                       │
│  ├─ Node.js 20                          │
│  ├─ node_modules (from Stage 1)        │
│  ├─ Your source code                    │
│  └─ npm run build                       │
│     → .next/standalone                   │
│     → .next/static                      │
│     Size: ~800MB                         │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Stage 3: runner (FINAL IMAGE)          │
│  ├─ Node.js 20                          │
│  ├─ public/                             │
│  ├─ .next/standalone/                   │
│  ├─ .next/static/                       │
│  └─ Runs as 'nextjs' user               │
│     Size: ~150MB ✅                      │
└─────────────────────────────────────────┘
```

---

## Part 2: GitHub Actions Workflow Explained

### What is GitHub Actions?

**GitHub Actions** is a CI/CD (Continuous Integration/Continuous Deployment) platform that:

- Automatically runs tasks when you push code
- Can build, test, and deploy your app
- Runs on GitHub's servers (free for public repos)

### Your Workflow - Step by Step

```yaml
name: Docker Build

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]
```

**What's happening:**

- **`name: Docker Build`** - Name of the workflow
- **`on: push`** - Triggers when you push code
- **`branches: [main, master]`** - Only runs on main/master branch
- **`pull_request`** - Also runs when someone creates a PR

**When does it run?**

- ✅ You push to `main` branch
- ✅ You push to `master` branch
- ✅ Someone opens a PR to `main`/`master`
- ❌ You push to other branches (like `feature/new-feature`)

---

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
```

**What's happening:**

- **`jobs:`** - Define what jobs to run
- **`build:`** - Name of the job
- **`runs-on: ubuntu-latest`** - Run on Ubuntu Linux (GitHub provides this)

**Think of it as:** A fresh Ubuntu server that GitHub spins up just for your build

---

```yaml
steps:
  - name: Checkout code
    uses: actions/checkout@v4
```

**What's happening:**

- **`steps:`** - List of actions to perform
- **`Checkout code`** - Downloads your code from GitHub
- **`actions/checkout@v4`** - Official GitHub action to get your code

**Result:** Your entire repository is now on the Ubuntu server

---

```yaml
- name: Set up Docker Buildx
  uses: docker/setup-buildx-action@v3
```

**What's happening:**

- **`Set up Docker Buildx`** - Installs Docker Buildx (advanced Docker builder)
- **`docker/setup-buildx-action@v3`** - Official Docker action

**Why Buildx?**

- Better caching
- Multi-platform builds (ARM, x86, etc.)
- Faster builds

**Result:** Docker is ready to build images

---

```yaml
- name: Build Docker image
  uses: docker/build-push-action@v5
  with:
    context: .
    file: ./Dockerfile
    push: false
    tags: fullstack-app:latest
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

**What's happening:**

1. **`context: .`** - Use current directory as build context (all files)
2. **`file: ./Dockerfile`** - Use your Dockerfile
3. **`push: false`** - Don't push to registry (just build and test)
4. **`tags: fullstack-app:latest`** - Tag the image as `fullstack-app:latest`
5. **`cache-from: type=gha`** - Use GitHub Actions cache (faster builds)
6. **`cache-to: type=gha,mode=max`** - Save build cache for next time

**What actually happens:**

1. Docker reads your `Dockerfile`
2. Executes all 3 stages (deps → builder → runner)
3. Creates a Docker image
4. Tags it as `fullstack-app:latest`
5. Saves cache for next build (makes future builds faster)

**Result:** A Docker image is built and tested (but not deployed)

---

### Visual Flow of GitHub Actions

```
You push code to GitHub
         ↓
GitHub detects push to 'main' branch
         ↓
GitHub spins up Ubuntu server
         ↓
┌─────────────────────────────┐
│  Step 1: Checkout code      │
│  Downloads your repo         │
└─────────────────────────────┘
         ↓
┌─────────────────────────────┐
│  Step 2: Setup Docker       │
│  Installs Docker Buildx     │
└─────────────────────────────┘
         ↓
┌─────────────────────────────┐
│  Step 3: Build Docker Image │
│  Runs your Dockerfile       │
│  Creates image              │
│  Saves cache                │
└─────────────────────────────┘
         ↓
Build complete! ✅
(Image is built but not deployed)
```

---

## How They Work Together

### Complete Flow

```
1. You write code locally
   ↓
2. You commit and push to GitHub
   git add .
   git commit -m "Update code"
   git push origin main
   ↓
3. GitHub Actions triggers automatically
   ↓
4. GitHub Actions:
   - Checks out your code
   - Sets up Docker
   - Runs your Dockerfile
   - Builds the image
   - Tests that it builds successfully
   ↓
5. You see ✅ or ❌ in GitHub Actions tab
   ↓
6. If successful, you can:
   - Deploy the image to a hosting service
   - Use it locally with: docker run
   - Push it to Docker Hub (if you add push: true)
```

---

## Why This Setup?

### Benefits

1. **Automation** - Builds happen automatically on every push
2. **Testing** - Ensures your Dockerfile works before deployment
3. **Caching** - Faster builds (reuses dependencies)
4. **Security** - Runs as non-root user
5. **Optimization** - Small final image (~150MB vs 1GB+)
6. **CI/CD Ready** - Can easily add deployment steps

### Current Status

**What it does NOW:**

- ✅ Builds Docker image automatically
- ✅ Tests that build succeeds
- ✅ Caches for faster builds

**What it does NOT do:**

- ❌ Deploy to hosting (you need to add that)
- ❌ Push to Docker Hub (set `push: true` if you want)
- ❌ Run tests (you can add that)

---

## How to Verify It's Working

### 1. Check GitHub Actions

1. Go to your GitHub repository
2. Click "Actions" tab
3. You'll see workflow runs
4. Click on a run to see details
5. Green ✅ = Success, Red ❌ = Failed

### 2. Test Locally

```bash
# Build the image locally
cd frontend
docker build -t fullstack-app .

# Run the container
docker run -p 3000:3000 \
  -e MONGODB_URI="your_mongodb_uri" \
  -e JWT_SECRET="your_secret" \
  -e JWT_REFRESH_SECRET="your_refresh_secret" \
  fullstack-app

# Visit http://localhost:3000
```

### 3. Check Build Logs

In GitHub Actions, you can see:

- Each step executing
- Docker build progress
- Any errors
- Build time

---

## Common Questions

### Q: Why 3 stages in Dockerfile?

**A:** To create the smallest, most secure image:

- Stage 1: Install dependencies
- Stage 2: Build the app
- Stage 3: Only runtime files (no build tools, no source code)

### Q: Why `output: "standalone"`?

**A:** Next.js creates a minimal runtime with only what's needed to run. Without it, you'd need all `node_modules` in the final image.

### Q: Why `push: false`?

**A:** Currently just testing builds. Set to `true` if you want to push to Docker Hub or a container registry.

### Q: What is `cache-from` and `cache-to`?

**A:** GitHub Actions caching - saves build layers so next build is faster. If `package.json` doesn't change, it reuses cached `node_modules`.

### Q: Can I deploy automatically?

**A:** Yes! Add another step to deploy to Railway, Render, Fly.io, etc. after the build succeeds.

---

## Next Steps

### To Deploy Automatically

Add this to your workflow (after build step):

```yaml
- name: Deploy to Railway
  uses: bervProject/railway-deploy@v1.0.0
  with:
    railway_token: ${{ secrets.RAILWAY_TOKEN }}
```

### To Push to Docker Hub

Change `push: false` to `push: true` and add:

```yaml
with:
  push: true
  tags: docker.io/yourusername/fullstack-app:latest
  username: ${{ secrets.DOCKER_USERNAME }}
  password: ${{ secrets.DOCKER_PASSWORD }}
```

---

## Summary

**Dockerfile:**

- Recipe for building your app
- Creates optimized, secure Docker image
- 3 stages: dependencies → build → runtime

**GitHub Actions:**

- Automatically builds Docker image on push
- Tests that build works
- Caches for speed

**Together:**

- Every push → Automatic build → Ready to deploy! 🚀

---

**You now understand the complete flow!** 🎉
