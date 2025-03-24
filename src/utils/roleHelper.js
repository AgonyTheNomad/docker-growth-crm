// utils/roleHelper.js
export const getUserRoleData = (email) => {
    const userEntry = allowedEmails.find(entry => 
      entry.emails?.includes(email)
    );
  
    if (!userEntry) return null;
  
    if (userEntry.roles) {
      return userEntry.roles; // Return all roles if multi-role
    }
  
    return {
      role: userEntry.role,
      subRole: userEntry.subRole || null,
    };
  };
  