import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

const ErrorDisplay = ({ title, error, retry }) => {
  const errorMessage = error?.message || 'An unexpected error occurred';
  
  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-lg bg-gray-800 border border-red-500/30 max-w-md mx-auto my-8">
      <AlertOctagon className="h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-center mb-6">{errorMessage}</p>
      
      {retry && (
        <button 
          onClick={retry}
          className="flex items-center justify-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorDisplay;