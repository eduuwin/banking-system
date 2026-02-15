import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { getBalance } from '../services/auth';
import { createWithdrawal } from '../services/transactions';
import Button from '../components/Button';
import Input from '../components/Input';

const Withdraw = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    amount: '',
    pix_key: '',
    pix_key_type: 'cpf'
  });
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchBalance();
  }, [user, navigate]);

  const fetchBalance = async () => {
    try {
      const data = await getBalance();
      setBalance(data.balance);
    } catch (err) {
      setError('Erro ao carregar saldo');
    }
  };

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

  const calculateFee = () => {
    const amount = parseFloat(formData.amount);
    return isNaN(amount) ? 0 : amount * 0.15;
  };

  const calculateNetAmount = () => {
    const amount = parseFloat(formData.amount);
    return isNaN(amount) ? 0 : amount - calculateFee();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const amount = parseFloat(formData.amount);

    if (isNaN(amount) || amount < 20) {
      setError('O valor mínimo para saque é R$ 20,00');
      return;
    }

    if (user.kyc_status !== 'approved') {
      setError('Você precisa ter KYC aprovado para fazer saques');
      return;
    }

    if (amount > balance) {
      setError('Saldo insuficiente');
      return;
    }

    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    setLoading(true);
    try {
      await createWithdrawal({
        amount,
        pix_key: formData.pix_key,
        pix_key_type: formData.pix_key_type
      });
      navigate('/', { state: { message: 'Saque solicitado com sucesso!' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao processar saque. Tente novamente.');
      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold">Sacar</h1>
          <p className="text-primary-100 mt-2">Envie dinheiro para sua chave PIX</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 -mt-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Saldo disponível:</strong>{' '}
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(balance)}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-start">
              <FiAlertCircle className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {showConfirm ? (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-bold text-gray-800 mb-3">Confirme os dados do saque:</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Valor:</strong> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(formData.amount))}</p>
                  <p><strong>Taxa (15%):</strong> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calculateFee())}</p>
                  <p className="text-lg font-bold text-primary-600">
                    <strong>Valor líquido:</strong> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calculateNetAmount())}
                  </p>
                  <p><strong>Chave PIX:</strong> {formData.pix_key}</p>
                  <p><strong>Tipo:</strong> {formData.pix_key_type.toUpperCase()}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowConfirm(false)}
                  variant="secondary"
                  fullWidth
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  loading={loading}
                  disabled={loading}
                  fullWidth
                >
                  Confirmar Saque
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Valor do Saque"
                type="text"
                name="amount"
                value={formData.amount}
                onChange={(e) => handleChange({ target: { name: 'amount', value: formatCurrency(e.target.value) } })}
                placeholder="0.00"
                prefix="R$"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Chave PIX
                </label>
                <select
                  name="pix_key_type"
                  value={formData.pix_key_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="cpf">CPF</option>
                  <option value="email">Email</option>
                  <option value="phone">Telefone</option>
                  <option value="random">Chave Aleatória</option>
                </select>
              </div>

              <Input
                label="Chave PIX"
                type="text"
                name="pix_key"
                value={formData.pix_key}
                onChange={handleChange}
                placeholder="Digite sua chave PIX"
                required
              />

              {formData.amount && parseFloat(formData.amount) >= 20 && (
                <div className="p-4 bg-gray-50 rounded-lg space-y-1 text-sm">
                  <p className="flex justify-between">
                    <span>Valor solicitado:</span>
                    <span className="font-semibold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(formData.amount))}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Taxa (15%):</span>
                    <span className="font-semibold text-red-600">-{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calculateFee())}</span>
                  </p>
                  <hr className="my-2" />
                  <p className="flex justify-between text-base">
                    <span className="font-bold">Você receberá:</span>
                    <span className="font-bold text-primary-600">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calculateNetAmount())}</span>
                  </p>
                </div>
              )}

              <p className="text-sm text-gray-500">Valor mínimo: R$ 20,00 | Taxa: 15%</p>

              <Button
                type="submit"
                fullWidth
                disabled={user?.kyc_status !== 'approved' || loading}
              >
                Continuar
              </Button>

              {user?.kyc_status !== 'approved' && (
                <p className="text-sm text-orange-600 text-center">
                  Complete sua verificação KYC para fazer saques.{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/kyc')}
                    className="underline font-semibold"
                  >
                    Verificar agora
                  </button>
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Withdraw;
