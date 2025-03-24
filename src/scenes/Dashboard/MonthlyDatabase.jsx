import React, { useState, useMemo, useEffect } from 'react';
import { Box, Typography, useTheme,Modal } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// ChartJS registration
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MonthlyDatabase = () => {
  const theme = useTheme();
  const [dateRange, setDateRange] = useState([new Date(new Date().getFullYear(), 0), new Date()]);
  const [startDate, endDate] = dateRange;
  const [datePickerKey, setDatePickerKey] = useState("start"); // to reset the picker

  const [datePickerMessage, setDatePickerMessage] = useState("Choose a start date");
  const [popperPlacement, setPopperPlacement] = useState('bottom-start');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isSelectingStartDate, setIsSelectingStartDate] = useState(true);

  const handleDatePickerVisibility = (isOpen) => {
    setIsDatePickerOpen(isOpen);
    setIsSelectingStartDate(!dateRange[0] || !!dateRange[1]); // Determine which date is being selected
  };

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    outline: 'none' // Remove default focus outline
  };



  useEffect(() => {
    if (startDate && !endDate) {
      setDatePickerMessage("Choose an end date");
    } else {
      setDatePickerMessage("Choose a start date");
    }
    setPopperPlacement('bottom-start');

  }, [startDate, endDate]);

  // Handle date range change
  const handleDateChange = (dates) => {
    setDateRange(dates);
    if (dates[0] && !dates[1]) {
      // Start date selected, waiting for end date
      setDatePickerMessage("Choose an end date");
    } else {
      // Both dates selected or start date reset
      setDatePickerMessage("Choose a start date");
      setDatePickerKey(prevKey => prevKey === "start" ? "end" : "start"); // reset the picker to close it
    }
  };


  const dummyData = useMemo(() => {
    const leadsPerMonth = new Array(12).fill(0).map(() => Math.floor(Math.random() * (500 / 12) + 40));
    const signUpsPerMonth = new Array(12).fill(0).map(() => Math.floor(Math.random() * (54 / 12) + 4));
    return { leadsPerMonth, signUpsPerMonth };
  }, []);

  const filteredData = useMemo(() => {
    // If either startDate or endDate is null, return an empty structure
    if (!startDate || !endDate) {
      return {
        labels: [],
        leads: [],
        signUps: [],
      };
    }

    const monthFrom = startDate.getMonth();
    const monthTo = endDate.getMonth();
    const leads = dummyData.leadsPerMonth.slice(monthFrom, monthTo + 1);
    const signUps = dummyData.signUpsPerMonth.slice(monthFrom, monthTo + 1);
    const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].slice(monthFrom, monthTo + 1);

    return { labels, leads, signUps };
  }, [startDate, endDate, dummyData]);

  const data = {
    labels: filteredData.labels,
    datasets: [
      {
        label: 'Leads',
        data: filteredData.leads,
        backgroundColor: '#616675',
        borderColor: 'white', // Set the border color to white
        borderWidth: 2, // Set the border width
      },
      {
        label: 'Sign Ups',
        data: filteredData.signUps,
        backgroundColor: theme.palette.secondary.light,
        borderColor: 'white', // Set the border color to white
        borderWidth: 2, // Set the border width
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: 'white',
        },
        grid: {
          color: 'white',
        },
      },
      x: {
        ticks: {
          color: 'white',
        },
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: theme.palette.text.primary,
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
  };

  return (
    <Box sx={{
      height: '500px',
      width: '100%',
      position: 'relative',
      backgroundColor: '#2c3e50', // Dark background for the chart area
      border: '1px solid rgba(255, 255, 255, 0.3)', // Optional border
      boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.5)', // Optional shadow for depth
      borderRadius: '4px', // Optional rounded corners
      padding: '1rem', // Space around the chart
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white', // Text color
      mt: 2, // Add some margin top
    }}>
    <Typography variant="h6">
      Monthly Database
    </Typography>
    <Typography variant="subtitle1">
      {datePickerMessage}
    </Typography>
    <ReactDatePicker
      selectsRange={true}
      startDate={startDate}
      endDate={endDate}
      onChange={handleDateChange}
      isClearable={true}
      showMonthDropdown={true}
      showYearDropdown={true}
      dropdownMode="select"
      withPortal
      popperPlacement={popperPlacement}
      popperModifiers={[
        {
          name: 'offset',
          options: {
            offset: [0, 10], // can be adjusted to ensure visibility
          },
        },
        {
          name: 'preventOverflow',
          options: {
            rootBoundary: 'viewport', // can be 'document' or 'viewport'
          },
        },
      ]}
      key={datePickerKey}
    />
      <Box sx={{ height: '100%', width: '100%' }}>
        <Bar data={data} options={options} />
      </Box>
      <Modal
        open={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        aria-labelledby="date-selection-title"
        aria-describedby="date-selection-description"
      >
        <Box sx={modalStyle}>
          <Typography id="date-selection-title" variant="h6">
            {isSelectingStartDate ? "Choose a start date" : "Choose an end date"}
          </Typography>
          <Typography id="date-selection-description" sx={{ mt: 2 }}>
            {isSelectingStartDate ? "Please select the first date of your range." : "Now select the last date of your range."}
          </Typography>
        </Box>
      </Modal>
    </Box>
  );
};

export default MonthlyDatabase;
