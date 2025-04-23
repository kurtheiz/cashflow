import React from 'react';
import shiftspay from '../api/data/shiftspay.json';
import payperiods from '../api/data/payperiods.json';

const StatisticalSummary: React.FC = () => {
  const shifts = shiftspay.shifts;
  const totalShifts = shifts.length;
  const totalHours = shifts.reduce((sum, s) => sum + (s.hoursWorked ?? 0), 0);
  const avgHoursPerShift = totalShifts ? totalHours / totalShifts : 0;
  const totalGrossPay = shifts.reduce((sum, s) => sum + (s.totalGrossPay ?? 0), 0);
  const avgGrossPayPerShift = totalShifts ? totalGrossPay / totalShifts : 0;
  const highestShiftPay = Math.max(...shifts.map(s => s.totalGrossPay ?? 0));
  const lowestShiftPay = Math.min(...shifts.map(s => s.totalGrossPay ?? 0));
  const employers = Array.from(new Set(shifts.map(s => s.employer)));
  const numEmployers = employers.length;
  const totalAllowances = shifts.reduce((sum, s) => sum + (s.allowanceTotal ?? 0), 0);
  const avgAllowancePerShift = totalShifts ? totalAllowances / totalShifts : 0;
  
  // Most common day of week
  const weekdayCounts = shifts.reduce((acc, s) => {
    const d = new Date(s.date);
    const wd = d.toLocaleDateString(undefined, { weekday: 'short' });
    acc[wd] = (acc[wd] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const mostCommonWeekday = Object.entries(weekdayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
  
  // Pay category breakdown
  const payCategoryTotals: Record<string, number> = {};
  shifts.forEach(s => {
    (s.payCategories ?? []).forEach((cat: any) => {
      payCategoryTotals[cat.category] = (payCategoryTotals[cat.category] || 0) + (cat.hours ?? 0);
    });
  });
  
  // Net pay from payperiods
  let totalNetPay = 0;
  payperiods.payPeriods.forEach((emp: any) => {
    emp.periods.forEach((p: any) => {
      totalNetPay += p.netPay ?? 0;
    });
  });

  // Format helpers
  const money = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const hours = (n: number) => `${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="w-full">
      <h4 className="text-lg font-semibold text-gray-700 mb-3 text-center">Statistical Summary</h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-4 text-sm">
        <div><span className="font-semibold">Total Shifts:</span> {totalShifts}</div>
        <div><span className="font-semibold">Total Hours:</span> {hours(totalHours)}</div>
        <div><span className="font-semibold">Avg Hours/Shift:</span> {hours(avgHoursPerShift)}</div>
        <div><span className="font-semibold">Total Gross Pay:</span> {money(totalGrossPay)}</div>
        <div><span className="font-semibold">Total Net Pay:</span> {money(totalNetPay)}</div>
        <div><span className="font-semibold">Avg Gross/Shift:</span> {money(avgGrossPayPerShift)}</div>
        <div><span className="font-semibold">Highest Shift Pay:</span> {money(highestShiftPay)}</div>
        <div><span className="font-semibold">Lowest Shift Pay:</span> {money(lowestShiftPay)}</div>
        <div><span className="font-semibold">Most Common Day:</span> {mostCommonWeekday}</div>
        <div><span className="font-semibold">Employers:</span> {numEmployers}</div>
        <div><span className="font-semibold">Total Allowances:</span> {money(totalAllowances)}</div>
        <div><span className="font-semibold">Avg Allowance/Shift:</span> {money(avgAllowancePerShift)}</div>
        <div className="col-span-2 md:col-span-3 pt-2">
          <span className="font-semibold">Pay Category Hours:</span>
          <ul className="ml-2 mt-1">
            {Object.entries(payCategoryTotals).map(([cat, hrs]) => (
              <li key={cat}>{cat.replace(/_/g, ' ')}: {hours(hrs)}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StatisticalSummary;
