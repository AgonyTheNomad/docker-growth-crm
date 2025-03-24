import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AffiliateReferralProgram = () => {
  const [selectedOption, setSelectedOption] = useState('');
  const navigate = useNavigate();

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    switch (selectedOption) {
      case 'becomeAffiliate':
        navigate('/become-affiliate');
        break;
      case 'referIndividual':
        navigate('/refer-individual');
        break;
      case 'submitReferral':
        navigate('/submit-referral');
        break;
      default:
        alert('Please select an option.');
    }
  };

  const styles = {
    container: {
      maxWidth: '600px',
      margin: '50px auto',
      padding: '20px',
      backgroundColor: '#fff',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      borderRadius: '8px',
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    },
    header: {
      borderBottom: '1px solid #eee',
      paddingBottom: '20px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    formTitle: {
      fontSize: '24px',
      color: '#333',
      textAlign: 'center',
      fontWeight: '600',
      marginBottom: '20px',
    },
    switchAccountButton: {
      backgroundColor: '#357edd',
      color: '#fff',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
    },
    formGroup: {
      marginBottom: '20px',
    },
    label: {
      fontWeight: 'bold',
      color: '#333',
      display: 'block',
      marginBottom: '10px',
    },
    input: {
      marginRight: '5px',
    },
    submitButton: {
      backgroundColor: '#4CAF50',
      color: 'white',
      padding: '10px 20px',
      textAlign: 'center',
      textDecoration: 'none',
      display: 'inline-block',
      fontSize: '16px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <img src="/path-to-your-logo.png" alt="Cyberbacker" style={{ maxWidth: '100px' }} />
      </header>
      
      <form onSubmit={handleSubmit}>
        <h1 style={styles.formTitle}>Affiliate Referral Program</h1>
        
        <div style={styles.formGroup}>
          <span>koltonjones@cyberbacker.com</span>
          <button type="button" style={styles.switchAccountButton}>Switch account</button>
        </div>
        
        <div style={styles.formGroup}>
          <p style={{ color: '#333', fontSize: '14px' }}>* Indicates required question</p>
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Please select from the choices below. *</label>
          <div>
            <input 
              type="radio" 
              id="becomeAffiliate" 
              name="referralOption" 
              value="becomeAffiliate" 
              onChange={handleOptionChange} 
              style={styles.input}
              checked={selectedOption === 'becomeAffiliate'}
            />
            <label htmlFor="becomeAffiliate" style={{ color: '#333' }}>I am interested in becoming a Cyberbacker Affiliate</label>
          </div>
          <div>
            <input 
              type="radio" 
              id="referIndividual" 
              name="referralOption" 
              value="referIndividual" 
              onChange={handleOptionChange}
              style={styles.input}
              checked={selectedOption === 'referIndividual'}
            />
            <label htmlFor="referIndividual" style={{ color: '#333' }}>I am interested in referring an individual or company to become a Cyberbacker Affiliate</label>
          </div>
          <div>
          <input 
              type="radio" 
              id="submitReferral" 
              name="referralOption" 
              value="submitReferral" 
              onChange={handleOptionChange}
              style={styles.input}
              checked={selectedOption === 'submitReferral'}
            />
            <label htmlFor="submitReferral" style={{ color: '#333' }}>I am a registered Cyberbacker Affiliate submitting a Client Referral</label>
          </div>
        </div>

        <div style={styles.formGroup}>
          <button type="submit" style={styles.submitButton}>Submit</button>
        </div>
      </form>
    </div>
  );
};
export default AffiliateReferralProgram;