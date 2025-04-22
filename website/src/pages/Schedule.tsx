import React from 'react';
import { useAuth } from '../context/AuthContext';
import UpcomingSchedule from '../components/UpcomingSchedule';
import { ShiftsCalendar } from '../components/ShiftsCalendar';
import { Calendar as CalendarIcon, X as CloseIcon, Plus as PlusIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, addMonths } from 'date-fns';
import { useShifts, usePayPeriods } from '../hooks/useApiData';

const Schedule: React.FC = () => {
  const [scrollToTodayTrigger, setScrollToTodayTrigger] = React.useState(0);
  const [calendarOpen, setCalendarOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  
  // Function to handle adding a new shift (placeholder for now)
  const handleAddShift = () => {
    console.log('Add new shift');
    // Future implementation will open a modal to add a new shift
    setScrollToTodayTrigger(prev => prev + 1); // Refresh the list after adding
  };
  
  // Suppress TypeScript unused variable warning
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  
  // Function to handle date selection from calendar
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setCalendarOpen(false); // Close the calendar
    setScrollToTodayTrigger(prev => prev + 1); // Trigger scroll to make the selected date visible
  };
  const { user } = useAuth();
  
  // Get date range for current month and next month
  const today = new Date();
  const currentMonthStart = format(startOfMonth(today), 'yyyy-MM-dd');
  const nextMonthEnd = format(endOfMonth(addMonths(today, 1)), 'yyyy-MM-dd');
  
  // Fetch shifts using the same hook as Overview page
  const { data: shiftsResp, isLoading: shiftsLoading } = useShifts(currentMonthStart, nextMonthEnd);
  const shifts = shiftsResp?.data || [];
  
  // Fetch pay periods
  const { data: payPeriodsResp, isLoading: payPeriodsLoading } = usePayPeriods(currentMonthStart, nextMonthEnd);
  const payPeriods = payPeriodsResp?.data || [];

  return (
    <div className="w-full px-0 sm:px-4" style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
      <div className="w-full lg:max-w-4xl mx-auto">
        {/* Toolbar strip */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 py-3 px-4 flex items-center justify-between -mt-4">
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            onClick={() => setCalendarOpen(true)}
            type="button"
            aria-label="Show calendar"
          >
            <CalendarIcon className="w-5 h-5" />
          </button>
          <div className="flex-1"></div> {/* Spacer */}
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={handleAddShift}
            type="button"
            aria-label="Add shift"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>
        
        {calendarOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="relative w-full sm:max-w-md mx-auto p-0 bg-white rounded-md overflow-hidden shadow-xl">
              <div className="sticky top-0 py-2 px-3 flex items-center justify-between bg-blue-50 z-10 border-b border-blue-100">
                <h3 className="text-lg font-medium leading-6 text-blue-900">Calendar</h3>
                <button 
                  type="button"
                  className="p-1 rounded hover:bg-blue-100"
                  onClick={() => setCalendarOpen(false)}
                  aria-label="Close calendar"
                >
                  <CloseIcon className="w-5 h-5 text-blue-700" />
                </button>
              </div>
              <div className="px-3 py-2 text-sm text-gray-600 border-b border-gray-100">
                Click on a date with a shift or payment to view it in the list below. Click on an empty date to add a new shift.
              </div>
              <div className="p-2">
                {shiftsLoading || payPeriodsLoading ? (
                  <div className="bg-white p-4 text-center">
                    Loading calendar data...
                  </div>
                ) : (
                  <ShiftsCalendar
                    shifts={shifts}
                    payPeriods={payPeriods}
                    selectedDate={selectedDate}
                    onDateChange={handleDateSelect}
                  />
                )}
              </div>
            </div>
          </div>
        )}
        {!user ? (
          <div className="text-center p-4">
            Please log in to view your schedule
          </div>
        ) : shiftsLoading || payPeriodsLoading ? (
          <div className="text-center p-4 text-gray-500">
            Loading your schedule...
          </div>
        ) : (
          <UpcomingSchedule 
            scrollToTodayTrigger={scrollToTodayTrigger}
            externalShifts={shifts}
            selectedDate={selectedDate}
          />
        )}
      </div>
    </div>
  );
};

export default Schedule;
