import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import 'chart.js/auto';
import Chart from 'chart.js/auto'; // Import Chart here

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const yearGoal = 50;
const stretchGoal = 72;

const calculateCumulativeTotal = (signups) => {
  const cumulativeTotal = [];
  let sum = 0;
  signups.forEach((signup, index) => {
    sum += signup ?? 0; // Add the signup if it's not null, otherwise add 0
    cumulativeTotal[index] = sum;
  });
  return cumulativeTotal;
};

// Generate dummy data for actual signups through May
let actualSignups = [3, 1, 5, 2, 4]; // Initial signups for Jan, Feb, Mar, Apr, May

actualSignups = calculateCumulativeTotal(actualSignups);
actualSignups = actualSignups.concat(Array(12 - actualSignups.length).fill(null));

const goalSignups = months.map((_, i) => (yearGoal / 12) * (i + 1));
const stretchGoalSignups = months.map((_, i) => (stretchGoal / 12) * (i + 1));

// Function to calculate projected signups
const calculateProjectedSignups = (actualSignups) => {
  return months.map((_, i) => {
    if (i <= 4) return null; // No projection for months up to and including May
    return Math.round(((actualSignups[4] / 5) * (i + 1)));
  });
};

const initialProjectedSignups = calculateProjectedSignups(actualSignups);

const datasets = [
  {
    label: 'Actuals',
    data: actualSignups,
    borderColor: 'blue',
    color: 'white', // White text for the label
    backgroundColor: 'rgba(135, 206, 235, 0.2)',
  },
  {
    label: 'Projected',
    data: initialProjectedSignups,
    borderColor: 'blue',
    color: 'white',
    borderDash: [5, 5],
  },
  {
    label: 'Yearly Goal Path',
    data: goalSignups,
    color: 'white',
    borderColor: 'green',
  },
  {
    label: 'Stretch Goal Path',
    data: stretchGoalSignups,
    color: 'white',
    borderColor: 'yellow',
  },
];

