import React from 'react';
import { summaryStyle, summaryHeaderStyle, summaryDetailStyle } from './styles/add_to_database_styles';

export const UploadSummary = ({ uploadSummary }) => {
  if (!uploadSummary) return null;

  const {
    total_rows = 0,
    valid_rows = 0,
    invalid_rows = 0,
    contact_distribution = {
      phone_only: 0,
      email_only: 0,
      both: 0
    }
  } = uploadSummary;

  return (
    <div style={summaryStyle}>
      <h3 style={summaryHeaderStyle}>Upload Summary</h3>
      <p style={summaryDetailStyle}>Total Rows: {total_rows}</p>
      <p style={summaryDetailStyle}>Valid Records: {valid_rows}</p>
      <p style={summaryDetailStyle}>Invalid Records (missing contact info): {invalid_rows}</p>
      
      <h4 style={{...summaryHeaderStyle, fontSize: '20px', marginTop: '20px'}}>Contact Information</h4>
      <p style={summaryDetailStyle}>Phone Only: {contact_distribution.phone_only}</p>
      <p style={summaryDetailStyle}>Email Only: {contact_distribution.email_only}</p>
      <p style={summaryDetailStyle}>Both Phone and Email: {contact_distribution.both}</p>
    </div>
  );
};

export default UploadSummary;