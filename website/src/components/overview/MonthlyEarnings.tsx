import React from 'react';
import { format } from 'date-fns';
import { MonthlyData, EmployerEarnings } from './types';

interface MonthlyEarningsProps {
  payPeriodsLoading: boolean;
  payPeriodsData: any[];
  monthlyData: MonthlyData;
  monthYearKeys: string[];
}

const MonthlyEarnings: React.FC<MonthlyEarningsProps> = ({
  payPeriodsLoading,
  payPeriodsData,
  monthlyData,
  monthYearKeys
}) => {
  return (
    <div className="mt-4">
      <h2 className="text-xl font-semibold mb-4 text-center">Monthly Earnings</h2>
      {payPeriodsLoading ? (
        <div className="bg-white p-4 text-center text-gray-500 w-full">
          Loading earnings data...
        </div>
      ) : (
        <div className="w-full">
          {payPeriodsData && payPeriodsData.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {monthYearKeys.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {monthYearKeys.map((monthYear) => {
                    // Convert employer data to array and sort by name
                    const employerEarnings = Object.values(monthlyData[monthYear])
                      .filter(item => item.grossTotal > 0)
                      .sort((a, b) => a.employer.localeCompare(b.employer));
                    
                    // Skip months with no earnings
                    if (employerEarnings.length === 0) return null;
                    
                    // Get month display name
                    const monthDisplay = format(new Date(monthYear + '-01'), 'MMMM yyyy');
                    
                    return (
                      <div key={monthYear} className="pb-2">
                        <div className="p-3 bg-gray-50 border-b border-gray-200">
                          <h3 className="font-semibold text-gray-900">{monthDisplay}</h3>
                        </div>
                        
                        {/* Employers for this month */}
                        <div className="divide-y divide-gray-100">
                          {employerEarnings.map((item) => (
                            <EmployerEarningItem 
                              key={`${monthYear}-${item.employerId}`} 
                              item={item} 
                            />
                          ))}
                          
                          {/* Monthly total */}
                          <MonthlyTotal employerEarnings={employerEarnings} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No earnings data available
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white p-4 text-center text-gray-500 w-full rounded-lg shadow-sm">
              No earnings data available
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface EmployerEarningItemProps {
  item: EmployerEarnings;
}

const EmployerEarningItem: React.FC<EmployerEarningItemProps> = ({ item }) => {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-medium text-gray-900">{item.employer}</h3>
        </div>
        <div className="text-right">
          <div className="font-semibold text-gray-900">${item.afterTaxTotal.toFixed(2)}</div>
          <div className="text-xs text-gray-500">After Tax</div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4 mt-3 text-sm">
        <div>
          <div className="text-gray-500">Shifts</div>
          <div className="font-medium">{item.shiftsCount}</div>
        </div>
        <div>
          <div className="text-gray-500">Gross Pay</div>
          <div className="font-medium">${item.grossTotal.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-gray-500">Tax</div>
          <div className="font-medium">${item.taxTotal.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-gray-500">Super</div>
          <div className="font-medium">${item.superTotal.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
};

interface MonthlyTotalProps {
  employerEarnings: EmployerEarnings[];
}

const MonthlyTotal: React.FC<MonthlyTotalProps> = ({ employerEarnings }) => {
  return (
    <div className="p-4 bg-gray-50">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-700">Total</h3>
        <div className="text-right">
          <div className="font-semibold text-gray-900">
            ${employerEarnings.reduce((sum, item) => sum + item.afterTaxTotal, 0).toFixed(2)}
          </div>
          <div className="text-xs text-gray-500">After Tax</div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4 mt-3 text-sm">
        <div>
          <div className="text-gray-500">Shifts</div>
          <div className="font-medium">
            {employerEarnings.reduce((sum, item) => sum + item.shiftsCount, 0)}
          </div>
        </div>
        <div>
          <div className="text-gray-500">Gross Pay</div>
          <div className="font-medium">
            ${employerEarnings.reduce((sum, item) => sum + item.grossTotal, 0).toFixed(2)}
          </div>
        </div>
        <div>
          <div className="text-gray-500">Tax</div>
          <div className="font-medium">
            ${employerEarnings.reduce((sum, item) => sum + item.taxTotal, 0).toFixed(2)}
          </div>
        </div>
        <div>
          <div className="text-gray-500">Super</div>
          <div className="font-medium">
            ${employerEarnings.reduce((sum, item) => sum + item.superTotal, 0).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyEarnings;
