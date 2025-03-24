import React, { useState } from 'react';
import { Box, Typography, useTheme, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register the components needed for Doughnut chart
ChartJS.register(ArcElement, Tooltip, Legend);

const NumbersPerCategory = () => {
  const theme = useTheme();

  const currentYear = new Date().getFullYear();


  const dataByYear = {
    2021: [200, 3, 2, 25, 300, 7, 28, 5],
    2022: [250, 1, 3, 20, 280, 6, 30, 7],
    2023: [220, 2, 1, 18, 290, 8, 32, 9],
    2024: [235, 3, 4, 18, 310, 9, 57, 10], // Current year's dummy data
    // Add more years and data as needed
  };


  // Initial data for the chart
  const initialData = [241, 1, 1, 23, 283, 8, 31, 8];

  // State to track the total
  const [total, setTotal] = useState(initialData.reduce((acc, curr) => acc + curr, 0));

  const [selectedYear, setSelectedYear] = useState(currentYear.toString());

  const [chartData, setChartData] = useState({
    labels: [
      'Active',
      'Active (Winback)',
      'Active but Awaiting Replacement',
      'Awaiting Replacement',
      'Cancelled',
      'Dormant',
      'On Hold',
      'Suspended'
    ],
    datasets: [
      {
        label: `Numbers per Category for ${selectedYear}`,
        data: dataByYear[selectedYear],
        backgroundColor: [
          theme.palette.success.main,
          theme.palette.success.dark,
          theme.palette.success.light,
          theme.palette.info.main,
          theme.palette.error.main,
          theme.palette.grey[400],
          theme.palette.warning.main,
          theme.palette.secondary.main,
        ],
        hoverOffset: 4
      },
    ],
  });

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
    setChartData({
      ...chartData,
      datasets: [
        {
          ...chartData.datasets[0],
          data: dataByYear[event.target.value],
          label: `Numbers per Category for ${event.target.value}`,
        },
      ],
    });
  };

  const totalNumberPlugin = {
    id: 'totalNumber',
    afterDraw(chart) {
      const ctx = chart.ctx;
      const dataset = chart.data.datasets[0];
      const total = dataset.data.reduce((acc, curr) => acc + curr, 0);
      const { centerX, centerY } = chart.innerRadius ? 
          { centerX: (chart.chartArea.left + chart.chartArea.right) / 2, centerY: (chart.chartArea.top + chart.chartArea.bottom) / 2 } :
          { centerX: chart.chartArea.left + (chart.chartArea.right - chart.chartArea.left) / 2, centerY: chart.chartArea.top + (chart.chartArea.bottom - chart.chartArea.top) / 2 };
  
      ctx.save();
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFFFFF';
  
      ctx.fillText(`Total: ${total}`, centerX, centerY);
      ctx.restore();
    }
  };

  const options = {
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'white', // Ensure this is set to white explicitly
          boxWidth: 20,
          padding: 20,
          generateLabels: function(chart) {
            const data = chart.data;
            if (!data || !data.datasets || data.datasets.length === 0) {
              return [];
            }
            const dataset = data.datasets[0];
            return data.labels.map((label, index) => {
              const value = dataset.data[index];
              const color = dataset.backgroundColor[index];
              return {
                text: `${label}: ${value}`,
                fillStyle: color,
                fontColor: 'white',

              };
            });
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((acc, curr) => acc + curr, 0);
            const percentage = ((value / total) * 100).toFixed(2) + '%';
            return label + ': ' + value + ' (' + percentage + ')';
          }
        }
      },
      totalNumberPlugin, // Including the plugin here
    },
    maintainAspectRatio: false,
  };

  return (
    <Box sx={{
      backgroundColor: '#2c3e50',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.5)',
      borderRadius: '4px',
      padding: '1rem',
      color: 'white',
      display: 'flex',
      flexDirection: 'row', // Changed to row to align children horizontally
      alignItems: 'center',
    }}>
      <Box sx={{ minWidth: '150px' }}> {/* Adjust minWidth as needed */}
        <FormControl variant="outlined" sx={{ m: 1, minWidth: 120 }}>
          <InputLabel id="year-select-label">Year</InputLabel>
          <Select
            labelId="year-select-label"
            id="year-select"
            value={selectedYear}
            onChange={handleYearChange}
            label="Year"
          >
            {Object.keys(dataByYear).map(year => (
              <MenuItem key={year} value={year}>{year}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box sx={{
        height: '400px',
        width: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Numbers per Category for {selectedYear}
        </Typography>
        <Doughnut data={chartData} options={options} plugins={[totalNumberPlugin]} />
      </Box>
    </Box>
  );
};

export default NumbersPerCategory;