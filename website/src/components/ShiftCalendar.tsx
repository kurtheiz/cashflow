import React, { useState, useMemo } from 'react';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
// Using Tailwind instead of Material UI for the timeline to avoid dependency issues
import configData from '../api/data/config.json';
import { format, parseISO, addDays, isSameDay } from 'date-fns';

interface Employer {
  id: string;
  name: string;
  level: keyof typeof configData.casual;
  state: 'NSW' | 'VIC' | 'QLD' | 'SA' | 'WA' | 'TAS' | 'NT' | 'ACT';
  paycycle: string;
  payday: string;
  payPeriodStart: string;
  payPeriodDays: number;
  nextPayDate: string;
}

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

interface ShiftCalendarProps {
  employers: Employer[];
  startDate: string; // ISO string (yyyy-MM-dd)
  shifts: Shift[];
  payDates?: PayDate[];
}

// Function to calculate future pay dates based on next pay date and pay period
function calculatePayDates(nextPayDate: string, payPeriodDays: number, numPayDates: number = 6): Date[] {
  const payDates: Date[] = [];
  let currentDate = parseISO(nextPayDate);
  
  // Add the next pay date
  payDates.push(currentDate);
  
  // Calculate future pay dates
  for (let i = 1; i < numPayDates; i++) {
    currentDate = addDays(currentDate, payPeriodDays);
    payDates.push(currentDate);
  }
  
  return payDates;
}

