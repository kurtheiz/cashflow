import React from 'react';
import { format, parseISO } from 'date-fns';
import { Briefcase } from 'lucide-react';

interface PayDateCardProps {
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
  };
  color?: string;
}

const PayDateCard: React.FC<PayDateCardProps> = ({ 
  payDate,
  color = '#3b82f6' // Default to blue-500 if no color provided
}) => {
  const paymentDate = parseISO(payDate.date);
  const dayOfWeek = format(paymentDate, 'EEE');
  const dayOfMonth = format(paymentDate, 'd');
  const month = format(paymentDate, 'MMM');
  
  // Use the provided pay rate or default to a reasonable value
  const actualPayRate = payDate.payRate || 25.00;
  
  // Define PayDetails interface
  interface PayDetails {
    hours: number;
    payRate: number;
    grossPay: number;
    tax: number;
    netPay: number;
  }
  
  // Use pre-calculated data directly
  const payDetails: PayDetails = {  
    hours: payDate.hours || 0,
    payRate: actualPayRate,
    grossPay: payDate.amount || 0,
    tax: payDate.tax || 0,
    netPay: (payDate.amount !== undefined && payDate.tax !== undefined) ? 
      payDate.amount - payDate.tax : 
      (payDate.amount || 0) * 0.8
  };
  
  // Format period dates if available
  const periodText = payDate.periodStart && payDate.periodEnd
    ? `${format(parseISO(payDate.periodStart), 'MMM d')} - ${format(parseISO(payDate.periodEnd), 'MMM d')}`
    : 'Pay period details not available';
  
  return (
    <div className="overflow-hidden py-2 w-full" style={{ backgroundColor: `${color}10` }}>
      <div className="flex w-full overflow-hidden pl-2 sm:pl-4">
        {/* Left date column */}
        <div 
          className="flex-none flex flex-col items-center justify-center p-2 sm:p-4 text-white"
          style={{ backgroundColor: color, width: '60px' }}
        >
          <span className="text-xs uppercase tracking-wide">{month}</span>
          <span className="text-2xl font-bold">{dayOfMonth}</span>
          <span className="text-sm font-medium">{dayOfWeek}</span>
        </div>
        
        {/* Main content */}
        <div className="flex-1 min-w-0 p-2 sm:p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
              <h3 className="font-medium text-gray-900">{payDate.employer} Pay</h3>
            </div>
            <span className="font-semibold text-gray-900">
              ${payDetails.netPay.toFixed(2)}
            </span>
          </div>
          
          {payDate.periodStart && payDate.periodEnd && (
            <div className="flex items-center text-sm text-gray-600 mb-3">
              <span className="ml-6">Pay period: {periodText}</span>
            </div>
          )}
          

          

        </div>
      </div>
    </div>
  );
};

export default PayDateCard;
