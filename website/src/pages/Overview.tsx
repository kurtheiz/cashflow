import { useAuth } from '../context/AuthContext';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, addMonths, startOfMonth, endOfMonth, isAfter } from 'date-fns';
import userData from '../api/data/user.json';
import ShiftCard from '../components/ShiftCard';
import PayDateCard from '../components/PayDateCard';
import { api as mockApi } from '../api/mockApi';
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
  
  // Fetch shifts for current month and next month
  const { data: shiftsData, isLoading: shiftsLoading } = useQuery({
    queryKey: ['shifts', currentMonthStart, nextMonthEnd],
    queryFn: async () => {
      const response = await mockApi.getShifts(currentMonthStart, nextMonthEnd);
      return response.data;
    },
    enabled: !!user, // Only run if user is logged in
  });
  
  // Fetch pay periods for current month and next month
  const { data: payPeriodsData, isLoading: payPeriodsLoading } = useQuery({
    queryKey: ['payPeriods', currentMonthStart, nextMonthEnd],
    queryFn: async () => {
      const response = await mockApi.getPayPeriods(currentMonthStart, nextMonthEnd);
      return response.data;
    },
    enabled: !!user, // Only run if user is logged in
  });
  
  // Get the next shift for each employer
  const nextShiftsByEmployer = useMemo(() => {
    if (!shiftsData) return {};
    
    const result: Record<string, Shift> = {};
    const today = new Date();
    
    // Group shifts by employer
    const shiftsByEmployer: Record<string, Shift[]> = {};
    
    shiftsData.forEach((shift: any) => {
      const shiftDate = new Date(shift.date);
      if (isAfter(shiftDate, today) || shiftDate.toDateString() === today.toDateString()) {
        if (!shiftsByEmployer[shift.employerId]) {
          shiftsByEmployer[shift.employerId] = [];
        }
        shiftsByEmployer[shift.employerId].push(shift);
      }
    });
    
    // Get the next shift for each employer
    userData.employers.forEach(employer => {
      const employerShifts = shiftsByEmployer[employer.id] || [];
      if (employerShifts.length > 0) {
        // Sort shifts by date
        employerShifts.sort((a, b) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
        
        // Get the next shift
        result[employer.id] = employerShifts[0];
      }
    });
    
    return result;
  }, [shiftsData]);
  
  // Get upcoming pay dates for each employer
  const upcomingPayDates = useMemo(() => {
    if (!payPeriodsData) return {};
    
    const result: Record<string, PayPeriod> = {};
    const today = new Date();
    
    // Process each employer's pay periods
    payPeriodsData.forEach((employerData: EmployerPayPeriods) => {
      // Filter pay periods that are upcoming
      const upcomingPeriods = employerData.periods.filter((period: PayPeriod) => {
        const payDate = new Date(period.payDate);
        return isAfter(payDate, today) || payDate.toDateString() === today.toDateString();
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
    });
    
    return result;
  }, [payPeriodsData]);
  
  return (
    <div className="w-full px-0 sm:px-4" style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
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
                  {userData.employers.map((employer: any) => {
                    const nextShift = nextShiftsByEmployer[employer.id];
                    
                    return nextShift ? (
                      <div key={`shift-${employer.id}`} className="w-full">
                        <ShiftCard 
                          shift={nextShift} 
                          color={employer.color} 
                        />
                      </div>
                    ) : (
                      <div 
                        key={`shift-${employer.id}`} 
                        className="bg-white p-4 text-center text-gray-500 w-full"
                      >
                        No upcoming shifts for {employer.name}
                      </div>
                    );
                  })}
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
                  {userData.employers.map((employer: any) => {
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
                            payRate: payDate.payCategories[0]?.rate || 0,
                            tax: payDate.tax,
                            employeeLevel: employer.level,
                            awardDescription: employer.awardDescription,
                            sgcPercentage: employer.sgcPercentage,
                            payCategories: payDate.payCategories,
                            // Use shifts directly as shiftDates since they are already date strings
                            shiftDates: Array.isArray(payDate.shifts) ? payDate.shifts : [],
                            shifts: payDate.shifts
                          }} 
                          color={employer.color} 
                        />
                      </div>
                    ) : (
                      <div 
                        key={`pay-${employer.id}`} 
                        className="bg-white p-4 text-center text-gray-500 w-full"
                      >
                        No upcoming payments for {employer.name}
                      </div>
                    );
                  })}
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
