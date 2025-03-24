// Create a new component called FeedbackMessage.js
import React from 'react';

const FeedbackMessage = ({ message, type, onClose }) => {
  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#f44336';
      case 'warning':
        return '#ff9800';
      default:
        return '#2196F3';
    }
  };

  const style = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    backgroundColor: getBackgroundColor(),
    color: 'white',
    padding: '15px 25px',
    borderRadius: '4px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
    zIndex: 1100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: '200px',
    maxWidth: '400px'
  };

  const closeButtonStyle = {
    marginLeft: '15px',
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    color: 'white',
    fontSize: '20px'
  };

  return (
    <div style={style}>
      <span>{message}</span>
      <button onClick={onClose} style={closeButtonStyle}>&times;</button>
    </div>
  );
};

export default FeedbackMessage;