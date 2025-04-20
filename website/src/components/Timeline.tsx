import React, { useEffect, useState } from 'react';
import { VerticalTimeline } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import './Timeline.css';
import { Shift, PayDate } from '../utils/shiftCalculator';

// Import types
import { TimelineProps, MonthlySummary } from './timeline/types';

// Import components
import { MonthlySummaries } from './timeline/MonthlySummaries';
import { ShiftItem } from './timeline/ShiftItem';
import { PayDateItem } from './timeline/PayDateItem';

// Import utility functions
import { 
  formatDate,
  formatTime,
  getMonthsText,
  calculateMonthlySummaries,
  filterShiftsForNextTwoMonths,
  filterPayDatesForNextTwoMonths
} from './timeline/timelineUtils';

/**
 * Timeline Component
 * Displays shifts and pay dates in a vertical timeline format
 * with monthly summaries
 */
export const Timeline: React.FC<TimelineProps> = ({
  shifts,
  payDates,
  selectedDate,
  employers,
  onPayPeriodSelect,
}) => {
  const [filteredShifts, setFilteredShifts] = useState<Shift[]>([]);
  const [filteredPayDates, setFilteredPayDates] = useState<PayDate[]>([]);
  const [monthlySummaries, setMonthlySummaries] = useState<MonthlySummary[]>([]);

  // Get employer color based on employerId
  const getEmployerColor = (employerId: string): string => {
    const employer = employers.find(emp => emp.id === employerId);
    return employer?.color || '#f59e0b'; // Default to orange if not found
  };

  // Filter shifts and pay dates for the next two months
  useEffect(() => {
    // Filter shifts for the next two months
    const filtered = filterShiftsForNextTwoMonths(shifts);
    setFilteredShifts(filtered);
    
    // Calculate monthly summaries
    const summaries = calculateMonthlySummaries(filtered, payDates, employers);
    setMonthlySummaries(summaries);
    
    // Filter pay dates for the next two months
    if (payDates && payDates.length > 0) {
      const filteredPayDates = filterPayDatesForNextTwoMonths(payDates);
      setFilteredPayDates(filteredPayDates);
    } else {
      setFilteredPayDates([]);
    }
    
    // If a date is selected, check if it's a pay date and highlight the corresponding pay period
    if (selectedDate) {
      const selectedDateStr = selectedDate.toISOString().split('T')[0];
      const matchingPayDate = payDates?.find(pd => pd.date === selectedDateStr);
      
      if (matchingPayDate) {
        // If the selected date is a pay date, highlight the corresponding pay period
        const periodStart = new Date(matchingPayDate.periodStart);
        const payDate = new Date(matchingPayDate.date);
        
        // Notify parent component about the selected pay period
        onPayPeriodSelect(periodStart, payDate, matchingPayDate.employerId);
      }
    }
  }, [shifts, payDates, selectedDate, employers, onPayPeriodSelect]);

  return (
    <div className="timeline-container">
      <h2 className="text-xl font-semibold mb-4 text-center">Shifts for {getMonthsText()}</h2>
      
      {/* Monthly Summaries Section */}
      <MonthlySummaries summaries={monthlySummaries} />
      
      {filteredShifts.length === 0 && filteredPayDates.length === 0 ? (
        <div className="text-center text-gray-500 my-8">
          No upcoming shifts or pay dates in the next two months.
        </div>
      ) : (
        <VerticalTimeline>
          {/* Combine and sort shifts and pay dates */}
          {[...filteredShifts, ...filteredPayDates]
            .sort((a, b) => {
              // Sort by date
              const dateA = new Date(a.date).getTime();
              const dateB = new Date(b.date).getTime();
              if (dateA !== dateB) return dateA - dateB;
              
              // If dates are the same, pay dates come first
              if ('amount' in a && !('amount' in b)) return -1;
              if (!('amount' in a) && 'amount' in b) return 1;
              
              // If both are the same type, sort by employer ID
              return a.employerId.localeCompare(b.employerId);
            })
            .map((item) => {
              // Render pay date
              if ('amount' in item) {
                const payDate = item as PayDate;
                return (
                  <PayDateItem 
                    key={`paydate-${payDate.employerId}-${payDate.date}`}
                    payDate={payDate}
                    getEmployerColor={getEmployerColor}
                    formatDate={formatDate}
                  />
                );
              } else {
                // Render shift
                const shift = item as Shift;
                return (
                  <ShiftItem 
                    key={`shift-${shift.employerId}-${shift.date}-${shift.start}`}
                    shift={shift}
                    getEmployerColor={getEmployerColor}
                    formatDate={formatDate}
                    formatTime={formatTime}
                  />
                );
              }
            })}
        </VerticalTimeline>
      )}
    </div>
  );
};
