import React, { useRef } from 'react';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import userData from '../api/data/user.json';

interface ScheduleFilterMenuProps {
  selectedEmployer: string | null;
  setSelectedEmployer: (id: string | null) => void;
  cardType: 'all' | 'shift' | 'payment';
  setCardType: (type: 'all' | 'shift' | 'payment') => void;
}

const ScheduleFilterMenu: React.FC<ScheduleFilterMenuProps> = ({ selectedEmployer, setSelectedEmployer, cardType, setCardType }) => {
  const op = useRef<OverlayPanel>(null);

  // Prepare employer options for PrimeReact Dropdown
  const employerOptions = [
    { label: 'All Employers', value: '' },
    ...userData.employers.map((emp: any) => ({ label: emp.name, value: emp.id }))
  ];

  return (
    <div className="relative inline-block text-left">
      <button
        className="p-2 rounded-full hover:bg-gray-100 transition-colors flex items-center"
        aria-label="Filter"
        type="button"
        onClick={e => op.current?.toggle(e)}
      >
        <SlidersHorizontal className="h-5 w-5 text-black" />
        <ChevronDown className="h-4 w-4 ml-1 text-gray-400" />
      </button>
      <OverlayPanel ref={op} className="!p-0 !rounded-md !shadow-lg !border !border-gray-200 z-50">
        <div className="w-56 divide-y divide-gray-100 bg-white rounded-md">
          <div className="px-3 py-2">
            <div className="font-semibold text-xs text-gray-500 mb-1">Employer</div>
            <Dropdown
              value={selectedEmployer || ''}
              options={employerOptions}
              onChange={e => setSelectedEmployer(e.value || null)}
              className="w-full text-sm"
              placeholder="Select Employer"
              showClear
            />
          </div>
          <div className="px-3 py-2">
            <div className="font-semibold text-xs text-gray-500 mb-1">Card Type</div>
            <div className="flex gap-2">
              <Button
                label="All"
                className={`flex-1 text-sm ${cardType === 'all' ? 'bg-blue-100 border-blue-400 text-blue-700' : 'bg-white border-gray-200 text-gray-700'}`}
                outlined={cardType !== 'all'}
                onClick={() => setCardType('all')}
                type="button"
              />
              <Button
                label="Shift"
                className={`flex-1 text-sm ${cardType === 'shift' ? 'bg-blue-100 border-blue-400 text-blue-700' : 'bg-white border-gray-200 text-gray-700'}`}
                outlined={cardType !== 'shift'}
                onClick={() => setCardType('shift')}
                type="button"
              />
              <Button
                label="Pay"
                className={`flex-1 text-sm ${cardType === 'payment' ? 'bg-blue-100 border-blue-400 text-blue-700' : 'bg-white border-gray-200 text-gray-700'}`}
                outlined={cardType !== 'payment'}
                onClick={() => setCardType('payment')}
                type="button"
              />
            </div>
          </div>
        </div>
      </OverlayPanel>
    </div>
  );
};

export default ScheduleFilterMenu;
