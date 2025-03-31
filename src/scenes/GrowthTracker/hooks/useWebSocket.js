// src/hooks/useWebSocket.js
import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '../../../services/UserContext';
import { constructWsUrl } from '../../../utils/apiUtils';
import { FRANCHISE_OPTIONS } from '../constants'; // Import franchise options

// Constants
const RECONNECT_DELAY = 3000;
const PING_INTERVAL = 15000;
const MAX_RECONNECT_ATTEMPTS = 10;
const ITEMS_PER_BATCH = 50;
const CONNECTION_TIMEOUT = 10000;

// Logging utilities
const logState = (action, data = {}) => {
  console.log(`[WebSocket] ${action}:`, {
    timestamp: new Date().toISOString(),
    ...data
  });
};

const logError = (message, error = {}) => {
  console.error(`[WebSocket Error] ${message}:`, {
    timestamp: new Date().toISOString(),
    error,
    stack: error.stack
  });
};

export const useWebSocket = (selectedFranchise, onDataUpdate, setHasMore, setLoading) => {
  // Refs
  const wsRef = useRef(null);
  const pingIntervalRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const connectionTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const pagesLoadedRef = useRef({});
  const lastMessageTimeRef = useRef(Date.now());
  const mountedRef = useRef(true);
  // NEW: Ref to track which statuses have been fully loaded (via Load All)
  const allLoadedStatusesRef = useRef({});

  // State
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [connectionState, setConnectionState] = useState('disconnected');
  const [statusHasMore, setStatusHasMore] = useState({});
  const [internalClients, setInternalClients] = useState({});
  const [loadingStatus, setLoadingStatus] = useState({});

  // Auth context
  const { userName } = useAuth();

  // Utility function for franchise name conversion
  const getFullFranchiseName = useCallback((franchiseCode) => {
    if (!franchiseCode) return null;
    
    const franchiseOption = FRANCHISE_OPTIONS.find(option => option.value === franchiseCode);
    // Return the label which contains the full name
    return franchiseOption ? franchiseOption.label : franchiseCode;
  }, []);

  // Cleanup connection
  const cleanupConnection = useCallback(() => {
    logState('Cleaning up connection');
    if (wsRef.current) {
      wsRef.current.close(1000, "Cleanup");
      wsRef.current = null;
    }
    clearInterval(pingIntervalRef.current);
    clearTimeout(reconnectTimeoutRef.current);
    clearTimeout(connectionTimeoutRef.current);
    setConnectionState('disconnected');
  }, []);

  // Handle reconnection
  const handleReconnect = useCallback(() => {
    if (!mountedRef.current) return;

    cleanupConnection();

    if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      logState('Max reconnection attempts reached');
      setError('Maximum reconnection attempts reached. Please refresh the page.');
      setConnectionState('failed');
      return;
    }

    reconnectAttemptsRef.current++;
    const delay = RECONNECT_DELAY * Math.pow(1.5, reconnectAttemptsRef.current - 1);
    
    logState('Scheduling reconnect', {
      attempt: reconnectAttemptsRef.current,
      delay
    });
    
    setConnectionState('reconnecting');
    reconnectTimeoutRef.current = setTimeout(connect, delay);
  }, [cleanupConnection]);

  // Start ping interval (modified to check for load-all flags)
  const startPingInterval = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
    }

    pingIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        try {
          // If any status has been fully loaded, send a fetchAllForStatus for each
          if (Object.keys(allLoadedStatusesRef.current).length > 0) {
            Object.keys(allLoadedStatusesRef.current).forEach(status => {
              wsRef.current.send(JSON.stringify({
                type: 'fetchAllForStatus',
                status,
                specificStatus: null, // you can set this if needed
                filterMode: window.currentFilterMode || 'assigned',
                timestamp: Date.now()
              }));
              logState('Ping: fetchAllForStatus sent for status', { status });
            });
          } else {
            // Otherwise, send a regular ping
            wsRef.current.send(JSON.stringify({
              type: 'ping',
              timestamp: Date.now()
            }));
            logState('Ping sent');
          }
        } catch (error) {
          logError('Error sending ping', error);
          handleReconnect();
        }
      }
    }, PING_INTERVAL);
  }, [handleReconnect]);

  // Handle preview message
  const handlePreviewMessage = useCallback((message) => {
    if (!mountedRef.current) return;
    logState('Handling preview message', message);
    
    try {
      const processedData = message.data;
      setInternalClients(processedData);
      
      // Reset pagination state for new data
      pagesLoadedRef.current = {};
      Object.entries(processedData).forEach(([status, data]) => {
        const loadedCount = data.preview?.length || 0;
        const total = data.total || 0;
        
        pagesLoadedRef.current[status] = {
          currentPage: 1,
          total: total,
          loadedCount: loadedCount
        };

        setStatusHasMore(prev => ({
          ...prev,
          [status]: loadedCount < total
        }));
      });
      
      setLoading(false);
    } catch (error) {
      logError('Error processing preview data', error);
      setError('Error processing data');
      setLoading(false);
    }
  }, [setLoading]);

  // Handle clients message (for paginated load more)
  const handleClientsMessage = useCallback((message) => {
    if (!mountedRef.current) return;
    logState('Handling clients message', message);

    const { status, clients: newClients, total, page } = message;
    
    if (!status || !Array.isArray(newClients)) {
      logError('Invalid clients message format');
      return;
    }

    setInternalClients(prevState => {
      const updatedState = { ...prevState };
      
      if (!updatedState[status]) {
        updatedState[status] = { preview: [], total: 0 };
      }

      // If it's page 1, replace the data, otherwise append
      const preview = page === 1 
        ? newClients 
        : [...(updatedState[status].preview || []), ...newClients];

      updatedState[status] = {
        preview,
        total: total
      };

      return updatedState;
    });

    // Update pagination state
    const currentLoaded = page === 1 
      ? newClients.length 
      : (pagesLoadedRef.current[status]?.loadedCount || 0) + newClients.length;

    pagesLoadedRef.current[status] = {
      currentPage: page,
      total: total,
      loadedCount: currentLoaded
    };

    setStatusHasMore(prev => ({
      ...prev,
      [status]: currentLoaded < total
    }));

    setLoadingStatus(prev => ({
      ...prev,
      [status]: false
    }));

    logState('Updated clients data', {
      status,
      currentLoaded,
      total,
      hasMore: currentLoaded < total
    });
  }, []);

  // Handle allClientsForStatus message – update state with the full list and mark as fully loaded
  const handleAllClientsMessage = useCallback((message) => {
    if (!mountedRef.current) return;
    logState('Handling allClientsForStatus message', message);

    const { status, clients, total } = message;
    
    if (!status || !Array.isArray(clients)) {
      logError('Invalid allClientsForStatus message format');
      return;
    }

    setInternalClients(prevState => {
      const updatedState = { ...prevState };
      
      updatedState[status] = {
        preview: clients, // full list from the server
        total: total
      };

      return updatedState;
    });

    // Update pagination state to reflect we have all items
    pagesLoadedRef.current[status] = {
      currentPage: Math.ceil(clients.length / ITEMS_PER_BATCH),
      total: total,
      loadedCount: clients.length
    };

    setStatusHasMore(prev => ({
      ...prev,
      [status]: false // mark as no more items to load
    }));

    setLoadingStatus(prev => ({
      ...prev,
      [status]: false
    }));

    // Mark this status as fully loaded so that pings will refresh the full data
    allLoadedStatusesRef.current[status] = true;

    logState('Loaded all clients for status', {
      status,
      count: clients.length,
      total
    });
  }, []);

  // Enhanced sendMessage function to handle franchise names using LABELS
  const sendMessage = useCallback((message) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      logError('WebSocket not ready to send message', { readyState: wsRef.current?.readyState });
      return false;
    }

    try {
      let messageToSend = message;
      
      if (typeof message === 'object' && message.type === 'searchInStatus') {
        if (!message.franchise && selectedFranchise) {
          const fullFranchiseName = getFullFranchiseName(selectedFranchise);
          messageToSend = {
            ...message,
            franchise: fullFranchiseName
          };
          logState('Enhanced search message with franchise label', { 
            code: selectedFranchise, 
            fullName: fullFranchiseName 
          });
        }
      }

      const messageString = typeof messageToSend === 'string' ? messageToSend : JSON.stringify(messageToSend);
      wsRef.current.send(messageString);
      logState('Message sent successfully', { message: messageToSend });
      return true;
    } catch (error) {
      logError('Error sending WebSocket message', error);
      return false;
    }
  }, [selectedFranchise, getFullFranchiseName]);

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((event) => {
    if (!mountedRef.current) return;
    lastMessageTimeRef.current = Date.now();
  
    try {
      const message = JSON.parse(event.data);
      logState('Received message', message);
      
      // Pass message to custom handler first
      const customResponse = onDataUpdate(message);
      if (customResponse) {
        sendMessage(customResponse);
        return;
      }
      
      switch (message.type) {
        case 'preview':
          handlePreviewMessage(message);
          break;
        case 'clients':
          handleClientsMessage(message);
          break;
        case 'allClientsForStatus':
          handleAllClientsMessage(message);
          break;
        case 'error':
          logError('Server error', message);
          setError(message.message);
          setLoading(false);
          break;
        case 'pong':
          logState('Received pong');
          break;
        case 'searchResults':
          logState('Search results received', { 
            count: message.clients?.length || 0,
            status: message.status 
          });
          break;
        default:
          logState('Unhandled message type', { type: message.type });
      }
    } catch (error) {
      logError('Error processing message', error);
      setLoading(false);
    }
  }, [onDataUpdate, sendMessage, handlePreviewMessage, handleClientsMessage, handleAllClientsMessage, setLoading]);

  // Update client status
  const updateClientStatus = useCallback(async (clientId, newStatus, currentStatus, user) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket connection not available');
    }

    try {
      wsRef.current.send(JSON.stringify({
        type: 'update',
        clientId,
        newStatus,
        currentStatus,
        user: user.displayName || user,
        filterMode: window.currentFilterMode,
        timestamp: Date.now()
      }));

      return { success: true };
    } catch (error) {
      logError('Status update error', error);
      throw new Error(`Failed to update client status: ${error.message}`);
    }
  }, []);

  // Load more clients (pagination)
  const loadMoreClients = useCallback((status) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      logError('WebSocket not ready', { readyState: wsRef.current?.readyState });
      return;
    }

    const pageInfo = pagesLoadedRef.current[status] || { currentPage: 0, loadedCount: 0, total: 0 };
    const nextPage = pageInfo.currentPage + 1;

    logState('Loading more clients', {
      status,
      currentPage: pageInfo.currentPage,
      nextPage,
      loadedCount: pageInfo.loadedCount,
      total: pageInfo.total,
      filterMode: window.currentFilterMode
    });

    if (pageInfo.loadedCount >= pageInfo.total) {
      logState('All items loaded', { status });
      setStatusHasMore(prev => ({
        ...prev,
        [status]: false
      }));
      return;
    }

    setLoadingStatus(prev => ({
      ...prev,
      [status]: true
    }));

    wsRef.current.send(JSON.stringify({
      type: 'fetchMore',
      status,
      filterMode: window.currentFilterMode,
      page: nextPage,
      itemsPerPage: ITEMS_PER_BATCH,
      timestamp: Date.now()
    }));
  }, []);

  // Load all clients for a specific status and franchise – triggered by the button
  const loadAllClients = useCallback((status, specificStatus = null) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      logError('WebSocket not ready', { readyState: wsRef.current?.readyState });
      return;
    }

    logState('Loading all clients for status', {
      status,
      specificStatus,
      filterMode: window.currentFilterMode
    });

    setLoadingStatus(prev => ({
      ...prev,
      [status]: true
    }));

    wsRef.current.send(JSON.stringify({
      type: 'fetchAllForStatus',
      status,
      specificStatus,
      filterMode: window.currentFilterMode || 'assigned',
      timestamp: Date.now()
    }));

    // Optionally, clear any previous flag so that the new load is registered
    allLoadedStatusesRef.current[status] = false;
  }, []);

  // Initialize WebSocket connection
  const connect = useCallback(() => {
    if (!mountedRef.current) {
      return;
    }
  
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }
  
    setLoading(true);
    setConnectionState('connecting');
  
    try {
      cleanupConnection();
  
      const params = new URLSearchParams({
        authorization: userName,
        filterMode: window.currentFilterMode || 'assigned'
      });
      
      if (selectedFranchise) {
        const fullFranchiseName = getFullFranchiseName(selectedFranchise);
        params.append('franchise', fullFranchiseName);
        logState('Using franchise for connection', { 
          code: selectedFranchise, 
          fullName: fullFranchiseName 
        });
      }
      
      const wsUrl = constructWsUrl(`/ws/clients?${params.toString()}`);
      logState('Connecting to WebSocket', { 
        url: wsUrl, 
        franchiseSpecified: !!selectedFranchise 
      });
  
      wsRef.current = new WebSocket(wsUrl);
  
      connectionTimeoutRef.current = setTimeout(() => {
        if (wsRef.current?.readyState !== WebSocket.OPEN) {
          if (wsRef.current) {
            wsRef.current.close();
          }
          handleReconnect();
        }
      }, CONNECTION_TIMEOUT);
  
      wsRef.current.onopen = () => {
        if (!mountedRef.current) return;
        
        clearTimeout(connectionTimeoutRef.current);
        setConnected(true);
        setError(null);
        setConnectionState('connected');
        reconnectAttemptsRef.current = 0;
        
        startPingInterval();
  
        wsRef.current.send(JSON.stringify({ 
          type: 'fetchPreview',
          filterMode: window.currentFilterMode || 'assigned',
          timestamp: Date.now()
        }));

        // Send growthbacker filter after connecting
        const growthbackerFilter = window.growthbackerFilter || null;
        wsRef.current.send(JSON.stringify({ 
          type: 'setGrowthbacker',
          growthbacker: window.currentFilterMode === 'assigned' ? growthbackerFilter : null,
          filterMode: window.currentFilterMode || 'assigned',
          timestamp: Date.now()
        }));
      };
  
      wsRef.current.onmessage = handleWebSocketMessage;
  
      wsRef.current.onclose = (event) => {
        if (!mountedRef.current) return;
        
        setConnected(false);
        setConnectionState('disconnected');
        clearInterval(pingIntervalRef.current);
        
        if (!event.wasClean) {
          handleReconnect();
        }
      };
  
      wsRef.current.onerror = (error) => {
        if (!mountedRef.current) return;
        logError('WebSocket error', error);
        setConnectionState('error');
        handleReconnect();
      };
  
    } catch (error) {
      logError('Connection creation error', error);
      setError('Failed to create connection');
      setConnectionState('error');
      setLoading(false);
      handleReconnect();
    }
  }, [
    selectedFranchise,
    userName,
    handleWebSocketMessage,
    startPingInterval,
    cleanupConnection,
    handleReconnect,
    setLoading,
    getFullFranchiseName
  ]);

  // Reset pagination when franchise changes
  useEffect(() => {
    if (selectedFranchise !== undefined) {
      pagesLoadedRef.current = {};
      setStatusHasMore({});
      setLoadingStatus({});
    }
  }, [selectedFranchise]);

  // Lifecycle effects
  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      cleanupConnection();
    };
  }, [connect, cleanupConnection]);

  // Handle visibility and network changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (!connected) {
          reconnectAttemptsRef.current = 0;
          connect();
        }
      } else {
        cleanupConnection();
      }
    };

    const handleOnline = () => {
      reconnectAttemptsRef.current = 0;
      connect();
    };

    const handleOffline = () => {
      cleanupConnection();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [connect, connected, cleanupConnection]);

  return {
    connected,
    error,
    connectionState,
    updateClientStatus,
    loadMoreClients,
    loadAllClients,
    hasMore: statusHasMore,
    loadingStatus,
    reconnectAttempts: reconnectAttemptsRef.current,
    handleManualReconnect: () => {
      reconnectAttemptsRef.current = 0;
      connect();
    },
    sendMessage,
    getFullFranchiseName
  };
};

export default useWebSocket;
