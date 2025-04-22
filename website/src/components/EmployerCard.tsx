import React, { useState } from 'react';
import { Calendar, Clock, Briefcase, Percent, Receipt, DollarSign, Check, X, Info, X as XIcon } from 'lucide-react';
import { useEmployers } from '../hooks/useApiData';

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
        {showAwardRules && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" style={{ paddingBottom: '80px' }}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                <h3 className="text-lg font-semibold text-gray-900">General Retail Industry Award Rules</h3>
                <button 
                  onClick={() => setShowAwardRules(false)}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Close modal"
                >
                  <XIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              <div className="px-4 py-3">
                <div className="mb-5">
                  <h4 className="text-md font-semibold text-gray-900 mb-2">Pay Rates</h4>
                  <p className="text-gray-700 mb-2">Level 1 Casual Employee Rates:</p>
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

                <div className="mb-5">
                  <h4 className="text-md font-semibold text-gray-900 mb-2">Break Rules</h4>
                  <ul className="list-disc pl-5 text-gray-700 space-y-2">
                    <li>An employee who works for more than 5 hours must get at least 1 meal break.</li>
                    <li>Employees can't be asked to work more than 5 hours without a meal break.</li>
                    <li>Employees can't be asked to take a rest or meal break within 1 hour of starting or finishing work.</li>
                    <li>An employee who gets 2 rest breaks has to take 1 break in the first half of their shift, and the other break in the second half.</li>
                  </ul>
                </div>
                
                <div className="mb-5">
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
                        <tr className="border-b border-gray-200">
                          <td className="py-2">7-10 hours</td>
                          <td className="py-2">Two 10-minute</td>
                          <td className="py-2">One 30-60 minute</td>
                        </tr>
                        <tr>
                          <td className="py-2">10+ hours</td>
                          <td className="py-2">Two 10-minute</td>
                          <td className="py-2">Two 30-60 minute</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="pb-10 mb-3">
                  {/* Extra space at the bottom for better scrolling */}
                </div>
              </div>
              
              <div className="border-t border-gray-200 px-4 py-3">
                <button
                  onClick={() => setShowAwardRules(false)}
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

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
                        <p className="text-sm font-medium text-gray-900">{allowance.name}</p>
                        {allowance.notes && (
                          <p className="text-xs text-gray-500 mt-1">{allowance.notes}</p>
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
