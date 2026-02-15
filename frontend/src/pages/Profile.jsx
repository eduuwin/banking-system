import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from '../services/user';
import Button from '../components/Button';
import Input from '../components/Input';
import { FiArrowLeft, FiUser, FiMail, FiPhone, FiCreditCard } from 'react-icons/fi';

const Profile = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setFormData({
      full_name: user.full_name || '',
      phone: user.phone || ''
    });
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const formatPhone = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const formatCPF = (cpf) => {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const updatedUser = await updateProfile(formData);
      setUser(updatedUser);
      setSuccess('Perfil atualizado com sucesso!');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao atualizar perfil. Tente novamente.');
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
            <FiArrowLeft className="mr-2" /> Voltar
          </button>
          <h1 className="text-3xl font-bold">Meu Perfil</h1>
          <p className="text-primary-100 mt-2">Gerencie suas informações pessoais</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 -mt-8">
        <div className="bg-white rounded-xl shadow-md p-6 mb-4">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-primary-100 rounded-full w-20 h-20 flex items-center justify-center">
              <FiUser className="text-primary-600 text-3xl" />
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FiMail className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium text-gray-800">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FiCreditCard className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">CPF</p>
                <p className="font-medium text-gray-800">{formatCPF(user?.cpf)}</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nome Completo"
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Seu nome completo"
              required
              icon={<FiUser />}
            />

            <Input
              label="Telefone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={(e) => handleChange({ target: { name: 'phone', value: formatPhone(e.target.value) } })}
              placeholder="(00) 00000-0000"
              maxLength={15}
              required
              icon={<FiPhone />}
            />

            <Button
              type="submit"
              fullWidth
              loading={loading}
              disabled={loading}
            >
              Atualizar Perfil
            </Button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="font-bold text-gray-800 mb-4">Configurações de Conta</h3>
          <div className="space-y-2">
            <button
              onClick={() => navigate('/security')}
              className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <p className="font-semibold text-gray-800">Segurança</p>
              <p className="text-sm text-gray-500">Alterar senha e configurações de segurança</p>
            </button>
            <button
              onClick={() => navigate('/kyc')}
              className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <p className="font-semibold text-gray-800">Verificação KYC</p>
              <p className="text-sm text-gray-500">Status: {user?.kyc_status || 'Não enviado'}</p>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
