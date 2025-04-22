import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOutIcon } from 'lucide-react';

const Me: React.FC = () => {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold mb-4">Not Logged In</h1>
          <p className="text-gray-600 mb-4">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  // No menu items needed

  return (
    <div className="container mx-auto px-4 py-2">
      <div className="max-w-2xl mx-auto">
        {/* Profile Card */}
        <div className="bg-white p-4 mb-4">
          <div className="flex items-center space-x-4">
            {user.picture ? (
              <img 
                src={user.picture} 
                alt={user.name} 
                className="w-16 h-16 rounded-full object-cover border-2 border-indigo-100"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-xl">
                {user.name.charAt(0)}
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
        </div>
        
        {/* Subscription Management Blurb */}
        <div className="bg-white p-4 mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Subscription Management</h3>
          <p className="text-sm text-gray-500">Your subscription details and management options will appear here in the future.</p>
        </div>
        
        {/* Sign Out Button */}
        <div className="bg-white p-3">
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center py-3 px-4 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none transition-colors"
          >
            <LogOutIcon className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Me;
