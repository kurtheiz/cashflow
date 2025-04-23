import React, { useEffect, useState } from 'react';
import { Chart } from 'primereact/chart';
import { usePayPeriods, useEmployers } from '../hooks/useApiData';
import { format, parseISO, getYear } from 'date-fns';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

interface CashflowChartProps {
  year?: number;
}

interface MonthlyEmployerData {
  employer: string;
  employerId: string;
  color: string;
  netPay: number;
}

interface MonthlyData {
  [month: string]: MonthlyEmployerData[];
}

interface ChartDataset {
  type: string;
  label: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  fill?: boolean;
  tension?: number;
  pointBackgroundColor?: string;
  pointBorderColor?: string;
  pointBorderWidth?: number;
  pointRadius?: number;
  data: number[];
  yAxisID?: string;
}

const CashflowChart: React.FC<CashflowChartProps> = ({ year = new Date().getFullYear() }) => {
  const [chartData, setChartData] = useState<any>(null);
  const [chartOptions, setChartOptions] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get start and end dates for the entire year
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  // Fetch pay periods for the entire year
  const { data: payPeriodsResp, isLoading: payPeriodsLoading } = usePayPeriods(startDate, endDate);
  const payPeriodsData = payPeriodsResp?.data || [];

  // Fetch employers to get colors
  const { data: employersResp, isLoading: employersLoading } = useEmployers();
  const employersData = employersResp?.data || [];

  useEffect(() => {
    if (!payPeriodsLoading && !employersLoading && payPeriodsData.length > 0) {
      processChartData();
    }
  }, [payPeriodsData, employersData, payPeriodsLoading, employersLoading]);

  const processChartData = () => {
    setIsLoading(true);

    try {
      // Create an object to store monthly data by employer
      const monthlyData: MonthlyData = {};
      
      // Initialize months
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      
      // Initialize monthly data structure with empty arrays for each month
      months.forEach(month => {
        monthlyData[month] = [];
      });

      // Process pay periods
      payPeriodsData.forEach((employerPeriods: any) => {
        const { employerId, employer, periods } = employerPeriods;
        
        // Find employer color
        const employerInfo = employersData.find((e: any) => e.id === employerId);
        const color = employerInfo?.color || '#CCCCCC';

        // Process each period
        periods.forEach((period: any) => {
          const payDate = parseISO(period.payDate);
          
          // Only include pay periods from the selected year
          if (getYear(payDate) === year) {
            const month = format(payDate, 'MMM');
            const netPay = period.netPay || 0;
            
            // Check if this employer already has data for this month
            const existingIndex = monthlyData[month].findIndex(
              (data) => data.employerId === employerId
            );
            
            if (existingIndex >= 0) {
              // Add to existing employer data for this month
              monthlyData[month][existingIndex].netPay += netPay;
            } else {
              // Add new employer data for this month
              monthlyData[month].push({
                employer,
                employerId,
                color,
                netPay
              });
            }
          }
        });
      });

      // Extract unique employers across all months
      const uniqueEmployers = new Set<string>();
      Object.values(monthlyData).forEach(monthEmployers => {
        monthEmployers.forEach(data => {
          uniqueEmployers.add(data.employerId);
        });
      });
      
      // Blue color palette for employers
      const blueColors = [
        '#1e40af', // dark blue
        '#3b82f6', // medium blue
        '#60a5fa', // light blue
        '#93c5fd', // lighter blue
        '#bfdbfe', // very light blue
        '#0d9488', // teal
        '#0891b2', // cyan
        '#0284c7', // sky blue
        '#2563eb', // royal blue
        '#4f46e5'  // indigo
      ];
      
      // Create datasets for the chart
      const datasets: ChartDataset[] = Array.from(uniqueEmployers).map((employerId, index) => {
        const employerInfo = employersData.find((e: any) => e.id === employerId);
        const employerName = employerInfo?.name || 'Unknown';
        // Use color from blue palette based on index
        const employerColor = blueColors[index % blueColors.length];
        
        // Get data for each month
        const data = months.map(month => {
          const employerData = monthlyData[month].find(data => data.employerId === employerId);
          return employerData ? employerData.netPay : 0;
        });
        
        return {
          type: 'bar',
          label: employerName,
          backgroundColor: employerColor,
          data
        };
      });
      
      // Monthly totals and line dataset removed as requested

      // Create chart data
      const data = {
        labels: months,
        datasets
      };

      // Create chart options
      const options = {
        maintainAspectRatio: false,
        aspectRatio: 1.5,
        plugins: {
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: (context: any) => {
                return `${context.dataset.label}: $${context.raw.toFixed(2)}`;
              },
              footer: (tooltipItems: any) => {
                const total = tooltipItems.reduce((sum: number, item: any) => sum + item.parsed.y, 0);
                return `Total: $${total.toFixed(2)}`;
              }
            }
          },
          legend: {
            position: 'top',
            align: 'center',
            labels: {
              usePointStyle: true,
              boxWidth: 24,
              boxHeight: 12,
              padding: 20,
              font: {
                size: 14
              }
            }
          },
          title: {
            display: false,
            text: `Monthly Income - ${year}`,
            font: {
              size: 16
            }
          },
          datalabels: {
            display: false
          }
        },
        responsive: true,
        scales: {
          x: {
            stacked: true,
            title: {
              display: true,
              text: 'Month'
            },
            grid: {
              color: '#e5e7eb', // Tailwind gray-200 for subtle horizontal lines
              lineWidth: 2
            }
          },
          y: {
            stacked: true,
            title: {
              display: true,
              text: 'Net Pay ($)'
            },
            grid: {
              color: '#d1d5db', // Tailwind gray-300 for slightly darker horizontal lines
              lineWidth: 2
            },
            ticks: {
              callback: (value: number) => {
                return `$${value}`;
              }
            }
          }
        },
        interaction: {
          mode: 'index',
          intersect: false
        }
      };

      setChartData(data);
      setChartOptions(options);
      setIsLoading(false);
    } catch (error) {
      console.error('Error processing chart data:', error);
      setIsLoading(false);
    }
  };

  if (isLoading || payPeriodsLoading || employersLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-lg p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Loading cashflow data...</span>
      </div>
    );
  }

  if (!chartData || !chartOptions) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-lg p-4">
        <span className="text-gray-600">No cashflow data available</span>
      </div>
    );
  }
  
  // Calculate total annual income
  const totalAnnualIncome = chartData.datasets
    .filter((dataset: any) => dataset.type === 'bar')
    .flatMap((dataset: any) => dataset.data)
    .reduce((sum: number, value: number) => sum + value, 0);

  // Pie chart: Calculate total income per employer
  const employerTotals: Record<string, number> = {};
  chartData.datasets.forEach((dataset: any) => {
    if (dataset.type === 'bar') {
      employerTotals[dataset.label] = dataset.data.reduce((sum: number, v: number) => sum + v, 0);
    }
  });
  const pieLabels = Object.keys(employerTotals);
  const pieDataValues = Object.values(employerTotals);
  // Use the same blueColors palette as above
  const blueColors = [
    '#1e40af', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#0d9488', '#0891b2', '#0284c7', '#2563eb', '#4f46e5'
  ];
  const pieData = {
    labels: pieLabels,
    datasets: [
      {
        data: pieDataValues,
        backgroundColor: pieLabels.map((_, i) => blueColors[i % blueColors.length]),
        borderWidth: 1,
      }
    ]
  };
  const pieOptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: { usePointStyle: true }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: $${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          }
        }
      },
      datalabels: {
        color: '#fff',
        font: {
          weight: 'bold' as const,
          size: 14
        },
        formatter: (value: number, context: any) => {
          const total = context.chart.data.datasets[0].data.reduce((sum: number, v: number) => sum + v, 0);
          const percent = total ? (value / total) * 100 : 0;
          return percent > 2 ? `${percent.toFixed(1)}%` : '';
        },
        anchor: 'center',
        align: 'center',
        clamp: true
      }
    },
    responsive: false,
    maintainAspectRatio: false
  };

  return (
    <div className="bg-white p-2">
      <div style={{ height: 400 }}>
          <Chart type="bar" data={chartData} options={chartOptions} style={{ height: 400 }} />
      </div>
      {/* Bar chart summary */}
      <div className="mt-4">
        <h4 className="text-lg font-semibold text-gray-700 mb-3 text-center">Total Annual Income</h4>
        <p className="text-sm text-gray-600 text-center"><span className="font-semibold text-blue-600">${totalAnnualIncome.toFixed(2)}</span></p>
      </div>

      {/* Pie chart for employer income breakdown */}
      <div className="mt-8">
        <h4 className="text-lg font-semibold text-gray-700 mb-3 text-center">Income by Employer</h4>
        <div className="flex justify-center">
          <div style={{ height: 300, width: 300 }}>
            <Chart type="pie" data={pieData} options={pieOptions} style={{ height: 300 }} />
          </div>
        </div>
      </div>

      {/* Statistical Summary */}
      <div className="mt-8">
        <StatisticalSummary />
      </div>
    </div>
  );
};

// --- StatisticalSummary Component ---
import shiftspay from '../api/data/shiftspay.json';
import payperiods from '../api/data/payperiods.json';

function StatisticalSummary() {
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
}

export default CashflowChart;
