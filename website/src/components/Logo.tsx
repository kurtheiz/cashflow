import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'monochrome';
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'medium', 
  variant = 'default' 
}) => {
  // Size mapping
  const sizeMap = {
    small: { width: 32, height: 32, fontSize: 'text-xs' },
    medium: { width: 40, height: 40, fontSize: 'text-sm' },
    large: { width: 48, height: 48, fontSize: 'text-base' }
  };
  
  // Color mapping
  const colorMap = {
    default: {
      primary: 'text-blue-600',
      secondary: 'text-green-500',
      background: 'bg-white'
    },
    monochrome: {
      primary: 'text-white',
      secondary: 'text-gray-200',
      background: 'bg-transparent'
    }
  };
  
  const { width, height, fontSize } = sizeMap[size];
  const { primary, secondary, background } = colorMap[variant];
  
  return (
    <div className="flex items-center">
      <div 
        className={`relative flex items-center justify-center rounded-lg ${background} shadow-sm overflow-hidden`}
        style={{ width, height }}
      >
        {/* Dollar sign */}
        <span className={`font-bold ${primary} ${fontSize}`}>C</span>
        <span 
          className={`absolute font-bold ${secondary} ${fontSize}`}
          style={{ 
            transform: 'translateX(3px) translateY(1px)'
          }}
        >
          P
        </span>
      </div>
      <span className={`ml-2 font-bold ${primary} text-lg`}>Casual Pay</span>
    </div>
  );
};

export default Logo;
