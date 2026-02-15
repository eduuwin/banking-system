import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { createDeposit, getTransaction } from '../services/transactions';
import Button from '../components/Button';
import Input from '../components/Input';
import QRCodeDisplay from '../components/QRCodeDisplay';

const Deposit = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pixData, setPixData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.kyc_status !== 'approved') {
      setError('Você precisa ter KYC aprovado para fazer depósitos');
    }
  }, [user, navigate]);

  useEffect(() => {
    let interval;
    if (polling && pixData && pixData.transaction) {
      interval = setInterval(async () => {
        try {
          const result = await getTransaction(pixData.transaction.id);
          if (result.transaction.status === 'completed') {
            setPaymentStatus('completed');
            setPolling(false);
            setTimeout(() => navigate('/'), 2000);
          }
        } catch (err) {
          console.error('Erro ao verificar pagamento:', err);
        }
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [polling, pixData, navigate]);

  const handleGeneratePix = async (e) => {
    e.preventDefault();
    setError('');

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue < 10) {
      setError('O valor mínimo para depósito é R$ 10,00');
      return;
    }

    if (user.kyc_status !== 'approved') {
      setError('Você precisa ter KYC aprovado para fazer depósitos');
      return;
    }

    setLoading(true);
    try {
      const data = await createDeposit(amountValue);
      setPixData(data);
      setPolling(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao gerar PIX. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    const numbers = value.replace(/\D/g, '');
    const amount = parseFloat(numbers) / 100;
    return isNaN(amount) ? '' : amount.toFixed(2);
  };

  if (paymentStatus === 'completed') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen flex items-center justify-center bg-gray-50 px-4"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Depósito Confirmado!</h2>
          <p className="text-gray-600">Seu saldo foi atualizado com sucesso.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-gray-50 pb-20"
    >
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white px-6 py-8 rounded-b-3xl">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-white mb-4 hover:text-primary-100"
          >
            ← Voltar
          </button>
          <h1 className="text-3xl font-bold">Depositar</h1>
          <p className="text-primary-100 mt-2">Adicione fundos à sua conta via PIX</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 -mt-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {!pixData ? (
            <form onSubmit={handleGeneratePix} className="space-y-4">
              <Input
                label="Valor do Depósito"
                type="text"
                value={amount}
                onChange={(e) => setAmount(formatCurrency(e.target.value))}
                placeholder="0.00"
                prefix="R$"
                required
              />
              <p className="text-sm text-gray-500">Valor mínimo: R$ 10,00</p>

              <Button
                type="submit"
                fullWidth
                loading={loading}
                disabled={loading || user?.kyc_status !== 'approved'}
              >
                Gerar PIX
              </Button>

              {user?.kyc_status !== 'approved' && (
                <p className="text-sm text-orange-600 text-center">
                  Complete sua verificação KYC para fazer depósitos.{' '}
                  <button
                    onClick={() => navigate('/kyc')}
                    className="underline font-semibold"
                  >
                    Verificar agora
                  </button>
                </p>
              )}
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Escaneie o QR Code
                </h3>
                <p className="text-gray-600 mb-4">
                  Valor: {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(parseFloat(amount))}
                </p>
              </div>

              <QRCodeDisplay
                pixCode={pixData.pix_code}
                amount={parseFloat(amount)}
              />

              {polling && (
                <div className="text-center">
                  <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
                    Aguardando pagamento...
                  </div>
                </div>
              )}

              <Button
                onClick={() => {
                  setPixData(null);
                  setPolling(false);
                  setAmount('');
                }}
                variant="secondary"
                fullWidth
              >
                Cancelar
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Deposit;
