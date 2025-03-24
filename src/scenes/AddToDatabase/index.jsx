import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../services/UserContext';
import { getClientIdWithTimestamp, prepareDataForBackend } from './utils';
import { MeaningfulDuplicates } from './MeaningfulDuplicates';
import { DuplicatesTable } from './DuplicatesTable';
import SingleClientForm from './SingleClientForm';
import { FileUpload } from './FileUpload';
import UploadProgress from './UploadProgress';
import { UploadSummary } from './UploadSummary';
import { RecheckResults } from './RecheckResults';
import ErrorDisplay from './ErrorDisplay';
import { 
  summaryStyle, 
  summaryHeaderStyle, 
  greenButtonStyle, 
  overlayStyle, 
  messageBoxStyle, 
  errorStyle 
} from './styles/add_to_database_styles';
import { useUpload } from './hooks/useUpload';
import UploadLeadsSummary from './UploadLeadsSummary';


const AddToDatabase = () => {
  const { userEmail } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [excelData, setExcelData] = useState(null);
  
  const {
    file,
    setFile,
    isUploading,
    setIsUploading,
    error,
    setError,
    warnings,
    setWarnings,
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
    uploadFile,
    handleDuplicateSelectionChange,
    sendFilteredDuplicatesToBackend,
    downloadDuplicatesAsExcelOnResubmit,
    handleSubmitSelectedDuplicates
  } = useUpload(userEmail);

  useEffect(() => {
    if (recheckResults?.details?.duplicates) {
      setExcelData(recheckResults.details.duplicates);
    }
  }, [recheckResults]);

  const handleSingleClientSubmit = async (formData) => {
    try {
      setIsSending(true);
      const processedData = {
        ...formData,
        contact_history: formData.contact_history 
          ? JSON.stringify([{
              date: new Date().toISOString().split('T')[0],
              note: formData.contact_history
            }])
          : '[]'
      };

      const response = await fetch('/api/clients/', {
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
    } finally {
      setIsSending(false);
    }
  };

  const handleRecheck = async () => {
    const result = await handleRecheckAndDownload();
    if (result?.details?.duplicates) {
      setExcelData(result.details.duplicates);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Add Leads</h2>
        <button
          onClick={() => setIsFormOpen(true)}
          style={greenButtonStyle}
        >
          Add Single Client
        </button>
      </div>
      
      <p>Verify if the Lead info is not duplicated first.</p>
      <FileUpload
  file={file}
  handleFileChange={handleFileChange}
  uploadFile={uploadFile}
  isUploading={isUploading}
  fileInputRef={useRef(null)}
  greenButtonStyle={greenButtonStyle}
/>

{successMessage && (
  <p style={{ color: 'green', marginTop: '10px' }}>
    {successMessage}
  </p>
)}

<UploadLeadsSummary 
  uploadSummary={uploadSummary}
  uploadProgress={uploadProgress}  // Pass the progress value as a prop
  error={error}
  warnings={warnings}
  successMessage={successMessage}
  isUploading={isUploading}
/>

<DuplicatesTable
  dataProcessed={dataProcessed}
  filteredDuplicates={filteredDuplicates}
  uploadSummary={uploadSummary}
  downloadData={excelData}
/>
      
      <MeaningfulDuplicates
        meaningfulDuplicates={meaningfulDuplicates}
        selectedDuplicates={selectedDuplicates}
        handleDuplicateSelectionChange={handleDuplicateSelectionChange}
        handleSubmitSelectedDuplicates={handleSubmitSelectedDuplicates}
        isSending={isSending}
        greenButtonStyle={greenButtonStyle}
      />
      
      <div>
        {meaningfulDuplicates.length > 0 && (
          <button
            onClick={sendFilteredDuplicatesToBackend}
            style={greenButtonStyle}
            disabled={isSending}
          >
            {isSending ? 'Sending...' : 'Send Duplicates With Differences'}
          </button>
        )}
        <button
          onClick={handleRecheck}
          style={greenButtonStyle}
          disabled={isSending}
        >
          {isSending ? 'Rechecking...' : 'Recheck and Download'}
        </button>
      </div>
      
      <RecheckResults hasRechecked={hasRechecked} recheckResults={recheckResults} />
      
      {backendResponse && (
        <div style={overlayStyle} onClick={closeOverlay}>
          <div style={messageBoxStyle}>
            {backendResponse}
            <p>Click anywhere to close</p>
          </div>
        </div>
      )}

      <SingleClientForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSingleClientSubmit}
        isSending={isSending}
      />
    </div>
  );
};

export default AddToDatabase;