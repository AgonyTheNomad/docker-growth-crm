import React, { useState, useEffect } from 'react';
import {
  duplicateContainerStyle,
  tableStyle,
  trStyle,
  thTdStyle,
  thStyle,
  summaryHeaderStyle,
  greenButtonStyle
} from './styles/add_to_database_styles';
import { constructWsUrl } from '../../utils/apiUtils';
import { getClientIdWithTimestamp } from './utils';

export const DuplicatesTable = ({
  dataProcessed,
  filteredDuplicates,
  uploadSummary,
  downloadData,
  userEmail
}) => {
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [duplicatesToDisplay, setDuplicatesToDisplay] = useState([]);
  const [selectedDuplicates, setSelectedDuplicates] = useState(new Set());
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (downloadData?.length) {
      const uniqueDuplicates = new Set();
      const processedDuplicates = [];

      for (let i = 0; i < downloadData.length; i++) {
        const entry = downloadData[i];
        if (entry.Location === 'CSV') {
          const key = `${entry['Client Name'] || entry.client_name}-${entry['Mobile Phone number'] || entry.mobile_phone_number}-${entry['Email Address'] || entry.email_address}`;
          
          if (!uniqueDuplicates.has(key)) {
            uniqueDuplicates.add(key);
            
            const dbEntry = downloadData[i + 1];
            if (dbEntry && dbEntry.Location === 'DB') {
              processedDuplicates.push({
                csv_data: entry,
                database_data: dbEntry,
                duplicate_reason: entry.Reason,
                id: key
              });
              i++;
            }
          }
        }
      }

      setDuplicateCount(uniqueDuplicates.size);
      setDuplicatesToDisplay(processedDuplicates);
    } else {
      const duplicatesMap = new Map();
      const duplicates = uploadSummary?.duplicates || filteredDuplicates || [];

      duplicates.forEach(duplicate => {
        const csvData = duplicate.csv_data || duplicate;
        const key = `${csvData.client_name}-${csvData.mobile_phone_number}-${csvData.email_address}`;
        
        if (!duplicatesMap.has(key)) {
          duplicatesMap.set(key, { ...duplicate, id: key });
        }
      });

      const uniqueDuplicates = Array.from(duplicatesMap.values());
      setDuplicateCount(uniqueDuplicates.length);
      setDuplicatesToDisplay(uniqueDuplicates);
    }
  }, [uploadSummary, downloadData, filteredDuplicates]);

  const handleSelectDuplicate = (id) => {
    const newSelected = new Set(selectedDuplicates);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedDuplicates(newSelected);
  };

  const handleSubmit = async () => {
    if (selectedDuplicates.size === 0) {
      setError("Please select at least one entry to submit");
      return;
    }

    setIsSending(true);
    setError(null);
    setSuccessMessage(null);

    const selectedData = duplicatesToDisplay
      .filter(dup => selectedDuplicates.has(dup.id))
      .map(dup => {
        const { id, client_name_hash, __typename, ...cleanData } = dup.csv_data;
        return {
          ...cleanData,
          status: cleanData.status || 'New',
          change_date: new Date().toISOString(),
          contact_history: cleanData.contact_history || '[]'
        };
      });

    try {
      const ws = new WebSocket(constructWsUrl(`/ws/clients/resubmit/${getClientIdWithTimestamp(userEmail)}`));

      const connectionTimeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          ws.close();
          setError("Connection timeout. Please try again.");
          setIsSending(false);
        }
      }, 10000);

      ws.onopen = () => {
        clearTimeout(connectionTimeout);
        ws.send(JSON.stringify({
          selectedData: selectedData
        }));
      };

      ws.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);
          
          switch (response.type) {
            case 'success':
              setSuccessMessage(response.message);
              setSelectedDuplicates(new Set());
              ws.close();
              break;

            case 'error':
              setError(response.message);
              ws.close();
              break;
          }
        } catch (e) {
          setError("Invalid response from server");
          ws.close();
        }
      };

      ws.onerror = () => {
        setError("WebSocket connection failed");
        ws.close();
      };

      ws.onclose = () => {
        setIsSending(false);
      };

    } catch (error) {
      setError(error.message || "Failed to connect to server");
      setIsSending(false);
    }
  };

  if (!dataProcessed) return null;

  return (
    <div>
      {duplicateCount > 0 ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={summaryHeaderStyle}>Duplicates Found: {duplicateCount}</h3>
            <button
              onClick={handleSubmit}
              disabled={selectedDuplicates.size === 0 || isSending}
              style={{
                ...greenButtonStyle,
                opacity: selectedDuplicates.size === 0 || isSending ? 0.5 : 1
              }}
            >
              {isSending ? 'Submitting...' : `Submit Selected (${selectedDuplicates.size})`}
            </button>
          </div>

          {error && (
            <div style={{ color: 'red', marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#ffebee' }}>
              {error}
            </div>
          )}
          
          {successMessage && (
            <div style={{ color: 'green', marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#e8f5e9' }}>
              {successMessage}
            </div>
          )}

          {duplicatesToDisplay.map((group, index) => (
            <div key={index} style={duplicateContainerStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input
                  type="checkbox"
                  checked={selectedDuplicates.has(group.id)}
                  onChange={() => handleSelectDuplicate(group.id)}
                  style={{ cursor: 'pointer' }}
                />
                <h4 style={summaryHeaderStyle}>
                  {group.csv_data?.client_name || group.csv_data?.['Client Name']}
                  {group.duplicate_reason && (
                    <span style={{ fontSize: '0.9em', color: '#666', marginLeft: '8px' }}>
                      ({group.duplicate_reason})
                    </span>
                  )}
                </h4>
              </div>
              <table style={tableStyle}>
                <thead>
                  <tr style={trStyle}>
                    <th style={thStyle}>Source</th>
                    <th style={thStyle}>Client Name</th>
                    <th style={thStyle}>Email</th>
                    <th style={thStyle}>Phone</th>
                    <th style={thStyle}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={trStyle}>
                    <td style={thTdStyle}>CSV</td>
                    <td style={thTdStyle}>
                      {group.csv_data?.client_name || group.csv_data?.['Client Name']}
                    </td>
                    <td style={thTdStyle}>
                      {group.csv_data?.email_address || group.csv_data?.['Email Address']}
                    </td>
                    <td style={thTdStyle}>
                      {group.csv_data?.mobile_phone_number || group.csv_data?.['Mobile Phone number']}
                    </td>
                    <td style={thTdStyle}>
                      {group.csv_data?.status || group.csv_data?.['Status']}
                    </td>
                  </tr>
                  {group.database_data && (
                    <tr style={trStyle}>
                      <td style={thTdStyle}>Database</td>
                      <td style={thTdStyle}>
                        {group.database_data?.client_name || group.database_data?.['Client Name']}
                      </td>
                      <td style={thTdStyle}>
                        {group.database_data?.email_address || group.database_data?.['Email Address']}
                      </td>
                      <td style={thTdStyle}>
                        {group.database_data?.mobile_phone_number || group.database_data?.['Mobile Phone number']}
                      </td>
                      <td style={thTdStyle}>
                        {group.database_data?.status || group.database_data?.['Status']}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ))}
        </>
      ) : (
        dataProcessed && <p>No duplicates found.</p>
      )}
    </div>
  );
};

export default DuplicatesTable;