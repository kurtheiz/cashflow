import React, { useMemo, useState, Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import configData from '../config.json';
import { format, addDays, parseISO } from 'date-fns';
import { ChevronDown, Check } from 'lucide-react';

interface Employer {
  id: string;
  name: string;
  level: keyof typeof configData.casual;
}

interface TimeEntryProps {
  employers: Employer[];
  entries: Record<string, { // key: `${date}_${employerId}`
    start: string;
    end: string;
  }>;
  onChange: (entries: Record<string, { start: string; end: string }>) => void;
  startDate: string; // ISO string (yyyy-MM-dd)
}

function getBreakMins(hours: number): number {
  const schedule = configData.breaks.breakSchedule as Array<any>;
  for (const rule of schedule) {
    const [min, max] = rule.hoursRange;
    if (hours >= min && (max === null || hours <= max)) {
      const mealBreaks = rule.mealBreaks || 0;
      const mealBreakMins = mealBreaks * (configData.breaks.mealBreak.minDuration || 30);
      return mealBreakMins;
    }
  }
  return 0;
}

function getRate(level: keyof typeof configData.casual, date: Date): number {
  // Only ordinary rate for now
  return configData.casual[level].hourly_rate;
}



export const TimeEntry: React.FC<TimeEntryProps> = ({ employers, entries, onChange, startDate }) => {
  // Employer selection state
  const [selectedEmployerId, setSelectedEmployerId] = useState(employers[0]?.id || '');
  
  // State for dynamic day range
  const [visibleDayRange, setVisibleDayRange] = useState({
    startOffset: -30, // Days before reference date
    endOffset: 30,    // Days after reference date
  });
  
  // State for responsive design
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Effect to handle window resize for responsive design
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Reference date (can be any date, using startDate as initial value)
  const referenceDate = useMemo(() => parseISO(startDate), [startDate]);
  
  // Generate days dynamically based on the visible range
  const days = useMemo(() => {
    const result: Date[] = [];
    
    // Generate all days in the visible range
    for (let i = visibleDayRange.startOffset; i <= visibleDayRange.endOffset; i++) {
      result.push(addDays(referenceDate, i));
    }
    
    return result;
  }, [referenceDate, visibleDayRange.startOffset, visibleDayRange.endOffset]);
  
  // Handle scroll events to load more days
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    // When user scrolls near the top, load more days in the past
    if (scrollTop < 200) {
      setVisibleDayRange(prev => ({
        startOffset: prev.startOffset - 15, // Load 15 more days in the past
        endOffset: prev.endOffset
      }));
    }
    
    // When user scrolls near the bottom, load more days in the future
    if (scrollHeight - scrollTop - clientHeight < 200) {
      setVisibleDayRange(prev => ({
        startOffset: prev.startOffset,
        endOffset: prev.endOffset + 15 // Load 15 more days in the future
      }));
    }
  };

  // Helper to update entry
  const handleTimeChange = (date: string, employerId: string, field: 'start' | 'end', value: string) => {
    // Handle ambiguous times by defaulting to day work hours
    let normalizedValue = value;
    
    if (value && value.length > 0) {
      const [hours, minutes] = value.split(':').map(Number);
      
      // If this is a valid time entry
      if (!isNaN(hours) && !isNaN(minutes)) {
        // For start times: If hours is between 1-7, assume it's PM (afternoon)
        if (field === 'start' && hours >= 1 && hours <= 7) {
          // Add 12 hours to convert to 24-hour format (PM)
          normalizedValue = `${(hours + 12).toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        } 
        // For end times: If hours is between 1-7, assume it's PM (afternoon)
        else if (field === 'end' && hours >= 1 && hours <= 7) {
          // Add 12 hours to convert to 24-hour format (PM)
          normalizedValue = `${(hours + 12).toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
        // Otherwise, ensure proper formatting with leading zeros
        else {
          normalizedValue = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
      }
    }
    
    const key = `${date}_${employerId}`;
    const updated = { ...entries, [key]: { ...entries[key], [field]: normalizedValue } };
    onChange(updated);
  };
  
  // Function to clear an entry completely
  const clearEntry = (date: string, employerId: string) => {
    const key = `${date}_${employerId}`;
    const updated = { ...entries };
    
    // Delete the entry completely if it exists
    if (updated[key]) {
      updated[key] = { start: '', end: '' };
      onChange(updated);
    }
  };

  const selectedEmployer = employers.find(e => e.id === selectedEmployerId);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: isMobile ? '100vh' : 'auto',
      flex: isMobile ? '1' : 'none'
    }}>
      {/* Employer Selector */}
      <div style={{ 
        marginBottom: '16px',
        padding: isMobile ? '12px 16px' : '0'
      }}>
        <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>Select Employer</div>
        <Listbox value={selectedEmployerId} onChange={setSelectedEmployerId}>
          <div style={{ position: 'relative' }}>
            <Listbox.Button style={{ 
              position: 'relative', 
              width: '100%', 
              cursor: 'pointer', 
              backgroundColor: 'white',
              padding: '8px 12px',
              paddingRight: '40px',
              textAlign: 'left',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              outline: 'none'
            }}>
              <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {employers.find(e => e.id === selectedEmployerId)?.name || 'Select Employer'}
              </span>
              <span style={{ 
                position: 'absolute', 
                top: '50%', 
                right: '8px', 
                transform: 'translateY(-50%)', 
                display: 'flex', 
                alignItems: 'center'
              }}>
                <ChevronDown size={20} color="#6b7280" />
              </span>
            </Listbox.Button>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options
                style={{
                  position: 'absolute',
                  marginTop: '4px',
                  maxHeight: '200px',
                  width: '100%',
                  overflow: 'auto',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  zIndex: 10
                }}
              >
                {employers.map((employer) => (
                  <Listbox.Option
                    key={employer.id}
                    value={employer.id}
                    className={({ active }: { active: boolean }) => 
                      active ? 'bg-gray-100' : ''
                    }
                  >
                    {({ selected }: { selected: boolean }) => (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        padding: '8px 12px',
                        cursor: 'pointer'
                      }}>
                        {selected && (
                          <Check size={16} color="#4f46e5" style={{ marginRight: '8px' }} />
                        )}
                        <span style={{ marginLeft: selected ? '0' : '24px' }}>
                          {employer.name}
                        </span>
                      </div>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
      </div>

      {/* Time Entries - Scrollable Container */}
      {selectedEmployer && (
        <div 
          style={{ 
            flex: isMobile ? '1' : 'none',
            overflowY: 'auto',
            border: isMobile ? 'none' : '1px solid #e5e7eb',
            borderRadius: isMobile ? '0' : '6px',
            padding: isMobile ? '0 16px' : '8px 12px'
          }}
          onScroll={handleScroll}
        >
          {days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const key = `${dateStr}_${selectedEmployer.id}`;
            const entry = entries[key] || { start: '', end: '' };
            let hours = 0, breakMins = 0, pay = 0;
            
            if (entry.start && entry.end) {
              const [sH, sM] = entry.start.split(':').map(Number);
              const [eH, eM] = entry.end.split(':').map(Number);
              let diff = (eH + eM / 60) - (sH + sM / 60);
              if (diff < 0) diff += 24;
              breakMins = getBreakMins(diff);
              hours = Math.max(0, diff - breakMins / 60);
              const rate = getRate(selectedEmployer.level, day);
              pay = +(hours * rate).toFixed(2);
            }
            
            // Overlap detection logic
            let overlap = false;
            if (entry.start && entry.end) {
              const [s1, e1] = [entry.start, entry.end];
              for (const otherEmp of employers) {
                if (otherEmp.id === selectedEmployer.id) continue;
                const otherKey = `${dateStr}_${otherEmp.id}`;
                const otherEntry = entries[otherKey];
                if (otherEntry && otherEntry.start && otherEntry.end) {
                  // Check for overlap between [s1, e1] and [s2, e2]
                  const [s2, e2] = [otherEntry.start, otherEntry.end];
                  if (s1 < e2 && s2 < e1) {
                    overlap = true;
                    break;
                  }
                }
              }
            }
            
            // Check if this day has any time entries
            const hasTimeEntry = entry.start || entry.end;
            
            return (
              <div key={dateStr} style={{ 
                marginBottom: '16px',
                backgroundColor: hasTimeEntry ? '#ecfdf5' : 'white',
                borderRadius: '8px',
                padding: '16px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ 
                  fontWeight: '500', 
                  marginBottom: '8px', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center' 
                }}>
                  <span style={{ fontSize: '16px' }}>{format(day, 'EEEE, dd MMMM yyyy')}</span>
                  {(entry.start || entry.end) && (
                    <button
                      onClick={() => clearEntry(dateStr, selectedEmployer.id)}
                      style={{ 
                        fontSize: '12px', 
                        color: '#6b7280', 
                        display: 'flex', 
                        alignItems: 'center',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0'
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '12px', width: '12px', marginRight: '4px' }} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Clear
                    </button>
                  )}
                </div>
                
                <div style={{ maxWidth: '320px', margin: '0 auto', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', marginBottom: '8px', justifyContent: 'flex-start', gap: '20px' }}>
                    <div style={{ width: '35%' }}>
                      <div style={{ fontSize: '14px', color: '#374151', marginBottom: '4px' }}>Start</div>
                      <input
                        type="time"
                        style={{ 
                          width: '100%',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          padding: '4px 6px',
                          fontSize: '14px'
                        }}
                        value={entry.start || ''}
                        onChange={e => handleTimeChange(dateStr, selectedEmployer.id, 'start', e.target.value)}
                      />
                    </div>
                    <div style={{ width: '35%' }}>
                      <div style={{ fontSize: '14px', color: '#374151', marginBottom: '4px' }}>End</div>
                      <input
                        type="time"
                        style={{ 
                          width: '100%',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          padding: '4px 6px',
                          fontSize: '14px'
                        }}
                        value={entry.end || ''}
                        onChange={e => handleTimeChange(dateStr, selectedEmployer.id, 'end', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', fontSize: '14px' }}>
                  <div style={{ width: '33.333%' }}>
                    <div style={{ color: '#6b7280', fontSize: '14px' }}>Break</div>
                    <div style={{ fontWeight: '500', fontSize: '14px' }}>{breakMins || 0} min</div>
                  </div>
                  <div style={{ width: '33.333%' }}>
                    <div style={{ color: '#6b7280', fontSize: '14px' }}>Hours</div>
                    <div style={{ fontWeight: '500', fontSize: '14px' }}>{hours ? hours.toFixed(2) : '--'}</div>
                  </div>
                  <div style={{ width: '33.333%' }}>
                    <div style={{ color: '#6b7280', fontSize: '14px' }}>Pay</div>
                    <div style={{ fontWeight: '500', fontSize: '14px' }}>${pay ? pay.toFixed(2) : '--'}</div>
                  </div>
                </div>
                
                {overlap && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#dc2626' }}>
                    Time overlap detected with another employer
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
