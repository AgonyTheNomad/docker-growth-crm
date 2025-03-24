import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { constructUrl } from '../../utils/apiUtils';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
  Typography,
  TextField,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const ReferralManagement = () => {
  const [referrals, setReferrals] = useState({ notFollowedUp: [], followedUp: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const response = await axios.get(constructUrl('/api/referrals/cyberbacker-referrals'));
      const data = response.data;
  
      console.log('Fetched referrals data:', data); // Log the fetched data
  
      const notFollowedUp = data.filter((referral) => !referral.followed_up);
      const followedUp = data.filter((referral) => referral.followed_up);
      setReferrals({ notFollowedUp, followedUp });
    } catch (error) {
      console.error('Error fetching referrals:', error);
    } finally {
      setLoading(false);
    }
  };
  const markAsFollowedUp = async (id) => {
    try {
      setLoading(true);
      await axios.put(constructUrl(`/api/referrals/cyberbacker-referrals/${id}/follow-up`));
      setSuccessMessage('Referral marked as followed up!');
      fetchReferrals();
    } catch (error) {
      console.error('Error marking referral as followed up:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReferrals = referrals.notFollowedUp.filter(
    (referral) =>
      referral.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.email_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.additional_info?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card sx={{ width: '98%', margin: 'auto', mt: 4, backgroundColor: '#1e1e1e' }}>
      <CardContent>
        <Typography variant="h4" component="div" gutterBottom sx={{ color: '#ffffff', mb: 3 }}>
          Referral Management
        </Typography>
        <TextField
          label="Search referrals"
          variant="outlined"
          fullWidth
          margin="normal"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            mb: 3,
            maxWidth: 400,
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
              '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
              '&.Mui-focused fieldset': { borderColor: '#90caf9' },
            },
            '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
            '& .MuiInputBase-input': { color: '#ffffff', fontSize: '1.1rem' },
          }}
        />
        <TableContainer component={Paper} sx={{ maxHeight: 700, backgroundColor: '#333333' }}>
          <Table stickyHeader sx={{ minWidth: 800 }} aria-label="referral table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ backgroundColor: '#1e1e1e', color: '#90caf9', fontSize: '1.2rem', fontWeight: 'bold' }}>Client Name</TableCell>
                <TableCell sx={{ backgroundColor: '#1e1e1e', color: '#90caf9', fontSize: '1.2rem', fontWeight: 'bold' }}>Email Address</TableCell>
                <TableCell sx={{ backgroundColor: '#1e1e1e', color: '#90caf9', fontSize: '1.2rem', fontWeight: 'bold' }}>Phone</TableCell>
                <TableCell sx={{ backgroundColor: '#1e1e1e', color: '#90caf9', fontSize: '1.2rem', fontWeight: 'bold' }}>Referral Code</TableCell>
                <TableCell sx={{ backgroundColor: '#1e1e1e', color: '#90caf9', fontSize: '1.2rem', fontWeight: 'bold' }}>Industry</TableCell>
                <TableCell sx={{ backgroundColor: '#1e1e1e', color: '#90caf9', fontSize: '1.2rem', fontWeight: 'bold' }}>Additional Info</TableCell>
                <TableCell sx={{ backgroundColor: '#1e1e1e', color: '#90caf9', fontSize: '1.2rem', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredReferrals.map((referral, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ color: '#ffffff' }}>{referral.client_name}</TableCell>
                  <TableCell sx={{ color: '#ffffff' }}>{referral.email_address}</TableCell>
                  <TableCell sx={{ color: '#ffffff' }}>{referral.mobile_phone_number}</TableCell>
                  <TableCell sx={{ color: '#ffffff' }}>{referral.referral_code}</TableCell>
                  <TableCell sx={{ color: '#ffffff' }}>{referral.industry}</TableCell>
                  <TableCell sx={{ color: '#ffffff' }}>{referral.additional_info || 'No additional info'}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => markAsFollowedUp(referral.id)}
                    >
                      Mark as Followed Up
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Accordion sx={{ mt: 4, backgroundColor: '#1e1e1e', color: '#ffffff' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#90caf9' }} />}>
            <Typography variant="h6">Followed Up Referrals</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer component={Paper} sx={{ backgroundColor: '#333333' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#90caf9' }}>Client Name</TableCell>
                    <TableCell sx={{ color: '#90caf9' }}>Email Address</TableCell>
                    <TableCell sx={{ color: '#90caf9' }}>Phone</TableCell>
                    <TableCell sx={{ color: '#90caf9' }}>Referral Code</TableCell>
                    <TableCell sx={{ color: '#90caf9' }}>Industry</TableCell>
                    <TableCell sx={{ color: '#90caf9' }}>Additional Info</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {referrals.followedUp.map((referral, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ color: '#ffffff' }}>{referral.client_name}</TableCell>
                      <TableCell sx={{ color: '#ffffff' }}>{referral.email_address}</TableCell>
                      <TableCell sx={{ color: '#ffffff' }}>{referral.mobile_phone_number}</TableCell>
                      <TableCell sx={{ color: '#ffffff' }}>{referral.referral_code}</TableCell>
                      <TableCell sx={{ color: '#ffffff' }}>{referral.industry}</TableCell>
                      <TableCell sx={{ color: '#ffffff' }}>{referral.additional_info || 'No additional info'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      </CardContent>
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default ReferralManagement;
