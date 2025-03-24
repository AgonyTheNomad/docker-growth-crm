import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  styled,
  Paper,
  Grid
} from '@mui/material';

const LinearProgressWithLabel = (props) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress 
          variant="determinate" 
          {...props} 
          sx={{ 
            height: 8, 
            borderRadius: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#2196f3'
            }
          }}
        />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="textSecondary">
          {`${Math.round(props.value)}%`}
        </Typography>
      </Box>
    </Box>
  );
};

const ProgressContainer = styled(Paper)(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(2),
  padding: theme.spacing(3),
  backgroundColor: '#303030',
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  color: '#fff'
}));

const StatsBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5),
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: theme.shape.borderRadius,
  marginTop: theme.spacing(1)
}));

const UploadProgress = ({ uploadProgress, isUploading, uploadSummary }) => {
  if (!isUploading) return null;

  // Calculate percentage based on processed rows if available, otherwise use uploadProgress
  const percentage = uploadSummary?.total_rows 
    ? Math.round((uploadSummary.processed_rows / uploadSummary.total_rows) * 100)
    : Math.round(uploadProgress || 0);
    
  const processedRows = uploadSummary?.processed_rows || 0;
  const totalRows = uploadSummary?.total_rows || 0;
  const duplicatesCount = uploadSummary?.duplicates_count || 0;
  const errors = uploadSummary?.errors || 0;

  // Debugging
  console.log('Upload Progress:', {
    percentage,
    processedRows,
    totalRows,
    uploadProgress,
    uploadSummary
  });

  return (
    <ProgressContainer elevation={3}>
      {/* Progress Header */}
      <Box sx={{ width: '100%', mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body1" color="textSecondary">
            Upload Progress
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {percentage}%
          </Typography>
        </Box>
        <LinearProgressWithLabel value={percentage} />
      </Box>

      {/* Processing Stats */}
      {totalRows > 0 && (
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <StatsBox>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Total Records
              </Typography>
              <Typography variant="h6" color="textPrimary">
                {totalRows}
              </Typography>
            </StatsBox>
          </Grid>
          <Grid item xs={6}>
            <StatsBox>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Processed
              </Typography>
              <Typography variant="h6" color="textPrimary">
                {processedRows}
              </Typography>
            </StatsBox>
          </Grid>
        </Grid>
      )}

      {/* Contact Distribution */}
      {uploadSummary?.contact_distribution && (
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Contact Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <StatsBox>
                <Typography variant="caption" color="textSecondary">
                  Phone Only
                </Typography>
                <Typography variant="body1">
                  {uploadSummary.contact_distribution.mobile_only || 0}
                </Typography>
              </StatsBox>
            </Grid>
            <Grid item xs={4}>
              <StatsBox>
                <Typography variant="caption" color="textSecondary">
                  Email Only
                </Typography>
                <Typography variant="body1">
                  {uploadSummary.contact_distribution.email_only || 0}
                </Typography>
              </StatsBox>
            </Grid>
            <Grid item xs={4}>
              <StatsBox>
                <Typography variant="caption" color="textSecondary">
                  Both
                </Typography>
                <Typography variant="body1">
                  {uploadSummary.contact_distribution.both || 0}
                </Typography>
              </StatsBox>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Duplicates and Errors */}
      {(duplicatesCount > 0 || errors > 0) && (
        <Box sx={{ mt: 2 }}>
          {duplicatesCount > 0 && (
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'warning.main',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 1
              }}
            >
              Duplicates found: {duplicatesCount}
            </Typography>
          )}
          {errors > 0 && (
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'error.main',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              Errors: {errors}
            </Typography>
          )}
        </Box>
      )}
    </ProgressContainer>
  );
};

export default UploadProgress;