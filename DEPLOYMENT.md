# 🚀 Deployment Guide

This guide provides step-by-step instructions for deploying the Rent Manager App to production.

## Table of Contents
-[Database Setup (MongoDB Atlas)](#database-setup-mongodb-atlas)
- [Backend Deployment](#backend-deployment)
  - [Option 1: Render](#option-1-render)
  - [Option 2: Railway](#option-2-railway)
- [Frontend Deployment](#frontend-deployment)
  - [Option 1: Vercel](#option-1-vercel)
  - [Option 2: Netlify](#option-2-netlify)
- [Post-Deployment](#post-deployment)

---

## Database Setup (MongoDB Atlas)

### 1. Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new project

### 2. Create a Cluster
1. Click "Build a Database"
2. Choose the FREE tier (M0)
3. Select your preferred cloud provider and region
4. Click "Create Cluster"

### 3. Configure Database Access
1. Go to **Database Access** in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and strong password
5. Set user privileges to "Read and write to any database"
6. Click "Add User"

### 4. Configure Network Access
1. Go to **Network Access** in the left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (or add specific IPs)
4. Click "Confirm"

### 5. Get Connection String
1. Go to **Database** and click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Replace `<dbname>` with `rent-manager` (or your preferred database name)

Example:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/rent-manager?retryWrites=true&w=majority
```

---

## Backend Deployment

### Option 1: Render

#### Step 1: Prepare Your Repository
Make sure your backend code is pushed to GitHub.

#### Step 2: Create Render Account
1. Go to [Render](https://render.com)
2. Sign up using your GitHub account

#### Step 3: Create New Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select the `rent-manager-app` repository

#### Step 4: Configure Service
- **Name**: `rent-manager-backend`
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: Free

#### Step 5: Add Environment Variables
Click "Advanced" and add these environment variables:

| Key | Value |
|-----|-------|
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A secure random string (use a password generator) |
| `NODE_ENV` | `production` |
| `PORT` | `4000` |

#### Step 6: Deploy
1. Click "Create Web Service"
2. Wait for deployment to complete (~5 minutes)
3. Note your backend URL (e.g., `https://rent-manager-backend.onrender.com`)

### Option 2: Railway

#### Step 1: Create Railway Account
1. Go to [Railway](https://railway.app)
2. Sign up using your GitHub account

#### Step 2: Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `rent-manager-app` repository

#### Step 3: Configure Service
1. Select the backend directory
2. Railway auto-detects Node.js

#### Step 4: Add Environment Variables
1. Go to "Variables" tab
2. Add the same environment variables as Render option above

#### Step 5: Deploy
1. Railway automatically deploys
2. Get your backend URL from the "Settings" tab

---

## Frontend Deployment

### Option 1: Vercel

#### Step 1: Prepare Frontend
Update your frontend `.env` file:

```env
VITE_API_URL=https://your-backend-url.onrender.com
```

Commit and push changes to GitHub.

#### Step 2: Deploy to Vercel
1. Go to [Vercel](https://vercel.com)
2. Sign up using your GitHub account
3. Click "New Project"
4. Import your `rent-manager-app` repository

#### Step 3: Configure Project
- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

#### Step 4: Add Environment Variables
1. Go to "Environment Variables"
2. Add:
   - Key: `VITE_API_URL`
   - Value: Your backend URL (e.g., `https://rent-manager-backend.onrender.com`)

#### Step 5: Deploy
1. Click "Deploy"
2. Wait for deployment (~2 minutes)
3. Your app will be live at `https://your-app.vercel.app`

### Option 2: Netlify

#### Step 1: Prepare Build
Create `netlify.toml` in the frontend directory:

```toml
[build]
  base = "frontend"
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Step 2: Deploy to Netlify
1. Go to [Netlify](https://www.netlify.com)
2. Sign up using your GitHub account
3. Click "Add new site" → "Import an existing project"
4. Choose your GitHub repository

#### Step 3: Configure Build Settings
- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `frontend/dist`

#### Step 4: Add Environment Variables
1. Go to "Site settings" → "Environment variables"
2. Add `VITE_API_URL` with your backend URL

#### Step 5: Deploy
1. Click "Deploy site"
2. Wait for deployment to complete

---

## Post-Deployment

### 1. Update CORS Settings (Backend)
If your frontend and backend are on different domains, update CORS in `backend/server.js`:

```javascript
const corsOptions = {
  origin: ['https://your-frontend-url.vercel.app'],
  credentials: true
};
app.use(cors(corsOptions));
```

Redeploy the backend after this change.

### 2. Test Your Application
1. Visit your frontend URL
2. Create an admin account
3. Test all major features:
   - Building creation
   - Room management
   - Tenant assignment
   - Bill generation
   - Payment confirmation
   - Financial dashboard

### 3. Set Up Custom Domain (Optional)

#### Vercel:
1. Go to "Settings" → "Domains"
2. Add your custom domain
3. Follow DNS configuration instructions

#### Render:
1. Go to "Settings" → "Custom Domain"
2. Add your domain
3. Update DNS records as instructed

### 4. Enable HTTPS
Both Vercel and Render automatically provide SSL certificates.
Ensure all API calls use HTTPS in production.

### 5. Monitor Your Application
- Set up error tracking (Sentry, LogRocket)
- Monitor database performance in MongoDB Atlas
- Check server logs regularly

---

## Troubleshooting

### Backend Issues

**Problem**: Cannot connect to database
- Check MongoDB Atlas network access settings
- Verify connection string is correct
- Ensure IP address is whitelisted

**Problem**: 500 errors on API calls
- Check backend logs in Render/Railway
- Verify all environment variables are set
- Check MongoDB connection

### Frontend Issues

**Problem**: API calls failing
- Verify `VITE_API_URL` is correct
- Check CORS settings on backend
- Ensure backend is deployed and running

**Problem**: Build fails
- Check Node version compatibility
- Run `npm install` locally to verify dependencies
- Check build command is correct

### General Tips
- Always test locally before deploying
- Keep environment variables secure
- Use `.env.example` files as templates
- Monitor logs for errors
- Set up automated backups for MongoDB

---

## Maintenance

### Regular Tasks
1. **Weekly**: Check error logs
2. **Monthly**: Review database size and performance
3. **Quarterly**: Update dependencies (`npm update`)
4. **As needed**: Scale database/server resources

### Backup Strategy
1. Enable MongoDB Atlas automated backups
2. Export critical data regularly
3. Keep local development database updated

---

## Support

For deployment issues:
1. Check platform-specific documentation
2. Review error logs
3. Open an issue on GitHub

---

**Happy Deploying! 🚀**
