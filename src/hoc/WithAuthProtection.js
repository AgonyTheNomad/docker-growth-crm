// src/hoc/WithAuthProtection.js

import React, { useEffect, useState } from 'react';
import { auth } from '../services/firebaseConfig';
import { useHistory } from 'react-router-dom'; 

const withAuthProtection = (WrappedComponent) => {
  return (props) => {
    const [isLoading, setLoading] = useState(true);
    const [isAuthenticated, setAuthenticated] = useState(false);
    const history = useHistory();

    useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
          setAuthenticated(true);
        } else {
          history.push('/login');
        }
        setLoading(false);
      });

      return () => unsubscribe();
    }, [history]);

    if (isLoading) {
      return <div>Loading...</div>; 
    }

    if (!isAuthenticated) {
      return null; 
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuthProtection;
