import React from 'react';

const ErrorDisplay = ({ error, warnings }) => {
  if (!error && (!warnings || warnings.length === 0)) return null;

  return (
    <div style={{ marginTop: '20px' }}>
      {error && (
        <div style={{
          backgroundColor: '#ffe6e6',
          color: '#a00',
          padding: '10px',
          borderRadius: '5px',
          marginTop: '10px',
          fontSize: '14px',
        }}>
          <p style={{ margin: 0 }}>{error}</p>
        </div>
      )}

      {warnings && warnings.length > 0 && (
        <div style={{
          backgroundColor: '#fff3e6',
          color: '#8B4513',
          padding: '10px',
          borderRadius: '5px',
          marginTop: '10px',
          fontSize: '14px',
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>Warnings:</p>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {warnings.map((warning, index) => (
              <li key={index} style={{ marginBottom: '4px' }}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ErrorDisplay;