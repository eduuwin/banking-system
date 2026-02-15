import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { adminGetKYCs, adminApproveKYC, adminRejectKYC } from '../../services/transactions';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { FiCheck, FiX, FiImage } from 'react-icons/fi';

const AdminKyc = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [kycs, setKycs] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedKyc, setSelectedKyc] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    if (!user?.is_admin) {
      navigate('/');
      return;
    }
    fetchKYCs();
  }, [user, navigate, activeTab]);

  const fetchKYCs = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminGetKYCs({ status: activeTab });
      setKycs(data.kycs || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao carregar KYCs');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (kycId) => {
    if (!window.confirm('Deseja aprovar este KYC?')) {
      return;
    }
    try {
      await adminApproveKYC(kycId);
      fetchKYCs();
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao aprovar KYC');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Digite um motivo para a rejeição');
      return;
    }
    try {
      await adminRejectKYC(selectedKyc.id, rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedKyc(null);
      fetchKYCs();
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao rejeitar KYC');
    }
  };

  const openRejectModal = (kyc) => {
    setSelectedKyc(kyc);
    setShowRejectModal(true);
  };

  const viewImage = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  const tabs = [
    { id: 'pending', label: 'Pendentes', color: 'text-yellow-600 border-yellow-600' },
    { id: 'approved', label: 'Aprovados', color: 'text-green-600 border-green-600' },
    { id: 'rejected', label: 'Rejeitados', color: 'text-red-600 border-red-600' }
  ];

  if (loading && kycs.length === 0) {
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
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Gerenciamento de KYC</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-4 font-semibold border-b-2 transition-colors ${
                activeTab === tab.id
                  ? tab.color
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* KYC Cards */}
        {kycs.length === 0 ? (
          <Card>
            <p className="text-center text-gray-500 py-8">Nenhum KYC {activeTab === 'pending' ? 'pendente' : activeTab === 'approved' ? 'aprovado' : 'rejeitado'}</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kycs.map((kyc) => (
              <motion.div
                key={kyc.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div className="p-6">
                  {/* User Info */}
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">{kyc.user_name}</h3>
                    <p className="text-sm text-gray-600">{kyc.user_email}</p>
                    <p className="text-sm text-gray-600">CPF: {kyc.user_cpf}</p>
                  </div>

                  {/* Document Images */}
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Documentos:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {kyc.document_front_url && (
                        <div
                          onClick={() => viewImage(kyc.document_front_url)}
                          className="relative aspect-video bg-gray-200 rounded-lg cursor-pointer hover:opacity-80 transition-opacity overflow-hidden"
                        >
                          <img
                            src={kyc.document_front_url}
                            alt="Documento Frente"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = '<div class="flex items-center justify-center h-full"><FiImage class="text-gray-400 text-2xl" /></div>';
                            }}
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center">
                            Frente
                          </div>
                        </div>
                      )}
                      {kyc.document_back_url && (
                        <div
                          onClick={() => viewImage(kyc.document_back_url)}
                          className="relative aspect-video bg-gray-200 rounded-lg cursor-pointer hover:opacity-80 transition-opacity overflow-hidden"
                        >
                          <img
                            src={kyc.document_back_url}
                            alt="Documento Verso"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = '<div class="flex items-center justify-center h-full"><FiImage class="text-gray-400 text-2xl" /></div>';
                            }}
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center">
                            Verso
                          </div>
                        </div>
                      )}
                      {kyc.selfie_url && (
                        <div
                          onClick={() => viewImage(kyc.selfie_url)}
                          className="relative aspect-video bg-gray-200 rounded-lg cursor-pointer hover:opacity-80 transition-opacity overflow-hidden"
                        >
                          <img
                            src={kyc.selfie_url}
                            alt="Selfie"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = '<div class="flex items-center justify-center h-full"><FiImage class="text-gray-400 text-2xl" /></div>';
                            }}
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center">
                            Selfie
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      kyc.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      kyc.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {kyc.status === 'pending' ? 'Pendente' : kyc.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                    </span>
                    <p className="text-xs text-gray-500">
                      {new Date(kyc.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  {kyc.rejection_reason && (
                    <div className="mb-4 p-3 bg-red-50 rounded-lg">
                      <p className="text-xs font-semibold text-red-800 mb-1">Motivo da Rejeição:</p>
                      <p className="text-xs text-red-700">{kyc.rejection_reason}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {kyc.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        onClick={() => handleApprove(kyc.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <FiCheck className="inline mr-1" />
                        Aprovar
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => openRejectModal(kyc)}
                        className="flex-1"
                      >
                        <FiX className="inline mr-1" />
                        Rejeitar
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectReason('');
        }}
        title="Rejeitar KYC"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Digite o motivo da rejeição para <strong>{selectedKyc?.user_name}</strong>:
          </p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Motivo da rejeição..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            rows="4"
          />
          <div className="flex gap-2">
            <Button variant="danger" onClick={handleReject}>
              Confirmar Rejeição
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setShowRejectModal(false);
                setRejectReason('');
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Image Modal */}
      <Modal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        title="Visualizar Documento"
      >
        <div className="flex justify-center">
          <img
            src={selectedImage}
            alt="Documento"
            className="max-w-full max-h-[70vh] rounded-lg"
          />
        </div>
      </Modal>
    </motion.div>
  );
};

export default AdminKyc;
