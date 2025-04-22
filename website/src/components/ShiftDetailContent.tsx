import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Save } from 'lucide-react';
import { Calendar } from 'primereact/calendar';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useUpdateShift } from '../hooks/useApiData';

interface ShiftDetailContentProps {
  shift: {
    id?: string;
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
    allowances?: {
      name: string;
      amount: number;
      notes?: string;
      type?: string;
    }[];
    allowanceTotal?: number;
    totalGrossPay?: number;
    tax?: number;
    netPay?: number;
  };
}

const ShiftDetailContent: React.FC<ShiftDetailContentProps> = ({ shift }) => {
  // Create a ref for the toast
  const toast = React.useRef<Toast>(null);

  // State for time pickers
  const [currentStartTime, setCurrentStartTime] = useState(shift.start);
  const [currentEndTime, setCurrentEndTime] = useState(shift.end);
  const [hasChanges, setHasChanges] = useState(false);

  // Parse the start and end times into Date objects for the time pickers
  const startTime = useMemo(() => {
    const [hours, minutes] = shift.start.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }, [shift.start]);

  const endTime = useMemo(() => {
    const [hours, minutes] = shift.end.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }, [shift.end]);

  // State for the time pickers
  const [startTimeState, setStartTimeState] = useState(startTime);
  const [endTimeState, setEndTimeState] = useState(endTime);

  // Create a hash of the original times for comparison
  const originalTimeHash = useMemo(() => {
    return `${shift.start}-${shift.end}`;
  }, [shift.start, shift.end]);

  // Calculate time in minutes for duration calculations
  const startMinutes = startTimeState.getHours() * 60 + startTimeState.getMinutes();
  const endMinutes = endTimeState.getHours() * 60 + endTimeState.getMinutes();

  // Calculate the updated hours worked based on the new times
  const updatedHoursWorked = useMemo(() => {
    const updatedDurationMinutes = endMinutes - startMinutes - (shift.unpaidBreakMinutes || 0);
    return updatedDurationMinutes / 60;
  }, [endMinutes, startMinutes, shift.unpaidBreakMinutes]);

  // Create a hash of the current times for comparison
  const currentTimeHash = useMemo(() => {
    return `${currentStartTime}-${currentEndTime}`;
  }, [currentStartTime, currentEndTime]);

  // Update the current times when the time pickers change
  useEffect(() => {
    const formattedStartTime = startTimeState.getHours().toString().padStart(2, '0') + ':' + 
                              startTimeState.getMinutes().toString().padStart(2, '0');
    setCurrentStartTime(formattedStartTime);
  }, [startTimeState]);

  useEffect(() => {
    const formattedEndTime = endTimeState.getHours().toString().padStart(2, '0') + ':' + 
                            endTimeState.getMinutes().toString().padStart(2, '0');
    setCurrentEndTime(formattedEndTime);
  }, [endTimeState]);

  // Check for changes
  useEffect(() => {
    setHasChanges(currentTimeHash !== originalTimeHash);
  }, [currentTimeHash, originalTimeHash]);

  // Use the update shift mutation hook
  const updateShiftMutation = useUpdateShift();

  // Handle save action
  const handleSave = async () => {
    if (hasChanges) {
      try {
        // Show loading state
        const updatedShift = {
          ...shift,
          start: currentStartTime,
          end: currentEndTime,
          hoursWorked: updatedHoursWorked // Update hours worked based on new times
        };
        
        // Call the mutation to update the shift
        await updateShiftMutation.mutateAsync({
          id: shift.id || '',
          shift: updatedShift
        });
        
        // Show success message
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Shift times updated successfully',
          life: 3000
        });
        
        // Reset the hasChanges flag
        setHasChanges(false);
      } catch (error) {
        console.error('Error updating shift:', error);
        // Show error message
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'An unexpected error occurred',
          life: 3000
        });
      }
    }
  };

  // Calculate shift duration based on original times (for display)
  const originalStartMinutes = startTime.getHours() * 60 + startTime.getMinutes();
  const originalEndMinutes = endTime.getHours() * 60 + endTime.getMinutes();
  let durationMinutes = originalEndMinutes - originalStartMinutes;
  if (durationMinutes < 0) durationMinutes += 24 * 60; // Handle overnight shifts
  
  // Subtract unpaid break if applicable
  if (shift.unpaidBreakMinutes) {
    durationMinutes -= shift.unpaidBreakMinutes;
  }

  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  const durationText = `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;

  // Use provided hours or calculate from current time picker values
  const hoursWorked = shift.hoursWorked || (durationMinutes / 60);
  
  // Use provided values only - no calculations in the component
  const grossPay = shift.grossPay || 0;
  const allowanceTotal = shift.allowanceTotal || 0;
  const totalGrossPay = shift.totalGrossPay || 0;
  const tax = shift.tax || 0;
  const netPay = shift.netPay || 0;
  
  return (
    <div className="space-y-4">
      {/* Time Section */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
          Time
        </h4>
        <div className="bg-gray-50 p-3">
          <div className="space-y-3">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-gray-400 mr-3" />
              <div className="text-sm font-medium text-gray-900">
                Duration: {durationText}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startTime" className="block text-xs font-medium text-gray-700 mb-1">Start Time</label>
                <Calendar
                  id="startTime"
                  value={startTimeState}
                  onChange={(e) => e.value && setStartTimeState(e.value as Date)}
                  timeOnly
                  hourFormat="12"
                  className="w-full"
                />
              </div>
              
              <div>
                <label htmlFor="endTime" className="block text-xs font-medium text-gray-700 mb-1">End Time</label>
                <Calendar
                  id="endTime"
                  value={endTimeState}
                  onChange={(e) => e.value && setEndTimeState(e.value as Date)}
                  timeOnly
                  hourFormat="12"
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="pt-2">
              {(shift.unpaidBreakMinutes || 0) > 0 && (
                <div className="flex items-center justify-between">
                  <label htmlFor="breakTime" className="text-xs font-medium text-gray-700">Unpaid Break</label>
                  <InputText
                    id="breakTime"
                    value={shift.unpaidBreakMinutes?.toString() || '0'}
                    className="w-20 text-right text-sm"
                    disabled
                  />
                  <span className="text-xs text-gray-500 ml-1">minutes</span>
                </div>
              )}
              
              {shift.isPublicHoliday && (
                <p className="text-xs text-blue-600 font-medium mt-2">Public Holiday</p>
              )}
              
              <div className="flex justify-end mt-4">
                <Button 
                  label="Save Changes" 
                  icon={<Save className="w-4 h-4 mr-2" />}
                  disabled={!hasChanges}
                  onClick={handleSave}
                  className={`${!hasChanges ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Employer section removed as it's now in the header */}
      
      {/* Pay Details Section */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
          Pay Details
        </h4>
        <div className="bg-gray-50 p-3 space-y-3">
          {/* Hours and Rate */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">Hours</div>
            <div className="text-sm font-medium text-gray-900">{hoursWorked.toFixed(2)}</div>
          </div>
          
          {/* Base rate removed as requested */}
          
          {/* Pay Categories */}
          {shift.payCategories && shift.payCategories.length > 0 && (
            <div className="pt-1 border-t border-gray-200">
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
          
          {/* Allowances Section */}
          {shift.allowances && shift.allowances.length > 0 && (
            <div className="pt-1 border-t border-gray-200">
              <h5 className="text-xs font-medium text-gray-500 mb-2">Allowances</h5>
              {shift.allowances.map((allowance, index) => (
                <div key={index} className="flex justify-between items-center mb-2">
                  <div className="text-sm text-gray-500">
                    {allowance.name}
                    {allowance.notes && <span className="text-xs italic ml-1">({allowance.notes})</span>}
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    ${allowance.amount.toFixed(2)}
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center mt-1">
                <div className="text-sm font-medium text-gray-500">Total Allowances</div>
                <div className="text-sm font-medium text-gray-900">${allowanceTotal.toFixed(2)}</div>
              </div>
            </div>
          )}
          
          {/* Pay Summary */}
          <div className="pt-2 border-t border-gray-200">
            <div className="flex justify-between items-center mb-1">
              <div className="text-sm text-gray-500">Base Pay</div>
              <div className="text-sm font-medium text-gray-900">${grossPay.toFixed(2)}</div>
            </div>
            
            {allowanceTotal > 0 && (
              <div className="flex justify-between items-center mb-1">
                <div className="text-sm text-gray-500">Allowances</div>
                <div className="text-sm font-medium text-gray-900">+${allowanceTotal.toFixed(2)}</div>
              </div>
            )}
            
            <div className="flex justify-between items-center mb-1">
              <div className="text-sm font-medium text-gray-500">Total Gross Pay</div>
              <div className="text-sm font-medium text-gray-900">${totalGrossPay.toFixed(2)}</div>
            </div>
            
            {/* Tax Details */}
            <div className="pt-1 border-t border-gray-200 mt-2 mb-1">
              <h5 className="text-xs font-medium text-gray-500 mb-2">Tax Calculation</h5>
              <div className="flex justify-between items-center mb-1">
                <div className="text-sm text-gray-500">Taxable Income</div>
                <div className="text-sm font-medium text-gray-900">${totalGrossPay.toFixed(2)}</div>
              </div>
              
              {tax > 0 ? (
                <>
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-sm text-gray-500">Tax Withheld</div>
                    <div className="text-sm font-medium text-gray-900">-${tax.toFixed(2)}</div>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                    <div>Effective Tax Rate</div>
                    <div>{((tax / totalGrossPay) * 100).toFixed(1)}%</div>
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-500 mb-1">No tax withheld for this shift</div>
              )}
            </div>
            
            <div className="flex justify-between items-center pt-1 border-t border-gray-200 mt-1">
              <div className="text-sm font-bold text-gray-700">Net Pay</div>
              <div className="text-sm font-bold text-gray-900">${netPay.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Status indicator */}
      {hasChanges && (
        <div className="text-sm text-blue-600 italic text-center">
          You have unsaved changes
        </div>
      )}
      
      {/* Toast for notifications */}
      <Toast ref={toast} position="bottom-center" />
    </div>
  );
};

export default ShiftDetailContent;
