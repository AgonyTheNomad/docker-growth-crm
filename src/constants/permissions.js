export const PERMISSIONS = {
  // Client management
  VIEW_CLIENTS: 'view_clients',
  EDIT_CLIENTS: 'edit_clients',
  MOVE_CLIENTS: 'move_clients',
  DELETE_CLIENTS: 'delete_clients',

  // Franchise management
  VIEW_ALL_FRANCHISES: 'view_all_franchises',
  MANAGE_FRANCHISE: 'manage_franchise',

  // Analytics and reporting
  ACCESS_ANALYTICS: 'access_analytics',
  EXPORT_DATA: 'export_data',

  // User management
  MANAGE_USERS: 'manage_users',
  ASSIGN_ROLES: 'assign_roles',
};

export const ROLE_PERMISSIONS = {
  admin: [
      PERMISSIONS.VIEW_CLIENTS,
      PERMISSIONS.EDIT_CLIENTS,
      PERMISSIONS.MOVE_CLIENTS,
      PERMISSIONS.DELETE_CLIENTS,
      PERMISSIONS.VIEW_ALL_FRANCHISES,
      PERMISSIONS.MANAGE_FRANCHISE,
      PERMISSIONS.ACCESS_ANALYTICS,
      PERMISSIONS.EXPORT_DATA,
      PERMISSIONS.MANAGE_USERS,
      PERMISSIONS.ASSIGN_ROLES,
  ],
  franchise: [
      PERMISSIONS.VIEW_CLIENTS,
      PERMISSIONS.EDIT_CLIENTS,
      PERMISSIONS.MOVE_CLIENTS,
      PERMISSIONS.ACCESS_ANALYTICS,
  ],
  referrer: [
      PERMISSIONS.VIEW_CLIENTS,
      PERMISSIONS.ACCESS_ANALYTICS,
      PERMISSIONS.EDIT_CLIENTS, // Optional
      PERMISSIONS.MOVE_CLIENTS, // Optional
  ],
  user: [
      PERMISSIONS.VIEW_CLIENTS, // Basic view-only access for general users
  ],
};

// Updated function to handle single or multi-role users
export const hasPermission = (userRoles, permission) => {
  if (Array.isArray(userRoles)) {
      console.log('Checking permissions for multiple roles:', { userRoles, permission });
      return userRoles.some((role) => (ROLE_PERMISSIONS[role] || []).includes(permission));
  }
  console.log('Checking permission for single role:', { userRoles, permission });
  return (ROLE_PERMISSIONS[userRoles] || []).includes(permission);
};


// Updated function to get permissions for single or multi-role users
export const getRolePermissions = (userRoles) => {
  if (Array.isArray(userRoles)) {
      return userRoles.reduce((permissions, role) => {
          const rolePermissions = ROLE_PERMISSIONS[role] || [];
          return [...new Set([...permissions, ...rolePermissions])]; // Merge and deduplicate
      }, []);
  }
  return ROLE_PERMISSIONS[userRoles] || [];
};
