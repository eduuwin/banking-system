import { motion } from 'framer-motion';

/**
 * Reusable card component
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.className - Additional CSS classes
 */
const Card = ({ title, children, className = '' }) => {
  return (
    <motion.div 
      className={`card ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {title && <h3 className="card-title">{title}</h3>}
      {children}
    </motion.div>
  );
};

export default Card;
