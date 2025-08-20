# Neuro-Cal API Documentation

## Overview
The Neuro-Cal API provides comprehensive calendar management, CRM functionality, and AI-powered features. This document outlines all available endpoints, request/response formats, and authentication requirements.

## Base URL
- **Development**: `http://localhost:3000`
- **Production**: `https://your-production-domain.com`

## Authentication
All API endpoints require authentication via JWT tokens, except where noted.

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## API Endpoints

### Authentication

#### POST /api/auth/login
Authenticate a user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "rememberMe": false,
  "twoFactorCode": "123456" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "subscription": {
        "plan": "pro",
        "status": "active"
      }
    },
    "token": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  },
  "timestamp": "2024-01-15T10:00:00Z"
}
```

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePassword123",
  "confirmPassword": "SecurePassword123",
  "name": "New User",
  "acceptTerms": true,
  "marketingEmails": false
}
```

#### POST /api/auth/refresh
Refresh an expired JWT token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

#### POST /api/auth/logout
Logout and invalidate tokens.

#### POST /api/auth/forgot-password
Request password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

#### POST /api/auth/reset-password
Reset password with token.

**Request Body:**
```json
{
  "token": "reset_token_here",
  "newPassword": "NewPassword123",
  "confirmPassword": "NewPassword123"
}
```

### Calendar Events

#### GET /api/events
Retrieve events with pagination and filtering.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `startDate` (string): ISO date string
- `endDate` (string): ISO date string
- `category` (string): Category ID
- `search` (string): Search term
- `status` (string): Event status filter

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Team Meeting",
      "description": "Weekly team sync",
      "start": "2024-01-15T10:00:00Z",
      "end": "2024-01-15T11:00:00Z",
      "allDay": false,
      "location": "Conference Room A",
      "category": {
        "id": "uuid",
        "name": "Meeting",
        "color": "#3B82F6"
      },
      "priority": "medium",
      "status": "confirmed",
      "attendees": [
        {
          "id": "uuid",
          "email": "attendee@example.com",
          "name": "Jane Doe",
          "response": "accepted"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

#### POST /api/events
Create a new event.

**Request Body:**
```json
{
  "title": "New Event",
  "description": "Event description",
  "start": "2024-01-20T14:00:00Z",
  "end": "2024-01-20T15:00:00Z",
  "allDay": false,
  "location": "Office",
  "categoryId": "uuid",
  "priority": "medium",
  "attendees": ["email1@example.com", "email2@example.com"],
  "tags": ["work", "important"],
  "recurrence": {
    "frequency": "weekly",
    "interval": 1,
    "endDate": "2024-03-20T00:00:00Z"
  }
}
```

#### GET /api/events/:id
Retrieve a specific event by ID.

#### PUT /api/events/:id
Update an existing event.

#### DELETE /api/events/:id
Delete an event.

#### POST /api/events/:id/duplicate
Duplicate an existing event.

#### POST /api/events/:id/attendees
Manage event attendees.

**Request Body:**
```json
{
  "action": "add", // or "remove", "update"
  "attendees": [
    {
      "email": "new@example.com",
      "name": "New Attendee"
    }
  ]
}
```

### CRM

#### GET /api/crm/contacts
Retrieve contacts with filtering and pagination.

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `status` (string): Contact status
- `source` (string): Lead source
- `search` (string): Search term
- `tags` (string): Comma-separated tags

#### POST /api/crm/contacts
Create a new contact.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "company": "Acme Corp",
  "position": "Manager",
  "status": "prospect",
  "source": "website",
  "tags": ["lead", "tech"],
  "notes": "Interested in our product"
}
```

#### GET /api/crm/contacts/:id
Retrieve a specific contact.

#### PUT /api/crm/contacts/:id
Update a contact.

#### DELETE /api/crm/contacts/:id
Delete a contact.

#### GET /api/crm/deals
Retrieve deals with filtering.

#### POST /api/crm/deals
Create a new deal.

**Request Body:**
```json
{
  "title": "Enterprise Deal",
  "description": "Large enterprise contract",
  "amount": 50000,
  "currency": "USD",
  "stage": "proposal",
  "probability": 75,
  "expectedCloseDate": "2024-02-15T00:00:00Z",
  "contactId": "uuid"
}
```

### AI Suggestions

#### GET /api/ai/suggestions
Retrieve AI-powered suggestions.

**Query Parameters:**
- `type` (string): Suggestion type (event, reminder, optimization, insight)
- `limit` (number): Number of suggestions

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "event",
      "title": "Schedule Follow-up Meeting",
      "description": "Based on recent interaction with John Doe",
      "confidence": 0.85,
      "action": "create_event",
      "metadata": {
        "contactId": "uuid",
        "suggestedDate": "2024-01-20T14:00:00Z"
      }
    }
  ]
}
```

#### POST /api/ai/suggestions/:id/apply
Apply an AI suggestion.

#### POST /api/ai/analyze
Request AI analysis of calendar data.

**Request Body:**
```json
{
  "analysisType": "productivity",
  "dateRange": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-31T23:59:59Z"
  },
  "focusAreas": ["meetings", "breaks", "deep_work"]
}
```

### Subscriptions & Billing

#### GET /api/billing/subscription
Retrieve current subscription details.

#### POST /api/billing/subscription
Create or update subscription.

**Request Body:**
```json
{
  "plan": "pro",
  "paymentMethodId": "pm_1234567890",
  "couponCode": "WELCOME20" // Optional
}
```

#### DELETE /api/billing/subscription
Cancel subscription.

#### GET /api/billing/invoices
Retrieve billing history.

#### POST /api/billing/webhook
Stripe webhook endpoint (no authentication required).

### Analytics

#### GET /api/analytics/overview
Retrieve analytics overview.

**Query Parameters:**
- `period` (string): Time period (day, week, month, year)
- `startDate` (string): Custom start date
- `endDate` (string): Custom end date

**Response:**
```json
{
  "success": true,
  "data": {
    "events": {
      "total": 150,
      "completed": 120,
      "cancelled": 5,
      "upcoming": 25
    },
    "productivity": {
      "averageEventDuration": 60,
      "mostProductiveDay": "Tuesday",
      "mostProductiveHour": 14
    },
    "crm": {
      "totalContacts": 250,
      "newLeads": 15,
      "dealsWon": 8,
      "revenue": 75000
    }
  }
}
```

#### GET /api/analytics/events
Retrieve event analytics.

#### GET /api/analytics/crm
Retrieve CRM analytics.

#### GET /api/analytics/performance
Retrieve performance metrics.

### Sync & Integration

#### GET /api/sync/status
Check sync status for external calendars.

#### POST /api/sync/start
Start synchronization with external calendar.

**Request Body:**
```json
{
  "provider": "google", // google, outlook, apple
  "calendarId": "primary"
}
```

#### POST /api/sync/stop
Stop synchronization.

#### GET /api/sync/history
Retrieve sync history.

### User Management

#### GET /api/users/profile
Retrieve current user profile.

#### PUT /api/users/profile
Update user profile.

#### PUT /api/users/preferences
Update user preferences.

**Request Body:**
```json
{
  "theme": "dark",
  "timezone": "America/New_York",
  "notifications": {
    "email": true,
    "push": true,
    "reminderTime": 15
  },
  "calendar": {
    "defaultView": "week",
    "workingHours": {
      "start": "09:00",
      "end": "17:00"
    },
    "weekStartsOn": 1
  }
}
```

#### POST /api/users/avatar
Upload user avatar.

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": "Error message",
  "errorCode": "VALIDATION_ERROR",
  "details": {
    "field": "email",
    "message": "Invalid email format"
  },
  "timestamp": "2024-01-15T10:00:00Z"
}
```

### Common Error Codes
- `AUTHENTICATION_ERROR`: Invalid or expired token
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `VALIDATION_ERROR`: Invalid request data
- `NOT_FOUND`: Resource not found
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_SERVER_ERROR`: Server error

