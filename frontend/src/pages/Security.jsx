import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { changePassword } from '../services/user';
import Button from '../components/Button';
import Input from '../components/Input';
import { FiArrowLeft, FiLock, FiShield, FiCheck } from 'react-icons/fi';

const Security = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    calculatePasswordStrength(formData.new_password);
  }, [formData.new_password]);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 10) strength += 1;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[^a-zA-Z\d]/.test(password)) strength += 1;
    setPasswordStrength(strength);
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength === 0) return { text: '', color: '' };
    if (passwordStrength <= 2) return { text: 'Fraca', color: 'text-red-600' };
    if (passwordStrength <= 3) return { text: 'Média', color: 'text-yellow-600' };
    return { text: 'Forte', color: 'text-green-600' };
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.new_password.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      setError('As senhas não correspondem');
      return;
    }

    if (formData.old_password === formData.new_password) {
      setError('A nova senha deve ser diferente da senha atual');
      return;
    }

    setLoading(true);
    try {
      await changePassword({
        old_password: formData.old_password,
        new_password: formData.new_password
      });
      setSuccess('Senha alterada com sucesso!');
      setFormData({
        old_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao alterar senha. Verifique sua senha atual.');
    } finally {
      setLoading(false);
    }
  };

  const strengthLabel = getPasswordStrengthLabel();

  const securityTips = [
    'Use uma senha forte com letras, números e símbolos',
    'Nunca compartilhe sua senha com ninguém',
    'Altere sua senha regularmente',
    'Não use a mesma senha em múltiplas contas'
  ];

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
            onClick={() => navigate('/profile')}
            className="flex items-center text-white mb-4 hover:text-primary-100"
          >
            <FiArrowLeft className="mr-2" /> Voltar
          </button>
          <div className="flex items-center gap-3">
            <FiShield className="text-4xl" />
            <div>
              <h1 className="text-3xl font-bold">Segurança</h1>
              <p className="text-primary-100 mt-1">Proteja sua conta</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 -mt-8">
        <div className="bg-white rounded-xl shadow-md p-6 mb-4">
          <div className="flex items-center gap-3 mb-6">
            <FiLock className="text-primary-600 text-2xl" />
            <h3 className="font-bold text-gray-800 text-lg">Alterar Senha</h3>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center gap-2">
              <FiCheck />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Senha Atual"
              type="password"
              name="old_password"
              value={formData.old_password}
              onChange={handleChange}
              placeholder="Digite sua senha atual"
              required
              icon={<FiLock />}
            />

            <Input
              label="Nova Senha"
              type="password"
              name="new_password"
              value={formData.new_password}
              onChange={handleChange}
              placeholder="Digite sua nova senha"
              required
              icon={<FiLock />}
            />

            {formData.new_password && (
              <div className="space-y-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`h-2 flex-1 rounded-full transition-colors ${
                        level <= passwordStrength
                          ? passwordStrength <= 2
                            ? 'bg-red-500'
                            : passwordStrength <= 3
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                {strengthLabel.text && (
                  <p className={`text-sm font-semibold ${strengthLabel.color}`}>
                    Força da senha: {strengthLabel.text}
                  </p>
                )}
              </div>
            )}

            <Input
              label="Confirmar Nova Senha"
              type="password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              placeholder="Digite novamente sua nova senha"
              required
              icon={<FiLock />}
            />

            <Button
              type="submit"
              fullWidth
              loading={loading}
              disabled={loading}
            >
              Alterar Senha
            </Button>
          </form>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl shadow-md p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FiShield className="text-blue-600" />
            Dicas de Segurança
          </h3>
          <ul className="space-y-2">
            {securityTips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <FiCheck className="text-green-600 mt-0.5 flex-shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default Security;
