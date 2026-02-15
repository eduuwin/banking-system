import { User } from '../models/User.js';
import { Transaction } from '../models/Transaction.js';
import { KYCDocument } from '../models/KYCDocument.js';
import { GatewayLog } from '../models/GatewayLog.js';
import { GatewayConfig } from '../models/GatewayConfig.js';
import { query } from '../config/database.js';
import logger from '../utils/logger.js';

/**
 * List all users with pagination and filters
 */
export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, kyc_status, is_active } = req.query;
    const offset = (page - 1) * limit;

    const users = await User.list({
      limit: parseInt(limit),
      offset: parseInt(offset),
      kyc_status,
      is_active: is_active !== undefined ? is_active === 'true' : undefined
    });

    const total = await User.count({
      kyc_status,
      is_active: is_active !== undefined ? is_active === 'true' : undefined
    });

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID
 */
export const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    delete user.password_hash;

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user (admin can modify balance, kyc_status, is_active)
 */
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { balance, kyc_status, is_active, full_name, phone } = req.body;

    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updateData = {};

    if (balance !== undefined) {
      if (typeof balance !== 'number' || balance < 0) {
        return res.status(400).json({ error: 'Invalid balance' });
      }
      updateData.balance = balance;
    }

    if (kyc_status !== undefined) {
      if (!['none', 'submitted', 'approved', 'rejected'].includes(kyc_status)) {
        return res.status(400).json({ error: 'Invalid KYC status' });
      }
      updateData.kyc_status = kyc_status;
    }

    if (is_active !== undefined) {
      updateData.is_active = Boolean(is_active);
    }

    if (full_name !== undefined) {
      updateData.full_name = full_name;
    }

    if (phone !== undefined) {
      updateData.phone = phone.replace(/\D/g, '');
    }

    const updatedUser = await User.update(user.email, updateData);

    logger.info('User updated by admin', { 
      adminEmail: req.user.email, 
      userId: id,
      updates: Object.keys(updateData)
    });

    delete updatedUser.password_hash;

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get pending KYC documents
 */
