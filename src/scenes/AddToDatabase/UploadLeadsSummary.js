import React from 'react';
import { styled } from '@mui/material/styles';
import { 
  Paper, 
  Typography, 
  Alert, 
  AlertTitle,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Divider,
  LinearProgress
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const StyledPaper = styled(Paper)(({ theme }) => ({
  marginTop: '20px',
  padding: '20px',
  backgroundColor: '#424242',
  color: '#FFF',
}));

const StyledAlert = styled(Alert)(({ theme }) => ({
  backgroundColor: '#2a2a2a',
  color: '#FFF',
  marginBottom: '16px',
  '& .MuiAlert-icon': {
    color: ({ severity }) => {
      switch (severity) {
        case 'success': return '#4caf50';
        case 'warning': return '#ff9800';
        case 'error': return '#f44336';
        default: return '#2196f3';
      }
    }
  }
}));

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  backgroundColor: '#2a2a2a',
  color: '#FFF',
  marginBottom: '8px',
  '&:before': {
    display: 'none',
  },
  '& .MuiAccordionSummary-expandIconWrapper': {
    color: '#FFF',
  }
}));

const StatBox = styled(Box)(({ theme }) => ({
  padding: '12px',
  backgroundColor: '#333',
  borderRadius: '4px',
  marginBottom: '8px',
}));

const UploadLeadsSummary = ({ 
  uploadSummary, 
  error, 
  warnings = [], 
  successMessage, 
  isUploading,
  uploadProgress // Accept uploadProgress as a prop
}) => {
  if (isUploading) {
    return (
      <StyledPaper>
        <Typography variant="h6" gutterBottom>Upload in Progress</Typography>
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress 
            variant="determinate" 
            value={uploadProgress}  // Use the prop here
            sx={{ height: 10, borderRadius: 5 }}
          />
        </Box>
        <Typography variant="body2" color="textSecondary">
          Processing {uploadSummary.processed_rows || 0} of {uploadSummary.total_rows || 0} records
        </Typography>
      </StyledPaper>
    );
  }

  if (!uploadSummary && !error && !warnings.length && !successMessage) {
    return null;
  }

  return (
    <StyledPaper>
      <Typography variant="h6" gutterBottom>Upload Summary Report</Typography>

      {successMessage && (
        <StyledAlert severity="success" sx={{ mb: 2 }}>
          <AlertTitle>Success</AlertTitle>
          {successMessage}
        </StyledAlert>
      )}

      {error && (
        <StyledAlert severity="error" sx={{ mb: 2 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </StyledAlert>
      )}

      {warnings.length > 0 && (
        <StyledAlert severity="warning" sx={{ mb: 2 }}>
          <AlertTitle>Warnings ({warnings.length})</AlertTitle>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </StyledAlert>
      )}

      {uploadSummary && (
        <>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Processing Summary</Typography>
            <StatBox>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <div>
                  <Typography variant="body2" color="textSecondary">Total Records</Typography>
                  <Typography variant="h6">{uploadSummary.total_rows || 0}</Typography>
                </div>
                <div>
                  <Typography variant="body2" color="textSecondary">Successfully Processed</Typography>
                  <Typography variant="h6">{uploadSummary.processed_rows || 0}</Typography>
                </div>
                <div>
                  <Typography variant="body2" color="textSecondary">Valid Records</Typography>
                  <Typography variant="h6" color="success.main">{uploadSummary.valid_rows || 0}</Typography>
                </div>
                <div>
                  <Typography variant="body2" color="textSecondary">Invalid Records</Typography>
                  <Typography variant="h6" color="error.main">{uploadSummary.invalid_rows || 0}</Typography>
                </div>
              </Box>
            </StatBox>
          </Box>

          {uploadSummary.contact_distribution && (
            <StyledAccordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Contact Information Distribution</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <StatBox>
                    <Typography variant="body2" color="textSecondary">Mobile Phone Only</Typography>
                    <Typography variant="h6">{uploadSummary.contact_distribution.mobile_only || 0}</Typography>
                  </StatBox>
                  <StatBox>
                    <Typography variant="body2" color="textSecondary">Office Phone Only</Typography>
                    <Typography variant="h6">{uploadSummary.contact_distribution.office_only || 0}</Typography>
                  </StatBox>
                  <StatBox>
                    <Typography variant="body2" color="textSecondary">Email Only</Typography>
                    <Typography variant="h6">{uploadSummary.contact_distribution.email_only || 0}</Typography>
                  </StatBox>
                  <StatBox>
                    <Typography variant="body2" color="textSecondary">Mobile & Email</Typography>
                    <Typography variant="h6">{uploadSummary.contact_distribution.mobile_and_email || 0}</Typography>
                  </StatBox>
                  <StatBox>
                    <Typography variant="body2" color="textSecondary">Office & Email</Typography>
                    <Typography variant="h6">{uploadSummary.contact_distribution.office_and_email || 0}</Typography>
                  </StatBox>
                  <StatBox>
                    <Typography variant="body2" color="textSecondary">Mobile & Office</Typography>
                    <Typography variant="h6">{uploadSummary.contact_distribution.mobile_and_office || 0}</Typography>
                  </StatBox>
                  <StatBox>
                    <Typography variant="body2" color="textSecondary">All Contact Types</Typography>
                    <Typography variant="h6">{uploadSummary.contact_distribution.all_contacts || 0}</Typography>
                  </StatBox>
                </Box>
              </AccordionDetails>
            </StyledAccordion>
          )}

          {uploadSummary.processed && (
            <StyledAccordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Processing Details</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <StatBox>
                    <Typography variant="body2" color="textSecondary">Created Records</Typography>
                    <Typography variant="h6" color="success.main">{uploadSummary.created || 0}</Typography>
                  </StatBox>
                  <StatBox>
                    <Typography variant="body2" color="textSecondary">Updated Records</Typography>
                    <Typography variant="h6" color="info.main">{uploadSummary.updated || 0}</Typography>
                  </StatBox>
                  <StatBox>
                    <Typography variant="body2" color="textSecondary">Processing Errors</Typography>
                    <Typography variant="h6" color="error.main">{uploadSummary.errors || 0}</Typography>
                  </StatBox>
                </Box>
              </AccordionDetails>
            </StyledAccordion>
          )}
        </>
      )}
    </StyledPaper>
  );
};

export default UploadLeadsSummary;