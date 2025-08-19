import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface UserPreferences {
  theme?: 'light' | 'dark';
  notifications?: boolean;
  timeFormat?: '12h' | '24h';
  [key: string]: unknown;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  timezone?: string;
  preferences?: UserPreferences;
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
    setIsLoading(false);
  }, [verifyToken]);

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

      // Store token and user data
      localStorage.setItem('neurocal_token', data.token);
      localStorage.setItem('neurocal_user', JSON.stringify(data.user));
      
      setToken(data.token);
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
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
