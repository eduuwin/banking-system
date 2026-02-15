import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { getBalance } from '../services/auth';
import { getTransactions } from '../services/transactions';
import Button from '../components/Button';
import TransactionItem from '../components/TransactionItem';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [balanceData, transactionsData] = await Promise.all([
        getBalance(),
        getTransactions({ limit: 5 })
      ]);
      setBalance(balanceData.balance);
      setTransactions(transactionsData.transactions || []);
    } catch (err) {
      setError('Erro ao carregar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getKycStatusBadge = () => {
    if (!user) return null;

    const statusConfig = {
      pending: { text: 'KYC Pendente', color: 'bg-yellow-100 text-yellow-800' },
      approved: { text: 'KYC Aprovado', color: 'bg-green-100 text-green-800' },
      rejected: { text: 'KYC Rejeitado', color: 'bg-red-100 text-red-800' },
      none: { text: 'KYC Não Enviado', color: 'bg-gray-100 text-gray-800' }
    };

    const status = user.kyc_status || 'none';
    const config = statusConfig[status];

    return (
      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const quickActions = [
    { icon: FiArrowDownCircle, label: 'Depositar', path: '/deposit', color: 'bg-green-500' },
    { icon: FiArrowUpCircle, label: 'Sacar', path: '/withdraw', color: 'bg-red-500' },
    { icon: FiSend, label: 'Enviar PIX', path: '/pix', color: 'bg-blue-500' },
    { icon: FiMaximize2, label: 'Gerar QR Code', path: '/qrcode', color: 'bg-purple-500' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-gray-50 pb-20"
    >
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white px-6 pt-8 pb-24 rounded-b-3xl">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-primary-100 mb-1">Olá,</p>
              <h1 className="text-2xl font-bold">{user?.full_name}</h1>
            </div>
            {getKycStatusBadge()}
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            <p className="text-primary-100 text-sm mb-2">Saldo disponível</p>
            <h2 className="text-4xl font-bold">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(balance)}
            </h2>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-16">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.path}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white rounded-xl p-4 shadow-md text-center"
              >
                <div className={`${action.color} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2`}>
                  <action.icon className="text-white text-xl" />
                </div>
                <p className="text-sm font-semibold text-gray-700">{action.label}</p>
              </motion.div>
            </Link>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">Transações Recentes</h3>
            <Link to="/history" className="text-primary-600 text-sm font-semibold hover:text-primary-700">
              Ver todas
            </Link>
          </div>

          {transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhuma transação ainda</p>
          ) : (
            <div className="space-y-2">
              {transactions.map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Home;
