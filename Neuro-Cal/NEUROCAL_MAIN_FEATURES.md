# NeuroCal Main App Features

## Overview
The NeuroCalMain component provides a comprehensive interface with three main tabs:
1. **Calendar** - Interactive calendar with event management
2. **CRM** - Contact relationship management system
3. **Settings** - Comprehensive application configuration

## Access
Navigate to `/main` in your browser to access the main NeuroCal application.

## Calendar Tab
- **Interactive Calendar**: Click on any date to add events
- **Event Management**: Create, view, and delete events
- **Event Types**: Support for meetings, personal events, reminders, and deadlines
- **Event Details**: Title, time, description, and type selection

### Adding Events
1. Click on any date in the calendar
2. Fill in the event details (title is required)
3. Select event type and optional description
4. Click "Add Event" to save

### Event Types
- **Meeting** (Blue): Business and professional meetings
- **Personal** (Green): Personal appointments and activities
- **Reminder** (Yellow): Important reminders and notifications
- **Deadline** (Red): Project deadlines and due dates

## CRM Tab
The CRM system provides comprehensive contact management with the following features:

### Contact Management
- **Add Contacts**: Create new contacts with detailed information
- **Edit Contacts**: Modify existing contact details
- **Delete Contacts**: Remove contacts from the system
- **Search & Filter**: Find contacts by name, email, company, or status

### Contact Fields
- **Name** (Required): Contact's full name
- **Email** (Required): Primary email address
- **Phone**: Contact phone number
- **Company**: Associated company or organization
- **Status**: Lead, Client, or Active
- **Last Contact**: Automatically updated when editing

### Contact Statuses
- **Lead**: Potential customer or business opportunity
- **Client**: Current customer with active relationship
- **Active**: Engaged contact with ongoing communication

### Search & Filtering
- **Search Bar**: Search across name, email, and company fields
- **Status Filter**: Filter contacts by their current status
- **Real-time Results**: Instant search results as you type

## Settings Tab
Comprehensive application configuration with organized sections:

### Notifications
- **Push Notifications**: Toggle push notification support
- **Email Reminders**: Enable/disable email reminder system

### Appearance
- **Dark Mode**: Toggle between light and dark themes
- **Week Start**: Choose whether weeks start on Sunday or Monday

### Regional Settings
- **Time Zone**: Select your local time zone
  - Pacific Time (UTC-8)
  - Mountain Time (UTC-7)
  - Central Time (UTC-6)
  - Eastern Time (UTC-5)
- **Language**: Choose your preferred language
  - English
  - Spanish
  - French
  - German

### Calendar Settings
- **Auto-sync Events**: Enable automatic event synchronization
- **Default Meeting Length**: Set standard meeting duration
  - 15 minutes
  - 30 minutes
  - 1 hour
  - 1.5 hours
  - 2 hours

## Technical Features
- **Responsive Design**: Works on desktop and mobile devices
- **State Management**: React hooks for efficient state handling
- **Modal System**: Clean, accessible modal dialogs for forms
- **Real-time Updates**: Immediate UI updates for all actions
- **Data Persistence**: Local state management for demo purposes

## Usage Examples

### Adding a New Contact
1. Navigate to the CRM tab
2. Click "Add Contact" button
3. Fill in the required fields (name and email)
4. Add optional information (phone, company, status)
5. Click "Add Contact" to save

### Changing Application Settings
1. Navigate to the Settings tab
2. Find the relevant section (Notifications, Appearance, etc.)
3. Toggle switches or select from dropdown menus
4. Changes are applied immediately

### Creating Calendar Events
1. Navigate to the Calendar tab
2. Click on any date
3. Fill in event details
4. Select event type and time
5. Add optional description
6. Save the event

## Browser Compatibility
- Modern browsers with ES6+ support
- Responsive design for mobile and desktop
- Touch-friendly interface for mobile devices

## Future Enhancements
- Data persistence with backend integration
- User authentication and data sync
- Advanced CRM features (deals, pipelines, analytics)
- Calendar integration with external services
- Advanced notification system
- Multi-language support with translations
