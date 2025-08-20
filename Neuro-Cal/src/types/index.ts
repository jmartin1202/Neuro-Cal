// Core application types
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  subscription: Subscription;
  preferences: UserPreferences;
}

export interface Subscription {
  id: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  timezone: string;
  notifications: NotificationSettings;
  calendar: CalendarSettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  reminderTime: number; // minutes before event
}

export interface CalendarSettings {
  defaultView: 'day' | 'week' | 'month';
  workingHours: {
    start: string; // "09:00"
    end: string; // "17:00"
  };
  weekStartsOn: 0 | 1; // 0 = Sunday, 1 = Monday
}

// Event types
export interface Event {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  allDay: boolean;
  location?: string;
  attendees: Attendee[];
  recurrence?: RecurrenceRule;
  category: EventCategory;
  priority: 'low' | 'medium' | 'high';
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  tags: string[];
  metadata: Record<string, any>;
}

export interface Attendee {
  id: string;
  email: string;
  name?: string;
  response: 'pending' | 'accepted' | 'declined' | 'tentative';
  responseTime?: Date;
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: Date;
  occurrences?: number;
  byDay?: number[]; // 0-6 for Sunday-Saturday
  byMonthDay?: number[]; // 1-31
  byMonth?: number[]; // 1-12
  byYearDay?: number[]; // 1-366
  weekStart?: number; // 0-6
}

export interface EventCategory {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

// CRM types
export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  status: 'lead' | 'prospect' | 'customer' | 'inactive';
  source: string;
  tags: string[];
  notes?: string;
  lastContact?: Date;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface Deal {
  id: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  stage: 'lead' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  probability: number; // 0-100
  expectedCloseDate: Date;
  contactId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Analytics types
export interface AnalyticsEvent {
  id: string;
  name: string;
  properties: Record<string, any>;
  timestamp: Date;
  userId?: string;
  sessionId: string;
  page: string;
  userAgent: string;
}

export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  component?: string;
  userId?: string;
}

// AI types
export interface AISuggestion {
  id: string;
  type: 'event' | 'reminder' | 'optimization' | 'insight';
  title: string;
  description: string;
  confidence: number; // 0-1
  action?: string;
  metadata: Record<string, any>;
  createdAt: Date;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'select' | 'textarea' | 'date' | 'time' | 'checkbox';
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: ValidationRule[];
}

export interface ValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

// UI types
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface Modal {
  id: string;
  title: string;
  content: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  onClose?: () => void;
}

// Feature flags
export interface FeatureFlags {
  aiSuggestions: boolean;
  crm: boolean;
  analytics: boolean;
  subscriptions: boolean;
  advancedCalendar: boolean;
  mobileApp: boolean;
}

// Environment types
export interface Environment {
  NODE_ENV: 'development' | 'production' | 'test';
  API_URL: string;
  ANALYTICS_ENABLED: boolean;
  GA_TRACKING_ID?: string;
  STRIPE_PUBLISHABLE_KEY?: string;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
}

// Export all types
export * from './api';
export * from './calendar';
export * from './auth';
