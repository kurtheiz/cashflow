import { useAuth } from '../context/AuthContext';
import { useMemo } from 'react';
import { format, addMonths, startOfMonth, endOfMonth, isAfter, parseISO, isSameDay } from 'date-fns';
import { useEmployers, useShifts, usePayPeriods, usePublicHolidays } from '../hooks/useApiData';
import ShiftCard from '../components/ShiftCard';
import PayDateCard from '../components/PayDateCard';
import CashflowChart from '../components/CashflowChart';
import { EmployerPayPeriods, PayPeriod } from '../api/mockApi';

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

  
  // Get the next shift for each employer, sorted by date
  const nextShiftsByEmployer = useMemo(() => {
    if (!shiftsData || !Array.isArray(shiftsData)) {
      console.log('shiftsData is not an array:', shiftsData);
      return [];
    }
    
    console.log('Processing shifts data in Overview:', shiftsData);
    
    // Use current date and time as 'now' to ensure consistent behavior
    const now = new Date();
    
    // Group shifts by employer
    const shiftsByEmployer: Record<string, any[]> = {};
    
    // Process each shift with thorough validation
    shiftsData.forEach((shift: any) => {
      try {
        // Make sure shift has all required properties
        if (shift && shift.date && shift.start && shift.end && shift.employerId) {
          // Combine date and start/end time into Date objects
          const shiftDate = shift.date;
          
          // Ensure times have proper format with leading zeros
          const formatTime = (timeStr: string) => {
            // If time is in format H:MM, add leading zero
            if (timeStr.length === 4 && timeStr.indexOf(':') === 1) {
              return `0${timeStr}`;
            }
            return timeStr;
          };
          
          const shiftStart = new Date(`${shiftDate}T${formatTime(shift.start)}`);
          const shiftEnd = new Date(`${shiftDate}T${formatTime(shift.end)}`);
          
          if (isNaN(shiftStart.getTime()) || isNaN(shiftEnd.getTime())) {
            console.error('Invalid shift date/time:', shift);
            return;
          }

          // Check if the shift is today and hasn't ended yet, or is in the future
          const isToday = shiftDate === format(now, 'yyyy-MM-dd');
          const hasEnded = shiftEnd < now;
          const isInFuture = shiftStart > now;
          
          // Include shifts that are either:
          // 1. Today and hasn't ended yet, or
          // 2. In the future
          if ((isToday && !hasEnded) || isInFuture) {
            if (!shiftsByEmployer[shift.employerId]) {
              shiftsByEmployer[shift.employerId] = [];
            }
            
            // Add shift with its start time for sorting
            shiftsByEmployer[shift.employerId].push({
              ...shift,
              startDateTime: shiftStart
            });
          }
        }
      } catch (error) {
        console.error('Error processing shift:', shift, error);
      }
    });
    
    // Get the next shift for each employer
    const nextShifts: any[] = [];
    
    // For each employer, get their next shift
    Object.keys(shiftsByEmployer).forEach(employerId => {
      const employerShifts = shiftsByEmployer[employerId];
      if (employerShifts.length > 0) {
        // Sort shifts by start datetime
        employerShifts.sort((a: any, b: any) => {
          return a.startDateTime.getTime() - b.startDateTime.getTime();
        });
        
        // Get the next shift
        nextShifts.push(employerShifts[0]);
      }
    });
    
    // Sort the next shifts by date
    nextShifts.sort((a: any, b: any) => {
      return a.startDateTime.getTime() - b.startDateTime.getTime();
    });
    
    console.log('Next shifts by employer sorted by date:', nextShifts);
    return nextShifts;
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
        <div className="text-center pt-4 pb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {user ? `${getGreeting()}, ${user.name.split(' ')[0]}!` : 'Welcome to CasualPay'}
          </h1>
          {user && (
            <p className="text-gray-600 mt-2">
              Today is {format(new Date(), 'EEEE, d MMM yyyy')}
            </p>
          )}
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
                  {nextShiftsByEmployer.length > 0 ? (
                    nextShiftsByEmployer.map((shift: any, index: number) => {
                      // Find the employer for this shift
                      const employer = employersData.find((emp: any) => emp.id === shift.employerId);
                      if (!employer) return null;
                      
                      return (
                        <div key={`shift-${shift.employerId}-${shift.date}-${index}`} className="w-full">
                          <ShiftCard 
                            shift={shift} 
                            color={employer.color}
                            isPublicHoliday={publicHolidays.some((holiday: any) => 
                              isSameDay(parseISO(holiday.date), parseISO(shift.date))
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
            <div className="mt-4 mb-8">
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
                              amount: payDate.grossPay, // Kept for backward compatibility
                              grossPay: payDate.grossPay,
                              periodStart: payDate.startDate,
                              periodEnd: payDate.endDate,
                              hours: payDate.totalHours,
                              payRate: payDate.payCategories && payDate.payCategories.length > 0 ? 
                                payDate.payCategories[0].rate : 0,
                              tax: payDate.tax,
                              netPay: payDate.netPay,
                              employeeLevel: employer.level,
                              awardDescription: employer.awardDescription,
                              sgcPercentage: employer.sgcPercentage,
                              payCategories: payDate.payCategories || [],
                              // Use shifts directly as shiftDates since they are already date strings
                              shiftDates: Array.isArray(payDate.shifts) ? payDate.shifts : [],
                              shifts: payDate.shifts,
                              // Add allowances data - ensure these are always defined
                              allowances: payDate.allowances || [],
                              allowanceTotal: payDate.allowanceTotal || 0, // Ensure it's never undefined
                              totalGrossPay: payDate.totalGrossPay || 0 // Ensure it's never undefined
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
            
            {/* Cashflow Chart Section */}
            <div className="mt-4 mb-8">
              <h2 className="text-xl font-semibold mb-4 text-center">Your Income This Year</h2>
              <CashflowChart year={new Date().getFullYear()} />
            </div>
            

          </>
        )}
      </div>
    </div>
  );
};

export default Overview;
