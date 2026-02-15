// Validation utilities

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validateCPF = (cpf) => {
  // Remove non-digits
  cpf = cpf.replace(/\D/g, '');
  
  // Must have 11 digits
  if (cpf.length !== 11) return false;
  
  // Check for known invalid CPFs
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  // Validate check digits
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cpf.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cpf.charAt(10))) return false;
  
  return true;
};

export const validatePhone = (phone) => {
  // Remove non-digits
  phone = phone.replace(/\D/g, '');
  
  // Must have 10 or 11 digits (with DDD)
  return phone.length >= 10 && phone.length <= 11;
};

export const validateAmount = (amount) => {
  return typeof amount === 'number' && amount > 0;
};

export const validatePixKey = (key, type) => {
  switch (type) {
    case 'cpf':
      return validateCPF(key);
    case 'email':
      return validateEmail(key);
    case 'phone':
      return validatePhone(key);
    case 'random':
      return key && key.length >= 32; // EVP keys are typically 32+ chars
    default:
      return false;
  }
};
