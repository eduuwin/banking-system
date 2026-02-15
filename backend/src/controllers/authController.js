import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { validateEmail, validateCPF, validatePhone } from '../utils/validators.js';
import logger from '../utils/logger.js';

/**
 * Register new user
 */
export const register = async (req, res, next) => {
  try {
    const { email, password, full_name, cpf, phone } = req.body;

    // Validation
    if (!email || !password || !full_name || !cpf || !phone) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!validateCPF(cpf)) {
      return res.status(400).json({ error: 'Invalid CPF' });
    }

    if (!validatePhone(phone)) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const existingCPF = await User.findByCPF(cpf.replace(/\D/g, ''));
    if (existingCPF) {
      return res.status(409).json({ error: 'CPF already registered' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      email,
      password_hash,
      full_name,
      cpf: cpf.replace(/\D/g, ''),
      phone: phone.replace(/\D/g, '')
    });

    logger.info('User registered', { email });

    // Generate JWT
    const token = jwt.sign(
      { email: user.email, id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        cpf: user.cpf,
        phone: user.phone,
        balance: user.balance,
        kyc_status: user.kyc_status
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is disabled' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    logger.info('User logged in', { email });

    // Generate JWT
    const token = jwt.sign(
      { email: user.email, id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        cpf: user.cpf,
        phone: user.phone,
        balance: user.balance,
        kyc_status: user.kyc_status,
        is_admin: user.is_admin
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout (client-side token removal)
 */
export const logout = async (req, res) => {
  res.json({ message: 'Logout successful' });
};

export default {
  register,
  login,
  logout
};
