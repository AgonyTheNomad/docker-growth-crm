export const validateRoleOperation = (operation, userRole, requiredPermission) => {
    const hasPermission = ROLE_PERMISSIONS[userRole]?.includes(requiredPermission);
    
    if (!hasPermission) {
      throw new Error(`Unauthorized: Operation '${operation}' requires permission '${requiredPermission}'`);
    }
    
    return true;
  };