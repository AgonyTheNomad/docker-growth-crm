import config from '../config';

// Helper function to construct the base URL for API requests
export const constructUrl = (path) => {
  try {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(normalizedPath, config.BASE_URL);
    return url.toString();
  } catch (error) {
    console.error('Error constructing API URL:', { path, baseURL: config.BASE_URL, error });
    throw new Error('Invalid API URL configuration');
  }
};

// Helper function to construct WebSocket URL
export const constructWsUrl = (path) => {
  try {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(normalizedPath, config.WS_BASE_URL);
    return url.toString();
  } catch (error) {
    console.error('Error constructing WebSocket URL:', { path, wsBaseURL: config.WS_BASE_URL, error });
    throw new Error('Invalid WebSocket URL configuration');
  }
};

// Main authenticated fetch utility
export const authFetch = async (url, options = {}, user = null) => {
  try {
    const headers = {
      ...options.headers,
      Authorization: user?.username || config.AUTH_USER,  // Changed to match backend expectations
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
      mode: 'cors',
    });

    console.log(`API Request (${url}):`, {
      method: options.method || 'GET',
      headers,
      status: response.status,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage =
        errorData?.detail || errorData?.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Fetch error:', { url, options, error });

    if (!navigator.onLine) {
      throw new Error('Please check your internet connection');
    }

    if (error.message === 'Failed to fetch') {
      throw new Error(`Unable to connect to server at ${url}. Please check if the server is running.`);
    }

    throw error;
  }
};

// Fetch all clients with optional filters
export const fetchClients = async (params = {}, user) => {
  const queryParams = new URLSearchParams(params).toString();
  const url = constructUrl(`/clients?${queryParams}`);
  return authFetch(url, { method: 'GET' }, user);
};

// Get a specific client
export const getClient = async (clientId, user) => {
  const url = constructUrl(`/clients/${clientId}`);
  return authFetch(url, { method: 'GET' }, user);
};

// Create a new client
export const addNewClient = async (clientData, user) => {
  const url = constructUrl('/clients');
  return authFetch(
    url,
    {
      method: 'POST',
      body: JSON.stringify(clientData),
    },
    user
  );
};

// Update a client
export const updateClient = async (clientId, clientData, user) => {
  const url = constructUrl(`/clients/${clientId}`);
  return authFetch(
    url,
    {
      method: 'PUT',
      body: JSON.stringify(clientData),
    },
    user
  );
};

// Update client status
export const updateClientStatus = async (clientId, statusUpdate, user) => {
  const url = constructUrl(`/clients/update-status/${clientId}`);
  return authFetch(
    url,
    {
      method: 'PUT',
      body: JSON.stringify(statusUpdate),
    },
    user
  );
};

// Delete a client
export const deleteClient = async (clientId, user) => {
  const url = constructUrl(`/clients/${clientId}`);
  return authFetch(
    url,
    {
      method: 'DELETE',
    },
    user
  );
};

// Get client status history
export const getClientStatusHistory = async (clientId, user) => {
  const url = constructUrl(`/clients/${clientId}/status-history`);
  return authFetch(url, { method: 'GET' }, user);
};

// Add client note
export const addClientNote = async (clientId, noteData, user) => {
  const url = constructUrl(`/clients/${clientId}/notes`);
  return authFetch(
    url,
    {
      method: 'POST',
      body: JSON.stringify(noteData),
    },
    user
  );
};

// Get client notes
export const getClientNotes = async (clientId, user) => {
  const url = constructUrl(`/clients/${clientId}/notes`);
  return authFetch(url, { method: 'GET' }, user);
};

// Get analytics data
export const getAnalytics = async (user) => {
  const url = constructUrl('/analytics/status');
  return authFetch(url, { method: 'GET' }, user);
};

// Health check for FastAPI server
export const checkServerConnectivity = async (user) => {
  try {
    const url = constructUrl('/health');
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: user?.username || config.AUTH_USER,
      },
    });
    return response.ok;
  } catch (error) {
    console.error('Server connectivity check failed:', error);
    return false;
  }
};

// Convenience method to create user-specific request handlers
export const createAuthenticatedRequest = (user) => {
  return {
    get: async (url, options = {}) => {
      return authFetch(constructUrl(url), { ...options, method: 'GET' }, user);
    },
    post: async (url, data, options = {}) => {
      return authFetch(
        constructUrl(url),
        {
          ...options,
          method: 'POST',
          body: JSON.stringify(data),
        },
        user
      );
    },
    put: async (url, data, options = {}) => {
      return authFetch(
        constructUrl(url),
        {
          ...options,
          method: 'PUT',
          body: JSON.stringify(data),
        },
        user
      );
    },
    delete: async (url, options = {}) => {
      return authFetch(
        constructUrl(url),
        { ...options, method: 'DELETE' },
        user
      );
    },
  };
};

export const updateRequiredFields = async (clientId, updateData, user) => {
  const url = constructUrl(`/clients/${clientId}/required-fields`);
  return authFetch(
    url,
    {
      method: 'PUT',
      body: JSON.stringify(updateData),
    },
    user
  );
};

export const updateRequiredFieldsWithNote = async (clientId, updateData, noteText, user) => {
  try {
    // First request - update required fields
    const fieldsUrl = constructUrl(`/api/clients/${clientId}/required-fields`);
    const fieldsResponse = await authFetch(
      fieldsUrl,
      {
        method: 'PUT',
        body: JSON.stringify(updateData),
      },
      user
    );

    // Second request - create note
    const noteUrl = constructUrl(`/api/clients/${clientId}/notes`);
    const noteResponse = await authFetch(
      noteUrl,
      {
        method: 'POST',
        body: JSON.stringify({
          note: noteText,
          client_id: clientId,
          uid: user?.uid || user?.username
        }),
      },
      user
    );

    return {
      fieldsUpdate: fieldsResponse,
      noteCreated: noteResponse,
      success: true
    };
  } catch (error) {
    console.error('Error in updateRequiredFieldsWithNote:', {
      error,
      clientId,
      updateData
    });
    throw error;
  }
};

export const formatFieldChangesNote = (oldStatus, newStatus, changedFields) => {
  const changes = Object.entries(changedFields)
    .map(([field, { oldValue, newValue }]) => {
      return `${field}: ${oldValue || 'Not set'} → ${newValue}`;
    })
    .join('\n');

  return `Status changed from ${oldStatus} to ${newStatus}\n\nField updates:\n${changes}`;
};