import express from 'express';
import { handlePulseWebhook } from '../controllers/webhookController.js';

const router = express.Router();

// Webhook endpoint (no authentication - validated by gateway signature)
router.post('/pulse', handlePulseWebhook);

export default router;
