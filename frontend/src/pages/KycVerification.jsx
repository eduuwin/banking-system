import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { submitKyc, getKycStatus } from '../services/kyc';
import Button from '../components/Button';
import Input from '../components/Input';
import { FiArrowLeft, FiUpload, FiCheckCircle, FiAlertCircle, FiClock } from 'react-icons/fi';

const KycVerification = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    document_type: 'RG',
    full_name: '',
    cpf: '',
    birth_date: '',
    document_front: '',
    document_back: '',
    selfie: ''
  });
  const [kycStatus, setKycStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setFormData({
      ...formData,
      full_name: user.full_name || '',
      cpf: user.cpf || ''
    });
    fetchKycStatus();
  }, [user, navigate]);

  const fetchKycStatus = async () => {
    try {
      const status = await getKycStatus();
      setKycStatus(status);
    } catch (err) {
      console.error('Erro ao buscar status KYC:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = async (e, field) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Arquivo muito grande. Tamanho máximo: 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          [field]: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.document_front || !formData.document_back || !formData.selfie) {
      setError('Por favor, envie todos os documentos necessários');
      return;
    }

    setLoading(true);
    try {
      await submitKyc(formData);
      setSuccess('KYC enviado com sucesso! Aguarde a análise.');
      const updatedUser = { ...user, kyc_status: 'pending' };
      setUser(updatedUser);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao enviar KYC. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = () => {
    if (!user?.kyc_status || user.kyc_status === 'none') {
      return {
        icon: FiAlertCircle,
        color: 'text-gray-500',
        bgColor: 'bg-gray-100',
        text: 'KYC não enviado',
        description: 'Complete sua verificação para acessar todos os recursos'
      };
    }

    const statusMap = {
      pending: {
        icon: FiClock,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        text: 'KYC em análise',
        description: 'Seus documentos estão sendo verificados. Isso pode levar até 24 horas.'
      },
      approved: {
        icon: FiCheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        text: 'KYC aprovado',
        description: 'Sua conta está totalmente verificada!'
      },
      rejected: {
        icon: FiAlertCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        text: 'KYC rejeitado',
        description: 'Por favor, reenvie seus documentos com informações corretas.'
      }
    };

    return statusMap[user.kyc_status];
  };

  const statusDisplay = getStatusDisplay();

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
          <h1 className="text-3xl font-bold">Verificação KYC</h1>
          <p className="text-primary-100 mt-2">Verifique sua identidade</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 -mt-8">
        <div className={`${statusDisplay.bgColor} rounded-xl shadow-md p-6 mb-4`}>
          <div className="flex items-center gap-4">
            <statusDisplay.icon className={`text-4xl ${statusDisplay.color}`} />
            <div>
              <h3 className={`font-bold text-lg ${statusDisplay.color}`}>
                {statusDisplay.text}
              </h3>
              <p className="text-sm text-gray-700">{statusDisplay.description}</p>
            </div>
          </div>
        </div>

        {user?.kyc_status === 'approved' ? (
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <FiCheckCircle className="text-green-600 text-6xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Verificação Completa</h2>
            <p className="text-gray-600 mb-6">
              Sua conta está totalmente verificada. Você tem acesso a todos os recursos!
            </p>
            <Button onClick={() => navigate('/')} fullWidth>
              Voltar ao Início
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-6">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Documento
                </label>
                <select
                  name="document_type"
                  value={formData.document_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="RG">RG</option>
                  <option value="CNH">CNH</option>
                </select>
              </div>

              <Input
                label="Nome Completo"
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Seu nome completo"
                required
              />

              <Input
                label="CPF"
                type="text"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                placeholder="000.000.000-00"
                disabled
              />

              <Input
                label="Data de Nascimento"
                type="date"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleChange}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Documento (Frente)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'document_front')}
                    className="hidden"
                    id="document_front"
                    required={!formData.document_front}
                  />
                  <label
                    htmlFor="document_front"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors"
                  >
                    <FiUpload />
                    {formData.document_front ? 'Arquivo carregado' : 'Clique para enviar'}
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Documento (Verso)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'document_back')}
                    className="hidden"
                    id="document_back"
                    required={!formData.document_back}
                  />
                  <label
                    htmlFor="document_back"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors"
                  >
                    <FiUpload />
                    {formData.document_back ? 'Arquivo carregado' : 'Clique para enviar'}
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selfie com Documento
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'selfie')}
                    className="hidden"
                    id="selfie"
                    required={!formData.selfie}
                  />
                  <label
                    htmlFor="selfie"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors"
                  >
                    <FiUpload />
                    {formData.selfie ? 'Arquivo carregado' : 'Clique para enviar'}
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Tire uma foto segurando seu documento ao lado do rosto
                </p>
              </div>

              <Button
                type="submit"
                fullWidth
                loading={loading}
                disabled={loading || user?.kyc_status === 'pending'}
              >
                {user?.kyc_status === 'pending' ? 'KYC em Análise' : 'Enviar para Verificação'}
              </Button>
            </form>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default KycVerification;
