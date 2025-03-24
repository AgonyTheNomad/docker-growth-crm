import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText
} from '@mui/material';

const ConfirmationModal = ({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  message, 
  clientDetails 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      setFeedback({
        open: true,
        message: 'Status updated successfully!',
        severity: 'success'
      });
      setTimeout(() => {
        onCancel(); // Using onCancel as it already handles closing the modal
      }, 1000);
    } catch (error) {
      setFeedback({
        open: true,
        message: error.message || 'Failed to update status. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseFeedback = () => {
    setFeedback(prev => ({ ...prev, open: false }));
  };

  return (
    <>
      <Dialog 
        open={isOpen} 
        onClose={!isLoading ? onCancel : undefined}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            borderRadius: 2
          }
        }}
      >
        <DialogTitle 
          sx={{
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            p: 2
          }}
        >
          Confirm Status Change
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          <Typography sx={{ mb: 2 }}>{message}</Typography>
          
          {clientDetails && clientDetails.length > 0 && (
            <List sx={{ 
              bgcolor: 'grey.100',
              borderRadius: 1,
              maxHeight: '200px',
              overflow: 'auto'
            }}>
              {clientDetails.map((client, index) => (
                <ListItem key={index}>
                  <ListItemText 
                    primary={client.name}
                    secondary={`New Status: ${client.newStatus}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={onCancel}
            variant="contained"
            disabled={isLoading}
            sx={{
              bgcolor: 'error.main',
              '&:hover': {
                bgcolor: 'error.dark'
              },
              borderRadius: '20px',
              px: 3
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{
              bgcolor: 'success.main',
              '&:hover': {
                bgcolor: 'success.dark'
              },
              borderRadius: '20px',
              px: 3,
              minWidth: '100px'
            }}
          >
            {isLoading ? 'Updating...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={feedback.open}
        autoHideDuration={6000}
        onClose={handleCloseFeedback}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseFeedback} 
          severity={feedback.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {feedback.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ConfirmationModal;