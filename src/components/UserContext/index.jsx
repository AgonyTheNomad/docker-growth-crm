import React, { createContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Initialize Firebase Auth
const auth = getAuth();

// Create and export the context
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Set user if authentication is valid
        setUser(firebaseUser);
        setIsLoggedIn(true);
      } else {
        // Reset user if not authenticated
        setUser(null);
        setIsLoggedIn(false);
      }
    });

    // Clean up subscription
    return () => unsubscribe();
  }, []);

  // Provide user and isLoggedIn states to the context
  return (
    <UserContext.Provider value={{ user, isLoggedIn }}>
      {children}
    </UserContext.Provider>
  );
};
