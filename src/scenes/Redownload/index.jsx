import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { constructUrl } from '../../../src/utils/apiUtils';
import { useAuth } from '../../services/UserContext'; // Import useAuth to get userName
import {
  LoadingIndicator,
  StyledAccordion,
  StyledAccordionSummary,
  StyledButton,
} from '../../../src/style';
import { AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import './duplicates.css';

const prepareDataForExcel = (emailDuplicates, generalDuplicates, invalidRecords) => {
  const formatDuplicateData = (item, location) => ({
    Location: location,
    Reason: 'Email Duplicate',
    Date: item.date,
    ClientName: item.client_name,
    Company: item.company,
    MobilePhoneNumber: item.mobile_phone_number,
    EmailAddress: item.email_address,
    Status: item.status,
  });

  const emailDuplicateData = emailDuplicates.flatMap((item) => [
    formatDuplicateData(item.csv_data, 'CSV'),
    formatDuplicateData(item.database_data, 'Database'),
  ]);

  const generalDuplicateData = generalDuplicates.flatMap((item) => [
    formatDuplicateData(item.csv_data, 'CSV'),
    formatDuplicateData(item.database_data, 'Database'),
  ]);

  const invalidRecordData = invalidRecords.map((item) => ({
    ClientName: item.client_name,
    MobilePhoneNumber: item.mobile_phone_number,
    EmailAddress: item.email_address,
    Status: item.status,
    Reason: 'Invalid Record',
  }));

  return { emailDuplicateData, generalDuplicateData, invalidRecordData };
};

const processAndDownloadExcel = ({ emailDuplicateData, generalDuplicateData, invalidRecordData }, fileName) => {
  const wb = XLSX.utils.book_new();
  if (emailDuplicateData.length > 0) {
    const wsEmail = XLSX.utils.json_to_sheet(emailDuplicateData);
    XLSX.utils.book_append_sheet(wb, wsEmail, 'Email Duplicates');
  }
  if (generalDuplicateData.length > 0) {
    const wsGeneral = XLSX.utils.json_to_sheet(generalDuplicateData);
    XLSX.utils.book_append_sheet(wb, wsGeneral, 'General Duplicates');
  }
  if (invalidRecordData.length > 0) {
    const wsInvalid = XLSX.utils.json_to_sheet(invalidRecordData);
    XLSX.utils.book_append_sheet(wb, wsInvalid, 'Invalid Records');
  }
  XLSX.writeFile(wb, `${fileName.replace('.json', '')}_duplicates.xlsx`);
};

const fetchWithRetry = async (url, options = {}, retries = 3, backoff = 300) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
    return await response.json();
  } catch (error) {
    if (retries > 1) {
      await new Promise((res) => setTimeout(res, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    } else {
      throw error;
    }
  }
};

const formatDateFromFilename = (filename) => {
  try {
    // Extract everything before _summary.json
    const parts = filename.split('_')[0];
    
    // Get the username part (including 'single-' if it exists)
    const username = parts.substring(0, parts.indexOf('-2025')); // Extract everything before the year
    
    // Extract date and time components
    const dateTimeMatch = filename.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2})-(\d{2})-(\d{2})-\d{2}-\d{2}/);
    
    if (dateTimeMatch) {
      const [, year, month, day, hour, minute, second] = dateTimeMatch;
      const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
      const formattedDate = date.toLocaleDateString('en-US');
      const formattedTime = date.toLocaleTimeString('en-US');
      
      return { 
        name: username, 
        formattedDate, 
        formattedTime, 
        date 
      };
    }
  } catch (error) {
    console.error('Error parsing filename:', filename, error);
  }
  
  console.warn(`Filename does not match expected pattern: ${filename}`);
  return { 
    name: filename, 
    formattedDate: '', 
    formattedTime: '', 
    date: new Date(0) 
  };
};

const DuplicatesDownloader = () => {
  const { userName } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const url = constructUrl(`/api/clients/files/list?username=${encodeURIComponent(userName)}`);
        console.log('Fetching files from:', url);
        const response = await fetchWithRetry(url, {
          headers: {
            'Authorization': `Username ${userName}`,
          },
        });
        console.log('Received file list response:', response);

        const fileList = Array.isArray(response.files) ? response.files : [];
        console.log('Extracted file list:', fileList);

        if (!fileList.length) {
          throw new Error('No files found.');
        }

        setFiles(fileList);
      } catch (error) {
        console.error('Error fetching files:', error);
        setError('Failed to load files: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [userName]);

  const downloadDataAsExcel = async (fileName) => {
    try {
      const url = constructUrl(`/api/clients/download-duplicate/${fileName}?username=${encodeURIComponent(userName)}`);
      const result = await fetchWithRetry(url, {
        headers: {
          'Authorization': `Username ${userName}`,
        },
      });
      const { email_duplicates, duplicates, invalid_records } = result.details;
      const data = prepareDataForExcel(email_duplicates, duplicates, invalid_records);
      processAndDownloadExcel(data, fileName);
    } catch (error) {
      console.error('Download error:', error);
      alert(`Failed to download ${fileName}: ` + error.message);
    }
  };

  const groupedFiles = files.reduce((acc, file) => {
    const { name, formattedDate, formattedTime, date } = formatDateFromFilename(file);
    if (!acc[formattedDate]) {
      acc[formattedDate] = [];
    }
    acc[formattedDate].push({ file, name, formattedTime, date });
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedFiles).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div className="container">
      <h1>Available Duplicates Data</h1>
      {loading && <LoadingIndicator />}
      {error && <p className="error">{error}</p>}
      {!loading && sortedDates.length > 0 ? (
        sortedDates.map((date) => (
          <StyledAccordion key={date}>
            <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{date}</Typography>
            </StyledAccordionSummary>
            <AccordionDetails>
              {groupedFiles[date]
                .sort((a, b) => b.date - a.date)
                .map(({ file, name, formattedTime }, index) => (
                  <div key={index} className="file-item">
                    <Typography className="file-name">
                      {name} - {date} {formattedTime && `at ${formattedTime} MST`}
                    </Typography>
                    <StyledButton onClick={() => downloadDataAsExcel(file)}>Download Excel</StyledButton>
                  </div>
                ))}
            </AccordionDetails>
          </StyledAccordion>
        ))
      ) : (
        !loading && <p className="loading">No files found or still loading...</p>
      )}
    </div>
  );
};

export default DuplicatesDownloader;