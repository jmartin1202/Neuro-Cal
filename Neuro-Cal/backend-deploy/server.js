import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Load environment variables
dotenv.config();

const app = express();

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'joelmartin',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'neurocal',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'NeuroCal Backend API'
  });
});

// Import routes
import authRoutes from './routes/auth.js';
import aiRoutes from './routes/ai.js';
import billingRoutes from './routes/billing.js';
import crmRoutes from './routes/crm.js';

// Import webhook handler
import { handleStripeWebhook } from './services/stripeWebhookHandler.js';

// Import cron jobs
import { initializeCronJobs } from './services/cronJobs.js';

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/crm', crmRoutes);

// Stripe webhook endpoint (no body parsing for webhook verification)
app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log('🚀 NeuroCal Backend running on port', PORT);
  console.log('📊 Health check: http://localhost:' + PORT + '/health');
  console.log('🔐 Authentication: Email/Password enabled');
  console.log('💳 Billing: Stripe integration enabled');
  
  // Initialize cron jobs
  initializeCronJobs();
});

export { pool };
