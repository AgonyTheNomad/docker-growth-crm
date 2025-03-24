// Updated useRoleAccess.js
import { useMemo } from 'react';
import { useAuth } from '../services/UserContext';
import { PERMISSIONS } from '../constants/permissions';

export const useRoleAccess = () => {
  const { userRole, subRole } = useAuth();

  // Convert subRole to array for consistent handling
  const subRoles = useMemo(() => {
    if (!subRole) return [];
    return Array.isArray(subRole) ? subRole : [subRole];
  }, [subRole]);

  // During development, grant all permissions
  const hasPermission = () => true;

  // During development, grant access to all franchises
  const hasFranchiseAccess = () => true;

  // During development, return null to indicate access to all franchises
  const getAccessibleFranchises = () => null;

  return {
    hasPermission,
    hasFranchiseAccess,
    getAccessibleFranchises,
    permissions: Object.values(PERMISSIONS),
    isMultiFranchise: true,
    subRoles
  };
};