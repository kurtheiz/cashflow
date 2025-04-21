import React, { useEffect, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface GoogleLoginButtonProps {
  className?: string;
  text?: string;
  onSuccess?: () => void;
}

// Track authentication errors globally
let authErrorCount = 0;

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ 
  className = '', 
  onSuccess 
}) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isInitialized, setIsInitialized] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  // Handle successful login
  const handleSuccess = (credentialResponse: any) => {
    if (credentialResponse.credential) {
      login(credentialResponse.credential);
      navigate('/overview');
      if (onSuccess) {
        onSuccess();
      }
    }
  };

  // Handle login errors
  const handleError = () => {
    console.error('Google login failed');
    authErrorCount++;
    if (authErrorCount > 1) {
      console.warn('Multiple Google authentication errors detected. This might be due to FedCM settings or origin restrictions.');
    }
  };

  // Initialize component and set up error detection
  useEffect(() => {
    setIsInitialized(true);
    
    // Set a timeout to show the fallback button if authentication fails
    const timer = setTimeout(() => {
      if (authErrorCount > 0) {
        setShowFallback(true);
      }
    }, 3000);
    
    return () => {
      clearTimeout(timer);
    };
  }, []);

  // If not initialized yet, show loading state
  if (!isInitialized) {
    return (
      <div className={className}>
        <button 
          className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2"
          disabled
        >
          <span>Loading...</span>
        </button>
      </div>
    );
  }
  
  // If showing fallback due to errors
  if (showFallback) {
    return (
      <div className={className}>
        <div className="p-2 mb-2 text-sm text-amber-700 bg-amber-50 rounded-md">
          Google Sign-In may be blocked by your browser settings or network.
        </div>
        <button 
          className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 w-full"
          onClick={() => {
            alert('Please check your browser settings to enable Federated Identity (FedCM) or contact the site administrator.');
          }}
        >
          <span>Sign in with Google</span>
        </button>
      </div>
    );
  }

  // Default: show Google login button
  return (
    <div className={className}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap={false}
        text="signin_with"
        shape="rectangular"
        theme="filled_blue"
        locale="en"
        type="standard"
      />
    </div>
  );
};

export default GoogleLoginButton;
