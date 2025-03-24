import React from 'react';

export const FileUpload = ({ file, handleFileChange, uploadFile, isUploading, fileInputRef, greenButtonStyle }) => (
  <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '1rem' }}>
    <label htmlFor="csvFile">Upload CSV File:</label>
    <input
      type="file"
      id="csvFile"
      accept=".csv"
      onChange={handleFileChange}
      style={{ display: 'block', margin: '10px 0' }}
      ref={fileInputRef}
    />
    <button
      onClick={uploadFile}
      style={greenButtonStyle}
    >
      {isUploading ? 'Uploading...' : 'Upload File'}
    </button>
  </div>
);
