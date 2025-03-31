import React from 'react';
import { 
  Paper, 
  Box, 
  Typography, 
  Button,
  Tooltip
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const HeaderContainer = ({ totalClients, statuses = [] }) => {
  // Calculate grand total from all status denominators
  const grandTotal = statuses.reduce((total, status) => total + (status.total || 0), 0);
  
  // Find Active and Awaiting Replacement status data
  const activeStatus = statuses.find(status => status.name === "Active");
  const awaitingStatus = statuses.find(status => status.name === "Awaiting Replacement");
  
  // Get total counts or default to 0 if not found
  const activeTotal = activeStatus ? activeStatus.total : 0;
  const awaitingTotal = awaitingStatus ? awaitingStatus.total : 0;

  return (
    <Paper elevation={2} sx={{ mb: 2, p: 2, backgroundColor: '#1e293b', color: 'white' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Box display="flex" gap={4}>
            {/* Active Clients - green color */}
            <Typography variant="h6" fontWeight="medium">
              Active: <Box component="span" sx={{ color: '#4ade80' }}>{activeTotal}</Box>
            </Typography>
            
            {/* Awaiting Replacement Clients - orange color */}
            <Typography variant="h6" fontWeight="medium">
              Awaiting Replacement: <Box component="span" sx={{ color: '#fb923c' }}>{awaitingTotal}</Box>
            </Typography>
          </Box>
          
          {/* Grand Total section */}
          <Tooltip title="Sum of all potential clients across all statuses">
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              Grand Total (All Statuses): <Box component="span" sx={{ color: '#93c5fd' }}>{grandTotal.toLocaleString()}</Box>
            </Typography>
          </Tooltip>
        </Box>
        
        <Box display="flex" gap={1}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<RefreshIcon />}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            startIcon={<FileDownloadIcon />}
          >
            Export
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default HeaderContainer;