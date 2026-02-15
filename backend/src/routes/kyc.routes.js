import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import {
  submitKYC,
  getKYCStatus
} from '../controllers/kycController.js';

const router = express.Router();

// All routes require authentication and rate limiting
router.use(authenticateToken);
router.use(apiLimiter);

router.post('/submit', submitKYC);
router.get('/status', getKYCStatus);

export default router;
