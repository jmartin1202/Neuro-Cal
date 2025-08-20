import { z } from 'zod';

// Base schemas
export const BaseSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// User schemas
export const UserSchema = BaseSchema.extend({
  email: z.string().email(),
  name: z.string().optional(),
  avatar: z.string().url().optional(),
  subscription: z.object({
    id: z.string().uuid(),
    status: z.enum(['active', 'canceled', 'past_due', 'trialing', 'incomplete']),
    plan: z.enum(['free', 'basic', 'pro', 'enterprise']),
    currentPeriodStart: z.string().datetime(),
    currentPeriodEnd: z.string().datetime(),
    cancelAtPeriodEnd: z.boolean(),
    stripeCustomerId: z.string().optional(),
    stripeSubscriptionId: z.string().optional(),
  }),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'system']),
    timezone: z.string(),
    notifications: z.object({
      email: z.boolean(),
      push: z.boolean(),
      sms: z.boolean(),
      reminderTime: z.number().min(0).max(1440), // 0-24 hours in minutes
    }),
    calendar: z.object({
      defaultView: z.enum(['day', 'week', 'month']),
      workingHours: z.object({
        start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      }),
      weekStartsOn: z.enum(['0', '1']).transform(val => parseInt(val)),
    }),
  }),
});

// Event schemas
export const EventSchema = BaseSchema.extend({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  start: z.string().datetime(),
  end: z.string().datetime(),
  allDay: z.boolean(),
  location: z.string().max(200).optional(),
  attendees: z.array(z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    name: z.string().optional(),
    response: z.enum(['pending', 'accepted', 'declined', 'tentative']),
    responseTime: z.string().datetime().optional(),
  })),
  recurrence: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
    interval: z.number().min(1).max(365),
    endDate: z.string().datetime().optional(),
    occurrences: z.number().min(1).max(999).optional(),
    byDay: z.array(z.number().min(0).max(6)).optional(),
    byMonthDay: z.array(z.number().min(1).max(31)).optional(),
    byMonth: z.array(z.number().min(1).max(12)).optional(),
    byYearDay: z.array(z.number().min(1).max(366)).optional(),
    weekStart: z.number().min(0).max(6).optional(),
  }).optional(),
  category: z.object({
    id: z.string().uuid(),
    name: z.string(),
    color: z.string().regex(/^#[0-9A-F]{6}$/i),
    icon: z.string().optional(),
  }),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['scheduled', 'confirmed', 'cancelled', 'completed']),
  userId: z.string().uuid(),
  tags: z.array(z.string()),
  metadata: z.record(z.any()),
});

// CRM schemas
export const ContactSchema = BaseSchema.extend({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().max(200).optional(),
  position: z.string().max(200).optional(),
  status: z.enum(['lead', 'prospect', 'customer', 'inactive']),
  source: z.string(),
  tags: z.array(z.string()),
  notes: z.string().max(2000).optional(),
  lastContact: z.string().datetime().optional(),
  userId: z.string().uuid(),
});

export const DealSchema = BaseSchema.extend({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  amount: z.number().positive(),
  currency: z.string().length(3),
  stage: z.enum(['lead', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost']),
  probability: z.number().min(0).max(100),
  expectedCloseDate: z.string().datetime(),
  contactId: z.string().uuid(),
  userId: z.string().uuid(),
});

// API response schemas
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    message: z.string().optional(),
    timestamp: z.string().datetime(),
    statusCode: z.number(),
    headers: z.record(z.string()),
  });

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: z.array(dataSchema),
    pagination: z.object({
      page: z.number().min(1),
      limit: z.number().min(1).max(100),
      total: z.number().min(0),
      totalPages: z.number().min(1),
    }),
  });

// Form schemas
export const LoginFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
  twoFactorCode: z.string().length(6).optional(),
});

export const RegisterFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string(),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
  marketingEmails: z.boolean().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const EventFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  start: z.date({
    required_error: "Please select a start date and time",
  }),
  end: z.date({
    required_error: "Please select an end date and time",
  }),
  allDay: z.boolean().optional(),
  location: z.string().max(200, 'Location must be less than 200 characters').optional(),
  category: z.string().uuid('Please select a valid category'),
  priority: z.enum(['low', 'medium', 'high']),
  attendees: z.array(z.string().email()).optional(),
  tags: z.array(z.string()).optional(),
}).refine((data) => data.end > data.start, {
  message: "End time must be after start time",
  path: ["end"],
});

// Search and filter schemas
export const SearchParamsSchema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  filters: z.record(z.any()).optional(),
});

// Export all schemas
export const Schemas = {
  User: UserSchema,
  Event: EventSchema,
  Contact: ContactSchema,
  Deal: DealSchema,
  LoginForm: LoginFormSchema,
  RegisterForm: RegisterFormSchema,
  EventForm: EventFormSchema,
  SearchParams: SearchParamsSchema,
  ApiResponse: ApiResponseSchema,
  PaginatedResponse: PaginatedResponseSchema,
} as const;

// Type exports
export type User = z.infer<typeof UserSchema>;
export type Event = z.infer<typeof EventSchema>;
export type Contact = z.infer<typeof ContactSchema>;
export type Deal = z.infer<typeof DealSchema>;
export type LoginForm = z.infer<typeof LoginFormSchema>;
export type RegisterForm = z.infer<typeof RegisterFormSchema>;
export type EventForm = z.infer<typeof EventFormSchema>;
export type SearchParams = z.infer<typeof SearchParamsSchema>;

export default Schemas;
