import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDrag } from 'react-dnd';
import { Checkbox, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, TextField } from '@mui/material';
import { constructUrl } from '../../utils/apiUtils';
import AddNoteDialog from './AddNoteDialog';
import ClientNotesDialog from './ClientNotesDialog';
import {
  StyledDraggableCard,
  StyledButton,
  StyledAccordion,
  StyledAccordionSummary,
  StyledTextField,
  StyledDialog,
  StyledIconButton,
  PhoneIcon,
  EmailIcon,
  TextSnippetIcon,
  CloseIcon,
  ExpandMoreIcon,
  AccordionDetails,
} from '../../style';

const STATUS_MAPPING = {
  "On Pause": "On Pause",
  "Returned SA": "On Pause",
  "Awaiting OS": "On Pause",
  "MAPS Credit": "Active",
  "Trade": "Active",
  "Active": "Active",
  "Active but Awaiting Replacement": "Active",
  "Active (Winback)": "Active",
  "Winback": "Active",
  "Active (NR - 6months)": "Active",
  "Awaiting Replacement": "Awaiting Replacement",
  "Suspended": "Awaiting Replacement",
  "Ghosted": "Awaiting Replacement",
  "Pending On Hold": "Awaiting Replacement",
  "Pending Cancellation": "Awaiting Replacement",
  "On Hold": "Awaiting Replacement"
};

const AccordionSection = ({ expandedPanel, handleAccordionChange, clientState, handleChange, sectionKey, sectionTitle, fields }) => {
  const sectionRef = useRef(null);

  return (
    <StyledAccordion ref={sectionRef} expanded={expandedPanel === sectionKey} onChange={handleAccordionChange(sectionKey)}>
      <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>{sectionTitle}</Typography>
      </StyledAccordionSummary>
      <AccordionDetails style={{ maxHeight: '200px', overflow: 'auto' }}>
        <div>
          {fields.map(addrKey => (
            <StyledTextField
              key={addrKey}
              label={addrKey.replace(/_/g, ' ').charAt(0).toUpperCase() + addrKey.slice(1).replace(/_/g, ' ')}
              value={clientState[addrKey] || 'N/A'}
              onChange={handleChange}
              name={addrKey}
              fullWidth
              margin="dense"
              variant="outlined"
            />
          ))}
        </div>
      </AccordionDetails>
    </StyledAccordion>
  );
};

