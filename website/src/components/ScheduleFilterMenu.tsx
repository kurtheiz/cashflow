import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import userData from '../api/data/user.json';

interface ScheduleFilterMenuProps {
  selectedEmployer: string | null;
  setSelectedEmployer: (id: string | null) => void;
  cardType: 'all' | 'shift' | 'payment';
  setCardType: (type: 'all' | 'shift' | 'payment') => void;
}

const ScheduleFilterMenu: React.FC<ScheduleFilterMenuProps> = ({ selectedEmployer, setSelectedEmployer, cardType, setCardType }) => {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="p-2 rounded-full hover:bg-gray-100 transition-colors flex items-center" aria-label="Filter">
        <SlidersHorizontal className="h-5 w-5 text-black" />
        <ChevronDown className="h-4 w-4 ml-1 text-gray-400" />
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg focus:outline-none z-50">
          <div className="px-3 py-2">
            <div className="font-semibold text-xs text-gray-500 mb-1">Employer</div>
            <select
              className="w-full border-gray-200 rounded p-1 text-sm"
              value={selectedEmployer || ''}
              onChange={e => setSelectedEmployer(e.target.value || null)}
            >
              <option value="">All Employers</option>
              {userData.employers.map((emp: any) => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>
          <div className="px-3 py-2">
            <div className="font-semibold text-xs text-gray-500 mb-1">Card Type</div>
            <div className="flex gap-2">
              <button
                className={`flex-1 rounded px-2 py-1 text-sm border ${cardType === 'all' ? 'bg-blue-100 border-blue-400 text-blue-700' : 'bg-white border-gray-200 text-gray-700'}`}
                onClick={() => setCardType('all')}
              >
                All
              </button>
              <button
                className={`flex-1 rounded px-2 py-1 text-sm border ${cardType === 'shift' ? 'bg-blue-100 border-blue-400 text-blue-700' : 'bg-white border-gray-200 text-gray-700'}`}
                onClick={() => setCardType('shift')}
              >
                Shift
              </button>
              <button
                className={`flex-1 rounded px-2 py-1 text-sm border ${cardType === 'payment' ? 'bg-blue-100 border-blue-400 text-blue-700' : 'bg-white border-gray-200 text-gray-700'}`}
                onClick={() => setCardType('payment')}
              >
                Pay
              </button>
            </div>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default ScheduleFilterMenu;
