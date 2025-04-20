import React from 'react';
import { VerticalTimelineElement } from 'react-vertical-timeline-component';
import { Disclosure, Transition } from '@headlessui/react';
import { CalendarIcon, ChevronDownIcon } from 'lucide-react';
import { PayDateItemProps } from './types';

/**
 * Pay Date Item Component
 * Displays a single pay date in the timeline
 */
export const PayDateItem: React.FC<PayDateItemProps> = ({ 
  payDate, 
  getEmployerColor
}) => {
  const payDateColor = getEmployerColor(payDate.employerId);
  // Adding 15 as hex opacity (approx 10%)
  const backgroundColor = `${payDateColor}15`;
  
  // Set CSS variable for the paydate color
  React.useEffect(() => {
    document.documentElement.style.setProperty('--paydate-color', payDateColor);
  }, [payDateColor]);
  
  return (
    <VerticalTimelineElement
      className="vertical-timeline-element--work paydate-item-arrow"
      contentStyle={{ 
        background: backgroundColor,
        color: '#333', 
        boxShadow: '0 3px 10px rgba(0,0,0,0.08)', 
        borderTop: `3px solid ${payDateColor}` 
      }}
      contentArrowStyle={{ borderRight: `10px solid ${payDateColor}` }}
      date=""
      iconStyle={{ background: payDateColor, color: '#fff' }}
      icon={
        <div className="flex flex-col items-center justify-center text-center w-full h-full">
          <div className="text-xs font-bold uppercase">
            {new Date(payDate.date).toLocaleString('default', { weekday: 'short' })}
          </div>
          <div className="text-lg font-bold leading-none">
            {new Date(payDate.date).getDate()}
          </div>
          <div className="text-xs font-bold uppercase">
            {new Date(payDate.date).toLocaleString('default', { month: 'short' })}
          </div>
        </div>
      }
    >
      <div className="flex flex-col">
        <div className="flex justify-between items-start">
          <div className="text-base font-semibold">{payDate.employer} Pay</div>
          <div className="flex flex-col items-end">
            <div>
              <span className="text-gray-800 text-sm font-bold">${payDate.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="text-sm text-green-600 font-bold">
              Net: ${payDate.netPay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
        <div className="flex items-center mt-1 text-sm font-medium">
          <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
          {payDate.totalHours ? (
            <span className="text-gray-700">
              {Math.floor(payDate.totalHours)} {Math.floor(payDate.totalHours) === 1 ? 'hr' : 'hrs'}
              {Math.round((payDate.totalHours % 1) * 60) > 0 ? ` ${Math.round((payDate.totalHours % 1) * 60)} ${Math.round((payDate.totalHours % 1) * 60) === 1 ? 'min' : 'mins'}` : ''} total
            </span>
          ) : (
            <span className="text-gray-500">No shifts worked</span>
          )}
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
                <div className="text-xs text-gray-500 mt-0 mb-0">
                  {payDate.shiftCount || 0} {payDate.shiftCount === 1 ? 'shift' : 'shifts'} in this pay period
                </div>
                
                {payDate.hoursByRate && Object.keys(payDate.hoursByRate).length > 0 ? (
                  <div className="text-xs text-gray-500 mt-0.5 mb-0">
                    <div className="font-medium mb-0.5">Hours & Pay by Rate:</div>
                    {Object.entries(payDate.hoursByRate).map(([rateType, hours], idx) => {
                      const pay = payDate.payByRate?.[rateType] || 0;
                      return (
                        <div key={idx} className="flex justify-between pl-2">
                          <span>{rateType}:</span>
                          <span>
                            {hours.toFixed(1)} hrs
                            <span className="text-green-600 ml-1">
                              (${pay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                            </span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
                
                <div className="text-xs text-gray-600 mt-1 border-t border-gray-100 pt-0.5 mb-0">
                  <div className="font-medium mb-0.5">Tax Summary:</div>
                  <div className="grid grid-cols-2 gap-1">
                    <div className="text-gray-500">Gross Pay:</div>
                    <div className="text-right">${payDate.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    
                    <div className="text-gray-500">Tax Withheld:</div>
                    <div className="text-right text-red-500">-${payDate.tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    
                    <div className="text-gray-500 font-medium">Net Pay:</div>
                    <div className="text-right font-medium text-green-600">${payDate.netPay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    
                    <div className="text-gray-500">Tax Rate:</div>
                    <div className="text-right">{payDate.amount > 0 ? ((payDate.tax / payDate.amount) * 100).toFixed(1) : 0}%</div>
                  </div>
                </div>
              </Disclosure.Panel>
            </Transition>
          </div>
        )}
      </Disclosure>
    </VerticalTimelineElement>
  );
};
