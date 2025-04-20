import React from 'react';
import { useAuth } from '../context/AuthContext';

const UserProfile: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center p-4 bg-white rounded-lg shadow-sm">
      <div className="flex items-center space-x-3">
        {user.picture ? (
          <img 
            src={user.picture} 
            alt={user.name} 
            className="w-10 h-10 rounded-full object-cover border-2 border-indigo-100"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
            {user.name.charAt(0)}
          </div>
        )}
        <div>
          <h3 className="font-medium text-gray-900">{user.name}</h3>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
