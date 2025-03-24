import React from 'react';
import {
  ModalContainer,
  Overlay,
  ConfirmButton,
  Typography,
  DialogContent,
  DialogTitle,
} from '../../style';
import WarningIcon from '@mui/icons-material/Warning'; // Import a warning icon from Material-UI

const AlertModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <>
      <Overlay />
      <ModalContainer style={{ padding: '20px', borderRadius: '8px', maxWidth: '400px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <WarningIcon style={{ fontSize: '40px', color: '#ff9800', marginRight: '10px' }} />
          <Typography variant="h6" component="h2" style={{ fontWeight: 'bold', color: '#333' }}>
            Warning
          </Typography>
        </div>
        <DialogContent>
          <Typography variant="body1" style={{ marginBottom: '16px', color: '#555' }}>
            {message}
          </Typography>
        </DialogContent>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
          <ConfirmButton
            onClick={onClose}
            variant="contained"
            style={{
              backgroundColor: '#ff9800',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '4px',
              fontWeight: 'bold',
              boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          >
            OK
          </ConfirmButton>
        </div>
      </ModalContainer>
    </>
  );
};

export default AlertModal;
