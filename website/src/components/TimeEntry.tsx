import React from 'react';

interface TimeEntryProps {
  employers: any[];
  entries: Record<string, { start: string; end: string }>;
  onChange: (entries: Record<string, { start: string; end: string }>) => void;
  startDate: string;
  shifts?: any[];
}

// This component has been replaced by ShiftCalendar
// Keeping this as a placeholder for backward compatibility
export const TimeEntry: React.FC<TimeEntryProps> = () => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <p className="text-center text-gray-500">
        Time Entry has been replaced by the Shift Calendar.
      </p>
    </div>
  );
};
