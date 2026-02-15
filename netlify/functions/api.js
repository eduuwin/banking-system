// Netlify Serverless Function - API Handler
// This function acts as a proxy to handle all backend API requests

import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import dotenv from 'dotenv';

// Import all routes
import authRoutes from '../../backend/src/routes/auth.routes.js';
import userRoutes from '../../backend/src/routes/user.routes.js';
import transactionRoutes from '../../backend/src/routes/transaction.routes.js';
import kycRoutes from '../../backend/src/routes/kyc.routes.js';
import adminRoutes from '../../backend/src/routes/admin.routes.js';
import webhookRoutes from '../../backend/src/routes/webhook.routes.js';
import { errorHandler } from '../../backend/src/middleware/errorHandler.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Nibanky API running on Netlify Functions',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/webhook', webhookRoutes);

// Error handler
app.use(errorHandler);

// Export as serverless function
export const handler = serverless(app);
