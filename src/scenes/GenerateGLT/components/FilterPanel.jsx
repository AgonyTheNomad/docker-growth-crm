import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Filter, Download, XCircle, RefreshCw } from "lucide-react";
import { constructUrl } from "../../../utils/apiUtils";
import ActiveFilters from "./ActiveFilters";

const EMPTY_FILTER = {
  growthbacker: '',
  franchise: '',
  source: ''
};

export const FilterPanel = ({ 
  onFilterChange, 
  onExport, 
  activeFilters = EMPTY_FILTER,
  className = '' 
}) => {
  const [filterOptions, setFilterOptions] = useState({
    growthbackers: [],
    franchises: [],
    sources: []
  });

  const [selectedFilters, setSelectedFilters] = useState(activeFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch filter options from API
  const fetchFilterOptions = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(constructUrl('/api/analytics/filter-options'), {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch filter options (HTTP ${response.status})`);
      }

      const data = await response.json();
      
      setFilterOptions({
        growthbackers: (data.growthbackers || []).filter(Boolean).sort(),
        franchises: (data.franchises || []).filter(Boolean).sort(),
        sources: (data.sources || []).filter(Boolean).sort()
      });
    } catch (error) {
      console.error('Error fetching filter options:', error);
      setError('Failed to load filter options. Please try again.');
    } finally {
      setIsLoading(false);
      if (!showLoading) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    setSelectedFilters(activeFilters);
  }, [activeFilters]);

  const handleFilterChange = (filterType, value) => {
    const newFilters = {
      ...selectedFilters,
      [filterType]: value
    };
    setSelectedFilters(newFilters);
    onFilterChange(filterType, value);
  };

  const handleRemoveFilter = (filterType) => {
    handleFilterChange(filterType, '');
  };

  const handleResetFilters = () => {
    setSelectedFilters(EMPTY_FILTER);
    Object.entries(EMPTY_FILTER).forEach(([key, value]) => {
      onFilterChange(key, value);
    });
  };

  const handleRefreshFilters = async () => {
    setIsRefreshing(true);
    await fetchFilterOptions(false);
  };

  const handleApplyFilters = () => {
    Object.entries(selectedFilters).forEach(([key, value]) => {
      onFilterChange(key, value);
    });
  };

  const hasActiveFilters = Object.values(selectedFilters).some(value => value !== '');

  const FilterSelect = ({ 
    label, 
    options, 
    value, 
    onChange, 
    placeholder 
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-white">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={isLoading}
        className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      >
        <option value="">{placeholder || `All ${label}s`}</option>
        {options.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <Card className={className}>
      <CardContent>
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-white" />
            <h3 className="text-lg font-medium text-white">Filters</h3>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleRefreshFilters}
              disabled={isLoading || isRefreshing}
              className="flex items-center px-3 py-1.5 text-sm bg-slate-700 text-white rounded hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                disabled={isLoading}
                className="flex items-center px-3 py-1.5 text-sm bg-slate-700 text-white rounded hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Clear
              </button>
            )}
            <button
              onClick={onExport}
              disabled={isLoading}
              className="flex items-center px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        <ActiveFilters 
          filters={selectedFilters} 
          onRemoveFilter={handleRemoveFilter}
        />

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded text-red-400">
            {error}
          </div>
        )}

        {/* Filter Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <FilterSelect
            label="Growthbacker"
            options={filterOptions.growthbackers}
            value={selectedFilters.growthbacker}
            onChange={(value) => handleFilterChange('growthbacker', value)}
            placeholder="Select Growthbacker"
          />
          
          <FilterSelect
            label="Franchise"
            options={filterOptions.franchises}
            value={selectedFilters.franchise}
            onChange={(value) => handleFilterChange('franchise', value)}
            placeholder="Select Franchise"
          />
          
          <FilterSelect
            label="Source"
            options={filterOptions.sources}
            value={selectedFilters.source}
            onChange={(value) => handleFilterChange('source', value)}
            placeholder="Select Source"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              disabled={isLoading}
              className="px-4 py-2 text-white bg-slate-700 rounded hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset Filters
            </button>
          )}
          <button
            onClick={handleApplyFilters}
            disabled={isLoading}
            className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply Filters
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterPanel;