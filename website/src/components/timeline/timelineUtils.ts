import { Shift, PayDate, Employer } from '../../utils/shiftCalculator';
import { MonthlySummary } from './types';

/**
 * Format date to display in a readable format
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

/**
 * Format time to display in a readable format
 */
export const formatTime = (timeString: string): string => {
  const [hours, minutes] = timeString.split(':');
  return `${hours}:${minutes}`;
};

/**
 * Get employer color based on employerId
 */
export const getEmployerColor = (employerId: string, employers: Employer[]): string => {
  const employer = employers.find(emp => emp.id === employerId);
  return employer?.color || '#f59e0b'; // Default to orange if not found
};

/**
 * Get month names with years for the current and next month
 */
export const getMonthsText = (): string => {
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();
  
  const nextDate = new Date(currentDate);
  nextDate.setMonth(currentDate.getMonth() + 1);
  const nextMonth = nextDate.toLocaleString('default', { month: 'long' });
  const nextYear = nextDate.getFullYear();
  
  if (currentYear === nextYear) {
    return `${currentMonth} & ${nextMonth} ${currentYear}`;
  } else {
    return `${currentMonth} ${currentYear} & ${nextMonth} ${nextYear}`;
  }
};

/**
 * Calculate monthly summaries with tax information
 * Only adds up pay dates for each month instead of calculating from shifts
 * Only includes summaries for the relevant time period (next two months)
 */
export const calculateMonthlySummaries = (
  _filteredShifts: Shift[], // Unused but kept for API compatibility
  payDates: PayDate[] | undefined,
  employers: Employer[]
): MonthlySummary[] => {
  const summaryMap: Record<string, MonthlySummary> = {};
  
  // Only process pay dates to build monthly summaries
  if (!payDates || payDates.length === 0) {
    return [];
  }
  
  // Get current date and end of next month for filtering
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Create date for the start of current month
  const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
  
  // Create date for the end of next month
  const endOfNextMonth = new Date(currentYear, currentMonth + 2, 0);
  
  // Filter pay dates for current month and next month only
  const relevantPayDates = payDates.filter(payDate => {
    const payDateObj = new Date(payDate.date);
    return payDateObj >= startOfCurrentMonth && payDateObj <= endOfNextMonth;
  });
  
  // Process only relevant pay dates to build monthly summaries
  relevantPayDates.forEach(payDate => {
    const payDateObj = new Date(payDate.date);
    const monthYear = `${payDateObj.getFullYear()}-${payDateObj.getMonth() + 1}`;
    const monthName = payDateObj.toLocaleString('default', { month: 'long' });
    
    // Initialize month summary if it doesn't exist
    if (!summaryMap[monthYear]) {
      summaryMap[monthYear] = {
        month: monthName,
        year: payDateObj.getFullYear(),
        employers: {},
        totalShifts: 0,
        totalHours: 0,
        totalPay: 0,
        totalTax: 0,
        totalNetPay: 0
      };
    }
    
    // Initialize employer summary if it doesn't exist
    if (!summaryMap[monthYear].employers[payDate.employerId]) {
      const employer = employers.find(emp => emp.id === payDate.employerId);
      summaryMap[monthYear].employers[payDate.employerId] = {
        name: employer?.name || payDate.employer,
        color: getEmployerColor(payDate.employerId, employers),
        shifts: 0,
        hours: 0,
        pay: 0,
        tax: 0,
        netPay: 0
      };
    }
    
    // Update employer summary directly from pay date
    const employerSummary = summaryMap[monthYear].employers[payDate.employerId];
    employerSummary.shifts += payDate.shiftCount;
    employerSummary.hours += payDate.totalHours;
    employerSummary.pay += payDate.amount;
    employerSummary.tax += payDate.tax;
    employerSummary.netPay += payDate.netPay;
    
    // Update month totals
    summaryMap[monthYear].totalShifts += payDate.shiftCount;
    summaryMap[monthYear].totalHours += payDate.totalHours;
    summaryMap[monthYear].totalPay += payDate.amount;
    summaryMap[monthYear].totalTax += payDate.tax;
    summaryMap[monthYear].totalNetPay += payDate.netPay;
  });
  
  // Convert map to array and sort by date (oldest first - ascending)
  return Object.values(summaryMap).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return new Date(`${a.month} 1, ${a.year}`).getTime() - 
           new Date(`${b.month} 1, ${b.year}`).getTime();
  });
};

/**
 * Filter shifts for the current and next month
 * Includes all shifts in these months, even if they are in the past
 */
export const filterShiftsForNextTwoMonths = (shifts: Shift[]): Shift[] => {
  const now = new Date();
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const twoMonthsFromNow = new Date(now.getFullYear(), now.getMonth() + 2, 0);
  
  return shifts.filter(shift => {
    const shiftDate = new Date(shift.date);
    return shiftDate >= startOfCurrentMonth && shiftDate <= twoMonthsFromNow;
  });
};

/**
 * Filter pay dates for the current and next month
 * Includes all pay dates in these months, even if they are in the past
 */
export const filterPayDatesForNextTwoMonths = (payDates: PayDate[]): PayDate[] => {
  const now = new Date();
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const twoMonthsFromNow = new Date(now.getFullYear(), now.getMonth() + 2, 0);
  
  const filteredPayDates = payDates.filter(payDate => {
    const payDateObj = new Date(payDate.date);
    return payDateObj >= startOfCurrentMonth && payDateObj <= twoMonthsFromNow;
  });
  
  // Sort by date
  return filteredPayDates.sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
};
