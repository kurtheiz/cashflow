import React from 'react';

const Shifts: React.FC = () => {

  return (
    <div className="container mx-auto max-w-screen-md px-4" style={{ backgroundColor: '#fff' }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Shifts</h1>
        
        {/* Empty state */}
        <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-100 text-center">
          <div className="flex flex-col items-center justify-center">
            <svg 
              className="w-16 h-16 text-gray-300 mb-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <rect x="3" y="4" width="18" height="16" rx="2" strokeWidth="2" />
              <path d="M16 2v4" strokeWidth="2" strokeLinecap="round" />
              <path d="M8 2v4" strokeWidth="2" strokeLinecap="round" />
              <path d="M3 10h18" strokeWidth="2" />
            </svg>
            <h2 className="text-xl font-medium text-gray-700 mb-2">No shifts to display</h2>
            <p className="text-gray-500 mb-6">
              Your shifts will appear here once you've added them.
            </p>
            <button 
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Add New Shift
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shifts;
