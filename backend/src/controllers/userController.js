import bcrypt from 'bcrypt';
import { User } from '../models/User.js';
import { validatePhone } from '../utils/validators.js';
import logger from '../utils/logger.js';

/**
 * Get user profile
 */
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findByEmail(req.user.email);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        cpf: user.cpf,
        phone: user.phone,
        balance: user.balance,
        kyc_status: user.kyc_status,
        is_admin: user.is_admin,
        is_active: user.is_active,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { full_name, phone } = req.body;
    const updateData = {};

    if (full_name !== undefined) {
      if (!full_name || full_name.trim().length < 3) {
        return res.status(400).json({ error: 'Full name must be at least 3 characters' });
      }
      updateData.full_name = full_name.trim();
    }

    if (phone !== undefined) {
      if (!validatePhone(phone)) {
        return res.status(400).json({ error: 'Invalid phone number' });
      }
      updateData.phone = phone.replace(/\D/g, '');
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const updatedUser = await User.update(req.user.email, updateData);
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    logger.info('User profile updated', { email: req.user.email });

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        full_name: updatedUser.full_name,
        cpf: updatedUser.cpf,
        phone: updatedUser.phone,
        balance: updatedUser.balance,
        kyc_status: updatedUser.kyc_status
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user balance
 */
export const getBalance = async (req, res, next) => {
  try {
    const balance = await User.getBalance(req.user.email);
    
    res.json({ balance });
  } catch (error) {
    next(error);
  }
};

/**
 * Change user password
 */
export const changePassword = async (req, res, next) => {
  try {
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
      return res.status(400).json({ error: 'Old password and new password are required' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const user = await User.findByEmail(req.user.email);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const validPassword = await bcrypt.compare(old_password, user.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Incorrect old password' });
    }

    const password_hash = await bcrypt.hash(new_password, 10);
    
    await User.update(req.user.email, { password_hash });

    logger.info('User password changed', { email: req.user.email });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

export default {
  getProfile,
  updateProfile,
  getBalance,
  changePassword
};
