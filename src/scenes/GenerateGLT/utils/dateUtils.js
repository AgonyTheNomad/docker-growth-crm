import { 
  format, 
  startOfYear, 
  startOfMonth, 
  startOfWeek, 
  endOfDay, 
  subDays 
} from 'date-fns';

// Basic utility functions with error handling
export const formatDateForAPI = (date) => {
  try {
    if (!date) return '';
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    return format(dateObj, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Error formatting date for API:', error);
    return '';
  }
};

export const formatDateForDisplay = (dateString) => {
  try {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    if (isNaN(date.getTime())) return '';
    return format(date, 'MMM dd, yyyy');
  } catch (error) {
    console.error('Error formatting date for display:', error);
    return dateString || '';
  }
};

// Date range getters with error handling
export const getTodayRange = () => {
  try {
    const today = new Date();
    const todayEnd = endOfDay(today);
    
    return {
      start: formatDateForAPI(today),
      end: formatDateForAPI(todayEnd)
    };
  } catch (error) {
    console.error('Error getting today range:', error);
    const today = new Date();
    return {
      start: today.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0]
    };
  }
};

export const getWeekToDateRange = () => {
  try {
    const today = new Date();
    const monday = startOfWeek(today, { weekStartsOn: 1 });
    
    return {
      start: formatDateForAPI(monday),
      end: formatDateForAPI(today)
    };
  } catch (error) {
    console.error('Error getting week range:', error);
    return getTodayRange();
  }
};

export const getMonthToDateRange = () => {
  try {
    const today = new Date();
    const monthStart = startOfMonth(today);
    
    return {
      start: formatDateForAPI(monthStart),
      end: formatDateForAPI(today)
    };
  } catch (error) {
    console.error('Error getting month range:', error);
    return getTodayRange();
  }
};

export const getYearToDateRange = () => {
  try {
    const today = new Date();
    const yearStart = startOfYear(today);
    
    return {
      start: formatDateForAPI(yearStart),
      end: formatDateForAPI(today)
    };
  } catch (error) {
    console.error('Error getting year range:', error);
    const today = new Date();
    return {
      start: `${today.getFullYear()}-01-01`,
      end: today.toISOString().split('T')[0]
    };
  }
};

export const getLastNDaysRange = (days) => {
  try {
    const today = new Date();
    const startDate = subDays(today, days || 0);
    
    return {
      start: formatDateForAPI(startDate),
      end: formatDateForAPI(today)
    };
  } catch (error) {
    console.error('Error getting last N days range:', error);
    return getTodayRange();
  }
};

// Validation functions
export const isValidDateRange = (startDate, endDate) => {
  try {
    if (!startDate || !endDate) return false;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;
    
    return start <= end;
  } catch (error) {
    console.error('Error validating date range:', error);
    return false;
  }
};

export const getFormattedDateRange = (startDate, endDate) => {
  try {
    if (!startDate || !endDate) return '';
    if (!isValidDateRange(startDate, endDate)) return '';
    
    return `${formatDateForDisplay(startDate)} to ${formatDateForDisplay(endDate)}`;
  } catch (error) {
    console.error('Error formatting date range:', error);
    return '';
  }
};

// Preset ranges definition
export const presetRanges = [
  {
    label: 'Today',
    getValue: getTodayRange
  },
  {
    label: 'Week to Date',
    getValue: getWeekToDateRange
  },
  {
    label: 'Month to Date',
    getValue: getMonthToDateRange
  },
  {
    label: 'Year to Date',
    getValue: getYearToDateRange
  }
];