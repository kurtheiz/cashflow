import React from 'react';
import { isPublicHoliday } from './utils';
import ShiftCard from '../ShiftCard';
import { ShiftWithDateTime } from './types';

interface UpcomingShiftsProps {
  shiftsLoading: boolean;
  nextShiftsByEmployer: ShiftWithDateTime[];
  employersData: any[];
  publicHolidays: any[];
}

const UpcomingShifts: React.FC<UpcomingShiftsProps> = ({
  shiftsLoading,
  nextShiftsByEmployer,
  employersData,
  publicHolidays
}) => {
  return (
    <div className="mt-4 mb-8">
      <h2 className="text-xl font-semibold mb-4 text-center">Your Upcoming Shifts</h2>
      {shiftsLoading ? (
        <div className="bg-white p-4 text-center text-gray-500 w-full">
          Loading shifts...
        </div>
      ) : (
        <div className="w-full">
          {nextShiftsByEmployer.length > 0 ? (
            nextShiftsByEmployer.map((shift: any, index: number) => {
              // Find the employer for this shift
              const employer = employersData.find((emp: any) => emp.id === shift.employerId);
              if (!employer) return null;
              
              return (
                <div key={`shift-${shift.employerId}-${shift.date}-${index}`} className="w-full">
                  <ShiftCard 
                    shift={shift} 
                    color={employer.color}
                    isPublicHoliday={isPublicHoliday(shift.date, publicHolidays)}
                  />
                </div>
              );
            })
          ) : (
            <div className="bg-white p-4 text-center text-gray-500 w-full">
              No upcoming shifts scheduled
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UpcomingShifts;
