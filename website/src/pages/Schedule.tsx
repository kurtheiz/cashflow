import React from 'react';
import { useAuth } from '../context/AuthContext';
import UpcomingSchedule from '../components/UpcomingSchedule';
import ScheduleFilterMenu from '../components/ScheduleFilterMenu';
import { ShiftsCalendar } from '../components/ShiftsCalendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import shiftsData from '../api/data/shiftspay.json';

const Schedule: React.FC = () => {
  const [selectedEmployer, setSelectedEmployer] = React.useState<string | null>(null);
  const [cardType, setCardType] = React.useState<'all' | 'shift' | 'payment'>('all');
  const [scrollToTodayTrigger, setScrollToTodayTrigger] = React.useState(0);
  const [calendarOpen, setCalendarOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const { user } = useAuth();

  // Extract shifts from imported JSON
  const shifts = Array.isArray((shiftsData as any).shifts) ? (shiftsData as any).shifts : [];

  return (
    <div className="w-full px-0 sm:px-4" style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
      <div className="w-full lg:max-w-4xl mx-auto">
        {/* Toolbar strip */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 py-3 px-4 flex items-center -mt-4">
          <div className="text-lg font-medium text-black">Schedule</div>
          <div className="flex-1 flex justify-center">
            <button
              className="border border-gray-300 text-gray-700 px-3 py-1 rounded-full text-sm font-medium bg-white hover:bg-gray-100 transition-colors focus:outline-none flex items-center gap-2"
              onClick={() => setCalendarOpen(true)}
              type="button"
              aria-label="Show calendar"
            >
              <CalendarIcon className="w-5 h-5" />
            </button>
          </div>
          <ScheduleFilterMenu
            selectedEmployer={selectedEmployer}
            setSelectedEmployer={setSelectedEmployer}
            cardType={cardType}
            setCardType={setCardType}
          />
        </div>
        
        {calendarOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="relative w-full max-w-md mx-auto p-2">
              <div className="absolute top-2 right-2 z-10">
                <button onClick={() => setCalendarOpen(false)} className="rounded-full bg-white p-2 shadow hover:bg-gray-100 focus:outline-none">
                  <span className="sr-only">Close calendar</span>
                  <CalendarIcon className="w-5 h-5 text-gray-700" />
                </button>
              </div>
              <ShiftsCalendar
                shifts={shifts}
                selectedDate={selectedDate}
                onDateChange={(date) => setSelectedDate(date)}
              />
            </div>
          </div>
        )}
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
