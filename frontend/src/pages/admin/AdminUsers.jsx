import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { adminGetUsers, adminGetUser, adminUpdateUser } from '../../services/transactions';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';

const AdminUsers = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    kyc_status: '',
    is_active: ''
  });

  useEffect(() => {
    if (!user?.is_admin) {
      navigate('/');
      return;
    }
    fetchUsers();
  }, [user, navigate, currentPage, filters]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: currentPage,
        limit: 10,
        ...filters
      };
      const data = await adminGetUsers(params);
      setUsers(data.users || []);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = async (userId) => {
    try {
      const userData = await adminGetUser(userId);
      setSelectedUser(userData);
      setShowModal(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao carregar usuário');
    }
  };

  const handleToggleActive = async (userId, currentStatus) => {
    if (!window.confirm(`Deseja ${currentStatus ? 'desativar' : 'ativar'} este usuário?`)) {
      return;
    }
    try {
      await adminUpdateUser(userId, { is_active: !currentStatus });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao atualizar usuário');
    }
  };

  const handleAdjustBalance = async () => {
    if (!balanceAmount || isNaN(balanceAmount)) {
      alert('Digite um valor válido');
      return;
    }
    try {
      await adminUpdateUser(selectedUser.id, { balance: parseFloat(balanceAmount) });
      setShowBalanceModal(false);
      setBalanceAmount('');
      fetchUsers();
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao ajustar saldo');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const getKycBadgeColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading && users.length === 0) {
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
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Gerenciamento de Usuários</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Buscar"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Email, CPF ou nome..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status KYC
                </label>
                <select
                  name="kyc_status"
                  value={filters.kyc_status}
                  onChange={handleFilterChange}
                  className="input"
                >
                  <option value="">Todos</option>
                  <option value="pending">Pendente</option>
                  <option value="approved">Aprovado</option>
                  <option value="rejected">Rejeitado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="is_active"
                  value={filters.is_active}
                  onChange={handleFilterChange}
                  className="input"
                >
                  <option value="">Todos</option>
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </select>
              </div>
            </div>
            <Button type="submit" variant="primary">
              <FiSearch className="inline mr-2" />
              Buscar
            </Button>
          </form>
        </Card>

        {/* Users Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nome</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">CPF</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Saldo</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">KYC</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((userItem) => (
                  <tr key={userItem.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-800">{userItem.full_name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{userItem.email}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{userItem.cpf}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-800">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(userItem.balance || 0)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${getKycBadgeColor(userItem.kyc_status)}`}>
                        {userItem.kyc_status || 'none'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${userItem.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {userItem.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => handleViewUser(userItem.id)}
                          className="text-xs py-1 px-2"
                        >
                          Ver
                        </Button>
                        <Button
                          variant={userItem.is_active ? 'danger' : 'primary'}
                          onClick={() => handleToggleActive(userItem.id, userItem.is_active)}
                          className="text-xs py-1 px-2"
                        >
                          {userItem.is_active ? 'Desativar' : 'Ativar'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && (
              <p className="text-center text-gray-500 py-8">Nenhum usuário encontrado</p>
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

      {/* User Details Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Detalhes do Usuário"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Nome Completo</p>
              <p className="text-lg font-semibold text-gray-800">{selectedUser.full_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-lg font-semibold text-gray-800">{selectedUser.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">CPF</p>
              <p className="text-lg font-semibold text-gray-800">{selectedUser.cpf}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Saldo Atual</p>
              <p className="text-lg font-semibold text-gray-800">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(selectedUser.balance || 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status KYC</p>
              <span className={`inline-block text-sm px-3 py-1 rounded-full ${getKycBadgeColor(selectedUser.kyc_status)}`}>
                {selectedUser.kyc_status || 'none'}
              </span>
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                variant="primary"
                onClick={() => {
                  setShowBalanceModal(true);
                  setShowModal(false);
                }}
              >
                Ajustar Saldo
              </Button>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Fechar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Balance Adjustment Modal */}
      <Modal
        isOpen={showBalanceModal}
        onClose={() => setShowBalanceModal(false)}
        title="Ajustar Saldo"
      >
        <div className="space-y-4">
          <Input
            label="Novo Saldo"
            type="number"
            step="0.01"
            value={balanceAmount}
            onChange={(e) => setBalanceAmount(e.target.value)}
            placeholder="0.00"
          />
          <div className="flex gap-2">
            <Button variant="primary" onClick={handleAdjustBalance}>
              Confirmar
            </Button>
            <Button variant="secondary" onClick={() => setShowBalanceModal(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default AdminUsers;
