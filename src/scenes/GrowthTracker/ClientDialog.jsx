import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Chip,
  Button
} from '@mui/material';

function ClientDialog({ open, onClose, client, onUpdateStatus }) {
  if (!client) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ /* your style here */ }}>
        <Typography variant="h6" component="div" sx={{ flex: 1 }}>
          {client.client_name}
        </Typography>
        <Chip label={client.status} sx={{ /* your chip style */ }} />
      </DialogTitle>

      <DialogContent sx={{ /* your style here */ }}>
        {/* Additional content, e.g. "View Notes" button, or details about the client */}
        <Typography variant="subtitle1" sx={{ marginBottom: '0.5rem' }}>
          Change Status:
        </Typography>
        <select
          value={client.status}
          onChange={(e) => onUpdateStatus(e.target.value)}
          style={{ /* style for the select box */ }}
        >
          {/* Your status options */}
          <option value="Active">Active</option>
          <option value="Declined">Declined</option>
          <option value="On Hold">On Hold</option>
          {/* etc. */}
        </select>
      </DialogContent>

      <DialogActions sx={{ /* style for bottom bar */ }}>
        <Button variant="contained" color="primary" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ClientDialog;
