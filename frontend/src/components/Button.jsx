import { motion } from 'framer-motion';

/**
 * Reusable button component
 * @param {Object} props
 * @param {string} props.variant - Button style variant (primary, secondary, danger)
 * @param {function} props.onClick - Click handler
 * @param {React.ReactNode} props.children - Button content
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.type - Button type (button, submit, reset)
 * @param {string} props.className - Additional CSS classes
 */
const Button = ({ 
  variant = 'primary', 
  onClick, 
  children, 
  disabled = false, 
  type = 'button',
  className = ''
}) => {
  const variantClass = `btn-${variant}`;

  return (
    <motion.button
      type={type}
      className={`btn ${variantClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
    >
      {children}
    </motion.button>
  );
};

export default Button;
