import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const Button = ({ 
  children, 
  type = 'button', 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  className = '',
  disabled = false,
  fullWidth = false,
  icon = null,
  iconPosition = 'left',
  isLoading = false,
  ...props 
}) => {

  // Size classes
  const sizeClasses = {
    sm: 'py-1.5 px-3 text-sm',
    md: 'py-2.5 px-5 text-base',
    lg: 'py-3 px-6 text-lg'
  };

  // Variant classes
  const variantClasses = {
    primary: 'bg-blue-900 text-white hover:bg-blue-800 hover:shadow-[0_0_15px_rgba(254,240,138,0.4)]',
    secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 hover:shadow-[0_0_15px_rgba(254,240,138,0.4)]',
    danger: 'bg-space-mars text-white hover:bg-red-600',
    success: 'bg-success-500 text-white hover:bg-success-600',
    ghost: 'bg-transparent text-slate-200 hover:bg-space-star/10 hover:text-space-star',
    outline: 'bg-transparent border border-blue-900 text-blue-900 hover:bg-blue-900/10 hover:border-space-star hover:text-space-star'
  };

  const loadingClasses = isLoading ? 'opacity-70 cursor-not-allowed' : '';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  const widthClasses = fullWidth ? 'w-full' : '';

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center
        font-medium rounded-lg
        transition-all duration-200
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${loadingClasses}
        ${disabledClasses}
        ${widthClasses}
        ${className}
      `}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.03 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      
      {icon && iconPosition === 'left' && !isLoading && (
        <span className="mr-2">{icon}</span>
      )}
      
      {children}
      
      {icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </motion.button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.string,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'success', 'ghost', 'outline']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  onClick: PropTypes.func,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  isLoading: PropTypes.bool
};

export default Button; 