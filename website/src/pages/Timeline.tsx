import { useState, useMemo } from 'react';
import { Timeline } from '../components/Timeline';
import userData from './user.json';
import { getTimelineData } from '../utils/timelineDataGenerator';
import { BriefcaseIcon, WalletIcon } from 'lucide-react';

// Item type filter options
type ItemType = 'shifts' | 'paydays';

const itemTypeOptions: { id: ItemType; name: string }[] = [
  { id: 'shifts', name: 'Shifts' },
  { id: 'paydays', name: 'Paydays' }
];

const TimelinePage = () => {
  // State for the selected date
  const [selectedDate] = useState<Date>(new Date());
  
  // State for highlighted pay period (when a payday is selected)
  const [, setHighlightedPayPeriod] = useState<{
    start: Date | null;
    end: Date | null;
    employerId: string | null;
  }>({ start: null, end: null, employerId: null });
  
  // Filter states - using arrays for multi-selection
  // Initialize with all employer IDs selected
  const [selectedEmployerIds, setSelectedEmployerIds] = useState<string[]>(
    userData.employers.map(emp => emp.id)
  );
  const [selectedItemTypes, setSelectedItemTypes] = useState<ItemType[]>(['shifts', 'paydays']);
  
  // Get the processed timeline data using our utility function
  const timelineData = useMemo(() => {
    return getTimelineData();
  }, []);
  
  // Use the employers from userData
  const employers = useMemo(() => {
    // Use the colors directly from user.json
    return userData.employers;
  }, []);
  
  // Filter shifts based on selected employers and item types
  const filteredShifts = useMemo(() => {
    let shifts = timelineData.shifts;
    
    // Filter by selected employers
    shifts = shifts.filter(shift => selectedEmployerIds.includes(shift.employerId));
    
    // Return empty array if shifts are not selected in item types
    if (!selectedItemTypes.includes('shifts')) {
      return [];
    }
    
    return shifts;
  }, [timelineData.shifts, selectedEmployerIds, selectedItemTypes]);
  
  // Filter pay dates based on selected employers and item types
  const filteredPayDates = useMemo(() => {
    let payDates = timelineData.payDates || [];
    
    // Filter by selected employers
    payDates = payDates.filter(payDate => selectedEmployerIds.includes(payDate.employerId));
    
    // Return empty array if paydays are not selected in item types
    if (!selectedItemTypes.includes('paydays')) {
      return [];
    }
    
    return payDates;
  }, [timelineData.payDates, selectedEmployerIds, selectedItemTypes]);
  
  return (
    <div className="container mx-auto md:px-4 px-0">
      <h1 className="text-2xl font-bold mb-4 px-4 text-center">Shifts & Pay Timeline</h1>
      
      {/* Filters */}
      <div className="px-4 mb-4 flex flex-col gap-4">
        
        {/* Touch-friendly Filter Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Employer Filter - Toggle Buttons */}
          <div className="w-full sm:w-1/2 flex flex-wrap gap-2">
            {employers.map((employer) => {
              const isSelected = selectedEmployerIds.includes(employer.id);
              return (
                <button
                  key={employer.id}
                  onClick={() => {
                    if (isSelected && selectedEmployerIds.length > 1) {
                      // Remove employer if already selected and not the last one selected
                      setSelectedEmployerIds(selectedEmployerIds.filter(id => id !== employer.id));
                    } else if (!isSelected) {
                      // Add employer if not selected
                      setSelectedEmployerIds([...selectedEmployerIds, employer.id]);
                    }
                    // If this is the only selected employer, do nothing (prevent deselection)
                  }}
                  className={`px-3 py-2 rounded-full text-sm font-medium ${
                    isSelected
                      ? 'border-2'
                      : 'bg-gray-100 text-gray-800 border-2 border-transparent'
                  }`}
                  style={{
                    backgroundColor: isSelected ? `${employer.color}20` : '',
                    color: isSelected ? employer.color : '',
                    borderColor: isSelected ? employer.color : 'transparent'
                  }}
                >
                  {employer.name}
                </button>
              );
            })}
          </div>
          
          {/* Item Type Filter - Toggle Buttons */}
          <div className="w-full sm:w-1/2 flex gap-2">
            {itemTypeOptions.map((option) => {
              const isSelected = selectedItemTypes.includes(option.id);
              return (
                <button
                  key={option.id}
                  onClick={() => {
                    if (isSelected) {
                      // Remove item type if already selected (but don't allow removing both)
                      if (selectedItemTypes.length > 1) {
                        setSelectedItemTypes(selectedItemTypes.filter(type => type !== option.id));
                      }
                    } else {
                      // Add item type if not selected
                      setSelectedItemTypes([...selectedItemTypes, option.id]);
                    }
                  }}
                  className={`flex-1 px-3 py-2 rounded-full text-sm font-medium flex items-center justify-center gap-2 ${
                    isSelected
                      ? 'bg-indigo-100 text-indigo-800 border-2 border-indigo-300'
                      : 'bg-gray-100 text-gray-800 border-2 border-transparent'
                  }`}
                >
                  {option.id === 'shifts' ? 
                    <BriefcaseIcon className="h-4 w-4" /> : 
                    <WalletIcon className="h-4 w-4" />}
                  <span>{option.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="w-full mb-4 md:rounded-xl md:bg-white md:p-3 md:shadow">
        <Timeline 
          shifts={filteredShifts}
          payDates={filteredPayDates}
          selectedDate={selectedDate}
          employers={employers}
          onPayPeriodSelect={(start, end, employerId) => {
            setHighlightedPayPeriod({ start, end, employerId });
          }}
        />
      </div>
    </div>
  );
};

export default TimelinePage;
