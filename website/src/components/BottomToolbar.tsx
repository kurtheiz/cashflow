import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BriefcaseIcon, UserIcon, UsersIcon, LayoutDashboardIcon, Info as InfoIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import DetailModal from './DetailModal';

const BottomToolbar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [avatarError, setAvatarError] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Determine context for help modal
  const getHelpContent = () => {
    if (location.pathname === '/schedule') {
      return (
        <div className="space-y-4">
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-2">Calendar Color Legend</h4>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-red-100 border border-red-300 inline-block rounded-sm"></span>
                <span className="text-sm">Public Holidays</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-green-100 border border-green-300 inline-block rounded-sm"></span>
                <span className="text-sm">Pay Days</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
                <span className="text-sm">Shifts (dot indicators in calendar)</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-2">Available Actions</h4>
            <ul className="list-disc pl-5 text-sm space-y-2">
              <li><strong>View Calendar:</strong> Click to open a monthly calendar view of your shifts and payments</li>
              <li><strong>Upload Screenshot:</strong> Upload a roster screenshot to automatically add shifts (coming soon)</li>
              <li><strong>Add Shift:</strong> Manually add a new shift to your schedule</li>
              <li><strong>Tap on a shift:</strong> View details and edit shift information</li>
              <li><strong>Tap on a pay day:</strong> View payment details including gross pay and tax</li>
            </ul>
          </div>
        </div>
      );
    }
    // Default/fallback help content
    return (
      <div className="space-y-4">
        <div>
          <h4 className="text-md font-semibold text-gray-900 mb-2">Help & Information</h4>
          <div className="text-sm text-gray-700">Get help and tips for using this page. Context-aware help will appear here for each section of the app.</div>
        </div>
      </div>
    );
  };
  
  // No need for useEffect or data URL state, we'll handle errors directly in the img tag
  
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
      label: 'Shifts',
      icon: BriefcaseIcon,
      path: '/schedule',
      active: isActive('/schedule')
    },
    {
      label: 'Employers',
      icon: UsersIcon,
      path: '/employers',
      active: isActive('/employers')
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
                ${item.active ? '' : 'text-gray-500'}
                
              `}
            >
              {item.label === 'Me' ? (
                <div className="relative">
                  {user?.picture && !avatarError ? (
                    <img
                      src={user.picture}
                      alt="User"
                      className={`h-5 w-5 rounded-full ${item.active ? 'ring-2 ring-blue-500' : ''}`}
                      style={{ objectFit: 'cover' }}
                      onError={() => {
                        // Set state to show fallback icon instead
                        setAvatarError(true);
                      }}
                    />
                  ) : (
                    <item.icon
                      className={`h-5 w-5 ${item.active ? 'system-blue-text md:text-white md:!text-white' : 'text-gray-400'}`}
                      fill={item.active ? 'currentColor' : 'none'}
                      strokeWidth={item.active ? 1.5 : 2}
                    />
                  )}
                </div>
              ) : (
                <item.icon
                  className={`h-5 w-5 ${item.active ? 'system-blue-text md:text-white md:!text-white' : 'text-gray-400'}`}
                  fill={item.active ? 'currentColor' : 'none'}
                  strokeWidth={item.active ? 1.5 : 2}
                />
              )}
              <span className={`text-xs mt-1 md:mt-0 md:ml-2 ${item.active ? 'system-blue-text md:text-white md:!text-white' : 'text-gray-400'}`}>{item.label}</span>
            </Link>
          ))}
          {/* Info Button */}
          <button
            type="button"
            aria-label="Help & Info"
            className="flex flex-col items-center justify-center w-full h-full md:w-auto md:h-auto md:px-2 md:py-0 text-gray-400 hover:text-blue-600 focus:outline-none focus:text-blue-600"
            onClick={() => setShowInfoModal(true)}
          >
            <InfoIcon className="h-5 w-5" />
            <span className="text-xs mt-1 md:mt-0 md:ml-2">Help</span>
          </button>
        </div>
        {/* Only show safe area on mobile */}
        <div className="h-safe-bottom bg-white md:hidden"></div>
        {/* Info/Help Modal */}
        <DetailModal
          isOpen={showInfoModal}
          onClose={() => setShowInfoModal(false)}
          title="Help & Information"
          subtitle="Context-aware help for this page"
        >
          {getHelpContent()}
        </DetailModal>
      </div>
    </div>
  );
};

export default BottomToolbar;
