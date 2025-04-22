import { useAuth } from '../context/AuthContext';
import { useMemo } from 'react';
import { format, addMonths, startOfMonth, endOfMonth, isAfter, parseISO, isSameDay } from 'date-fns';
import { useEmployers, useShifts, usePayPeriods, usePublicHolidays } from '../hooks/useApiData';
import ShiftCard from '../components/ShiftCard';
import PayDateCard from '../components/PayDateCard';
import { Shift, EmployerPayPeriods, PayPeriod } from '../api/mockApi';

const Overview = () => {

  const { user } = useAuth();
  
  // Function to get a greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  
  // Get date range for current month and next month
  const today = new Date();
  const currentMonthStart = format(startOfMonth(today), 'yyyy-MM-dd');
  const nextMonthEnd = format(endOfMonth(addMonths(today, 1)), 'yyyy-MM-dd');
  
  // Fetch employers
  const { data: employersResp } = useEmployers();
  const employersData = employersResp?.data || [];
  
  // Get employer states for public holidays
  const employerStates = useMemo(() => {
    return [...new Set(employersData.map((employer: any) => employer.state))].filter(Boolean) as string[];
  }, [employersData]);
  
  // Fetch public holidays for the states of all employers
  const currentYear = new Date().getFullYear().toString();
  const { data: publicHolidaysResp } = usePublicHolidays(employerStates, currentYear);
  const publicHolidays = publicHolidaysResp?.data || [];

  // Fetch shifts for current month and next month
  const { data: shiftsResp, isLoading: shiftsLoading } = useShifts(currentMonthStart, nextMonthEnd);
  const shiftsData = shiftsResp?.data || [];
  
  // Fetch pay periods for current month and next month
  const { data: payPeriodsResp, isLoading: payPeriodsLoading } = usePayPeriods(currentMonthStart, nextMonthEnd);
  const payPeriodsData = payPeriodsResp?.data || [];

  
  // Get the next shift for each employer
  const nextShiftsByEmployer = useMemo(() => {
    if (!shiftsData || !Array.isArray(shiftsData)) {
      console.log('shiftsData is not an array:', shiftsData);
      return {};
    }
    
    console.log('Processing shifts data in Overview:', shiftsData);
    
    const result: Record<string, Shift> = {};
    // Use current date and time as 'now' to ensure consistent behavior
    const now = new Date();
    // Group shifts by employer
    const shiftsByEmployer: Record<string, Shift[]> = {};
    
    // Process each shift with thorough validation
    shiftsData.forEach((shift: any) => {
      try {
        // Make sure shift has all required properties
        if (shift && shift.date && shift.start && shift.end && shift.employerId) {
          // Combine date and start/end time into Date objects
          const shiftDate = shift.date;
          const shiftStart = new Date(`${shiftDate}T${shift.start}`);
          const shiftEnd = new Date(`${shiftDate}T${shift.end}`);
          
          if (isNaN(shiftStart.getTime()) || isNaN(shiftEnd.getTime())) {
            console.error('Invalid shift date/time:', shift);
            return;
          }

          // Check if the shift is today and hasn't ended yet, or is in the future
          const isToday = shiftDate === format(now, 'yyyy-MM-dd');
          const hasEnded = shiftEnd < now;
          const isInFuture = shiftStart > now;
          
          // Include shifts that are either:
          // 1. Today and haven't ended yet, or
          // 2. In the future
          if ((isToday && !hasEnded) || isInFuture) {
            if (!shiftsByEmployer[shift.employerId]) {
              shiftsByEmployer[shift.employerId] = [];
            }
            shiftsByEmployer[shift.employerId].push(shift);
          }
        }
      } catch (error) {
        console.error('Error processing shift:', shift, error);
      }
    });
    
    // Get the next shift for each employer
    employersData.forEach((employer: any) => {
      const employerShifts = shiftsByEmployer[employer.id] || [];
      if (employerShifts.length > 0) {
        // Sort shifts by start datetime
        employerShifts.sort((a, b) => {
          const aStart = new Date(`${a.date}T${a.start}`);
          const bStart = new Date(`${b.date}T${b.start}`);
          return aStart.getTime() - bStart.getTime();
        });
        // Get the next shift
        result[employer.id] = employerShifts[0];
      }
    });
    
    console.log('Next shifts by employer:', result);
    return result;
  }, [shiftsData]);
  
  // Get upcoming pay dates for each employer
  const upcomingPayDates = useMemo(() => {
    if (!payPeriodsData || !Array.isArray(payPeriodsData)) {
      console.log('payPeriodsData is not valid:', payPeriodsData);
      return {};
    }
    
    console.log('Processing pay periods in Overview:', payPeriodsData);
    
    const result: Record<string, PayPeriod> = {};
    const today = new Date();
    
    // Process each employer's pay periods with validation
    payPeriodsData.forEach((employerData: EmployerPayPeriods) => {
      try {
        // Validate employer data
        if (!employerData || !employerData.periods || !Array.isArray(employerData.periods)) {
          return;
        }
        
        // Filter pay periods that are upcoming
        const upcomingPeriods = employerData.periods.filter((period: PayPeriod) => {
          try {
            if (!period || !period.payDate) return false;
            
            const payDate = new Date(period.payDate);
            if (isNaN(payDate.getTime())) return false;
            
            return isAfter(payDate, today) || payDate.toDateString() === today.toDateString();
          } catch (error) {
            console.error('Error filtering pay period:', period, error);
            return false;
          }
        });
        
        // Find the earliest upcoming pay period
        if (upcomingPeriods.length > 0) {
          // Sort by pay date
          upcomingPeriods.sort((a: PayPeriod, b: PayPeriod) => {
            return new Date(a.payDate).getTime() - new Date(b.payDate).getTime();
          });
          
          // Get the earliest pay period
          result[employerData.employerId] = upcomingPeriods[0];
        }
      } catch (error) {
        console.error('Error processing employer pay periods:', employerData, error);
      }
    });
    
    console.log('Upcoming pay dates:', result);
    return result;
  }, [payPeriodsData]);
  
  return (
    <div className="w-full px-0 sm:px-4" style={{ backgroundColor: '#fff' }}>
      <div className="w-full lg:max-w-4xl mx-auto">
        <div className="text-center pt-4 pb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {user ? `${getGreeting()}, ${user.name.split(' ')[0]}!` : 'Welcome to Casual Pay'}
          </h1>
        </div>
        
        {user && (
          <>
            {/* Upcoming Shifts Section */}
            <div className="mt-4 mb-8">
              <h2 className="text-xl font-semibold mb-4 text-center">Your Upcoming Shifts</h2>
              {shiftsLoading ? (
                <div className="bg-white p-4 text-center text-gray-500 w-full">
                  Loading shifts...
                </div>
              ) : (
                <div className="w-full">
                  {Object.keys(nextShiftsByEmployer).length > 0 ? (
                    employersData.map((employer: any) => {
                      const nextShift = nextShiftsByEmployer[employer.id];
                      if (!nextShift) return null;
                      return (
                        <div key={`shift-${employer.id}`} className="w-full">
                          <ShiftCard 
                            shift={nextShift} 
                            color={employer.color}
                            isPublicHoliday={publicHolidays.some((holiday: any) => 
                              isSameDay(parseISO(holiday.date), parseISO(nextShift.date))
                            )}
                          />
                        </div>
                      );
                    })
                  ) : (
                    <div className="bg-white p-4 text-center text-gray-500 w-full">
                      No upcoming shifts scheduled
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Upcoming Pay Dates Section */}
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-4 text-center">Your Upcoming Payments</h2>
              {payPeriodsLoading ? (
                <div className="bg-white p-4 text-center text-gray-500 w-full">
                  Loading pay dates...
                </div>
              ) : (
                <div className="w-full">
                  {Object.keys(upcomingPayDates).length > 0 ? (
                    employersData.map((employer: any) => {
                      const payDate = upcomingPayDates[employer.id];
                      
                      return payDate ? (
                        <div key={`pay-${employer.id}`} className="w-full">
                          <PayDateCard 
                            payDate={{
                              date: payDate.payDate,
                              employerId: employer.id,
                              employer: employer.name,
                              amount: payDate.grossPay,
                              periodStart: payDate.startDate,
                              periodEnd: payDate.endDate,
                              hours: payDate.totalHours,
                              payRate: payDate.payCategories && payDate.payCategories[0]?.rate || 0,
                              tax: payDate.tax,
                              employeeLevel: employer.level,
                              awardDescription: employer.awardDescription,
                              sgcPercentage: employer.sgcPercentage,
                              payCategories: payDate.payCategories || [],
                              // Use shifts directly as shiftDates since they are already date strings
                              shiftDates: Array.isArray(payDate.shifts) ? payDate.shifts : [],
                              shifts: payDate.shifts
                            }} 
                            color={employer.color} 
                          />
                        </div>
                      ) : null;
                    })
                  ) : (
                    <div className="bg-white p-4 text-center text-gray-500 w-full">
                      No upcoming payments scheduled
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Overview;
