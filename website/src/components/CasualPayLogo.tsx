import React from 'react';

interface CasualPayLogoProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'monochrome' | 'light';
}

const CasualPayLogo: React.FC<CasualPayLogoProps> = ({ 
  size = 'medium', 
  variant = 'default' 
}) => {
  // Size mapping
  const sizeMap = {
    small: { height: 30, fontSize: 'text-sm' },
    medium: { height: 40, fontSize: 'text-base' },
    large: { height: 50, fontSize: 'text-lg' }
  };
  
  // Color mapping
  const colorMap = {
    default: {
      primary: 'text-indigo-600',
      secondary: 'text-green-500',
      accent: 'text-yellow-500'
    },
    monochrome: {
      primary: 'text-gray-800',
      secondary: 'text-gray-600',
      accent: 'text-gray-700'
    },
    light: {
      primary: 'text-white',
      secondary: 'text-gray-200',
      accent: 'text-yellow-300'
    }
  };
  
  const { height, fontSize } = sizeMap[size];
  const { primary, secondary, accent } = colorMap[variant];
  
  return (
    <div className="flex items-center" style={{ height: `${height}px` }}>
      {/* Icon */}
      <div className="relative mr-2 flex items-center justify-center">
        <svg 
          width={height * 0.9} 
          height={height * 0.9} 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="mr-1"
        >
          <circle 
            cx="12" 
            cy="12" 
            r="10" 
            className={`fill-current ${secondary} opacity-20`} 
          />
          <path 
            d="M12 6V12L16 14" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            className={`stroke-current ${primary}`}
          />
          <path 
            d="M12 6L8 9" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            className={`stroke-current ${accent}`}
          />
        </svg>
      </div>
      
      {/* Text */}
      <div className="flex items-baseline">
        <span className={`font-bold ${primary} ${fontSize}`}>
          Casual
        </span>
        <span className={`font-bold ${accent} ${fontSize} ml-1`}>
          Pay
        </span>
      </div>
    </div>
  );
};

export default CasualPayLogo;
