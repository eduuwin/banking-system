import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import {
  getUsers,
  getUser,
  updateUser,
  getPendingKYCs,
  approveKYC,
  rejectKYC,
  getAllTransactions,
  cancelTransaction,
  getGatewayLogs,
  getGatewayConfig,
  updateGatewayConfig,
  getDashboardStats
} from '../controllers/adminController.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard
router.get('/stats', getDashboardStats);

// Users
router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.put('/users/:id', updateUser);

// KYC
router.get('/kyc', getPendingKYCs);
router.put('/kyc/:id/approve', approveKYC);
router.put('/kyc/:id/reject', rejectKYC);

// Transactions
router.get('/transactions', getAllTransactions);
router.put('/transactions/:id/cancel', cancelTransaction);

// Gateway
router.get('/gateway', getGatewayConfig);
router.put('/gateway/:id', updateGatewayConfig);
router.get('/logs', getGatewayLogs);

export default router;
