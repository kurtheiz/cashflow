import configData from '../config.json';

// Define types for the config data structure
type PublicHoliday = { date: string; name: string; regional?: boolean | string };
type StateHolidays = { [state: string]: PublicHoliday[] };
type YearHolidays = { national: PublicHoliday[] } & StateHolidays;
type PublicHolidaysData = { [year: string]: YearHolidays };

// Type for the entire config structure
interface ConfigData {
  award: {
    name: string;
    code: string;
    effectiveDate: string;
  };
  breaks: {
    restBreak: {
      description: string;
      duration: number;
      isPaid: boolean;
      countsAsTimeWorked: boolean;
    };
    mealBreak: {
      description: string;
      minDuration: number;
      maxDuration: number;
      isPaid: boolean;
      countsAsTimeWorked: boolean;
      shiftworkerException: {
        isPaid: boolean;
        countsAsTimeWorked: boolean;
      };
    };
    breakSchedule: Array<{
      hoursWorked: string;
      hoursRange: [number, number | null];
      restBreaks: number;
      mealBreaks: number;
    }>;
    breakRules: string[];
  };
  casual: CasualRates;
  timeCategories: {
    [key: string]: string;
  };
  meta: {
    lastUpdated: string;
    source: string;
    description: string;
  };
  publicHolidays: PublicHolidaysData;
}

type EmployeeRates = {
  ordinary: number;
  evening_mon_fri: number;
  saturday: number;
  sunday: number;
  public_holiday: number;
};

type EmployeeLevel = {
  hourly_rate: number;
  rates: EmployeeRates;
};

type CasualRates = {
  [level: string]: EmployeeLevel;
};

// Define types
export interface RawShift {
  date: string;
  employerId: string;
  employer: string;
  start: string;
  end: string;
}

export interface Shift extends RawShift {
  break: number;
  hoursWorked: number;
  payrate: number;
  pay: number;
  payDate: string;
  isPublicHoliday?: boolean;
  holidayName?: string;
  eveningHours?: number;
  isSaturday?: boolean;
  isSunday?: boolean;
}

export interface PayDate {
  date: string;
  employerId: string;
  employer: string;
  amount: number;
  totalHours: number;
  shiftCount: number;
  shifts: string[];
  periodStart: string;
  periodEnd: string;
  hoursByRate: Record<string, number>; // Track hours worked at each pay rate
  payByRate: Record<string, number>; // Track money earned at each pay rate
}

export interface Employer {
  id: string;
  name: string;
  level: string;
  state: string;
  taxFreeThreshold?: boolean;
  paycycle: string;
  payday: string;
  superRate?: number;
  payPeriodStart: string;
  payPeriodDays: number;
  nextPayDate: string;
  color?: string;
}

export interface User {
  user: string;
  name: string;
  employers: Employer[];
}

export interface TimelineData {
  shifts: Shift[];
  payDates: PayDate[];
}

// Calculate pay date based on employer's pay cycle
const calculatePayDate = (shiftDate: string, employer: Employer): string => {
  // Create date objects
  const shiftDateObj = new Date(shiftDate);
  
  // Map day names to numbers (0 = Sunday, 1 = Monday, etc.)
  const dayMap: Record<string, number> = {
    'Sunday': 0,
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6
  };
  
  // Get the day numbers
  const payDayNumber = dayMap[employer.payday];
  const periodStartDayNumber = dayMap[employer.payPeriodStart];
  
  // Step 1: Find the most recent pay period start date before or on the shift date
  let periodStartDate = new Date(shiftDateObj);
  const shiftDayOfWeek = shiftDateObj.getDay();
  
  // Calculate days to go back to reach the most recent period start day
  let daysToGoBack = (shiftDayOfWeek - periodStartDayNumber + 7) % 7;
  periodStartDate.setDate(periodStartDate.getDate() - daysToGoBack);
  
  // Step 2: Check if this period start date + payPeriodDays goes beyond today
  // If so, we need to go back one full pay period
  const nextPeriodStartDate = new Date(periodStartDate);
  nextPeriodStartDate.setDate(nextPeriodStartDate.getDate() + employer.payPeriodDays);
  
  if (nextPeriodStartDate <= shiftDateObj) {
    // The shift is in a new period that has already started
    periodStartDate = nextPeriodStartDate;
  }
  
  // Step 3: Calculate the period end date (inclusive)
  const periodEndDate = new Date(periodStartDate);
  periodEndDate.setDate(periodEndDate.getDate() + employer.payPeriodDays - 1);
  
  // Step 4: Calculate the pay date (first occurrence of payday after the period end)
  const payDate = new Date(periodEndDate);
  const daysToPayDay = (payDayNumber - periodEndDate.getDay() + 7) % 7;
  if (daysToPayDay === 0) {
    // If period ends on a pay day, payment is the following week
    payDate.setDate(payDate.getDate() + 7);
  } else {
    payDate.setDate(payDate.getDate() + daysToPayDay);
  }
  
  return payDate.toISOString().split('T')[0];
};

