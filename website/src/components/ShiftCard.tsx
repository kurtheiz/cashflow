import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Clock, Briefcase } from 'lucide-react';
import DetailModal from './DetailModal';
import ShiftDetailContent from './ShiftDetailContent';

interface ShiftCardProps {
  shift: {
    date: string;
    employerId: string;
    employer: string;
    start: string;
    end: string;
    grossPay?: number;
    hoursWorked?: number;
  };
  color?: string;
}

const ShiftCard: React.FC<ShiftCardProps> = ({ 
  shift,

}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const shiftDate = parseISO(shift.date);
  const dayOfWeek = format(shiftDate, 'EEE');
  const dayOfMonth = format(shiftDate, 'd');
  const month = format(shiftDate, 'MMM');
  
  // Use hoursWorked from data
  let durationText = '';
  if (typeof shift.hoursWorked === 'number') {
    const hours = Math.floor(shift.hoursWorked);
    const minutes = Math.round((shift.hoursWorked - hours) * 60);
    if (minutes === 0) {
      durationText = `${hours}h`;
    } else {
      durationText = `${hours}h ${minutes}m`;
    }
  }
  
  return (
    <>
      <div 
        className="bg-white overflow-hidden py-2 w-full cursor-pointer hover:bg-gray-50 transition-colors"
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
              <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
              <h3 className="font-medium text-gray-900">{shift.employer}</h3>
            </div>
            {shift.grossPay && (
              <span className="font-semibold text-gray-900">
                ${shift.grossPay.toFixed(2)}
              </span>
            )}
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2 text-gray-400" />
            <span>{shift.start} - {shift.end}{durationText ? ` (${durationText})` : ''}</span>
          </div>
          

        </div>
      </div>
    </div>
      
      {/* Detail Modal */}
      <DetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${shift.employer} Shift Details`}
        subtitle={format(shiftDate, 'EEEE, d MMMM yyyy')}
        color={'var(--primary-blue)'}
      >
        <ShiftDetailContent shift={shift} />
      </DetailModal>
    </>
  );
};

export default ShiftCard;
