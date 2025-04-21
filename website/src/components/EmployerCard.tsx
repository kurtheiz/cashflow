import React from 'react';
import { Calendar, Clock, Briefcase, Percent, Receipt } from 'lucide-react';

interface EmployerCardProps {
  employer: {
    id: string;
    name: string;
    state: string;
    level: string;
    awardDescription: string;
    sgcPercentage: number;
    taxFreeThreshold: boolean;
    paycycle: string;
    payday: string;
    superRate: number;
    payPeriodStart: string;
    payPeriodDays: number;
    nextPayDate: string;
    color: string;
  };
}

const EmployerCard: React.FC<EmployerCardProps> = ({ employer }) => {
  return (
    <div className="bg-white rounded-none sm:rounded-lg shadow overflow-hidden">
      {/* Header with employer name and color */}
      <div 
        className="py-4 px-5 flex items-center justify-between"
        style={{ backgroundColor: 'var(--primary-blue)' }}
      >
        <h3 className="text-xl font-semibold text-white">{employer.name}</h3>
        <span className="text-sm text-white bg-white bg-opacity-20 px-2 py-1 rounded">
          {employer.state}
        </span>
      </div>

      {/* Employer details */}
      <div className="p-5 space-y-4">
        {/* Award information */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
            Award Information
          </h4>
          <div className="flex items-start">
            <Briefcase className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">{employer.awardDescription}</p>
            </div>
          </div>
        </div>

        {/* Pay cycle information */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
            Pay Cycle
          </h4>
          <div className="flex items-start">
            <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900 capitalize">{employer.paycycle} payments</p>
              <p className="text-xs text-gray-500 mt-1">
                Pay day: {employer.payday}s
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Period starts on {employer.payPeriodStart}s, runs for {employer.payPeriodDays} days
              </p>
            </div>
          </div>
        </div>

        {/* Next payment */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
            Next Payment
          </h4>
          <div className="flex items-start">
            <Clock className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {new Date(employer.nextPayDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Superannuation */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
            Superannuation
          </h4>
          <div className="flex items-start">
            <Percent className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">{employer.sgcPercentage}% SGC</p>
            </div>
          </div>
        </div>

        {/* Tax Information */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
            Tax Information
          </h4>
          <div className="flex items-start">
            <Receipt className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Tax Free Threshold</p>
              <p className="text-xs text-gray-500 mt-1">
                {employer.taxFreeThreshold ? 'Claiming tax free threshold' : 'Not claiming tax free threshold'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerCard;
