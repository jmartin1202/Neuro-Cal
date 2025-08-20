// Authentication-specific types
export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  avatar?: string;
  createdAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
  role: UserRole;
  permissions: Permission[];
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  level: number;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
  conditions?: Record<string, any>;
}

export interface AuthSession {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
  lastActivityAt: Date;
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  twoFactorCode?: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  name?: string;
  acceptTerms: boolean;
  marketingEmails?: boolean;
}

export interface PasswordReset {
  email: string;
  token?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export interface TwoFactorAuth {
  enabled: boolean;
  method: 'totp' | 'sms' | 'email';
  secret?: string;
  backupCodes: string[];
  lastUsed?: Date;
}

export interface OAuthProvider {
  id: string;
  name: string;
  displayName: string;
  icon: string;
  color: string;
  enabled: boolean;
  clientId: string;
  scopes: string[];
}

export interface OAuthProfile {
  provider: string;
  providerId: string;
  email: string;
  name?: string;
  avatar?: string;
  profile: Record<string, any>;
}

export interface AuthState {
  user: AuthUser | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  twoFactorRequired: boolean;
  oauthState: OAuthState;
}

export interface OAuthState {
  isAuthenticating: boolean;
  provider: string | null;
  error: string | null;
  redirectUrl?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  resetPassword: (reset: PasswordReset) => Promise<void>;
  updateProfile: (updates: Partial<AuthUser>) => Promise<void>;
  enableTwoFactor: (method: TwoFactorAuth['method']) => Promise<void>;
  verifyTwoFactor: (code: string) => Promise<void>;
  oauthLogin: (provider: string) => Promise<void>;
  clearError: () => void;
}

export interface AuthGuard {
  requireAuth: boolean;
  requireRole?: string[];
  requirePermission?: string[];
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export interface AuthHook {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

export interface AuthMiddleware {
  authenticate: (req: any, res: any, next: any) => void;
  authorize: (permissions: string[]) => (req: any, res: any, next: any) => void;
  validateToken: (token: string) => Promise<AuthUser | null>;
  refreshSession: (refreshToken: string) => Promise<AuthSession | null>;
}
