import React from 'react';
import { useAuth } from '../context/AuthContext';
import UpcomingSchedule from '../components/UpcomingSchedule';
import ScheduleFilterMenu from '../components/ScheduleFilterMenu';

const Schedule: React.FC = () => {
  const [selectedEmployer, setSelectedEmployer] = React.useState<string | null>(null);
  const [cardType, setCardType] = React.useState<'all' | 'shift' | 'payment'>('all');
  const [scrollToTodayTrigger, setScrollToTodayTrigger] = React.useState(0);
  const { user } = useAuth();

  return (
    <div className="w-full px-0 sm:px-4" style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
      <div className="w-full lg:max-w-4xl mx-auto">
        {/* Toolbar strip */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 py-3 px-4 flex items-center -mt-4">
          <div className="text-lg font-medium text-black">Schedule</div>
          <div className="flex-1 flex justify-center">
            <button
              className="border border-gray-300 text-gray-700 px-4 py-1 rounded-full text-sm font-medium bg-white hover:bg-gray-100 transition-colors focus:outline-none"
              onClick={() => setScrollToTodayTrigger(t => t + 1)}
              type="button"
            >
              Today
            </button>
          </div>
          <ScheduleFilterMenu
            selectedEmployer={selectedEmployer}
            setSelectedEmployer={setSelectedEmployer}
            cardType={cardType}
            setCardType={setCardType}
          />
        </div>
        
        {user ? (
          <UpcomingSchedule selectedEmployer={selectedEmployer} cardType={cardType} scrollToTodayTrigger={scrollToTodayTrigger} />
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