export const ShiftCalendar: React.FC<ShiftCalendarProps> = ({ employers, startDate, shifts, payDates = [] }) => {
  // State for the selected date from calendar
  const [selectedDate, setSelectedDate] = useState<Date>(parseISO(startDate));
  
  // State for responsive design
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // State for highlighted pay period (when a payday is selected)
  const [highlightedPayPeriod, setHighlightedPayPeriod] = useState<{start: Date | null, end: Date | null, employerId: string | null}>({start: null, end: null, employerId: null});
  
  // Create refs for timeline items
  const timelineRefs = React.useRef<{[key: string]: React.RefObject<HTMLDivElement | null>}>({});
  
  // Calculate pay dates for all employers
  const employerPayDates = useMemo(() => {
    return employers.map(employer => ({
      id: employer.id,
      name: employer.name,
      payDates: calculatePayDates(employer.nextPayDate, employer.payPeriodDays),
      color: employer.id === '0' ? '#f59e0b' : '#3b82f6' // Orange for first employer, blue for second
    }));
  }, [employers]);
  
  // Filter shifts for the current month
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  const shiftsForCurrentMonth = useMemo(() => {
    return shifts.filter(shift => {
      const shiftDate = parseISO(shift.date);
      return shiftDate.getMonth() === currentMonth && shiftDate.getFullYear() === currentYear;
    }).sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
  }, [shifts, currentMonth, currentYear]);
  
  // Filter pay dates for the current month
  const payDatesForCurrentMonth = useMemo(() => {
    return payDates.filter(payDate => {
      const date = parseISO(payDate.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
  }, [payDates, currentMonth, currentYear]);
  
  // Reference to the timeline container for scrolling
  const timelineContainerRef = React.useRef<HTMLDivElement>(null);
  
  // Initialize refs for timeline items
  React.useEffect(() => {
    // Clear existing refs
    timelineRefs.current = {};
    
    // Create refs for each shift date
    shiftsForCurrentMonth.forEach(shift => {
      const dateKey = shift.date;
      if (!timelineRefs.current[dateKey]) {
        timelineRefs.current[dateKey] = React.createRef<HTMLDivElement | null>();
      }
    });
    
    // Create refs for each pay date
    payDatesForCurrentMonth.forEach(payDate => {
      const dateKey = payDate.date;
      if (!timelineRefs.current[dateKey]) {
        timelineRefs.current[dateKey] = React.createRef<HTMLDivElement | null>();
      }
    });
  }, [shiftsForCurrentMonth, payDatesForCurrentMonth]);
  
  // Effect to handle window resize for responsive design
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Reset highlighted pay period when month changes
  React.useEffect(() => {
    setHighlightedPayPeriod({start: null, end: null, employerId: null});
  }, [currentMonth, currentYear]);

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full">
      {/* Left side: Calendar */}
      <div style={{ 
        width: isMobile ? '100%' : '350px',
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateCalendar 
            value={selectedDate}
            onChange={(newDate) => {
              if (newDate) {
                const oldMonth = selectedDate.getMonth();
                const oldYear = selectedDate.getFullYear();
                const newMonth = newDate.getMonth();
                const newYear = newDate.getFullYear();
                
                setSelectedDate(newDate);
                
                // Clear highlighted pay period when selecting a new date
                setHighlightedPayPeriod({start: null, end: null, employerId: null});
                
                // Check if month or year changed
                const monthChanged = oldMonth !== newMonth || oldYear !== newYear;
                
                // If month changed, scroll timeline to top after a short delay to allow for re-render
                if (monthChanged && timelineContainerRef.current) {
                  setTimeout(() => {
                    if (timelineContainerRef.current) {
                      timelineContainerRef.current.scrollTop = 0;
                    }
                  }, 100);
                } else {
                  // If same month, scroll to the specific date
                  const formattedDate = format(newDate, 'yyyy-MM-dd');
                  const ref = timelineRefs.current[formattedDate];
                  
                  // Scroll to the shift if it exists
                  if (ref && ref.current) {
                    ref.current.scrollIntoView({ 
                      behavior: 'smooth', 
                      block: 'start' 
                    });
                  }
                }
              }
            }}
            onMonthChange={(date) => {
              // Handle month change from arrow navigation
              if (date) {
                const newDate = new Date(date);
                // Keep the same day, just change month/year
                newDate.setDate(selectedDate.getDate());
                setSelectedDate(newDate);
                
                // Reset timeline scroll position
                if (timelineContainerRef.current) {
                  setTimeout(() => {
                    if (timelineContainerRef.current) {
                      timelineContainerRef.current.scrollTop = 0;
                    }
                  }, 100);
                }
              }
            }}
            slots={{
              day: (props) => {
                // Check if this day is a pay date for any employer
                const payDateInfo = employerPayDates.filter(employer => 
                  employer.payDates.some(payDate => isSameDay(payDate, props.day))
                );
                
                // Check if this day has any shifts
                const dayShifts = shifts.filter(shift => 
                  isSameDay(parseISO(shift.date), props.day)
                );
                
                // Check if this day is within the highlighted pay period
                const isHighlighted = highlightedPayPeriod.start !== null && highlightedPayPeriod.end !== null && 
                  props.day >= highlightedPayPeriod.start && props.day <= highlightedPayPeriod.end;
                  
                // Determine highlight color based on employer
                const highlightColor = isHighlighted ? 
                  (highlightedPayPeriod.employerId === '0' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)') : 
                  undefined;
                
                // Check if the day is highlighted for styling
                
                return (
                  <div style={{ position: 'relative' }}>
                    <PickersDay 
                      {...props} 
                      sx={{
                        ...props.sx,
                        ...(isHighlighted && {
                          backgroundColor: highlightColor,
                          '&:hover': {
                            backgroundColor: highlightedPayPeriod.employerId === '0' ? 
                              'rgba(245, 158, 11, 0.2)' : 'rgba(59, 130, 246, 0.2)'
                          },
                          '&.Mui-selected': {
                            backgroundColor: highlightedPayPeriod.employerId === '0' ? 
                              '#f59e0b' : '#3b82f6',
                            '&:hover': {
                              backgroundColor: highlightedPayPeriod.employerId === '0' ? 
                                '#d97706' : '#2563eb'
                            }
                          }
                        })
                      }}
                    />
                    <div style={{ 
                      position: 'absolute', 
                      bottom: '2px',
                      left: 0,
                      right: 0,
                      display: 'flex',
                      justifyContent: 'center',
                      gap: '3px'
                    }}>
                      {/* Pay day indicators */}
                      {payDateInfo.map(employer => (
                        <div 
                          key={`pay-${employer.id}`}
                          style={{ 
                            color: employer.color,
                            fontSize: '10px',
                            fontWeight: 'bold',
                            lineHeight: 1
                          }}
                          title={`${employer.name} Pay Day`}
                        >
                          $
                        </div>
                      ))}
                      
                      {/* Shift indicators */}
                      {dayShifts.map(shift => (
                        <div 
                          key={`shift-${shift.date}-${shift.employerId}`}
                          style={{ 
                            width: '6px', 
                            height: '6px', 
                            borderRadius: '50%', 
                            backgroundColor: shift.employerId === '0' ? '#f59e0b' : '#3b82f6',
                            marginLeft: payDateInfo.length > 0 ? '2px' : '0',
                            boxShadow: isHighlighted ? 
                              `0 0 0 2px ${highlightedPayPeriod.employerId === '0' ? 'rgba(245, 158, 11, 0.5)' : 'rgba(59, 130, 246, 0.5)'}` : 
                              'none'
                          }}
                          title={`${shift.employer} Shift: ${shift.start} - ${shift.end}`}
                        />
                      ))}
                    </div>
                  </div>
                );
              }
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
      
      {/* Monthly Shifts Timeline */}
      <div className="w-full bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {format(selectedDate, 'MMMM yyyy')} Shifts
          </h3>
        </div>
        
        <div className="p-4 overflow-auto max-h-[400px]" ref={timelineContainerRef}>
          <div key={`timeline-container-${currentMonth}-${currentYear}`}>
            {(shiftsForCurrentMonth.length > 0 || payDatesForCurrentMonth.length > 0) ? (
              <div className="relative">
                {/* Combine and sort shifts and pay dates */}
                {[...shiftsForCurrentMonth.map(shift => ({ type: 'shift', data: shift, date: parseISO(shift.date) })),
                  ...payDatesForCurrentMonth.map(payDate => ({ type: 'payDate', data: payDate, date: parseISO(payDate.date) }))]
                  .sort((a, b) => a.date.getTime() - b.date.getTime())
                  .map((item, index, array) => {
                    if (item.type === 'shift') {
                      const shift = item.data as Shift;
                      const shiftDate = item.date;
                      const color = shift.employerId === '0' ? 'bg-amber-500' : 'bg-blue-500';
                      
                      return (
                        <div 
                          key={`timeline-shift-${shift.date}-${shift.employerId}`} 
                          className="mb-6 relative pl-8"
                          ref={timelineRefs.current[shift.date]}
                        >
                          {/* Date */}
                          <div className="absolute left-0 top-0 w-20 text-sm text-gray-500">
                            {format(shiftDate, 'EEE, MMM d')}
                          </div>
                          
                          {/* Timeline dot */}
                          <div className={`absolute left-24 top-1 w-4 h-4 rounded-full ${color}`}></div>
                          
                          {/* Timeline line */}
                          {index < array.length - 1 && (
                            <div className="absolute left-[6.25rem] top-5 w-0.5 h-full bg-gray-200"></div>
                          )}
                          
                          {/* Content */}
                          <div className="ml-28">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{shift.employer}</span>
                              {shift.pay && (
                                <span className="text-sm font-medium text-emerald-600">${shift.pay.toFixed(2)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    } else {
                      // Pay date item
                      const payDate = item.data as PayDate;
                      const payDateDate = item.date;
                      const color = payDate.employerId === '0' ? 'bg-amber-500' : 'bg-blue-500';
                      
                      return (
                        <div 
                          key={`timeline-paydate-${payDate.date}-${payDate.employerId}`} 
                          className="mb-6 relative pl-8"
                          ref={timelineRefs.current[payDate.date]}
                        >
                          {/* Date */}
                          <div className="absolute left-0 top-0 w-20 text-sm text-gray-500">
                            {format(payDateDate, 'EEE, MMM d')}
                          </div>
                          
                          {/* Timeline dot - use a dollar sign for pay dates */}
                          <div className={`absolute left-24 top-1 w-4 h-4 rounded-full flex items-center justify-center ${color}`}>
                            <span className="text-xs text-white font-bold">$</span>
                          </div>
                          
                          {/* Timeline line */}
                          {index < array.length - 1 && (
                            <div className="absolute left-[6.25rem] top-5 w-0.5 h-full bg-gray-200"></div>
                          )}
                          
                          {/* Content */}
                          <div className="ml-28">
                            <div className="flex justify-between items-center">
                              <span 
                                className="font-medium cursor-pointer hover:text-blue-600"
                                onClick={() => {
                                  // Highlight the entire pay period with employer-specific color
                                  setHighlightedPayPeriod({
                                    start: parseISO(payDate.periodStart),
                                    end: parseISO(payDate.periodEnd),
                                    employerId: payDate.employerId
                                  });
                                }}
                              >
                                {payDate.employer} Payday
                              </span>
                              <span className="text-sm font-medium text-emerald-600">${payDate.totalPay.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No shifts or pay dates for {format(selectedDate, 'MMMM yyyy')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
