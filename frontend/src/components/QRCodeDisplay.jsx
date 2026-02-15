import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../utils/formatters';
import Button from './Button';

/**
 * QR Code display component
 * @param {Object} props
 * @param {string} props.qrCode - QR code data (base64 image or text)
 * @param {number} props.amount - Transaction amount
 * @param {string} props.expiresAt - Expiration timestamp
 */
const QRCodeDisplay = ({ qrCode, amount, expiresAt }) => {
  const [copied, setCopied] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    if (!expiresAt) return;

    const updateTimer = () => {
      const now = new Date();
      const expires = new Date(expiresAt);
      const diff = expires - now;

      if (diff <= 0) {
        setTimeRemaining('Expirado');
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(qrCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const isBase64Image = qrCode?.startsWith('data:image') || qrCode?.startsWith('iVBOR');

  return (
    <motion.div
      className="qrcode-display"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {amount && (
        <div className="qrcode-amount">
          <span className="amount-label">Valor:</span>
          <span className="amount-value">{formatCurrency(amount)}</span>
        </div>
      )}

      <div className="qrcode-container">
        {isBase64Image ? (
          <img 
            src={qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`}
            alt="QR Code" 
            className="qrcode-image"
          />
        ) : (
          <div className="qrcode-placeholder">
            <div className="qr-grid">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="qr-cell" />
              ))}
            </div>
          </div>
        )}
      </div>

      {expiresAt && timeRemaining && (
        <div className={`qrcode-timer ${timeRemaining === 'Expirado' ? 'expired' : ''}`}>
          ⏱️ {timeRemaining === 'Expirado' ? 'Código Expirado' : `Expira em: ${timeRemaining}`}
        </div>
      )}

      <Button
        variant={copied ? 'secondary' : 'primary'}
        onClick={handleCopy}
        className="qrcode-copy-btn"
      >
        {copied ? '✓ Copiado!' : '📋 Copiar Código'}
      </Button>

      <div className="qrcode-text">
        <p className="qrcode-code">{qrCode?.slice(0, 40)}...</p>
      </div>
    </motion.div>
  );
};

export default QRCodeDisplay;
