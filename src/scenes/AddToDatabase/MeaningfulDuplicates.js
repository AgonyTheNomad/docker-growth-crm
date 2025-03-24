import React from 'react';
import { Checkbox } from 'semantic-ui-react';
import {
  summaryHeaderStyle,
  improvedTableStyle,
  trStyle,
  checkboxColumnStyle,
  thStyle,
  checkboxStyle,
  checkboxLabelStyle,
  buttonContainerStyle,
  thTdStyle
} from './styles/add_to_database_styles';

export const MeaningfulDuplicates = ({
  meaningfulDuplicates,
  selectedDuplicates,
  handleDuplicateSelectionChange,
  handleSubmitSelectedDuplicates,
  isSending,
  greenButtonStyle
}) => (
  meaningfulDuplicates.length === 0 ? (
    <p></p>
  ) : (
    <div style={{ maxWidth: '800px', margin: 'auto' }}>
      <h3 style={summaryHeaderStyle}>Meaningful Duplicate Data:</h3>
      <table style={improvedTableStyle}>
        <thead>
          <tr style={trStyle}>
            <th style={checkboxColumnStyle}></th>
            <th style={thStyle}>Source / Fields</th>
            <th style={thStyle}>Client Name</th>
            <th style={thStyle}>Date</th>
            <th style={thStyle}>Company</th>
            <th style={thStyle}>Mobile Phone Number</th>
            <th style={thStyle}>Office Phone Number</th>
            <th style={thStyle}>Email Address</th>
            <th style={thStyle}>Street Address</th>
            <th style={thStyle}>City County</th>
            <th style={thStyle}>State</th>
            <th style={thStyle}>Zip</th>
          </tr>
        </thead>
        <tbody>
          {meaningfulDuplicates.map((duplicate, index) => (
            <React.Fragment key={`meaningful-${index}`}>
              <tr style={trStyle}>
                <td style={checkboxColumnStyle}>
                  <Checkbox
                    style={checkboxStyle}
                    checked={selectedDuplicates.includes(duplicate.csv_data.id)}
                    onChange={(e, { checked }) => handleDuplicateSelectionChange(duplicate.csv_data.id, checked)}
                  />
                  <label style={checkboxLabelStyle}>Click to send to database</label>
                </td>
                <td style={thTdStyle}>CSV</td>
                <td style={thTdStyle}>{duplicate.csv_data.client_name || duplicate.csv_data['Client Name'] || 'N/A'}</td>
                <td style={thTdStyle}>{duplicate.csv_data.date || duplicate.csv_data['Date'] || 'N/A'}</td>
                <td style={thTdStyle}>{duplicate.csv_data.company || duplicate.csv_data['Company'] || 'N/A'}</td>
                <td style={thTdStyle}>{duplicate.csv_data.mobile_phone_number || duplicate.csv_data['Mobile Phone number'] || 'N/A'}</td>
                <td style={thTdStyle}>{duplicate.csv_data.office_phone_number || duplicate.csv_data['Office Phone number'] || 'N/A'}</td>
                <td style={thTdStyle}>{duplicate.csv_data.email_address || duplicate.csv_data['Email Address'] || 'N/A'}</td>
                <td style={thTdStyle}>{duplicate.csv_data.street_address || duplicate.csv_data['Street Address'] || 'N/A'}</td>
                <td style={thTdStyle}>{duplicate.csv_data.city_county || duplicate.csv_data['City/County'] || 'N/A'}</td>
                <td style={thTdStyle}>{duplicate.csv_data.state || duplicate.csv_data['State'] || 'N/A'}</td>
                <td style={thTdStyle}>{duplicate.csv_data.zip || duplicate.csv_data['ZIP'] || 'N/A'}</td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
      <div style={buttonContainerStyle}>
        <button
          onClick={handleSubmitSelectedDuplicates}
          style={greenButtonStyle}
          disabled={isSending || selectedDuplicates.length === 0}
        >
          {isSending ? 'Sending...' : 'Send Selected Duplicates'}
        </button>
      </div>
    </div>
  )
);