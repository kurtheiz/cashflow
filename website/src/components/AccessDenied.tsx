import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';
import { Button } from 'primereact/button';

const AccessDenied: React.FC = () => {
  const { logout, authorizationError, user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-6 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-sm text-gray-600">
            {authorizationError || 'You do not have permission to access this application.'}
          </p>
        </div>
        
        <div className="mt-8 space-y-4">
          {user && (
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-700">
                Signed in as: <span className="font-medium">{user.email}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                This email is not on the list of authorized users.
              </p>
            </div>
          )}
          
          <div className="text-sm text-gray-600">
            <p>If you believe you should have access, please contact the administrator.</p>
          </div>
          
          <Button 
            label="Sign Out" 
            icon={<LogOut className="w-4 h-4 mr-2" />}
            onClick={logout}
            className="w-full flex justify-center py-2 px-4"
          />
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
