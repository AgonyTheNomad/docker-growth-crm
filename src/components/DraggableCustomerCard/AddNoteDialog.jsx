import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';

const AddNoteDialog = ({ isOpen, onClose, onSave, note, setNote }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleSave = async () => {
    if (!note.trim()) {
      setFeedback({
        open: true,
        message: 'Please enter a note before saving',
        severity: 'warning'
      });
      return;
    }

    setIsLoading(true);
    try {
      await onSave();
      setFeedback({
        open: true,
        message: 'Note saved successfully!',
        severity: 'success'
      });
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      setFeedback({
        open: true,
        message: error.message || 'Failed to save note. Please try again.',
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
        onClose={onClose}
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
          Add a Note
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <TextField
            autoFocus
            multiline
            rows={4}
            variant="outlined"
            placeholder="Type your note here..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            fullWidth
            disabled={isLoading}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'grey.50',
                color: '#000000',
                '& fieldset': {
                  borderColor: 'grey.300'
                },
                '&:hover fieldset': {
                  borderColor: 'grey.400'
                }
              },
              '& .MuiInputBase-input': {
                color: '#000000',
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'grey.600',
                opacity: 1
              }
            }}
          />
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={onClose}
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
            onClick={handleSave}
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
            {isLoading ? 'Saving...' : 'Save'}
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

export default AddNoteDialog;