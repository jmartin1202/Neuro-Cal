# NeuroCal Quick Start Checklist

## ✅ Pre-flight Checklist

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Git installed (`git --version`)
- [ ] PostgreSQL 15+ installed and running
- [ ] Port 5001 available for backend
- [ ] Port 8080 available for frontend

## 🚀 Setup Steps

### 1. Database Setup
- [ ] PostgreSQL service is running
- [ ] Database `neurocal` exists
- [ ] User has proper permissions
- [ ] Connection test passes

**Quick Test:**
```bash
cd backend
npm run db:test
```

### 2. Environment Configuration
- [ ] Copied `env.example` to `.env`
- [ ] Updated database credentials in `.env`
- [ ] Set secure JWT and session secrets
- [ ] Configured OAuth provider credentials (optional)

### 3. Dependencies Installation
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Backend dependencies installed (`cd backend && npm install`)

### 4. Database Initialization
- [ ] Database schema created
- [ ] Tables and indexes created
- [ ] Triggers and functions created

**Run:**
```bash
cd backend
npm run db:init
```

### 5. Application Startup
- [ ] Backend server starts without errors
- [ ] Frontend development server starts
- [ ] Health endpoints respond correctly

**Test:**
```bash
# Backend health
curl http://localhost:5001/health

# Database health
curl http://localhost:5001/health/db

# Frontend
open http://localhost:8080
```

## 🔍 Troubleshooting

### Database Connection Issues
- [ ] PostgreSQL service running
- [ ] Correct port (5432)
- [ ] Valid credentials in `.env`
- [ ] Database exists
- [ ] User has permissions

### Port Conflicts
- [ ] Check what's using port 5001: `lsof -i :5001`
- [ ] Check what's using port 8080: `lsof -i :8080`
- [ ] Update ports in `.env` if needed

### Missing Dependencies
- [ ] Run `npm install` in both frontend and backend directories
- [ ] Check for Node.js version compatibility
- [ ] Clear `node_modules` and reinstall if needed

## 📱 Testing the Application

### Basic Functionality
- [ ] Frontend loads without errors
- [ ] Backend API responds
- [ ] Database health check passes
- [ ] User registration works
- [ ] User login works

### OAuth Integration (Optional)
- [ ] Google OAuth configured
- [ ] Microsoft OAuth configured
- [ ] Apple OAuth configured
- [ ] Yahoo OAuth configured

### AI Features (Optional)
- [ ] OpenAI API key configured
- [ ] Anthropic API key configured
- [ ] AI suggestions working

## 🚨 Common Issues & Solutions

### "Cannot connect to database"
```bash
# Check PostgreSQL status
brew services list | grep postgresql  # macOS
sudo systemctl status postgresql      # Linux

# Test connection manually
psql -U postgres -d neurocal
```

### "Port already in use"
```bash
# Find process using port
lsof -i :5001
lsof -i :8080

# Kill process
kill -9 <PID>
```

### "Module not found"
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### "Permission denied"
```bash
# Check file permissions
chmod +x setup-postgresql.sh

# Check database user permissions
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE neurocal TO your_user;"
```

## 🎯 Next Steps

After successful setup:
1. **Test user registration and login**
2. **Configure OAuth providers** (Google, Microsoft, etc.)
3. **Set up AI service API keys**
4. **Test calendar synchronization**
5. **Configure email service**
6. **Set up analytics tracking**

## 📞 Getting Help

- **Documentation**: Check `POSTGRESQL_SETUP.md` for detailed database setup
- **Logs**: Check console output for error messages
- **Health Checks**: Use `/health` and `/health/db` endpoints
- **Database**: Use `npm run db:test` to verify connection

---

**Remember**: PostgreSQL is required for full functionality. The application will not work properly without a working database connection.
