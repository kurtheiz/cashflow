import { format, isAfter, parseISO, isSameDay } from 'date-fns';
import { ShiftWithDateTime, MonthlyData, EmployerEarnings } from './types';

// Get a greeting based on time of day
export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

// Ensure times have proper format with leading zeros
export const formatTime = (timeStr: string): string => {
  // If time is in format H:MM, add leading zero
  if (timeStr.length === 4 && timeStr.indexOf(':') === 1) {
    return `0${timeStr}`;
  }
  return timeStr;
};

// Process shifts data to get next shifts by employer
export const processNextShiftsByEmployer = (shiftsData: any[]): ShiftWithDateTime[] => {
  if (!shiftsData || !Array.isArray(shiftsData)) {
    console.log('shiftsData is not an array:', shiftsData);
    return [];
  }
  
  // Use current date and time as 'now' to ensure consistent behavior
  const now = new Date();
  
  // Group shifts by employer
  const shiftsByEmployer: Record<string, ShiftWithDateTime[]> = {};
  
  // Process each shift with thorough validation
  shiftsData.forEach((shift: any) => {
    try {
      // Make sure shift has all required properties
      if (shift && shift.date && shift.start && shift.end && shift.employerId) {
        // Combine date and start/end time into Date objects
        const shiftDate = shift.date;
        
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
  const nextShifts: ShiftWithDateTime[] = [];
  
  // For each employer, get their next shift
  Object.keys(shiftsByEmployer).forEach(employerId => {
    const employerShifts = shiftsByEmployer[employerId];
    if (employerShifts.length > 0) {
      // Sort shifts by start datetime
      employerShifts.sort((a, b) => {
        return a.startDateTime.getTime() - b.startDateTime.getTime();
      });
      
      // Get the next shift
      nextShifts.push(employerShifts[0]);
    }
  });
  
  // Sort the next shifts by date
  nextShifts.sort((a, b) => {
    return a.startDateTime.getTime() - b.startDateTime.getTime();
  });
  
  return nextShifts;
};

// Process pay periods data to calculate monthly earnings
export const calculateMonthlyEarnings = (
  payPeriodsData: any[],
  employersData: any[],
  shiftsData: any[]
): { monthlyData: MonthlyData; monthYearKeys: string[] } => {
  // Create a map to store earnings by month and employer
  const monthlyData: MonthlyData = {};
  
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
  
  return { monthlyData, monthYearKeys };
};

// Check if a shift date is a public holiday
export const isPublicHoliday = (shiftDate: string, publicHolidays: any[]): boolean => {
  return publicHolidays.some((holiday: any) => 
    isSameDay(parseISO(holiday.date), parseISO(shiftDate))
  );
};
