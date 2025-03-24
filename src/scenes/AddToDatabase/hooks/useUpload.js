import { useState, useRef, useEffect } from 'react';
import { constructWsUrl, constructUrl } from '../../../utils/apiUtils';
import { allowedEmails } from '../../../utils/allowedEmails';
import { useAuth } from '../../../services/UserContext';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import {
  getClientIdWithTimestamp,
  prepareDataForBackend,
  normalizePhoneNumber,
  isSimilar,
  normalizeValue,
  excludeKeysFromObject,
} from '../utils';

const getUsernameFromAllowedEmails = (email) => {
  const multiRoleMember = allowedEmails.find((entry) =>
    entry.members?.some((member) => member.email === email && member.roles)
  );
  if (multiRoleMember) {
    const member = multiRoleMember.members.find((member) => member.email === email);
    return member.name.toLowerCase().replace(/\s+/g, '.');
  }

  for (const entry of allowedEmails) {
    if (entry.emails?.includes(email)) {
      return email.split('@')[0];
    }
    
    const member = entry.members?.find(member => member.email === email);
    if (member) {
      return member.name.toLowerCase().replace(/\s+/g, '.');
    }
  }

  return email.split('@')[0];
};

export const useUpload = (userEmail) => {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [originalData, setOriginalData] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [uploadSummary, setUploadSummary] = useState({
    total_rows: 0,
    processed_rows: 0,
    duplicates_count: 0,
    invalid_records_count: 0,
    valid_rows: 0,
    invalid_rows: 0,
    contact_distribution: {
      mobile_only: 0,
      office_only: 0,
      email_only: 0,
      mobile_and_email: 0,
      office_and_email: 0,
      mobile_and_office: 0,
      all_contacts: 0
    }
  });
  const [duplicates, setDuplicates] = useState([]);
  const [filteredDuplicates, setFilteredDuplicates] = useState([]);
  const [backendResponse, setBackendResponse] = useState('');
  const [meaningfulDuplicates, setMeaningfulDuplicates] = useState([]);
  const [selectedDuplicates, setSelectedDuplicates] = useState([]);
  const [recheckResults, setRecheckResults] = useState({ items: [] });
  const [hasRechecked, setHasRechecked] = useState(false);
  const [dataProcessed, setDataProcessed] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [warnings, setWarnings] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [clientId, setClientId] = useState(localStorage.getItem('clientId') || getClientIdWithTimestamp(userEmail));
  const fileInputRef = useRef(null);

  useEffect(() => {
    const savedClientId = localStorage.getItem('clientId');
    if (savedClientId) {
      console.log('Recovered saved client ID:', savedClientId);
      setClientId(savedClientId);
    }
  }, []);

  const updateClientId = (newClientId) => {
    localStorage.setItem('clientId', newClientId);
    setClientId(newClientId);
  };

  const handleRecheckAndDownload = async () => {
    setIsSending(true);
    try {
      const recheckUrl = constructUrl(`/recheck/${clientId}`);
      const response = await fetch(recheckUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setRecheckResults(data.recheck_results);
      setHasRechecked(true);
      processAndDownloadSummaryData(data.recheck_results);
    } catch (error) {
      console.error("Recheck failed:", error);
    } finally {
      setIsSending(false);
    }
  };

  const closeOverlay = () => {
    setBackendResponse('');
    setIsSending(false);
    setSendSuccess(false);
    setFilteredDuplicates([]);
    setDuplicates([]);
    setDataProcessed(false);
    setFile(null);
    setSuccessMessage('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setUploadProgress(0);
    setUploadSummary({
      total_rows: 0,
      processed_rows: 0,
      duplicates: 0,
    });
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const processAndDownloadSummaryData = (recheckData) => {
    const { details } = recheckData;
    let dataForExcel = [];

    if (details.email_duplicates?.length) {
      details.email_duplicates.forEach(duplicate => {
        dataForExcel.push(
          {
            Location: 'CSV',
            Reason: 'Email Duplicate',
            ...excludeKeysFromObject(duplicate.csv_data, ['client_name_hash', 'email_address_hash', 'row_index', 'id'])
          },
          {
            Location: 'DB',
            Reason: 'Email Duplicate',
            ...excludeKeysFromObject(duplicate.database_data, ['client_name_hash', 'email_address_hash', 'row_index', 'id'])
          }
        );
      });
    }

    if (details.duplicates?.length) {
      details.duplicates.forEach(duplicate => {
        dataForExcel.push(
          {
            Location: 'CSV',
            Reason: 'Duplicate',
            ...excludeKeysFromObject(duplicate.csv_data, ['client_name_hash', 'email_address_hash', 'row_index', 'id'])
          },
          {
            Location: 'DB',
            Reason: 'Duplicate',
            ...excludeKeysFromObject(duplicate.database_data, ['client_name_hash', 'email_address_hash', 'row_index', 'id'])
          }
        );
      });
    }

    if (details.invalid_records?.length) {
      details.invalid_records.forEach(record => {
        dataForExcel.push({
          Location: 'CSV',
          Reason: 'Invalid Record',
          ...record
        });
      });
    }

    const ws = XLSX.utils.json_to_sheet(dataForExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Processed Records");
    XLSX.writeFile(wb, "processed_records.xlsx");
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) {
      setError('No file selected.');
      return;
    }
  
    setFile(file);
    setError('');
  
    Papa.parse(file, {
      complete: (result) => {
        console.log('Parsed result:', result.data.length);  // Debugging: Total rows parsed
  
        // Validation for contacts - a valid row has any of: mobile phone, office phone, or email
        const validRows = result.data.filter(row => 
          row['Mobile Phone number'] || row['Office Phone number'] || row['Email Address']
        );
        const invalidRows = result.data.filter(row => 
          !row['Mobile Phone number'] && !row['Office Phone number'] && !row['Email Address']
        );
  
        console.log('Valid rows:', validRows.length);  // Debugging: Number of valid rows
        console.log('Invalid rows:', invalidRows.length);  // Debugging: Number of invalid rows
  
        const contactDistribution = {
          mobile_only: validRows.filter(row => 
            row['Mobile Phone number'] && !row['Office Phone number'] && !row['Email Address']
          ).length,
          office_only: validRows.filter(row => 
            !row['Mobile Phone number'] && row['Office Phone number'] && !row['Email Address']
          ).length,
          email_only: validRows.filter(row => 
            !row['Mobile Phone number'] && !row['Office Phone number'] && row['Email Address']
          ).length,
          mobile_and_email: validRows.filter(row => 
            row['Mobile Phone number'] && !row['Office Phone number'] && row['Email Address']
          ).length,
          office_and_email: validRows.filter(row => 
            !row['Mobile Phone number'] && row['Office Phone number'] && row['Email Address']
          ).length,
          mobile_and_office: validRows.filter(row => 
            row['Mobile Phone number'] && row['Office Phone number'] && !row['Email Address']
          ).length,
          all_contacts: validRows.filter(row => 
            row['Mobile Phone number'] && row['Office Phone number'] && row['Email Address']
          ).length
        };
  
        console.log('Contact distribution:', contactDistribution);  // Debugging: Contact distribution counts
  
        const cleanedData = validRows.map(row => {
          const { 'Contact History': contactHistory, contact_history, ...rest } = row;
          const note = contactHistory || contact_history || '';
  
          rest.contact_history = note ? JSON.stringify([{
            date: new Date().toISOString().split('T')[0],
            note: note
          }]) : '[]';
  
          return rest;
        });
  
        console.log('Cleaned data:', cleanedData.length);  // Debugging: Total cleaned rows
  
        setUploadSummary(prev => ({
          ...prev,
          total_rows: result.data.length,
          valid_rows: validRows.length,
          invalid_rows: invalidRows.length,
          contact_distribution: contactDistribution
        }));
  
        const parsedData = prepareDataForBackend(cleanedData);
        console.log('Prepared data:', parsedData.length);  // Debugging: Total prepared rows
        setOriginalData(parsedData);
      },
      header: true,
      skipEmptyLines: true,
      transformHeader: header => header.trim(),
      error: (error) => {
        console.error('Parsing error:', error);  // Debugging: Catch parsing errors
      }
    });
  };
  

  const uploadFile = () => {
    if (!file) {
      setError('Please select a file before uploading.');
      return;
    }
  
    setError('');
    setWarnings([]);
    setIsUploading(true);
    setUploadProgress(0);
  
    const preparedData = prepareDataForBackend(originalData);
    const csvString = Papa.unparse(preparedData);
  
    const username = getUsernameFromAllowedEmails(userEmail);
    const clientId = `${username}-${user.uid}-${new Date().toISOString()}`;
    updateClientId(clientId);
  
    const websocketUrl = constructWsUrl(`/ws/clients/bulk-upload/${clientId}`);
    let ws = new WebSocket(websocketUrl);
  
    const connectionTimeout = setTimeout(() => {
      if (ws.readyState !== WebSocket.OPEN) {
        setError('Connection timeout. Please try again.');
        setIsUploading(false);
        ws.close();
      }
    }, 10000);
  
    let processingTimeout;
    const resetProcessingTimeout = () => {
      if (processingTimeout) clearTimeout(processingTimeout);
      processingTimeout = setTimeout(() => {
        setError('Processing timeout. Please try again.');
        setIsUploading(false);
        ws.close();
      }, 30000);
    };
  
    ws.onopen = () => {
      clearTimeout(connectionTimeout);
      console.log("WebSocket connection established.");
      setUploadProgress(0);
      ws.send(csvString);
      resetProcessingTimeout();
    };
  
    ws.onmessage = (event) => {
      resetProcessingTimeout();
      try {
        const data = JSON.parse(event.data);
        console.log("Received websocket message:", data);
  
        switch (data.type) {
          case 'progress':
            // Update both progress and summary with all available details
            setUploadProgress(data.value || 0);
            if (data.details) {
              setUploadSummary(prev => ({
                ...prev,
                total_rows: data.details.total_rows || prev.total_rows,
                processed_rows: data.details.processed_rows || 0,
                duplicates_count: data.details.duplicates_count || 0,
                errors: data.details.errors || 0,
                valid_rows: data.details.valid_rows || prev.valid_rows,
                invalid_rows: data.details.invalid_rows || prev.invalid_rows,
                contact_distribution: {
                  ...prev.contact_distribution,
                  ...data.details.contact_distribution
                }
              }));
            }
            break;
  
          case 'complete':
            clearTimeout(processingTimeout);
            // Ensure we capture all final statistics
            setUploadProgress(100);
            setUploadSummary(prev => ({
              ...prev,
              ...data.details,
              processed_rows: data.details.processed_rows,
              duplicates_count: data.details.duplicates_count,
              errors: data.details.errors,
              contact_distribution: {
                ...prev.contact_distribution,
                ...data.details.contact_distribution
              }
            }));
            setIsUploading(false);
            setDataProcessed(true);
            
            if (data.details.duplicates) {
              processDuplicates(data.details.duplicates, data.details);
            }
  
            ws.send(JSON.stringify({ type: 'complete_acknowledged' }));
            setTimeout(() => ws.close(), 500);
            break;
  
          case 'error':
            setError(data.message);
            setIsUploading(false);
            ws.close();
            break;
  
          case 'warning':
            if (!data.message.includes('Unrecognized franchise')) {
              setWarnings(prev => [...prev, data.message]);
            }
            break;
  
          case 'duplicatesFound':
            setUploadProgress(100);
            if (data.details) {
              setUploadSummary(prev => ({
                ...prev,
                ...data.details
              }));
            }
            break;
        }
      } catch (e) {
        console.error("WebSocket message error:", e);
        setError("Invalid message format received from server.");
        setIsUploading(false);
        ws.close();
      }
    };
  
    ws.onerror = (error) => {
      clearTimeout(processingTimeout);
      console.error("WebSocket error:", error);
      setError("WebSocket connection failed. Please check your network and try again.");
      setIsUploading(false);
    };
  
    ws.onclose = (event) => {
      clearTimeout(processingTimeout);
      console.log("WebSocket closed:", event);
      if (!event.wasClean) {
        setError("Connection closed unexpectedly. Please try again.");
      }
      setIsUploading(false);
    };
  
    return () => {
      clearTimeout(processingTimeout);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  };
  

  // Keep all other existing functions the same
  const processDuplicates = (receivedDuplicates, details) => {
    let meaningfulDuplicates = [];
    let nonMeaningfulDuplicates = [];
    let nonMeaningfulDuplicateIdentifiers = new Set();
  
    receivedDuplicates.forEach((duplicate) => {
      const normalizedCsvPhoneNumber = normalizePhoneNumber(duplicate.csv_data.mobile_phone_number);
      const normalizedDatabasePhoneNumber = normalizePhoneNumber(duplicate.database_data.mobile_phone_number);
  
      const namesAreSimilar = duplicate.csv_data.client_name &&
        duplicate.database_data.client_name &&
        isSimilar(duplicate.csv_data.client_name, duplicate.database_data.client_name);
      const phoneNumbersMatch = normalizedCsvPhoneNumber &&
        normalizedDatabasePhoneNumber &&
        normalizedCsvPhoneNumber === normalizedDatabasePhoneNumber;
  
      if (namesAreSimilar && phoneNumbersMatch) {
        nonMeaningfulDuplicates.push({ ...duplicate, reason: 'Similar name and phone number' });
        nonMeaningfulDuplicateIdentifiers.add(duplicate.csv_data.id);
      } else {
        const hasMeaningfulDifferences = Object.keys(duplicate.csv_data).some(
          (key) =>
            !['client_name', 'phone_number'].includes(key) &&
            normalizeValue(duplicate.csv_data[key]) !== normalizeValue(duplicate.database_data[key])
        );
  
        if (hasMeaningfulDifferences) {
          if (!nonMeaningfulDuplicateIdentifiers.has(duplicate.csv_data.id)) {
            meaningfulDuplicates.push({ ...duplicate, reason: 'Meaningful differences found' });
          }
        } else {
          nonMeaningfulDuplicates.push({ ...duplicate, reason: 'No meaningful differences' });
          nonMeaningfulDuplicateIdentifiers.add(duplicate.csv_data.id);
        }
      }
    });
  
    setMeaningfulDuplicates(meaningfulDuplicates);
  
    if (meaningfulDuplicates.length > 0 || nonMeaningfulDuplicates.length > 0) {
      downloadEmailDuplicatesAsExcel(
        details.email_duplicates || [],
        details.invalid_records || [],
        nonMeaningfulDuplicates
      );
    }
  };

  const handleDuplicateSelectionChange = (duplicateId, isSelected) => {
    setSelectedDuplicates(prev => 
      isSelected ? [...prev, duplicateId] : prev.filter(id => id !== duplicateId)
    );
  };

  const sendFilteredDuplicatesToBackend = async () => {
    setIsSending(true);
    const preparedData = filteredDuplicates.map(({ csv_data }) => {
      const entryForSubmission = Object.entries(csv_data)
        .filter(([key]) => key !== 'client_name_hash' && key !== 'id')
        .reduce((acc, [key, value]) => {
          if (key === 'contact_history' && typeof value === 'string') {
            try {
              acc[key] = JSON.parse(value);
            } catch {
              acc[key] = [];
            }
          } else {
            acc[key] = value;
          }
          return acc;
        }, {});
      return entryForSubmission;
    });

    try {
      const response = await fetch(constructUrl('/clients/bulk-resubmit/'), {method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preparedData),
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }

      const result = await response.json();
      setIsSending(false);
      setSendSuccess(true);

      if (result.duplicates?.length) {
        downloadDuplicatesAsExcelOnResubmit(result.duplicates);
      }

      setBackendResponse(result.message);
    } catch (error) {
      setIsSending(false);
      setBackendResponse(error.message);
    }
  };

  const downloadDuplicatesAsExcelOnResubmit = (duplicates) => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(duplicates);
    XLSX.utils.book_append_sheet(wb, ws, "Duplicates");
    XLSX.writeFile(wb, "duplicates1.xlsx");
  };

  const handleSubmitSelectedDuplicates = async () => {
    setIsSending(true);

    const duplicatesToSend = meaningfulDuplicates.filter(duplicate =>
      selectedDuplicates.includes(duplicate.csv_data.id)
    );

    const preparedData = duplicatesToSend.map(({ csv_data }) => {
      return Object.entries(csv_data)
        .filter(([key]) => key !== 'client_name_hash' && key !== 'id')
        .reduce((acc, [key, value]) => {
          if (key === 'contact_history' && typeof value === 'string') {
            try {
              acc[key] = JSON.parse(value);
            } catch (error) {
              console.error('Failed to parse contact_history:', error);
              acc[key] = [];
            }
          } else {
            acc[key] = normalizeValue(value);
          }
          return acc;
        }, {});
    });

    try {
      const response = await fetch(constructUrl('/clients/bulk-resubmit/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preparedData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();

      if (result.duplicates && result.duplicates.length > 0) {
        downloadDuplicatesAsExcelOnResubmit(result.duplicates);
      }

      setBackendResponse(result.message);
      setSendSuccess(true);
    } catch (error) {
      console.error("Error submitting data:", error);
      setBackendResponse(error.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleSingleClientSubmit = async (formData) => {
    try {
      const processedData = {
        ...formData,
        contact_history: formData.contact_history 
          ? JSON.stringify([{
              date: new Date().toISOString().split('T')[0],
              note: formData.contact_history
            }])
          : '[]'
      };
  
      const response = await fetch(constructUrl('/clients/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processedData),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const result = await response.json();
      setSuccessMessage('Client added successfully!');
      setIsFormOpen(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const downloadEmailDuplicatesAsExcel = (emailDuplicates, invalidRecords, nonMeaningfulDuplicates) => {
    let dataForExcel = [];

    emailDuplicates.forEach(duplicate => {
      const csvDataRow = {
        Location: 'CSV',
        Reason: 'Email Duplicate',
        client_name: duplicate.csv_data.client_name,
        ...excludeKeysFromObject(duplicate.csv_data, ['client_name', 'client_name_hash', 'email_address_hash', 'row_index', 'id'])
      };
      const dbDataRow = {
        Location: 'DB',
        Reason: 'Email Duplicate',
        client_name: duplicate.database_data.client_name,
        ...excludeKeysFromObject(duplicate.database_data, ['client_name', 'client_name_hash', 'email_address_hash', 'row_index', 'id'])
      };
      dataForExcel.push(csvDataRow, dbDataRow);
    });

    invalidRecords.forEach(record => {
      const invalidRecordRow = {
        Location: 'CSV',
        Reason: 'Invalid Record',
        client_name: record.client_name,
        ...excludeKeysFromObject(record, ['client_name', 'client_name_hash', 'email_address_hash', 'row_index', 'id'])
      };
      dataForExcel.push(invalidRecordRow);
    });

    nonMeaningfulDuplicates.forEach(duplicate => {
      const combinedKeys = { ...duplicate.csv_data, ...duplicate.database_data };
      const csvDataRow = {
        Location: 'Duplicate - CSV',
        Reason: duplicate.reason || 'Non-Meaningful Duplicate',
        client_name: duplicate.csv_data?.client_name || '',
        ...excludeKeysFromObject(combinedKeys, ['client_name', 'client_name_hash', 'email_address_hash', 'row_index', 'id']),
        ...excludeKeysFromObject(duplicate.csv_data, ['client_name_hash', 'email_address_hash', 'row_index', 'id'])
      };

      const dbDataRow = {
        Location: 'Duplicate - DB',
        Reason: duplicate.reason || 'Non-Meaningful Duplicate',
        client_name: duplicate.database_data?.client_name || '',
        ...excludeKeysFromObject(combinedKeys, ['client_name', 'client_name_hash', 'email_address_hash', 'row_index', 'id']),
        ...excludeKeysFromObject(duplicate.database_data, ['client_name_hash', 'email_address_hash', 'row_index', 'id'])
      };

      dataForExcel.push(csvDataRow, dbDataRow);
    });

    const ws = XLSX.utils.json_to_sheet(dataForExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Processed Duplicates");
    XLSX.writeFile(wb, "processed_duplicates.xlsx");
  };

  return {
    file,
    setFile,
    isUploading,
    setIsUploading,
    error,
    setError,
    uploadProgress,
    setUploadProgress,
    originalData,
    setOriginalData,
    successMessage,
    setSuccessMessage,
    uploadSummary,
    setUploadSummary,
    duplicates,
    setDuplicates,
    filteredDuplicates,
    setFilteredDuplicates,
    backendResponse,
    setBackendResponse,
    meaningfulDuplicates,
    setMeaningfulDuplicates,
    selectedDuplicates,
    setSelectedDuplicates,
    recheckResults,
    setRecheckResults,
    hasRechecked,
    setHasRechecked,
    dataProcessed,
    setDataProcessed,
    isSending,
    setIsSending,
    sendSuccess,
    setSendSuccess,
    updateClientId,
    handleRecheckAndDownload,
    closeOverlay,
    processAndDownloadSummaryData,
    handleFileChange,
    handleSingleClientSubmit,
    warnings,
    setWarnings,
    uploadFile,
    handleDuplicateSelectionChange,
    sendFilteredDuplicatesToBackend,
    downloadDuplicatesAsExcelOnResubmit,
    handleSubmitSelectedDuplicates,
    downloadEmailDuplicatesAsExcel,
    processAndDownloadSummaryData,
    processDuplicates
  };
};