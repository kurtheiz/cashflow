import React from 'react';
// No longer need date-fns imports
import { Clock } from 'lucide-react';

interface ShiftDetailContentProps {
  shift: {
    date: string;
    employerId: string;
    employer: string;
    start: string;
    end: string;
    grossPay?: number;
    hoursWorked?: number;
    isPublicHoliday?: boolean;
    payRate?: number;
    unpaidBreakMinutes?: number;
    payCategories?: {
      category: string;
      hours: number;
      rate: number;
      description: string;
    }[];
  };
}

const ShiftDetailContent: React.FC<ShiftDetailContentProps> = ({ shift }) => {
  
  // Calculate shift duration
  const startParts = shift.start.split(':').map(Number);
  const endParts = shift.end.split(':').map(Number);
  const startMinutes = startParts[0] * 60 + startParts[1];
  const endMinutes = endParts[0] * 60 + endParts[1];
  const durationMinutes = endMinutes - startMinutes - (shift.unpaidBreakMinutes || 0);
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  const durationText = `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
  
  // Use provided hours or calculate
  const hoursWorked = shift.hoursWorked || (durationMinutes / 60);
  
  // Use provided pay rate or default
  const payRate = shift.payRate || 0;
  
  // Calculate gross pay if not provided
  const grossPay = shift.grossPay || (hoursWorked * payRate);
  
  // No tax calculation for individual shifts
  
  return (
    <div className="space-y-6">
      {/* Time Section */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
          Time
        </h4>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {shift.start} - {shift.end} ({durationText})
              </p>
              {(shift.unpaidBreakMinutes || 0) > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {shift.unpaidBreakMinutes} minute unpaid break
                </p>
              )}
              {shift.isPublicHoliday && (
                <p className="text-xs text-indigo-600 font-medium mt-1">Public Holiday</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Employer section removed as it's now in the header */}
      
      {/* Pay Details Section */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
          Pay Details
        </h4>
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          {/* Hours and Rate */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">Hours Worked</div>
            <div className="text-sm font-medium text-gray-900">{hoursWorked.toFixed(2)}</div>
          </div>
          
          {/* Base rate removed as requested */}
          
          {/* Pay Categories */}
          {shift.payCategories && shift.payCategories.length > 0 && (
            <div className="pt-2 border-t border-gray-200">
              <h5 className="text-xs font-medium text-gray-500 mb-2">Pay Categories</h5>
              {shift.payCategories.map((category, index) => (
                <div key={index} className="flex justify-between items-center mb-2">
                  <div className="text-sm text-gray-500">
                    {category.description} ({category.hours.toFixed(2)} hrs)
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    ${category.rate.toFixed(2)}/hr
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Pay Summary */}
          <div className="pt-3 border-t border-gray-200">
            <div className="flex justify-between items-center mb-1">
              <div className="text-sm text-gray-500">Gross Pay</div>
              <div className="text-sm font-medium text-gray-900">${grossPay.toFixed(2)}</div>
            </div>
            {/* Tax calculation removed as requested */}
          </div>
        </div>
      </div>
      
      {/* Actions Section */}
      <div className="flex space-x-3 pt-2">
        <button className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Edit Shift
        </button>
        <button className="flex-1 bg-white text-red-600 py-2 px-4 border border-red-300 rounded-md text-sm font-medium hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
          Delete Shift
        </button>
      </div>
    </div>
  );
};

export default ShiftDetailContent;
