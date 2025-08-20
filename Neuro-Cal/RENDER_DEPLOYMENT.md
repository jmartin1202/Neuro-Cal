# Render Deployment Guide for NeuroCal

## 🚀 Overview

This guide will help you deploy NeuroCal to Render, a modern cloud platform that offers free hosting for static sites and affordable hosting for web services.

## 📋 Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Your code should be in a GitHub repo
3. **Environment Variables**: API keys and configuration ready

## 🔧 Deployment Steps

### Step 1: Connect Your Repository

1. Go to [render.com](https://render.com) and sign in
2. Click "New +" and select "Blueprint"
3. Connect your GitHub repository
4. Select the repository containing NeuroCal

### Step 2: Deploy Database

1. In your Render dashboard, click "New +" → "PostgreSQL"
2. Configure:
   - **Name**: `neurocal-db`
   - **Database**: `neurocal`
   - **User**: `neurocal_user`
   - **Plan**: Starter (Free tier available)
3. Click "Create Database"
4. Note down the connection details (you'll need these for the backend)

### Step 3: Deploy Backend

1. Click "New +" → "Web Service"
2. Connect to your GitHub repository
3. Configure:
   - **Name**: `neurocal-backend`
   - **Root Directory**: `backend` (since your backend is in a subdirectory)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Starter

4. **Environment Variables** (set these in Render):
   ```env
   NODE_ENV=production
   PORT=10000
   FRONTEND_URL=https://neurocal-frontend.onrender.com
   DB_HOST=your-render-db-host.onrender.com
   DB_NAME=neurocal
   DB_USER=neurocal_user
   DB_PASSWORD=your-db-password
   DB_PORT=5432
   JWT_SECRET=your-super-secure-jwt-secret
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   OPENAI_API_KEY=sk-...
   ANTHROPIC_API_KEY=sk-ant-...
   ```

5. Click "Create Web Service"

### Step 4: Deploy Frontend

1. Click "New +" → "Static Site"
2. Connect to your GitHub repository
3. Configure:
   - **Name**: `neurocal-frontend`
   - **Root Directory**: `.` (root of your project)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. **Environment Variables**:
   ```env
   VITE_API_URL=https://neurocal-backend.onrender.com
   VITE_ANALYTICS_ENABLED=true
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. Click "Create Static Site"

### Step 5: Configure Custom Domains (Optional)

1. In your frontend service, go to "Settings" → "Custom Domains"
2. Add your domain (e.g., `app.neurocal.com`)
3. Update your DNS records as instructed by Render

## 🔄 Automatic Deployments

Render automatically deploys when you push to your main branch. To configure:

1. Go to your service settings
2. Under "Build & Deploy", ensure "Auto-Deploy" is enabled
3. Set branch to `main` or `master`

## 📊 Health Checks

Your backend includes a health check endpoint at `/health`. Render will use this to monitor your service.

## 🗄️ Database Initialization

After deployment, initialize your database:

1. Go to your backend service logs
2. Run the database initialization:
   ```bash
   npm run db:init
   ```

## 🔍 Troubleshooting

### Common Issues

1. **Build Failures**: Check build logs for missing dependencies
2. **Database Connection**: Verify environment variables are set correctly
3. **CORS Errors**: Ensure `FRONTEND_URL` is set correctly in backend
4. **Port Issues**: Backend should use port 10000 (Render's requirement)

### Logs

- **Backend**: View logs in the Render dashboard
- **Frontend**: Check build logs for compilation errors
- **Database**: Monitor connection logs

## 🌐 URLs

After deployment, your services will be available at:
- **Frontend**: `https://neurocal-frontend.onrender.com`
- **Backend**: `https://neurocal-backend.onrender.com`
- **Database**: `postgresql://neurocal_user:password@host.onrender.com:5432/neurocal`

## 🔐 Security Notes

1. **Environment Variables**: Never commit sensitive data to your repository
2. **JWT Secrets**: Use strong, unique secrets for production
3. **Database**: Render provides SSL connections by default
4. **CORS**: Backend is configured to only accept requests from your frontend URL

## 📈 Scaling

- **Free Tier**: Perfect for development and small user bases
- **Paid Plans**: Available for higher traffic and additional features
- **Auto-scaling**: Available on paid plans

## 🆘 Support

- **Render Documentation**: [docs.render.com](https://docs.render.com)
- **Render Community**: [community.render.com](https://community.render.com)
- **GitHub Issues**: For code-specific problems
