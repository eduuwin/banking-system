/**
 * Reusable input component
 * @param {Object} props
 * @param {string} props.label - Input label
 * @param {string} props.type - Input type
 * @param {string} props.value - Input value
 * @param {function} props.onChange - Change handler
 * @param {string} props.placeholder - Input placeholder
 * @param {boolean} props.required - Required field
 * @param {string} props.error - Error message
 * @param {string} props.name - Input name
 * @param {string} props.className - Additional CSS classes
 */
const Input = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required = false, 
  error,
  name,
  className = ''
}) => {
  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="text-danger">*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`input ${error ? 'input-error' : ''}`}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default Input;