// Initial chart options
const options = {
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        color: '#fff', // White text for ticks
      },
      title: {
        display: true,
        text: 'Total Signups',
        color: '#fff', // White text for the title
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
    x: {
      ticks: {
        color: '#fff', // White text for ticks
      },
      title: {
        display: true,
        text: 'Month',
        color: '#fff', // White text for the title
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
  },
  plugins: {
    legend: {
      labels: {
        color: '#fff', // White text for the legend labels
        font: {
          size: 14,
          weight: 'normal',
        },
      },
    },
    tooltip: {
      titleFont: {
        size: 16,
        weight: 'bold',
        color: '#fff', // White text for the tooltip title
      },
      bodyFont: {
        size: 14,
        color: '#fff', // White text for the tooltip body
      },
      callbacks: {
        labelColor: function (context) {
          return {
            borderColor: 'white',
            backgroundColor: 'white',
          };
        },
        labelTextColor: function () {
          return '#fff';
        },
      },
    },
  },
  elements: {
    line: {
      borderColor: '#fff', // White lines for datasets
    },
    point: {
      backgroundColor: '#fff', // White points for datasets
    },
  },
  // ...rest of the options
};

const SignupGoalGraph = () => {
  const currentMonthIndex = new Date().getMonth();
  const [selectedOption, setSelectedOption] = useState('signups');
  const [chartData, setChartData] = useState({ labels: months, datasets });
  const [baseSignupsData, setBaseSignupsData] = useState([...actualSignups]); // Assuming actualSignups is your original data

  // Dummy conversion rates for other metrics based on 'signups'
  const conversionRates = {
    keyTargetDemographics: 6391 / 20,
    knowsCyberbacker: 710 / 20,
    leads: 260 / 20,
    appointmentSet: 114 / 20,
    appointmentKept: 51 / 20,
    signups: 1,
  };

  // Function to calculate the total signups
  const calculateTotalSignups = (data) => data.reduce((sum, value) => sum + (value || 0), 0);
  const initialTotalSignups = calculateTotalSignups(actualSignups);

  const [totalSignups, setTotalSignups] = useState(initialTotalSignups);
  const [sideBarContent, setSideBarContent] = useState({
    currentActuals: initialTotalSignups,
    // other initial states
  });

  // Initialize the sideBarContent once at the component mount
  useEffect(() => {
    updateSidebarContent('signups');
  }, []);

  const handleSelectChange = (event) => {
    const newMetric = event.target.value;
    setSelectedOption(newMetric);

    // Find the conversion rate for the new metric
    const rate = conversionRates[newMetric];

    // Apply the conversion rate to the base data to calculate new values for actual signups
    const convertedData = baseSignupsData.map(value => value !== null ? Math.round(value * rate) : null);

    // Recalculate yearly goal and stretch goal paths based on the selected metric
    const recalculatedGoalSignups = goalSignups.map((value, index) => Math.round((yearGoal * rate) / 12 * (index + 1)));
    const recalculatedStretchGoalSignups = stretchGoalSignups.map((value, index) => Math.round((stretchGoal * rate) / 12 * (index + 1)));
    const recalculatedProjectedSignups = calculateProjectedSignups(convertedData);

    // Update the datasets with the newly converted data and goals
    const newData = datasets.map((dataset, index) => {
      if (dataset.label === 'Actuals') {
        return { ...dataset, data: convertedData };
      } else if (dataset.label === 'Projected') {
        return { ...dataset, data: recalculatedProjectedSignups };
      } else if (dataset.label === 'Yearly Goal Path') {
        return { ...dataset, data: recalculatedGoalSignups };
      } else if (dataset.label === 'Stretch Goal Path') {
        return { ...dataset, data: recalculatedStretchGoalSignups };
      }
      return dataset;
    });

    setChartData({ labels: months, datasets: newData });

    // Update the sidebar content with the new metric's data
    updateSidebarContent(newMetric);
  };

  const updateSidebarContent = (metric) => {
    const rate = conversionRates[metric];
    // Convert the total signups to the metric's equivalent, ensuring whole numbers.
    const convertedTotalSignups = Math.round(totalSignups * rate);

    // Convert the yearly and stretch goals to the metric's equivalent, ensuring whole numbers.
    const convertedYearGoal = Math.round(yearGoal * rate);
    const convertedStretchGoal = Math.round(stretchGoal * rate);

    const monthsRemaining = 12 - currentMonthIndex;

    // Calculate the monthly requirements for each goal, rounding to whole numbers.
    const signupsNeededPerMonthForGoal = monthsRemaining > 0 ? Math.round((convertedYearGoal - convertedTotalSignups) / monthsRemaining) : 0;
    const signupsNeededPerMonthForStretch = monthsRemaining > 0 ? Math.round((convertedStretchGoal - convertedTotalSignups) / monthsRemaining) : 0;

    // Set the sidebar content, dynamically updating the label to include the total count.
    setSideBarContent({
      // Here we format the label to include the metric name and its total count.
      label: `Total ${metric.charAt(0).toUpperCase() + metric.slice(1)}: ${convertedTotalSignups}`,
      currentActuals: convertedTotalSignups,
      monthlyGoal: signupsNeededPerMonthForGoal,
      monthlyStretch: signupsNeededPerMonthForStretch,
    });
  };

  function formatLabel(metric) {
    return metric
      .split(/(?=[A-Z])/) // Split on uppercase letters
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter of each word
      .join(' '); // Join with spaces
  }

  const getChartOptions = () => {
    return {
      ...options,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Total Signups',
            color: 'white', // Set the color of the y-axis title to white
            font: {
              size: 16,
              weight: 'bold',
            },
          },
          ticks: {
            color: 'white', // Set the color of the y-axis ticks to white
          },
        },
        x: {
          title: {
            display: true,
            text: 'Month',
            color: 'white', // Set the color of the x-axis title to white
            font: {
              size: 16,
              weight: 'bold',
            },
          },
          ticks: {
            color: 'white', // Set the color of the x-axis ticks to white
          },
        },
      },
      plugins: {
        legend: {
          labels: {
            color: 'white', // Set the color of the legend text to white
            generateLabels: (chart) => {
              const originalLabels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
              return originalLabels.map(label => {
                if (label.text === 'Actuals') {
                  // Check for 'currentActuals' in 'sideBarContent' and provide a default value
                  const totalSignupsText = sideBarContent.currentActuals !== undefined
                    ? `Total Signups: ${sideBarContent.currentActuals}`
                    : 'Total Signups: 0';
                  return { ...label, text: totalSignupsText };
                }
                return { ...label, text: label.text };
              });
            },
          },
        },
        tooltip: {
          // Define tooltip styles if necessary
        },
        // Define any other necessary plugin options
      },
      // Define any other necessary chart options
    };
  };

  return (
    <Box sx={{
      height: '500px',
      width: '100%',
      position: 'relative',
      backgroundColor: '#2c3e50',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.5)',
      borderRadius: '4px',
      padding: '1rem',
    }}>
      <FormControl fullWidth>
        <InputLabel id="select-metric-label">Metric</InputLabel>
        <Select
          labelId="select-metric-label"
          id="select-metric"
          value={selectedOption}
          label="Metric"
          onChange={handleSelectChange}
        >
          <MenuItem value="signups">Signups</MenuItem>
          <MenuItem value="keyTargetDemographics">Key Target Demographics</MenuItem>
          <MenuItem value="knowsCyberbacker">Knows Cyberbacker</MenuItem>
          <MenuItem value="leads">Leads</MenuItem>
          <MenuItem value="appointmentSet">Appointment Set</MenuItem>
          <MenuItem value="appointmentKept">Appointment Kept</MenuItem>
        </Select>
      </FormControl>
      <Box sx={{
        height: '400px',
        width: '100%',
        marginTop: '1rem',
      }}>
        <Line data={chartData} options={getChartOptions()} />
        <Box sx={{
          mt: '7rem', // Margin top for spacing from the chart
          p: 2, // Padding inside the box
          backgroundColor: '#2c3e50', // Semi-transparent for a frosted glass effect
          backdropFilter: 'blur(3px)', // Ensure it's not too strong to keep text readable
          color: '#fff', // White text for readability on a dark theme
          textAlign: 'left', // Align text to the left
          borderRadius: '4px', // Rounded corners for aesthetic consistency
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)', // More pronounced shadow for depth
          border: '1px solid rgba(255, 255, 255, 0.3)', // Border to enhance the frosted glass effect
          display: 'flex', // Use flexbox for layout
          flexDirection: 'column', // Stack children vertically
          justifyContent: 'space-around', // Distribute space around items
          minHeight: '150px', // Minimum height to avoid squishing on smaller screens
          '& p': { // Apply styles to all paragraphs inside
            margin: '0.5rem 0', // Margin for top and bottom of each paragraph
            fontWeight: 'normal', // Normal font weight
          },
          '& p:first-of-type': { // Specifically target the first paragraph
            fontWeight: 'bold', // Make it bold
            fontSize: '1.2rem', // Increase the font size
          }
        }}>
          <p>{`Current ${formatLabel(selectedOption)}: ${sideBarContent.currentActuals}`}</p>
          <p>Needed per month to meet Yearly Goal: {sideBarContent.monthlyGoal}</p>
          <p>Needed per month to meet Stretch Goal: {sideBarContent.monthlyStretch}</p>
        </Box>
      </Box>
    </Box>
  );
};

export default SignupGoalGraph;
