import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api as mockApi } from '../api/mockApi';
import EmployerCard from '../components/EmployerCard';

const Employers: React.FC = () => {
  const { user } = useAuth();
  
  // Fetch employers data
  const { data: employersData, isLoading } = useQuery({
    queryKey: ['employers'],
    queryFn: async () => {
      const response = await mockApi.getUserEmployers();
      return response.data;
    },
    enabled: !!user, // Only run if user is logged in
  });
  
  if (isLoading) {
    return (
      <div className="w-full px-0 sm:px-4">
        <div className="w-full lg:max-w-4xl mx-auto">
          <div className="text-center p-4">
            Loading employers...
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full px-0 sm:px-4">
      <div className="w-full lg:max-w-4xl mx-auto">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 py-3 px-4 flex justify-between items-center -mt-4">
          <div className="text-lg font-medium">Employers</div>
        </div>
        
        <div className="px-0 sm:px-4 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {employersData && employersData.length > 0 ? (
            employersData.map((employer: any) => (
              <EmployerCard key={employer.id} employer={employer} />
            ))
          ) : (
            <div className="col-span-full text-center p-4 text-gray-500">
              No employers found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Employers;
