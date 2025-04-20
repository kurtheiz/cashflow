import { generateTimelineData } from './shiftCalculator';
import shiftsData from '../pages/shifts.json';
import userData from '../pages/user.json';
import configData from '../config.json';

/**
 * Generates processed timeline data from the raw shifts, user, and config data
 * This data can be directly fed to the Timeline component
 */
export const getTimelineData = () => {
  // Add color information to employers for the timeline display
  const employersWithColors = userData.employers.map((employer, index) => {
    // Generate a color based on the employer ID for consistency
    const colors = [
      '#f59e0b', // amber-500
      '#10b981', // emerald-500
      '#3b82f6', // blue-500
      '#8b5cf6', // violet-500
      '#ec4899', // pink-500
      '#ef4444', // red-500
      '#14b8a6', // teal-500
      '#f97316'  // orange-500
    ];
    
    const colorIndex = index % colors.length;
    
    return {
      ...employer,
      color: colors[colorIndex]
    };
  });

  // Create a user data object with the enhanced employers
  const enhancedUserData = {
    ...userData,
    employers: employersWithColors
  };

  // Generate the timeline data using the utility function
  return generateTimelineData(shiftsData, enhancedUserData, configData);
};

/**
 * Example usage in a component:
 * 
 * import { getTimelineData } from '../utils/timelineDataGenerator';
 * import { Timeline } from '../components/Timeline';
 * 
 * const MyComponent = () => {
 *   const [selectedDate, setSelectedDate] = useState(new Date());
 *   const [payPeriod, setPayPeriod] = useState({ start: null, end: null, employerId: null });
 *   
 *   const timelineData = getTimelineData();
 *   
 *   const handlePayPeriodSelect = (start, end, employerId) => {
 *     setPayPeriod({ start, end, employerId });
 *   };
 *   
 *   return (
 *     <Timeline 
 *       shifts={timelineData.shifts}
 *       payDates={timelineData.payDates}
 *       selectedDate={selectedDate}
 *       employers={userData.employers}
 *       onPayPeriodSelect={handlePayPeriodSelect}
 *     />
 *   );
 * };
 */
