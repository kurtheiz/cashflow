import React from 'react';
import { Calendar as PrimeCalendar } from 'primereact/calendar';
import { parseISO, isSameDay } from 'date-fns';

// Types
interface Shift {
  date: string;
  employerId: string;
  employer: string;
  start: string;
  end: string;
  hoursWorked: number;
  isPublicHoliday: boolean;
  payCategories: {
    category: string;
    hours: number;
    rate: number;
    description?: string;
  }[];
  payRate: number;
  grossPay: number;
  unpaidBreakMinutes: number;
}

interface PayPeriod {
  startDate: string;
  endDate: string;
  payDate: string;
  shifts: string[];
  totalHours: number;
  grossPay: number;
  tax: number;
  netPay: number;
  payCategories: {
    category: string;
    hours: number;
    rate: number;
    description?: string;
  }[];
}

interface EmployerPayPeriods {
  employerId: string;
  employer: string;
  periods: PayPeriod[];
}

interface PublicHoliday {
  date: string;
  name: string;
  regional?: string | boolean;
  state?: string;
}

interface ShiftsCalendarProps {
  shifts: Shift[];
  payPeriods: EmployerPayPeriods[];
  publicHolidays: PublicHoliday[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

// Removed unused categoryColors map

export const ShiftsCalendar: React.FC<ShiftsCalendarProps> = ({ shifts, payPeriods, publicHolidays, selectedDate, onDateChange }) => {
  // Helper to get all shifts for a given day
  const getShiftsForDay = (day: Date) =>
    shifts.filter((shift) => isSameDay(parseISO(shift.date), day));
    
  // Helper to get public holidays for a given day
  const getPublicHolidaysForDay = (day: Date) =>
    publicHolidays.filter((holiday) => isSameDay(parseISO(holiday.date), day));
    
  // Helper to get all pay dates for a given day
  const getPayDatesForDay = (day: Date) => {
    const result: { employerId: string; employer: string; netPay: number }[] = [];
    
    payPeriods.forEach(employerPeriod => {
      employerPeriod.periods.forEach(period => {
        if (isSameDay(parseISO(period.payDate), day)) {
          result.push({
            employerId: employerPeriod.employerId,
            employer: employerPeriod.employer,
            netPay: period.netPay
          });
        }
      });
    });
    
    return result;
  };

  // Custom day cell for PrimeReact dateTemplate
  const renderDay = (event: any) => {
    // PrimeReact passes CalendarDateTemplateEvent: { day, month, year, ... }
    if (!event || typeof event.day !== 'number' || typeof event.month !== 'number' || typeof event.year !== 'number') return null;
    // Note: month is 0-based in JS Date, but PrimeReact's month is 0-based too
    const dayDate = new Date(event.year, event.month, event.day);
    const shiftsForDay = getShiftsForDay(dayDate);
    const payDatesForDay = getPayDatesForDay(dayDate);
    
    // Get public holidays for this day
    const holidaysForDay = getPublicHolidaysForDay(dayDate);
    
    // Determine background color based on what's happening on this day
    let bgColorClass = '';
    if (holidaysForDay.length > 0) {
      bgColorClass = 'bg-red-100';
    } else if (payDatesForDay.length > 0) {
      bgColorClass = 'bg-green-100';
    }
    
    return (
      <div className={`relative w-full h-full min-w-[32px] min-h-[32px] flex flex-col items-center justify-start pt-1 ${bgColorClass}`}>
        <span className="z-10">{event.day}</span>
        
        {/* Pay date indicator (green background only, no text) */}
        
        {/* Shift indicators */}
        {shiftsForDay.length > 0 && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-1 flex gap-1 z-10">
            {Array.from(new Set(shiftsForDay.map(s => s.employerId))).map((employerId) => (
              <span
                key={employerId}
                className="inline-block w-2 h-2 rounded-full border border-white bg-blue-500"
                title={shiftsForDay.find(s => s.employerId === employerId)?.employer || employerId}
              />
            ))}
          </div>
        )}
        
        {/* Public holiday indicator */}
        {holidaysForDay.length > 0 && (
          <div className="absolute top-0 right-0 w-0 h-0 border-t-4 border-r-4 border-red-500 border-solid z-10" 
               title={holidaysForDay.map(h => h.name).join(', ')}
          />
        )}
      </div>
    );
  };

  return (
    <div className="bg-white w-full mx-auto">
      <PrimeCalendar
        value={selectedDate}
        onChange={e => e.value && onDateChange(e.value as Date)}
        inline
        dateTemplate={renderDay}
        viewDate={selectedDate}
        showOtherMonths
        showIcon={false}
        className="w-full" // Make calendar full width
        style={{ width: '100%' }} // Ensure full width with inline style
      />
      <div className="flex flex-wrap gap-3 text-xs mt-2 justify-center">
        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span> Shift</div>
        <div className="flex items-center gap-1"><span className="w-4 h-2 rounded bg-red-100 border border-red-300 inline-block"></span> Public Holiday</div>
        <div className="flex items-center gap-1"><span className="w-4 h-2 rounded bg-green-100 border border-green-300 inline-block"></span> Pay Day</div>
      </div>
      {/* Fallback if PrimeCalendar fails to render */}
      <noscript className="text-red-600">Calendar failed to render. Check PrimeReact styles and overlay container.</noscript>
    </div>
  );
};
