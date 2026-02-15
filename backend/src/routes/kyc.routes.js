import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import {
  submitKYC,
  getKYCStatus
} from '../controllers/kycController.js';

const router = express.Router();

// Rate limiting first, then authentication
router.use(apiLimiter);
router.use(authenticateToken);

router.post('/submit', submitKYC);
router.get('/status', getKYCStatus);

export default router;
