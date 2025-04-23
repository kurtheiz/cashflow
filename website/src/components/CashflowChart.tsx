import React, { useEffect, useState } from 'react';
import { Chart } from 'primereact/chart';
import { usePayPeriods, useEmployers } from '../hooks/useApiData';
import { format, parseISO, getYear } from 'date-fns';

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
      
      // Monthly totals calculation removed as requested

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
            position: 'bottom',
            labels: {
              usePointStyle: true,
            }
          },
          title: {
            display: true,
            text: `Monthly Income - ${year}`,
            font: {
              size: 16
            }
          }
        },
        responsive: true,
        scales: {
          x: {
            stacked: true,
            title: {
              display: true,
              text: 'Month'
            }
          },
          y: {
            stacked: true,
            title: {
              display: true,
              text: 'Net Pay ($)'
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

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div className="h-64">
        <Chart type="bar" data={chartData} options={chartOptions} />
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">Total Annual Income: <span className="font-semibold text-blue-600">${totalAnnualIncome.toFixed(2)}</span></p>
      </div>
    </div>
  );
};

export default CashflowChart;
