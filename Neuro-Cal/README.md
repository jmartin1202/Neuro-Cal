# NeuroCal - AI-Powered Calendar Application

## Overview

NeuroCal is an intelligent calendar application that combines traditional calendar functionality with AI-powered features for enhanced productivity and scheduling optimization.

## Features

- **Smart Calendar Management**: Intuitive calendar interface with drag-and-drop functionality
- **AI-Powered Suggestions**: Intelligent scheduling recommendations and conflict resolution
- **Multi-Provider OAuth**: Support for Google, Microsoft, Apple, and Yahoo calendars
- **User Analytics**: Comprehensive insights into calendar usage patterns
- **Email Integration**: Built-in email verification and notification system
- **Responsive Design**: Modern UI that works seamlessly across all devices

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express + PostgreSQL + Redis
- **Authentication**: Passport.js + JWT + OAuth 2.0
- **AI Services**: OpenAI + Anthropic Claude
- **Calendar APIs**: Google Calendar, Microsoft Graph, Apple Calendar
- **Analytics**: Mixpanel, PostHog, Hotjar

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15+ (required for full functionality)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd NeuroCal
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   cd ..
   ```

3. **Set up PostgreSQL** (Required for full functionality)
   
   **macOS (Recommended)**
   ```bash
   # Run the automated setup script
   ./setup-postgresql.sh
   ```
   
   **Manual Setup**
   ```bash
   # Install PostgreSQL
   brew install postgresql@15  # macOS
   sudo apt install postgresql postgresql-contrib  # Ubuntu/Debian
   
   # Start service and create database
   brew services start postgresql@15  # macOS
   sudo systemctl start postgresql  # Ubuntu/Debian
   
   # Create database
   psql postgres -c "CREATE DATABASE neurocal;"
   ```

4. **Configure environment**
   ```bash
   cp env.example .env
   # Edit .env with your database credentials and API keys
   ```

5. **Initialize database**
   ```bash
   cd backend
   npm run db:test    # Test database connection
   npm run db:init    # Create tables and indexes
   ```

6. **Start the application**
   ```bash
   # Terminal 1: Start backend
   cd backend
   npm run dev
   
   # Terminal 2: Start frontend
   npm run dev
   ```

### Database Setup

NeuroCal requires PostgreSQL for full functionality. See [POSTGRESQL_SETUP.md](./POSTGRESQL_SETUP.md) for detailed setup instructions.

**Quick Database Commands:**
```bash
cd backend
npm run db:test    # Test database connection
npm run db:init    # Initialize database schema
npm run db:migrate # Run migrations
```

## Development

### Project Structure

```
NeuroCal/
├── src/                    # Frontend React application
│   ├── components/        # React components
│   ├── pages/            # Page components
│   ├── hooks/            # Custom React hooks
│   ├── contexts/         # React contexts
│   └── lib/              # Utility libraries
├── backend/               # Backend Node.js application
│   ├── routes/           # API route handlers
│   ├── services/         # Business logic services
│   ├── config/           # Configuration files
│   └── scripts/          # Database and utility scripts
└── docs/                  # Documentation
```

### Available Scripts

**Frontend:**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

**Backend:**
```bash
npm run dev          # Start development server with nodemon
npm start            # Start production server
npm run db:test      # Test database connection
npm run db:init      # Initialize database schema
npm run db:migrate   # Run database migrations
```

### Environment Variables

Copy `env.example` to `.env` and configure:

- **Database**: PostgreSQL connection details
- **OAuth**: Google, Microsoft, Apple, Yahoo API credentials
- **AI Services**: OpenAI and Anthropic API keys
- **Email**: SMTP configuration for notifications
- **Analytics**: Mixpanel, PostHog, Hotjar tokens

## Deployment

### Heroku Deployment

1. **Create Heroku app**
   ```bash
   heroku create your-neurocal-app
   ```

2. **Add PostgreSQL addon**
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

3. **Set environment variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-secure-jwt-secret
   # Add other environment variables
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

### Local Production Build

```bash
# Build frontend
npm run build

# Start backend
cd backend
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

- **Documentation**: See the `docs/` directory
- **Database Setup**: [POSTGRESQL_SETUP.md](./POSTGRESQL_SETUP.md)
- **Issues**: Create an issue on GitHub

## License

MIT License - see LICENSE file for details
