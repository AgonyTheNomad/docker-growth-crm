import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const OAuthCallbackComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);

  useEffect(() => {
    const code = new URLSearchParams(location.search).get('code');

    if (code) {
      fetch('http://localhost:3002/oauth/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        localStorage.setItem('accessToken', data.accessToken);
        
        navigate('/zoom-phone'); 
      })
      .catch(error => {
        console.error('Error during token exchange:', error);
        setError('Failed to log in. Please try again.');
      });
    }
  }, [location, navigate]); 

  if (error) {
    return <div>Error: {error}</div>;
  }

  return <div>Authorizing... Please wait.</div>;
};

export default OAuthCallbackComponent;
