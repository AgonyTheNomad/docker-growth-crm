import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartBar, X, RefreshCw, Download } from 'lucide-react';
import { constructUrl } from '../../../utils/apiUtils';
import DateRangeSelector from "./DateRangeSelector";

// MultiSelect Component
const MultiSelect = ({ 
  options, 
  selected, 
  onChange, 
  label,
  placeholder = "Select options..." 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleOption = (option) => {
    const newSelected = selected.includes(option)
      ? selected.filter(item => item !== option)
      : [...selected, option];
    onChange(newSelected);
  };

  const removeOption = (optionToRemove, e) => {
    e.stopPropagation();
    onChange(selected.filter(option => option !== optionToRemove));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-white mb-1">
        {label}
      </label>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left bg-slate-700 text-white rounded border border-slate-600 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {selected.length === 0 ? (
          <span className="text-gray-400">{placeholder}</span>
        ) : (
          <span className="text-white">{selected.length} selected</span>
        )}
      </button>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selected.map((item) => (
            <span
              key={item}
              className="inline-flex items-center px-2 py-1 rounded bg-slate-700 text-white text-sm"
            >
              {item}
              <button
                onClick={(e) => removeOption(item, e)}
                className="ml-2 text-white hover:text-red-400 focus:outline-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-md shadow-lg">
          <div className="p-2 border-b border-slate-700">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full px-3 py-1 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="max-h-60 overflow-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-gray-400 text-sm">
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option}
                  onClick={() => toggleOption(option)}
                  className={`px-3 py-2 cursor-pointer hover:bg-slate-700 ${
                    selected.includes(option) ? 'bg-slate-700' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selected.includes(option)}
                      onChange={() => {}}
                      className="mr-2"
                    />
                    <span className="text-white">{option}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Main MetricBreakdownModal Component
const MetricBreakdownModal = ({ metrics, initialFilters, onRefresh }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [breakdownData, setBreakdownData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewType, setViewType] = useState('franchise');
  const [activeTab, setActiveTab] = useState('table');
  const [filterOptions, setFilterOptions] = useState({
    growthbackers: [],
    franchises: [],
    sources: []
  });
  const [selectedFilters, setSelectedFilters] = useState({
    startDate: initialFilters?.startDate || '',
    endDate: initialFilters?.endDate || '',
    growthbacker: [],
    franchise: '',
    source: []
  });

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch(constructUrl('/api/analytics/filter-options'), {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch filter options');
      
      const data = await response.json();
      setFilterOptions({
        growthbackers: data.growthbackers || [],
        franchises: data.franchises || [],
        sources: data.sources || []
      });
    } catch (err) {
      console.error('Error fetching filter options:', err);
      setError('Failed to load filter options');
    }
  };

  const fetchBreakdownData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('start_date', selectedFilters.startDate || '');
      params.append('end_date', selectedFilters.endDate || '');
      
      selectedFilters.growthbacker.forEach(gb => {
        params.append('growthbacker[]', gb);
      });
      
      params.append('franchise', selectedFilters.franchise || '');
      
      selectedFilters.source.forEach(src => {
        params.append('source[]', src);
      });
      
      const response = await fetch(
        constructUrl(`/api/analytics/status-breakdown?${params}`),
        { credentials: 'include' }
      );
      
      if (!response.ok) throw new Error('Failed to fetch breakdown data');
      
      const result = await response.json();
      setBreakdownData(result[viewType] || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchFilterOptions();
      fetchBreakdownData();
    }
  }, [isOpen, viewType, selectedFilters]);

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      params.append('start_date', selectedFilters.startDate);
      params.append('end_date', selectedFilters.endDate);
      selectedFilters.growthbacker.forEach(gb => params.append('growthbacker[]', gb));
      params.append('franchise', selectedFilters.franchise);
      selectedFilters.source.forEach(src => params.append('source[]', src));

      const response = await fetch(
        constructUrl(`/api/analytics/export-metrics?${params}`),
        { credentials: 'include' }
      );
      
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `metrics_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to export data');
      console.error('Export error:', err);
    }
  };

  const renderTable = () => {
    if (!breakdownData?.length) {
      return (
        <div className="text-center text-gray-400 py-8">
          No data available
        </div>
      );
    }

    const statuses = Object.keys(breakdownData[0]?.statuses || {});
    
    return (
      <div className="overflow-auto max-h-96">
        <table className="min-w-full divide-y divide-slate-700">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400 uppercase tracking-wider bg-slate-800 sticky top-0">
                {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
              </th>
              {statuses.map(status => (
                <th key={status} className="px-4 py-3 text-left text-sm font-medium text-gray-400 uppercase tracking-wider bg-slate-800 sticky top-0">
                  {status}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {breakdownData.map((item, index) => (
              <tr key={index} className="hover:bg-slate-800">
                <td className="px-4 py-3 text-sm whitespace-nowrap text-white">
                  {item.name || 'Unknown'}
                </td>
                {statuses.map(status => (
                  <td key={status} className="px-4 py-3 text-sm text-gray-300">
                    {(item.statuses[status] || 0).toLocaleString()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderChart = () => {
    if (!breakdownData?.length) return null;

    const chartData = breakdownData.map(item => ({
      name: item.name || 'Unknown',
      ...item.statuses
    }));

    const statuses = Object.keys(breakdownData[0]?.statuses || {});

    return (
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" strokeOpacity={0.3} />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis 
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickFormatter={(value) => value.toFixed(1)}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '6px',
                padding: '10px'
              }}
              labelStyle={{ color: '#94a3b8', fontWeight: 'bold', marginBottom: '5px' }}
              itemStyle={{ color: '#94a3b8' }}
            />
            <Legend 
              verticalAlign="top"
              height={36}
              wrapperStyle={{ paddingBottom: '20px' }}
            />
            {statuses.map((status, index) => (
              <Line
                key={status}
                type="monotone"
                dataKey={status}
                name={status}
                stroke={`hsl(${index * 45}, 70%, 50%)`}
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
      >
        <ChartBar className="w-4 h-4" />
        Status Breakdown
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-lg w-full max-w-7xl">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Status Breakdown Analysis</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExport}
                  className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button
                  onClick={() => fetchBreakdownData()}
                  className="px-3 py-1.5 bg-slate-700 text-white rounded hover:bg-slate-600 flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-slate-800 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <DateRangeSelector 
              onDateRangeChange={(start, end) => {
                setSelectedFilters(prev => ({
                  ...prev,
                  startDate: start,
                  endDate: end
                }));
              }}
              initialDateRange={{
                startDate: selectedFilters.startDate,
                endDate: selectedFilters.endDate
              }}
            />

            <div className="p-6 space-y-6">
              {/* Filter Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MultiSelect
                  label="Growthbacker"
                  options={filterOptions.growthbackers}
                  selected={selectedFilters.growthbacker}
                  onChange={(value) => setSelectedFilters(prev => ({ ...prev, growthbacker: value }))}
                  placeholder="Select growthbackers..."
                />
                
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-white">
                    Franchise
                  </label>
                  <select
                    value={selectedFilters.franchise}
                    onChange={(e) => setSelectedFilters(prev => ({ ...prev, franchise: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Franchises</option>
                    {filterOptions.franchises.map(franchise => (
                      <option key={franchise} value={franchise}>
                        {franchise}
                      </option>
                    ))}
                  </select>
                </div>

                <MultiSelect
                  label="Source"
                  options={filterOptions.sources}
                  selected={selectedFilters.source}
                  onChange={(value) => setSelectedFilters(prev => ({ ...prev, source: value }))}
                  placeholder="Select sources..."
                />
              </div>

              {/* View Controls */}
              <div className="flex flex-wrap gap-4 justify-between">
                <select
                  value={viewType}
                  onChange={(e) => setViewType(e.target.value)}
                  className="px-3 py-2 bg-slate-800 text-white rounded border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="franchise">By Franchise</option>
                  <option value="growthbacker">By Growthbacker</option>
                  <option value="source">By Source</option>
                </select>
                
                <div className="flex rounded-lg overflow-hidden">
                  <button
                    onClick={() => setActiveTab('table')}
                    className={`px-4 py-2 text-sm ${
                      activeTab === 'table' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    }`}
                  >
                    Table View
                  </button>
                  <button
                    onClick={() => setActiveTab('chart')}
                    className={`px-4 py-2 text-sm ${
                      activeTab === 'chart' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    }`}
                  >
                    Chart View
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className="bg-slate-800 rounded-lg p-4">
                {loading ? (
                  <div className="h-96 flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                  </div>
                ) : error ? (
                  <div className="h-96 flex items-center justify-center text-red-400">
                    {error}
                  </div>
                ) : activeTab === 'table' ? (
                  renderTable()
                ) : (
                  renderChart()
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MetricBreakdownModal;