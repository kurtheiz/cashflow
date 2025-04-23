import React, { useEffect, useState } from 'react';
import { Chart } from 'primereact/chart';
import { usePayPeriods, useEmployers } from '../hooks/useApiData';
import { format, parseISO, getYear } from 'date-fns';
import StatisticalSummary from './StatisticalSummary';
import IncomeByEmployerChart from './IncomeByEmployerChart';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components needed for bar chart
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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

// Helper function to get employer color
const getEmployerColor = (employerId: string, employersData: any[]): string => {
  const employer = employersData.find((e: any) => e.id === employerId);
  return employer?.color || '#3b82f6'; // Default to blue if no color is found
};

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

  // Fetch employers
  const { data: employersResp, isLoading: employersLoading } = useEmployers();
  const employersData = employersResp?.data || [];

  // Process data for chart when data is loaded
  useEffect(() => {
    if (!payPeriodsLoading && !employersLoading) {
      processChartData();
    }
  }, [payPeriodsLoading, employersLoading, year]);

  // Process the data for the chart
  const processChartData = () => {
    setIsLoading(true);

    // Create a map of monthly data by employer
    const monthlyData: MonthlyData = {};

    // Define months for the x-axis
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    // Initialize monthlyData with empty arrays for each month
    months.forEach(month => {
      monthlyData[month] = [];
    });

    // Process pay periods data
    payPeriodsData.forEach((employer: any) => {
      employer.periods.forEach((period: any) => {
        // Check if the period is in the selected year
        const payDate = parseISO(period.payDate);
        const payYear = getYear(payDate);

        if (payYear === year) {
          // Get month abbreviation (e.g., 'Jan', 'Feb')
          const monthAbbr = format(payDate, 'MMM');

          // Add employer data to the monthly data
          monthlyData[monthAbbr].push({
            employer: employer.employer,
            employerId: employer.employerId,
            color: getEmployerColor(employer.employerId, employersData),
            netPay: period.netPay || 0
          });
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
          text: ''
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

  // Calculate employer income totals for the pie chart
  const employerTotals: Record<string, number> = {};
  chartData.datasets.forEach((dataset: any) => {
    if (dataset.type === 'bar') {
      employerTotals[dataset.label] = dataset.data.reduce((sum: number, v: number) => sum + v, 0);
    }
  });

  // Calculate total annual income
  const totalAnnualIncome = chartData.datasets
    .filter((dataset: any) => dataset.type === 'bar')
    .flatMap((dataset: any) => dataset.data)
    .reduce((sum: number, value: number) => sum + value, 0);

  return (
    <div className="bg-white p-2">
      {/* Monthly Income Bar Chart */}
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-gray-700 mb-3 text-center">Monthly Income - {year}</h4>
        <div style={{ height: 400 }}>
          <Chart type="bar" data={chartData} options={chartOptions} style={{ height: 400 }} />
        </div>
        <p className="text-sm text-gray-600 text-center mt-2">
          Total Annual Income: <span className="font-semibold text-blue-600">${totalAnnualIncome.toFixed(2)}</span>
        </p>
      </div>
      
      {/* Pie chart for employer income breakdown */}
      <div className="mt-8">
        <IncomeByEmployerChart employerTotals={employerTotals} />
      </div>

      {/* Statistical Summary */}
      <div className="mt-8">
        <StatisticalSummary />
      </div>
    </div>
  );
};

export default CashflowChart;
