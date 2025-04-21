import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BriefcaseIcon, UserIcon, UsersIcon, LayoutDashboardIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BottomToolbar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  // Helper function to determine if a path is active
  const isActive = (path: string) => {
    return location.pathname === path || location.hash === `#${path}`;
  };
  
  // Define navigation items
  const navItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboardIcon,
      path: '/overview',
      active: isActive('/overview')
    },
    {
      label: 'Employers',
      icon: UsersIcon,
      path: '/employers',
      active: isActive('/employers')
    },
    {
      label: 'Shifts & Pay',
      icon: BriefcaseIcon,
      path: '/schedule',
      active: isActive('/schedule')
    },
    {
      label: 'Me',
      icon: UserIcon,
      path: '/settings',
      active: isActive('/settings')
      // Note: We're keeping the path as '/settings' for consistency with the route definition
    }
  ];
  
  return (
    <div
      className="
        md:static md:bg-transparent md:border-none md:z-auto md:w-auto md:h-auto
        fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50
        md:flex md:items-center md:justify-end
        md:p-0
        md:h-auto
        md:shadow-none
        md:max-w-none
        md:container md:mx-auto md:max-w-screen-md
      "
    >
      <div
        className="
          container mx-auto max-w-screen-md px-0
          md:container md:mx-0 md:max-w-none md:px-0 md:flex md:justify-end md:items-center md:w-auto
        "
      >
        <div
          className="
            flex justify-around items-center h-16
            md:h-auto md:justify-end md:gap-4 md:flex-row
          "
        >
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`
                flex flex-col items-center justify-center w-full h-full
                md:flex-row md:justify-center md:items-center md:w-auto md:h-auto md:px-2 md:py-0
                ${item.active ? 'text-blue-600' : 'text-gray-500'}
              `}
            >
              {item.label === 'Me' && user?.picture ? (
                <img
                  src={user.picture}
                  alt="User avatar"
                  className={`h-5 w-5 rounded-full bg-transparent ${item.active ? 'ring-2 ring-blue-600' : ''}`}
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <item.icon
                  className={`h-5 w-5 ${item.active ? 'text-blue-600' : 'text-gray-500'}`}
                  fill={item.active ? 'currentColor' : 'none'}
                  strokeWidth={item.active ? 1.5 : 2}
                />
              )}
              <span className="text-xs mt-1 md:mt-0 md:ml-2">{item.label}</span>
            </Link>
          ))}
        </div>
        {/* Only show safe area on mobile */}
        <div className="h-safe-bottom bg-white md:hidden"></div>
      </div>
    </div>
  );
};

export default BottomToolbar;
