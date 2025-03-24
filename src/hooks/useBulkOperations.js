export const useBulkOperations = (updateClientStatus, selectedClients) => {
    const { hasPermission } = useRoleAccess();
    const [bulkLoading, setBulkLoading] = useState(false);
    const [bulkError, setBulkError] = useState(null);
  
    const moveMultipleClients = useCallback(async (newStatus) => {
      if (!hasPermission(PERMISSIONS.MOVE_CLIENTS)) {
        throw new Error('No permission to move clients');
      }
  
      setBulkLoading(true);
      setBulkError(null);
  
      try {
        const updates = selectedClients.map(clientId => 
          updateClientStatus(clientId, newStatus)
        );
        
        await Promise.all(updates);
        return true;
      } catch (err) {
        setBulkError(err.message);
        throw err;
      } finally {
        setBulkLoading(false);
      }
    }, [hasPermission, selectedClients, updateClientStatus]);
  
    return {
      moveMultipleClients,
      bulkLoading,
      bulkError
    };
  };