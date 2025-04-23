import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import UpcomingSchedule from '../components/UpcomingSchedule';
import { ShiftsCalendar } from '../components/ShiftsCalendar';
import { Calendar as CalendarIcon, Plus as PlusIcon, Upload as UploadIcon } from 'lucide-react';
import DetailModal from '../components/DetailModal';
import { format, startOfMonth, endOfMonth, addMonths } from 'date-fns';
import { useShifts, usePayPeriods, useEmployers, usePublicHolidays, useCurrentUser } from '../hooks/useApiData';

const Schedule: React.FC = () => {
  const [scrollToTodayTrigger, setScrollToTodayTrigger] = useState(0);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  
  // Function to handle adding a new shift (placeholder for now)
  const handleAddShift = () => {
    console.log('Add new shift');
    // Future implementation will open a modal to add a new shift
    setScrollToTodayTrigger(prev => prev + 1); // Refresh the list after adding
  };
  
  // Function to handle uploading a screenshot (placeholder for now)
  const handleUploadScreenshot = () => {
    console.log('Upload screenshot');
    // Future implementation will open a modal to upload a screenshot
    alert('AI-powered roster upload coming soon!');
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
  
  // Fetch user data to get the full date range
  const { data: userResp } = useCurrentUser();
  const userData = userResp?.data || {};
  
  // Get date range from user data if available, otherwise use current month and next month
  const today = new Date();
  const startDate = userData.startDate || format(startOfMonth(today), 'yyyy-MM-dd');
  const endDate = userData.endDate || format(endOfMonth(addMonths(today, 1)), 'yyyy-MM-dd');
  
  // Fetch shifts using the date range from user data
  const { data: shiftsResp, isLoading: shiftsLoading } = useShifts(startDate, endDate);
  const shifts = shiftsResp?.data || [];
  
  // Fetch pay periods using the date range from user data
  const { data: payPeriodsResp, isLoading: payPeriodsLoading } = usePayPeriods(startDate, endDate);
  const payPeriods = payPeriodsResp?.data || [];
  
  // Fetch employers to get their states
  const { data: employersResp, isLoading: employersLoading } = useEmployers();
  const employers = employersResp?.data || [];
  
  // Extract unique states from employers
  const employerStates = useMemo(() => {
    const states = employers.map((employer: { state: string }) => employer.state);
    return [...new Set(states)] as string[]; // Remove duplicates
  }, [employers]);
  
  // Fetch public holidays for the states of all employers
  const currentYear = new Date().getFullYear().toString();
  const { data: publicHolidaysResp, isLoading: publicHolidaysLoading } = usePublicHolidays(
    employerStates,
    currentYear
  );
  const publicHolidays = publicHolidaysResp?.data || [];

  return (
    <div className="w-full px-0 sm:px-4" style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
      <div className="w-full lg:max-w-4xl mx-auto">
        {/* Toolbar strip */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 py-3 px-4 -mt-4 pb-5">
          <div className="flex items-start justify-between">
            <div className="flex flex-col items-center">
              <button
                className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                onClick={() => setCalendarOpen(true)}
                type="button"
                aria-label="Show calendar"
              >
                <CalendarIcon className="w-5 h-5" />
              </button>
              <span className="text-[10px] mt-1 text-gray-600 text-center">View Calendar</span>
            </div>
            

            
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <button
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={handleUploadScreenshot}
                  type="button"
                  aria-label="Upload roster screenshot"
                >
                  <UploadIcon className="w-5 h-5" />
                </button>
                <span className="text-[10px] mt-1 text-gray-600 text-center">Upload Screenshot</span>
              </div>
              <div className="flex flex-col items-center">
                <button
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={handleAddShift}
                  type="button"
                  aria-label="Add shift"
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
                <span className="text-[10px] mt-1 text-gray-600 text-center">Add Shift</span>
              </div>
            </div>
          </div>
        </div>
        
        <DetailModal
          isOpen={calendarOpen}
          onClose={() => setCalendarOpen(false)}
          title={<span className="flex items-center gap-2"><CalendarIcon className="w-5 h-5" /> Calendar View</span>}
          subtitle="Click on a date with a shift or payment to view it in the list below. Click on an empty date to add a new shift."
        >
          {shiftsLoading || payPeriodsLoading ? (
            <div className="bg-white p-4 text-center">
              Loading calendar data...
            </div>
          ) : (
            <ShiftsCalendar
              shifts={shifts}
              payPeriods={payPeriods}
              publicHolidays={publicHolidays}
              selectedDate={selectedDate}
              onDateChange={handleDateSelect}
            />
          )}
        </DetailModal>
        {!user ? (
          <div className="text-center p-4">
            Please log in to view your schedule
          </div>
        ) : shiftsLoading || payPeriodsLoading || employersLoading || publicHolidaysLoading ? (
          <div className="text-center p-4 text-gray-500">
            Loading your schedule...
          </div>
        ) : (
          <UpcomingSchedule 
            scrollToTodayTrigger={scrollToTodayTrigger}
            shifts={shifts}
            payPeriods={payPeriods}
            selectedDate={selectedDate}
            publicHolidays={publicHolidays}
            employers={employers}
            isLoading={false}
          />
        )}
      </div>
      

    </div>
  );
};

export default Schedule;
