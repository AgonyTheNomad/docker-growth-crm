import React, { useState, useEffect, useCallback } from "react";
import { FilterPanel } from "./components/FilterPanel";
import { DateRangeSelector } from "./components/DateRangeSelector";
import MetricSection from "./components/MetricSection";
import MetricBreakdownModal from "./components/MetricBreakdownModal";
import { constructUrl } from "../../utils/apiUtils";
import { RefreshCw, AlertCircle, ChartBar, BarChart3 } from "lucide-react";
import { formatDateForDisplay } from "./utils/dateUtils";
import { groupMetrics } from "./utils/metricUtils";
import { Users, Building2, PieChart, Clock, TrendingUp } from "lucide-react";

const ChartBarIcon = ChartBar;

const MetricsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    growthbacker: '',
    franchise: '',
    source: ''
  });

  // Memoized fetch function
  const fetchMetrics = useCallback(async (params = {}, attempt = 1) => {
    try {
      if (attempt === 1) {
        setLoading(true);
        setError(null);
      }

      // Only proceed if we have both dates
      if (!params.start_date || !params.end_date) {
        setLoading(false);
        return;
      }
      
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, value);
      });
      
      const url = constructUrl(`/api/analytics/metrics?${searchParams.toString()}`);
      
      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch metrics (HTTP ${response.status})`);
      }

      const result = await response.json();
      
      if (!result?.growth_metrics) {
        throw new Error('Invalid metrics data received');
      }
      
      setData(result);
      setRetryCount(0);
      
    } catch (err) {
      console.error("Error fetching metrics:", err);
      
      if (attempt < 3) {
        const backoffDelay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        setRetryCount(attempt);
        
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        return fetchMetrics(params, attempt + 1);
      } else {
        setError({
          message: "Failed to fetch metrics. Please try again later.",
          details: err.message,
          timestamp: new Date().toISOString()
        });
        setRetryCount(0);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Unified filter update handler
  const updateFilters = useCallback((updates) => {
    setFilters(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  // Date range change handler
  const handleDateRangeChange = useCallback((startDate, endDate) => {
    updateFilters({ startDate, endDate });
  }, [updateFilters]);

  // Filter change handler
  const handleFilterChange = useCallback((filterType, value) => {
    updateFilters({ [filterType]: value });
  }, [updateFilters]);

  // Effect to fetch data when filters change
  useEffect(() => {
    const params = {
      start_date: filters.startDate,
      end_date: filters.endDate,
      growthbacker: filters.growthbacker,
      franchise: filters.franchise,
      source: filters.source
    };
    
    fetchMetrics(params);
  }, [filters, fetchMetrics]);

  // Initial date range setup
  useEffect(() => {
    const today = new Date();
    const defaultStartDate = new Date(today.getFullYear(), 0, 1);
    handleDateRangeChange(
      defaultStartDate.toISOString().split('T')[0],
      today.toISOString().split('T')[0]
    );
  }, [handleDateRangeChange]);

  // Export handler
  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        start_date: filters.startDate,
        end_date: filters.endDate,
        growthbacker: filters.growthbacker,
        franchise: filters.franchise,
        source: filters.source
      });

      const response = await fetch(constructUrl(`/api/analytics/export-metrics?${params}`), {
        credentials: 'include'
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `metrics_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting data:', error);
      setError({
        message: "Failed to export data. Please try again later.",
        details: error.message,
        timestamp: new Date().toISOString()
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-900">
        <div className="flex flex-col items-center space-y-4 text-white">
          <div className="flex items-center space-x-2">
            <RefreshCw className="animate-spin h-5 w-5" />
            <span>Loading metrics{retryCount > 0 ? ` (Retry ${retryCount}/3)` : ''}...</span>
          </div>
          {retryCount > 0 && (
            <div className="text-sm text-gray-400">
              Attempting to recover...
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-900">
        <div className="flex flex-col items-center space-y-4 text-white max-w-lg px-4">
          <div className="flex items-center space-x-2 text-red-400">
            <AlertCircle className="h-5 w-5" />
            <span className="text-lg font-medium">{error.message}</span>
          </div>
          <div className="text-sm text-gray-400 text-center">
            {error.details}
          </div>
          <div className="text-xs text-gray-500">
            Error occurred at: {new Date(error.timestamp).toLocaleString()}
          </div>
          <button
            onClick={() => fetchMetrics({
              start_date: filters.startDate,
              end_date: filters.endDate,
              ...filters
            })}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center space-x-2 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Retry Loading Metrics</span>
          </button>
        </div>
      </div>
    );
  }

  const groupedMetrics = groupMetrics(data);

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-white">
      <div className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8 bg-slate-800 rounded-lg p-6">
          <div className="flex flex-col items-center">
            <h1 className="text-3xl font-bold">Metrics Dashboard</h1>
            <div className="flex items-center justify-between w-full mt-4">
              <div>
                <p className="text-gray-400">
                  Last updated: {new Date().toLocaleString()}
                </p>
                {filters.startDate && filters.endDate && (
                  <p className="text-gray-400">
                    Date Range: {formatDateForDisplay(filters.startDate)} 
                    {' '} to {' '}
                    {formatDateForDisplay(filters.endDate)}
                  </p>
                )}
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => fetchMetrics({
                    start_date: filters.startDate,
                    end_date: filters.endDate,
                    ...filters
                  })}
                  className="px-3 py-1.5 bg-slate-700 text-white rounded hover:bg-slate-600 flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
                <MetricBreakdownModal 
                  metrics={data?.growth_metrics}
                  filters={filters}
                  onRefresh={() => fetchMetrics({
                    start_date: filters.startDate,
                    end_date: filters.endDate,
                    ...filters
                  })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Date Range Selector */}
        <DateRangeSelector 
          onDateRangeChange={handleDateRangeChange}
          initialDateRange={{
            startDate: filters.startDate,
            endDate: filters.endDate
          }}
        />
        
        {/* Filter Panel */}
        <FilterPanel 
          onFilterChange={handleFilterChange}
          onExport={handleExport}
          activeFilters={{
            growthbacker: filters.growthbacker,
            franchise: filters.franchise,
            source: filters.source
          }}
        />

        {/* Status Distribution Table */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <div className="flex items-center space-x-2 mb-6">
            <ChartBar className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-white">Status Distribution</h2>
          </div>
          <div className="overflow-hidden">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-400 uppercase tracking-wider">
                    Count
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {data?.status_metrics?.Month ? (
                  data.status_metrics.Month.map((item, index) => (
                    <tr 
                      key={index}
                      className="hover:bg-slate-700"
                    >
                      <td className="py-4 px-4 text-sm text-gray-300">
                        {item.status}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-300 text-right">
                        {item.count.toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="py-4 px-4 text-sm text-gray-400 text-center">
                      No status data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Metric Sections */}
        {groupedMetrics && (
          <div className="space-y-6">
            <MetricSection 
              title="Current Status" 
              metrics={groupedMetrics.currentStatus}
              icon={Users}
              error={error}
            />
            <MetricSection 
              title="Client Categories" 
              metrics={groupedMetrics.clientCategories}
              icon={Building2}
              error={error}
            />
            <MetricSection 
              title="Client Breakdown" 
              metrics={groupedMetrics.clientBreakdown}
              icon={PieChart}
              error={error}
            />
            <MetricSection 
              title="Pending Status" 
              metrics={groupedMetrics.pendingStatus}
              icon={Clock}
              error={error}
            />
            <MetricSection 
              title="Additional Metrics" 
              metrics={groupedMetrics.additionalMetrics}
              icon={ChartBarIcon}
              error={error}
            />
            <MetricSection 
              title="Total Metrics" 
              metrics={groupedMetrics.totals}
              icon={TrendingUp}
              error={error}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricsDashboard;