import React from 'react';
import { format, parseISO } from 'date-fns';
import { Clock, Briefcase } from 'lucide-react';

interface ShiftCardProps {
  shift: {
    date: string;
    employerId: string;
    employer: string;
    start: string;
    end: string;
    pay?: number;
  };
  color?: string;
}

const ShiftCard: React.FC<ShiftCardProps> = ({ 
  shift,
  color = '#3b82f6' // Default to blue-500 if no color provided
}) => {
  const shiftDate = parseISO(shift.date);
  const dayOfWeek = format(shiftDate, 'EEE');
  const dayOfMonth = format(shiftDate, 'd');
  const month = format(shiftDate, 'MMM');
  
  // Calculate shift duration
  const startParts = shift.start.split(':').map(Number);
  const endParts = shift.end.split(':').map(Number);
  const startMinutes = startParts[0] * 60 + startParts[1];
  const endMinutes = endParts[0] * 60 + endParts[1];
  const durationMinutes = endMinutes - startMinutes;
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  const durationText = `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
  
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
            <h3 className="font-medium text-gray-900">{shift.employer}</h3>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2 text-gray-400" />
            <span>{shift.start} - {shift.end} ({durationText})</span>
          </div>
          
          {shift.pay && (
            <div className="mt-2 text-right">
              <span className="font-semibold text-gray-900">${shift.pay.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShiftCard;
