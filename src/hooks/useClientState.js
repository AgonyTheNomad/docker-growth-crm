import { useState, useCallback } from 'react';
import { useRoleAccess } from './useRoleAccess';
import { PERMISSIONS } from '../constants/permissions';

export const useClientState = () => {
  const [clients, setClients] = useState({});
  const [selectedClients, setSelectedClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { hasPermission } = useRoleAccess();

  // Handle client updates with permission checks
  const updateClient = useCallback(async (clientId, updates) => {
    if (!hasPermission(PERMISSIONS.EDIT_CLIENTS)) {
      throw new Error('No permission to edit clients');
    }

    setLoading(true);
    try {
      // Your API call here
      setClients(prev => ({
        ...prev,
        [clientId]: { ...prev[clientId], ...updates }
      }));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [hasPermission]);

  // Handle status changes
  const updateClientStatus = useCallback(async (clientId, newStatus, oldStatus) => {
    if (!hasPermission(PERMISSIONS.MOVE_CLIENTS)) {
      throw new Error('No permission to move clients');
    }

    setLoading(true);
    try {
      setClients(prev => {
        const newClients = { ...prev };
        
        // Remove from old status
        if (newClients[oldStatus]) {
          newClients[oldStatus] = {
            ...newClients[oldStatus],
            preview: newClients[oldStatus].preview.filter(c => c.id !== clientId),
            total: Math.max(0, (newClients[oldStatus].total || 0) - 1)
          };
        }

        // Add to new status
        if (!newClients[newStatus]) {
          newClients[newStatus] = { preview: [], total: 0 };
        }

        const client = Object.values(newClients)
          .flatMap(status => status.preview)
          .find(c => c.id === clientId);

        if (client) {
          newClients[newStatus] = {
            ...newClients[newStatus],
            preview: [...newClients[newStatus].preview, { ...client, status: newStatus }],
            total: (newClients[newStatus].total || 0) + 1
          };
        }

        return newClients;
      });
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [hasPermission]);

  // Handle client selection
  const toggleClientSelection = useCallback((clientId) => {
    setSelectedClients(prev => 
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  }, []);

  // Clear selections
  const clearSelection = useCallback(() => {
    setSelectedClients([]);
  }, []);

  // Get clients by status
  const getClientsByStatus = useCallback((status) => {
    return clients[status]?.preview || [];
  }, [clients]);

  // Get total count for status
  const getTotalCount = useCallback((status) => {
    return clients[status]?.total || 0;
  }, [clients]);

  return {
    clients,
    selectedClients,
    loading,
    error,
    updateClient,
    updateClientStatus,
    toggleClientSelection,
    clearSelection,
    getClientsByStatus,
    getTotalCount,
    setClients
  };
};