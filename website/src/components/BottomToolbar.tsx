import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BriefcaseIcon, CalendarIcon, SettingsIcon, UsersIcon, HomeIcon } from 'lucide-react';

const BottomToolbar: React.FC = () => {
  const location = useLocation();
  
  // Helper function to determine if a path is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  // Define navigation items
  const navItems = [
    {
      label: 'Home',
      icon: HomeIcon,
      path: '/',
      active: isActive('/')
    },
    {
      label: 'Employers',
      icon: UsersIcon,
      path: '/employers',
      active: isActive('/employers')
    },
    {
      label: 'Shifts',
      icon: BriefcaseIcon,
      path: '/shifts',
      active: isActive('/shifts')
    },
    {
      label: 'Calendar',
      icon: CalendarIcon,
      path: '/calendar',
      active: isActive('/calendar')
    },
    {
      label: 'Settings',
      icon: SettingsIcon,
      path: '/settings',
      active: isActive('/settings')
    }
  ];
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={`flex flex-col items-center justify-center w-full h-full ${
              item.active ? 'text-indigo-600' : 'text-gray-500'
            }`}
          >
            <item.icon className={`h-5 w-5 ${item.active ? 'text-indigo-600' : 'text-gray-500'}`} />
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
      </div>
      
      {/* Add safe area padding for iOS devices */}
      <div className="h-safe-bottom bg-white"></div>
    </div>
  );
};

export default BottomToolbar;
