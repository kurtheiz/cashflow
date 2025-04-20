import React, { useEffect, useState } from 'react';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import './Timeline.css';
import { CalendarIcon, ClockIcon, DollarSignIcon, ChevronDownIcon } from 'lucide-react';
import { Disclosure, Transition } from '@headlessui/react';

interface Shift {
  date: string;
  employerId: string;
  employer: string;
  start: string;
  end: string;
  break: number;
  hoursWorked: number;
  payrate: number;
  pay: number;
  payDate: string;
  isPublicHoliday?: boolean;
  holidayName?: string;
  eveningHours?: number;
  isSaturday?: boolean;
}

interface PayDate {
  date: string;
  employerId: string;
  employer: string;
  amount: number;
  totalHours: number;
  shiftCount: number;
  averageHourlyRate: number;
  shifts: string[];
  periodStart: string;
  periodEnd: string;
}

interface Employer {
  id: string;
  name: string;
  level: string;
  state: string;
  paycycle: string;
  payday: string;
  payPeriodStart: string;
  payPeriodDays: number;
  nextPayDate: string;
  color: string;
}

interface TimelineProps {
  shifts: Shift[];
  payDates?: PayDate[];
  selectedDate: Date;
  employers: Employer[];
  onPayPeriodSelect: (start: Date | null, end: Date | null, employerId: string | null) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  shifts,
  payDates,
  selectedDate,
  employers,
  onPayPeriodSelect,
}) => {
  const [filteredShifts, setFilteredShifts] = useState<Shift[]>([]);
  const [filteredPayDates, setFilteredPayDates] = useState<PayDate[]>([]);
  
  useEffect(() => {
    // Get the current date and calculate the end date (2 months from now)
    const currentDate = new Date();
    const startDate = new Date(currentDate);
    const endDate = new Date(currentDate);
    endDate.setMonth(endDate.getMonth() + 2);
    
    // Filter shifts for the next 2 months
    const shiftsForNextTwoMonths = shifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      return shiftDate >= startDate && shiftDate <= endDate;
    });
    
    // Sort by date
    const sortedShifts = shiftsForNextTwoMonths.sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    
    setFilteredShifts(sortedShifts);
    
    // Filter pay dates for the next 2 months if available
    if (payDates && payDates.length > 0) {
      const payDatesForNextTwoMonths = payDates.filter(payDate => {
        const date = new Date(payDate.date);
        return date >= startDate && date <= endDate;
      });
      
      setFilteredPayDates(payDatesForNextTwoMonths);
    }
    
    // If a date is selected, check if it's a pay date and highlight the corresponding pay period
    if (selectedDate) {
      const selectedDateStr = selectedDate.toISOString().split('T')[0];
      const matchingPayDate = payDates?.find(pd => pd.date === selectedDateStr);
      
      if (matchingPayDate) {
        // Find the employer to get pay period details
        const employer = employers.find(emp => emp.id === matchingPayDate.employerId);
        
        if (employer) {
          // Calculate pay period start and end dates
          const payDate = new Date(matchingPayDate.date);
          const periodStart = new Date(payDate);
          periodStart.setDate(periodStart.getDate() - employer.payPeriodDays);
          
          // Notify parent component about the selected pay period
          onPayPeriodSelect(periodStart, payDate, matchingPayDate.employerId);
        }
      }
    }
  }, [shifts, payDates, selectedDate, employers, onPayPeriodSelect]);

  // Format date to display in a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Format time to display in a readable format
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  // Get employer color based on employerId
  const getEmployerColor = (employerId: string): string => {
    const employer = employers.find(emp => emp.id === employerId);
    return employer?.color || '#f59e0b'; // Default to orange if not found
  };

  return (
    <div className="timeline-container">
      <h2 className="text-xl font-semibold mb-4">Shifts for the Next 2 Months</h2>
      
      {filteredShifts.length === 0 && filteredPayDates.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No shifts or payments scheduled for this month
        </div>
      ) : (
        <VerticalTimeline lineColor="#e5e7eb" className="custom-timeline" layout="2-columns">
          {/* Combine and sort both shifts and pay dates */}
          {[
            ...filteredShifts.map(shift => ({
              type: 'shift',
              date: new Date(shift.date),
              data: shift
            })),
            ...filteredPayDates.map(payDate => ({
              type: 'payDate',
              date: new Date(payDate.date),
              data: payDate
            }))
          ]
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .map((item, index) => {
              if (item.type === 'shift') {
                const shift = item.data as Shift;
                return (
                  <VerticalTimelineElement
                    key={`shift-${index}`}
                    className="vertical-timeline-element"
                    contentStyle={{ 
                      background: `${getEmployerColor(shift.employerId)}20`, 
                      color: '#333',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      borderRadius: '0.5rem',
                      padding: '12px'
                    }}
                    contentArrowStyle={{ borderRight: `7px solid ${getEmployerColor(shift.employerId)}20` }}
                    date=""
                    iconStyle={{ 
                      background: getEmployerColor(shift.employerId),
                      color: '#fff',
                      boxShadow: '0 0 0 4px #fff, inset 0 2px 0 rgba(0, 0, 0, 0.08), 0 3px 0 4px rgba(0, 0, 0, 0.05)'
                    }}
                    icon={<div className="flex items-center justify-center h-full w-full font-bold text-white">{shift.employer.charAt(0)}</div>}
                    position="right"
                  >
                    <div>
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-600 mb-1">{formatDate(shift.date)}</div>
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm font-medium">{shift.employer}</h3>
                          <div className="flex items-center font-semibold">
                            <DollarSignIcon className="h-3.5 w-3.5 mr-1 text-green-600" />
                            <span className="text-green-600 text-sm">${shift.pay.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <Disclosure>
                        {({ open }) => (
                          <div>
                            <Disclosure.Button className="flex w-full justify-between items-center mt-1 text-sm text-gray-500 hover:text-gray-700">
                              <span>Details</span>
                              <ChevronDownIcon
                                className={`${open ? 'rotate-180 transform' : ''} h-3 w-3`}
                              />
                            </Disclosure.Button>
                            <Transition
                              enter="transition duration-100 ease-out"
                              enterFrom="transform scale-95 opacity-0"
                              enterTo="transform scale-100 opacity-100"
                              leave="transition duration-75 ease-out"
                              leaveFrom="transform scale-100 opacity-100"
                              leaveTo="transform scale-95 opacity-0"
                            >
                              <Disclosure.Panel className="pt-2 text-sm">
                                <div className="flex items-center mb-0.5 text-gray-600">
                                  <ClockIcon className="h-3 w-3 mr-1" />
                                  <span>{formatTime(shift.start)} - {formatTime(shift.end)}</span>
                                </div>
                                
                                <div className="flex items-center mb-0.5 text-gray-600">
                                  <CalendarIcon className="h-3 w-3 mr-1" />
                                  <span>{shift.hoursWorked} hours</span>
                                  {shift.break > 0 && <span className="ml-1">({shift.break} min break)</span>}
                                </div>
                                
                                {shift.eveningHours && shift.eveningHours > 0 && (
                                  <div className="text-xs text-gray-500 mb-0.5">
                                    Including {shift.eveningHours} evening hours
                                  </div>
                                )}
                                
                                <div className="flex items-center mt-0.5 text-gray-600">
                                  <span className="text-xs">
                                    Rate: ${shift.payrate.toFixed(2)}/hr
                                  </span>
                                </div>
                                
                                <div className="text-xs text-gray-500 mt-0.5">
                                  Pay date: {formatDate(shift.payDate)}
                                </div>
                                
                                {shift.isPublicHoliday && (
                                  <div className="text-xs text-red-600 mt-1 font-medium">
                                    Public Holiday: {shift.holidayName || 'Public Holiday'}
                                  </div>
                                )}
                                
                                {shift.isSaturday && (
                                  <div className="text-xs text-blue-600 mt-1 font-medium">
                                    Saturday Rate
                                  </div>
                                )}
                              </Disclosure.Panel>
                            </Transition>
                          </div>
                        )}
                      </Disclosure>
                    </div>
                  </VerticalTimelineElement>
                );
              } else {
                // It's a pay date
                const payDate = item.data as PayDate;
                return (
                  <VerticalTimelineElement
                    key={`pay-${index}`}
                    className="vertical-timeline-element"
                    contentStyle={{ 
                      background: '#10b98120', 
                      color: '#333',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      borderRadius: '0.5rem',
                      padding: '12px'
                    }}
                    contentArrowStyle={{ borderRight: '7px solid #10b98120' }}
                    date=""
                    iconStyle={{ 
                      background: '#10b981', // Green background for pay dates
                      color: '#fff',
                      boxShadow: '0 0 0 4px #fff, inset 0 2px 0 rgba(0, 0, 0, 0.08), 0 3px 0 4px rgba(0, 0, 0, 0.05)'
                    }}
                    icon={<div className="flex items-center justify-center h-full w-full font-bold text-white">{payDate.employer.charAt(0)}</div>}
                    position="right"
                    onTimelineElementClick={() => {
                      // Find the employer to get pay period details
                      const employer = employers.find(emp => emp.id === payDate.employerId);
                      
                      if (employer) {
                        // Calculate pay period start and end dates
                        const payDateObj = new Date(payDate.date);
                        const periodStart = new Date(payDateObj);
                        periodStart.setDate(periodStart.getDate() - employer.payPeriodDays);
                        
                        // Notify parent component about the selected pay period
                        onPayPeriodSelect(periodStart, payDateObj, payDate.employerId);
                      }
                    }}
                  >
                    <div>
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-600 mb-1">{formatDate(payDate.date)}</div>
                        <div className="flex justify-between items-center">
                          <div className="text-sm font-medium">{payDate.employer}</div>
                          <div className="flex items-center font-semibold">
                            <DollarSignIcon className="h-3.5 w-3.5 mr-1 text-green-600" />
                            <span className="text-green-600 text-sm">${payDate.amount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      <Disclosure>
                        {({ open }) => (
                          <div>
                            <Disclosure.Button className="flex w-full justify-between items-center mt-1 text-sm text-gray-500 hover:text-gray-700">
                              <span>Details</span>
                              <ChevronDownIcon
                                className={`${open ? 'rotate-180 transform' : ''} h-3 w-3`}
                              />
                            </Disclosure.Button>
                            <Transition
                              enter="transition duration-100 ease-out"
                              enterFrom="transform scale-95 opacity-0"
                              enterTo="transform scale-100 opacity-100"
                              leave="transition duration-75 ease-out"
                              leaveFrom="transform scale-100 opacity-100"
                              leaveTo="transform scale-95 opacity-0"
                            >
                              <Disclosure.Panel className="pt-2 text-sm">
                                <div className="flex items-center mb-0.5 text-gray-600">
                                  <CalendarIcon className="h-3 w-3 mr-1" />
                                  <span>{payDate.totalHours ? payDate.totalHours.toFixed(1) : '0'} total hours</span>
                                </div>
                                
                                <div className="text-xs text-gray-500 mt-0.5">
                                  {payDate.shiftCount || 0} shifts in this pay period
                                </div>
                                
                                <div className="text-xs text-gray-500 mt-0.5">
                                  Average hourly rate: ${payDate.averageHourlyRate ? payDate.averageHourlyRate.toFixed(2) : '0.00'}
                                </div>
                              </Disclosure.Panel>
                            </Transition>
                          </div>
                        )}
                      </Disclosure>
                    </div>
                  </VerticalTimelineElement>
                );
              }
            })}
        </VerticalTimeline>
      )}
    </div>
  );
};
