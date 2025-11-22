# How to See GitHub Actions Running - Step by Step Guide

## Step 1: Commit and Push Your Changes

First, commit the updated workflow file:

```bash
cd frontend
git add .github/workflows/docker-build.yml
git commit -m "Update GitHub Actions to use secrets and test Docker build"
git push origin main
```

## Step 2: Access GitHub Actions

### Method 1: Direct Link

Go to:

```
https://github.com/shubhampawar05/fullstack-Project/actions
```

### Method 2: Through Repository

1. Go to: `https://github.com/shubhampawar05/fullstack-Project`
2. Click the **"Actions"** tab (top menu, between "Pull requests" and "Projects")

## Step 3: See Your Workflow Running

### What You'll See:

1. **Workflow Runs List:**
   - All your workflow runs (newest first)
   - Status badges:
     - 🟡 **Yellow dot** = Running
     - ✅ **Green checkmark** = Success
     - ❌ **Red X** = Failed
   - Commit message that triggered it
   - Time it ran

2. **Click on a Run** to see:
   - **Job name:** "build"
   - **Steps:**
     - ✅ Checkout code
     - ✅ Set up Docker Buildx
     - ✅ Build Docker image
     - ✅ Test Docker image with environment variables

## Step 4: View Detailed Logs

### Click on a Step to See Logs:

1. Click on the workflow run
2. Click on the job (e.g., "build")
3. Click on any step to see:
   - What commands ran
   - Output from commands
   - Any errors
   - Build progress

### Example Logs You'll See:

```
🚀 Starting container with environment variables...
⏳ Waiting for application to start...
🧪 Testing if application is running...
✅ Application is running successfully!
🌐 Application URL: http://localhost:3000
🧹 Cleaning up test container...
✅ Build and test completed!
```

## Step 5: Understanding the Status

### ✅ Success (Green Checkmark)

- Docker image built successfully
- Container started with environment variables
- Application responded to health check
- **Everything works!**

### ❌ Failed (Red X)

- Click on the failed step
- Read the error message
- Common issues:
  - Build error (check Dockerfile)
  - Missing secret (add it in Settings)
  - Application didn't start (check logs)

### 🟡 Running (Yellow Dot)

- Workflow is currently executing
- Wait for it to complete
- Refresh the page to see updates

## Step 6: Real-Time Updates

### While Workflow is Running:

1. **Auto-refresh:** GitHub Actions auto-updates every few seconds
2. **Manual refresh:** Click refresh button or press F5
3. **Watch logs:** Click on a running step to see live logs

## Step 7: What Happens in the Workflow

### Your Updated Workflow Does:

1. **Checkout code** - Downloads your repository
2. **Set up Docker** - Installs Docker Buildx
3. **Build image** - Creates Docker image using your Dockerfile
4. **Test with secrets** - Runs container with your environment variables
5. **Health check** - Tests if app is running
6. **Cleanup** - Removes test container

## Step 8: Troubleshooting

### If Build Fails:

1. **Click on the failed step**
2. **Read the error message**
3. **Check common issues:**

   **Issue: "Secret not found"**
   - Go to Settings → Secrets → Actions
   - Make sure secret name matches exactly
   - Check for typos

   **Issue: "Build failed"**
   - Check Dockerfile syntax
   - Verify all files are present
   - Check build logs for specific error

   **Issue: "Application not responding"**
   - Check container logs (shown in workflow)
   - Verify MongoDB connection string
   - Check if all required secrets are set

### View Container Logs:

The workflow shows container logs if the app fails to start. Look for:

- Database connection errors
- Missing environment variables
- Application startup errors

## Step 9: Success Indicators

### You'll Know It Works When:

1. ✅ All steps show green checkmarks
2. ✅ "Build and test completed!" message appears
3. ✅ No error messages in logs
4. ✅ Application responded to health check

## Step 10: Next Steps After Success

### Once Build Succeeds:

1. **Your Docker image is built and tested** ✅
2. **Ready to deploy** to:
   - Railway
   - Render
   - Fly.io
   - Or any Docker-compatible platform

3. **You can also:**
   - Pull the image locally
   - Deploy manually
   - Set up automatic deployment

## Quick Reference

### GitHub Actions URL:

```
https://github.com/shubhampawar05/fullstack-Project/actions
```

### Secrets Location:

```
https://github.com/shubhampawar05/fullstack-Project/settings/secrets/actions
```

### Trigger Workflow:

```bash
git push origin main
```

### Check Status:

- Go to Actions tab
- Look for latest run
- Check status badge

## Visual Guide

```
GitHub Repository
    ↓
Actions Tab
    ↓
Workflow Runs List
    ↓
Click on a Run
    ↓
See Steps:
  ✅ Checkout code
  ✅ Set up Docker
  ✅ Build image
  ✅ Test with secrets
    ↓
Click Step for Logs
    ↓
See Detailed Output
```

## Pro Tips

1. **Watch in real-time:** Keep Actions tab open while pushing
2. **Check logs first:** Always read logs before asking for help
3. **Test locally first:** Run `docker build` locally before pushing
4. **Use descriptive commits:** Makes it easier to find specific runs

---

**You're all set! Push your code and watch it build! 🚀**
