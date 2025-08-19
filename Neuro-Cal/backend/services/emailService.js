import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { pool } from '../server.js';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Generate verification token
  async generateVerificationToken(userId) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store token in database
    await pool.query(
      'INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [userId, token, expiresAt]
    );

    return token;
  }

  // Generate password reset token
  async generatePasswordResetToken(userId) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    // Store token in database
    await pool.query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [userId, token, expiresAt]
    );

    return token;
  }

  // Send email verification
  async sendVerificationEmail(email, userId, firstName = '') {
    try {
      const token = await this.generateVerificationToken(userId);
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

      const mailOptions = {
        from: `"NeuroCal" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: email,
        subject: 'Verify your NeuroCal account',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to NeuroCal!</h1>
              <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Your AI-powered calendar assistant</p>
            </div>
            
            <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-bottom: 20px;">Hi ${firstName || 'there'}!</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
                Thank you for signing up for NeuroCal! To complete your registration and start using our AI-powered calendar features, please verify your email address.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px;">
                  Verify Email Address
                </a>
              </div>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                If the button above doesn't work, you can copy and paste this link into your browser:
              </p>
              
              <p style="color: #667eea; word-break: break-all; margin-bottom: 25px;">
                ${verificationUrl}
              </p>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 0;">
                This verification link will expire in 24 hours. If you didn't create a NeuroCal account, you can safely ignore this email.
              </p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #999; font-size: 14px;">
              <p>© 2024 NeuroCal. All rights reserved.</p>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending verification email:', error);
      return false;
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email, userId, firstName = '') {
    try {
      const token = await this.generatePasswordResetToken(userId);
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

      const mailOptions = {
        from: `"NeuroCal" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: email,
        subject: 'Reset your NeuroCal password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset Request</h1>
              <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">NeuroCal Account Security</p>
            </div>
            
            <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-bottom: 20px;">Hi ${firstName || 'there'}!</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
                We received a request to reset your NeuroCal account password. If you made this request, click the button below to create a new password.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px;">
                  Reset Password
                </a>
              </div>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                If the button above doesn't work, you can copy and paste this link into your browser:
              </p>
              
              <p style="color: #667eea; word-break: break-all; margin-bottom: 25px;">
                ${resetUrl}
              </p>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                <strong>Important:</strong> This password reset link will expire in 1 hour for security reasons.
              </p>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 0;">
                If you didn't request a password reset, you can safely ignore this email. Your current password will remain unchanged.
              </p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #999; font-size: 14px;">
              <p>© 2024 NeuroCal. All rights reserved.</p>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return false;
    }
  }

  // Send welcome email
  async sendWelcomeEmail(email, firstName = '') {
    try {
      const mailOptions = {
        from: `"NeuroCal" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: email,
        subject: 'Welcome to NeuroCal! 🎉',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to NeuroCal! 🎉</h1>
              <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Your AI-powered calendar journey begins now</p>
            </div>
            
            <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-bottom: 20px;">Hi ${firstName || 'there'}!</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
                Welcome to NeuroCal! We're excited to have you on board. You're now part of a community that's revolutionizing how people manage their time and productivity.
              </p>
              
              <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h3 style="color: #333; margin-top: 0;">🚀 What you can do with NeuroCal:</h3>
                <ul style="color: #666; line-height: 1.8;">
                  <li>Connect multiple email providers (Gmail, Outlook, Apple, Yahoo)</li>
                  <li>AI-powered calendar optimization and scheduling</li>
                  <li>Smart event suggestions and conflict resolution</li>
                  <li>Cross-platform calendar synchronization</li>
                  <li>Productivity insights and analytics</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/dashboard" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px;">
                  Go to Dashboard
                </a>
              </div>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 0;">
                If you have any questions or need help getting started, feel free to reach out to our support team. We're here to help you make the most of your time!
              </p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #999; font-size: 14px;">
              <p>© 2024 NeuroCal. All rights reserved.</p>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return false;
    }
  }

  // Verify email verification token
  async verifyEmailToken(token) {
    try {
      const result = await pool.query(
        'SELECT user_id, expires_at FROM email_verification_tokens WHERE token = $1',
        [token]
      );

      if (result.rows.length === 0) {
        return { valid: false, message: 'Invalid verification token' };
      }

      const { user_id, expires_at } = result.rows[0];

      if (new Date() > new Date(expires_at)) {
        return { valid: false, message: 'Verification token has expired' };
      }

      // Mark user as verified
      await pool.query(
        'UPDATE users SET email_verified = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [user_id]
      );

      // Delete used token
      await pool.query(
        'DELETE FROM email_verification_tokens WHERE token = $1',
        [token]
      );

      return { valid: true, userId: user_id };
    } catch (error) {
      console.error('Error verifying email token:', error);
      return { valid: false, message: 'Error verifying token' };
    }
  }

  // Verify password reset token
  async verifyPasswordResetToken(token) {
    try {
      const result = await pool.query(
        'SELECT user_id, expires_at FROM password_reset_tokens WHERE token = $1',
        [token]
      );

      if (result.rows.length === 0) {
        return { valid: false, message: 'Invalid reset token' };
      }

      const { user_id, expires_at } = result.rows[0];

      if (new Date() > new Date(expires_at)) {
        return { valid: false, message: 'Reset token has expired' };
      }

      return { valid: true, userId: user_id };
    } catch (error) {
      console.error('Error verifying password reset token:', error);
      return { valid: false, message: 'Error verifying token' };
    }
  }

  // Clean up expired tokens
  async cleanupExpiredTokens() {
    try {
      await pool.query(
        'DELETE FROM email_verification_tokens WHERE expires_at < NOW()'
      );
      await pool.query(
        'DELETE FROM password_reset_tokens WHERE expires_at < NOW()'
      );
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
    }
  }
}

export default new EmailService();
