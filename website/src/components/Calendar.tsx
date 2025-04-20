import React from 'react';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { format, parseISO, isSameDay } from 'date-fns';

interface Shift {
  date: string;
  employerId: string;
  employer: string;
  start: string;
  end: string;
  break?: number;
  hoursWorked?: number;
  payrate?: number;
  pay?: number;
  payDate?: string;
}

interface PayDate {
  date: string;
  employer: string;
  employerId: string;
  totalPay: number;
  shifts: string[];
  periodStart: string;
  periodEnd: string;
}



interface CalendarProps {
  shifts: Shift[];
  payDates: PayDate[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  highlightedPayPeriod?: {
    start: Date | null;
    end: Date | null;
    employerId: string | null;
  };
}

export const Calendar: React.FC<CalendarProps> = ({
  shifts,
  payDates,
  selectedDate,
  onDateChange,
  highlightedPayPeriod
}) => {
  // Custom day renderer to highlight days with shifts or paydays
  const ServerDay = (props: React.ComponentProps<typeof PickersDay>) => {
    const { day } = props;
    // Check if there's a shift on this day
    const hasShift = shifts.some(shift => isSameDay(parseISO(shift.date), day));
    
    // Check if there's a pay date on this day
    const hasPayDate = payDates.some(payDate => isSameDay(parseISO(payDate.date), day));
    
    // Check if this day is within a highlighted pay period
    const isInHighlightedPeriod = highlightedPayPeriod?.start && 
                                 highlightedPayPeriod?.end && 
                                 day >= highlightedPayPeriod.start && 
                                 day <= highlightedPayPeriod.end;
    
    // Get employer color for highlighted period
    const highlightColor = isInHighlightedPeriod && highlightedPayPeriod?.employerId
      ? (highlightedPayPeriod.employerId === '0' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)')
      : undefined;
    
    // Styling for days with shifts or pay dates
    const dayStyle = {
      backgroundColor: highlightColor,
      position: 'relative' as const,
    };
    
    return (
      <div style={dayStyle}>
        <PickersDay {...props} />
        {/* Indicator for shifts */}
        {hasShift && (
          <div 
            style={{ 
              position: 'absolute', 
              bottom: '2px', 
              left: '50%', 
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '2px'
            }}
          >
            {/* Get unique employers for this day */}
            {Array.from(new Set(shifts
              .filter(shift => isSameDay(parseISO(shift.date), day))
              .map(shift => shift.employerId)
            )).map((employerId) => {
              const color = employerId === '0' ? '#f59e0b' : '#3b82f6';
              return (
                <div 
                  key={`shift-dot-${format(day, 'yyyy-MM-dd')}-${employerId}`}
                  style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    backgroundColor: color
                  }}
                />
              );
            })}
          </div>
        )}
        
        {/* Indicator for pay dates */}
        {hasPayDate && (
          <div 
            style={{ 
              position: 'absolute', 
              top: '2px', 
              right: '2px',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#10b981' // Emerald color for pay dates
            }}
          />
        )}
      </div>
    );
  };
  
  return (
    <div className="w-full overflow-hidden">
      <div className="flex justify-center">
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateCalendar
            value={selectedDate}
            onChange={(newDate) => {
              if (newDate) {
                onDateChange(newDate);
              }
            }}
            slots={{
              day: ServerDay
            }}
            sx={{
              width: '100%',
              '& .MuiPickersDay-root.Mui-selected': {
                backgroundColor: '#10b981', // Tailwind emerald-500
                '&:hover': {
                  backgroundColor: '#059669' // Tailwind emerald-600
                }
              }
            }}
          />
        </LocalizationProvider>
      </div>
    </div>
  );
};
