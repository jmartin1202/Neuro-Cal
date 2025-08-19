# PostgreSQL Setup Guide for NeuroCal

## Overview
NeuroCal requires PostgreSQL for full functionality including user authentication, calendar data, and AI-powered features. This guide will help you set up PostgreSQL locally and configure the application.

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Git (for version control)

## 1. Install PostgreSQL

### macOS (using Homebrew)
```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Add to PATH (add to ~/.zshrc or ~/.bash_profile)
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
```

### Ubuntu/Debian
```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Windows
1. Download PostgreSQL installer from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run the installer and follow the setup wizard
3. Remember the password you set for the `postgres` user

## 2. Create Database and User

### Connect to PostgreSQL
```bash
# macOS/Linux
psql postgres

# Windows (if added to PATH)
psql -U postgres
```

### Create Database and User
```sql
-- Create database
CREATE DATABASE neurocal;

-- Create user (optional - you can use postgres user for development)
CREATE USER neurocal_user WITH PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE neurocal TO neurocal_user;

-- Connect to the neurocal database
\c neurocal

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO neurocal_user;

-- Exit psql
\q
```

## 3. Environment Configuration

### Copy Environment File
```bash
# From the Neuro-Cal directory
cp env.example .env
```

### Update .env File
```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=neurocal
DB_USER=postgres          # or neurocal_user if you created one
DB_PASSWORD=your_password # the password you set during installation

# Other configurations...
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
JWT_SECRET=your-super-secret-jwt-key-change-in-production
SESSION_SECRET=your-session-secret-change-in-production
```

## 4. Install Dependencies

### Backend Dependencies
```bash
cd backend
npm install
```

### Verify PostgreSQL Connection
```bash
# Test database connection
npm run db:migrate
```

## 5. Database Migration

### Run Initial Migration
```bash
# This will create all necessary tables
npm run db:migrate
```

### Verify Tables Created
```bash
# Connect to database
psql -U postgres -d neurocal

# List tables
\dt

# Check table structure
\d users
\d user_auth_providers
\d calendar_connections

# Exit
\q
```

## 6. Start the Application

### Development Mode
```bash
# Start backend server
npm run dev

# In another terminal, start frontend (from Neuro-Cal directory)
npm run dev
```

### Production Mode
```bash
# Start backend
npm start

# Build and serve frontend
npm run build
npm run preview
```

## 7. Database Health Check

### Test API Endpoints
```bash
# Health check
curl http://localhost:5001/health

# Auth health check
curl http://localhost:5001/api/auth/health
```

## 8. Troubleshooting

### Common Issues

#### Connection Refused
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql  # macOS
sudo systemctl status postgresql      # Linux
```

#### Authentication Failed
```bash
# Check pg_hba.conf file location
# macOS: /opt/homebrew/var/postgresql@15/pg_hba.conf
# Linux: /etc/postgresql/15/main/pg_hba.conf

# Ensure local connections are allowed
# local   all             all                                     peer
# host    all             all             127.0.0.1/32            md5
```

#### Port Already in Use
```bash
# Check what's using port 5432
lsof -i :5432

# Kill process if needed
kill -9 <PID>
```

### Reset Database (Development Only)
```bash
# Drop and recreate database
psql -U postgres -c "DROP DATABASE IF EXISTS neurocal;"
psql -U postgres -c "CREATE DATABASE neurocal;"

# Run migration again
npm run db:migrate
```

## 9. Production Considerations

### Environment Variables
- Use strong, unique passwords
- Store secrets in environment variables, not in code
- Use different databases for development and production

### Security
- Enable SSL connections in production
- Use connection pooling for better performance
- Regular database backups
- Monitor database performance

### Scaling
- Consider read replicas for heavy read workloads
- Implement proper indexing strategies
- Monitor query performance

## 10. Next Steps

After completing this setup:
1. Test user registration and login
2. Verify OAuth connections work
3. Test calendar synchronization
4. Check AI features functionality
5. Review application logs for any errors

## Support

If you encounter issues:
1. Check the application logs
2. Verify database connection parameters
3. Ensure all environment variables are set
4. Check PostgreSQL service status
5. Review the troubleshooting section above

---

**Note**: This setup is for development. For production deployment, ensure proper security measures, SSL certificates, and environment-specific configurations.
