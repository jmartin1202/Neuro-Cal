# OAuth Provider Setup Guide for NeuroCal

## 🚀 **Complete OAuth Configuration**

This guide will help you set up all OAuth providers (Google, Microsoft, Apple, Yahoo) for full authentication functionality.

## 📋 **Prerequisites**

- ✅ PostgreSQL database running
- ✅ Backend server running on port 5001
- ✅ Frontend running on port 8080
- ✅ Database tables created

## 🔑 **Google OAuth Setup**

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API and Google Calendar API

### 2. Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - `http://localhost:5001/api/auth/google/callback`
   - `https://your-heroku-app.herokuapp.com/api/auth/google/callback`

### 3. Environment Variables
```bash
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

## 🪟 **Microsoft OAuth Setup**

### 1. Create Azure App Registration
1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" > "App registrations"
3. Click "New registration"
4. Add redirect URIs:
   - `http://localhost:5001/api/auth/microsoft/callback`
   - `https://your-heroku-app.herokuapp.com/api/auth/microsoft/callback`

### 2. Environment Variables
```bash
MICROSOFT_CLIENT_ID=your_microsoft_client_id_here
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret_here
```

## 🍎 **Apple OAuth Setup**

### 1. Create Apple Developer Account
1. Go to [Apple Developer](https://developer.apple.com/)
2. Create a new App ID
3. Enable "Sign In with Apple"
4. Create a Services ID

### 2. Environment Variables
```bash
APPLE_CLIENT_ID=your_apple_client_id_here
APPLE_TEAM_ID=your_apple_team_id_here
APPLE_KEY_ID=your_apple_key_id_here
APPLE_PRIVATE_KEY=your_apple_private_key_here
```

## 📧 **Yahoo OAuth Setup**

### 1. Create Yahoo App
1. Go to [Yahoo Developer Network](https://developer.yahoo.com/)
2. Create a new application
3. Add redirect URIs:
   - `http://localhost:5001/api/auth/yahoo/callback`
   - `https://your-heroku-app.herokuapp.com/api/auth/yahoo/callback`

### 2. Environment Variables
```bash
YAHOO_CLIENT_ID=your_yahoo_client_id_here
YAHOO_CLIENT_SECRET=your_yahoo_client_secret_here
```

## 🌐 **Frontend Configuration**

### 1. Update Environment Variables
Create or update `.env.local` in the frontend directory:
```bash
VITE_API_URL=http://localhost:5001/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_MICROSOFT_CLIENT_ID=your_microsoft_client_id
VITE_APPLE_CLIENT_ID=your_apple_client_id
VITE_YAHOO_CLIENT_ID=your_yahoo_client_id
```

### 2. Test OAuth Buttons
1. Navigate to `http://localhost:8080/auth`
2. You should see OAuth provider buttons
3. Click each button to test the flow

## 🔧 **Backend Configuration**

### 1. Update Backend Environment
Create or update `.env` in the backend directory:
```bash
# Database
DB_USER=joelmartin
DB_HOST=localhost
DB_NAME=neurocal
DB_PASSWORD=
DB_PORT=5432

# JWT & Session
JWT_SECRET=your-super-secret-jwt-key-change-in-production
SESSION_SECRET=your-session-secret-change-in-production

# Server
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:8080

# OAuth Providers (add your credentials)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
APPLE_CLIENT_ID=your_apple_client_id
APPLE_TEAM_ID=your_apple_team_id
APPLE_KEY_ID=your_apple_key_id
APPLE_PRIVATE_KEY=your_apple_private_key
YAHOO_CLIENT_ID=your_yahoo_client_id
YAHOO_CLIENT_SECRET=your_yahoo_client_secret
```

## 🧪 **Testing OAuth Flow**

### 1. Test Registration
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123","firstName":"Test","lastName":"User"}'
```

### 2. Test Login
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

### 3. Test OAuth Endpoints
```bash
# Google OAuth (should return error if not configured)
curl http://localhost:5001/api/auth/google

# Microsoft OAuth
curl http://localhost:5001/api/auth/microsoft

# Apple OAuth
curl http://localhost:5001/api/auth/apple

# Yahoo OAuth
curl http://localhost:5001/api/auth/yahoo
```

## 🚀 **Deployment to Heroku**

### 1. Set Environment Variables
```bash
heroku config:set GOOGLE_CLIENT_ID=your_google_client_id
heroku config:set GOOGLE_CLIENT_SECRET=your_google_client_secret
heroku config:set MICROSOFT_CLIENT_ID=your_microsoft_client_id
heroku config:set MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
# ... add all other OAuth variables
```

### 2. Deploy Updates
```bash
git add .
git commit -m "Configure OAuth providers"
git push heroku main
```

## ✅ **Verification Checklist**

- [ ] Google OAuth configured and working
- [ ] Microsoft OAuth configured and working
- [ ] Apple OAuth configured and working
- [ ] Yahoo OAuth configured and working
- [ ] Local authentication working
- [ ] Database tables created
- [ ] Frontend OAuth buttons visible
- [ ] OAuth callbacks working
- [ ] User registration and login working
- [ ] JWT tokens generated correctly

## 🆘 **Troubleshooting**

### Common Issues:
1. **"Unknown authentication strategy"** - Check if OAuth environment variables are set
2. **Database connection errors** - Verify PostgreSQL is running and credentials are correct
3. **OAuth callback errors** - Check redirect URIs match exactly
4. **Frontend white screen** - Check browser console for JavaScript errors

### Debug Commands:
```bash
# Check backend health
curl http://localhost:5001/health

# Check auth API health
curl http://localhost:5001/api/auth/health

# Check database connection
psql neurocal -c "SELECT version();"

# Check environment variables
echo $GOOGLE_CLIENT_ID
echo $MICROSOFT_CLIENT_ID
```

## 🎯 **Next Steps After OAuth Setup**

1. **Test Calendar Integration** - Connect OAuth accounts to calendar services
2. **Implement AI Features** - Add OpenAI/Anthropic API keys
3. **Email Verification** - Set up SMTP for production email verification
4. **User Management** - Add profile editing and provider management
5. **Security Hardening** - Implement rate limiting and security headers

---

**🎉 Congratulations! You now have a fully functional multi-provider OAuth authentication system for NeuroCal!**
