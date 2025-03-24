import React from "react";
import { Info } from "lucide-react";

const MetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  error,
  previousValue,
  description,
  trend
}) => {
  // Calculate percentage change if previous value exists
  const getPercentageChange = () => {
    if (!previousValue || !value) return null;
    const change = ((value - previousValue) / previousValue) * 100;
    return change.toFixed(1);
  };

  // Determine trend color
  const getTrendColor = () => {
    if (!trend) return '';
    return trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-gray-500';
  };

  return (
    <div className="bg-[#1e293b] rounded-lg p-6 flex flex-col items-center">
      {/* Header with title and icon */}
      <div className="flex items-center justify-center space-x-2 mb-2">
        {Icon && <Icon className="h-4 w-4 text-gray-400" />}
        <div className="flex items-center">
          <h3 className="text-sm text-gray-400 text-center">{title}</h3>
          {description && (
            <div className="group relative ml-1">
              <Info className="h-4 w-4 text-gray-500 cursor-help" />
              <div className="invisible group-hover:visible absolute z-10 w-48 p-2 mt-1 text-sm text-white bg-gray-800 rounded shadow-lg -left-1/2 transform -translate-x-1/2">
                {description}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main value display */}
      <div className="text-2xl font-bold text-white">
        {error ? (
          'N/A'
        ) : (
          <span className="flex items-center justify-center">
            {typeof value === 'number' ? value.toLocaleString() : value}
            {trend !== undefined && (
              <span className={`text-sm ml-2 ${getTrendColor()}`}>
                ({trend > 0 ? '+' : ''}{trend}%)
              </span>
            )}
          </span>
        )}
      </div>

      {/* Previous value comparison */}
      {previousValue && !error && (
        <div className="mt-2 text-sm">
          <span className="text-gray-400">
            Previous: {typeof previousValue === 'number' ? previousValue.toLocaleString() : previousValue}
            {getPercentageChange() && (
              <span className={`ml-1 ${getTrendColor()}`}>
                ({getPercentageChange() > 0 ? '+' : ''}{getPercentageChange()}%)
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;