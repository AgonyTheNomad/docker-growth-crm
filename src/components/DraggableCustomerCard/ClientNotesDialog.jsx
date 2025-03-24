import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    backgroundColor: '#1E1E1E',
    color: '#FFFFFF',
    borderRadius: '8px',
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  backgroundColor: '#2C2C2C',
  color: '#FFFFFF',
  padding: theme.spacing(2),
  fontSize: '1.2rem',
  fontWeight: 'bold',
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: '#1E1E1E',
}));

const NoteContainer = styled('div')(({ theme }) => ({
  backgroundColor: '#2C2C2C',
  borderRadius: '4px',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
}));

const NoteText = styled(Typography)(({ theme }) => ({
  color: '#FFFFFF',
  marginBottom: theme.spacing(1),
  fontSize: '1rem',
}));

const NoteMetadata = styled(Typography)(({ theme }) => ({
  color: '#BBBBBB',
  fontSize: '0.8rem',
}));

const SourceTag = styled(Typography)(({ theme }) => ({
  color: '#FFD700',
  fontWeight: 'bold',
  marginBottom: theme.spacing(2),
  marginTop: theme.spacing(3),
  fontSize: '0.9rem',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#0288d1',
  color: '#FFFFFF',
  '&:hover': {
    backgroundColor: '#0277bd',
  },
}));

const ClientNotesDialog = ({ open, onClose, notes, clientNotes }) => {
  const sortedNotes = [...notes].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <StyledDialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <StyledDialogTitle>Client Notes</StyledDialogTitle>
      <StyledDialogContent>
        {sortedNotes.map((noteItem, index) => (
          <NoteContainer key={index}>
            <NoteText>{noteItem.note}</NoteText>
            <NoteMetadata>
              {noteItem.user_name} - {new Date(noteItem.timestamp).toLocaleString()}
            </NoteMetadata>
          </NoteContainer>
        ))}
        
        {clientNotes && (
          <>
            <Divider style={{ margin: '24px 0', backgroundColor: '#444' }} />
            <SourceTag>Source: Old Google Sheets</SourceTag>
            <NoteContainer>
              <NoteText>{clientNotes}</NoteText>
            </NoteContainer>
          </>
        )}
      </StyledDialogContent>
      <DialogActions style={{ padding: '16px', backgroundColor: '#1E1E1E' }}>
        <StyledButton onClick={onClose} variant="contained">
          Close
        </StyledButton>
      </DialogActions>
    </StyledDialog>
  );
};

export default ClientNotesDialog;