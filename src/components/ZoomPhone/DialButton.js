import React from 'react';

const DialButton = ({ onCall, disabled }) => {
  return (
    <button onClick={onCall} disabled={disabled}>
      Call
    </button>
  );
};

export default DialButton;
