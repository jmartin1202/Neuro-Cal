// API-specific types
export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  requiresAuth: boolean;
  rateLimit?: number;
}

export interface ApiRequest<T = any> {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: T;
  params?: Record<string, string>;
  timeout?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
  statusCode: number;
  headers: Record<string, string>;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  requestId?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

export interface WebhookPayload<T = any> {
  id: string;
  event: string;
  data: T;
  timestamp: Date;
  signature?: string;
}

// Stripe specific types
export interface StripeEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
  created: number;
  livemode: boolean;
}

export interface StripeSubscription {
  id: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  customer: string;
  plan: {
    id: string;
    nickname: string;
    amount: number;
    currency: string;
    interval: string;
  };
}

// Supabase specific types
export interface SupabaseResponse<T = any> {
  data: T | null;
  error: any;
  count?: number;
  status?: number;
  statusText?: string;
}

export interface SupabaseAuthResponse {
  user: any;
  session: any;
  error?: any;
}
