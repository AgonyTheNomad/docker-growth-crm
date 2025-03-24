import React, { useState, useEffect } from 'react';
import {
  ModalContainer,
  Overlay,
  ConfirmButton,
  CancelButton,
  Typography,
  DialogContent,
  DialogTitle,
  StyledTextField,
} from '../../style';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const field_mapping = {
  'Assigned Growthbacker': 'growthbacker',
  'Specific Industry': 'specific_industry',
  'Company/Brokerage': 'company_brokerage',
  'Assigned Growthapprentice': 'growthapprentices',
  'Appointment Set Date': 'appointment_set_date',
  'Appointment Held Date': 'appointment_held_date',
  'Agreement signed date': 'signed_date',
  'Contract Signatory': 'contract',
  'Name (Person to bill)': 'name_person_to_bill',
  'Hiring Fee Amount': 'hiring_fee',
  'PT/FT': 'pt_ft',
  'KW/Non-KW/Non-RE': 'kw_non_kw_non_re',
  'Endorsed Date': 'endorsed_date',
  'One Sheet': 'one_sheet',
  'Contract': 'contract',
  'Contract Version': 'contract_version',
  'Type of Referral': 'type_of_referral',
  'Additional 3% referral incentive from franchise commission': 'additional_3_percent_referral_incentive',
  '50% split incentive for FGB/GB': 'split_incentive_for_fgb_gb',
  'Additional Client 25% Growth Referral Fee': 'additional_client_25_growth_referral_fee',
  'Hiring Fee Paid Date': 'hiring_fee_paid_date',
  'Hiring Fee Posted Date': 'hiring_fee_posted_date',
  'Monthly Service Fee': 'msf'
};

const PT_FT_VALUES = {
  'Full-Time': 'FT',
  'Part-Time': 'PT'
};

const KW_VALUES = {
  'KW': 'KW',
  'Non-KW': 'Non-KW',
  'Non-RE': 'Non-RE'
};

