import { useAuth } from '../context/AuthContext';
import { useMemo } from 'react';
import userData from './user.json';
import shiftsData from './shifts.json';
import ShiftCard from '../components/ShiftCard';
import PayDateCard from '../components/PayDateCard';
import { addDays, parseISO } from 'date-fns';

const Overview = () => {
  const { user } = useAuth();
  
  // Function to get a greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  
  // Get the next shift for each employer
  const nextShiftsByEmployer = useMemo(() => {
    const today = new Date();
    const result: Record<string, any> = {};
    
    // Group shifts by employer
    const shiftsByEmployer: Record<string, any[]> = {};
    
    shiftsData.shifts.forEach(shift => {
      const shiftDate = new Date(shift.date);
      if (shiftDate >= today) {
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
  }, []);
  
  // Generate upcoming pay dates for each employer
  const upcomingPayDates = useMemo(() => {
    const result: Record<string, any> = {};
    
    userData.employers.forEach(employer => {
      if (employer.nextPayDate) {
        // Calculate pay period start date based on the pay date
        let periodStartDate: Date | null = null;
        let periodEndDate: Date | null = null;
        
        if (employer.payPeriodDays && employer.payPeriodStart) {
          const payDate = parseISO(employer.nextPayDate);
          
          // Calculate the end date (usually the day before pay date)
          periodEndDate = addDays(payDate, -1);
          
          // Calculate the start date based on pay period length
          periodStartDate = addDays(periodEndDate, -employer.payPeriodDays + 1);
        }
        
        // Create pay date object
        result[employer.id] = {
          date: employer.nextPayDate,
          employerId: employer.id,
          employer: employer.name,
          periodStart: periodStartDate ? periodStartDate.toISOString().split('T')[0] : undefined,
          periodEnd: periodEndDate ? periodEndDate.toISOString().split('T')[0] : undefined
        };
      }
    });
    
    return result;
  }, []);
  
  return (
    <div className="container mx-auto px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center pt-4 pb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {user ? `${getGreeting()}, ${user.name.split(' ')[0]}!` : 'Welcome to Casual Pay'}
          </h1>
        </div>
        
        {user && (
          <>
            {/* Upcoming Shifts Section */}
            <div className="mt-4 mb-8">
              <h2 className="text-xl font-semibold mb-4">Your Upcoming Shifts</h2>
              <div className="space-y-4">
                {userData.employers.map(employer => {
                  const nextShift = nextShiftsByEmployer[employer.id];
                  
                  return nextShift ? (
                    <div key={`shift-${employer.id}`}>
                      <ShiftCard 
                        shift={nextShift} 
                        color={employer.color} 
                      />
                    </div>
                  ) : (
                    <div 
                      key={`shift-${employer.id}`} 
                      className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 text-center text-gray-500"
                    >
                      No upcoming shifts for {employer.name}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Upcoming Pay Dates Section */}
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-4">Your Upcoming Payments</h2>
              <div className="space-y-4">
                {userData.employers.map(employer => {
                  const payDate = upcomingPayDates[employer.id];
                  
                  return payDate ? (
                    <div key={`pay-${employer.id}`}>
                      <PayDateCard 
                        payDate={payDate} 
                        color={employer.color} 
                      />
                    </div>
                  ) : (
                    <div 
                      key={`pay-${employer.id}`} 
                      className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 text-center text-gray-500"
                    >
                      No upcoming payments for {employer.name}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Overview;
