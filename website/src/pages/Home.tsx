import { Calendar } from '../components/Calendar';
import { Timeline } from '../components/Timeline';
import userData from './user.json';
import shiftsData from './shifts.json';
import { useState, useMemo } from 'react';
import { Tab } from '@headlessui/react';
import { CalendarIcon, ListIcon } from 'lucide-react';

const Home = () => {
  // State for the selected date from calendar
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // State for highlighted pay period (when a payday is selected)
  const [highlightedPayPeriod, setHighlightedPayPeriod] = useState<{
    start: Date | null;
    end: Date | null;
    employerId: string | null;
  }>({ start: null, end: null, employerId: null });
  
  // State for view type (timeline or calendar)
  const [viewType, setViewType] = useState<'timeline' | 'calendar'>('timeline');
  
  // Use pay dates directly from shifts.json
  const payDates = useMemo(() => {
    // Use the payDates array directly from shiftsData
    return shiftsData.payDates.map(payDate => ({
      date: payDate.date,
      employerId: payDate.employerId,
      employer: payDate.employer,
      amount: payDate.totalPay,
      totalHours: payDate.totalHours,
      shiftCount: payDate.shiftCount,
      averageHourlyRate: payDate.averageHourlyRate,
      shifts: payDate.shifts,
      periodStart: payDate.periodStart,
      periodEnd: payDate.periodEnd
    }));
  }, [shiftsData.payDates]);
  
  // Transform user data to match the Employer interface
  const employers = userData.employers.map((emp, index) => ({
    id: index.toString(),
    name: emp.name,
    level: emp.level as 'retail_employee_level_1' | 'retail_employee_level_2' | 'retail_employee_level_3',
    state: emp.state as 'NSW' | 'VIC' | 'QLD' | 'SA' | 'WA' | 'TAS' | 'NT' | 'ACT',
    paycycle: emp.paycycle,
    payday: emp.payday,
    payPeriodStart: emp.payPeriodStart,
    payPeriodDays: emp.payPeriodDays,
    nextPayDate: emp.nextPayDate,
    color: index === 0 ? '#f59e0b' : '#3b82f6' // Orange for first employer, blue for second
  }));
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Shift & Pay Calendar</h1>
      
      {/* View Type Selector */}
      <div className="w-full mb-4">
        <Tab.Group selectedIndex={viewType === 'timeline' ? 0 : 1} onChange={(index) => setViewType(index === 0 ? 'timeline' : 'calendar')}>
          <Tab.List className="flex space-x-1 rounded-xl bg-blue-100 p-1">
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 flex items-center justify-center
                 ${selected
                  ? 'bg-white text-blue-700 shadow'
                  : 'text-blue-500 hover:bg-white/[0.12] hover:text-blue-700'}`
              }
            >
              <ListIcon className="h-4 w-4 mr-2" />
              Timeline View
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 flex items-center justify-center
                 ${selected
                  ? 'bg-white text-blue-700 shadow'
                  : 'text-blue-500 hover:bg-white/[0.12] hover:text-blue-700'}`
              }
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              Calendar View
            </Tab>
          </Tab.List>
          <Tab.Panels className="mt-2">
            {/* Timeline View */}
            <Tab.Panel className="rounded-xl bg-white p-3 shadow">
              <Timeline 
                shifts={shiftsData.shifts}
                payDates={payDates}
                selectedDate={selectedDate}
                employers={employers}
                onPayPeriodSelect={(start, end, employerId) => {
                  setHighlightedPayPeriod({ start, end, employerId });
                }}
              />
            </Tab.Panel>
            
            {/* Calendar View */}
            <Tab.Panel className="rounded-xl bg-white p-3 shadow">
              <Calendar 
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                shifts={shiftsData.shifts}
                payDates={shiftsData.payDates}
                highlightedPayPeriod={highlightedPayPeriod}
              />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

export default Home;
