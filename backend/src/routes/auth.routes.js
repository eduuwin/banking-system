import express from 'express';
import { register, login, logout } from '../controllers/authController.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes with rate limiting
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);

export default router;
