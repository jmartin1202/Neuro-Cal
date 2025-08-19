import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import passport from 'passport';
import { pool } from '../server.js';
import emailService from '../services/emailService.js';

const router = express.Router();

// JWT secret from environment
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Simple auth health check (no database required)
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Authentication API',
    timestamp: new Date().toISOString(),
    features: {
      oauth: {
        google: !!passport._strategies.google,
        microsoft: !!passport._strategies.microsoft,
        apple: !!passport._strategies.apple,
        yahoo: !!passport._strategies.yahoo
      },
      local: !!passport._strategies.local
    }
  });
});

// Middleware to verify JWT token
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pool.query('SELECT id, email, display_name, first_name, last_name, email_verified FROM users WHERE id = $1', [decoded.userId]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Check if email exists (for dynamic form switching)
router.post('/check-email', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Check if user exists
    const userResult = await pool.query('SELECT id, email_verified FROM users WHERE email = $1', [email]);
    
    if (userResult.rows.length === 0) {
      return res.json({ exists: false, hasPassword: false });
    }

    // Check if user has local authentication
    const authProviderResult = await pool.query(
      'SELECT provider FROM user_auth_providers WHERE user_id = $1 AND provider = $2',
      [userResult.rows[0].id, 'local']
    );

    const hasPassword = authProviderResult.rows.length > 0;
    
    res.json({ 
      exists: true, 
      hasPassword,
      emailVerified: userResult.rows[0].email_verified
    });
  } catch (error) {
    console.error('Email check error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// OAuth Routes - Only register if strategies are available
const registerOAuthRoutes = () => {
  // Check if Google strategy is available
  if (passport._strategies.google) {
    router.get('/google', passport.authenticate('google', { 
      scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar'] 
    }));

    router.get('/google/callback', 
      passport.authenticate('google', { failureRedirect: '/login' }),
      async (req, res) => {
        try {
          const token = jwt.sign({ userId: req.user.id }, JWT_SECRET, { expiresIn: '7d' });
          res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}`);
        } catch (error) {
          console.error('Google OAuth callback error:', error);
          res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
        }
      }
    );
    console.log('✅ Google OAuth routes registered');
  } else {
    // Fallback route for when Google strategy is not available
    router.get('/google', (req, res) => {
      res.status(503).json({ 
        error: 'Google OAuth not configured',
        message: 'Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables'
      });
    });
    console.log('⚠️  Google OAuth routes not available - strategy not initialized');
  }

  // Check if Microsoft strategy is available
  if (passport._strategies.microsoft) {
    router.get('/microsoft', passport.authenticate('microsoft', {
      scope: ['User.Read', 'Calendars.ReadWrite']
    }));

    router.get('/microsoft/callback',
      passport.authenticate('microsoft', { failureRedirect: '/login' }),
      async (req, res) => {
        try {
          const token = jwt.sign({ userId: req.user.id }, JWT_SECRET, { expiresIn: '7d' });
          res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}`);
        } catch (error) {
          console.error('Microsoft OAuth callback error:', error);
          res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
        }
      }
    );
    console.log('✅ Microsoft OAuth routes registered');
  } else {
    router.get('/microsoft', (req, res) => {
      res.status(503).json({ 
        error: 'Microsoft OAuth not configured',
        message: 'Please configure MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET environment variables'
      });
    });
    console.log('⚠️  Microsoft OAuth routes not available - strategy not initialized');
  }

  // Check if Apple strategy is available
  if (passport._strategies.apple) {
    router.get('/apple', passport.authenticate('apple'));

    router.get('/apple/callback',
      passport.authenticate('apple', { failureRedirect: '/login' }),
      async (req, res) => {
        try {
          const token = jwt.sign({ userId: req.user.id }, JWT_SECRET, { expiresIn: '7d' });
          res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}`);
        } catch (error) {
          console.error('Apple OAuth callback error:', error);
          res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
        }
      }
    );
    console.log('✅ Apple OAuth routes registered');
  } else {
    router.get('/apple', (req, res) => {
      res.status(503).json({ 
        error: 'Apple OAuth not configured',
        message: 'Please configure APPLE_CLIENT_ID, APPLE_TEAM_ID, and APPLE_KEY_ID environment variables'
      });
    });
    console.log('⚠️  Apple OAuth routes not available - strategy not initialized');
  }

  // Check if Yahoo strategy is available
  if (passport._strategies.yahoo) {
    router.get('/yahoo', passport.authenticate('yahoo'));

    router.get('/yahoo/callback',
      passport.authenticate('yahoo', { failureRedirect: '/login' }),
      async (req, res) => {
        try {
          const token = jwt.sign({ userId: req.user.id }, JWT_SECRET, { expiresIn: '7d' });
          res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}`);
        } catch (error) {
          console.error('Yahoo OAuth callback error:', error);
          res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
        }
      }
    );
    console.log('✅ Yahoo OAuth routes registered');
  } else {
    router.get('/yahoo', (req, res) => {
      res.status(503).json({ 
        error: 'Yahoo OAuth not configured',
        message: 'Please configure YAHOO_CLIENT_ID and YAHOO_CLIENT_SECRET environment variables'
      });
    });
    console.log('⚠️  Yahoo OAuth routes not available - strategy not initialized');
  }
};

