# 🚀 NeuroCal Complete Setup Guide

Welcome to NeuroCal! This guide will walk you through setting up the complete AI-powered calendar application with all advanced features.

## 🎯 What You'll Get

✅ **Full-Stack Application** - React frontend + Node.js backend  
✅ **AI Integration** - OpenAI GPT-4 + Anthropic Claude  
✅ **User Authentication** - JWT-based secure login system  
✅ **Calendar Sync** - Google Calendar + Outlook integration  
✅ **Database** - PostgreSQL with Redis caching  
✅ **Smart Features** - AI scheduling, insights, and analytics  

## 📋 Prerequisites

Before starting, ensure you have:

- **Node.js 18+** and npm
- **PostgreSQL 14+** database
- **Redis 6+** for caching
- **API Keys** for OpenAI and Anthropic (Claude)
- **Google Cloud Console** account (for Google Calendar)
- **Microsoft Azure** account (for Outlook integration)

## 🏗️ Architecture Overview

```
NeuroCal/
├── Frontend (React + TypeScript)     # Port 8080
├── Backend (Node.js + Express)       # Port 5000
├── Database (PostgreSQL)             # Port 5432
└── Cache (Redis)                     # Port 6379
```

## 🚀 Quick Start (5 Minutes)

### 1. **Start Frontend (Already Running!)**
Your React frontend is already running at `http://localhost:8080/` ✅

### 2. **Install Backend Dependencies**
```bash
cd Neuro-Cal/backend
npm install
```

### 3. **Set Up Environment Variables**
Create `.env` file in `backend/` directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:8080

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=neurocal
DB_USER=postgres
DB_PASSWORD=your_password_here

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# AI APIs
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Google Calendar
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Microsoft Graph
MICROSOFT_CLIENT_ID=your_microsoft_client_id_here
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret_here
```

### 4. **Set Up Database**
```sql
-- Connect to PostgreSQL
CREATE DATABASE neurocal;
CREATE USER neurocal_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE neurocal TO neurocal_user;
```

### 5. **Run Database Migration**
```bash
cd Neuro-Cal/backend
npm run db:migrate
```

### 6. **Start Backend Server**
```bash
npm run dev
```

🎉 **Your backend will be running at `http://localhost:5000`**

## 🔐 Getting API Keys

### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up/Login and navigate to API Keys
3. Create a new API key
4. Add to your `.env` file

### Anthropic (Claude) API Key
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Create an account and navigate to API Keys
3. Generate a new API key
4. Add to your `.env` file

### Google Calendar API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials
5. Add Client ID and Secret to `.env`

### Microsoft Graph API
1. Visit [Azure Portal](https://portal.azure.com/)
2. Create/Select an app registration
3. Add Microsoft Graph permissions
4. Generate Client Secret
5. Add credentials to `.env`

## 🧪 Testing Your Setup

### 1. **Backend Health Check**
Visit: `http://localhost:5000/health`
Expected: `{"status":"OK","timestamp":"..."}`

### 2. **Frontend Authentication**
Visit: `http://localhost:8080/auth`
- Test registration with a new account
- Test login functionality
- Verify JWT token storage

### 3. **AI Features Test**
- Create an event using natural language
- Check AI suggestions
- View productivity insights

## 🔧 Troubleshooting

### Common Issues & Solutions

#### Backend Won't Start
```bash
# Check if port 5000 is in use
lsof -i :5000

# Kill process if needed
kill -9 <PID>

# Check environment variables
cat .env
```

#### Database Connection Failed
```bash
# Verify PostgreSQL is running
brew services list | grep postgresql

# Start PostgreSQL if needed
brew services start postgresql

# Test connection
psql -U postgres -d neurocal
```

#### Redis Connection Failed
```bash
# Check Redis status
brew services list | grep redis

# Start Redis if needed
brew services start redis

# Test connection
redis-cli ping
```

#### Frontend Can't Connect to Backend
- Verify backend is running on port 5000
- Check CORS settings in backend
- Ensure `.env` has correct `FRONTEND_URL`

## 📱 Using NeuroCal

### 1. **Create Account**
- Visit `/auth` page
- Fill in registration form
- Verify account creation

### 2. **Login & Dashboard**
- Sign in with your credentials
- Access main calendar interface
- View user header with profile

### 3. **AI-Powered Features**
- **Natural Language Events**: "Meet with John tomorrow at 2pm"
- **Smart Scheduling**: AI suggests optimal time slots
- **Calendar Insights**: Productivity analysis and recommendations

### 4. **Calendar Sync**
- Connect Google Calendar
- Sync Outlook calendar
- View unified calendar view

## 🚀 Advanced Features

### AI Event Creation
```typescript
// Example API call
POST /api/ai/create-event
{
  "inputText": "Team standup every Monday at 9am",
  "preferredDate": "2024-01-15"
}
```

### Smart Suggestions
```typescript
// Get AI scheduling suggestions
GET /api/ai/suggestions?duration=1&type=meeting
```

### Calendar Analytics
```typescript
// View productivity insights
GET /api/users/productivity-insights?days=7
```

## 📊 Monitoring & Logs

### Backend Logs
```bash
# View real-time logs
cd backend && npm run dev

# Check for errors
tail -f logs/error.log
```

### Database Queries
```sql
-- Check user registrations
SELECT * FROM users ORDER BY created_at DESC;

-- View AI interactions
SELECT * FROM ai_interactions ORDER BY created_at DESC;

-- Monitor calendar syncs
SELECT * FROM calendar_syncs;
```

## 🔒 Security Considerations

### Production Deployment
- Change `JWT_SECRET` to strong random string
- Use environment-specific database credentials
- Enable HTTPS
- Set up proper CORS origins
- Implement rate limiting

### API Key Security
- Never commit API keys to version control
- Use environment variables
- Rotate keys regularly
- Monitor API usage

## 🎯 Next Steps

### Immediate Actions
1. ✅ Frontend is running
2. 🔄 Set up backend environment
3. 🔄 Configure database
4. 🔄 Get API keys
5. 🔄 Test authentication

### Future Enhancements
- Add email notifications
- Implement team collaboration
- Add mobile app
- Advanced AI models
- Enterprise features

## 📞 Support

### Getting Help
- Check the logs for error messages
- Verify all environment variables
- Ensure all services are running
- Test API endpoints individually

### Useful Commands
```bash
# Check all services
lsof -i :8080  # Frontend
lsof -i :5000  # Backend
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis

# Restart services
cd backend && npm run dev
cd .. && npm run dev
```

---

## 🎉 Congratulations!

You now have a **production-ready, AI-powered calendar application** with:

- 🔐 **Secure Authentication System**
- 🤖 **Advanced AI Integration**
- 📅 **Multi-Platform Calendar Sync**
- 📊 **Productivity Analytics**
- 🎨 **Modern, Responsive UI**

**NeuroCal is ready to revolutionize your time management!** 🚀

---

*Need help? Check the troubleshooting section or review the backend README for detailed API documentation.*
