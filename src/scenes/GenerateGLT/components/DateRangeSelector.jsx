import React, { useState, useEffect } from "react";
import { 
  presetRanges, 
  formatDateForAPI, 
  formatDateForDisplay,
  getYearToDateRange
} from "../utils/dateUtils";

export const DateRangeSelector = ({ onDateRangeChange, initialDateRange = null }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (initialDateRange) {
      setStartDate(initialDateRange.startDate);
      setEndDate(initialDateRange.endDate);
    } else {
      const { start, end } = getYearToDateRange();
      setStartDate(start);
      setEndDate(end);
      onDateRangeChange(start, end);
    }
  }, [initialDateRange, onDateRangeChange]);

  const handlePresetClick = (preset) => {
    const { start, end } = preset.getValue();
    setStartDate(start);
    setEndDate(end);
    onDateRangeChange(start, end);
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    const oldStartDate = startDate;
    const oldEndDate = endDate;

    if (name === 'startDate') {
      setStartDate(value);
      // Only trigger if we had a value before and we have an end date
      if (oldStartDate && endDate && value) {
        onDateRangeChange(value, endDate);
      }
    } else {
      setEndDate(value);
      // Only trigger if we had a value before and we have a start date
      if (oldEndDate && startDate && value) {
        onDateRangeChange(startDate, value);
      }
    }
  };

  return (
    <div className="mb-6 p-4 bg-slate-800 rounded-lg shadow">
      <div className="flex flex-wrap gap-4">
        {/* Date Input Section */}
        <div className="flex gap-4">
          <div className="flex flex-col">
            <label className="text-sm text-gray-400 mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={startDate}
              onChange={handleDateChange}
              className="border bg-slate-700 border-slate-600 rounded px-2 py-1 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-gray-400 mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              value={endDate}
              onChange={handleDateChange}
              min={startDate}
              className="border bg-slate-700 border-slate-600 rounded px-2 py-1 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Preset Buttons Section */}
        <div className="flex items-end gap-2">
          {presetRanges.map((preset, index) => (
            <button
              key={index}
              onClick={() => handlePresetClick(preset)}
              className="px-3 py-1 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors duration-150"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Display Selected Range */}
      {startDate && endDate && (
        <div className="mt-2 text-sm text-gray-400">
          Selected Range: {formatDateForDisplay(startDate)} to {formatDateForDisplay(endDate)}
        </div>
      )}
    </div>
  );
};

export default DateRangeSelector;