import React from 'react';
import { format, parseISO } from 'date-fns';
import { Briefcase } from 'lucide-react';

interface PayDateDetailContentProps {
  payDate: {
    date: string;
    employerId: string;
    employer: string;
    amount?: number;
    periodStart?: string;
    periodEnd?: string;
    hours?: number;
    payRate?: number;
    tax?: number;
    employeeLevel?: string;
    awardDescription?: string;
    sgcPercentage?: number;
    payCategories?: {
      category: string;
      hours: number;
      rate: number;
      description: string;
    }[];
  };
}

const PayDateDetailContent: React.FC<PayDateDetailContentProps> = ({ payDate }) => {
  // No need to parse the main payment date anymore as it's handled in the PayDateCard component
  
  // No longer using average pay rate as requested
  
  // Use pre-calculated data directly
  const hours = payDate.hours || 0;
  const grossPay = payDate.amount || 0;
  const tax = payDate.tax || (grossPay * 0.2); // 20% tax estimate if not provided
  const netPay = grossPay - tax;
  
  // Format period dates if available
  const periodStartFormatted = payDate.periodStart 
    ? format(parseISO(payDate.periodStart), 'd MMMM yyyy')
    : 'Not available';
  
  const periodEndFormatted = payDate.periodEnd
    ? format(parseISO(payDate.periodEnd), 'd MMMM yyyy')
    : 'Not available';
  
  return (
    <div className="space-y-6">
      {/* Employer Information Section */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
          Payment Information
        </h4>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center">
            <Briefcase className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">{payDate.employer}</p>
              {payDate.awardDescription ? (
                <p className="text-xs text-gray-500 mt-1">
                  {payDate.awardDescription}
                </p>
              ) : payDate.employeeLevel && (
                <p className="text-xs text-gray-500 mt-1">
                  Employee Level: {payDate.employeeLevel}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Pay Period Section */}
      {(payDate.periodStart || payDate.periodEnd) && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            Pay Period
          </h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between mb-2">
              <div className="text-sm text-gray-500">Start Date</div>
              <div className="text-sm font-medium text-gray-900">{periodStartFormatted}</div>
            </div>
            <div className="flex justify-between">
              <div className="text-sm text-gray-500">End Date</div>
              <div className="text-sm font-medium text-gray-900">{periodEndFormatted}</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Pay Details Section */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
          Pay Details
        </h4>
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          {/* Hours */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">Total Hours</div>
            <div className="text-sm font-medium text-gray-900">{hours.toFixed(2)}</div>
          </div>
          
          {/* Pay Categories */}
          <div className="pt-2 border-t border-gray-200">
            <h5 className="text-xs font-medium text-gray-500 mb-2">Pay Categories</h5>
            {payDate.payCategories && payDate.payCategories.length > 0 ? (
              <div>
                {/* Only show categories with hours > 0 */}
                {payDate.payCategories
                  .filter(category => category.hours > 0)
                  .map((category, index) => (
                    <div key={index} className="flex justify-between items-center mb-2">
                      <div className="flex-1 text-sm text-gray-500">
                        {category.description}
                      </div>
                      <div className="flex-none ml-2 text-sm text-gray-500 text-right">
                        {category.hours.toFixed(2)} hrs
                      </div>
                      <div className="flex-none ml-4 text-sm font-medium text-gray-900 text-right w-20">
                        ${category.rate.toFixed(2)}/hr
                      </div>
                    </div>
                  ))
                }
                {payDate.payCategories.filter(category => category.hours > 0).length === 0 && (
                  <div className="text-sm text-gray-500 italic">No hours worked in this pay period</div>
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">No detailed pay categories available</div>
            )}
          </div>
          
          {/* Pay Summary */}
          <div className="pt-3 border-t border-gray-200">
            <div className="flex justify-between items-center mb-1">
              <div className="text-sm text-gray-500">Gross Pay</div>
              <div className="text-sm font-medium text-gray-900">${grossPay.toFixed(2)}</div>
            </div>
            <div className="flex justify-between items-center mb-1">
              <div className="text-sm text-gray-500">Tax</div>
              <div className="text-sm font-medium text-gray-900">-${tax.toFixed(2)}</div>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-100 mb-2">
              <div className="text-sm font-medium text-gray-700">Net Pay</div>
              <div className="text-sm font-bold text-gray-900">${netPay.toFixed(2)}</div>
            </div>
            {payDate.sgcPercentage && (
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <div className="text-sm text-gray-500">Superannuation ({payDate.sgcPercentage}%)</div>
                <div className="text-sm font-medium text-gray-900">${(grossPay * payDate.sgcPercentage / 100).toFixed(2)}</div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Buttons removed as requested */}
    </div>
  );
};

export default PayDateDetailContent;
