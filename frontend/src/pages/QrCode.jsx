import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';

const QrCode = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const formatCurrency = (value) => {
    const numbers = value.replace(/\D/g, '');
    const amount = parseFloat(numbers) / 100;
    return isNaN(amount) ? '' : amount.toFixed(2);
  };

  const formatCPF = (cpf) => {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const handleCopyKey = () => {
    if (user?.cpf) {
      navigator.clipboard.writeText(user.cpf);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGenerate = () => {
    setShowKey(true);
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
          <h1 className="text-3xl font-bold">Gerar QR Code</h1>
          <p className="text-primary-100 mt-2">Receba pagamentos via PIX</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 -mt-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          {!showKey ? (
            <div className="space-y-4">
              <Input
                label="Valor (Opcional)"
                type="text"
                value={amount}
                onChange={(e) => setAmount(formatCurrency(e.target.value))}
                placeholder="0.00"
                prefix="R$"
              />
              <p className="text-sm text-gray-500">
                Deixe em branco para permitir que o pagador escolha o valor
              </p>

              <Button
                onClick={handleGenerate}
                fullWidth
              >
                Gerar Chave PIX
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Sua Chave PIX
                </h3>
                {amount && (
                  <p className="text-gray-600 mb-4">
                    Valor: {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(parseFloat(amount))}
                  </p>
                )}
              </div>

              <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600 mb-2">Tipo de Chave</p>
                  <p className="text-lg font-bold text-primary-600">CPF</p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Chave PIX</p>
                  <p className="text-2xl font-bold text-gray-800 text-center">
                    {formatCPF(user?.cpf)}
                  </p>
                </div>

                <button
                  onClick={handleCopyKey}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <FiCopy />
                  {copied ? 'Copiado!' : 'Copiar Chave'}
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Dica:</strong> Compartilhe sua chave PIX (CPF) com quem vai pagar você. 
                  Eles podem usar qualquer app que aceite PIX para fazer a transferência.
                </p>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-gray-800">Dados do Recebedor:</p>
                <p className="text-sm text-gray-600">Nome: {user?.full_name}</p>
                <p className="text-sm text-gray-600">CPF: {formatCPF(user?.cpf)}</p>
              </div>

              <Button
                onClick={() => {
                  setShowKey(false);
                  setAmount('');
                }}
                variant="secondary"
                fullWidth
              >
                Gerar Novo
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default QrCode;
