import { useAuth } from '../context/AuthContext';
import { useMemo } from 'react';
import { format, addMonths, startOfMonth, endOfMonth, isAfter, parseISO, isSameDay } from 'date-fns';
import { useEmployers, useShifts, usePayPeriods, usePublicHolidays } from '../hooks/useApiData';
import ShiftCard from '../components/ShiftCard';
import PayDateCard from '../components/PayDateCard';
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
                              amount: payDate.grossPay,
                              grossPay: payDate.grossPay,
                              periodStart: payDate.startDate,
                              periodEnd: payDate.endDate,
                              hours: payDate.totalHours,
                              payRate: payDate.payCategories && payDate.payCategories[0]?.rate || 0,
                              tax: payDate.tax,
                              netPay: payDate.netPay,
                              employeeLevel: employer.level,
                              awardDescription: employer.awardDescription,
                              sgcPercentage: employer.sgcPercentage,
                              payCategories: payDate.payCategories || [],
                              // Use shifts directly as shiftDates since they are already date strings
                              shiftDates: Array.isArray(payDate.shifts) ? payDate.shifts : [],
                              shifts: payDate.shifts,
                              // Add allowances data
                              allowances: payDate.allowances || [],
                              allowanceTotal: payDate.allowanceTotal || 0,
                              totalGrossPay: payDate.totalGrossPay || 0
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
            
            {/* Monthly Earnings Section */}
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-4 text-center">Monthly Earnings</h2>
              {payPeriodsLoading ? (
                <div className="bg-white p-4 text-center text-gray-500 w-full">
                  Loading earnings data...
                </div>
              ) : (
                <div className="w-full">
                  {payPeriodsData && payPeriodsData.length > 0 ? (
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                      {/* Calculate monthly earnings for all available months */}
                      {(() => {
                        // Create a map to store earnings by month and employer
                        const monthlyData: Record<string, Record<string, {
                          employerId: string,
                          employer: string,
                          grossTotal: number,
                          taxTotal: number,
                          afterTaxTotal: number,
                          superTotal: number,
                          shiftsCount: number
                        }>> = {};
                        
                        // Track all months we have data for
                        const monthYearKeys: string[] = [];
                        
                        // Process each employer's pay periods
                        payPeriodsData.forEach((employerData: any) => {
                          if (!employerData || !employerData.periods || !Array.isArray(employerData.periods)) {
                            return;
                          }
                          
                          // Find the employer details
                          const employer = employersData.find((e: any) => e.id === employerData.employerId);
                          if (!employer) return;
                          
                          // Process each pay period
                          employerData.periods.forEach((period: any) => {
                            if (!period || !period.payDate) return;
                            
                            const payDate = new Date(period.payDate);
                            const monthYear = format(payDate, 'yyyy-MM'); // Format as YYYY-MM for sorting
                            
                            // Add to month keys if not already there
                            if (!monthYearKeys.includes(monthYear)) {
                              monthYearKeys.push(monthYear);
                            }
                            
                            // Initialize month in the map if not exists
                            if (!monthlyData[monthYear]) {
                              monthlyData[monthYear] = {};
                            }
                            
                            // Initialize employer in the month if not exists
                            if (!monthlyData[monthYear][employerData.employerId]) {
                              monthlyData[monthYear][employerData.employerId] = {
                                employerId: employerData.employerId,
                                employer: employerData.employer,
                                grossTotal: 0,
                                taxTotal: 0,
                                afterTaxTotal: 0,
                                superTotal: 0,
                                shiftsCount: 0
                              };
                            }
                            
                            // Add pay data
                            monthlyData[monthYear][employerData.employerId].grossTotal += period.grossPay || 0;
                            monthlyData[monthYear][employerData.employerId].taxTotal += period.tax || 0;
                            monthlyData[monthYear][employerData.employerId].afterTaxTotal += 
                              (period.grossPay || 0) - (period.tax || 0);
                            
                            // Calculate super if available
                            if (employer.sgcPercentage && period.grossPay) {
                              const superAmount = period.grossPay * (employer.sgcPercentage / 100);
                              monthlyData[monthYear][employerData.employerId].superTotal += superAmount;
                            }
                            
                            // Count shifts in this period
                            if (shiftsData && Array.isArray(shiftsData)) {
                              const periodShifts = shiftsData.filter(shift => {
                                if (!shift || !shift.date || !shift.employerId) return false;
                                
                                const shiftDate = new Date(shift.date);
                                const periodStartDate = new Date(period.startDate);
                                const periodEndDate = new Date(period.endDate);
                                
                                return (
                                  shift.employerId === employerData.employerId &&
                                  shiftDate >= periodStartDate &&
                                  shiftDate <= periodEndDate
                                );
                              });
                              
                              monthlyData[monthYear][employerData.employerId].shiftsCount += periodShifts.length;
                            }
                          });
                        });
                        
                        // Sort months in ascending order (oldest first)
                        monthYearKeys.sort((a, b) => a.localeCompare(b));
                        
                        return monthYearKeys.length > 0 ? (
                          <div className="divide-y divide-gray-200">
                            {monthYearKeys.map((monthYear) => {
                              // Convert employer data to array and sort by name
                              const employerEarnings = Object.values(monthlyData[monthYear])
                                .filter(item => item.grossTotal > 0)
                                .sort((a, b) => a.employer.localeCompare(b.employer));
                              
                              // Skip months with no earnings
                              if (employerEarnings.length === 0) return null;
                              
                              // Get month display name
                              const monthDisplay = format(new Date(monthYear + '-01'), 'MMMM yyyy');
                              
                              return (
                                <div key={monthYear} className="pb-2">
                                  <div className="p-3 bg-gray-50 border-b border-gray-200">
                                    <h3 className="font-semibold text-gray-900">{monthDisplay}</h3>
                                  </div>
                                  
                                  {/* Employers for this month */}
                                  <div className="divide-y divide-gray-100">
                                    {employerEarnings.map((item) => (
                                      <div key={`${monthYear}-${item.employerId}`} className="p-4">
                                        <div className="flex items-center justify-between mb-2">
                                          <div>
                                            <h3 className="font-medium text-gray-900">{item.employer}</h3>
                                          </div>
                                          <div className="text-right">
                                            <div className="font-semibold text-gray-900">${item.afterTaxTotal.toFixed(2)}</div>
                                            <div className="text-xs text-gray-500">After Tax</div>
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-4 gap-4 mt-3 text-sm">
                                          <div>
                                            <div className="text-gray-500">Shifts</div>
                                            <div className="font-medium">{item.shiftsCount}</div>
                                          </div>
                                          <div>
                                            <div className="text-gray-500">Gross Pay</div>
                                            <div className="font-medium">${item.grossTotal.toFixed(2)}</div>
                                          </div>
                                          <div>
                                            <div className="text-gray-500">Tax</div>
                                            <div className="font-medium">${item.taxTotal.toFixed(2)}</div>
                                          </div>
                                          <div>
                                            <div className="text-gray-500">Super</div>
                                            <div className="font-medium">${item.superTotal.toFixed(2)}</div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                    
                                    {/* Monthly total */}
                                    <div className="p-4 bg-gray-50">
                                      <div className="flex items-center justify-between">
                                        <h3 className="font-medium text-gray-700">Total</h3>
                                        <div className="text-right">
                                          <div className="font-semibold text-gray-900">
                                            ${employerEarnings.reduce((sum, item) => sum + item.afterTaxTotal, 0).toFixed(2)}
                                          </div>
                                          <div className="text-xs text-gray-500">After Tax</div>
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-4 gap-4 mt-3 text-sm">
                                        <div>
                                          <div className="text-gray-500">Shifts</div>
                                          <div className="font-medium">
                                            {employerEarnings.reduce((sum, item) => sum + item.shiftsCount, 0)}
                                          </div>
                                        </div>
                                        <div>
                                          <div className="text-gray-500">Gross Pay</div>
                                          <div className="font-medium">
                                            ${employerEarnings.reduce((sum, item) => sum + item.grossTotal, 0).toFixed(2)}
                                          </div>
                                        </div>
                                        <div>
                                          <div className="text-gray-500">Tax</div>
                                          <div className="font-medium">
                                            ${employerEarnings.reduce((sum, item) => sum + item.taxTotal, 0).toFixed(2)}
                                          </div>
                                        </div>
                                        <div>
                                          <div className="text-gray-500">Super</div>
                                          <div className="font-medium">
                                            ${employerEarnings.reduce((sum, item) => sum + item.superTotal, 0).toFixed(2)}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            No earnings data available
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="bg-white p-4 text-center text-gray-500 w-full rounded-lg shadow-sm">
                      No earnings data available
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
