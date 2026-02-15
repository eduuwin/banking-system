import { Transaction } from '../models/Transaction.js';
import { User } from '../models/User.js';
import { GatewayLog } from '../models/GatewayLog.js';
import logger from '../utils/logger.js';

/**
 * Handle Pulse VIP webhook notifications
 */
export const handlePulseWebhook = async (req, res, next) => {
  try {
    const payload = req.body;
    
    logger.info('Webhook received', { payload });

    const {
      event,
      transaction_id,
      status,
      amount,
      customer_email,
      type
    } = payload;

    if (!event || !transaction_id) {
      logger.warn('Invalid webhook payload', { payload });
      return res.status(400).json({ error: 'Invalid webhook payload' });
    }

    const transaction = await Transaction.findByGatewayId(transaction_id);
    
    if (!transaction) {
      logger.warn('Transaction not found for webhook', { transaction_id });
      
      await GatewayLog.create({
        type: 'webhook',
        status: 'error',
        gateway_id: transaction_id,
        user_email: customer_email || null,
        amount: amount || null,
        response_data: payload,
        error_message: 'Transaction not found'
      });
      
      return res.status(404).json({ error: 'Transaction not found' });
    }

    await GatewayLog.create({
      type: 'webhook',
      status: 'success',
      transaction_id: transaction.id,
      gateway_id: transaction_id,
      user_email: transaction.user_email,
      amount: transaction.amount,
      response_data: payload
    });

    if (event === 'transaction.completed' && transaction.type === 'deposit') {
      if (transaction.status === 'completed') {
        logger.info('Transaction already completed', { transactionId: transaction.id });
        return res.status(200).json({ message: 'Webhook processed (already completed)' });
      }

      await Transaction.update(transaction.id, { status: 'completed' });

      await User.updateBalance(transaction.user_email, transaction.net_amount);

      logger.info('Deposit completed via webhook', {
        transactionId: transaction.id,
        userEmail: transaction.user_email,
        amount: transaction.net_amount
      });

      return res.status(200).json({ message: 'Webhook processed successfully' });
    }

    if (event === 'transaction.failed' || event === 'transaction.cancelled') {
      await Transaction.update(transaction.id, { 
        status: event === 'transaction.failed' ? 'failed' : 'cancelled' 
      });

      logger.info('Transaction status updated via webhook', {
        transactionId: transaction.id,
        event,
        status: event === 'transaction.failed' ? 'failed' : 'cancelled'
      });

      return res.status(200).json({ message: 'Webhook processed successfully' });
    }

    logger.info('Webhook event processed', { event, transactionId: transaction.id });
    
    res.status(200).json({ message: 'Webhook received' });
  } catch (error) {
    logger.error('Webhook processing error', { error: error.message, body: req.body });
    next(error);
  }
};

export default {
  handlePulseWebhook
};
