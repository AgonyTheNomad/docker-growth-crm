// Metric groupings and transformations
export const groupMetrics = (data) => {
    if (!data?.growth_metrics) return null;
  
    return {
      currentStatus: {
        "Currently Paired Clients": data.growth_metrics["Currently Paired Clients"],
        "Currently Paired w/ Awaiting": data.growth_metrics["Currently Paired Clients w/ Awaiting Replacement"],
        "TOTAL Paying MSF": data.growth_metrics["TOTAL no. of Clients Paying MSF"],
      },
      clientCategories: {
        "Training Clients": data.growth_metrics["Clients w/ CBs on Training"],
        "Trade Clients": data.growth_metrics["Trade Clients"],
        "Maps Credit": data.growth_metrics["Maps Credit Clients"],
        "TOTAL Matched": data.growth_metrics["TOTAL Matched Clients"],
      },
      clientBreakdown: {
        "MAPS": data.growth_metrics["MAPS Clients"],
        "KW": data.growth_metrics["KW Clients"],
        "Others": data.growth_metrics["Other Clients"],
      },
      pendingStatus: {
        "On Hold": data.growth_metrics["Clients on Hold"],
        "Suspended": data.growth_metrics["Suspended Clients"],
        "Pending Hold": data.growth_metrics["Pending On Hold"],
        "Pending Cancel": data.growth_metrics["Pending Cancellation"],
      },
      additionalMetrics: {
        "Clients for Matching": data.growth_metrics["Clients for Matching"],
        "Clients Waiting (1st Cyberbacker)": data.growth_metrics["Clients Waiting (1st Cyberbacker)"],
        "With One Sheet": data.growth_metrics["Clients With One Sheet (w/ OS)"],
        "Without One Sheet": data.growth_metrics["Clients Without One Sheet (w/o OS)"],
      },
      totals: {
        "Total Clients": data.growth_metrics["TOTAL no. of Clients"],
        "Revenue Clients": data.growth_metrics["Total Revenue Clients"],
      },
    };
  };
  
  // Section definitions for the dashboard
  export const sectionDefinitions = {
    currentStatus: {
      title: "Current Status",
      description: "Current active client metrics"
    },
    clientCategories: {
      title: "Client Categories",
      description: "Breakdown by client type"
    },
    clientBreakdown: {
      title: "Client Breakdown",
      description: "Distribution across different platforms"
    },
    pendingStatus: {
      title: "Pending Status",
      description: "Clients in transition states"
    },
    additionalMetrics: {
      title: "Additional Metrics",
      description: "Other important metrics"
    },
    totals: {
      title: "Total Metrics",
      description: "Overall totals and summaries"
    }
  };
  
  // Format metric values for display
  export const formatMetricValue = (value) => {
    if (typeof value !== 'number') return value;
    return value.toLocaleString();
  };
  
  // Track which metrics should show as percentages
  export const percentageMetrics = [
    "Growth Rate",
    "Retention Rate",
    "Conversion Rate"
  ];
  
  // Format percentage values
  export const formatPercentage = (value) => {
    if (typeof value !== 'number') return value;
    return `${value.toFixed(1)}%`;
  };
  
  // Calculate derived metrics
  export const calculateDerivedMetrics = (metrics) => {
    if (!metrics) return {};
    
    const derived = {};
    
    // Growth Rate calculation
    if (metrics["TOTAL no. of Clients"]) {
      derived.growthRate = ((metrics["TOTAL no. of Clients"] - metrics["Previous Total Clients"]) / 
                           metrics["Previous Total Clients"]) * 100;
    }
    
    // Other derived calculations can be added here
    
    return derived;
  };
  
  // Status metrics processing
  export const processStatusMetrics = (statusMetrics, period = "Month") => {
    if (!statusMetrics?.[period]) return [];
    
    return statusMetrics[period]
      .sort((a, b) => b.count - a.count)
      .map(item => ({
        ...item,
        formattedCount: formatMetricValue(item.count)
      }));
  };
  
  // Filter metrics based on search/filter criteria
  export const filterMetrics = (metrics, filters) => {
    if (!metrics) return null;
    
    // Deep clone the metrics object to avoid mutations
    const filteredMetrics = JSON.parse(JSON.stringify(metrics));
    
    // Apply filters here based on your requirements
    
    return filteredMetrics;
  };
  
  // Get metric difference (for showing trends)
  export const getMetricDifference = (current, previous) => {
    if (typeof current !== 'number' || typeof previous !== 'number') return null;
    
    const difference = current - previous;
    const percentageChange = ((difference / previous) * 100).toFixed(1);
    
    return {
      difference,
      percentageChange,
      increased: difference > 0
    };
  };
  
  // Constants for metric categories
  export const metricCategories = {
    ACTIVE: ["Active", "Active (Winback)", "Active (NR - 6months)"],
    AWAITING: ["Active but Awaiting Replacement"],
    PENDING: ["Pending On Hold", "Pending Cancellation"],
    ON_HOLD: ["On Hold"],
    SUSPENDED: ["Suspended"],
  };
  
  // Get section color based on metric type
  export const getSectionColor = (metricName) => {
    const colorMap = {
      positive: "text-green-500",
      negative: "text-red-500",
      neutral: "text-gray-500",
      warning: "text-yellow-500"
    };
  
    // Add your logic to determine which color to return
    return colorMap.neutral;
  };
  
  // Export common metric calculations
  export const calculations = {
    totalActiveClients: (metrics) => {
      return metrics.currentStatus?.["Currently Paired Clients"] || 0;
    },
    
    totalRevenue: (metrics) => {
      return metrics.totals?.["Revenue Clients"] || 0;
    },
    
    activePercentage: (metrics) => {
      const total = metrics.totals?.["Total Clients"] || 0;
      const active = metrics.currentStatus?.["Currently Paired Clients"] || 0;
      return total ? (active / total * 100).toFixed(1) : 0;
    }
  };