import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { adminGetGatewayLogs } from '../../services/transactions';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import { FiSearch, FiChevronLeft, FiChevronRight, FiEye } from 'react-icons/fi';

const AdminLogs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: '',
    date_from: '',
    date_to: ''
  });

  useEffect(() => {
    if (!user?.is_admin) {
      navigate('/');
      return;
    }
    fetchLogs();
  }, [user, navigate, currentPage, filters]);

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: currentPage,
        limit: 20,
        ...filters
      };
      const data = await adminGetGatewayLogs(params);
      setLogs(data.logs || []);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao carregar logs');
    } finally {
      setLoading(false);
    }
  };

  const handleViewLog = (log) => {
    setSelectedLog(log);
    setShowModal(true);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  const getStatusColor = (status) => {
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      pending: 'bg-yellow-500',
      processing: 'bg-blue-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusTextColor = (status) => {
    const colors = {
      success: 'text-green-700',
      error: 'text-red-700',
      pending: 'text-yellow-700',
      processing: 'text-blue-700'
    };
    return colors[status] || 'text-gray-700';
  };

  const formatJSON = (json) => {
    try {
      if (typeof json === 'string') {
        return JSON.stringify(JSON.parse(json), null, 2);
      }
      return JSON.stringify(json, null, 2);
    } catch {
      return json;
    }
  };

  if (loading && logs.length === 0) {
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
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Logs do Gateway</h1>

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
                  placeholder="Transaction ID ou Gateway ID..."
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
                  <option value="webhook">Webhook</option>
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
                  <option value="success">Sucesso</option>
                  <option value="error">Erro</option>
                  <option value="pending">Pendente</option>
                  <option value="processing">Processando</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Data Inicial"
                type="date"
                name="date_from"
                value={filters.date_from}
                onChange={handleFilterChange}
              />
              <Input
                label="Data Final"
                type="date"
                name="date_to"
                value={filters.date_to}
                onChange={handleFilterChange}
              />
            </div>

            <Button type="submit" variant="primary">
              <FiSearch className="inline mr-2" />
              Buscar
            </Button>
          </form>
        </Card>

        {/* Logs Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tipo</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Transaction ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Gateway ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Mensagem</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Data</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(log.status)} mr-2`}></div>
                        <span className={`text-xs font-semibold ${getStatusTextColor(log.status)}`}>
                          {log.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800">{log.type || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm font-mono text-gray-600">
                      {log.transaction_id?.substring(0, 8) || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-sm font-mono text-gray-600">
                      {log.gateway_transaction_id?.substring(0, 12) || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">
                      {log.message || log.error_message || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(log.created_at).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="secondary"
                        onClick={() => handleViewLog(log)}
                        className="text-xs py-1 px-2"
                      >
                        <FiEye className="inline mr-1" />
                        Ver
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {logs.length === 0 && (
              <p className="text-center text-gray-500 py-8">Nenhum log encontrado</p>
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

      {/* Log Details Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Detalhes do Log"
      >
        {selectedLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <div className="flex items-center mt-1">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(selectedLog.status)} mr-2`}></div>
                  <span className={`text-sm font-semibold ${getStatusTextColor(selectedLog.status)}`}>
                    {selectedLog.status}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tipo</p>
                <p className="text-sm font-semibold text-gray-800">{selectedLog.type || 'N/A'}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600">Transaction ID</p>
              <p className="text-sm font-mono text-gray-800">{selectedLog.transaction_id || 'N/A'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Gateway Transaction ID</p>
              <p className="text-sm font-mono text-gray-800">{selectedLog.gateway_transaction_id || 'N/A'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Mensagem</p>
              <p className="text-sm text-gray-800">{selectedLog.message || selectedLog.error_message || 'N/A'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Data/Hora</p>
              <p className="text-sm font-semibold text-gray-800">
                {new Date(selectedLog.created_at).toLocaleString('pt-BR')}
              </p>
            </div>

            {selectedLog.request_data && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Request Data</p>
                <pre className="text-xs bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto max-h-60 font-mono">
                  {formatJSON(selectedLog.request_data)}
                </pre>
              </div>
            )}

            {selectedLog.response_data && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Response Data</p>
                <pre className="text-xs bg-gray-900 text-blue-400 p-4 rounded-lg overflow-auto max-h-60 font-mono">
                  {formatJSON(selectedLog.response_data)}
                </pre>
              </div>
            )}

            {selectedLog.error_details && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Error Details</p>
                <pre className="text-xs bg-red-50 text-red-800 p-4 rounded-lg overflow-auto max-h-40 font-mono border border-red-200">
                  {formatJSON(selectedLog.error_details)}
                </pre>
              </div>
            )}

            <div className="pt-4">
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

export default AdminLogs;
