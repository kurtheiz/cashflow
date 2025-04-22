import React, { useEffect, useRef } from 'react';
import { format, parseISO, isSameDay } from 'date-fns';
import ShiftCard from './ShiftCard';
import PayDateCard from './PayDateCard';
import { Shift, PayPeriod, Employer } from '../api/mockApi';

// Extend the Employer interface to include the properties we need
interface EmployerWithExtras extends Employer {
  awardDescription?: string;
  sgcPercentage?: number;
}

type ScheduleItem = {
  type: 'shift' | 'payment';
  date: string;
  data: Shift | PayPeriod;
  employerId: string;
  employer: string;
  color?: string;
};

interface UpcomingScheduleProps {
  selectedEmployer?: string | null;
  cardType?: 'all' | 'shift' | 'payment';
  scrollToTodayTrigger?: number;
  // Required data from parent components
  shifts: Shift[];
  payPeriods: {
    employerId: string;
    employer: string;
    periods: PayPeriod[];
  }[];
  // Selected date from calendar
  selectedDate?: Date;
  // Public holidays data
  publicHolidays: any[];
  // User data including employers
  employers: EmployerWithExtras[];
  // Loading states
  isLoading?: boolean;
}

const UpcomingSchedule: React.FC<UpcomingScheduleProps> = ({
  selectedEmployer = null,
  cardType = 'all',
  scrollToTodayTrigger,
  shifts,
  payPeriods,
  selectedDate,
  publicHolidays = [],
  employers,
  isLoading = false,
}) => {
  const today = new Date();

  // Reference to today's element for scrolling
  const todayRef = useRef<HTMLDivElement>(null);

  // Map to store refs for each date
  const dateRefs = useRef<Record<string, any>>({});

  // Combine shifts and pay dates into a single array and sort by date
  const scheduleItems: ScheduleItem[] = React.useMemo(() => {
    const items: ScheduleItem[] = [];

    // Debug data
    console.log('shifts data being used:', shifts);
    console.log('payPeriodsData:', payPeriods);

    // Add shifts first (to give them preference in the refs map)
    if (shifts && Array.isArray(shifts)) {
      console.log('shifts is an array with length:', shifts.length);
      shifts.forEach((shift: Shift) => {
        // Make sure shift has all required properties
        if (shift && shift.date && shift.employerId) {
          const employer = employers.find((e: any) => e.id === shift.employerId);
          items.push({
            type: 'shift',
            date: shift.date,
            data: shift,
            employerId: shift.employerId,
            employer: shift.employer || (employer?.name || 'Unknown'),
            color: employer?.color,
          });
        }
      });
    }

    // Add pay dates
    if (payPeriods) {
      payPeriods.forEach((employerPeriods) => {
        const employer = employers.find((e: any) => e.id === employerPeriods.employerId);
        employerPeriods.periods.forEach((period) => {
          items.push({
            type: 'payment',
            date: period.payDate,
            data: period,
            employerId: employerPeriods.employerId,
            employer: employerPeriods.employer,
            color: employer?.color,
          });
        });
      });
    }

    // Sort by date
    items.sort((a, b) => {
      // If same date, put shifts before payments
      if (a.date === b.date) {
        return a.type === 'shift' ? -1 : 1;
      }
      // Otherwise sort by date
      return a.date.localeCompare(b.date);
    });

    // Debug
    console.log('Sorted schedule items:', shifts?.length, payPeriods?.length, items.length);

    return items;
  }, [shifts, payPeriods]);

  // Scroll to today's date when component mounts, accounting for toolbar height
  // Scroll to today's date or selected date when triggered by prop
  useEffect(() => {
    // Find the first item with today's date, or use today's ref as fallback
    let targetRef = todayRef.current;

    // If we have a selected date from the calendar, try to find that date
    if (selectedDate) {
      const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');

      // First check if we have a shift for this date (preference for shifts)
      const shiftKey = `shift-${selectedDateStr}`;
      const payKey = `payment-${selectedDateStr}`;

      // Give preference to shifts over pay dates
      if (dateRefs.current[shiftKey] && dateRefs.current[shiftKey].current) {
        targetRef = dateRefs.current[shiftKey].current;
      }
      // Fall back to pay date if no shift exists
      else if (dateRefs.current[payKey] && dateRefs.current[payKey].current) {
        targetRef = dateRefs.current[payKey].current;
      }
      // Finally, try the date itself as a last resort
      else if (dateRefs.current[selectedDateStr] && dateRefs.current[selectedDateStr].current) {
        targetRef = dateRefs.current[selectedDateStr].current;
      }
    }
    
    // Scroll to the target element if we found one
    if (targetRef) {
      // Use a taller toolbar height to account for the buttons and labels
      const toolbarHeight = 90; // Increased from 56 to account for the taller toolbar with labels
      const elementPosition = targetRef.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - toolbarHeight;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
    // Otherwise, scroll to today if triggered
    else if (scrollToTodayTrigger && todayRef.current) {
      // Use a taller toolbar height to account for the buttons and labels
      const toolbarHeight = 90; // Increased from 56 to account for the taller toolbar with labels
      const elementPosition = todayRef.current.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - toolbarHeight;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  }, [scheduleItems, scrollToTodayTrigger, selectedDate]);

  if (isLoading) {
    return (
      <div className="w-full p-4 text-center text-gray-500">
        Loading your schedule...
      </div>
    );
  }

  // Filter items by employer and cardType
  const filteredScheduleItems = scheduleItems.filter((item) => {
    const employerMatch = !selectedEmployer || item.employerId === selectedEmployer;
    const typeMatch = cardType === 'all' || item.type === cardType;
    return employerMatch && typeMatch;
  });

  return (
    <div className="w-full">
      <div className="w-full">
        {filteredScheduleItems.map((item, index) => {
          const itemDate = parseISO(item.date);
          const isToday = isSameDay(itemDate, today);

          return (
            <div
              key={`${item.type}-${item.employerId}-${item.date}-${index}`}
              ref={(el: HTMLDivElement | null) => {
                if (el) {
                  // Create a key that includes both date and type for more specific targeting
                  const refKey = `${item.type}-${item.date}`;

                  // Store element references directly
                  dateRefs.current[refKey] = { current: el };
                  dateRefs.current[item.date] = { current: el };

                  // Also set today's ref
                  if (isToday) {
                    todayRef.current = el;
                  }
                }
              }}
              className={`w-full ${isToday ? 'bg-blue-50' : ''}`}
            >
              {item.type === 'shift' ? (
                <ShiftCard
                  shift={item.data as Shift}
                  color={item.color}
                  isPublicHoliday={publicHolidays.some((holiday) =>
                    isSameDay(parseISO(holiday.date), parseISO(item.date))
                  )}
                />
              ) : (
                <PayDateCard
                  payDate={{
                    date: (item.data as PayPeriod).payDate,
                    employerId: item.employerId,
                    employer: item.employer,
                    amount: (item.data as PayPeriod).grossPay,
                    grossPay: (item.data as PayPeriod).grossPay,
                    periodStart: (item.data as PayPeriod).startDate,
                    periodEnd: (item.data as PayPeriod).endDate,
                    hours: (item.data as PayPeriod).totalHours,
                    payRate: (item.data as PayPeriod).payCategories[0]?.rate || 0,
                    tax: (item.data as PayPeriod).tax,
                    netPay: (item.data as PayPeriod).netPay,
                    employeeLevel: employers.find((e: any) => e.id === item.employerId)?.level,
                    awardDescription: employers.find((e: any) => e.id === item.employerId)?.awardDescription,
                    sgcPercentage: employers.find((e: any) => e.id === item.employerId)?.sgcPercentage,
                    payCategories: (item.data as PayPeriod).payCategories,
                    // Add shift dates directly from the period's shifts array
                    shiftDates: Array.isArray((item.data as PayPeriod).shifts) ? (item.data as PayPeriod).shifts : [],
                    shifts: (item.data as PayPeriod).shifts,
                    // Add allowances data
                    allowances: (item.data as PayPeriod).allowances || [],
                    allowanceTotal: (item.data as PayPeriod).allowanceTotal || 0,
                    totalGrossPay: (item.data as PayPeriod).totalGrossPay || 0
                  }} 
                  color={item.color} 
                />
              )}
            </div>
          );
        })}
        
        {filteredScheduleItems.length === 0 && (
          <div className="w-full p-4 text-center text-gray-500">
            No upcoming shifts or payments scheduled
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingSchedule;
