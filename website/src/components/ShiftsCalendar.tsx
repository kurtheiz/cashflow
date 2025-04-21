import React from 'react';
import { Calendar as PrimeCalendar } from 'primereact/calendar';
import { format, parseISO, isSameDay } from 'date-fns';

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

interface ShiftsCalendarProps {
  shifts: Shift[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

// Tailwind category color map
const categoryColors: Record<string, string> = {
  ordinary: 'bg-blue-500',
  evening_mon_fri: 'bg-purple-500',
  saturday: 'bg-amber-500',
  public_holiday: 'bg-red-500',
};

export const ShiftsCalendar: React.FC<ShiftsCalendarProps> = ({ shifts, selectedDate, onDateChange }) => {
  // Helper to get all shifts for a given day
  const getShiftsForDay = (day: Date) =>
    shifts.filter((shift) => isSameDay(parseISO(shift.date), day));

  // Custom day cell for PrimeReact dateTemplate
  const renderDay = (event: any) => {
    // PrimeReact passes CalendarDateTemplateEvent: { day, month, year, ... }
    if (!event || typeof event.day !== 'number' || typeof event.month !== 'number' || typeof event.year !== 'number') return null;
    // Note: month is 0-based in JS Date, but PrimeReact's month is 0-based too
    const dayDate = new Date(event.year, event.month, event.day);
    const shiftsForDay = getShiftsForDay(dayDate);
    if (shiftsForDay.length === 0) {
      return <span>{event.day}</span>;
    }
    // Show a dot per employer for each shift, and red background for public holidays
    const uniqueEmployers = Array.from(new Set(shiftsForDay.map(s => s.employerId)));
    const isPublicHoliday = shiftsForDay.some(s => s.isPublicHoliday);
    return (
      <div className={`relative w-full h-full min-w-[32px] min-h-[32px] flex flex-col items-center justify-center ${isPublicHoliday ? 'bg-red-100' : ''}`}>
        <span className="z-10">{event.day}</span>
        <div className="absolute left-1/2 -translate-x-1/2 bottom-1 flex gap-1 z-10">
          {uniqueEmployers.map((employerId) => (
            <span
              key={employerId}
              className="inline-block w-2 h-2 rounded-full border border-white bg-blue-500"
              title={shiftsForDay.find(s => s.employerId === employerId)?.employer || employerId}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-2 w-full max-w-md mx-auto border border-dashed border-blue-400">
      <div className="text-md font-medium mb-2 text-center">
        {format(selectedDate, 'MMMM yyyy')}
      </div>
      <PrimeCalendar
        value={selectedDate}
        onChange={e => e.value && onDateChange(e.value as Date)}
        inline
        dateTemplate={renderDay}
        viewDate={selectedDate}
        showOtherMonths
        showIcon={false}
      />
      <div className="flex flex-wrap gap-3 text-xs mt-2 justify-center">
        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span> Shift Worked</div>
        <div className="flex items-center gap-1"><span className="w-4 h-2 rounded bg-red-100 border border-red-300 inline-block"></span> Public Holiday</div>
      </div>
      {/* Fallback if PrimeCalendar fails to render */}
      <noscript className="text-red-600">Calendar failed to render. Check PrimeReact styles and overlay container.</noscript>
    </div>
  );
};
