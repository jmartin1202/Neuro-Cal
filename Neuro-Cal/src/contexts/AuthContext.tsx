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

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Define verifyToken function BEFORE using it in useEffect
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
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check for existing token on mount
  useEffect(() => {
    const existingToken = localStorage.getItem('neurocal_token');
    if (existingToken) {
      setToken(existingToken);
      verifyToken(existingToken);
    } else {
      setIsLoading(false);
    }
  }, [verifyToken]);

  const logout = () => {
    localStorage.removeItem('neurocal_token');
    setToken(null);
    setUser(null);
    setError(null);
    // Don't redirect, just clear the state
    // window.location.href = '/auth';
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
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
      setToken(data.token);
      setUser(data.user);
      
      // Redirect to dashboard or main page
      window.location.href = '/';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      throw error;
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      setError(null);
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
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

      // Show success message and switch to login
      setError(null);
      // You could show a success message here
      console.log('Registration successful:', data.message);
      
      // Optionally redirect to login or show success message
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setError(errorMessage);
      throw error;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const refreshUserProfile = async () => {
    if (!token) return;
    
    try {
      await verifyToken(token);
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
      logout();
    }
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
    refreshUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
