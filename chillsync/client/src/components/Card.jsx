import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const Card = ({ 
  children,
  title,
  className = '',
  variant = 'default',
  hover = true,
  fullWidth = false,
  onClick = null,
  icon = null
}) => {
  // Card variants
  const variants = {
    default: 'bg-space-dark/80 backdrop-blur-md border border-space-star/10',
    elevated: 'bg-space-dark/90 backdrop-blur-md border border-space-star/20 shadow-lg',
    highlighted: 'bg-space-dark/80 backdrop-blur-md border-2 border-space-star/30 shadow-[0_0_15px_rgba(254,240,138,0.2)]'
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const cursorClass = onClick ? 'cursor-pointer' : '';
  
  return (
    <motion.div
      className={`
        rounded-lg overflow-hidden relative
        ${variants[variant]}
        ${widthClass}
        ${cursorClass}
        ${className}
      `}
      onClick={onClick}
      whileHover={hover && !onClick ? { y: -5 } : hover ? { y: -5, scale: 1.01 } : {}}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {/* Decorative stars */}
      <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden pointer-events-none">
        <div className="absolute top-3 right-3 w-1 h-1 bg-space-star/70 rounded-full" />
        <div className="absolute top-6 right-8 w-0.5 h-0.5 bg-space-star/60 rounded-full" />
        <div className="absolute top-10 right-5 w-0.5 h-0.5 bg-space-star/50 rounded-full" />
      </div>
      
      {title && (
        <div className="flex items-center border-b border-space-star/10 p-4">
          {icon && <span className="mr-2 text-space-star">{icon}</span>}
          <h3 className="font-medium text-lg text-space-star">{title}</h3>
        </div>
      )}
      
      <div className="p-5">
        {children}
      </div>
    </motion.div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'elevated', 'highlighted']),
  hover: PropTypes.bool,
  fullWidth: PropTypes.bool,
  onClick: PropTypes.func,
  icon: PropTypes.node
};

export default Card; 