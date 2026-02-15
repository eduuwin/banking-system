import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { createPixTransfer } from '../services/transactions';
import Button from '../components/Button';
import Input from '../components/Input';

const Pix = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    pix_key: '',
    amount: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const formatCurrency = (value) => {
    const numbers = value.replace(/\D/g, '');
    const amount = parseFloat(numbers) / 100;
    return isNaN(amount) ? '' : amount.toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const amount = parseFloat(formData.amount);

    if (isNaN(amount) || amount <= 0) {
      setError('Digite um valor válido');
      return;
    }

    if (!formData.pix_key) {
      setError('Digite uma chave PIX válida');
      return;
    }

    setLoading(true);
    try {
      await createPixTransfer({
        pix_key: formData.pix_key,
        amount,
        description: formData.description
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao processar transferência. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Transferência Realizada!</h2>
          <p className="text-gray-600">Seu PIX foi enviado com sucesso.</p>
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
          <h1 className="text-3xl font-bold">Enviar PIX</h1>
          <p className="text-primary-100 mt-2">Transfira dinheiro instantaneamente</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 -mt-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Chave PIX do Destinatário"
              type="text"
              name="pix_key"
              value={formData.pix_key}
              onChange={handleChange}
              placeholder="CPF, email, telefone ou chave aleatória"
              required
            />

            <Input
              label="Valor"
              type="text"
              name="amount"
              value={formData.amount}
              onChange={(e) => handleChange({ target: { name: 'amount', value: formatCurrency(e.target.value) } })}
              placeholder="0.00"
              prefix="R$"
              required
            />

            <Input
              label="Descrição (Opcional)"
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Ex: Pagamento, presente..."
              maxLength={100}
            />

            <Button
              type="submit"
              fullWidth
              loading={loading}
              disabled={loading}
            >
              Enviar PIX
            </Button>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default Pix;
