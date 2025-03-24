import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField } from '@mui/material';
import moment from 'moment'; // Ensure moment is installed

const TotalSignup = () => {
  const [startDate, setStartDate] = useState(moment().startOf('week').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(moment().endOf('week').format('YYYY-MM-DD'));
  const [signups, setSignups] = useState(0);

  useEffect(() => {
    fetchSignupsData(startDate, endDate);
  }, [startDate, endDate]);

  const fetchSignupsData = (start, end) => {
    // Calculate the number of weeks between the start and end dates
    const startMoment = moment(start);
    const endMoment = moment(end);
    const weeksBetween = endMoment.diff(startMoment, 'weeks') + 1; // +1 to include the current week

    // For a full year, we expect 2964 signups (52 * 57)
    const expectedSignupsForFullYear = 1.095 * 57;

    // Calculate the expected number of signups for the time span
    let expectedSignups = weeksBetween;

    // If the selected range is a full year or more, set the expected signups to the yearly maximum
    if (weeksBetween >= 52) {
      expectedSignups = expectedSignupsForFullYear;
    } else {
      // Adjust signups for partial weeks to maintain the average
      expectedSignups = Math.min(expectedSignups, expectedSignupsForFullYear);
    }

    // Ensure the number is rounded and not less than 0
    expectedSignups = Math.max(Math.round(expectedSignups), 0);

    setSignups(expectedSignups);
  };

  return (
    <Box sx={{ 
      mt: '10rem', 
      height: '400px', 
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
      '& .MuiTextField-root': { my: 2, width: '90%' },
      color: 'white' // Text color
    }}>
      <Typography variant="h5" component="h1" gutterBottom sx={{ color: 'white' }}>
        {startDate === moment().startOf('week').format('YYYY-MM-DD') ?
          `Current Week's Signups` :
          `Signups from ${startDate} to ${endDate}`
        }
      </Typography>
      <Typography variant="h3" component="p" sx={{ mb: 3, fontWeight: 'bold', color: 'white' }}>
        {signups}
      </Typography>
      <TextField
        label="Start Date"
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        InputLabelProps={{ shrink: true }}
        sx={{ input: { color: 'white' } }}
      />
      <TextField
        label="End Date"
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        InputLabelProps={{ shrink: true }}
        sx={{ input: { color: 'white' } }}
      />
    </Box>
  );
};

export default TotalSignup;
