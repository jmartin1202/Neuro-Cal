import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  
  const { login, error, clearError } = useAuth();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  // Debug logging
  useEffect(() => {
    console.log('LoginForm component rendered with OAuth buttons');
    console.log('API_BASE_URL:', API_BASE_URL);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      clearError();
      await login(email.trim(), password);
    } catch (error) {
      // Error is handled by the auth context
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuthSignIn = async (provider: string) => {
    console.log(`OAuth sign in clicked for ${provider}`);
    try {
      setIsOAuthLoading(true);
      const redirectUrl = `${API_BASE_URL}/auth/${provider}?redirect=${encodeURIComponent(window.location.origin + '/dashboard')}`;
      console.log('Redirecting to:', redirectUrl);
      window.location.href = redirectUrl;
    } catch (error) {
      console.error(`OAuth sign in error for ${provider}:`, error);
    } finally {
      setIsOAuthLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) clearError();
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) clearError();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Welcome Back
        </CardTitle>
        <CardDescription className="text-center">
          Sign in to your NeuroCal account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* OAuth Buttons */}
        <div className="space-y-3 border-2 border-red-500 p-4 bg-yellow-100">
          <p className="text-center text-sm text-gray-600 mb-2">OAuth Buttons (Debug Mode)</p>
          <Button
            onClick={() => handleOAuthSignIn('google')}
            variant="outline"
            className="w-full h-12 bg-white hover:bg-gray-50 border-gray-300"
            disabled={isOAuthLoading || isSubmitting}
          >
            <img src="/icons/google.svg" alt="Google" className="w-5 h-5 mr-3" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'inline'; }} />
            <span style={{display: 'none'}}>🔍</span>
            Continue with Google
          </Button>
          
          <Button
            onClick={() => handleOAuthSignIn('microsoft')}
            variant="outline"
            className="w-full h-12 bg-white hover:bg-gray-50 border-gray-300"
            disabled={isOAuthLoading || isSubmitting}
          >
            <img src="/icons/microsoft.svg" alt="Microsoft" className="w-5 h-5 mr-3" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'inline'; }} />
            <span style={{display: 'none'}}>🔍</span>
            Continue with Microsoft
          </Button>
          
          <Button
            onClick={() => handleOAuthSignIn('apple')}
            variant="outline"
            className="w-full h-12 bg-white hover:bg-gray-50 border-gray-300"
            disabled={isOAuthLoading || isSubmitting}
          >
            <img src="/icons/apple.svg" alt="Apple" className="w-5 h-5 mr-3" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'inline'; }} />
            <span style={{display: 'none'}}>🔍</span>
            Continue with Apple
          </Button>
          
          <Button
            onClick={() => handleOAuthSignIn('yahoo')}
            variant="outline"
            className="w-full h-12 bg-white hover:bg-gray-50 border-gray-300"
            disabled={isOAuthLoading || isSubmitting}
          >
            <img src="/icons/yahoo.svg" alt="Yahoo" className="w-5 h-5 mr-3" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'inline'; }} />
            <span style={{display: 'none'}}>🔍</span>
            Continue with Yahoo
          </Button>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or</span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={handleEmailChange}
                className="pl-10"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={handlePasswordChange}
                className="pl-10 pr-10"
                required
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                disabled={isSubmitting}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || !email.trim() || !password.trim()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-primary hover:underline font-medium"
              disabled={isSubmitting}
            >
              Sign up
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
