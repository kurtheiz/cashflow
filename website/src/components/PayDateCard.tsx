import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Briefcase } from 'lucide-react';
import DetailModal from './DetailModal';
import PayDateDetailContent from './PayDateDetailContent';

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
  };
  color?: string;
}

const PayDateCard: React.FC<PayDateCardProps> = ({ 
  payDate,
  color = '#3b82f6' // Default to blue-500 if no color provided
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
    ? `${format(parseISO(payDate.periodStart), 'd MMM')} - ${format(parseISO(payDate.periodEnd), 'd MMM')}`
    : 'Pay period details not available';
  
  return (
    <div className="relative">
      {/* PAY badge */}
      <span className="absolute bottom-4 right-4 text-white text-xs px-2 py-1 rounded z-0" style={{ backgroundColor: 'oklch(70.7% 0.165 254.624)' }}>PAY</span>
      <div 
        className="overflow-hidden py-2 w-full cursor-pointer bg-white hover:bg-gray-50 transition-colors" 
        onClick={() => setIsModalOpen(true)}
      >
      <div className="flex w-full overflow-hidden pl-2 sm:pl-4">
        {/* Left date column */}
        <div className="flex flex-col items-center justify-center w-16 sm:w-20 py-2 rounded-l-lg text-white" style={{ backgroundColor: 'oklch(70.7% 0.165 254.624)' }}>
          <span className="text-xs font-medium uppercase tracking-wide">{dayOfWeek}</span>
          <span className="text-2xl font-bold leading-none">{dayOfMonth}</span>
          <span className="text-xs font-medium uppercase tracking-wide">{month}</span>
        </div>
        {/* Vertical dark blue strip extending from date column */}
        <div className="h-full w-2" style={{ backgroundColor: 'oklch(70.7% 0.165 254.624)' }} />
        
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
      
      {/* Detail Modal */}
      <DetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${payDate.employer} Payment Details`}
        subtitle={format(paymentDate, 'EEEE, d MMMM yyyy')}
        color={'oklch(70.7% 0.165 254.624)'}
      >
        <PayDateDetailContent payDate={payDate} />
      </DetailModal>
    </div>
  );
};

export default PayDateCard;
