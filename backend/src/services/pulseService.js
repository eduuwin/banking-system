import axios from 'axios';
import { pulseConfig } from '../config/pulse.js';
import { GatewayLog } from '../models/GatewayLog.js';
import { Transaction } from '../models/Transaction.js';
import logger from '../utils/logger.js';

/**
 * Create PIX payment for deposit
 * @param {number} amount - Amount in BRL
 * @param {string} userEmail - User email
 * @param {object} userData - User data (name, cpf, phone)
 * @returns {Promise<object>} Transaction with QR Code
 */
export const pulseCreatePix = async (amount, userEmail, userData) => {
  try {
    // Calculate deposit fee (2%)
    const fee = amount * 0.02;
    const netAmount = amount - fee;
    
    // Create transaction record first
    const transaction = await Transaction.create({
      user_email: userEmail,
      type: 'deposit',
      amount: amount,
      fee: fee,
      net_amount: netAmount,
      status: 'pending'
    });

    const requestData = {
      type: 'pix',
      amount: parseFloat(amount),
      customer: {
        name: userData.full_name,
        email: userData.email,
        cpf: userData.cpf.replace(/\D/g, ''),
        phone: userData.phone.replace(/\D/g, '')
      },
      webhook_url: pulseConfig.webhookUrl
    };

    logger.info('Creating PIX payment', { amount, userEmail });

    const response = await axios.post(
      `${pulseConfig.baseUrl}/api/v1/transactions`,
      requestData,
      { headers: pulseConfig.headers }
    );

    logger.info('PIX payment created', { 
      transactionId: transaction.id,
      gatewayId: response.data.transaction_id 
    });

    // Update transaction with gateway data
    const updatedTransaction = await Transaction.update(transaction.id, {
      gateway_transaction_id: response.data.transaction_id,
      qr_code: response.data.pix?.qr_code || null
    });

    // Log successful gateway call
    await GatewayLog.create({
      type: 'pix_create',
      status: 'success',
      transaction_id: transaction.id,
      gateway_id: response.data.transaction_id,
      user_email: userEmail,
      amount: amount,
      request_data: requestData,
      response_data: response.data
    });

    return {
      transaction: updatedTransaction,
      qr_code: response.data.pix?.qr_code,
      qr_code_image: response.data.pix?.qr_code_image,
      expires_at: response.data.pix?.expires_at
    };

  } catch (error) {
    logger.error('Error creating PIX payment', {
      error: error.message,
      response: error.response?.data
    });

    // Log failed gateway call
    await GatewayLog.create({
      type: 'pix_create',
      status: 'error',
      user_email: userEmail,
      amount: amount,
      error_message: error.message,
      response_data: error.response?.data || null
    });

    throw new Error(error.response?.data?.message || 'Failed to create PIX payment');
  }
};

/**
 * Process withdrawal to PIX key
 * @param {number} amount - Amount in BRL
 * @param {string} pixKey - PIX key
 * @param {string} pixKeyType - PIX key type (cpf, email, phone, random)
 * @param {string} userEmail - User email
 * @param {object} userData - User data
 * @returns {Promise<object>} Transaction result
 */
export const pulseWithdraw = async (amount, pixKey, pixKeyType, userEmail, userData) => {
  try {
    // Calculate fee (15%)
    const fee = amount * 0.15;
    const netAmount = amount - fee;

    // Create transaction record
    const transaction = await Transaction.create({
      user_email: userEmail,
      type: 'withdrawal',
      amount: amount,
      fee: fee,
      net_amount: netAmount,
      status: 'pending',
      pix_key: pixKey,
      pix_key_type: pixKeyType
    });

    const requestData = {
      amount: parseFloat(amount),
      pix_key: pixKey,
      pix_key_type: pixKeyType,
      customer: {
        name: userData.full_name,
        email: userData.email
      }
    };

    logger.info('Processing withdrawal', { amount, userEmail, pixKey });

    const response = await axios.post(
      `${pulseConfig.baseUrl}/api/v1/withdrawals`,
      requestData,
      { headers: pulseConfig.headers }
    );

    logger.info('Withdrawal processed', { 
      transactionId: transaction.id,
      gatewayId: response.data.withdrawal_id 
    });

    // Update transaction with gateway data
    const updatedTransaction = await Transaction.update(transaction.id, {
      gateway_transaction_id: response.data.withdrawal_id,
      status: 'completed'
    });

    // Log successful gateway call
    await GatewayLog.create({
      type: 'withdraw',
      status: 'success',
      transaction_id: transaction.id,
      gateway_id: response.data.withdrawal_id,
      user_email: userEmail,
      amount: amount,
      request_data: requestData,
      response_data: response.data
    });

    return {
      transaction: updatedTransaction,
      withdrawal_id: response.data.withdrawal_id,
      status: response.data.status,
      net_amount: netAmount
    };

  } catch (error) {
    logger.error('Error processing withdrawal', {
      error: error.message,
      response: error.response?.data
    });

    // Log failed gateway call
    await GatewayLog.create({
      type: 'withdraw',
      status: 'error',
      user_email: userEmail,
      amount: amount,
      error_message: error.message,
      response_data: error.response?.data || null
    });

    throw new Error(error.response?.data?.message || 'Failed to process withdrawal');
  }
};

export default {
  pulseCreatePix,
  pulseWithdraw
};
