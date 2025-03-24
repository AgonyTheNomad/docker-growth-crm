import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import axios from 'axios';
import LinearProgressWithLabel from './../../components/LinearProgressWithLabel';
import { constructUrl } from '../../utils/apiUtils';

const CSVExportPage = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState('');

  const handleExport = async () => {
    setIsExporting(true);
    setProgress(0);
    setExportStatus('Starting export...');

    try {
      const exportUrl = constructUrl('/export-clients-to-csv');
      const response = await axios.get(exportUrl, {
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        },
      });

      const blob = new Blob([response.data], { type: 'text/csv' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'clients_data.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();

      setExportStatus('Export completed successfully!');
    } catch (error) {
      console.error('Export error:', error);
      setExportStatus('An error occurred during export. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Box sx={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <Typography variant="h4" gutterBottom>Export Clients to CSV</Typography>
      
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleExport} 
        sx={{ mt: 2 }} 
        disabled={isExporting}
      >
        {isExporting ? 'Exporting...' : 'Download CSV'}
      </Button>

      {isExporting && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">Export Progress</Typography>
          <LinearProgressWithLabel value={progress} />
        </Box>
      )}

      <Typography sx={{ mt: 2 }}>{exportStatus}</Typography>
    </Box>
  );
};

export default CSVExportPage;