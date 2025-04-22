import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { DollarSign, CalendarRange } from 'lucide-react';
import DetailModal from './DetailModal';
import PayDateDetailContent from './PayDateDetailContent';

interface PayDateCardProps {
  payDate: {
    date: string;
    employerId: string;
    employer: string;
    amount?: number;
    grossPay?: number; // Added to match the payperiods.json structure
    periodStart?: string;
    periodEnd?: string;
    hours?: number;
    payRate?: number;
    tax?: number;
    netPay?: number;
    employeeLevel?: string;
    awardDescription?: string;
    sgcPercentage?: number;
    payCategories?: {
      category: string;
      hours: number;
      rate: number;
      description: string;
    }[];
    // Added for pay period shift display:
    shiftDates?: string[]; // ISO date strings for each shift worked
    shifts?: string[]; // shift IDs (fallback)
    // Added for allowances:
    allowances?: {
      name: string;
      amount: number;
      type?: string;
      notes?: string;
    }[];
    allowanceTotal?: number;
    totalGrossPay?: number; // Added to include total gross pay with allowances
  };
  color?: string;
}

const PayDateCard: React.FC<PayDateCardProps> = ({ 
  payDate,

}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
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
  
  // Use pre-calculated data directly - no calculations in the component
  const payDetails: PayDetails = {  
    hours: payDate.hours || 0,
    payRate: actualPayRate,
    grossPay: payDate.grossPay || 0, // Use grossPay instead of amount
    tax: payDate.tax || 0,
    netPay: payDate.netPay || 0 // Only use the provided netPay value
  };
  
  // Format period dates if available
  const periodText = payDate.periodStart && payDate.periodEnd
    ? `${format(parseISO(payDate.periodStart), 'd MMM')} - ${format(parseISO(payDate.periodEnd), 'd MMM')}`
    : 'Pay period details not available';
  
  return (
    <div className="relative">
      {/* PAY badge */}
      
      <div 
        className="overflow-hidden py-2 w-full cursor-pointer bg-green-50 border-l-4 border-green-500 hover:bg-green-100 transition-colors" 
        onClick={() => setIsModalOpen(true)}
      >
      <div className="flex w-full overflow-hidden pl-2 sm:pl-4">
        {/* Left date column: white bg, black text, square primary-blue border */}
        <div className="flex flex-col items-center justify-center w-16 sm:w-20 bg-white text-black border-2 border-gray-200">
          <span className="text-xs font-medium uppercase tracking-wide">{dayOfWeek}</span>
          <span className="text-2xl font-bold leading-none">{dayOfMonth}</span>
          <span className="text-xs font-medium uppercase tracking-wide">{month}</span>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0 p-2 sm:p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
              <h3 className="font-medium text-gray-900">{payDate.employer} Pay</h3>
            </div>
            <div className="flex flex-col items-end">
              <span className="font-semibold text-gray-900">
                ${payDetails.netPay.toFixed(2)}
              </span>
              <span className="text-xs text-gray-500">Net Pay</span>
            </div>
          </div>
          
          {payDate.periodStart && payDate.periodEnd && (
            <div className="flex items-center text-sm text-gray-600">
              <CalendarRange className="h-4 w-4 mr-2 text-gray-400" />
              <span>Pay period: {periodText}</span>
            </div>
          )}
          

          

        </div>
      </div>
    </div>
      
      {/* Detail Modal */}
      <DetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${payDate.employer} Payment Details`}
        subtitle={format(paymentDate, 'EEEE, d MMMM yyyy')}
        color={'#10b981'}
        modalType="payDate"
      >
        <PayDateDetailContent payDate={payDate} />
      </DetailModal>
    </div>
  );
};

export default PayDateCard;
