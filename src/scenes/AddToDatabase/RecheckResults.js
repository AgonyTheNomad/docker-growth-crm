import React from 'react';

export const RecheckResults = ({ hasRechecked, recheckResults }) => (
  hasRechecked && recheckResults && recheckResults.items ? (
    <div style={{ padding: '10px', backgroundColor: '#f0f0f0', marginTop: '10px' }}>
      <h4>Recheck Results:</h4>
      <ul>
        {recheckResults.items.map(item => (
          <li key={item.id}>{item.detail}</li>
        ))}
      </ul>
    </div>
  ) : null
);
