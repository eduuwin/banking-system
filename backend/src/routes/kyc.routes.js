import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  submitKYC,
  getKYCStatus
} from '../controllers/kycController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.post('/submit', submitKYC);
router.get('/status', getKYCStatus);

export default router;
