import api from './api';

export const getTransactions = async (params) => {
  const response = await api.get('/api/transactions', { params });
  return response.data;
};

export const getTransaction = async (id) => {
  const response = await api.get(`/api/transactions/${id}`);
  return response.data;
};

export const createDeposit = async (amount) => {
  const response = await api.post('/api/transactions/deposit', { amount });
  return response.data;
};

export const createWithdrawal = async (data) => {
  const response = await api.post('/api/transactions/withdraw', data);
  return response.data;
};

export const createPixTransfer = async (data) => {
  const response = await api.post('/api/transactions/pix', data);
  return response.data;
};

export const getStats = async () => {
  const response = await api.get('/api/transactions/stats');
  return response.data;
};

export const submitKYC = async (data) => {
  const response = await api.post('/api/kyc/submit', data);
  return response.data;
};

export const getKYCStatus = async () => {
  const response = await api.get('/api/kyc/status');
  return response.data;
};

// Admin functions
export const adminGetUsers = async (params) => {
  const response = await api.get('/api/admin/users', { params });
  return response.data;
};

export const adminGetUser = async (id) => {
  const response = await api.get(`/api/admin/users/${id}`);
  return response.data;
};

export const adminUpdateUser = async (id, data) => {
  const response = await api.put(`/api/admin/users/${id}`, data);
  return response.data;
};

export const adminGetKYCs = async (params) => {
  const response = await api.get('/api/admin/kyc', { params });
  return response.data;
};

export const adminApproveKYC = async (id) => {
  const response = await api.put(`/api/admin/kyc/${id}/approve`);
  return response.data;
};

export const adminRejectKYC = async (id, reason) => {
  const response = await api.put(`/api/admin/kyc/${id}/reject`, { rejection_reason: reason });
  return response.data;
};

export const adminGetTransactions = async (params) => {
  const response = await api.get('/api/admin/transactions', { params });
  return response.data;
};

export const adminCancelTransaction = async (id) => {
  const response = await api.put(`/api/admin/transactions/${id}/cancel`);
  return response.data;
};

export const adminGetGatewayLogs = async (params) => {
  const response = await api.get('/api/admin/logs', { params });
  return response.data;
};

export const adminGetGatewayConfig = async () => {
  const response = await api.get('/api/admin/gateway');
  return response.data;
};

export const adminUpdateGatewayConfig = async (id, data) => {
  const response = await api.put(`/api/admin/gateway/${id}`, data);
  return response.data;
};

export const adminGetStats = async () => {
  const response = await api.get('/api/admin/stats');
  return response.data;
};
