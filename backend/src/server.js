import dotenv from 'dotenv';
import app from './app.js';
import pool from './config/database.js';
import logger from './utils/logger.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

// Test database connection
const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    logger.info('Database connected successfully', { time: result.rows[0].now });
    return true;
  } catch (error) {
    logger.error('Database connection failed', { error: error.message });
    return false;
  }
};

// Start server
const startServer = async () => {
  // Wait for database connection
  let retries = 5;
  while (retries > 0) {
    const connected = await testConnection();
    if (connected) break;
    
    retries--;
    logger.warn(`Database connection failed. Retrying... (${retries} attempts left)`);
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  if (retries === 0) {
    logger.error('Could not connect to database after multiple attempts');
    process.exit(1);
  }

  // Start Express server
  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`🚀 Nibanky Backend Server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  });
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  await pool.end();
  process.exit(0);
});

startServer();
