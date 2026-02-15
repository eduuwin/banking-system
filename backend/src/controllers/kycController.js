import { KYCDocument } from '../models/KYCDocument.js';
import { User } from '../models/User.js';
import { validateCPF } from '../utils/validators.js';
import logger from '../utils/logger.js';

/**
 * Submit KYC documentation
 */
export const submitKYC = async (req, res, next) => {
  try {
    const {
      document_type,
      document_front_url,
      document_back_url,
      selfie_url,
      full_name,
      cpf,
      birth_date
    } = req.body;

    if (!document_type || !document_front_url || !selfie_url || !full_name || !cpf || !birth_date) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    if (!['rg', 'cnh', 'passport'].includes(document_type)) {
      return res.status(400).json({ error: 'Invalid document type. Must be: rg, cnh, or passport' });
    }

    if (!validateCPF(cpf)) {
      return res.status(400).json({ error: 'Invalid CPF' });
    }

    const user = await User.findByEmail(req.user.email);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.kyc_status === 'approved') {
      return res.status(400).json({ error: 'KYC already approved' });
    }

    const existingKYC = await KYCDocument.findByUserEmail(req.user.email);
    
    if (existingKYC && existingKYC.status === 'pending') {
      return res.status(400).json({ error: 'KYC submission already pending review' });
    }

    const kycDocument = await KYCDocument.create({
      user_email: req.user.email,
      document_type,
      document_front_url,
      document_back_url: document_back_url || null,
      selfie_url,
      full_name,
      cpf: cpf.replace(/\D/g, ''),
      birth_date,
      status: 'pending'
    });

    await User.update(req.user.email, { kyc_status: 'submitted' });

    logger.info('KYC submitted', { email: req.user.email, kycId: kycDocument.id });

    res.status(201).json({
      message: 'KYC submitted successfully',
      kyc: kycDocument
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get KYC status and latest document
 */
export const getKYCStatus = async (req, res, next) => {
  try {
    const user = await User.findByEmail(req.user.email);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const kycDocument = await KYCDocument.findByUserEmail(req.user.email);

    res.json({
      kyc_status: user.kyc_status,
      kyc_document: kycDocument || null
    });
  } catch (error) {
    next(error);
  }
};

export default {
  submitKYC,
  getKYCStatus
};
