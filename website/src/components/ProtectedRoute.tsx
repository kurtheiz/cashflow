import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AccessDenied from './AccessDenied';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * A wrapper component that redirects to the home page if the user is not authenticated
 * or shows an access denied page if the user is not authorized
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isLoggedIn, isLoading, isAuthorized } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Redirect to home if not logged in
  if (!isLoggedIn) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  
  // Show access denied page if not authorized
  if (!isAuthorized) {
    return <AccessDenied />;
  }

  // Render children if authenticated and authorized
  return <>{children}</>;
};

export default ProtectedRoute;
