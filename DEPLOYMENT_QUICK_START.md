# Quick Deployment Guide 🚀

## Step-by-Step Deployment

### Option 1: Vercel (Easiest - Recommended for Beginners)

#### Step 1: Prepare Your Code

```bash
cd frontend
git add .
git commit -m "Prepare for deployment"
git push origin main
```

#### Step 2: Set Up MongoDB Atlas

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up (free)
3. Create a free cluster (M0)
4. Create database user (username/password)
5. Network Access → Add IP: `0.0.0.0/0`
6. Get connection string:
   - Clusters → Connect → Connect your application
   - Copy the string
   - Replace `<password>` with your password

#### Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "Add New Project"
4. Import your repository
5. Configure:
   - Framework Preset: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`
6. Add Environment Variables:
   ```
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
   JWT_SECRET=your-32-char-secret-here
   JWT_REFRESH_SECRET=your-32-char-secret-here
   NEXT_PUBLIC_API_URL=https://your-app.vercel.app/api
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```
7. Click "Deploy"

#### Step 4: Generate JWT Secrets

```bash
# Run this in terminal to generate secrets:
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

**Done! Your app is live! 🎉**

---

### Option 2: Railway (Best for Docker)

#### Step 1: Prepare Docker

```bash
cd frontend
# Test Docker build locally first
docker build -t fullstack-app .
docker run -p 3000:3000 fullstack-app
```

#### Step 2: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Configure:
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Start Command: `npm start`
6. Add MongoDB:
   - Click "New" → "Database" → "MongoDB"
   - Railway provides `MONGODB_URI` automatically
7. Add Environment Variables:
   ```
   JWT_SECRET=your-32-char-secret
   JWT_REFRESH_SECRET=your-32-char-secret
   NEXT_PUBLIC_API_URL=https://your-app.railway.app/api
   NEXT_PUBLIC_APP_URL=https://your-app.railway.app
   ```
8. Deploy!

**Done! 🎉**

---

### Option 3: Render (Free Tier)

#### Step 1: Deploy to Render

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New" → "Web Service"
4. Connect your repository
5. Configure:
   - Name: `fullstack-app`
   - Root Directory: `frontend`
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
6. Add Environment Variables (same as Vercel)
7. Add MongoDB:
   - "New" → "MongoDB"
   - Use provided connection string
8. Deploy!

**Done! 🎉**

---

## Environment Variables Checklist

Make sure you set these in your hosting platform:

- [ ] `MONGODB_URI` - MongoDB connection string
- [ ] `JWT_SECRET` - 32+ character random string
- [ ] `JWT_REFRESH_SECRET` - 32+ character random string
- [ ] `NEXT_PUBLIC_API_URL` - Your app URL + `/api`
- [ ] `NEXT_PUBLIC_APP_URL` - Your app URL
- [ ] `NODE_ENV` - Set to `production`

## Quick Test After Deployment

1. Visit your deployed URL
2. Try to sign up
3. Try to login
4. Check if home page loads
5. Test feedback button

## Common Issues

**Issue:** "Cannot connect to MongoDB"

- ✅ Check `MONGODB_URI` is correct
- ✅ Verify IP whitelist in MongoDB Atlas
- ✅ Check database user credentials

**Issue:** "JWT errors"

- ✅ Verify `JWT_SECRET` and `JWT_REFRESH_SECRET` are set
- ✅ Make sure they're different values
- ✅ Ensure they're 32+ characters

**Issue:** "API calls failing"

- ✅ Check `NEXT_PUBLIC_API_URL` matches your domain
- ✅ Verify it ends with `/api`
- ✅ Check `NEXT_PUBLIC_APP_URL` is correct

## Need Help?

1. Check `DEPLOYMENT_GUIDE.md` for detailed instructions
2. Review platform-specific documentation
3. Check application logs in your hosting dashboard
4. Test locally with Docker first

**Good luck! 🚀**
