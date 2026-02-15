import { Transaction } from '../models/Transaction.js';
import { User } from '../models/User.js';
import { pulseCreatePix, pulseWithdraw } from '../services/pulseService.js';
import { validateAmount, validatePixKey } from '../utils/validators.js';
import { query } from '../config/database.js';
import logger from '../utils/logger.js';

/**
 * Get user transactions with pagination and filters
 */
export const getTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, type, status } = req.query;
    const offset = (page - 1) * limit;

    const transactions = await Transaction.listByUser(req.user.email, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      type,
      status
    });

    const total = await Transaction.count({
      user_email: req.user.email,
      type,
      status
    });

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
 * Get single transaction by ID
 */
export const getTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const transaction = await Transaction.findById(id);
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.user_email !== req.user.email) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ transaction });
  } catch (error) {
    next(error);
  }
};

/**
 * Create deposit via PIX
 */
export const createDeposit = async (req, res, next) => {
  try {
    const { amount } = req.body;

    if (!validateAmount(amount)) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (amount < 10) {
      return res.status(400).json({ error: 'Minimum deposit amount is R$ 10.00' });
    }

    const user = await User.findByEmail(req.user.email);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = {
      full_name: user.full_name,
      email: user.email,
      cpf: user.cpf,
      phone: user.phone
    };

    const result = await pulseCreatePix(amount, req.user.email, userData);

    logger.info('Deposit created', { 
      email: req.user.email, 
      amount, 
      transactionId: result.transaction.id 
    });

    res.status(201).json({
      message: 'Deposit initiated successfully',
      transaction: result.transaction,
      qr_code: result.qr_code,
      qr_code_image: result.qr_code_image,
      expires_at: result.expires_at
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create withdrawal via PIX
 */
export const createWithdrawal = async (req, res, next) => {
  try {
    const { amount, pix_key, pix_key_type } = req.body;

    if (!validateAmount(amount)) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (amount < 10) {
      return res.status(400).json({ error: 'Minimum withdrawal amount is R$ 10.00' });
    }

    if (!pix_key || !pix_key_type) {
      return res.status(400).json({ error: 'PIX key and type are required' });
    }

    if (!validatePixKey(pix_key, pix_key_type)) {
      return res.status(400).json({ error: 'Invalid PIX key for the specified type' });
    }

    const user = await User.findByEmail(req.user.email);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.kyc_status !== 'approved') {
      return res.status(403).json({ error: 'KYC verification required for withdrawals' });
    }

    const fee = amount * 0.15;
    const totalRequired = amount + fee;

    if (user.balance < totalRequired) {
      return res.status(400).json({ 
        error: 'Insufficient balance',
        balance: user.balance,
        required: totalRequired,
        fee
      });
    }

    await User.updateBalance(req.user.email, -totalRequired);

    const userData = {
      full_name: user.full_name,
      email: user.email,
      cpf: user.cpf
    };

    const result = await pulseWithdraw(amount, pix_key, pix_key_type, req.user.email, userData);

    logger.info('Withdrawal created', { 
      email: req.user.email, 
      amount, 
      transactionId: result.transaction.id 
    });

    res.status(201).json({
      message: 'Withdrawal processed successfully',
      transaction: result.transaction,
      net_amount: result.net_amount,
      fee
    });
  } catch (error) {
    if (error.message.includes('balance')) {
      await User.updateBalance(req.user.email, amount + (amount * 0.15));
    }
    next(error);
  }
};

/**
 * Create internal PIX transfer between users
 */
export const createPixTransfer = async (req, res, next) => {
  try {
    const { amount, recipient_pix_key, pix_key_type, description } = req.body;

    if (!validateAmount(amount)) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (amount < 1) {
      return res.status(400).json({ error: 'Minimum transfer amount is R$ 1.00' });
    }

    if (!recipient_pix_key || !pix_key_type) {
      return res.status(400).json({ error: 'Recipient PIX key and type are required' });
    }

    const sender = await User.findByEmail(req.user.email);
    
    if (!sender) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (sender.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    let recipient;
    if (pix_key_type === 'email') {
      recipient = await User.findByEmail(recipient_pix_key);
    } else if (pix_key_type === 'cpf') {
      recipient = await User.findByCPF(recipient_pix_key.replace(/\D/g, ''));
    }

    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    if (recipient.email === req.user.email) {
      return res.status(400).json({ error: 'Cannot transfer to yourself' });
    }

    if (!recipient.is_active) {
      return res.status(400).json({ error: 'Recipient account is inactive' });
    }

    await User.updateBalance(req.user.email, -amount);
    await User.updateBalance(recipient.email, amount);

    const transaction = await Transaction.create({
      user_email: req.user.email,
      type: 'transfer',
      amount,
      fee: 0,
      net_amount: amount,
      status: 'completed',
      pix_key: recipient_pix_key,
      pix_key_type,
      recipient_name: recipient.full_name,
      description
    });

    logger.info('PIX transfer completed', { 
      from: req.user.email, 
      to: recipient.email, 
      amount 
    });

    res.status(201).json({
      message: 'Transfer completed successfully',
      transaction
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get transaction statistics for user
 */
export const getStats = async (req, res, next) => {
  try {
    const sql = `
      SELECT
        COUNT(*) as total_transactions,
        SUM(CASE WHEN type = 'deposit' AND status = 'completed' THEN net_amount ELSE 0 END) as total_deposits,
        SUM(CASE WHEN type = 'withdrawal' AND status = 'completed' THEN amount ELSE 0 END) as total_withdrawals,
        SUM(CASE WHEN type = 'transfer' AND status = 'completed' THEN amount ELSE 0 END) as total_transfers,
        SUM(CASE WHEN status = 'completed' THEN fee ELSE 0 END) as total_fees
      FROM transactions
      WHERE user_email = $1
    `;
    
    const result = await query(sql, [req.user.email]);
    const stats = result.rows[0];

    const recentTransactions = await Transaction.listByUser(req.user.email, { limit: 5 });

    res.json({
      stats: {
        total_transactions: parseInt(stats.total_transactions) || 0,
        total_deposits: parseFloat(stats.total_deposits) || 0,
        total_withdrawals: parseFloat(stats.total_withdrawals) || 0,
        total_transfers: parseFloat(stats.total_transfers) || 0,
        total_fees: parseFloat(stats.total_fees) || 0
      },
      recent_transactions: recentTransactions
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getTransactions,
  getTransaction,
  createDeposit,
  createWithdrawal,
  createPixTransfer,
  getStats
};
