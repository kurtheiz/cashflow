import React from 'react';
import { useAuth } from '../context/AuthContext';
import UpcomingSchedule from '../components/UpcomingSchedule';
import { SlidersHorizontal } from 'lucide-react';

const Schedule: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="w-full px-0 sm:px-4" style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
      <div className="w-full lg:max-w-4xl mx-auto">
      
        {/* Toolbar strip */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 py-3 px-4 flex justify-between items-center -mt-4">
          <div className="text-lg font-medium text-black">Schedule</div>
          <button 
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Filter"
            onClick={() => {}}
          >
            <SlidersHorizontal className="h-5 w-5 text-black" />
          </button>
        </div>
        
        {user ? (
          <UpcomingSchedule />
        ) : (
          <div className="text-center p-4">
            Please log in to view your schedule
          </div>
        )}
      </div>
    </div>
  );
};

export default Schedule;
