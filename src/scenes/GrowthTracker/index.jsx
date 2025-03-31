import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useAuth } from '../../services/UserContext';
import { useWebSocket } from './hooks/useWebSocket';
import DraggableCustomerCard from '../../components/DraggableCustomerCard';
import DroppableColumn from '../../components/DroppableColumn'; // Updated component
import ConfirmationModal from '../../components/ConfirmationModal';
import AlertModal from '../../components/AlertModal';
import RequiredFieldsModal from '../../components/RequiredFieldsModal';
import ClientSearch from './ClientSearch';
import HeaderContainer from './HeaderContainer';
import StatusHeaders from './StatusHeaders';
import { allowedEmails } from '../../utils/allowedEmails';
import { Snackbar, Alert, Badge, Dialog } from '@mui/material';
import { STATUSES, STATUS_FIELDS, FRANCHISE_OPTIONS } from './constants';
import { LoadingIndicator, FranchiseSelectContainer } from '../../style';
import { constructUrl, authFetch } from 'src/utils/apiUtils';
import { styled } from '@mui/system';

const ColumnsContainer = styled('div')({
  display: 'flex',
  overflowX: 'auto',
  // Set fixed height so that the board fits the main screen (adjust as needed)
  height: 'calc(100vh - 280px)' // Increased to account for the header container
});

const logState = (action, data = {}) => {
  console.log(`[FranchiseClients] ${action}:`, {
    timestamp: new Date().toISOString(),
    ...data
  });
};

const logError = (message, error = {}) => {
  console.error(`[FranchiseClients Error] ${message}:`, {
    timestamp: new Date().toISOString(),
    error,
    stack: error.stack
  });
};

