import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { transactionLimiter } from '../middleware/rateLimiter.js';
import {
  getTransactions,
  getTransaction,
  createDeposit,
  createWithdrawal,
  createPixTransfer,
  getStats
} from '../controllers/transactionController.js';

const router = express.Router();

// All routes require authentication and rate limiting
router.use(authenticateToken);
router.use(transactionLimiter);

router.get('/', getTransactions);
router.get('/stats', getStats);
router.get('/:id', getTransaction);
router.post('/deposit', createDeposit);
router.post('/withdraw', createWithdrawal);
router.post('/pix', createPixTransfer);

export default router;
