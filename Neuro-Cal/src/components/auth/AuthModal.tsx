import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { useToast } from '../../hooks/use-toast';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import ForgotPasswordModal from './ForgotPasswordModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string, user: any) => void;
}

interface EmailCheckResponse {
  exists: boolean;
  hasPassword: boolean;
  emailVerified?: boolean;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [currentMode, setCurrentMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  const { toast } = useToast();

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setCurrentMode('signin');
    setEmailChecked(false);
    setEmailExists(false);
    setHasPassword(false);
    setEmailVerified(false);
    setShowPasswordField(false);
    setShowPassword(false);
    setShowForgotPassword(false);
  };

  const checkEmail = async () => {
    if (!email || !email.includes('@')) return;

    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        const data: EmailCheckResponse = await response.json();
        setEmailExists(data.exists);
        setHasPassword(data.hasPassword);
        setEmailVerified(data.emailVerified || false);
        setEmailChecked(true);
        
        if (data.exists) {
          setCurrentMode('signin');
          setShowPasswordField(true);
        } else {
          setCurrentMode('signup');
          setShowPasswordField(true);
        }
      }
    } catch (error) {
      console.error('Error checking email:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailBlur = () => {
    if (email && email.includes('@')) {
      checkEmail();
    }
  };

  const handleOAuthSignIn = (provider: string) => {
    const redirectUrl = `${API_BASE_URL}/auth/${provider}?redirect=${encodeURIComponent(window.location.origin + '/dashboard')}`;
    window.location.href = redirectUrl;
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (currentMode === 'signup' && (!firstName || !lastName)) {
      toast({
        title: "Error",
        description: "Please fill in your first and last name",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      const endpoint = currentMode === 'signin' ? 'login' : 'register';
      const body = currentMode === 'signin' 
        ? { email, password }
        : { email, password, firstName, lastName };

      const response = await fetch(`${API_BASE_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (response.ok) {
        if (currentMode === 'signup') {
          toast({
            title: "Success!",
            description: "Account created! Please check your email to verify your account.",
          });
          onClose();
        } else {
          onSuccess(data.token, data.user);
          onClose();
        }
      } else {
        toast({
          title: "Error",
          description: data.error || 'Authentication failed',
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setCurrentMode(currentMode === 'signin' ? 'signup' : 'signin');
    setPassword('');
    setFirstName('');
    setLastName('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to NeuroCal
          </CardTitle>
          <CardDescription>
            Choose your preferred way to sign in
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* OAuth Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => handleOAuthSignIn('google')}
              variant="outline"
              className="w-full h-12 bg-white hover:bg-gray-50 border-gray-300"
              disabled={isLoading}
            >
              <img src="/icons/google.svg" alt="Google" className="w-5 h-5 mr-3" />
              Continue with Google
            </Button>
            
            <Button
              onClick={() => handleOAuthSignIn('microsoft')}
              variant="outline"
              className="w-full h-12 bg-white hover:bg-gray-50 border-gray-300"
              disabled={isLoading}
            >
              <img src="/icons/microsoft.svg" alt="Microsoft" className="w-5 h-5 mr-3" />
              Continue with Microsoft
            </Button>
            
            <Button
              onClick={() => handleOAuthSignIn('apple')}
              variant="outline"
              className="w-full h-12 bg-white hover:bg-gray-50 border-gray-300"
              disabled={isLoading}
            >
              <img src="/icons/apple.svg" alt="Apple" className="w-5 h-5 mr-3" />
              Continue with Apple
            </Button>
            
            <Button
              onClick={() => handleOAuthSignIn('yahoo')}
              variant="outline"
              className="w-full h-12 bg-white hover:bg-gray-50 border-gray-300"
              disabled={isLoading}
            >
              <img src="/icons/yahoo.svg" alt="Yahoo" className="w-5 h-5 mr-3" />
              Continue with Yahoo
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={handleEmailBlur}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {showPasswordField && (
              <>
                {currentMode === 'signup' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="First name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {emailExists && !emailVerified && (
                  <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
                    Please verify your email address before signing in.
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {currentMode === 'signin' ? 'Sign In' : 'Create Account'}
                </Button>
              </>
            )}

            {!showPasswordField && email && (
              <Button
                type="button"
                onClick={checkEmail}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Continue with Email
              </Button>
            )}
          </form>

          {/* Toggle Mode */}
          {showPasswordField && (
            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                {currentMode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
              </span>
              <Button
                variant="link"
                className="p-0 h-auto font-normal text-blue-600 hover:text-blue-700"
                onClick={toggleMode}
              >
                {currentMode === 'signin' ? 'Sign up' : 'Sign in'}
              </Button>
            </div>
          )}

          {/* Forgot Password */}
          {currentMode === 'signin' && showPasswordField && (
            <div className="text-center">
              <Button
                variant="link"
                className="text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot your password?
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onBackToLogin={() => setShowForgotPassword(false)}
      />
    </div>
  );
};

export default AuthModal;
