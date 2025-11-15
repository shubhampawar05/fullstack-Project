# GitHub Actions & Environment Variables - Complete Guide

## Your Understanding is CORRECT! ✅

### 1. Dockerfile Works Both Locally AND in GitHub Actions

**YES, you're absolutely correct!**

```
┌─────────────────────────────────────────┐
│  Same Dockerfile                        │
│  (frontend/Dockerfile)                  │
└─────────────────────────────────────────┘
         ↓                    ↓
    ┌────────┐          ┌──────────────┐
    │ LOCAL  │          │ GITHUB       │
    │ Docker │          │ ACTIONS      │
    └────────┘          └──────────────┘
         ↓                    ↓
    docker build         GitHub runs
    -t myapp .           docker build
         ↓                    ↓
    Same Docker Image    Same Docker Image
```

**The Dockerfile is the same file used in both places!**

---

## Part 1: Running Docker Locally

### Build Locally

```bash
cd frontend

# Build the Docker image
docker build -t fullstack-app .

# This uses your Dockerfile to create an image
```

### Run Locally with Environment Variables

```bash
# Method 1: Pass env variables directly
docker run -p 3000:3000 \
  -e MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/db" \
  -e JWT_SECRET="your-secret-here" \
  -e JWT_REFRESH_SECRET="your-refresh-secret" \
  -e NEXT_PUBLIC_API_URL="http://localhost:3000/api" \
  -e NEXT_PUBLIC_APP_URL="http://localhost:3000" \
  fullstack-app

# Method 2: Use .env file
docker run -p 3000:3000 --env-file .env fullstack-app
```

**✅ You're correct - same Dockerfile, same process!**

---

## Part 2: GitHub Actions - How It Works

### Your Current Workflow

```yaml
name: Docker Build

on:
  push:
    branches: [main, master]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./Dockerfile # ← Uses YOUR Dockerfile
          push: false
          tags: fullstack-app:latest
```

**What happens:**

1. GitHub Actions downloads your code (including Dockerfile)
2. Runs `docker build` using YOUR Dockerfile
3. Creates the same image you'd create locally

**✅ Same Dockerfile, same result!**

---

## Part 3: Adding Environment Variables to GitHub Actions

### Why You Need Environment Variables

Your app needs:

- `MONGODB_URI` - Database connection
- `JWT_SECRET` - Token signing
- `JWT_REFRESH_SECRET` - Refresh token signing
- `NEXT_PUBLIC_API_URL` - API endpoint
- `NEXT_PUBLIC_APP_URL` - App URL

### How to Add Environment Variables

#### Step 1: Go to Your GitHub Repository

1. Open your repo: `https://github.com/shubhampawar05/fullstack-Project`
2. Click **Settings** (top menu)
3. Click **Secrets and variables** → **Actions** (left sidebar)
4. Click **New repository secret**

#### Step 2: Add Each Secret

Add these secrets one by one:

**Secret 1:**

- Name: `MONGODB_URI`
- Value: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`

**Secret 2:**

- Name: `JWT_SECRET`
- Value: `your-32-character-secret-here`

**Secret 3:**

- Name: `JWT_REFRESH_SECRET`
- Value: `your-32-character-refresh-secret-here`

**Secret 4:**

- Name: `NEXT_PUBLIC_API_URL`
- Value: `https://your-app.vercel.app/api` (or your deployment URL)

**Secret 5:**

- Name: `NEXT_PUBLIC_APP_URL`
- Value: `https://your-app.vercel.app` (or your deployment URL)

**Important:**

- Secrets are **encrypted** and **hidden**
- They're only visible when you add them
- They can be used in workflows but never shown in logs

---

## Part 4: Using Secrets in GitHub Actions Workflow

### Update Your Workflow to Use Secrets

Here's how to modify your workflow:

```yaml
name: Docker Build

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./Dockerfile
          push: false
          tags: fullstack-app:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max
          # Add build arguments if needed during build
          build-args: |
            NODE_ENV=production
```

### If You Need to Test with Environment Variables

Add a test step:

```yaml
- name: Test Docker image with env vars
  run: |
    docker run -d \
      -e MONGODB_URI="${{ secrets.MONGODB_URI }}" \
      -e JWT_SECRET="${{ secrets.JWT_SECRET }}" \
      -e JWT_REFRESH_SECRET="${{ secrets.JWT_REFRESH_SECRET }}" \
      -e NEXT_PUBLIC_API_URL="${{ secrets.NEXT_PUBLIC_API_URL }}" \
      -e NEXT_PUBLIC_APP_URL="${{ secrets.NEXT_PUBLIC_APP_URL }}" \
      -p 3000:3000 \
      --name test-container \
      fullstack-app:latest

    # Wait a bit for app to start
    sleep 10

    # Test if app is running
    curl -f http://localhost:3000 || exit 1

    # Cleanup
    docker stop test-container
    docker rm test-container
```