// Register OAuth routes
registerOAuthRoutes();

// Email/Password Registration
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().isLength({ min: 1 }),
  body('lastName').trim().isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const userResult = await pool.query(
      'INSERT INTO users (email, first_name, last_name, display_name, email_verified) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, first_name, last_name, display_name',
      [email, firstName, lastName, `${firstName} ${lastName}`, false]
    );

    const user = userResult.rows[0];

    // Create local auth provider record
    await pool.query(
      'INSERT INTO user_auth_providers (user_id, provider, provider_user_id, provider_email, access_token, is_primary) VALUES ($1, $2, $3, $4, $5, $6)',
      [user.id, 'local', user.id, email, passwordHash, true]
    );

    // Send verification email
    await emailService.sendVerificationEmail(email, user.id, firstName);

    res.status(201).json({
      message: 'Account created successfully. Please check your email to verify your account.',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        displayName: user.display_name
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Email/Password Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const userResult = await pool.query(
      'SELECT id, email, first_name, last_name, display_name, email_verified FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // Check if user has local authentication
    const authProviderResult = await pool.query(
      'SELECT access_token FROM user_auth_providers WHERE user_id = $1 AND provider = $2',
      [user.id, 'local']
    );

    if (authProviderResult.rows.length === 0) {
      return res.status(401).json({ error: 'Please sign in with your email provider' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, authProviderResult.rows[0].access_token);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if email is verified
    if (!user.email_verified) {
      return res.status(401).json({ error: 'Please verify your email address before signing in' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        displayName: user.display_name,
        emailVerified: user.email_verified
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Email verification
router.post('/verify-email', [
  body('token').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token } = req.body;
    const result = await emailService.verifyEmailToken(token);

    if (!result.valid) {
      return res.status(400).json({ error: result.message });
    }

    // Get user details
    const userResult = await pool.query(
      'SELECT id, email, first_name, last_name, display_name FROM users WHERE id = $1',
      [result.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Send welcome email
    await emailService.sendWelcomeEmail(user.email, user.first_name);

    res.json({
      message: 'Email verified successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        displayName: user.display_name
      }
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Request password reset
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Check if user exists
    const userResult = await pool.query(
      'SELECT id, first_name FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      // Don't reveal if user exists
      return res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    const user = userResult.rows[0];

    // Check if user has local authentication
    const authProviderResult = await pool.query(
      'SELECT id FROM user_auth_providers WHERE user_id = $1 AND provider = $2',
      [user.id, 'local']
    );

    if (authProviderResult.rows.length === 0) {
      return res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    // Send password reset email
    await emailService.sendPasswordResetEmail(email, user.id, user.first_name);

    res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset password
router.post('/reset-password', [
  body('token').notEmpty(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, password } = req.body;

    // Verify token
    const result = await emailService.verifyPasswordResetToken(token);
    if (!result.valid) {
      return res.status(400).json({ error: result.message });
    }

    // Hash new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Update password
    await pool.query(
      'UPDATE user_auth_providers SET access_token = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND provider = $3',
      [passwordHash, result.userId, 'local']
    );

    // Delete used token
    await pool.query(
      'DELETE FROM password_reset_tokens WHERE user_id = $1',
      [result.userId]
    );

    res.json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, display_name, timezone, preferences, created_at, email_verified FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    // Get connected providers
    const providersResult = await pool.query(
      'SELECT provider, provider_email, is_primary FROM user_auth_providers WHERE user_id = $1',
      [req.user.id]
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        displayName: user.display_name,
        timezone: user.timezone,
        preferences: user.preferences,
        createdAt: user.created_at,
        emailVerified: user.email_verified,
        providers: providersResult.rows
      }
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('firstName').optional().trim().isLength({ min: 1 }),
  body('lastName').optional().trim().isLength({ min: 1 }),
  body('timezone').optional().isLength({ min: 1 }),
  body('preferences').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, timezone, preferences } = req.body;
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (firstName) {
      updateFields.push(`first_name = $${paramCount++}`);
      values.push(firstName);
    }
    if (lastName) {
      updateFields.push(`last_name = $${paramCount++}`);
      values.push(lastName);
    }
    if (timezone) {
      updateFields.push(`timezone = $${paramCount++}`);
      values.push(timezone);
    }
    if (preferences) {
      updateFields.push(`preferences = $${paramCount++}`);
      values.push(JSON.stringify(preferences));
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Update display name if first or last name changed
    if (firstName || lastName) {
      const currentUser = await pool.query(
        'SELECT first_name, last_name FROM users WHERE id = $1',
        [req.user.id]
      );
      
      const newFirstName = firstName || currentUser.rows[0].first_name;
      const newLastName = lastName || currentUser.rows[0].last_name;
      updateFields.push(`display_name = $${paramCount++}`);
      values.push(`${newFirstName} ${newLastName}`);
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(req.user.id);

    const result = await pool.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING id, email, first_name, last_name, display_name, timezone, preferences`,
      values
    );

    const user = result.rows[0];
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        displayName: user.display_name,
        timezone: user.timezone,
        preferences: user.preferences
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change password
router.put('/change-password', authenticateToken, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    // Get current password hash
    const result = await pool.query(
      'SELECT access_token FROM user_auth_providers WHERE user_id = $1 AND provider = $2',
      [req.user.id, 'local']
    );
    
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'No local password set for this account' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, result.rows[0].access_token);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await pool.query(
      'UPDATE user_auth_providers SET access_token = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND provider = $3',
      [newPasswordHash, req.user.id, 'local']
    );

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Disconnect provider
router.delete('/disconnect-provider/:provider', authenticateToken, async (req, res) => {
  try {
    const { provider } = req.params;

    // Check if this is the primary provider
    const providerResult = await pool.query(
      'SELECT is_primary FROM user_auth_providers WHERE user_id = $1 AND provider = $2',
      [req.user.id, provider]
    );

    if (providerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    if (providerResult.rows[0].is_primary) {
      return res.status(400).json({ error: 'Cannot disconnect primary authentication provider' });
    }

    // Delete provider connection
    await pool.query(
      'DELETE FROM user_auth_providers WHERE user_id = $1 AND provider = $2',
      [req.user.id, provider]
    );

    res.json({ message: 'Provider disconnected successfully' });

  } catch (error) {
    console.error('Disconnect provider error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Resend verification email
router.post('/resend-verification', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Check if user exists and needs verification
    const userResult = await pool.query(
      'SELECT id, first_name, email_verified FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    if (user.email_verified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    // Send verification email
    await emailService.sendVerificationEmail(email, user.id, user.first_name);

    res.json({ message: 'Verification email sent successfully' });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
