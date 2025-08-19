import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface UserPreferences {
  theme?: 'light' | 'dark';
  notifications?: boolean;
  timeFormat?: '12h' | '24h';
  [key: string]: unknown;
}

interface AuthProvider {
  provider: string;
  provider_email: string;
  is_primary: boolean;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  timezone?: string;
  preferences?: UserPreferences;
  emailVerified: boolean;
  providers?: AuthProvider[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  checkOAuthCallback: () => void;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const verifyToken = useCallback(async (tokenToVerify: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${tokenToVerify}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Token verification failed');
      }

      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
    }
  }, []);

  const checkOAuthCallback = useCallback(() => {
    // Check if we're returning from an OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const oauthToken = urlParams.get('token');
    const oauthError = urlParams.get('error');

    if (oauthToken) {
      // Store the token and verify it
      localStorage.setItem('neurocal_token', oauthToken);
      setToken(oauthToken);
      verifyToken(oauthToken);
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (oauthError) {
      setError(`OAuth authentication failed: ${oauthError}`);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [verifyToken]);

  const refreshUserProfile = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('neurocal_user', JSON.stringify(data.user));
      }
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
    }
  }, [token]);

  // Check for existing token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('neurocal_token');
    const storedUser = localStorage.getItem('neurocal_user');
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Verify token is still valid
        verifyToken(storedToken);
      } catch (error) {
        console.error('Failed to restore auth state:', error);
        localStorage.removeItem('neurocal_token');
        localStorage.removeItem('neurocal_user');
      }
    }
    
    // Check for OAuth callback
    checkOAuthCallback();
    
    setIsLoading(false);
  }, [verifyToken, checkOAuthCallback]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store token and user data
      localStorage.setItem('neurocal_token', data.token);
      localStorage.setItem('neurocal_user', JSON.stringify(data.user));
      
      setToken(data.token);
      setUser(data.user);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // For registration, we don't automatically log in - user needs to verify email
      // But we can store the user data for display purposes
      setUser(data.user);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('neurocal_token');
    localStorage.removeItem('neurocal_user');
    setToken(null);
    setUser(null);
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
    error,
    clearError,
    checkOAuthCallback,
    refreshUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
