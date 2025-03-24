import React from 'react';
import { X } from 'lucide-react';

const ActiveFilters = ({ filters, onRemoveFilter }) => {
  // Check if there are any active filters
  const hasActiveFilters = Object.values(filters).some(value => value !== '');
  
  if (!hasActiveFilters) return null;
  
  return (
    <div className="mb-4 p-4 bg-slate-800 rounded-lg">
      <div className="flex flex-wrap gap-2">
        {filters.growthbacker && (
          <div className="flex items-center bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">
            <span className="mr-2">Growthbacker: {filters.growthbacker}</span>
            <button
              onClick={() => onRemoveFilter('growthbacker')}
              className="hover:text-blue-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {filters.franchise && (
          <div className="flex items-center bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">
            <span className="mr-2">Franchise: {filters.franchise}</span>
            <button
              onClick={() => onRemoveFilter('franchise')}
              className="hover:text-green-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {filters.source && (
          <div className="flex items-center bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm">
            <span className="mr-2">Source: {filters.source}</span>
            <button
              onClick={() => onRemoveFilter('source')}
              className="hover:text-purple-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveFilters;