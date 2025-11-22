# Setup Issues & Solutions 🔧

## Issue: Node.js Version Too Old

### Problem
```
You are using Node.js 18.20.8. For Next.js, Node.js version ">=20.9.0" is required.
```

### Solution Options

#### Option 1: Upgrade Node.js using nvm (Recommended) ⭐

If you have `nvm` (Node Version Manager) installed:

```bash
# Install Node.js 20 (LTS)
nvm install 20

# Use Node.js 20
nvm use 20

# Set as default
nvm alias default 20

# Verify version
node --version  # Should show v20.x.x or higher
```

#### Option 2: Upgrade Node.js using n

If you have `n` (Node version manager) installed:

```bash
# Install Node.js 20 (LTS)
sudo n lts

# Verify version
node --version  # Should show v20.x.x or higher
```

#### Option 3: Download from Node.js Website

1. Visit https://nodejs.org/
2. Download Node.js 20.x LTS version
3. Install it
4. Restart your terminal
5. Verify: `node --version`

#### Option 4: Install nvm (if you don't have it)

**macOS/Linux:**
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal or run:
source ~/.zshrc  # or ~/.bashrc

# Then install Node.js 20
nvm install 20
nvm use 20
nvm alias default 20
```

**Windows:**
- Download nvm-windows from: https://github.com/coreybutler/nvm-windows/releases
- Install and use: `nvm install 20` then `nvm use 20`

---

## After Upgrading Node.js

1. **Clear node_modules and reinstall:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

2. **Verify installation:**
```bash
node --version  # Should be >= 20.9.0
npm --version
```

3. **Start the development server:**
```bash
npm run dev
```

---

## Other Common Issues

### Missing Environment Variables

Create a `.env.local` file in the `frontend` directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/localconnect

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=/api
```

### MongoDB Not Running

Make sure MongoDB is running:

```bash
# Using Docker
docker-compose up -d mongodb

# Or if MongoDB is installed locally
mongod
```

### Port Already in Use

If port 3000 is already in use:

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

---

## Quick Fix Commands

```bash
# 1. Check Node version
node --version

# 2. If using nvm, switch to Node 20
nvm install 20 && nvm use 20

# 3. Clean install
cd frontend
rm -rf node_modules package-lock.json
npm install

# 4. Start dev server
npm run dev
```

---

## Still Having Issues?

1. Check Node.js version: `node --version`
2. Check npm version: `npm --version`
3. Check for TypeScript errors: `npm run type-check`
4. Check for linting errors: `npm run lint`
5. Review error messages in terminal


