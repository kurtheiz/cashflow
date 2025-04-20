import React from 'react';
import { VerticalTimelineElement } from 'react-vertical-timeline-component';
import { Disclosure, Transition } from '@headlessui/react';
import { BriefcaseIcon, CalendarIcon, ClockIcon, DollarSignIcon, ChevronDownIcon } from 'lucide-react';
import { ShiftItemProps } from './types';

/**
 * Shift Item Component
 * Displays a single shift in the timeline
 */
export const ShiftItem: React.FC<ShiftItemProps> = ({ 
  shift, 
  getEmployerColor, 
  formatDate, 
  formatTime 
}) => {
  const shiftColor = getEmployerColor(shift.employerId);
  
  return (
    <VerticalTimelineElement
      className="vertical-timeline-element--work"
      contentStyle={{ background: 'white', color: '#333', boxShadow: '0 3px 10px rgba(0,0,0,0.08)', borderTop: `3px solid ${shiftColor}` }}
      contentArrowStyle={{ borderRight: '7px solid white' }}
      date={formatDate(shift.date)}
      iconStyle={{ background: shiftColor, color: '#fff' }}
      icon={<BriefcaseIcon className="w-5 h-5" />}
    >
      <div className="flex flex-col">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium">{shift.employer}</h3>
          <div className="flex flex-col items-end">
            <div className="flex items-center font-semibold">
              <DollarSignIcon className="h-3.5 w-3.5 mr-1 text-green-600" />
              <span className="text-green-600 text-sm">${shift.pay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
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
                  <span>
                    {formatTime(shift.start)} - {formatTime(shift.end)}
                  </span>
                </div>
                
                <div className="flex items-center mb-0.5 text-gray-600">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  <span>
                    {shift.hoursWorked.toFixed(1)} hours
                    {shift.break > 0 && ` (${shift.break} min break)`}
                  </span>
                </div>
                
                <div className="flex items-center mt-0.5 text-gray-600">
                  <span className="text-xs">
                    Rate: ${shift.payrate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/hr
                  </span>
                </div>
                
                {shift.isPublicHoliday && (
                  <div className="text-xs text-blue-600 mt-1">
                    Public Holiday: {shift.holidayName}
                  </div>
                )}
                
                {shift.isSaturday && (
                  <div className="text-xs text-blue-600 mt-1">
                    Saturday rates apply
                  </div>
                )}
                
                {shift.isSunday && (
                  <div className="text-xs text-blue-600 mt-1">
                    Sunday rates apply
                  </div>
                )}
                
                {shift.eveningHours && shift.eveningHours > 0 && (
                  <div className="text-xs text-blue-600 mt-1">
                    Evening hours: {shift.eveningHours.toFixed(1)}
                  </div>
                )}
                
                <div className="text-xs text-gray-500 mt-1">
                  Pay date: {formatDate(shift.payDate)}
                </div>
              </Disclosure.Panel>
            </Transition>
          </div>
        )}
      </Disclosure>
    </VerticalTimelineElement>
  );
};
