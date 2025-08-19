# NeuroCal Multi-Email Authentication Setup Guide

## Overview

This guide will help you set up the comprehensive multi-email authentication system for NeuroCal, which supports:

- **OAuth Providers**: Google, Microsoft, Apple, Yahoo
- **Email/Password**: Traditional authentication with email verification
- **Multi-Provider Accounts**: Link multiple email providers to one account
- **Calendar Integration**: Seamless calendar sync across providers

## Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database
- Redis server
- SMTP email service (Gmail, SendGrid, etc.)

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Database Setup

Run the migration script to create the necessary tables:

```bash
npm run db:migrate
```

This will create:
- `users` - User accounts and profiles
- `user_auth_providers` - OAuth provider connections
- `calendar_connections` - Calendar sync configurations
- `email_verification_tokens` - Email verification
- `password_reset_tokens` - Password reset functionality

### 3. Environment Configuration

Copy `env.example` to `.env` and configure:

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=neurocal
DB_USER=postgres
DB_PASSWORD=your_password

# Redis
REDIS_URL=redis://localhost:6379

# JWT & Sessions
JWT_SECRET=your-super-secret-jwt-key
SESSION_SECRET=your-session-secret

# Frontend URL
FRONTEND_URL=http://localhost:8080
```

## OAuth Provider Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API and Google Calendar API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (development)
   - `https://yourdomain.com/api/auth/google/callback` (production)
7. Copy Client ID and Client Secret to `.env`

```bash
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

### Microsoft OAuth

1. Go to [Azure Portal](https://portal.azure.com/)
2. Register a new application
3. Set redirect URI to `/api/auth/microsoft/callback`
4. Copy Application (client) ID and create a client secret
5. Add to `.env`:

```bash
MICROSOFT_CLIENT_ID=your_client_id
MICROSOFT_CLIENT_SECRET=your_client_secret
```

### Apple OAuth

1. Go to [Apple Developer](https://developer.apple.com/)
2. Create an App ID with Sign In capability
3. Create a Services ID
4. Generate a private key and download the .p8 file
5. Configure in `.env`:

```bash
APPLE_CLIENT_ID=your_services_id
APPLE_TEAM_ID=your_team_id
APPLE_KEY_ID=your_key_id
APPLE_PRIVATE_KEY_PATH=path/to/AuthKey_KEYID.p8
```

### Yahoo OAuth

1. Go to [Yahoo Developer Network](https://developer.yahoo.com/)
2. Create a new application
3. Set redirect URI to `/api/auth/yahoo/callback`
4. Copy Consumer Key and Consumer Secret to `.env`:

```bash
YAHOO_CLIENT_ID=your_consumer_key
YAHOO_CLIENT_SECRET=your_consumer_secret
```

## Email Service Setup

### Gmail SMTP

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password
3. Configure in `.env`:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@neurocal.com
```

### SendGrid (Alternative)

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
SMTP_FROM=noreply@neurocal.com
```

## Frontend Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create `.env.local`:

```bash
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. OAuth Icons

The system includes SVG icons for all OAuth providers in `/public/icons/`:
- `google.svg` - Google OAuth
- `microsoft.svg` - Microsoft OAuth  
- `apple.svg` - Apple OAuth
- `yahoo.svg` - Yahoo OAuth

## Running the Application

### Backend

```bash
cd backend
npm run dev
```

### Frontend

```bash
npm run dev
```

## Testing the Authentication

### 1. OAuth Flow

1. Click "Continue with Google" (or other provider)
2. Complete OAuth consent
3. Redirect back to dashboard with JWT token

### 2. Email/Password Flow

1. Enter email address
2. System detects if account exists
3. Show appropriate form (sign in or sign up)
4. Complete authentication
5. Email verification (for new accounts)

### 3. Multi-Provider Linking

1. Sign in with primary provider
2. Go to Account Settings
3. Click "Add Account" for additional provider
4. Complete OAuth flow
5. Calendar data merges automatically

## Security Features

### Token Management

- JWT tokens with 7-day expiration
- Secure token storage in localStorage
- Automatic token refresh
- Redis session storage

### Data Protection

- Password hashing with bcrypt (12 rounds)
- Email verification required
- Rate limiting on auth endpoints
- CORS protection
- Helmet security headers

### Privacy Compliance

- GDPR-ready data handling
- User consent management
- Data deletion capabilities
- Provider disconnection options

## Troubleshooting

### Common Issues

1. **OAuth Callback Errors**
   - Check redirect URIs in provider settings
   - Verify environment variables
   - Check CORS configuration

2. **Email Not Sending**
   - Verify SMTP credentials
   - Check firewall/port settings
   - Verify email service limits

3. **Database Connection**
   - Check PostgreSQL service status
   - Verify connection credentials
   - Run migration script

4. **Redis Connection**
   - Ensure Redis server is running
   - Check connection URL
   - Verify Redis configuration

### Debug Mode

Enable debug logging in `.env`:

```bash
NODE_ENV=development
DEBUG=passport:*
```

## Production Deployment

### Environment Variables

```bash
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
JWT_SECRET=very-long-random-string
SESSION_SECRET=another-very-long-random-string
```

### SSL Configuration

```bash
SMTP_SECURE=true
SMTP_PORT=465
```

### Database Security

- Use strong passwords
- Enable SSL connections
- Restrict network access
- Regular backups

## API Endpoints

### Authentication

- `POST /api/auth/check-email` - Check if email exists
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### OAuth

- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/microsoft` - Microsoft OAuth
- `GET /api/auth/apple` - Apple OAuth
- `GET /api/auth/yahoo` - Yahoo OAuth

## Support

For issues or questions:

1. Check the troubleshooting section
2. Review environment configuration
3. Check application logs
4. Verify provider settings
5. Test with minimal configuration

## Next Steps

After authentication is working:

1. Implement calendar sync endpoints
2. Add AI-powered features
3. Set up analytics and monitoring
4. Configure user preferences
5. Add multi-language support
