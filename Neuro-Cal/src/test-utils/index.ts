import { User, Event, Contact, Deal, AISuggestion } from '@/types';

/**
 * Testing utilities for Neuro-Cal application
 * Provides mock data, test helpers, and testing configurations
 */

// Mock data generators
export const mockUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  avatar: 'https://example.com/avatar.jpg',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  subscription: {
    id: 'sub-1',
    status: 'active',
    plan: 'pro',
    currentPeriodStart: new Date('2024-01-01T00:00:00Z'),
    currentPeriodEnd: new Date('2024-02-01T00:00:00Z'),
    cancelAtPeriodEnd: false,
    stripeCustomerId: 'cus_test123',
    stripeSubscriptionId: 'sub_test123',
  },
  preferences: {
    theme: 'system',
    timezone: 'UTC',
    notifications: {
      email: true,
      push: true,
      sms: false,
      reminderTime: 15,
    },
    calendar: {
      defaultView: 'week',
      workingHours: {
        start: '09:00',
        end: '17:00',
      },
      weekStartsOn: 1,
    },
  },
  ...overrides,
});

export const mockEvent = (overrides: Partial<Event> = {}): Event => ({
  id: 'event-1',
  title: 'Test Event',
  description: 'This is a test event',
  start: new Date('2024-01-15T10:00:00Z'),
  end: new Date('2024-01-15T11:00:00Z'),
  allDay: false,
  location: 'Test Location',
  attendees: [
    {
      id: 'attendee-1',
      email: 'attendee@example.com',
      name: 'Test Attendee',
      response: 'accepted',
      responseTime: new Date('2024-01-14T00:00:00Z'),
    },
  ],
  recurrence: {
    frequency: 'weekly',
    interval: 1,
    endDate: new Date('2024-03-15T00:00:00Z'),
    byDay: [1], // Monday
  },
  category: {
    id: 'category-1',
    name: 'Meeting',
    color: '#3B82F6',
    icon: 'users',
  },
  priority: 'medium',
  status: 'confirmed',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  userId: 'user-1',
  tags: ['test', 'meeting'],
  metadata: {},
  ...overrides,
});

export const mockContact = (overrides: Partial<Contact> = {}): Contact => ({
  id: 'contact-1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  company: 'Test Company',
  position: 'Manager',
  status: 'prospect',
  source: 'website',
  tags: ['lead', 'tech'],
  notes: 'Interested in our product',
  lastContact: new Date('2024-01-10T00:00:00Z'),
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  userId: 'user-1',
  ...overrides,
});

export const mockDeal = (overrides: Partial<Deal> = {}): Deal => ({
  id: 'deal-1',
  title: 'Test Deal',
  description: 'A test deal for testing purposes',
  amount: 5000,
  currency: 'USD',
  stage: 'proposal',
  probability: 75,
  expectedCloseDate: new Date('2024-02-15T00:00:00Z'),
  contactId: 'contact-1',
  userId: 'user-1',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  ...overrides,
});

export const mockAISuggestion = (overrides: Partial<AISuggestion> = {}): AISuggestion => ({
  id: 'suggestion-1',
  type: 'event',
  title: 'Schedule Follow-up Meeting',
  description: 'Based on your recent interaction, consider scheduling a follow-up meeting',
  confidence: 0.85,
  action: 'create_event',
  metadata: {
    contactId: 'contact-1',
    dealId: 'deal-1',
    suggestedDate: new Date('2024-01-20T14:00:00Z'),
  },
  createdAt: new Date('2024-01-15T00:00:00Z'),
  ...overrides,
});

// Mock API responses
export const mockApiResponse = <T>(data: T, success = true) => ({
  success,
  data: success ? data : undefined,
  error: success ? undefined : 'Test error',
  message: success ? 'Success' : 'Error occurred',
  timestamp: new Date().toISOString(),
  statusCode: success ? 200 : 400,
  headers: {},
});

export const mockPaginatedResponse = <T>(data: T[], page = 1, limit = 20, total = 100) => ({
  data,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  },
});

// Mock functions
export const mockFunction = <T extends (...args: any[]) => any>(
  implementation?: T
): jest.MockedFunction<T> => {
  const mockFn = jest.fn(implementation);
  return mockFn as jest.MockedFunction<T>;
};

export const mockAsyncFunction = <T>(
  returnValue: T,
  delay = 100
): jest.MockedFunction<() => Promise<T>> => {
  return mockFunction(() => new Promise(resolve => setTimeout(() => resolve(returnValue), delay)));
};

// Test data builders
export class TestDataBuilder<T> {
  private data: Partial<T>;

  constructor(initialData: Partial<T> = {}) {
    this.data = { ...initialData };
  }

  with<K extends keyof T>(key: K, value: T[K]): this {
    this.data[key] = value;
    return this;
  }

  build(): T {
    return this.data as T;
  }
}

export const createEventBuilder = () => new TestDataBuilder<Event>();
export const createUserBuilder = () => new TestDataBuilder<User>();
export const createContactBuilder = () => new TestDataBuilder<Contact>();
export const createDealBuilder = () => new TestDataBuilder<Deal>();

// Mock localStorage and sessionStorage
export const mockStorage = {
  localStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  sessionStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
};

export const setupMockStorage = () => {
  Object.defineProperty(window, 'localStorage', {
    value: mockStorage.localStorage,
    writable: true,
  });
  
  Object.defineProperty(window, 'sessionStorage', {
    value: mockStorage.sessionStorage,
    writable: true,
  });
};

// Mock fetch
export const mockFetch = (response: any, status = 200) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
      headers: new Headers(),
    } as Response)
  );
};

// Mock IntersectionObserver
export const mockIntersectionObserver = () => {
  global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));
};

// Mock ResizeObserver
export const mockResizeObserver = () => {
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));
};

// Mock window.matchMedia
export const mockMatchMedia = (matches = false) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

// Test environment setup
export const setupTestEnvironment = () => {
  setupMockStorage();
  mockIntersectionObserver();
  mockResizeObserver();
  mockMatchMedia();
  
  // Reset all mocks
  jest.clearAllMocks();
  
  // Setup console mocks to reduce noise in tests
  const originalConsole = { ...console };
  global.console = {
    ...console,
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
  
  return () => {
    global.console = originalConsole;
  };
};

// Custom matchers
export const customMatchers = {
  toBeValidUUID: (received: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);
    
    if (pass) {
      return {
        message: () => `Expected ${received} not to be a valid UUID`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected ${received} to be a valid UUID`,
        pass: false,
      };
    }
  },
  
  toBeValidDate: (received: Date) => {
    const pass = received instanceof Date && !isNaN(received.getTime());
    
    if (pass) {
      return {
        message: () => `Expected ${received} not to be a valid Date`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected ${received} to be a valid Date`,
        pass: false,
      };
    }
  },
};

// Export everything
export default {
  mockUser,
  mockEvent,
  mockContact,
  mockDeal,
  mockAISuggestion,
  mockApiResponse,
  mockPaginatedResponse,
  mockFunction,
  mockAsyncFunction,
  TestDataBuilder,
  createEventBuilder,
  createUserBuilder,
  createContactBuilder,
  createDealBuilder,
  mockStorage,
  setupMockStorage,
  mockFetch,
  mockIntersectionObserver,
  mockResizeObserver,
  mockMatchMedia,
  setupTestEnvironment,
  customMatchers,
};
