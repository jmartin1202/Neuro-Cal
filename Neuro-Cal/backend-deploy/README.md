# NeuroCal Backend API

A powerful, AI-powered calendar backend built with Node.js, Express, and PostgreSQL.

## 🚀 Features

- **User Authentication**: JWT-based authentication with bcrypt password hashing
- **AI Integration**: OpenAI GPT-4 and Anthropic Claude for natural language processing
- **Calendar Sync**: Google Calendar and Outlook integration with OAuth2
- **Smart Scheduling**: AI-powered time slot suggestions and conflict resolution
- **Event Management**: Full CRUD operations for calendar events
- **Analytics**: Productivity insights and calendar statistics
- **Real-time Sync**: Automatic calendar synchronization every 15 minutes

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL 14+
- **Cache**: Redis 6+
- **Authentication**: JWT + bcrypt
- **AI**: OpenAI GPT-4, Anthropic Claude
- **Calendar APIs**: Google Calendar API, Microsoft Graph API
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Redis 6+
- Google Cloud Console account (for Google Calendar)
- Microsoft Azure account (for Outlook)

## 🔧 Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd Neuro-Cal/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   ```env
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=neurocal
   DB_USER=postgres
   DB_PASSWORD=your_password

   # AI APIs
   OPENAI_API_KEY=your_openai_key
   ANTHROPIC_API_KEY=your_anthropic_key

   # JWT
   JWT_SECRET=your-secret-key

   # Google Calendar
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # Microsoft Graph
   MICROSOFT_CLIENT_ID=your_microsoft_client_id
   MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
   ```

5. **Set up PostgreSQL database**
   ```sql
   CREATE DATABASE neurocal;
   CREATE USER neurocal_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE neurocal TO neurocal_user;
   ```

6. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

7. **Start the server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## 🗄️ Database Schema

The backend creates the following tables:

- **users**: User accounts and profiles
- **events**: Calendar events and meetings
- **event_attendees**: Event participants
- **calendar_syncs**: External calendar connections
- **ai_interactions**: AI usage tracking
- **smart_suggestions**: AI-generated scheduling suggestions
- **user_analytics**: Productivity metrics and insights

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Calendar Events
- `GET /api/calendar/events` - Get events
- `GET /api/calendar/events/:id` - Get specific event
- `POST /api/calendar/events` - Create event
- `PUT /api/calendar/events/:id` - Update event
- `DELETE /api/calendar/events/:id` - Delete event
- `GET /api/calendar/search` - Search events
- `GET /api/calendar/stats` - Get calendar statistics

### AI Features
- `POST /api/ai/create-event` - AI-powered event creation
- `GET /api/ai/suggestions` - Smart scheduling suggestions
- `GET /api/ai/insights` - Calendar insights and analysis
- `POST /api/ai/meeting-prep` - AI meeting preparation

### Calendar Sync
- `GET /api/sync/google/auth` - Google Calendar OAuth
- `GET /api/sync/outlook/auth` - Outlook OAuth
- `POST /api/sync/:provider` - Manual sync trigger
- `GET /api/sync/status` - Get sync status
- `DELETE /api/sync/disconnect/:provider` - Disconnect calendar

### User Management
- `GET /api/users/preferences` - Get user preferences
- `PUT /api/users/preferences` - Update preferences
- `GET /api/users/analytics` - Get user analytics
- `GET /api/users/productivity-insights` - Productivity insights
- `GET /api/users/dashboard` - User dashboard data

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 🤖 AI Integration

### OpenAI GPT-4
- Natural language event parsing
- Meeting preparation assistance
- Smart event descriptions

### Anthropic Claude
- Schedule analysis and optimization
- Productivity insights
- Time slot recommendations

## 📅 Calendar Sync

### Google Calendar
- OAuth2 authentication
- Real-time event synchronization
- Attendee management

### Microsoft Outlook
- Microsoft Graph API integration
- Calendar and contact sync
- Meeting response tracking

## 📊 Analytics & Insights

- **Productivity Scoring**: AI-powered productivity analysis
- **Time Distribution**: Meeting vs. focus time analysis
- **AI Usage Tracking**: Monitor AI feature adoption
- **Schedule Optimization**: Smart recommendations for better time management

## 🚀 Development

### Scripts
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data

### Code Structure
```
backend/
├── server.js          # Main server file
├── routes/            # API route handlers
│   ├── auth.js        # Authentication routes
│   ├── calendar.js    # Calendar management
│   ├── ai.js          # AI features
│   ├── sync.js        # Calendar sync
│   └── users.js       # User management
├── scripts/           # Database scripts
│   └── migrate.js     # Database migration
└── package.json       # Dependencies and scripts
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configured for frontend security
- **Helmet**: Security headers and protection

## 📈 Performance

- **Database Indexing**: Optimized queries with proper indexes
- **Redis Caching**: Fast response times for frequently accessed data
- **Connection Pooling**: Efficient database connections
- **Batch Operations**: Optimized calendar sync operations

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run with coverage
npm run test:coverage
```

## 🚀 Deployment

### Production Environment Variables
```env
NODE_ENV=production
PORT=5000
DB_HOST=your_production_db_host
DB_PASSWORD=your_production_db_password
JWT_SECRET=your_production_jwt_secret
```

### Docker (Optional)
```bash
# Build image
docker build -t neurocal-backend .

# Run container
docker run -p 5000:5000 --env-file .env neurocal-backend
```

## 📝 API Documentation

Full API documentation is available at `/api-docs` when the server is running (Swagger/OpenAPI).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the logs for debugging information

## 🔄 Updates

- **v1.0.0**: Initial release with core features
- **v1.1.0**: Enhanced AI capabilities and analytics
- **v1.2.0**: Advanced calendar sync and productivity insights

---

**NeuroCal Backend** - Powering the future of intelligent calendar management! 🚀
