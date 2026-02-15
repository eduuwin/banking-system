import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { adminGetGatewayConfig, adminUpdateGatewayConfig } from '../../services/transactions';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { FiCheck, FiAlertCircle } from 'react-icons/fi';

const AdminGateway = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [config, setConfig] = useState(null);
  const [formData, setFormData] = useState({
    api_key: '',
    api_secret: '',
    webhook_url: '',
    is_active: true,
    environment: 'sandbox'
  });

  useEffect(() => {
    if (!user?.is_admin) {
      navigate('/');
      return;
    }
    fetchConfig();
  }, [user, navigate]);

  const fetchConfig = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminGetGatewayConfig();
      if (data && data.id) {
        setConfig(data);
        setFormData({
          api_key: data.api_key || '',
          api_secret: data.api_secret || '',
          webhook_url: data.webhook_url || '',
          is_active: data.is_active ?? true,
          environment: data.environment || 'sandbox'
        });
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Configuração do gateway não encontrada. Configure abaixo.');
      } else {
        setError(err.response?.data?.detail || 'Erro ao carregar configuração');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.api_key || !formData.webhook_url) {
      setError('API Key e Webhook URL são obrigatórios');
      return;
    }

    try {
      if (config?.id) {
        await adminUpdateGatewayConfig(config.id, formData);
        setSuccess('Configuração atualizada com sucesso!');
      } else {
        setError('ID do gateway não encontrado. Não é possível atualizar.');
      }
      fetchConfig();
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao atualizar configuração');
    }
  };

  const handleTestConnection = () => {
    alert('Teste de conexão: Esta funcionalidade será implementada em breve.\n\nVerificando:\n- API Key válida\n- Conectividade com gateway\n- Webhook configurado');
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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Configuração do Gateway</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
            <FiAlertCircle className="mr-2" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
            <FiCheck className="mr-2" />
            {success}
          </div>
        )}

        {/* Current Configuration Overview */}
        {config && (
          <Card title="Configuração Atual" className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold ${
                  formData.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {formData.is_active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ambiente</p>
                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold ${
                  formData.environment === 'production' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {formData.environment === 'production' ? 'Produção' : 'Sandbox'}
                </span>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Última Atualização</p>
                <p className="text-sm font-semibold text-gray-800">
                  {config.updated_at ? new Date(config.updated_at).toLocaleString('pt-BR') : 'N/A'}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Configuration Form */}
        <Card title="Editar Configuração">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="API Key"
              name="api_key"
              value={formData.api_key}
              onChange={handleChange}
              placeholder="sua-api-key-aqui"
              required
            />

            <Input
              label="API Secret"
              name="api_secret"
              type="password"
              value={formData.api_secret}
              onChange={handleChange}
              placeholder="seu-api-secret-aqui"
            />

            <Input
              label="Webhook URL"
              name="webhook_url"
              value={formData.webhook_url}
              onChange={handleChange}
              placeholder="https://seu-dominio.com/webhook"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ambiente
              </label>
              <select
                name="environment"
                value={formData.environment}
                onChange={handleChange}
                className="input"
              >
                <option value="sandbox">Sandbox (Teste)</option>
                <option value="production">Produção</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {formData.environment === 'production' 
                  ? '⚠️ Modo produção: transações reais serão processadas'
                  : 'Modo sandbox: transações de teste apenas'}
              </p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                Gateway Ativo
              </label>
            </div>

            <div className="flex gap-4">
              <Button type="submit" variant="primary">
                Salvar Configuração
              </Button>
              <Button type="button" variant="secondary" onClick={handleTestConnection}>
                Testar Conexão
              </Button>
            </div>
          </form>
        </Card>

        {/* Information Card */}
        <Card title="Informações Importantes" className="mt-6">
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start">
              <FiAlertCircle className="mr-2 mt-1 flex-shrink-0 text-yellow-600" />
              <p>
                <strong>API Key e Secret:</strong> Credenciais fornecidas pelo provedor do gateway. 
                Mantenha-as seguras e não compartilhe.
              </p>
            </div>
            <div className="flex items-start">
              <FiAlertCircle className="mr-2 mt-1 flex-shrink-0 text-yellow-600" />
              <p>
                <strong>Webhook URL:</strong> Endpoint que receberá notificações do gateway sobre 
                atualizações de transações. Deve ser acessível publicamente.
              </p>
            </div>
            <div className="flex items-start">
              <FiAlertCircle className="mr-2 mt-1 flex-shrink-0 text-red-600" />
              <p>
                <strong>Ambiente:</strong> Use Sandbox para testes. Produção processará transações reais. 
                Certifique-se de que tudo está funcionando antes de mudar para produção.
              </p>
            </div>
            <div className="flex items-start">
              <FiCheck className="mr-2 mt-1 flex-shrink-0 text-green-600" />
              <p>
                <strong>Status Ativo:</strong> Quando inativo, nenhuma transação será processada 
                através do gateway.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default AdminGateway;
