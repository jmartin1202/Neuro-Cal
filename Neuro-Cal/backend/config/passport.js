import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import MicrosoftStrategy from 'passport-microsoft';
import AppleStrategy from 'passport-apple';
import YahooStrategy from 'passport-yahoo';
import LocalStrategy from 'passport-local';
import bcrypt from 'bcryptjs';
import { pool } from '../server.js';

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy - only initialize if environment variables are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback',
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with this Google account
      let authProvider = await pool.query(
        'SELECT * FROM user_auth_providers WHERE provider = $1 AND provider_user_id = $2',
        ['google', profile.id]
      );

      if (authProvider.rows.length > 0) {
        // User exists, update tokens
        await pool.query(
          'UPDATE user_auth_providers SET access_token = $1, refresh_token = $2, token_expires_at = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4',
          [accessToken, refreshToken, new Date(Date.now() + 3600000), authProvider.rows[0].id]
        );

        // Get user details
        const user = await pool.query('SELECT * FROM users WHERE id = $1', [authProvider.rows[0].user_id]);
        return done(null, user.rows[0]);
      }

      // Check if user exists with the same email
      const existingUser = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [profile.emails[0].value]
      );

      let userId;
      if (existingUser.rows.length > 0) {
        // Link existing account to Google
        userId = existingUser.rows[0].id;
        
        // Update user verification status
        await pool.query(
          'UPDATE users SET email_verified = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
          [userId]
        );
      } else {
        // Create new user
        const newUser = await pool.query(
          'INSERT INTO users (email, display_name, avatar_url, email_verified, first_name, last_name) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
          [
            profile.emails[0].value,
            profile.displayName,
            profile.photos[0]?.value,
            true,
            profile.name?.givenName || '',
            profile.name?.familyName || ''
          ]
        );
        userId = newUser.rows[0].id;
      }

      // Create auth provider record
      await pool.query(
        'INSERT INTO user_auth_providers (user_id, provider, provider_user_id, access_token, refresh_token, token_expires_at, provider_email, is_primary) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [
          userId,
          'google',
          profile.id,
          accessToken,
          refreshToken,
          new Date(Date.now() + 3600000),
          profile.emails[0].value,
          true
        ]
      );

      // Get final user object
      const user = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
      return done(null, user.rows[0]);
    } catch (error) {
      return done(error, null);
    }
  }));
  console.log('✅ Google OAuth strategy initialized');
} else {
  console.log('⚠️  Google OAuth strategy skipped - missing environment variables');
}

// Microsoft OAuth Strategy - only initialize if environment variables are available
if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
  passport.use(new MicrosoftStrategy({
    clientID: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    callbackURL: '/api/auth/microsoft/callback',
    scope: ['User.Read', 'Calendars.ReadWrite']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with this Microsoft account
      let authProvider = await pool.query(
        'SELECT * FROM user_auth_providers WHERE provider = $1 AND provider_user_id = $2',
        ['microsoft', profile.id]
      );

      if (authProvider.rows.length > 0) {
        // User exists, update tokens
        await pool.query(
          'UPDATE user_auth_providers SET access_token = $1, refresh_token = $2, token_expires_at = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4',
          [accessToken, refreshToken, new Date(Date.now() + 3600000), authProvider.rows[0].id]
        );

        const user = await pool.query('SELECT * FROM users WHERE id = $1', [authProvider.rows[0].user_id]);
        return done(null, user.rows[0]);
      }

      // Check if user exists with the same email
      const existingUser = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [profile.emails[0].value]
      );

      let userId;
      if (existingUser.rows.length > 0) {
        userId = existingUser.rows[0].id;
        await pool.query(
          'UPDATE users SET email_verified = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
          [userId]
        );
      } else {
        const newUser = await pool.query(
          'INSERT INTO users (email, display_name, avatar_url, email_verified, first_name, last_name) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
          [
            profile.emails[0].value,
            profile.displayName,
            profile.photos[0]?.value,
            true,
            profile.name?.givenName || '',
            profile.name?.familyName || ''
          ]
        );
        userId = newUser.rows[0].id;
      }

      // Create auth provider record
      await pool.query(
        'INSERT INTO user_auth_providers (user_id, provider, provider_user_id, access_token, refresh_token, token_expires_at, provider_email, is_primary) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [
          userId,
          'microsoft',
          profile.id,
          accessToken,
          refreshToken,
          new Date(Date.now() + 3600000),
          profile.emails[0].value,
          true
        ]
      );

      const user = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
      return done(null, user.rows[0]);
    } catch (error) {
      return done(error, null);
    }
  }));
  console.log('✅ Microsoft OAuth strategy initialized');
} else {
  console.log('⚠️  Microsoft OAuth strategy skipped - missing environment variables');
}

