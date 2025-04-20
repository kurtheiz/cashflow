import React from 'react';
import { format, parseISO } from 'date-fns';
import { DollarSign, Briefcase } from 'lucide-react';

interface PayDateCardProps {
  payDate: {
    date: string;
    employerId: string;
    employer: string;
    amount?: number;
    periodStart?: string;
    periodEnd?: string;
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
  
  // Format period dates if available
  const periodText = payDate.periodStart && payDate.periodEnd
    ? `${format(parseISO(payDate.periodStart), 'MMM d')} - ${format(parseISO(payDate.periodEnd), 'MMM d')}`
    : 'Pay period details not available';
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex">
        {/* Left date column */}
        <div 
          className="flex flex-col items-center justify-center p-4 text-white"
          style={{ backgroundColor: color, width: '80px' }}
        >
          <span className="text-xs uppercase tracking-wide">{month}</span>
          <span className="text-2xl font-bold">{dayOfMonth}</span>
          <span className="text-sm font-medium">{dayOfWeek}</span>
        </div>
        
        {/* Main content */}
        <div className="flex-1 p-4">
          <div className="flex items-center mb-3">
            <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
            <h3 className="font-medium text-gray-900">{payDate.employer}</h3>
          </div>
          
          {payDate.periodStart && payDate.periodEnd && (
            <div className="flex items-center text-sm text-gray-600 mb-3">
              <span className="ml-6">Pay period: {periodText}</span>
            </div>
          )}
          
          <div className="mt-2 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-green-500" />
            <span className="font-semibold text-gray-900">
              {payDate.amount 
                ? `$${payDate.amount.toFixed(2)}` 
                : 'Amount pending'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayDateCard;
