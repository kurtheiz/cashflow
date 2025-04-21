import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, addMonths, startOfMonth, endOfMonth, parseISO, isSameDay } from 'date-fns';
import ShiftCard from './ShiftCard';
import PayDateCard from './PayDateCard';
import { api as mockApi } from '../api/mockApi';
import { Shift, PayPeriod } from '../api/mockApi';
import userData from '../api/data/user.json';

type ScheduleItem = {
  type: 'shift' | 'payment';
  date: string;
  data: Shift | PayPeriod;
  employerId: string;
  employer: string;
  color?: string;
};

const UpcomingSchedule: React.FC = () => {
  const today = new Date();
  const currentMonthStart = format(startOfMonth(today), 'yyyy-MM-dd');
  const nextMonthEnd = format(endOfMonth(addMonths(today, 1)), 'yyyy-MM-dd');
  
  // Reference to today's element for scrolling
  const todayRef = useRef<HTMLDivElement>(null);
  
  // Fetch shifts for current month and next month
  const { data: shiftsData, isLoading: shiftsLoading } = useQuery({
    queryKey: ['shifts', currentMonthStart, nextMonthEnd],
    queryFn: async () => {
      const response = await mockApi.getShifts(currentMonthStart, nextMonthEnd);
      return response.data;
    },
  });
  
  // Fetch pay periods for current month and next month
  const { data: payPeriodsData, isLoading: payPeriodsLoading } = useQuery({
    queryKey: ['payPeriods', currentMonthStart, nextMonthEnd],
    queryFn: async () => {
      const response = await mockApi.getPayPeriods(currentMonthStart, nextMonthEnd);
      return response.data;
    },
  });
  
  // Combine shifts and pay dates into a single array and sort by date
  const scheduleItems: ScheduleItem[] = React.useMemo(() => {
    const items: ScheduleItem[] = [];
    
    // Add shifts
    if (shiftsData) {
      shiftsData.forEach((shift: Shift) => {
        const employer = userData.employers.find((e: any) => e.id === shift.employerId);
        items.push({
          type: 'shift',
          date: shift.date,
          data: shift,
          employerId: shift.employerId,
          employer: shift.employer,
          color: employer?.color
        });
      });
    }
    
    // Add pay dates
    if (payPeriodsData) {
      payPeriodsData.forEach(employerPeriods => {
        const employer = userData.employers.find((e: any) => e.id === employerPeriods.employerId);
        employerPeriods.periods.forEach(period => {
          items.push({
            type: 'payment',
            date: period.payDate,
            data: period,
            employerId: employerPeriods.employerId,
            employer: employerPeriods.employer,
            color: employer?.color
          });
        });
      });
    }
    
    // Sort by date
    return items.sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }, [shiftsData, payPeriodsData]);
  
  // Scroll to today's date when component mounts, accounting for toolbar height
  useEffect(() => {
    if (todayRef.current) {
      // Get the toolbar height (approximately 56px)
      const toolbarHeight = 56;
      
      // Calculate position to scroll to (element position - toolbar height)
      const elementPosition = todayRef.current.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - toolbarHeight;
      
      // Scroll to the adjusted position
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, [scheduleItems]);
  
  if (shiftsLoading || payPeriodsLoading) {
    return (
      <div className="w-full p-4 text-center text-gray-500">
        Loading your schedule...
      </div>
    );
  }
  
  return (
    <div className="w-full">
      
      <div className="divide-y divide-gray-100 w-full">
        {scheduleItems.map((item, index) => {
          const itemDate = parseISO(item.date);
          const isToday = isSameDay(itemDate, today);
          
          return (
            <div 
              key={`${item.type}-${item.employerId}-${item.date}-${index}`}
              ref={isToday ? todayRef : null}
              className={`w-full ${isToday ? 'bg-blue-50' : ''}`}
            >
              {item.type === 'shift' ? (
                <ShiftCard 
                  shift={item.data as Shift} 
                  color={item.color} 
                />
              ) : (
                <PayDateCard 
                  payDate={{
                    date: (item.data as PayPeriod).payDate,
                    employerId: item.employerId,
                    employer: item.employer,
                    amount: (item.data as PayPeriod).grossPay,
                    periodStart: (item.data as PayPeriod).startDate,
                    periodEnd: (item.data as PayPeriod).endDate,
                    hours: (item.data as PayPeriod).totalHours,
                    payRate: (item.data as PayPeriod).payCategories[0]?.rate || 0,
                    tax: (item.data as PayPeriod).tax,
                    employeeLevel: userData.employers.find((e: any) => e.id === item.employerId)?.level,
                  }} 
                  color={item.color} 
                />
              )}
            </div>
          );
        })}
        
        {scheduleItems.length === 0 && (
          <div className="w-full p-4 text-center text-gray-500">
            No upcoming shifts or payments scheduled
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingSchedule;
