import React from "react";
import { 
  Users, 
  UserCheck, 
  Clock, 
  UserPlus, 
  UserMinus, 
  PieChart, 
  UserCog, 
  GraduationCap, 
  Building2, 
  Target, 
  CalendarCheck, 
  UserX, 
  PauseCircle, 
  HandHelping, 
  FileCheck, 
  FileX, 
  TrendingUp 
} from "lucide-react";
import { Card } from "../../../components/ui/card";

// Icon mapping for different metric types
const iconMap = {
  // Current Status Icons
  "Currently Paired Clients": UserCheck,
  "Currently Paired w/ Awaiting": UserCog,
  "TOTAL no. of Clients Paying MSF": TrendingUp,
  "TOTAL Paying MSF": TrendingUp,

  // Training and Client Type Icons
  "Clients w/ CBs on Training": GraduationCap,
  "Training Clients": GraduationCap,
  "Trade Clients": Building2,
  "Maps Credit Clients": PieChart,
  "Maps Credit": PieChart,

  // Total and Matched Icons
  "TOTAL Matched Clients": Users,
  "TOTAL Matched": Users,
  "TOTAL no. of Clients": Users,
  "Total Clients": Users,

  // Company Type Icons
  "MAPS Clients": Building2,
  "MAPS": Building2,
  "KW Clients": Building2,
  "KW": Building2,
  "Other Clients": Users,
  "Others": Users,

  // Status Icons
  "Clients on Hold": PauseCircle,
  "On Hold": PauseCircle,
  "Suspended Clients": UserX,
  "Suspended": UserX,
  "Pending On Hold": Clock,
  "Pending Hold": Clock,
  "Pending Cancellation": UserMinus,
  "Pending Cancel": UserMinus,

  // Process Icons
  "Clients for Matching": HandHelping,
  "Waiting for First Cyberbacker": Clock,
  "With One Sheet": FileCheck,
  "Without One Sheet": FileX
};

// Metric descriptions for tooltips
const metricDescriptions = {
  "Currently Paired Clients": "Total number of clients currently paired with active cyberbackers",
  "TOTAL Paying MSF": "Total number of clients currently paying Monthly Service Fee",
  "Training Clients": "Number of clients with cyberbackers in training phase",
  "Trade Clients": "Number of clients in trade arrangements",
  "Maps Credit": "Total number of clients with MAPS credits",
  "TOTAL Matched": "Total number of clients successfully matched with cyberbackers",
  "On Hold": "Number of clients temporarily on hold",
  "Suspended": "Number of clients with suspended services",
  "Pending Hold": "Number of clients awaiting hold status",
  "Pending Cancel": "Number of clients in cancellation process",
  "With One Sheet": "Clients who have submitted their One Sheet documentation",
  "Without One Sheet": "Clients who haven't submitted their One Sheet documentation"
};

// Helper function to calculate trend percentage
const calculateTrend = (current, previous) => {
  if (!current || !previous || isNaN(current) || isNaN(previous)) return null;
  const trend = ((current - previous) / previous) * 100;
  return parseFloat(trend.toFixed(1));
};

// Helper function to format numbers with commas
const formatNumber = (number) => {
  if (typeof number !== 'number' || isNaN(number)) return 'N/A';
  return number.toLocaleString();
};

// Individual Metric Card Component
const MetricCard = ({ 
  title, 
  value, 
  previousValue, 
  icon: Icon,
  description,
  error 
}) => {
  const trend = calculateTrend(value, previousValue);
  const trendColor = trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-gray-400';

  return (
    <Card className="bg-slate-800 p-6 rounded-lg shadow-lg">
      <div className="flex flex-col items-center">
        {/* Header */}
        <div className="flex items-center justify-center space-x-2 mb-3">
          {Icon && <Icon className="h-5 w-5 text-gray-400" />}
          <h3 className="text-sm font-medium text-gray-300">{title}</h3>
        </div>

        {/* Main Value */}
        <div className="text-2xl font-bold text-white mb-2">
          {error ? 'Error' : formatNumber(value)}
        </div>

        {/* Trend */}
        {!error && trend !== null && (
          <div className={`text-sm ${trendColor} flex items-center space-x-1`}>
            <span>{trend > 0 ? '↑' : '↓'}</span>
            <span>{Math.abs(trend)}%</span>
          </div>
        )}

        {/* Previous Value */}
        {!error && previousValue && (
          <div className="text-xs text-gray-400 mt-2">
            Previous: {formatNumber(previousValue)}
          </div>
        )}

        {/* Description Tooltip */}
        {description && (
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gray-900 text-xs text-gray-300 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
            {description}
          </div>
        )}
      </div>
    </Card>
  );
};

// Main MetricSection Component
export const MetricSection = ({ 
  title, 
  metrics, 
  icon: SectionIcon, 
  error = null,
  description = '',
  comparison = {} 
}) => {
  const itemCount = Object.keys(metrics || {}).length;
  
  // Determine grid columns based on number of metrics
  const getGridCols = () => {
    if (itemCount <= 2) return 'lg:grid-cols-2';
    if (itemCount === 3) return 'lg:grid-cols-3';
    return 'lg:grid-cols-4';
  };

  if (!metrics || Object.keys(metrics).length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-900 rounded-lg p-6 mb-6">
      {/* Section Header */}
      <div className="flex items-center space-x-3 mb-6">
        {SectionIcon && <SectionIcon className="h-6 w-6 text-gray-400" />}
        <div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          {description && (
            <p className="text-sm text-gray-400 mt-1">{description}</p>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${getGridCols()} gap-6`}>
        {Object.entries(metrics).map(([key, value]) => (
          <MetricCard
            key={key}
            title={key}
            value={value}
            previousValue={comparison[key]}
            icon={iconMap[key] || Users}
            description={metricDescriptions[key]}
            error={error}
          />
        ))}
      </div>
    </div>
  );
};

// Named export instead of default export
export default MetricSection;