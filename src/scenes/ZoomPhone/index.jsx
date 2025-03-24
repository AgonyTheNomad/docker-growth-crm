import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginComponent from './LoginComponent';
import PhoneInterfaceComponent from './PhoneInterfaceComponent';

const ZoomPhone = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch(`http://localhost:3002/api/auth/status`, {
          credentials: 'include',
          mode: 'cors',
        });
        if (response.ok) {
          const data = await response.json();
          setIsLoggedIn(data.isAuthenticated);
          if (!data.isAuthenticated) {
            navigate('/login');
          }
        } else {
          throw new Error('Failed to check authentication status');
        }
      } catch (error) {
        console.error(error);
        setIsLoggedIn(false);
      }
    };

    checkAuthStatus();
  }, [navigate]);

  return (
    <div className="zoom-phone-page">
      {!isLoggedIn ? (
        <LoginComponent />
      ) : (
        <PhoneInterfaceComponent />
      )}
    </div>
  );
};

export default ZoomPhone;
