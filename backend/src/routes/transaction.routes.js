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

// Rate limiting first, then authentication
router.use(transactionLimiter);
router.use(authenticateToken);

router.get('/', getTransactions);
router.get('/stats', getStats);
router.get('/:id', getTransaction);
router.post('/deposit', createDeposit);
router.post('/withdraw', createWithdrawal);
router.post('/pix', createPixTransfer);

export default router;