**Note:** The `${{ secrets.SECRET_NAME }}` syntax accesses your secrets.

---

## Part 5: How to Access GitHub Actions

### Finding Your GitHub Actions

1. **Go to your repository:**

   ```
   https://github.com/shubhampawar05/fullstack-Project
   ```

2. **Click "Actions" tab** (top menu, next to Code, Issues, etc.)

3. **You'll see:**
   - List of all workflow runs
   - Status (✅ green = success, ❌ red = failed, 🟡 yellow = running)
   - When it ran
   - Which commit triggered it

4. **Click on a run to see:**
   - All steps
   - Logs for each step
   - Build time
   - Any errors

### Direct Link Format

```
https://github.com/shubhampawar05/fullstack-Project/actions
```

### Link to Specific Workflow Run

When you click on a run, the URL will be:

```
https://github.com/shubhampawar05/fullstack-Project/actions/runs/RUN_ID
```

---

## Part 6: Complete Understanding

### Your Understanding is 100% Correct! ✅

```
┌─────────────────────────────────────┐
│  Your Dockerfile                    │
│  (frontend/Dockerfile)              │
└─────────────────────────────────────┘
         ↓                    ↓
    ┌────────────┐      ┌──────────────┐
    │ LOCAL      │      │ GITHUB       │
    │            │      │ ACTIONS      │
    │ docker     │      │              │
    │ build      │      │ Uses same    │
    │ -t app .   │      │ Dockerfile   │
    │            │      │              │
    │ Uses .env  │      │ Uses Secrets │
    │ file       │      │ from GitHub  │
    └────────────┘      └──────────────┘
         ↓                    ↓
    ┌─────────────────────────────┐
    │  Same Docker Image           │
    │  (fullstack-app:latest)     │
    └─────────────────────────────┘
```

### Key Points:

1. **✅ Same Dockerfile** - Used both locally and in GitHub Actions
2. **✅ Local:** Use `.env` file or `-e` flags
3. **✅ GitHub Actions:** Use Secrets (Settings → Secrets → Actions)
4. **✅ Same Result:** Both create the same Docker image
5. **✅ Access Actions:** Repository → Actions tab

---

## Step-by-Step: Setting Up Secrets

### Complete Walkthrough

1. **Go to GitHub:**

   ```
   https://github.com/shubhampawar05/fullstack-Project
   ```

2. **Click Settings** (top right, in your repo)

3. **Click "Secrets and variables"** → **"Actions"** (left sidebar)

4. **Click "New repository secret"** (top right)

5. **Add each secret:**
   - Name: `MONGODB_URI`
   - Value: Your MongoDB connection string
   - Click "Add secret"

6. **Repeat for all secrets:**
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_APP_URL`

7. **Done!** Now your workflow can use them with `${{ secrets.SECRET_NAME }}`

---

## Example: Complete Workflow with Secrets

```yaml
name: Docker Build and Test

on:
  push:
    branches: [main, master]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./Dockerfile
          push: false
          tags: fullstack-app:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Test with environment variables
        run: |
          docker run -d \
            --name test-app \
            -p 3000:3000 \
            -e MONGODB_URI="${{ secrets.MONGODB_URI }}" \
            -e JWT_SECRET="${{ secrets.JWT_SECRET }}" \
            -e JWT_REFRESH_SECRET="${{ secrets.JWT_REFRESH_SECRET }}" \
            -e NEXT_PUBLIC_API_URL="${{ secrets.NEXT_PUBLIC_API_URL }}" \
            -e NEXT_PUBLIC_APP_URL="${{ secrets.NEXT_PUBLIC_APP_URL }}" \
            fullstack-app:latest

          # Wait for app to start
          sleep 15

          # Test health endpoint (if you have one)
          curl -f http://localhost:3000 || echo "App might need more time"

          # Cleanup
          docker stop test-app || true
          docker rm test-app || true
```

---

## Summary

### ✅ Your Understanding:

1. **Dockerfile works locally** - `docker build -t app .` ✅
2. **Same Dockerfile in GitHub Actions** ✅
3. **Both create same image** ✅

### 📝 What You Need to Know:

1. **Local:** Use `.env` file or `-e` flags
2. **GitHub Actions:** Use Secrets (Settings → Secrets → Actions)
3. **Access Actions:** Repository → Actions tab
4. **Use Secrets:** `${{ secrets.SECRET_NAME }}` in workflow

### 🎯 Next Steps:

1. Add secrets to GitHub (Settings → Secrets → Actions)
2. Update workflow to use secrets (if needed for testing)
3. Push code and check Actions tab
4. See your builds running!

**You've got it! 🚀**