// Calculate shift details including breaks, hours worked, and pay
export const calculateShiftDetails = (
  rawShifts: RawShift[], 
  userData: User, 
  config = configData as unknown as ConfigData
): TimelineData => {
  const processedShifts: Shift[] = [];
  const payDateMap: Record<string, PayDate> = {};
  const employers = userData.employers;

  // Get the configuration data
  const { breaks, casual, publicHolidays } = config;
  
  // Process each shift
  rawShifts.forEach(rawShift => {
    const { date, employerId, employer, start, end } = rawShift;
    
    // Find the employer details
    const employerDetails = employers.find(emp => emp.id === employerId);
    if (!employerDetails) return;
    
    // Calculate shift duration
    const [startHours, startMinutes] = start.split(':').map(Number);
    const [endHours, endMinutes] = end.split(':').map(Number);
    
    let startTimeMinutes = startHours * 60 + startMinutes;
    let endTimeMinutes = endHours * 60 + endMinutes;
    
    // If end time is earlier than start time, assume it's the next day
    if (endTimeMinutes < startTimeMinutes) {
      endTimeMinutes += 24 * 60; // Add 24 hours in minutes
    }
    
    const totalMinutesWorked = endTimeMinutes - startTimeMinutes;
    
    // Determine break time based on hours worked
    let mealBreakCount = 0;
    const totalHoursScheduled = totalMinutesWorked / 60;
    
    // Find the applicable break schedule based on total scheduled hours
    for (const schedule of breaks.breakSchedule) {
      const [minHours, maxHours] = schedule.hoursRange;
      // Ensure minHours is not null before comparison
      if (minHours !== null && totalHoursScheduled >= minHours && (maxHours === null || totalHoursScheduled <= maxHours)) {
        mealBreakCount = schedule.mealBreaks;
        break;
      }
    }
    
    // Calculate meal break minutes (unpaid breaks)
    const mealBreakMinutes = mealBreakCount * breaks.mealBreak.minDuration;
    
    // Calculate unpaid break time (only meal breaks are unpaid by default)
    const unpaidBreakMinutes = breaks.mealBreak.isPaid ? 0 : mealBreakMinutes;
    
    // Calculate actual hours worked (subtracting unpaid break time)
    const hoursWorked = (totalMinutesWorked - unpaidBreakMinutes) / 60;
    
    // Check if it's a public holiday
    const shiftDate = new Date(date);
    const year = shiftDate.getFullYear().toString();
    const formattedDate = date;
    
    let isPublicHoliday = false;
    let holidayName = '';
    
    // Type assertion for the public holidays data
    const typedPublicHolidays = publicHolidays as PublicHolidaysData;
    
    // Check national holidays
    if (typedPublicHolidays[year] && typedPublicHolidays[year].national) {
      const holiday = typedPublicHolidays[year].national.find((h: PublicHoliday) => h.date === formattedDate);
      if (holiday) {
        isPublicHoliday = true;
        holidayName = holiday.name;
      }
    }
    
    // Check state holidays (using employer's state)
    if (!isPublicHoliday && typedPublicHolidays[year] && typedPublicHolidays[year][employerDetails.state]) {
      const holiday = typedPublicHolidays[year][employerDetails.state].find((h: PublicHoliday) => h.date === formattedDate);
      if (holiday) {
        isPublicHoliday = true;
        holidayName = holiday.name;
      }
    }
    
    // Determine if it's a Saturday or Sunday
    const dayOfWeek = shiftDate.getDay();
    const isSaturday = dayOfWeek === 6;
    const isSunday = dayOfWeek === 0;
    
    // Calculate evening hours (after 6 PM)
    let eveningHours = 0;
    const eveningStartMinutes = 18 * 60; // 6 PM in minutes
    
    if (endTimeMinutes > eveningStartMinutes) {
      eveningHours = (endTimeMinutes - Math.max(startTimeMinutes, eveningStartMinutes)) / 60;
    }
    
    // Determine the applicable pay rate
    const employeeLevel = employerDetails.level;
    let payrate = 0;
    let pay = 0;
    
    // Type assertion to ensure TypeScript knows this is a valid key
    const casualRates = casual as CasualRates;
    
    if (casualRates[employeeLevel]) {
      const rates = casualRates[employeeLevel].rates;
      
      if (isPublicHoliday) {
        payrate = rates.public_holiday;
        pay = payrate * hoursWorked;
      } else if (isSunday) {
        payrate = rates.sunday;
        pay = payrate * hoursWorked;
      } else if (isSaturday) {
        payrate = rates.saturday;
        pay = payrate * hoursWorked;
      } else if (eveningHours > 0) {
        // Calculate pay for regular hours and evening hours separately
        const regularHours = hoursWorked - eveningHours;
        payrate = rates.ordinary; // Use the regular rate as the base rate
        pay = (regularHours * rates.ordinary) + (eveningHours * rates.evening_mon_fri);
      } else {
        payrate = rates.ordinary;
        pay = payrate * hoursWorked;
      }
    }
    
    // Calculate pay date based on employer's pay cycle
    const payDate = calculatePayDate(date, employerDetails);
    
    // Create the processed shift
    const processedShift: Shift = {
      ...rawShift,
      break: unpaidBreakMinutes, // Only include unpaid break time
      hoursWorked: parseFloat(hoursWorked.toFixed(2)),
      payrate: parseFloat(payrate.toFixed(2)),
      pay: parseFloat(pay.toFixed(2)),
      payDate,
      isPublicHoliday,
      holidayName: isPublicHoliday ? holidayName : undefined,
      eveningHours: eveningHours > 0 ? parseFloat(eveningHours.toFixed(2)) : undefined,
      isSaturday: isSaturday || undefined,
      isSunday: isSunday || undefined
    };
    
    processedShifts.push(processedShift);
    
    // Determine the rate type for this shift
    let rateType = 'Regular';
    if (isPublicHoliday) {
      rateType = 'Public Holiday';
    } else if (isSunday) {
      rateType = 'Sunday';
    } else if (isSaturday) {
      rateType = 'Saturday';
    } else if (eveningHours > 0) {
      // If there are both regular and evening hours, we'll track them separately
      rateType = 'Regular + Evening';
    }
    
    // Aggregate pay date information
    const payDateKey = `${employerId}-${payDate}`;
    if (!payDateMap[payDateKey]) {
      // Calculate pay period start and end dates
      const payDateObj = new Date(payDate);
      const periodStart = new Date(payDateObj);
      periodStart.setDate(periodStart.getDate() - employerDetails.payPeriodDays);
      
      // Initialize hoursByRate and payByRate objects
      const hoursByRate: Record<string, number> = {};
      const payByRate: Record<string, number> = {};
      
      // If we have evening hours, split them out
      if (eveningHours > 0 && rateType === 'Regular + Evening') {
        const regularHours = hoursWorked - eveningHours;
        
        // Get the rates from the casual rates object
        const employeeLevel = employerDetails.level;
        const casualRatesTyped = casual as CasualRates;
        const ratesObj = casualRatesTyped[employeeLevel].rates;
        
        const regularPay = regularHours * ratesObj.ordinary;
        const eveningPay = eveningHours * ratesObj.evening_mon_fri;
        
        hoursByRate['Regular'] = regularHours;
        hoursByRate['Evening'] = eveningHours;
        
        payByRate['Regular'] = regularPay;
        payByRate['Evening'] = eveningPay;
      } else {
        // Otherwise just add to the appropriate rate type
        hoursByRate[rateType] = hoursWorked;
        payByRate[rateType] = pay;
      }
      
      payDateMap[payDateKey] = {
        date: payDate,
        employer: employer,
        employerId: employerId,
        amount: pay,
        totalHours: hoursWorked,
        shiftCount: 1,
        shifts: [date],
        periodStart: periodStart.toISOString().split('T')[0],
        periodEnd: payDateObj.toISOString().split('T')[0],
        hoursByRate,
        payByRate
      };
    } else {
      // Update existing pay date
      const existingPayDate = payDateMap[payDateKey];
      existingPayDate.amount += pay;
      existingPayDate.totalHours += hoursWorked;
      existingPayDate.shiftCount += 1;
      existingPayDate.shifts.push(date);
      
      // Initialize payByRate if it doesn't exist
      if (!existingPayDate.payByRate) {
        existingPayDate.payByRate = {};
      }
      
      // If we have evening hours, split them out
      if (eveningHours > 0 && rateType === 'Regular + Evening') {
        const regularHours = hoursWorked - eveningHours;
        
        // Get the rates from the casual rates object
        const employeeLevel = employerDetails.level;
        const casualRatesTyped = casual as CasualRates;
        const ratesObj = casualRatesTyped[employeeLevel].rates;
        
        const regularPay = regularHours * ratesObj.ordinary;
        const eveningPay = eveningHours * ratesObj.evening_mon_fri;
        
        // Update hours by rate
        existingPayDate.hoursByRate['Regular'] = (existingPayDate.hoursByRate['Regular'] || 0) + regularHours;
        existingPayDate.hoursByRate['Evening'] = (existingPayDate.hoursByRate['Evening'] || 0) + eveningHours;
        
        // Update pay by rate
        existingPayDate.payByRate['Regular'] = (existingPayDate.payByRate['Regular'] || 0) + regularPay;
        existingPayDate.payByRate['Evening'] = (existingPayDate.payByRate['Evening'] || 0) + eveningPay;
      } else {
        // Otherwise just add to the appropriate rate type
        existingPayDate.hoursByRate[rateType] = (existingPayDate.hoursByRate[rateType] || 0) + hoursWorked;
        existingPayDate.payByRate[rateType] = (existingPayDate.payByRate[rateType] || 0) + pay;
      }
    }
  });
  
  // Convert pay date map to array
  const calculatedPayDates = Object.values(payDateMap);
  
  return { 
    shifts: processedShifts, 
    payDates: calculatedPayDates 
  };
};

