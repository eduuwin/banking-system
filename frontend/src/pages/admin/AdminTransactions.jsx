import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { adminGetTransactions, adminCancelTransaction } from '../../services/transactions';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import { FiSearch, FiChevronLeft, FiChevronRight, FiDownload, FiX } from 'react-icons/fi';

const AdminTransactions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: '',
    user_email: ''
  });

  useEffect(() => {
    if (!user?.is_admin) {
      navigate('/');
      return;
    }
    fetchTransactions();
  }, [user, navigate, currentPage, filters]);

  const fetchTransactions = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: currentPage,
        limit: 15,
        ...filters
      };
      const data = await adminGetTransactions(params);
      setTransactions(data.transactions || []);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao carregar transações');
    } finally {
      setLoading(false);
    }
  };

  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setShowModal(true);
  };

  const handleCancelTransaction = async (transactionId) => {
    if (!window.confirm('Deseja cancelar esta transação?')) {
      return;
    }
    try {
      await adminCancelTransaction(transactionId);
      setShowModal(false);
      fetchTransactions();
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao cancelar transação');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTransactions();
  };

  const handleExport = () => {
    alert('Funcionalidade de exportação será implementada em breve');
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeLabel = (type) => {
    const labels = {
      deposit: 'Depósito',
      withdrawal: 'Saque',
      pix: 'PIX',
      transfer: 'Transferência'
    };
    return labels[type] || type;
  };

  if (loading && transactions.length === 0) {
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Gerenciamento de Transações</h1>
          <Button variant="secondary" onClick={handleExport}>
            <FiDownload className="inline mr-2" />
            Exportar
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Buscar"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="ID ou email do usuário..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo
                </label>
                <select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  className="input"
                >
                  <option value="">Todos</option>
                  <option value="deposit">Depósito</option>
                  <option value="withdrawal">Saque</option>
                  <option value="pix">PIX</option>
                  <option value="transfer">Transferência</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="input"
                >
                  <option value="">Todos</option>
                  <option value="pending">Pendente</option>
                  <option value="completed">Completo</option>
                  <option value="failed">Falhou</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
              <div>
                <Input
                  label="Email"
                  name="user_email"
                  value={filters.user_email}
                  onChange={handleFilterChange}
                  placeholder="Email..."
                />
              </div>
            </div>
            <Button type="submit" variant="primary">
              <FiSearch className="inline mr-2" />
              Buscar
            </Button>
          </form>
        </Card>

        {/* Transactions Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Usuário</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tipo</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Valor</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Data</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-mono text-gray-600">
                      {tx.id?.substring(0, 8) || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800">{tx.user_email}</td>
                    <td className="py-3 px-4 text-sm text-gray-800">{getTypeLabel(tx.type)}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-800">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(tx.amount)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(tx.status)}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(tx.created_at).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="secondary"
                        onClick={() => handleViewTransaction(tx)}
                        className="text-xs py-1 px-2"
                      >
                        Ver
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {transactions.length === 0 && (
              <p className="text-center text-gray-500 py-8">Nenhuma transação encontrada</p>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <Button
                variant="secondary"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <FiChevronLeft />
              </Button>
              <span className="text-sm text-gray-600">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="secondary"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <FiChevronRight />
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Transaction Details Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Detalhes da Transação"
      >
        {selectedTransaction && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">ID</p>
                <p className="text-sm font-mono font-semibold text-gray-800">{selectedTransaction.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`inline-block text-xs px-2 py-1 rounded-full ${getStatusColor(selectedTransaction.status)}`}>
                  {selectedTransaction.status}
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600">Tipo</p>
              <p className="text-lg font-semibold text-gray-800">{getTypeLabel(selectedTransaction.type)}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Usuário</p>
              <p className="text-lg font-semibold text-gray-800">{selectedTransaction.user_email}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Valor</p>
              <p className="text-2xl font-bold text-gray-800">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(selectedTransaction.amount)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Data</p>
              <p className="text-lg font-semibold text-gray-800">
                {new Date(selectedTransaction.created_at).toLocaleString('pt-BR')}
              </p>
            </div>

            {selectedTransaction.gateway_transaction_id && (
              <div>
                <p className="text-sm text-gray-600">ID Gateway</p>
                <p className="text-sm font-mono text-gray-800">{selectedTransaction.gateway_transaction_id}</p>
              </div>
            )}

            {selectedTransaction.metadata && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Metadados</p>
                <pre className="text-xs bg-gray-100 p-3 rounded-lg overflow-auto">
                  {JSON.stringify(selectedTransaction.metadata, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              {selectedTransaction.status === 'pending' && (
                <Button
                  variant="danger"
                  onClick={() => handleCancelTransaction(selectedTransaction.id)}
                >
                  <FiX className="inline mr-1" />
                  Cancelar Transação
                </Button>
              )}
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Fechar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default AdminTransactions;
