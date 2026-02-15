import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { adminGetStats, adminGetTransactions, adminGetKYCs } from '../../services/transactions';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { FiUsers, FiDollarSign, FiTrendingUp } from 'react-icons/fi';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total_users: 0,
    total_transactions: 0,
    total_volume: 0,
    pending_kycs: 0,
    pending_transactions: 0
  });
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [pendingKYCs, setPendingKYCs] = useState([]);

  useEffect(() => {
    if (!user?.is_admin) {
      navigate('/');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsData, transactionsData, kycsData] = await Promise.all([
        adminGetStats(),
        adminGetTransactions({ status: 'pending', limit: 5 }),
        adminGetKYCs({ status: 'pending', limit: 5 })
      ]);
      setStats(statsData);
      setPendingTransactions(transactionsData.transactions || []);
      setPendingKYCs(kycsData.kycs || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

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
      className="min-h-screen bg-gray-50 p-6"
    >
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Total de Usuários</p>
                <h2 className="text-3xl font-bold text-gray-800">{stats.total_users}</h2>
              </div>
              <div className="bg-blue-100 p-4 rounded-full">
                <FiUsers className="text-blue-600 text-2xl" />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Total de Transações</p>
                <h2 className="text-3xl font-bold text-gray-800">{stats.total_transactions}</h2>
              </div>
              <div className="bg-green-100 p-4 rounded-full">
                <FiTrendingUp className="text-green-600 text-2xl" />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Volume Total</p>
                <h2 className="text-2xl font-bold text-gray-800">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(stats.total_volume)}
                </h2>
              </div>
              <div className="bg-purple-100 p-4 rounded-full">
                <FiDollarSign className="text-purple-600 text-2xl" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card title="Visão Geral">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">KYCs Pendentes</span>
                  <span className="text-sm font-bold text-gray-800">{stats.pending_kycs}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-yellow-500 h-3 rounded-full"
                    style={{ width: `${Math.min((stats.pending_kycs / stats.total_users) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Transações Pendentes</span>
                  <span className="text-sm font-bold text-gray-800">{stats.pending_transactions}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full"
                    style={{ width: `${Math.min((stats.pending_transactions / (stats.total_transactions || 1)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Distribuição de Transações">
            <div className="flex items-end justify-around h-40 border-l border-b border-gray-300 pl-2 pb-2">
              <div className="text-center">
                <div 
                  className="bg-green-500 w-16 rounded-t-lg mx-auto"
                  style={{ height: `${Math.min((stats.total_transactions * 0.4 / (stats.total_transactions || 1)) * 100, 100)}%` }}
                ></div>
                <p className="text-xs text-gray-600 mt-2">Depósitos</p>
              </div>
              <div className="text-center">
                <div 
                  className="bg-red-500 w-16 rounded-t-lg mx-auto"
                  style={{ height: `${Math.min((stats.total_transactions * 0.3 / (stats.total_transactions || 1)) * 100, 100)}%` }}
                ></div>
                <p className="text-xs text-gray-600 mt-2">Saques</p>
              </div>
              <div className="text-center">
                <div 
                  className="bg-blue-500 w-16 rounded-t-lg mx-auto"
                  style={{ height: `${Math.min((stats.total_transactions * 0.3 / (stats.total_transactions || 1)) * 100, 100)}%` }}
                ></div>
                <p className="text-xs text-gray-600 mt-2">PIX</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Transações Pendentes Recentes">
            {pendingTransactions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhuma transação pendente</p>
            ) : (
              <div className="space-y-3">
                {pendingTransactions.map((tx) => (
                  <div key={tx.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-800">{tx.type}</p>
                      <p className="text-sm text-gray-600">{tx.user_email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(tx.amount)}
                      </p>
                      <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4">
              <Button variant="secondary" onClick={() => navigate('/admin/transactions')}>
                Ver Todas
              </Button>
            </div>
          </Card>

          <Card title="KYCs Pendentes Recentes">
            {pendingKYCs.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhum KYC pendente</p>
            ) : (
              <div className="space-y-3">
                {pendingKYCs.map((kyc) => (
                  <div key={kyc.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-800">{kyc.user_name}</p>
                      <p className="text-sm text-gray-600">{kyc.user_email}</p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                      Pendente
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4">
              <Button variant="secondary" onClick={() => navigate('/admin/kyc')}>
                Ver Todos
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