// Apple OAuth Strategy - only initialize if environment variables are available
if (process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID && process.env.APPLE_KEY_ID && process.env.APPLE_PRIVATE_KEY_PATH) {
  passport.use(new AppleStrategy({
    clientID: process.env.APPLE_CLIENT_ID,
    teamID: process.env.APPLE_TEAM_ID,
    keyID: process.env.APPLE_KEY_ID,
    privateKeyLocation: process.env.APPLE_PRIVATE_KEY_PATH,
    callbackURL: '/api/auth/apple/callback',
    passReqToCallback: true
  }, async (req, accessToken, refreshToken, idToken, profile, done) => {
    try {
      // Apple profile structure is different
      const email = profile.email || req.body?.user?.email;
      const name = profile.name || {};

      if (!email) {
        return done(new Error('Email not provided by Apple'), null);
      }

      // Check if user already exists with this Apple account
      let authProvider = await pool.query(
        'SELECT * FROM user_auth_providers WHERE provider = $1 AND provider_user_id = $2',
        ['apple', profile.id]
      );

      if (authProvider.rows.length > 0) {
        await pool.query(
          'UPDATE user_auth_providers SET access_token = $1, refresh_token = $2, token_expires_at = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4',
          [accessToken, refreshToken, new Date(Date.now() + 3600000), authProvider.rows[0].id]
        );

        const user = await pool.query('SELECT * FROM users WHERE id = $1', [authProvider.rows[0].user_id]);
        return done(null, user.rows[0]);
      }

      // Check if user exists with the same email
      const existingUser = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      let userId;
      if (existingUser.rows.length > 0) {
        userId = existingUser.rows[0].id;
        await pool.query(
          'UPDATE users SET email_verified = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
          [userId]
        );
      } else {
        const newUser = await pool.query(
          'INSERT INTO users (email, display_name, email_verified, first_name, last_name) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [
            email,
            `${name.firstName || ''} ${name.lastName || ''}`.trim() || 'Apple User',
            true,
            name.firstName || '',
            name.lastName || ''
          ]
        );
        userId = newUser.rows[0].id;
      }

      // Create auth provider record
      await pool.query(
        'INSERT INTO user_auth_providers (user_id, provider, provider_user_id, access_token, refresh_token, token_expires_at, provider_email, is_primary) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [
          userId,
          'apple',
          profile.id,
          accessToken,
          refreshToken,
          new Date(Date.now() + 3600000),
          email,
          true
        ]
      );

      const user = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
      return done(null, user.rows[0]);
    } catch (error) {
      return done(error, null);
    }
  }));
  console.log('✅ Apple OAuth strategy initialized');
} else {
  console.log('⚠️  Apple OAuth strategy skipped - missing environment variables');
}

// Yahoo OAuth Strategy - only initialize if environment variables are available
if (process.env.YAHOO_CLIENT_ID && process.env.YAHOO_CLIENT_SECRET) {
  passport.use(new YahooStrategy({
    consumerKey: process.env.YAHOO_CLIENT_ID,
    consumerSecret: process.env.YAHOO_CLIENT_SECRET,
    callbackURL: '/api/auth/yahoo/callback'
  }, async (token, tokenSecret, profile, done) => {
    try {
      const email = profile.emails[0]?.value;

      if (!email) {
        return done(new Error('Email not provided by Yahoo'), null);
      }

      // Check if user already exists with this Yahoo account
      let authProvider = await pool.query(
        'SELECT * FROM user_auth_providers WHERE provider = $1 AND provider_user_id = $2',
        ['yahoo', profile.id]
      );

      if (authProvider.rows.length > 0) {
        await pool.query(
          'UPDATE user_auth_providers SET access_token = $1, token_expires_at = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
          [token, new Date(Date.now() + 3600000), authProvider.rows[0].id]
        );

        const user = await pool.query('SELECT * FROM users WHERE id = $1', [authProvider.rows[0].user_id]);
        return done(null, user.rows[0]);
      }

      // Check if user exists with the same email
      const existingUser = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      let userId;
      if (existingUser.rows.length > 0) {
        userId = existingUser.rows[0].id;
        await pool.query(
          'UPDATE users SET email_verified = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
          [userId]
        );
      } else {
        const newUser = await pool.query(
          'INSERT INTO users (email, display_name, email_verified, first_name, last_name) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [
            email,
            profile.displayName || 'Yahoo User',
            true,
            profile.name?.givenName || '',
            profile.name?.familyName || ''
          ]
        );
        userId = newUser.rows[0].id;
      }

      // Create auth provider record
      await pool.query(
        'INSERT INTO user_auth_providers (user_id, provider, provider_user_id, access_token, token_expires_at, provider_email, is_primary) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [
          userId,
          'yahoo',
          profile.id,
          token,
          new Date(Date.now() + 3600000),
          email,
          true
        ]
      );

      const user = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
      return done(null, user.rows[0]);
    } catch (error) {
      return done(error, null);
    }
  }));
  console.log('✅ Yahoo OAuth strategy initialized');
} else {
  console.log('⚠️  Yahoo OAuth strategy skipped - missing environment variables');
}

// Local Strategy for email/password authentication
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    // Find user by email
    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return done(null, false, { message: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // Check if user has a password (local auth)
    const authProvider = await pool.query(
      'SELECT * FROM user_auth_providers WHERE user_id = $1 AND provider = $2',
      [user.id, 'local']
    );

    if (authProvider.rows.length === 0) {
      return done(null, false, { message: 'Please sign in with your email provider' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, authProvider.rows[0].access_token);
    if (!isValidPassword) {
      return done(null, false, { message: 'Invalid credentials' });
    }

    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

console.log('✅ Local authentication strategy initialized');

export default passport;