// Generate empty pay periods for a given date range
const generateEmptyPayPeriods = (
  startDate: string,
  endDate: string,
  employers: Employer[],
  existingPayDates: Record<string, PayDate>
): PayDate[] => {
  const emptyPayDates: PayDate[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // For each employer, generate all pay periods in the date range
  employers.forEach(employer => {
    // Start with the employer's next pay date and work backwards
    let currentPayDate = new Date(employer.nextPayDate);
    
    // Go back to find the first pay date before or on the start date
    while (currentPayDate > end) {
      // Move back one pay cycle
      if (employer.paycycle === 'weekly') {
        currentPayDate.setDate(currentPayDate.getDate() - 7);
      } else if (employer.paycycle === 'fortnightly') {
        currentPayDate.setDate(currentPayDate.getDate() - 14);
      }
    }
    
    // Now generate all pay dates from this point forward until we pass the end date
    while (currentPayDate >= start) {
      const payDateStr = currentPayDate.toISOString().split('T')[0];
      const payDateKey = `${employer.id}-${payDateStr}`;
      
      // Only add if this pay date doesn't already exist
      if (!existingPayDates[payDateKey]) {
        // Calculate pay period start and end dates
        const periodEnd = new Date(currentPayDate);
        periodEnd.setDate(periodEnd.getDate() - 1); // Day before pay date
        
        const periodStart = new Date(periodEnd);
        periodStart.setDate(periodStart.getDate() - employer.payPeriodDays + 1);
        
        // Create an empty pay date entry
        emptyPayDates.push({
          date: payDateStr,
          employer: employer.name,
          employerId: employer.id,
          amount: 0,
          totalHours: 0,
          shiftCount: 0,
          shifts: [],
          periodStart: periodStart.toISOString().split('T')[0],
          periodEnd: periodEnd.toISOString().split('T')[0],
          hoursByRate: {},
          payByRate: {}
        });
      }
      
      // Move back one pay cycle
      if (employer.paycycle === 'weekly') {
        currentPayDate.setDate(currentPayDate.getDate() - 7);
      } else if (employer.paycycle === 'fortnightly') {
        currentPayDate.setDate(currentPayDate.getDate() - 14);
      }
    }
  });
  
  return emptyPayDates;
};

// Main function to process all data and return timeline data
export const generateTimelineData = (
  shiftsData: { shifts: RawShift[] },
  userData: User,
  configData: any
): TimelineData => {
  // Calculate shift details for existing shifts
  const { shifts, payDates } = calculateShiftDetails(shiftsData.shifts, userData, configData);
  
  // Convert pay dates to a map for easy lookup
  const payDateMap: Record<string, PayDate> = {};
  payDates.forEach(payDate => {
    const key = `${payDate.employerId}-${payDate.date}`;
    payDateMap[key] = payDate;
  });
  
  // Generate empty pay periods for the last 3 months and next 1 month
  const today = new Date();
  const threeMonthsAgo = new Date(today);
  threeMonthsAgo.setMonth(today.getMonth() - 3);
  
  const oneMonthAhead = new Date(today);
  oneMonthAhead.setMonth(today.getMonth() + 1);
  
  const emptyPayDates = generateEmptyPayPeriods(
    threeMonthsAgo.toISOString().split('T')[0],
    oneMonthAhead.toISOString().split('T')[0],
    userData.employers,
    payDateMap
  );
  
  // Combine existing and empty pay dates
  const allPayDates = [...payDates, ...emptyPayDates];
  
  // Sort by date
  allPayDates.sort((a, b) => {
    if (a.date < b.date) return -1;
    if (a.date > b.date) return 1;
    return 0;
  });
  
  return { 
    shifts, 
    payDates: allPayDates 
  };
};
