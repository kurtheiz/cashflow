import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOutIcon, UserIcon, MailIcon, ShieldIcon, BellIcon, HelpCircleIcon } from 'lucide-react';

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

  const menuItems = [
    {
      icon: UserIcon,
      label: 'Personal Information',
      description: 'Update your name and profile details'
    },
    {
      icon: MailIcon,
      label: 'Email Preferences',
      description: 'Manage your email notifications'
    },
    {
      icon: ShieldIcon,
      label: 'Privacy & Security',
      description: 'Control your privacy settings'
    },
    {
      icon: BellIcon,
      label: 'Notifications',
      description: 'Configure how you receive alerts'
    },
    {
      icon: HelpCircleIcon,
      label: 'Help & Support',
      description: 'Get assistance with using Casual Pay'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>
        
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
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
        
        {/* Menu Items */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="divide-y divide-gray-100">
            {menuItems.map((item, index) => (
              <div 
                key={index}
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer flex items-center"
              >
                <div className="p-2 bg-indigo-50 rounded-full mr-4">
                  <item.icon className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.label}</h3>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Sign Out Button */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
