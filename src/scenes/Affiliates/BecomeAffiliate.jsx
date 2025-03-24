import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const AffiliateRegistrationForm = () => {
  // State hooks for form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [industry, setIndustry] = useState('');
  const [businessState, setBusinessState] = useState('');
  const [businessCounty, setBusinessCounty] = useState('');
  const [influence, setInfluence] = useState('');
  const [hearAboutUs, setHearAboutUs] = useState('');
  const [experience, setExperience] = useState('');
  const [closeButtonHover, setCloseButtonHover] = useState(false);

  // State for hover effect
  const [isSubmitHovered, setIsSubmitHovered] = useState(false);
  // State for modal visibility and automatic redirect
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    setIsModalVisible(true);

    // Set timeout for automatic redirect after 5 seconds
    setTimeout(() => {
      setShouldRedirect(true);
    }, 50000);
  };

  // Redirect when shouldRedirect is true
  useEffect(() => {
    if (shouldRedirect) {
      navigate('/mainpage'); // Adjust the route to your main page
    }
  }, [shouldRedirect, navigate]);

  // Handle modal close and clear redirect timeout
  const handleCloseModal = () => {
    setIsModalVisible(false);
    setShouldRedirect(false);
  };


  const handleMouseEnter = () => {
    setIsSubmitHovered(true);
  };

  const handleMouseLeave = () => {
    setIsSubmitHovered(false);
  };

  // Inline styles object
  const styles = {
    formContainer: {
      background: '#FFFFFF',
      padding: '2rem',
      borderRadius: '8px',
      boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
      maxWidth: '500px',
      margin: 'auto',
      marginTop: '2rem',
      fontFamily: 'Arial, sans-serif',
      color: '#333',
    },
    formHeading: {
      textAlign: 'center',
      marginBottom: '1rem',
      fontSize: '1.5rem',
      color: '#333',
    },
    inputStyle: {
      width: '100%',
      padding: '12px',
      margin: '8px 0',
      display: 'block',
      border: '1px solid #ccc',
      borderRadius: '4px',
      boxSizing: 'border-box',
    },
    labelStyle: {
      marginBottom: '0.5rem',
      fontWeight: '500',
      color: '#333',
    },
    submitButton: {
      background: '#4CAF50',
      color: 'white',
      padding: '10px 20px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '16px',
      width: '100%',
      display: 'block', // Make the button full width
      margin: '20px 0',
    },
    submitButtonHover: {
      background: '#367c39', // Slightly darker green on hover
    },

    radioGroup: {
      marginBottom: '1rem',
    },
    radioLabel: {
      fontWeight: '400',
      color: '#333',
      display: 'block',
    },
    textareaStyle: {
      width: '100%',
      height: '100px',
      padding: '12px',
      margin: '8px 0',
      border: '1px solid #ccc',
      borderRadius: '4px',
      boxSizing: 'border-box',
      resize: 'vertical',
    },
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)', // Darker overlay for more contrast
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    modalContainer: {
      backgroundColor: '#f9f9f9', // Light grey background for the modal
      padding: '40px', // More padding for a spacious look
      borderRadius: '8px', // Slightly rounded corners
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Soft shadow for depth
      width: '80%', // Modal width, but not too wide
      maxWidth: '450px', // Maximum width for large screens
      textAlign: 'center', // Center-align the text
      zIndex: 1001,
    },
    modalText: {
      marginBottom: '20px',
      fontSize: '1rem',
      color: '#333', // Softer color for the text
      lineHeight: '1.5', // Line height for better readability
    },
    closeButton: {
      padding: '10px 15px',
      fontSize: '1rem',
      borderRadius: '5px',
      backgroundColor: '#5a5a5a', // Neutral color for button
      color: 'white',
      border: 'none',
      cursor: 'pointer',
      outline: 'none',
      marginTop: '20px', // Space above the button
      transition: 'background-color 0.3s ease', // Smooth transition for hover effect
      },
      emailLink: {
        color: '#0056b3', // Use your brand's primary color or a color that stands out
        textDecoration: 'none', // Remove the default underline if desired
        fontWeight: 'bold', // Optional: if you want to make it bold
        marginLeft: '5px', // Add a small space before the email link for better separation
      },
      // Add :hover styles for the email link if you want to change its appearance on hover
      emailLinkHover: {
        textDecoration: 'underline', // Example: underline on hover
        // You can add other hover styles here
      },
      };
  
  // Add hover effect for close button using onMouseEnter and onMouseLeave
  const closeButtonHoverStyle = {
  backgroundColor: '#404040', // Darken button when hovered
  };
    

  return (
    <>
    <div style={styles.formContainer}>
      <form onSubmit={handleSubmit}>
        <h1 style={styles.formHeading}>Affiliate Referral Program</h1>
        
        {/* ... */}
        
        <label style={styles.labelStyle} htmlFor="name">
          Your Name or Your Company Name *
        </label>
        <input
          style={styles.inputStyle}
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        
        <label style={styles.labelStyle} htmlFor="email">
          Email Address *
        </label>
        <input
          style={styles.inputStyle}
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label style={styles.labelStyle} htmlFor="contactNumber">
          Contact Number *
        </label>
        <input
          style={styles.inputStyle}
          id="contactNumber"
          type="text"
          value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
          required
        />

        <label style={styles.labelStyle} htmlFor="industry">
          Industry *
        </label>
        <input
          style={styles.inputStyle}
          id="industry"
          type="text"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          required
        />

        {/* Influence Field */}
        <div style={styles.radioGroup}>
  <fieldset>
    <legend style={styles.labelStyle}>Is your influence in your industry *</legend>
    <label style={styles.radioLabel} htmlFor="local">
      <input
        type="radio"
        id="local"
        name="influence"
        value="local"
        onChange={() => setInfluence('local')}
        checked={influence === 'local'}
      />
      Local
    </label>
    <label style={styles.radioLabel} htmlFor="regional">
      <input
        type="radio"
        id="regional"
        name="influence"
        value="regional"
        onChange={() => setInfluence('regional')}
        checked={influence === 'regional'}
      />
      Regional
    </label>
    <label style={styles.radioLabel} htmlFor="national">
      <input
        type="radio"
        id="national"
        name="influence"
        value="national"
        onChange={() => setInfluence('national')}
        checked={influence === 'national'}
      />
      National
    </label>
    <label style={styles.radioLabel} htmlFor="international">
      <input
        type="radio"
        id="international"
        name="influence"
        value="international"
        onChange={() => setInfluence('international')}
        checked={influence === 'international'}
      />
      International
    </label>
  </fieldset>
</div>

        <label style={styles.labelStyle} htmlFor="businessState">
          State where you or the company is conducting business in. *
        </label>
        <input
          style={styles.inputStyle}
          id="businessState"
          type="text"
          value={businessState}
          onChange={(e) => setBusinessState(e.target.value)}
          required
        />

        <label style={styles.labelStyle} htmlFor="businessCounty">
          County where you or the company is conducting business in.
        </label>
        <input
          style={styles.inputStyle}
          id="businessCounty"
          type="text"
          value={businessCounty}
          onChange={(e) => setBusinessCounty(e.target.value)}
        />

        <label style={styles.labelStyle} htmlFor="hearAboutUs">
          How did you hear about Cyberbacker's Affiliate Program?
        </label>
        <input
          style={styles.inputStyle}
          id="hearAboutUs"
          type="text"
          value={hearAboutUs}
          onChange={(e) => setHearAboutUs(e.target.value)}
        />

        <label style={styles.labelStyle} htmlFor="experience">
          Tell us about your industry experience, including your years in the industry. And what makes you the perfect candidate for Cyberbacker to make you an Affiliate. *
        </label>
        <textarea
          style={styles.textareaStyle}
          id="experience"
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          required
        />

<div style={{ textAlign: 'center' }}>
          <button
            style={
              isSubmitHovered
                ? { ...styles.submitButton, ...styles.submitButtonHover }
                : styles.submitButton
            }
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            type="submit"
          >
            Submit
          </button>
        </div>
        </form>
      </div>
      {isModalVisible && (
      <div style={styles.overlay}>
        <div style={styles.modalContainer}>
          <p style={styles.modalText}>
            Thank you for your interest in becoming a Cyberbacker Affiliate. 
            You should be receiving an email regarding next steps which will 
            include an application form which is required for leadership to 
            extend to you the invite to become an Affiliate. 
            For further information, please reach out to Jonel Buenaventura at 
            <a href="mailto:jonelbuenaventura@cyberbacker.com" style={styles.emailLink}>
              jonelbuenaventura@cyberbacker.com
            </a>.
          </p>
          <button
            style={closeButtonHover ? { ...styles.closeButton, ...closeButtonHoverStyle } : styles.closeButton}
            onMouseEnter={() => setCloseButtonHover(true)}
            onMouseLeave={() => setCloseButtonHover(false)}
            onClick={handleCloseModal}
          >
            Close
          </button>
        </div>
      </div>
    )}
  </>
);
};

export default AffiliateRegistrationForm;

