import React from 'react';

interface PasswordStrengthProps {
  password: string;
  showStrength?: boolean;
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ 
  password, 
  showStrength = true 
}) => {
  const getPasswordStrength = (password: string) => {
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
    
    return {
      score,
      percentage: (score / 4) * 100,
      ...strengthLevels[score]
    };
  };

  const strength = getPasswordStrength(password);
  
  if (!showStrength || password.length === 0) {
    return null;
  }

  return (
    <div className="neurocal-password-strength">
      <div className="neurocal-strength-bar">
        <div 
          className="neurocal-strength-fill"
          style={{
            width: `${strength.percentage}%`,
            backgroundColor: strength.color
          }}
        />
      </div>
      <div className="neurocal-strength-text" style={{ color: strength.color }}>
        Password strength: {strength.text}
      </div>
    </div>
  );
};

export const getPasswordStrengthScore = (password: string): number => {
  let score = 0;
  
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z\d]/.test(password)) score++;
  
  return score;
};
