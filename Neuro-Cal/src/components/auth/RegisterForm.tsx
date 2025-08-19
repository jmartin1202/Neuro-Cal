import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/toast-notification';
import { PasswordStrength, getPasswordStrengthScore } from '@/components/ui/password-strength';
import '../../styles/auth.css';

export const RegisterForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  // Field-specific errors
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  
  const { register, error, clearError } = useAuth();
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
    
    if (value) {
      const strength = getPasswordStrengthScore(value);
      if (strength < 3) {
        setPasswordError('Password is too weak. Use a mix of uppercase, lowercase, numbers, and symbols.');
      } else {
        setPasswordError('');
      }
    } else {
      setPasswordError('');
    }
    
    // Re-validate confirm password if it exists
    if (confirmPassword && value !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
    } else if (confirmPassword) {
      setConfirmPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    
    if (value && password !== value) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFirstName(value);
    
    if (value && value.trim().length < 2) {
      setFirstNameError('First name must be at least 2 characters');
    } else {
      setFirstNameError('');
    }
  };

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLastName(value);
    
    if (value && value.trim().length < 2) {
      setLastNameError('Last name must be at least 2 characters');
    } else {
      setLastNameError('');
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;
    
    // Clear previous errors
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setFirstNameError('');
    setLastNameError('');
    
    if (!firstName.trim() || firstName.trim().length < 2) {
      setFirstNameError('First name must be at least 2 characters');
      isValid = false;
    }
    
    if (!lastName.trim() || lastName.trim().length < 2) {
      setLastNameError('Last name must be at least 2 characters');
      isValid = false;
    }
    
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }
    
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (getPasswordStrengthScore(password) < 3) {
      setPasswordError('Password is too weak');
      isValid = false;
    }
    
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    }
    
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError('Please fix the errors above');
      return;
    }
    
    if (!agreeTerms) {
      showError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    setIsSubmitting(true);
    clearError();
    
    try {
      await register(email.trim(), password, firstName.trim(), lastName.trim());
      showSuccess('Account created successfully! Please check your email to verify your account.');
      
      // Clear form
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFirstName('');
      setLastName('');
      setAgreeTerms(false);
    } catch (error) {
      console.error('Registration error:', error);
      showError(error instanceof Error ? error.message : 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="neurocal-auth-container">
      <div className="neurocal-auth-header">
        <div className="neurocal-logo">NeuroCal</div>
        <h1 className="neurocal-auth-title">Create your account</h1>
        <p className="neurocal-auth-subtitle">Start your journey with NeuroCal today</p>
      </div>

      {error && (
        <div className="neurocal-input-error" style={{ marginBottom: '24px', textAlign: 'center' }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="neurocal-name-grid">
          <div className="neurocal-form-group">
            <label className="neurocal-form-label" htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              className={`neurocal-form-input ${firstNameError ? 'error' : ''}`}
              placeholder="Enter your first name"
              value={firstName}
              onChange={handleFirstNameChange}
              required
            />
            {firstNameError && (
              <div className="neurocal-input-error">{firstNameError}</div>
            )}
          </div>
          
          <div className="neurocal-form-group">
            <label className="neurocal-form-label" htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              className={`neurocal-form-input ${lastNameError ? 'error' : ''}`}
              placeholder="Enter your last name"
              value={lastName}
              onChange={handleLastNameChange}
              required
            />
            {lastNameError && (
              <div className="neurocal-input-error">{lastNameError}</div>
            )}
          </div>
        </div>
        
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
            placeholder="Create a strong password"
            value={password}
            onChange={handlePasswordChange}
            required
          />
          <PasswordStrength password={password} />
          {passwordError && (
            <div className="neurocal-input-error">{passwordError}</div>
          )}
        </div>
        
        <div className="neurocal-form-group">
          <label className="neurocal-form-label" htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            className={`neurocal-form-input ${confirmPasswordError ? 'error' : (!confirmPasswordError && confirmPassword && password === confirmPassword) ? 'success' : ''}`}
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            required
          />
          {confirmPasswordError && (
            <div className="neurocal-input-error">{confirmPasswordError}</div>
          )}
          {!confirmPasswordError && confirmPassword && password === confirmPassword && (
            <div className="neurocal-input-success">Passwords match ✓</div>
          )}
        </div>
        
        <div className="neurocal-terms-checkbox">
          <input
            type="checkbox"
            id="agreeTerms"
            className="neurocal-checkbox-input"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            required
          />
          <label htmlFor="agreeTerms" className="neurocal-terms-text">
            I agree to NeuroCal's <a href="#" className="neurocal-auth-link">Terms of Service</a> and <a href="#" className="neurocal-auth-link">Privacy Policy</a>
          </label>
        </div>
        
        <button 
          type="submit" 
          className={`neurocal-auth-button ${isSubmitting ? 'loading' : ''}`}
          disabled={isSubmitting}
        >
          <span className="neurocal-button-text">
            {isSubmitting ? 'Creating account...' : 'Create Account & Start Free Trial'}
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
