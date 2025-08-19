import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/toast-notification';
import '../../styles/auth.css';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const { login, error, clearError } = useAuth();
  const { showSuccess, showError } = useToast();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    if (value && !validateEmail(value)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    
    if (value && value.length < 6) {
      setPasswordError('Password must be at least 6 characters');
    } else {
      setPasswordError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setEmailError('');
    setPasswordError('');
    clearError();
    
    // Validate form
    if (!email || !password) {
      showError('Please fill in all fields');
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await login(email.trim(), password);
      showSuccess('Login successful! Redirecting...');
    } catch (error) {
      console.error('Login error:', error);
      showError(error instanceof Error ? error.message : 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="neurocal-auth-container">
      <div className="neurocal-auth-header">
        <div className="neurocal-logo">NeuroCal</div>
        <h1 className="neurocal-auth-title">Welcome back</h1>
        <p className="neurocal-auth-subtitle">Sign in to your NeuroCal account</p>
      </div>

      {error && (
        <div className="neurocal-input-error" style={{ marginBottom: '24px', textAlign: 'center' }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="neurocal-form-group">
          <label className="neurocal-form-label" htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            className={`neurocal-form-input ${emailError ? 'error' : ''}`}
            placeholder="Enter your email address"
            value={email}
            onChange={handleEmailChange}
            required
          />
          {emailError && (
            <div className="neurocal-input-error">{emailError}</div>
          )}
        </div>
        
        <div className="neurocal-form-group">
          <label className="neurocal-form-label" htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            className={`neurocal-form-input ${passwordError ? 'error' : ''}`}
            placeholder="Enter your password"
            value={password}
            onChange={handlePasswordChange}
            required
          />
          {passwordError && (
            <div className="neurocal-input-error">{passwordError}</div>
          )}
        </div>
        
        <button 
          type="submit" 
          className={`neurocal-auth-button ${isSubmitting ? 'loading' : ''}`}
          disabled={isSubmitting}
        >
          <span className="neurocal-button-text">
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </span>
          {isSubmitting && (
            <div className="neurocal-button-spinner">
              <div className="neurocal-spinner"></div>
            </div>
          )}
        </button>
      </form>
    </div>
  );
};
