import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import userData from './user.json';
import { getTimelineData } from '../utils/timelineDataGenerator';
import { CalendarIcon, DollarSignIcon, BriefcaseIcon, BarChartIcon, ArrowRightIcon } from 'lucide-react';

const Home = () => {
  // Get the processed timeline data using our utility function
  const timelineData = useMemo(() => {
    return getTimelineData();
  }, []);
  
  // Calculate summary statistics
  const totalShifts = timelineData.shifts.length;
  const totalEarnings = timelineData.shifts.reduce((sum, shift) => sum + (shift.pay || 0), 0);
  const upcomingShifts = timelineData.shifts.filter(shift => new Date(shift.date) > new Date()).length;
  
  // Get the employers from userData
  const employers = userData.employers;
  
  return (
    <div className="container mx-auto px-4">
      <div className="max-w-4xl mx-auto">
        {/* Hero section */}
        <div className="text-center mb-10 mt-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Welcome to Casual Pay</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Track your casual shifts, manage your income, and visualize your earnings all in one place.
          </p>
        </div>
        
        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Total Earnings Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-gray-500 text-sm font-medium">Total Earnings</h3>
              <div className="p-2 bg-green-100 rounded-full">
                <DollarSignIcon className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-gray-900">${totalEarnings.toFixed(2)}</span>
            </div>
          </div>
          
          {/* Total Shifts Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-gray-500 text-sm font-medium">Total Shifts</h3>
              <div className="p-2 bg-blue-100 rounded-full">
                <BriefcaseIcon className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-gray-900">{totalShifts}</span>
            </div>
          </div>
          
          {/* Upcoming Shifts Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-gray-500 text-sm font-medium">Upcoming Shifts</h3>
              <div className="p-2 bg-purple-100 rounded-full">
                <CalendarIcon className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-gray-900">{upcomingShifts}</span>
            </div>
          </div>
        </div>
        
        {/* Employers section */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Employers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {employers.map((employer) => (
              <div 
                key={employer.id} 
                className="p-4 rounded-lg border border-gray-100 flex items-center"
                style={{ borderLeftWidth: '4px', borderLeftColor: employer.color }}
              >
                <div className="flex-1">
                  <h3 className="font-medium" style={{ color: employer.color }}>{employer.name}</h3>
                  <p className="text-sm text-gray-500">
                    {timelineData.shifts.filter(s => s.employerId === employer.id).length} shifts
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    ${timelineData.shifts
                      .filter(s => s.employerId === employer.id)
                      .reduce((sum, shift) => sum + (shift.pay || 0), 0)
                      .toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Quick links section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link to="/timeline" className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow flex justify-between items-center">
            <div>
              <div className="flex items-center mb-2">
                <CalendarIcon className="h-5 w-5 text-indigo-600 mr-2" />
                <h3 className="font-medium text-gray-900">Timeline View</h3>
              </div>
              <p className="text-sm text-gray-500">View your shifts and paydays on a timeline</p>
            </div>
            <ArrowRightIcon className="h-5 w-5 text-gray-400" />
          </Link>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow flex justify-between items-center opacity-70">
            <div>
              <div className="flex items-center mb-2">
                <BarChartIcon className="h-5 w-5 text-indigo-600 mr-2" />
                <h3 className="font-medium text-gray-900">Analytics</h3>
              </div>
              <p className="text-sm text-gray-500">Coming soon: Detailed income analytics</p>
            </div>
            <ArrowRightIcon className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
