// components/RoleBasedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const RoleBasedRoute = ({ allowedRoles, userRole, children }) => {
  if (!allowedRoles.includes(userRole.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default RoleBasedRoute;
