import React from 'react';
import PayDateCard from '../PayDateCard';
import { UpcomingPayDates } from './types';

interface UpcomingPaymentsProps {
  payPeriodsLoading: boolean;
  upcomingPayDates: UpcomingPayDates;
  employersData: any[];
}

const UpcomingPayments: React.FC<UpcomingPaymentsProps> = ({
  payPeriodsLoading,
  upcomingPayDates,
  employersData
}) => {
  return (
    <div className="mt-4 mb-8">
      <h2 className="text-xl font-semibold mb-4 text-center">Your Upcoming Payments</h2>
      {payPeriodsLoading ? (
        <div className="bg-white p-4 text-center text-gray-500 w-full">
          Loading pay dates...
        </div>
      ) : (
        <div className="w-full">
          {Object.keys(upcomingPayDates).length > 0 ? (
            employersData.map((employer: any) => {
              const payDate = upcomingPayDates[employer.id];
              
              return payDate ? (
                <div key={`pay-${employer.id}`} className="w-full">
                  <PayDateCard 
                    payDate={{
                      date: payDate.payDate,
                      employerId: employer.id,
                      employer: employer.name,
                      amount: payDate.grossPay, // Keep for backward compatibility
                      grossPay: payDate.grossPay,
                      periodStart: payDate.startDate,
                      periodEnd: payDate.endDate,
                      hours: payDate.totalHours,
                      payRate: payDate.payCategories && payDate.payCategories[0]?.rate || 0,
                      tax: payDate.tax,
                      netPay: payDate.netPay,
                      employeeLevel: employer.level,
                      awardDescription: employer.awardDescription,
                      sgcPercentage: employer.sgcPercentage,
                      payCategories: payDate.payCategories || [],
                      // Use shifts directly as shiftDates since they are already date strings
                      shiftDates: Array.isArray(payDate.shifts) ? payDate.shifts : [],
                      shifts: payDate.shifts,
                      // Add allowances data
                      allowances: payDate.allowances || [],
                      allowanceTotal: payDate.allowanceTotal || 0,
                      totalGrossPay: payDate.totalGrossPay || 0
                    }} 
                    color={employer.color} 
                  />
                </div>
              ) : null;
            })
          ) : (
            <div className="bg-white p-4 text-center text-gray-500 w-full">
              No upcoming payments scheduled
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UpcomingPayments;