## Rate Limiting
- **Free Plan**: 100 requests/hour
- **Basic Plan**: 500 requests/hour
- **Pro Plan**: 2000 requests/hour
- **Enterprise Plan**: 10000 requests/hour

## Pagination
All list endpoints support pagination with the following response format:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Webhooks
Configure webhooks to receive real-time updates:

### Supported Events
- `event.created`
- `event.updated`
- `event.deleted`
- `contact.created`
- `deal.stage_changed`
- `subscription.updated`

### Webhook Payload
```json
{
  "id": "webhook_id",
  "event": "event.created",
  "data": {
    "event": {...}
  },
  "timestamp": "2024-01-15T10:00:00Z",
  "signature": "webhook_signature"
}
```

## SDKs & Libraries
- **JavaScript/TypeScript**: `@neurocal/sdk`
- **Python**: `neurocal-python`
- **Ruby**: `neurocal-ruby`
- **PHP**: `neurocal-php`

## Support
- **Documentation**: [docs.neurocal.com](https://docs.neurocal.com)
- **API Status**: [status.neurocal.com](https://status.neurocal.com)
- **Support Email**: api-support@neurocal.com
- **Developer Community**: [community.neurocal.com](https://community.neurocal.com)

## Changelog
### v1.2.0 (2024-01-15)
- Added AI suggestions endpoint
- Enhanced CRM analytics
- Improved error handling

### v1.1.0 (2024-01-01)
- Added webhook support
- Enhanced pagination
- Added rate limiting

### v1.0.0 (2023-12-01)
- Initial API release
- Core calendar functionality
- Basic CRM features
