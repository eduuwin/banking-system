import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import {
  getProfile,
  updateProfile,
  getBalance,
  changePassword
} from '../controllers/userController.js';

const router = express.Router();

// All routes require authentication and rate limiting
router.use(authenticateToken);
router.use(apiLimiter);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/balance', getBalance);
router.post('/change-password', changePassword);

export default router;
