import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Checkbox,
  FormGroup,
  FormControlLabel,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'; // Import the checkmark icon

function PersonalGoals() {
  const [monthGoal, setMonthGoal] = useState('');
  const [weekGoal, setWeekGoal] = useState('');
  const [monthGoalAchieved, setMonthGoalAchieved] = useState(false); // State to track if monthly goal is achieved
  const [weekGoalAchieved, setWeekGoalAchieved] = useState(false); // State to track if weekly goal is achieved
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const [pastGoals, setPastGoals] = useState([
    { month: 'January', year: '2024', goal: '100 Sales', achieved: true },
    { month: 'February', year: '2024', goal: '90 Sales', achieved: false },
    // ... more dummy data
  ]);
  
  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  // Placeholder function for saving goals
  const saveGoals = () => {
    // Logic to save goals would go here
    console.log('Goals saved!');
  };

  return (
    <Box sx={{
      width: '100%',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem', // Adjust as needed
    }}>
      <Box sx={{
        backgroundColor: '#2c3e50',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.5)',
        borderRadius: '4px',
        padding: '1rem',
        color: 'white',
      }}>
        <Typography variant="h5" sx={{ marginBottom: 2 }}>Personal Goals & Commissions</Typography>

        {/* Goal setting section with checkmarks for achievement */}
        <FormGroup row sx={{ marginBottom: 2, justifyContent: 'space-between' }}>
          <TextField
            label="Monthly Goal"
            variant="outlined"
            sx={{ width: 'calc(100% - 100px)', marginRight: '1rem' }} // Adjust width as necessary
            value={monthGoal}
            onChange={(e) => setMonthGoal(e.target.value)}
            InputLabelProps={{
              style: { color: 'white' },
            }}
            InputProps={{
              style: { color: 'white' },
            }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={monthGoalAchieved}
                onChange={(e) => setMonthGoalAchieved(e.target.checked)}
                icon={<CheckCircleOutlineIcon />}
                checkedIcon={<CheckCircleOutlineIcon color="success" />}
              />
            }
            label={monthGoalAchieved ? "Goal Achieved" : "Goal Not Achieved"}
            labelPlacement="top"
          />
        </FormGroup>

        <FormGroup row sx={{ justifyContent: 'space-between' }}>
          <TextField
            label="Weekly Goal"
            variant="outlined"
            sx={{ width: 'calc(100% - 100px)', marginRight: '1rem' }} // Adjust width as necessary
            value={weekGoal}
            onChange={(e) => setWeekGoal(e.target.value)}
            InputLabelProps={{
              style: { color: 'white' },
            }}
            InputProps={{
              style: { color: 'white' },
            }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={weekGoalAchieved}
                onChange={(e) => setWeekGoalAchieved(e.target.checked)}
                icon={<CheckCircleOutlineIcon />}
                checkedIcon={<CheckCircleOutlineIcon color="success" />}
              />
            }
            label={weekGoalAchieved ? "Goal Achieved" : "Goal Not Achieved"}
            labelPlacement="top"
          />
        </FormGroup>

        <Button variant="contained" onClick={saveGoals} sx={{ marginTop: 2, backgroundColor: '#34495e' }}>Save Goals</Button>

        {/* Commission display section */}
        <Typography variant="h6" sx={{ marginBottom: 1, marginTop: 2 }}>Commission</Typography>
        <Typography sx={{ marginBottom: 1 }}>This Month: *******</Typography>
        <Typography sx={{ marginBottom: 1 }}>Total This Year: *******</Typography>
        
        {/* Year selection for past commission */}
        <FormControl fullWidth>
          <InputLabel id="select-year-label" style={{ color: 'white' }}>Select Year</InputLabel>
          <Select
            labelId="select-year-label"
            id="select-year"
            value={selectedYear}
            label="Select Year"
            onChange={handleYearChange}
            MenuProps={{
              style: { color: 'white' }, // If you want to style the dropdown items
            }}
            inputProps={{
              style: { color: 'white' }, // This will style the input select
            }}
          >
            {/* Generate years dynamically or manually */}
            {[...Array(5)].map((_, i) => (
              <MenuItem key={i} value={new Date().getFullYear() - i}>
                {new Date().getFullYear() - i}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography sx={{ marginTop: 2 }}>Total Commission for {selectedYear}: *******</Typography>
      </Box>
      <Box sx={{
        backgroundColor: '#2c3e50',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.5)',
        borderRadius: '4px',
        padding: '1rem',
        color: 'white',
        marginTop: '2rem', // Add top margin to separate from the above content
      }}>
        <Typography variant="h6" sx={{ marginBottom: 2 }}>Past Goals</Typography>
        {pastGoals.map((goal, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.5rem 0',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              '&:last-child': {
                borderBottom: 'none',
              },
            }}
          >
            <Typography>{`${goal.month} ${goal.year}: ${goal.goal}`}</Typography>
            {goal.achieved ? (
              <CheckCircleOutlineIcon color="success" />
            ) : (
              <Typography color="error">Not Achieved</Typography>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default PersonalGoals;