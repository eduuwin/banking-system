import { motion } from 'framer-motion';
import { formatCurrency, formatDate } from '../utils/formatters';

/**
 * Transaction list item component
 * @param {Object} props
 * @param {Object} props.transaction - Transaction object
 * @param {string} props.transaction.type - Transaction type
 * @param {number} props.transaction.amount - Transaction amount
 * @param {string} props.transaction.date - Transaction date
 * @param {string} props.transaction.status - Transaction status
 * @param {string} props.transaction.description - Transaction description
 */
const TransactionItem = ({ transaction }) => {
  const { type, amount, date, status, description } = transaction;

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'deposit':
      case 'deposito':
        return '💰';
      case 'withdrawal':
      case 'saque':
        return '💸';
      case 'transfer':
      case 'transferencia':
        return '🔄';
      case 'pix':
        return '⚡';
      default:
        return '📝';
    }
  };

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'deposit':
      case 'deposito':
        return 'success';
      case 'withdrawal':
      case 'saque':
        return 'danger';
      case 'transfer':
      case 'transferencia':
      case 'pix':
        return 'primary';
      default:
        return 'secondary';
    }
  };

  const getStatusBadge = (status) => {
    const statusClass = status?.toLowerCase() === 'completed' || status?.toLowerCase() === 'concluido'
      ? 'badge-success'
      : status?.toLowerCase() === 'pending' || status?.toLowerCase() === 'pendente'
      ? 'badge-warning'
      : 'badge-danger';

    return <span className={`badge ${statusClass}`}>{status}</span>;
  };

  return (
    <motion.div
      className="transaction-item"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="transaction-icon">
        <span className={`icon-bg icon-${getTypeColor(type)}`}>
          {getTypeIcon(type)}
        </span>
      </div>
      
      <div className="transaction-details">
        <div className="transaction-type">{type}</div>
        {description && (
          <div className="transaction-description">{description}</div>
        )}
        <div className="transaction-date">{formatDate(date)}</div>
      </div>
      
      <div className="transaction-right">
        <div className={`transaction-amount amount-${getTypeColor(type)}`}>
          {formatCurrency(amount)}
        </div>
        {status && getStatusBadge(status)}
      </div>
    </motion.div>
  );
};

export default TransactionItem;
