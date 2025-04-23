import React, { useState } from 'react';
import { Calendar, Clock, Briefcase, Percent, Receipt, DollarSign, Check, X, Info } from 'lucide-react';
import { useEmployers } from '../hooks/useApiData';
import DetailModal from './DetailModal';

interface EmployerCardProps {
  employerId: string;
}

interface Allowance {
  name: string;
  enabled: boolean;
  notes?: string;
}

interface Employer {
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
  applicableAllowances?: Allowance[];
}

// Helper function to fix special characters in text
const fixSpecialChars = (text: string): string => {
  // Replace encoded degree symbol with the actual degree symbol
  return text
    .replace(/\u00C2\u00B0/g, '°') // Fix double-encoded degree symbol
    .replace(/\u00B0/g, '°'); // Fix single-encoded degree symbol
};

const EmployerCard: React.FC<EmployerCardProps> = ({ employerId }) => {
  const [showAwardRules, setShowAwardRules] = useState(false);
  // Fetch employer data from API
  const { data: employersResp, isLoading, error } = useEmployers();
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-none sm:rounded-lg overflow-hidden p-5 text-center">
        <p className="text-gray-500">Loading employer details...</p>
      </div>
    );
  }
  
  if (error || !employersResp?.data) {
    return (
      <div className="bg-white rounded-none sm:rounded-lg overflow-hidden p-5 text-center">
        <p className="text-red-500">Error loading employer details</p>
      </div>
    );
  }
  
  // Find the specific employer by ID
  const employer = employersResp.data.find((emp: Employer) => emp.id === employerId);
  
  if (!employer) {
    return (
      <div className="bg-white rounded-none sm:rounded-lg overflow-hidden p-5 text-center">
        <p className="text-gray-500">Employer not found</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-none sm:rounded-lg overflow-hidden">
      {/* Header with employer name and color */}
      <div 
        className="py-4 px-5 flex items-center justify-between bg-blue-50"
      >
        <h3 className="text-xl font-semibold text-blue-900">{employer.name}</h3>
        <span className="text-sm px-2 py-1 rounded bg-blue-100 text-blue-900">
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
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">{employer.awardDescription}</p>
                <button 
                  onClick={() => setShowAwardRules(true)}
                  className="ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Show award details"
                >
                  <Info className="h-4 w-4 text-blue-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Award Rules Modal */}
        <DetailModal
          isOpen={showAwardRules}
          onClose={() => setShowAwardRules(false)}
          title="General Retail Industry Award Rules"
          subtitle={`Level ${employer.level} - ${employer.state}`}
        >
          <div className="space-y-4">
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-2">Pay Rates</h4>
              <p className="text-gray-700 mb-2">Level {employer.level} Casual Employee Rates:</p>
              <div className="bg-gray-50 rounded-md p-3">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 font-medium">Time Category</th>
                      <th className="text-right py-2 font-medium">Rate (per hour)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="py-2">Ordinary hours</td>
                      <td className="py-2 text-right">$32.06</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2">Evening (after 6pm)</td>
                      <td className="py-2 text-right">$38.48</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2">Saturday</td>
                      <td className="py-2 text-right">$38.48</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2">Sunday</td>
                      <td className="py-2 text-right">$44.89</td>
                    </tr>
                    <tr>
                      <td className="py-2">Public Holiday</td>
                      <td className="py-2 text-right">$64.13</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-2">Break Entitlements</h4>
              <div className="bg-gray-50 rounded-md p-3">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 font-medium">Shift Length</th>
                      <th className="text-left py-2 font-medium">Rest Breaks</th>
                      <th className="text-left py-2 font-medium">Meal Breaks</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="py-2">Less than 4 hours</td>
                      <td className="py-2">None</td>
                      <td className="py-2">None</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2">4-5 hours</td>
                      <td className="py-2">One 10-minute</td>
                      <td className="py-2">None</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2">5-7 hours</td>
                      <td className="py-2">One 10-minute</td>
                      <td className="py-2">One 30-60 minute</td>
                    </tr>
                    <tr>
                      <td className="py-2">7+ hours</td>
                      <td className="py-2">Two 10-minute</td>
                      <td className="py-2">One 30-60 minute</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </DetailModal>

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
        
        {/* Allowances */}
        {employer.applicableAllowances && employer.applicableAllowances.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
              Applicable Allowances
            </h4>
            <div className="flex items-start">
              <DollarSign className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
              <div className="w-full">
                <div className="space-y-2">
                  {employer.applicableAllowances.map((allowance: Allowance, index: number) => (
                    <div key={index} className="flex items-start justify-between border-b border-gray-100 pb-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{fixSpecialChars(allowance.name)}</p>
                        {allowance.notes && (
                          <p className="text-xs text-gray-500 mt-1">{fixSpecialChars(allowance.notes)}</p>
                        )}
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        {allowance.enabled ? (
                          <Check className="h-5 w-5 text-green-500" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerCard;