const RequiredFieldsModal = ({ isOpen, onClose, onSubmit, client }) => {
  const [formData, setFormData] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (client) {
      const initialData = {};
      setErrors({});

      (client.missingFields || []).forEach(field => {
        const dbField = field_mapping[field];
        if (field === 'PT/FT') {
          const dbValue = client[dbField];
          const displayValue = dbValue === 'FT' ? 'Full-Time' : 
                             dbValue === 'PT' ? 'Part-Time' : '';
          initialData[field] = displayValue;
          initialData[dbField] = dbValue;
        } else if (field === 'KW/Non-KW/Non-RE') {
          initialData[field] = client[dbField] || '';
        } else if (field.toLowerCase().includes('date')) {
          const date = client[dbField] ? new Date(client[dbField]).toISOString().split('T')[0] : '';
          initialData[field] = date;
        } else {
          initialData[field] = client[dbField] || '';
        }
      });
      
      setFormData(initialData);
      setOriginalData(initialData);
    }
  }, [client]);

  const validateField = (field, value) => {
    if (!value) return null;
    if (field.toLowerCase().includes('date') && value && isNaN(new Date(value).getTime())) {
      return 'Invalid date format';
    }
    if ((field === 'Hiring Fee Amount' || field === 'Monthly Service Fee') && value && isNaN(parseFloat(value))) {
      return 'Must be a valid number';
    }
    return null;
  };

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    
    setFormData(prev => {
      const updatedData = { ...prev };
      
      if (field === 'PT/FT') {
        const dbFieldName = field_mapping[field];
        updatedData[field] = value;
        updatedData[dbFieldName] = PT_FT_VALUES[value];
      } else {
        updatedData[field] = value;
      }
      
      return updatedData;
    });

    const error = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const handleSubmit = (e) => {
    e?.preventDefault();

    const newErrors = {};
    Object.entries(formData).forEach(([field, value]) => {
      if (!field_mapping[field]) return;
      const error = validateField(field, value);
      if (error) newErrors[field] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const updatedClient = { ...client };
    const changedFields = {};
    
    Object.entries(formData).forEach(([frontendField, value]) => {
      const dbField = field_mapping[frontendField];
      if (dbField) {
        let finalValue = value;
        
        if (frontendField === 'PT/FT') {
          finalValue = PT_FT_VALUES[value] || value;
        } else if (frontendField.toLowerCase().includes('date') && value) {
          finalValue = new Date(value).toISOString();
        } else if (['Hiring Fee Amount', 'Monthly Service Fee'].includes(frontendField)) {
          finalValue = value ? parseFloat(value) : null;
        }

        if (value !== originalData[frontendField]) {
          changedFields[frontendField] = {
            oldValue: originalData[frontendField] || 'Not set',
            newValue: value
          };
        }

        updatedClient[dbField] = finalValue;
      }
    });

    updatedClient.changedFields = changedFields;
    onSubmit(updatedClient);
  };

  const renderField = (field) => {
    if (field.toLowerCase().includes('date')) {
      return (
        <StyledTextField
          type="date"
          fullWidth
          label={field}
          name={field}
          value={formData[field] || ''}
          onChange={handleInputChange(field)}
          variant="outlined"
          margin="normal"
          error={!!errors[field]}
          helperText={errors[field]}
          InputLabelProps={{ shrink: true }}
        />
      );
    }

    if (field === 'PT/FT') {
      return (
        <FormControl fullWidth variant="outlined" margin="normal" error={!!errors[field]}>
          <InputLabel>PT/FT</InputLabel>
          <Select
            value={formData[field] || ''}
            onChange={handleInputChange(field)}
            label="PT/FT"
          >
            <MenuItem value="Full-Time">Full-Time</MenuItem>
            <MenuItem value="Part-Time">Part-Time</MenuItem>
          </Select>
        </FormControl>
      );
    }

    if (field === 'KW/Non-KW/Non-RE') {
      return (
        <FormControl fullWidth variant="outlined" margin="normal" error={!!errors[field]}>
          <InputLabel>KW/Non-KW/Non-RE</InputLabel>
          <Select
            value={formData[field] || ''}
            onChange={handleInputChange(field)}
            label="KW/Non-KW/Non-RE"
          >
            {Object.entries(KW_VALUES).map(([label, value]) => (
              <MenuItem key={value} value={value}>{label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }

    if (['Hiring Fee Amount', 'Monthly Service Fee'].includes(field)) {
      return (
        <StyledTextField
          fullWidth
          label={field}
          name={field}
          type="number"
          value={formData[field] || ''}
          onChange={handleInputChange(field)}
          variant="outlined"
          margin="normal"
          error={!!errors[field]}
          helperText={errors[field]}
        />
      );
    }

    return (
      <StyledTextField
        fullWidth
        label={field}
        name={field}
        value={formData[field] || ''}
        onChange={handleInputChange(field)}
        variant="outlined"
        margin="normal"
        error={!!errors[field]}
        helperText={errors[field]}
      />
    );
  };

  if (!isOpen || !client) return null;

  const hasErrors = Object.keys(errors).some(key => errors[key]);

  return (
    <>
      <Overlay />
      <ModalContainer>
        <DialogTitle>
          <Typography variant="h5" component="h2" style={{ fontWeight: 'bold', marginBottom: '16px' }}>
            Fill Required Fields
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" style={{ marginBottom: '16px' }}>
            You need to fill out the following fields for client: <strong>{client.client_name}</strong>
          </Typography>
          <form onSubmit={handleSubmit}>
            <List dense style={{ marginBottom: '16px', maxHeight: '300px', overflowY: 'auto' }}>
              {(client.missingFields || []).map(field => (
                <ListItem key={field}>
                  {renderField(field)}
                </ListItem>
              ))}
            </List>
          </form>
        </DialogContent>
        <Divider style={{ margin: '16px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <CancelButton onClick={onClose} variant="contained">
            Cancel
          </CancelButton>
          <ConfirmButton 
            onClick={handleSubmit} 
            variant="contained"
            disabled={hasErrors}
          >
            Submit
          </ConfirmButton>
        </div>
      </ModalContainer>
    </>
  );
};

export default RequiredFieldsModal;