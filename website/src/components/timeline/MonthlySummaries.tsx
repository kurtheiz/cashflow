import React from 'react';
import { BarChart3Icon, ChevronDownIcon } from 'lucide-react';
import { Disclosure, Transition } from '@headlessui/react';
import { MonthlySummariesProps } from './types';

/**
 * Monthly Summaries Component
 * Displays monthly summaries of shifts, hours, pay, and tax information
 */
export const MonthlySummaries: React.FC<MonthlySummariesProps> = ({ summaries }) => {
  if (summaries.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h3 className="text-lg font-semibold flex items-center mb-3">
        <BarChart3Icon className="h-5 w-5 mr-2 text-blue-500" />
        Monthly Summaries
      </h3>
      
      <div className="space-y-4">
        {summaries.map((summary) => (
          <div key={`${summary.month}-${summary.year}`} className="border-b pb-3 last:border-0">
            <h4 className="font-medium text-gray-800 mb-2">{summary.month} {summary.year}</h4>
            
            <div className="grid grid-cols-3 text-xs text-gray-500 mb-1">
              <div>Employer</div>
              <div className="text-right">Gross</div>
              <div className="text-right">Net</div>
            </div>
            
            {/* Employer rows */}
            {Object.entries(summary.employers).map(([empId, empSummary]) => (
              <div key={empId} className="grid grid-cols-3 text-sm py-1">
                <div className="flex items-center">
                  <div 
                    className="h-3 w-3 rounded-full mr-2" 
                    style={{ backgroundColor: empSummary.color }}
                  ></div>
                  <span>{empSummary.name}</span>
                </div>
                <div className="text-right text-gray-600">${empSummary.pay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="text-right font-medium text-green-600">${empSummary.netPay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
            ))}
            
            {/* Total row */}
            <div className="grid grid-cols-3 text-sm font-semibold mt-2 pt-2 border-t border-gray-100">
              <div>Total</div>
              <div className="text-right text-gray-600">${summary.totalPay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className="text-right text-green-600">${summary.totalNetPay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            
            {/* Details disclosure */}
            <Disclosure>
              {({ open }) => (
                <div className="mt-2">
                  <Disclosure.Button className="flex w-full justify-between items-center text-sm text-gray-500 hover:text-gray-700">
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
                      {/* Shifts and hours details */}
                      <div className="text-xs text-gray-600 mb-2">
                        <div className="grid grid-cols-3 mb-1">
                          <div>Employer</div>
                          <div className="text-center">Shifts</div>
                          <div className="text-right">Hours</div>
                        </div>
                        {Object.entries(summary.employers).map(([empId, empSummary]) => (
                          <div key={`${empId}-details`} className="grid grid-cols-3 py-0.5">
                            <div className="flex items-center">
                              <div 
                                className="h-2 w-2 rounded-full mr-2" 
                                style={{ backgroundColor: empSummary.color }}
                              ></div>
                              <span>{empSummary.name}</span>
                            </div>
                            <div className="text-center">{empSummary.shifts}</div>
                            <div className="text-right">{empSummary.hours.toFixed(1)}</div>
                          </div>
                        ))}
                        <div className="grid grid-cols-3 font-medium border-t border-gray-100 pt-1 mt-1">
                          <div>Total</div>
                          <div className="text-center">{summary.totalShifts}</div>
                          <div className="text-right">{summary.totalHours.toFixed(1)}</div>
                        </div>
                      </div>
                      
                      {/* Tax summary */}
                      <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
                        <div className="flex justify-between">
                          <span>Tax withheld:</span>
                          <span className="text-red-500">-${summary.totalTax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Effective tax rate:</span>
                          <span>{summary.totalPay > 0 ? ((summary.totalTax / summary.totalPay) * 100).toFixed(1) : 0}%</span>
                        </div>
                      </div>
                    </Disclosure.Panel>
                  </Transition>
                </div>
              )}
            </Disclosure>
          </div>
        ))}
      </div>
    </div>
  );
};
