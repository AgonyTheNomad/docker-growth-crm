import React from 'react';

// Styles
export const duplicateContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: '20px',
};

export const summaryStyle = {
  color: 'white',
  padding: '20px',
  borderRadius: '8px',
  maxWidth: '600px',
  textAlign: 'center',
  backgroundColor: '#333',
  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
};

export const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

export const checkboxStyle = {
  position: 'absolute',
  right: '100px',
  top: '50%',
  transform: 'translateY(-50%)',
  margin: 0,
};

export const checkboxColumnStyle = {
  position: 'relative',
  width: '50px',
  padding: '10px 0',
  textAlign: 'left',
};

export const messageBoxStyle = {
  padding: '20px',
  background: 'green',
  borderRadius: '5px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  textAlign: 'center',
  maxWidth: '80%',
  zIndex: 1001,
};

export const summaryHeaderStyle = {
  fontSize: '24px',
  marginBottom: '10px',
  fontWeight: 'bold',
};

export const checkboxLabelStyle = {
  marginLeft: '-25px',
  display: 'inline-block',
};

export const summaryDetailStyle = {
  fontSize: '16px',
  margin: '5px 0',
};

export const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: '20px',
  tableLayout: 'fixed',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  borderSpacing: 0,
};

export const thTdStyle = {
  border: '1px solid #ddd',
  padding: '8px',
  textAlign: 'center',
};

export const trStyle = {
  backgroundColor: '#0000',
};

export const thStyle = {
  ...thTdStyle,
  padding: '12px',
  backgroundColor: 'black',
  color: 'white',
};

export const greenButtonStyle = {
  padding: '10px 20px',
  backgroundColor: '#0095eb',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  marginTop: '10px',
};

export const buttonContainerStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: '1rem',
};

export const improvedTableStyle = {
  ...tableStyle,
  marginBottom: '1rem',
};

const styles = {
  duplicateContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '20px',
  },
  summary: {
    color: 'white',
    padding: '20px',
    borderRadius: '8px',
    maxWidth: '600px',
    textAlign: 'center',
    backgroundColor: '#333',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  checkbox: {
    position: 'absolute',
    right: '100px',
    top: '50%',
    transform: 'translateY(-50%)',
    margin: 0,
  },
  checkboxColumn: {
    position: 'relative',
    width: '50px',
    padding: '10px 0',
    textAlign: 'left',
  },
  messageBox: {
    padding: '20px',
    background: 'green',
    borderRadius: '5px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    textAlign: 'center',
    maxWidth: '80%',
    zIndex: 1001,
  },
  summaryHeader: {
    fontSize: '24px',
    marginBottom: '10px',
    fontWeight: 'bold',
  },
  checkboxLabel: {
    marginLeft: '-25px',
    display: 'inline-block',
  },
  summaryDetail: {
    fontSize: '16px',
    margin: '5px 0',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
    tableLayout: 'fixed',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderSpacing: 0,
  },
  cell: {
    border: '1px solid #ddd',
    padding: '8px',
    textAlign: 'center',
  },
  row: {
    backgroundColor: '#0000',
  },
  header: {
    border: '1px solid #ddd',
    padding: '12px',
    textAlign: 'center',
    backgroundColor: 'black',
    color: 'white',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#0095eb',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '10px',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '1rem',
  },
  improvedTable: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
    tableLayout: 'fixed',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderSpacing: 0,
    marginBottom: '1rem',
  }
};

