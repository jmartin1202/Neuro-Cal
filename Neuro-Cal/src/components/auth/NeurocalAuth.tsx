import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface AuthFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface LoginFormData {
  email: string;
  password: string;
}

const NeurocalAuth: React.FC = () => {
  const [currentView, setCurrentView] = useState<'signup' | 'login' | 'verification'>('signup');
  const [formData, setFormData] = useState<AuthFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loginData, setLoginData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '', color: '' });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  const { login, register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    // Check for email verification token in URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const verified = urlParams.get('verified');
    
    if (token) {
      verifyEmailToken(token);
    } else if (verified === 'true') {
      toast({
        title: "Success",
        description: "Email verified successfully! You can now sign in.",
        variant: "default",
      });
      setCurrentView('login');
    }
  }, []);

  const verifyEmailToken = async (token: string) => {
    try {
      // This would call your backend API
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Email verified successfully! You can now sign in.",
          variant: "default",
        });
        setCurrentView('login');
      } else {
        toast({
          title: "Error",
          description: "Email verification failed. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Verification failed. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSignupForm()) return;

    setIsLoading(true);
    try {
      // Split fullName into firstName and lastName
      const nameParts = formData.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      await register(formData.email, formData.password, firstName, lastName);
      
      setVerificationEmail(formData.email);
      setCurrentView('verification');
      toast({
        title: "Success",
        description: "Account created! Please check your email.",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Signup failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    try {
      await login(loginData.email, loginData.password);
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Login failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateSignupForm = (): boolean => {
    if (formData.fullName.trim().length < 2) {
      toast({
        title: "Error",
        description: "Name must be at least 2 characters",
        variant: "destructive",
      });
      return false;
    }

    if (!isValidEmail(formData.email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return false;
    }

    if (passwordStrength.score < 3) {
      toast({
        title: "Error",
        description: "Password is too weak",
        variant: "destructive",
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return false;
    }

    if (!agreeTerms) {
      toast({
        title: "Error",
        description: "Please agree to the Terms of Service",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const checkPasswordStrength = (password: string) => {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;
    
    const strengthLevels = [
      { text: 'Very Weak', color: '#FF4D4F' },
      { text: 'Weak', color: '#FF7A00' },
      { text: 'Fair', color: '#FAAD14' },
      { text: 'Good', color: '#52C41A' },
      { text: 'Strong', color: '#389E0D' }
    ];
    
    setPasswordStrength({
      score,
      ...strengthLevels[score]
    });
  };

  const handlePasswordChange = (password: string) => {
    setFormData(prev => ({ ...prev, password }));
    checkPasswordStrength(password);
  };

  const handleSocialAuth = (provider: 'google' | 'microsoft') => {
    // Implement social authentication
    toast({
      title: "Coming Soon",
      description: `${provider} authentication will be available soon!`,
      variant: "default",
    });
  };

  const resendVerification = () => {
    toast({
      title: "Info",
      description: "Verification email resent!",
      variant: "default",
    });
  };

  if (currentView === 'verification') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-12 w-full max-w-md relative">
          <button
            onClick={() => setCurrentView('signup')}
            className="absolute top-6 left-6 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Check your email</h2>
            <p className="text-gray-600 mb-6">
              We've sent a verification link to <strong>{verificationEmail}</strong>. 
              Please check your inbox and click the link to verify your account.
            </p>
            <p className="text-sm text-gray-500">
              Didn't receive the email?{' '}
              <button
                onClick={resendVerification}
                className="text-orange-500 hover:underline font-medium"
              >
                Resend verification email
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-12 w-full max-w-md relative">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        {/* Header */}
        <div className="text-center mb-8 mt-6">
          <div className="text-3xl font-bold text-orange-500 mb-2">NeuroCal</div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            {currentView === 'signup' ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-gray-600">
            {currentView === 'signup' 
              ? 'Start your 7-day free trial today' 
              : 'Sign in to your account'
            }
          </p>
        </div>

        {/* Social Authentication */}
        <div className="mb-8">
          <button
            onClick={() => handleSocialAuth('google')}
            className="w-full p-3 border-2 border-gray-200 rounded-lg bg-white text-gray-700 font-medium hover:border-orange-500 hover:bg-gray-50 transition-all mb-3 flex items-center justify-center gap-3"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
          
          <button
            onClick={() => handleSocialAuth('microsoft')}
            className="w-full p-3 border-2 border-gray-200 rounded-lg bg-white text-gray-700 font-medium hover:border-orange-500 hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#F25022" d="M11.4 11.4H0V0h11.4v11.4z"/>
              <path fill="#00A4EF" d="M24 11.4H12.6V0H24v11.4z"/>
              <path fill="#7FBA00" d="M11.4 24H0V12.6h11.4V24z"/>
              <path fill="#FFB900" d="M24 24H12.6V12.6H24V24z"/>
            </svg>
            Continue with Microsoft
          </button>
        </div>

        {/* Divider */}
        <div className="relative text-center mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative bg-white px-4 text-gray-500 text-sm">or</div>
        </div>

        {/* Forms */}
        {currentView === 'signup' ? (
          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <Label htmlFor="fullName" className="text-sm font-medium text-gray-700 mb-2 block">
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                required
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 mb-2 block">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  required
                  className="w-full p-3 pr-12 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-300 rounded-full"
                      style={{ 
                        width: `${(passwordStrength.score / 4) * 100}%`,
                        backgroundColor: passwordStrength.color 
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{passwordStrength.text}</p>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 mb-2 block">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  className="w-full p-3 pr-12 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="agreeTerms"
                checked={agreeTerms}
                onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                className="mt-1"
              />
              <Label htmlFor="agreeTerms" className="text-sm text-gray-600 leading-relaxed">
                I agree to NeuroCal's{' '}
                <a href="#" className="text-orange-500 hover:underline font-medium">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-orange-500 hover:underline font-medium">Privacy Policy</a>
              </Label>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Create Account & Start Trial'
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="loginEmail" className="text-sm font-medium text-gray-700 mb-2 block">
                Email Address
              </Label>
              <Input
                id="loginEmail"
                type="email"
                placeholder="Enter your email address"
                value={loginData.email}
                onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                required
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
              />
            </div>

            <div>
              <Label htmlFor="loginPassword" className="text-sm font-medium text-gray-700 mb-2 block">
                Password
              </Label>
              <Input
                id="loginPassword"
                type="password"
                placeholder="Enter your password"
                value={loginData.password}
                onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                required
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
              />
            </div>

            <div className="text-right">
              <button
                type="button"
                className="text-orange-500 hover:underline text-sm font-medium"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600">
          {currentView === 'signup' ? (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setCurrentView('login')}
                className="text-orange-500 hover:underline font-medium"
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => setCurrentView('signup')}
                className="text-orange-500 hover:underline font-medium"
              >
                Create account
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NeurocalAuth;