const DraggableCustomerCard = ({ client, isSelected, onCheckboxChange, username, uid }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'client',
    item: { id: client.id, clientName: client.client_name, status: client.status },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [client.id, client.client_name, client.status, isSelected]);

  const [clientState, setClientState] = useState(client);
  const [initialClient, setInitialClient] = useState(client);
  const [isEdited, setIsEdited] = useState(false);
  const [expandedPanel, setExpandedPanel] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState([]);
  const accordionRefs = useRef({
    contactInfo: useRef(null),
    socialMedia: useRef(null),
    addressInfo: useRef(null),
    databaseInfo: useRef(null),
    contractInfo: useRef(null),
  });

  const ws = useRef(null);

  const handleClick = () => setIsDialogOpen(true);
  const handleClose = () => setIsDialogOpen(false);

  const handleChange = event => {
    const { name, value } = event.target;
    setClientState(prev => ({ ...prev, [name]: value }));
    setIsEdited(true);
  };

  const handleSave = async () => {
    const updatedFields = {};
    for (const key in clientState) {
      if (clientState[key] !== initialClient[key]) {
        updatedFields[key] = clientState[key];
      }
    }
  
    try {
      const response = await fetch(constructUrl(`/clients/update/${clientState.id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${username}`
        },
        body: JSON.stringify(updatedFields)
      });
      if (!response.ok) throw new Error('Failed to save updates');
      const updatedClient = await response.json();
      setClientState(updatedClient.client);
      setInitialClient(updatedClient.client);
      setIsEdited(false);
    } catch (error) {
      console.error('Save error:', error);
      alert('There was an issue saving the updates.');
    }
  };

  const getTextFieldStyles = (key) => ({
    backgroundColor: clientState[key] !== initialClient[key] ? '#FFFF99' : '#333',
    color: clientState[key] !== initialClient[key] ? 'red' : '#FFF',
  });

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedPanel(isExpanded ? panel : null);
  };

  useEffect(() => {
    if (expandedPanel) {
      const ref = accordionRefs.current[expandedPanel];
      if (ref && ref.current) {
        setTimeout(() => {
          ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
        }, 300);
      }
    }
  }, [expandedPanel]);

  useEffect(() => {
    ws.current = new WebSocket(constructUrl('/clients').replace('http', 'ws'));


    ws.current.onopen = () => {
      console.log('WebSocket connection established');
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'note') {
        setNotes((prevNotes) => [...prevNotes, { ...data.note, source: 'Google Sheets' }]);
      }
    };

    ws.current.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const handleNotesDialogOpen = async () => {
    setIsNotesDialogOpen(true);
    try {
      const response = await fetch(constructUrl(`/api/clients/${clientState.id}/notes`), {
        headers: {
          'Authorization': `${username}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch notes');
      const data = await response.json();
      setNotes(data.notes);
    } catch (error) {
      console.error('Fetch notes error:', error);
      alert('There was an issue fetching the notes.');
    }
  };

  const handleNotesDialogClose = () => {
    setIsNotesDialogOpen(false);
  };

  const handleNoteDialogOpen = () => {
    setIsNoteDialogOpen(true);
  };

  const handleNoteDialogClose = () => {
    setIsNoteDialogOpen(false);
    setNote('');
  };

  const handleNoteSave = async () => {
    if (!note.trim()) return;

    try {
      const displayName = username.includes('@') ? username.split('@')[0] : username;

      const noteData = {
        note,
        user: {
          username,
          uid,
          displayName,
          timestamp: new Date().toISOString()
        },
        metadata: {
          source: 'web_interface',
          clientId: clientState.id,
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString()
        }
      };

      const response = await fetch(constructUrl(`/api/clients/${clientState.id}/notes`), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `${username}`
        },
        body: JSON.stringify(noteData)
      });

      if (!response.ok) {
        throw new Error('Failed to save note');
      }

      const savedNote = await response.json();
      
      const newNote = {
        ...savedNote,
        user: {
          username,
          uid,
          displayName
        },
        timestamp: new Date().toISOString()
      };
      
      setNotes(prevNotes => [...prevNotes, newNote]);
      setIsNoteDialogOpen(false);
      setNote('');
    } catch (error) {
      console.error('Save note error:', error);
      alert('There was an issue saving the note.');
    }
  };

  const generalFields = ['client_name', 'growthbacker', 'company', 'title', 'industry', 'source', 'franchise'];

  const shouldDisplayStatus = STATUS_MAPPING[client.status];

  return (
    <StyledDraggableCard ref={drag} isDragging={isDragging}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
        <h3 onClick={handleClick} style={{ cursor: 'pointer', fontSize: '1.2em', fontWeight: 'bold', color: '#FFF', flex: 1 }}>
          {client.client_name || 'Name not available'}
        </h3>
        <Checkbox
          checked={isSelected}
          onChange={() => onCheckboxChange(client.id)}
        />
      </div>
      {shouldDisplayStatus && (
        <span className="status-tag" style={{ display: 'inline-block', backgroundColor: '#ffcc00', color: '#000', padding: '2px 4px', marginBottom: '4px', borderRadius: '4px', fontSize: '12px' }}>
          {client.status}
        </span>
      )}
      <StyledDialog
        open={isDialogOpen}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Edit Client Information
          <StyledIconButton
            aria-label="close"
            onClick={handleClose}
          >
            <CloseIcon />
          </StyledIconButton>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ padding: 2, color: '#FFF' }}>
            {generalFields.map(key => (
              <StyledTextField
                key={key}
                label={key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}
                value={clientState[key] || ''}
                onChange={handleChange}
                name={key}
                fullWidth
                margin="dense"
                variant="outlined"
                InputProps={{
                  style: getTextFieldStyles(key)
                }}
                InputLabelProps={{
                  style: { color: getTextFieldStyles(key).color }
                }}
              />
            ))}

            <AccordionSection
              expandedPanel={expandedPanel}
              handleAccordionChange={handleAccordionChange}
              clientState={clientState}
              handleChange={handleChange}
              sectionKey="contactInfo"
              sectionTitle="Contact Info"
              fields={['mobile_phone_number', 'office_phone_number', 'email_address']}
            />

            <AccordionSection
              expandedPanel={expandedPanel}
              handleAccordionChange={handleAccordionChange}
              clientState={clientState}
              handleChange={handleChange}
              sectionKey="socialMedia"
              sectionTitle="Social"
              fields={['instagram', 'tiktok', 'facebook', 'linkedin']}
            />

            <AccordionSection
              expandedPanel={expandedPanel}
              handleAccordionChange={handleAccordionChange}
              clientState={clientState}
              handleChange={handleChange}
              sectionKey="addressInfo"
              sectionTitle="Address"
              fields={['street_address', 'city_county', 'state', 'zip']}
            />

            <AccordionSection
              expandedPanel={expandedPanel}
              handleAccordionChange={handleAccordionChange}
              clientState={clientState}
              handleChange={handleChange}
              sectionKey="databaseInfo"
              sectionTitle="When Client was added to database"
              fields={['date', 'week', 'month']}
            />

            <AccordionSection
              expandedPanel={expandedPanel}
              handleAccordionChange={handleAccordionChange}
              clientState={clientState}
              handleChange={handleChange}
              sectionKey="contractInfo"
              sectionTitle="Contract Information"
              fields={['contract_version', 'contract_start_date', 'msf', 'contract', 'hiring_fee', 'signed_date', 'hiring_fee_paid_date', 'hiring_fee_posted_date']}
            />

            {isEdited && (
              <StyledButton variant="contained" color="primary" onClick={handleSave}>
                Save Changes
              </StyledButton>
            )}
          </Typography>
        </DialogContent>
      </StyledDialog>

      <Button onClick={handleNotesDialogOpen} style={{ margin: '10px 0', backgroundColor: '#0288d1', color: '#fff', borderRadius: '4px', padding: '6px 12px' }}>
        View Notes
      </Button>

      <ClientNotesDialog
        open={isNotesDialogOpen}
        onClose={handleNotesDialogClose}
        notes={notes}
        clientNotes={clientState.notes}
      />

      <p style={{ fontSize: '1em', color: '#666', marginBottom: '.5px' }}>
        Growth Backer:<br />
        {clientState.growthbacker || 'N/A'}
      </p>
      <p style={{ fontSize: '1em', color: '#666', marginBottom: '.5px' }}>
        Head Backer:<br />
        {clientState.headbacker || 'N/A'}
      </p>
      <p style={{ fontSize: '1em', color: '#666', marginBottom: '.5px' }}>
        Career Backer:<br />
        {clientState.careerbacker || 'N/A'}
      </p>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <a href={`tel:${clientState.mobile_phone_number}`} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
          <PhoneIcon style={{ color: 'teal', fontSize: '24px' }} />
        </a>
        <a href={`mailto:${clientState.email_address}`} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
          <EmailIcon style={{ color: 'teal', fontSize: '24px' }} />
        </a>
        <button 
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'inherit' }}
          onClick={handleNoteDialogOpen}
        >
          <TextSnippetIcon style={{ color: 'teal', fontSize: '24px' }} />
        </button>
      </div>

      <AddNoteDialog
        isOpen={isNoteDialogOpen}
        onClose={handleNoteDialogClose}
        onSave={handleNoteSave}
        note={note}
        setNote={setNote}
      />
    </StyledDraggableCard>
  );
};

DraggableCustomerCard.propTypes = {
  client: PropTypes.shape({
    id: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
    client_name: PropTypes.string.isRequired,
    email_address: PropTypes.string,
    mobile_phone_number: PropTypes.string,
    originalStatus: PropTypes.string,
    growthbacker: PropTypes.string,
    notes: PropTypes.string,
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  onCheckboxChange: PropTypes.func.isRequired,
  username: PropTypes.string.isRequired,
  uid: PropTypes.string.isRequired,
};

export default DraggableCustomerCard;