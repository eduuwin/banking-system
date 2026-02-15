export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatCPF = (cpf) => {
  if (!cpf) return '';
  const cleaned = cpf.replace(/\D/g, '');
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const formatPhone = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(date));
};

export const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

export const getTransactionTypeLabel = (type) => {
  const labels = {
    deposit: 'Depósito',
    withdrawal: 'Saque',
    pix_sent: 'PIX Enviado',
    pix_received: 'PIX Recebido'
  };
  return labels[type] || type;
};

export const getTransactionStatusLabel = (status) => {
  const labels = {
    pending: 'Pendente',
    completed: 'Concluído',
    failed: 'Falhou',
    cancelled: 'Cancelado'
  };
  return labels[status] || status;
};

export const getKycStatusLabel = (status) => {
  const labels = {
    pending: 'Pendente',
    submitted: 'Em Análise',
    approved: 'Aprovado',
    rejected: 'Rejeitado'
  };
  return labels[status] || status;
};

export const getKycStatusBadge = (status) => {
  const badges = {
    pending: 'badge-warning',
    submitted: 'badge-info',
    approved: 'badge-success',
    rejected: 'badge-danger'
  };
  return badges[status] || 'badge-info';
};

export const getTransactionStatusBadge = (status) => {
  const badges = {
    pending: 'badge-warning',
    completed: 'badge-success',
    failed: 'badge-danger',
    cancelled: 'badge-danger'
  };
  return badges[status] || 'badge-info';
};
