import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import MessageIcon from '@mui/icons-material/Message';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import Typography from '@mui/material/Typography';
import DialogContentText from '@mui/material/DialogContentText';
import Autocomplete from '@mui/material/Autocomplete';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import { treadmill } from 'ldrs';
import React from 'react';

if (typeof customElements.get('l-treadmill') === 'undefined') {
    treadmill.register();
}

export const StyledDraggableCard = styled('div')(({ theme, isDragging }) => ({
  opacity: isDragging ? 0.5 : 1,
  padding: '15px',
  margin: '10px 0',
  backgroundColor: '#303030',
  color: '#FFF',
  cursor: 'move',
  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  borderRadius: '8px',
  border: '1px solid #444',
  transition: 'box-shadow 0.3s ease-in-out',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
}));

export const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: '20px',
  backgroundColor: '#1976d2',
  '&:hover': {
    backgroundColor: '#155a9b',
  },
}));

export const StyledAccordion = styled(Accordion)(({ theme }) => ({
  backgroundColor: '#424242',
  color: '#FFF',
}));

export const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  '& .MuiAccordionSummary-expandIcon': {
    color: '#FFF',
  },
}));

export const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    backgroundColor: '#333',
    color: '#FFF',
  },
  '& .MuiInputLabel-root': {
    color: '#FFF',
  },
}));

export const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiPaper-root': {
    backgroundColor: '#424242',
    color: '#FFF',
  },
}));

export const StyledIconButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: 8,
  top: 8,
  color: theme.palette.grey[500],
}));

export const StyledColumn = styled('div')(({ theme }) => ({
  width: '250px',
  height: '100vh',
  backgroundColor: '#f4f4f4',
  borderRadius: '8px',
  padding: '10px',
  marginRight: '15px',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}));

export const StyledColumnHeader = styled('div')(({ theme }) => ({
  fontWeight: 'bold',
  color: '#333',
  textAlign: 'center',
  marginBottom: '20px',
  padding: '10px',
  backgroundColor: '#f4f4f4',
  position: 'sticky',
  top: 0,
  zIndex: 1000,
  borderBottom: '1px solid #ccc',
}));

export const StyledAutocomplete = styled(Autocomplete)(({ theme }) => ({
  marginBottom: '20px',
  backgroundColor: '#2a2a2a',
  color: 'white',
  borderRadius: '4px',
  '& .MuiInputBase-root': {
    color: 'white',
    borderColor: '#333',
  },
  '& .MuiInputLabel-root': {
    color: 'gray',
  },
}));

export const StyledColumnBody = styled('div')(({ theme }) => ({
  overflowY: 'auto',
  flexGrow: 1,
}));

export const LoadingIndicatorContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  height: '100%',
  position: 'absolute',
  top: 0,
  left: 0,
  backgroundColor: 'rgba(255, 255, 255, 0.2)', // Glassy effect
  backdropFilter: 'blur(5px)', // Glassy effect
  zIndex: 1000, // Ensure it overlays other content
}));

export const LoadingIndicator = () => (
  <LoadingIndicatorContainer>
    <l-treadmill size="150" speed="1.25" color="black"></l-treadmill>
    <Typography variant="h6" style={{ color: '#000000', marginTop: '10px' }}>Loading...</Typography>
  </LoadingIndicatorContainer>
);

export const FranchiseSelectContainer = styled('div')({
  width: '100%',
  maxWidth: '300px',
});

export const ColumnsContainer = styled('div')({
  display: 'flex',
  flexWrap: 'nowrap',
  overflowX: 'auto',
  justifyContent: 'space-around',
  alignItems: 'flex-start',
});

export const DropdownContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  padding: '20px',
  marginRight: '150px',
  maxWidth: '700px',
});

export const FirstColumn = styled('div')({
  marginLeft: '20px',
});

export const ModalContainer = styled('div')({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 1050, 
  background: '#FFF',
  padding: '30px',
  borderRadius: '10px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  color: '#333',
  textAlign: 'center', 
  width: 'auto',
  maxWidth: '500px', 
  animation: 'appear 300ms ease-out forwards', 
});

export const Overlay = styled('div')({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  zIndex: 1040, 
  animation: 'fadeIn 300ms ease-out forwards', 
});

export const ConfirmButton = styled(Button)({
  padding: '10px 20px',
  margin: '10px',
  borderRadius: '5px',
  backgroundColor: '#28a745', // Green
  color: 'white',
  '&:hover': {
    backgroundColor: '#218838',
  },
});

export const CancelButton = styled(Button)({
  padding: '10px 20px',
  margin: '10px',
  borderRadius: '5px',
  backgroundColor: '#dc3545', // Red
  color: 'white',
  '&:hover': {
    backgroundColor: '#c82333',
  },
});

export const LinearProgressContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
});

export const LinearProgressBar = styled(LinearProgress)({
  width: '100%',
  marginRight: '8px',
});

export const LinearProgressLabel = styled(Box)({
  minWidth: '35px',
});

export const LinearProgressWithLabel = ({ value }) => {
  return (
    <LinearProgressContainer>
      <LinearProgressBar variant="determinate" value={value} />
      <LinearProgressLabel>
        <Typography variant="body2" color="textSecondary">{`${Math.round(value)}%`}</Typography>
      </LinearProgressLabel>
    </LinearProgressContainer>
  );
};

export {
  PhoneIcon,
  EmailIcon,
  MessageIcon,
  TextSnippetIcon,
  Typography,
  DialogActions,
  DialogContent,
  DialogTitle,
  CloseIcon,
  ExpandMoreIcon,
  AccordionDetails,
  DialogContentText,
  Autocomplete,
};
