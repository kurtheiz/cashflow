import React from 'react';
import { VerticalTimelineElement } from 'react-vertical-timeline-component';
import { Disclosure, Transition } from '@headlessui/react';
import { CalendarIcon, ClockIcon, ChevronDownIcon, Trash2Icon } from 'lucide-react';
import { ShiftItemProps } from './types';

/**
 * Shift Item Component
 * Displays a single shift in the timeline
 */
export const ShiftItem: React.FC<ShiftItemProps> = ({ 
  shift, 
  getEmployerColor, 
  formatTime 
}) => {
  const shiftColor = getEmployerColor(shift.employerId);
  
  return (
    <VerticalTimelineElement
      className="vertical-timeline-element--work"
      contentStyle={{ background: 'white', color: '#333', boxShadow: '0 3px 10px rgba(0,0,0,0.08)', borderTop: `3px solid ${shiftColor}`, position: 'relative' }}
      contentArrowStyle={{ borderRight: '7px solid white' }}
      date=""
      iconStyle={{ background: shiftColor, color: '#fff' }}
      icon={
        <div className="flex flex-col items-center justify-center text-center w-full h-full">
          <div className="text-lg font-bold leading-none">
            {new Date(shift.date).getDate()}
          </div>
          <div className="text-xs font-bold uppercase">
            {new Date(shift.date).toLocaleString('default', { month: 'short' })}
          </div>
        </div>
      }
    >
      <div className="absolute -bottom-3 -right-3 z-10">
        <button className="bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-2.5 shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50">
          <Trash2Icon className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-col">
        <div className="flex justify-between items-start">
          <h3 className="text-base font-semibold">{shift.employer}</h3>
          <div className="flex flex-col items-end">
            <div className="font-semibold">
              <span className="text-gray-800 text-sm font-bold">${shift.pay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center mt-2 mb-1">
          <button className="bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full p-2 mr-2 shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50">
            <ClockIcon className="h-4 w-4" />
          </button>
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-800">
              {formatTime(shift.start)} - {formatTime(shift.end)}
            </span>
            <span className="text-sm font-semibold text-gray-700 ml-2">
              ({Math.floor(shift.hoursWorked)} {Math.floor(shift.hoursWorked) === 1 ? 'hr' : 'hrs'}
              {Math.round((shift.hoursWorked % 1) * 60) > 0 ? ` ${Math.round((shift.hoursWorked % 1) * 60)} ${Math.round((shift.hoursWorked % 1) * 60) === 1 ? 'min' : 'mins'}` : ''})
            </span>
          </div>
        </div>
      </div>

      <Disclosure>
        {({ open }) => (
          <div>
            <Disclosure.Button className="flex w-full justify-center items-center mt-2 text-sm text-gray-500 hover:text-gray-700 gap-1">
              <span>More</span>
              <ChevronDownIcon
                className={`${open ? 'rotate-180 transform' : ''} h-4 w-4`}
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
              <Disclosure.Panel className="pt-0 text-sm">
                {shift.break > 0 && (
                  <div className="flex items-center mb-0.5 text-gray-600">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    <span>{shift.break} min break</span>
                  </div>
                )}
                
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
                
                <div className="text-xs text-gray-500 mt-0.5 mb-0">
                  Pay date: {new Date(shift.payDate).toLocaleDateString('en-AU')}
                </div>
              </Disclosure.Panel>
            </Transition>
          </div>
        )}
      </Disclosure>
    </VerticalTimelineElement>
  );
};
