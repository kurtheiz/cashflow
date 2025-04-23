import React from 'react';
import { Chart } from 'primereact/chart';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

interface IncomeByEmployerChartProps {
  employerTotals: Record<string, number>;
}

const IncomeByEmployerChart: React.FC<IncomeByEmployerChartProps> = ({ employerTotals }) => {
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

  const pieLabels = Object.keys(employerTotals);
  const pieDataValues = Object.values(employerTotals);
  
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
        position: 'bottom' as const,
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
    <div className="w-full">
      <h4 className="text-lg font-semibold text-gray-700 mb-3 text-center">Income by Employer</h4>
      <div className="flex justify-center">
        <div style={{ height: 300, width: 300 }}>
          <Chart type="pie" data={pieData} options={pieOptions} style={{ height: 300 }} />
        </div>
      </div>
    </div>
  );
};

export default IncomeByEmployerChart;
