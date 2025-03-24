import React, { useState } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HC_funnel from 'highcharts/modules/funnel';


// Initialize the funnel module
HC_funnel(Highcharts);

const FunnelChart = () => {
  const currentYear = new Date().getFullYear().toString();
  const [year, setYear] = useState(currentYear);

  const colors = ['#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F'];

  const dummyData = {
    '2020': [
      { name: "Key Target Demographics", value: 90 },
      { name: "Knows Cyberbacker", value: 854 },
      { name: "Lead", value: 185 },
      { name: "Appointment Set", value: 168 },
      { name: "Appointment Kept", value: 214 },
    ],
    '2021': [
      { name: "Key Target Demographics", value: 130 },
      { name: "Knows Cyberbacker", value: 758 },
      { name: "Lead", value: 158 },
      { name: "Appointment Set", value: 147 },
      { name: "Appointment Kept", value: 144 },
    ],
    '2022': [
      { name: "Key Target Demographics", value: 158 },
      { name: "Knows Cyberbacker", value: 687 },
      { name: "Lead", value: 80 },
      { name: "Appointment Set", value: 187 },
      { name: "Appointment Kept", value: 201 },
    ],
    '2023': [
      { name: "Key Target Demographics", value: 120 },
      { name: "Knows Cyberbacker", value: 300 },
      { name: "Lead", value: 200 },
      { name: "Appointment Set", value: 150 },
      { name: "Appointment Kept", value: 100 },
    ],
    '2024': [
      { name: "Key Target Demographics", value: 110 },
      { name: "Knows Cyberbacker", value: 974 },
      { name: "Lead", value: 101 },
      { name: "Appointment Set", value: 139 },
      { name: "Appointment Kept", value: 188 },
    ],
  };

  const funnelData = dummyData[year].map((item, index) => ({
    name: item.name,
    y: item.value,
    color: colors[index % colors.length] // Use Highcharts' color scheme
  }));

 const options = {
  chart: {
    type: 'funnel',
    backgroundColor: '#2c3e50', // Set to a dark blue, or any color you prefer
    plotBackgroundColor: null,
    plotBorderWidth: 0,
    plotShadow: false,
    style: {
      fontFamily: 'Arial, sans-serif' // Consider a clean, professional font
    }
  },
  title: {
    text: year === currentYear ? 'Current Year Sales Funnel' : `Sales Funnel for ${year}`,
    style: {
      color: '#ffffff', // Make sure the title is visible on the background
    }
  },
  plotOptions: {
    series: {
      dataLabels: {
        enabled: true,
        format: '<b>{point.name}</b>: {point.y}',
        color: '#ffffff', // White or a color that stands out against the background
        softConnector: true,
        inside: true, // Put labels inside the chart
        style: {
          textOutline: false, // Might want to remove the outline for a cleaner look
          fontWeight: 'normal',
          fontSize: '15px'  // Regular font weight for a professional appearance
        }
      },
      neckWidth: '30%',
      neckHeight: '25%',
      width: '70%', // Adjust width and height to fit the container
      height: '80%'
    }
  },
  series: [{
    name: 'Clients',
    data: funnelData
  }],
  credits: {
    enabled: false // Disable the Highcharts credits if the license allows
  },
  responsive: {
    rules: [{
      condition: {
        maxWidth: 500
      },
      chartOptions: {
        plotOptions: {
          series: {
            dataLabels: {
              style: {
                color: '#fffffff' // Ensure visibility on smaller screens
              }
            }
          }
        }
      }
    }]
  }
};

return (
  <Box sx={{ 
    height: '495px', 
    width: '100%', 
    position: 'relative', 
    backgroundColor: '#2c3e50', // Dark background for the chart area
    border: '1px solid rgba(255, 255, 255, 0.3)', // Optional border
    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.5)', // Optional shadow for depth
    borderRadius: '4px', // Optional rounded corners
    padding: '1rem', // Space around the chart
}}>
      <FormControl fullWidth margin="normal">
        <InputLabel id="year-select-label">Select Year</InputLabel>
        <Select
          labelId="year-select-label"
          id="year-select"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          label="Select Year"
        >
          {Object.keys(dummyData).map((yearOption) => (
            <MenuItem key={yearOption} value={yearOption}>{yearOption}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Render HighchartsReact component */}
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
      />
    </Box>
  );
};

export default FunnelChart;