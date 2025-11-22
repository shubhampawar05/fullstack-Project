# TalentHR Setup Instructions

## Quick Start

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Variables**
   Create `.env.local` in the `frontend` directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/talenthrm
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
   NODE_ENV=development
   ```

3. **Start MongoDB**
   ```bash
   # Option 1: Docker
   docker-compose up -d mongodb
   
   # Option 2: Local MongoDB
   # Make sure MongoDB is running on localhost:27017
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Access Application**
   - Open http://localhost:3000
   - Sign up as Company Admin or Employer
   - Login to access dashboard

## Testing Authentication

### Sign Up as Company Admin
1. Go to `/signup`
2. Select "Company Admin"
3. Fill in:
   - Name
   - Email
   - Company Name
   - Password (min 8 characters)
4. Click "Create Account"

### Sign Up as Employer
1. Go to `/signup`
2. Select "Employer / HR Manager"
3. Fill in:
   - Name
   - Email
   - Company Code (provided by admin)
   - Password (min 8 characters)
4. Click "Create Account"

### Login
1. Go to `/login`
2. Select your role
3. Enter email and password
4. Click "Sign In"

## Troubleshooting

### MUI Import Errors
If you see errors about `@mui/material` not found:
```bash
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
```

### MongoDB Connection Issues
- Check if MongoDB is running
- Verify `MONGODB_URI` in `.env.local`
- Check MongoDB logs

### JWT Errors
- Ensure `JWT_SECRET` and `JWT_REFRESH_SECRET` are set
- Secrets should be at least 32 characters long
- Use different secrets for production

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong, unique JWT secrets
3. Use secure MongoDB connection string
4. Enable HTTPS
5. Set up proper CORS configuration
6. Configure rate limiting
7. Set up monitoring and logging

