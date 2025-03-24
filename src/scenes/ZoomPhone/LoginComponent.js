import React from 'react';

const LoginComponent = () => {
  const handleLogin = () => {
    window.location.href = 'http://localhost:3002/authorize';
  };

  return (
    <div className="login-component">
      <h2>Login to Zoom Phone</h2>
      <button onClick={handleLogin}>Sign In with Zoom</button>
    </div>
  );
};

export default LoginComponent;