export const getPendingKYCs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const kycDocuments = await KYCDocument.list({
      limit: parseInt(limit),
      offset: parseInt(offset),
      status: 'pending'
    });

    const total = await KYCDocument.count({ status: 'pending' });

    res.json({
      kyc_documents: kycDocuments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve KYC document
 */
export const approveKYC = async (req, res, next) => {
  try {
    const { id } = req.params;

    const kycDocument = await KYCDocument.findById(id);
    
    if (!kycDocument) {
      return res.status(404).json({ error: 'KYC document not found' });
    }

    if (kycDocument.status !== 'pending') {
      return res.status(400).json({ error: 'KYC document is not pending' });
    }

    const approvedKYC = await KYCDocument.approve(id, req.user.email);

    await User.update(kycDocument.user_email, { kyc_status: 'approved' });

    logger.info('KYC approved', { 
      adminEmail: req.user.email, 
      kycId: id,
      userEmail: kycDocument.user_email
    });

    res.json({
      message: 'KYC approved successfully',
      kyc: approvedKYC
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject KYC document with reason
 */
export const rejectKYC = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;

    if (!rejection_reason || rejection_reason.trim().length === 0) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const kycDocument = await KYCDocument.findById(id);
    
    if (!kycDocument) {
      return res.status(404).json({ error: 'KYC document not found' });
    }

    if (kycDocument.status !== 'pending') {
      return res.status(400).json({ error: 'KYC document is not pending' });
    }

    const rejectedKYC = await KYCDocument.reject(id, req.user.email, rejection_reason);

    await User.update(kycDocument.user_email, { kyc_status: 'rejected' });

    logger.info('KYC rejected', { 
      adminEmail: req.user.email, 
      kycId: id,
      userEmail: kycDocument.user_email,
      reason: rejection_reason
    });

    res.json({
      message: 'KYC rejected',
      kyc: rejectedKYC
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all transactions with pagination
 */
export const getAllTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, type, status, user_email } = req.query;
    const offset = (page - 1) * limit;

    const transactions = await Transaction.list({
      limit: parseInt(limit),
      offset: parseInt(offset),
      type,
      status,
      user_email
    });

    const total = await Transaction.count({ type, status, user_email });

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel a pending transaction
 */
export const cancelTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findById(id);
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending transactions can be cancelled' });
    }

    const updatedTransaction = await Transaction.update(id, { status: 'cancelled' });

    logger.info('Transaction cancelled by admin', { 
      adminEmail: req.user.email, 
      transactionId: id,
      userEmail: transaction.user_email
    });

    res.json({
      message: 'Transaction cancelled successfully',
      transaction: updatedTransaction
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get gateway logs
 */
export const getGatewayLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, type, status } = req.query;
    const offset = (page - 1) * limit;

    const logs = await GatewayLog.list({
      limit: parseInt(limit),
      offset: parseInt(offset),
      type,
      status
    });

    const total = await GatewayLog.count({ type, status });

    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get active gateway configuration
 */
export const getGatewayConfig = async (req, res, next) => {
  try {
    const config = await GatewayConfig.get();
    
    if (!config) {
      return res.status(404).json({ error: 'No active gateway configuration found' });
    }

    res.json({ config });
  } catch (error) {
    next(error);
  }
};

/**
 * Update gateway configuration
 */
export const updateGatewayConfig = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { gateway_name, api_key, api_secret, webhook_secret, is_active } = req.body;

    const config = await GatewayConfig.getById(id);
    
    if (!config) {
      return res.status(404).json({ error: 'Gateway configuration not found' });
    }

    const updateData = {};

    if (gateway_name !== undefined) updateData.gateway_name = gateway_name;
    if (api_key !== undefined) updateData.api_key = api_key;
    if (api_secret !== undefined) updateData.api_secret = api_secret;
    if (webhook_secret !== undefined) updateData.webhook_secret = webhook_secret;
    if (is_active !== undefined) updateData.is_active = Boolean(is_active);

    const updatedConfig = await GatewayConfig.update(id, updateData);

    logger.info('Gateway config updated by admin', { 
      adminEmail: req.user.email, 
      configId: id
    });

    res.json({
      message: 'Gateway configuration updated successfully',
      config: updatedConfig
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const userStatsQuery = `
      SELECT
        COUNT(*) as total_users,
        COUNT(CASE WHEN kyc_status = 'approved' THEN 1 END) as verified_users,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
        SUM(balance) as total_balance
      FROM users
    `;

    const transactionStatsQuery = `
      SELECT
        COUNT(*) as total_transactions,
        SUM(CASE WHEN status = 'completed' THEN net_amount ELSE 0 END) as total_volume,
        SUM(CASE WHEN type = 'deposit' AND status = 'completed' THEN net_amount ELSE 0 END) as total_deposits,
        SUM(CASE WHEN type = 'withdrawal' AND status = 'completed' THEN amount ELSE 0 END) as total_withdrawals,
        SUM(CASE WHEN type = 'transfer' AND status = 'completed' THEN amount ELSE 0 END) as total_transfers,
        SUM(CASE WHEN status = 'completed' THEN fee ELSE 0 END) as total_fees,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_transactions
      FROM transactions
    `;

    const kycStatsQuery = `
      SELECT
        COUNT(*) as total_kyc_submissions,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_kyc
      FROM kyc_documents
    `;

    const [userStats, transactionStats, kycStats] = await Promise.all([
      query(userStatsQuery),
      query(transactionStatsQuery),
      query(kycStatsQuery)
    ]);

    const recentTransactions = await Transaction.list({ limit: 10 });
    const recentUsers = await User.list({ limit: 10 });

    res.json({
      stats: {
        users: {
          total: parseInt(userStats.rows[0].total_users) || 0,
          verified: parseInt(userStats.rows[0].verified_users) || 0,
          active: parseInt(userStats.rows[0].active_users) || 0,
          total_balance: parseFloat(userStats.rows[0].total_balance) || 0
        },
        transactions: {
          total: parseInt(transactionStats.rows[0].total_transactions) || 0,
          pending: parseInt(transactionStats.rows[0].pending_transactions) || 0,
          total_volume: parseFloat(transactionStats.rows[0].total_volume) || 0,
          total_deposits: parseFloat(transactionStats.rows[0].total_deposits) || 0,
          total_withdrawals: parseFloat(transactionStats.rows[0].total_withdrawals) || 0,
          total_transfers: parseFloat(transactionStats.rows[0].total_transfers) || 0,
          total_fees: parseFloat(transactionStats.rows[0].total_fees) || 0
        },
        kyc: {
          total_submissions: parseInt(kycStats.rows[0].total_kyc_submissions) || 0,
          pending: parseInt(kycStats.rows[0].pending_kyc) || 0
        }
      },
      recent_transactions: recentTransactions,
      recent_users: recentUsers
    });
  } catch (error) {
    next(error);
  }
};

export default {
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
};
