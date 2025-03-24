import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../services/UserContext';
import { useRoleAccess } from '../hooks/useRoleAccess';

const ProtectedRoute = ({ 
  // Required permissions for the route
  requiredPermissions = [], 
  // Required franchise access (if any)
  requiredFranchise = null,
  // Component or elements to render
  children 
}) => {
  const location = useLocation();
  const { isLoggedIn, userRole, subRole } = useAuth();
  const { hasPermission, hasFranchiseAccess } = useRoleAccess();

  // Step 1: Check authentication
  if (!isLoggedIn) {
    return <Navigate 
      to="/login" 
      state={{ from: location.pathname }} 
      replace 
    />;
  }

  // Step 2: Check permissions
  const hasRequiredPermissions = requiredPermissions.every(permission => 
    hasPermission(permission)
  );

  if (!hasRequiredPermissions) {
    return <Navigate 
      to="/unauthorized" 
      state={{ 
        message: 'You do not have the required permissions to access this page',
        requiredPermissions,
        currentRole: userRole
      }} 
      replace 
    />;
  }

  // Step 3: Check franchise access if required
  if (requiredFranchise && !hasFranchiseAccess(requiredFranchise)) {
    return <Navigate 
      to="/unauthorized" 
      state={{ 
        message: 'You do not have access to this franchise',
        requiredFranchise,
        currentSubRoles: subRole
      }} 
      replace 
    />;
  }

  // All checks passed, render the protected content
  return children;
};

// Usage example:
/* 
  <Routes>
    <Route 
      path="/franchise/:id" 
      element={
        <ProtectedRoute 
          requiredPermissions={['view_clients', 'edit_clients']}
          requiredFranchise={franchiseId}
        >
          <FranchiseClients />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/analytics" 
      element={
        <ProtectedRoute 
          requiredPermissions={['access_analytics']}
        >
          <Analytics />
        </ProtectedRoute>
      } 
    />
  </Routes>
*/

export default ProtectedRoute;