const FranchiseClients = () => {
  // State management
  const [selectedFranchiseValue, setSelectedFranchiseValue] = useState('');
  const [filterMode, setFilterMode] = useState('assigned');
  const [clients, setClients] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const { user, userRole, subRole, userName } = useAuth();
  const [selectedClients, setSelectedClients] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingMove, setPendingMove] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [requiredFieldsModalOpen, setRequiredFieldsModalOpen] = useState(false);
  const [clientToUpdate, setClientToUpdate] = useState(null);
  const [feedback, setFeedback] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [growthbackerFilter, setGrowthbackerFilter] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedClientForModal, setSelectedClientForModal] = useState(null);

  useEffect(() => {
    window.growthbackerFilter = growthbackerFilter;
  }, [growthbackerFilter]);

  const franchiseOptionsToUse = FRANCHISE_OPTIONS;

  const getFilteredFranchiseOptions = useCallback(() => {
    if (userRole === 'admin' || (Array.isArray(userRole) && userRole.includes('admin'))) {
      return franchiseOptionsToUse;
    }
    if (subRole === 'No' || (Array.isArray(subRole) && subRole.includes('No'))) {
      const noOption = franchiseOptionsToUse.find(option => option.value === 'No');
      return noOption ? [noOption] : [];
    }
    if (Array.isArray(subRole)) {
      return franchiseOptionsToUse.filter(option => subRole.includes(option.value));
    } else if (subRole) {
      const franchiseOption = franchiseOptionsToUse.find(option => option.value === subRole);
      return franchiseOption ? [franchiseOption] : [];
    }
    return franchiseOptionsToUse;
  }, [userRole, subRole, franchiseOptionsToUse]);

  const filteredFranchiseOptions = useMemo(() => getFilteredFranchiseOptions(), [getFilteredFranchiseOptions]);

  const getGrowthbackerName = useCallback(() => {
    if (userRole !== 'franchise' && !(Array.isArray(userRole) && userRole.includes('franchise'))) return null;
    const isNoSubRoleUser = subRole === 'No' || (Array.isArray(subRole) && subRole.includes('No'));
    if (!isNoSubRoleUser) return null;
    const noFranchiseEntry = allowedEmails.find(entry =>
      entry.role === 'franchise' &&
      entry.subRole === 'No' &&
      entry.members?.some(member => member.email === userName)
    );
    if (noFranchiseEntry) {
      const member = noFranchiseEntry.members.find(m => m.email === userName);
      return member?.name || null;
    }
    const multiRoleEntry = allowedEmails.find(entry =>
      entry.members?.some(member =>
        member.email === userName &&
        member.roles?.some(role => role.role === 'franchise' && role.subRole === 'No')
      )
    );
    if (multiRoleEntry) {
      const member = multiRoleEntry.members.find(m => m.email === userName);
      return member?.name || null;
    }
    return null;
  }, [userRole, userName, subRole]);

  useEffect(() => {
    const growthbackerName = getGrowthbackerName();
    console.log("[FranchiseClients] Derived GrowthBacker:", growthbackerName);
    if (growthbackerName) {
      setGrowthbackerFilter(growthbackerName);
      window.wsGrowthbackerSent = false;
    }
  }, [getGrowthbackerName]);

  useEffect(() => {
    window.currentFilterMode = filterMode;
  }, [filterMode]);

  const handleWebSocketMessage = useCallback((message) => {
    logState('Received WebSocket message', { rawMessage: message });
    try {
      const parsedData = typeof message === 'string' ? JSON.parse(message) : message;
      logState('Parsed WebSocket data', { parsedData });
      
      // Handle search results separately
      if (parsedData.type === 'searchResults') {
        setSearchResults(parsedData.clients || []);
        return null;
      }
      
      // **New Branch: Handle allClientsForStatus**
      if (parsedData.type === 'allClientsForStatus') {
        setClients(prev => ({
          ...prev,
          [parsedData.status]: {
            preview: parsedData.clients || [],
            total: parsedData.total || 0
          }
        }));
        return;
      }
      
      // Existing: if we haven't sent the growthbacker filter yet...
      if (!window.wsGrowthbackerSent) {
        window.wsGrowthbackerSent = true;
        const wsMessage = {
          type: 'setGrowthbacker',
          growthbacker: filterMode === 'assigned' ? growthbackerFilter : null,
          filterMode: filterMode
        };
        console.log("[WebSocket] Sending filter request:", wsMessage);
        return wsMessage;
      }
      
      // For other message types (e.g., preview messages)
      setClients(prev => {
        const normalized = {};
        const clientData = parsedData.data || parsedData;
        Object.entries(clientData).forEach(([status, data]) => {
          normalized[status] = {
            preview: Array.isArray(data?.preview) ? data.preview : [],
            total: typeof data?.total === 'number' ? data.total : 0
          };
        });
        logState('Normalized client data', { normalized });
        return normalized;
      });
    } catch (error) {
      logError('Failed to process WebSocket message', error);
      setError('Error processing data from server');
    }
  }, [growthbackerFilter, filterMode]);
  

  const { connected, wsError, loadMoreClients, loadAllClients, updateClientStatus, sendMessage } =
    useWebSocket(selectedFranchiseValue, handleWebSocketMessage, setHasMore, setLoading);

  useEffect(() => {
    if (connected && sendMessage) {
      window.wsGrowthbackerSent = false;
      console.log("Setting filter mode:", filterMode);
      console.log("With growthbacker:", filterMode === 'assigned' ? growthbackerFilter : null);
      const wsMessage = {
        type: 'setGrowthbacker',
        growthbacker: filterMode === 'assigned' ? growthbackerFilter : null,
        filterMode: filterMode
      };
      try {
        const sent = sendMessage(wsMessage);
        console.log("Filter message sent successfully:", sent);
      } catch (error) {
        console.error("Failed to send filter update:", error);
      }
    }
  }, [filterMode, connected, growthbackerFilter, sendMessage]);

  useEffect(() => {
    if (filteredFranchiseOptions.length === 1) {
      const franchiseValue = filteredFranchiseOptions[0].value;
      setSelectedFranchiseValue(franchiseValue);
      setHasMore(true);
      setLoading(true);
      window.wsGrowthbackerSent = false;
      logState('Auto-selecting single franchise option', { value: franchiseValue });
    }
  }, [filteredFranchiseOptions]);

  const handleCloseFeedback = () => {
    setFeedback(prev => ({ ...prev, open: false }));
  };

  const getFilteredClients = (clients, status) => {
    const statusData = clients[status] || { preview: [], total: 0 };
    const statusClients = statusData.preview;
  
    // If the full list is loaded (load-all was triggered), return everything
    if (statusClients.length === statusData.total && statusData.total > 0) {
      return statusClients;
    }
  
    // Otherwise, apply the filter based on filterMode
    if (filterMode === 'assigned') {
      if (growthbackerFilter) {
        return statusClients.filter(client => {
          const clientGrowthbacker = (client.growthbacker || '').toLowerCase().trim();
          const filterValue = growthbackerFilter.toLowerCase().trim();
          return clientGrowthbacker === filterValue;
        });
      }
      return statusClients.filter(client => client.growthbacker && client.growthbacker !== '');
    } else if (filterMode === 'unassigned') {
      return statusClients.filter(client => !client.growthbacker || client.growthbacker === '');
    }
    return statusClients;
  };
  
  
  const totalClients = useMemo(() => {
    let total = 0;
    Object.values(clients).forEach(statusData => {
      if (filterMode === 'assigned') {
        if (growthbackerFilter) {
          total += statusData?.preview?.filter(client => {
            const clientGrowthbacker = (client.growthbacker || '').toLowerCase().trim();
            const filterValue = growthbackerFilter.toLowerCase().trim();
            return clientGrowthbacker === filterValue;
          }).length || 0;
        } else {
          total += statusData?.preview?.filter(client => client.growthbacker && client.growthbacker !== '').length || 0;
        }
      } else if (filterMode === 'unassigned') {
        total += statusData?.preview?.filter(client => !client.growthbacker || client.growthbacker === '').length || 0;
      } else {
        total += statusData?.preview?.length || 0;
      }
    });
    return total;
  }, [clients, filterMode, growthbackerFilter]);

  const handleSelectChange = useCallback((value) => {
    logState('Franchise selected', { value });
    setSelectedFranchiseValue(value);
    setHasMore(true);
    setLoading(true);
    window.wsGrowthbackerSent = false;
  }, []);

  const handleCheckboxChange = useCallback((clientId) => {
    logState('Checkbox change', { clientId });
    setSelectedClients(prevSelected => {
      const newSelection = prevSelected.includes(clientId)
        ? prevSelected.filter(id => id !== clientId)
        : [...prevSelected, clientId];
      logState('Updated selection', { 
        selectedClients: newSelection,
        action: prevSelected.includes(clientId) ? 'removed' : 'added'
      });
      return newSelection;
    });
  }, []);

  const checkMissingFields = useCallback((client, newStatus) => {
    const requiredFields = STATUS_FIELDS[newStatus] || [];
    const missingFields = requiredFields.filter(field => !client[field] || client[field] === '');
    logState('Checking missing fields', { clientId: client.id, newStatus, requiredFields, missingFields });
    return missingFields;
  }, []);

  const moveClients = useCallback((clientIds, newStatus) => {
    logState('Moving clients', { clientIds, newStatus });
    const clientsToMove = Array.isArray(clientIds)
      ? clientIds
      : selectedClients.length > 0
        ? selectedClients
        : [clientIds];
    if (clientsToMove.length === 0) {
      logError('Move clients failed', { reason: 'No clients selected' });
      setAlertMessage('No clients selected to move');
      setAlertOpen(true);
      return;
    }
    const clientsWithMissingFields = clientsToMove.filter(clientId => {
      const client = Object.values(clients).reduce((found, statusData) => {
        if (found) return found;
        return statusData.preview.find(c => c.id === clientId);
      }, null);
      if (!client) {
        logError('Client not found', { clientId });
        return false;
      }
      const missingFields = checkMissingFields(client, newStatus);
      if (missingFields.length > 0) {
        logState('Client has missing fields', { clientId, missingFields, client });
        setClientToUpdate({ ...client, newStatus, missingFields });
        setRequiredFieldsModalOpen(true);
        return true;
      }
      return false;
    });
    if (clientsWithMissingFields.length > 0) {
      return;
    }
    const clientsToMoveDetails = clientsToMove.map(clientId => {
      const client = Object.values(clients).reduce((found, statusData) => {
        if (found) return found;
        return statusData.preview.find(c => c.id === clientId);
      }, null);
      return {
        id: clientId,
        name: client ? client.client_name : 'Unknown Client',
        newStatus,
      };
    });
    logState('Preparing to move clients', { clientsToMoveDetails, totalClients: clientsToMoveDetails.length });
    setPendingMove({
      clientIds: clientsToMoveDetails.map(client => client.id),
      clientDetails: clientsToMoveDetails,
      newStatus
    });
    setIsModalOpen(true);
  }, [clients, selectedClients, checkMissingFields]);

  const handleRequiredFieldsSubmit = useCallback(async (updatedClient) => {
    logState('Submitting required fields', { clientId: updatedClient.id, updates: updatedClient });
    setLoading(true);
    const url = constructUrl(`/api/clients/${updatedClient.id}/required-fields`);
    const formattedUpdates = {
      ...updatedClient,
      pt_ft: updatedClient.pt_ft === 'Full-Time' ? 'FT' : updatedClient.pt_ft === 'Part-Time' ? 'PT' : updatedClient.pt_ft
    };
    authFetch(
      url,
      {
        method: 'PUT',
        body: JSON.stringify({
          status: updatedClient.newStatus,
          field_updates: formattedUpdates,
          changed_by: userName,
          filterMode: filterMode
        })
      },
      { username: userName }
    )
    .then(data => {
      if (data.success) {
        setClients(prevClients => {
          const newClients = { ...prevClients };
          const oldStatus = updatedClient.status;
          const newStatus = updatedClient.newStatus;
          if (newClients[oldStatus]) {
            newClients[oldStatus] = {
              ...newClients[oldStatus],
              preview: newClients[oldStatus].preview.filter(c => c.id !== updatedClient.id),
              total: Math.max(0, (newClients[oldStatus].total || 0) - 1)
            };
          }
          if (!newClients[newStatus]) {
            newClients[newStatus] = { preview: [], total: 0 };
          }
          const updatedClientData = {
            ...formattedUpdates,
            status: newStatus,
            change_date: new Date().toISOString()
          };
          newClients[newStatus] = {
            ...newClients[newStatus],
            preview: [...newClients[newStatus].preview, updatedClientData],
            total: (newClients[newStatus].total || 0) + 1
          };
          return newClients;
        });
        logState('Client fields updated successfully', { clientId: updatedClient.id, newStatus: updatedClient.newStatus, updates: data.updates });
        setFeedback({
          open: true,
          message: data.message || 'Client updated successfully',
          severity: 'success'
        });
        setRequiredFieldsModalOpen(false);
        setClientToUpdate(null);
        setSelectedClients(prev => prev.filter(id => id !== updatedClient.id));
      } else {
        throw new Error(data.message || 'Failed to update client fields');
      }
    })
    .catch(error => {
      logError('Failed to update client fields', { error, clientId: updatedClient.id, requestData: { status: updatedClient.newStatus, updates: formattedUpdates } });
      setFeedback({
        open: true,
        message: error.message || 'Failed to update client fields',
        severity: 'error'
      });
    })
    .finally(() => {
      setLoading(false);
    });
  }, [userName, filterMode]);

  const confirmMoveClients = useCallback(async () => {
    if (!pendingMove) {
      logState('No pending move to confirm');
      return;
    }
    const { clientIds, newStatus } = pendingMove;
    logState('Confirming client move', { clientIds, newStatus });
    try {
      const newClients = { ...clients };
      const updates = [];
      for (const clientId of clientIds) {
        let movedClient = null;
        let oldStatus = null;
        for (const status in newClients) {
          const clientIndex = newClients[status]?.preview?.findIndex(client => client.id === clientId);
          if (clientIndex !== -1) {
            movedClient = newClients[status].preview[clientIndex];
            oldStatus = status;
            newClients[status] = {
              ...newClients[status],
              preview: newClients[status].preview.filter(client => client.id !== clientId),
              total: Math.max(0, (newClients[status].total || 0) - 1)
            };
            break;
          }
        }
        if (movedClient) {
          logState('Processing individual client move', { clientId, oldStatus, newStatus, clientDetails: movedClient });
          updates.push(
            updateClientStatus(clientId, newStatus, oldStatus, userName)
              .catch(error => {
                logError(`Failed to update client ${clientId}`, error);
                throw error;
              })
          );
          if (!newClients[newStatus]) {
            newClients[newStatus] = { preview: [], total: 0 };
          }
          newClients[newStatus] = {
            ...newClients[newStatus],
            preview: [...newClients[newStatus].preview, { ...movedClient, status: newStatus }],
            total: (newClients[newStatus].total || 0) + 1
          };
        } else {
          logError('Client not found for move', { clientId });
        }
      }
      logState('Executing batch updates', { updateCount: updates.length });
      await Promise.all(updates);
      logState('All updates completed successfully', { movedClientsCount: clientIds.length, newStatus });
      setClients(newClients);
      setSelectedClients([]);
      setFeedback({
        open: true,
        message: `Successfully moved ${clientIds.length} client${clientIds.length > 1 ? 's' : ''}`,
        severity: 'success'
      });
    } catch (error) {
      logError('Error updating status', error);
      setFeedback({
        open: true,
        message: error.message || 'Failed to move clients',
        severity: 'error'
      });
    } finally {
      setIsModalOpen(false);
      setPendingMove(null);
    }
  }, [pendingMove, updateClientStatus, userName, clients]);

  useEffect(() => {
    logState('Connection state updated', { connected, loading, error, wsError });
  }, [connected, loading, error, wsError]);

  const handleSelectClientFromSearch = useCallback((client) => {
    logState('Client selected from search', { client });
    setSelectedClientForModal(client);
  }, []);

  const handleCloseClientModal = () => {
    setSelectedClientForModal(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingIndicator>
          {connected ? 'Loading clients...' : 'Connecting to server...'}
        </LoadingIndicator>
      </div>
    );
  }

  // Create status header data for the status header component
  const statusHeaderData = STATUSES.map(status => {
    const statusData = clients[status] || { preview: [], total: 0 };
    const filteredClients = getFilteredClients(clients, status);
    return {
      name: status,
      count: filteredClients.length,
      total: statusData.total || 0
    };
  });

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="franchise-clients-container">
        <FranchiseSelectContainer>
          <div className="flex flex-col md:flex-row items-center">
            <div className="dropdown-container">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-2/3">
                  <label className="label">Select Franchise</label>
                  <select
                    value={selectedFranchiseValue}
                    onChange={(e) => handleSelectChange(e.target.value)}
                    disabled={loading || filteredFranchiseOptions.length <= 1}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#222',
                      color: 'white',
                      border: '1px solid #444',
                      borderRadius: '4px',
                      width: '100%',
                      maxWidth: '300px'
                    }}
                  >
                    {filteredFranchiseOptions.length > 1 && (
                      <option value="">Select a Franchise</option>
                    )}
                    {filteredFranchiseOptions.map((option, index) => (
                      <option key={index} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {subRole === 'No' && (
                    <div className="text-xs text-gray-400 mt-1">
                      No-Franchise access only
                    </div>
                  )}
                </div>
                <div className="w-full md:w-1/3">
                  <label className="label">View Options</label>
                  <select
                    value={filterMode}
                    onChange={(e) => {
                      const newMode = e.target.value;
                      setFilterMode(newMode);
                      window.currentFilterMode = newMode;
                      if (connected && sendMessage) {
                        sendMessage({
                          type: 'setGrowthbacker',
                          growthbacker: newMode === 'assigned' ? growthbackerFilter : null,
                          filterMode: newMode
                        });
                      }
                    }}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#222',
                      color: 'white',
                      border: '1px solid #444',
                      borderRadius: '4px',
                      width: '100%'
                    }}
                  >
                    <option value="assigned">
                      {userRole === 'admin' || (Array.isArray(userRole) && userRole.includes('admin'))
                        ? 'Assigned Clients'
                        : 'My Assigned Clients'}
                    </option>
                    <option value="unassigned">Unassigned Clients</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </FranchiseSelectContainer>

        <ClientSearch
          connected={connected}
          selectedFranchiseValue={selectedFranchiseValue}
          sendMessage={sendMessage}
          handleCheckboxChange={handleCheckboxChange}
          searchResults={searchResults}
          setSearchResults={setSearchResults}
          onSelectClient={handleSelectClientFromSearch}
        />

        {/* Updated HeaderContainer with statuses prop */}
        <div className="mb-4">
          <HeaderContainer totalClients={totalClients} statuses={statusHeaderData} />
          

        </div>

        {filterMode === 'unassigned' && (
          <div className="text-yellow-400 text-sm mt-1 px-4">
            Showing only unassigned clients
          </div>
        )}
        
        {filterMode === 'assigned' && growthbackerFilter && (
          <div className="text-blue-400 text-sm mt-1 px-4">
            Filtering by growthbacker: {growthbackerFilter}
          </div>
        )}

        {error && (
          <div className="error-message bg-red-100 text-red-700 p-4 rounded mb-4">
            Error: {error}
          </div>
        )}

        {wsError && (
          <div className="error-message bg-yellow-100 text-yellow-700 p-4 rounded mb-4">
            WebSocket Error: {wsError}
          </div>
        )}

        <ColumnsContainer>
          {STATUSES.map(status => {
            const statusData = clients[status] || { preview: [], total: 0 };
            const filteredClients = getFilteredClients(clients, status);
            const hasUnassigned = statusData.preview.some(client => !client.growthbacker);
            return (
              <DroppableColumn
                key={status}
                id={`status-column-${status}`}
                title={status}  // Changed this to just pass the string instead of a React element
                onDrop={(clientIds) => moveClients(clientIds, status)}
                selectedClients={selectedClients}
                loadMoreClients={() => loadMoreClients(status)}
                loadAllClients={() => loadAllClients(status)}
                hasMore={statusData.preview.length < statusData.total}
                totalCount={statusData.total}  // Use the total count from the server data
                currentCount={filteredClients.length}  // Add the filtered count as a separate prop
              >
                {filteredClients.map(client => (
                  <DraggableCustomerCard
                    key={client.id}
                    client={client}
                    isSelected={selectedClients.includes(client.id)}
                    onCheckboxChange={handleCheckboxChange}
                    username={userName}
                    uid={user?.uid}
                    highlight={!client.growthbacker}
                  />
                ))}
              </DroppableColumn>
            );
          })}
        </ColumnsContainer>
        <ConfirmationModal
          isOpen={isModalOpen}
          onConfirm={confirmMoveClients}
          onCancel={() => {
            setIsModalOpen(false);
            setPendingMove(null);
          }}
          message={pendingMove ? `Do you want to move ${pendingMove.clientIds.length} client${pendingMove.clientIds.length > 1 ? 's' : ''} to ${pendingMove.newStatus}?` : ''}
          clientDetails={pendingMove?.clientDetails}
        />

        <AlertModal
          isOpen={alertOpen}
          onClose={() => setAlertOpen(false)}
          message={alertMessage}
        />

        <RequiredFieldsModal
          isOpen={requiredFieldsModalOpen}
          onClose={() => {
            setRequiredFieldsModalOpen(false);
            setClientToUpdate(null);
          }}
          onSubmit={handleRequiredFieldsSubmit}
          client={clientToUpdate}
        />

        <Snackbar
          open={feedback.open}
          autoHideDuration={6000}
          onClose={handleCloseFeedback}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseFeedback} severity={feedback.severity} variant="filled" sx={{ width: '100%' }}>
            {feedback.message}
          </Alert>
        </Snackbar>

        <Dialog
          open={!!selectedClientForModal}
          onClose={handleCloseClientModal}
          fullWidth
          maxWidth="md"
          PaperProps={{ style: { backgroundColor: '#2c2c2c' } }}
        >
          {selectedClientForModal && (
            <div style={{ padding: '1rem', color: '#000' }}>
              <DraggableCustomerCard
                client={selectedClientForModal}
                isSelected={false}
                onCheckboxChange={() => {}}
                username={userName}
                uid={user?.uid || ''}
              />
              <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center' }}>
                <label style={{ marginRight: '1rem', fontWeight: 'bold' }}>Change Status:</label>
                <select
                  value={selectedClientForModal.status}
                  onChange={(e) =>
                    setSelectedClientForModal(prev => ({ ...prev, status: e.target.value }))
                  }
                  style={{ padding: '0.5rem', fontSize: '1rem' }}
                >
                  {STATUSES.map(status => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <button
                  style={{
                    marginLeft: '1rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#0288d1',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  onClick={async () => {
                    try {
                      const result = await updateClientStatus(
                        selectedClientForModal.id,
                        selectedClientForModal.status,
                        selectedClientForModal.status,
                        userName
                      );
                      if (result.success) {
                        logState("Status update successful", { clientId: selectedClientForModal.id, newStatus: selectedClientForModal.status });
                        setFeedback({
                          open: true,
                          message: "Client status updated successfully",
                          severity: "success"
                        });
                        setSelectedClientForModal(null);
                      }
                    } catch (err) {
                      logError("Failed to update client status", err);
                      setFeedback({
                        open: true,
                        message: err.message || "Error updating status",
                        severity: "error"
                      });
                    }
                  }}
                >
                  Update Status
                </button>
              </div>
            </div>
          )}
        </Dialog>
      </div>
    </DndProvider>
  );
};

export default FranchiseClients;