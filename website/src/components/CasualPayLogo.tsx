import React from 'react';

interface CasualPayLogoProps {
  size?: 'small' | 'medium' | 'large';
}

const CasualPayLogo: React.FC<CasualPayLogoProps> = ({ 
  size = 'medium'
}) => {
  // Size mapping
  const sizeMap = {
    small: { height: 30, fontSize: 'text-sm' },
    medium: { height: 40, fontSize: 'text-base' },
    large: { height: 50, fontSize: 'text-lg' }
  };
  
  const { height, fontSize } = sizeMap[size];
  
  return (
    <div className="flex items-center" style={{ height: `${height}px` }}>
      {/* CP Logo */}
      <div className="relative mr-3 flex items-center justify-center">
        <svg 
          width={height} 
          height={height} 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Circle background */}
          <circle 
            cx="12" 
            cy="12" 
            r="11" 
            className="fill-current text-white opacity-20" 
          />
          
          {/* C letter */}
          <path 
            d="M7 9C8 7.5 10 6.5 12 6.5C14 6.5 15.5 7.5 16 8" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            className="stroke-current text-white"
          />
          <path 
            d="M7 15C8 16.5 10 17.5 12 17.5C14 17.5 15.5 16.5 16 16" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            className="stroke-current text-white"
          />
          
          {/* P letter */}
          <path 
            d="M17 7V17" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            className="stroke-current text-white"
          />
          <path 
            d="M17 7H14C12.5 7 12 8 12 9C12 10 12.5 11 14 11H17" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            className="stroke-current text-white"
          />
        </svg>
      </div>
      
      {/* Text */}
      <div className="flex items-baseline">
        <span className={`font-bold text-white ${fontSize}`}>
          Casual
        </span>
        <span className={`font-bold text-white ${fontSize} ml-1`}>
          Pay
        </span>
      </div>
    </div>
  );
};

export default CasualPayLogo;
