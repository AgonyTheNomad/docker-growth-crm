// hooks/useClientEdit.js
import { useState, useCallback } from 'react';
import { constructUrl } from '../../utils/apiUtils';

export const useClientEdit = (initialClient) => {
  const [clientState, setClientState] = useState(initialClient);
  const [initialClientState] = useState(initialClient);
  const [isEdited, setIsEdited] = useState(false);

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setClientState(prevState => {
      const newState = { ...prevState, [name]: value };
      setIsEdited(JSON.stringify(newState) !== JSON.stringify(initialClientState));
      return newState;
    });
  }, [initialClientState]);

  const handleSave = useCallback(async () => {
    try {
      const response = await fetch(constructUrl(`/clients/update/${clientState.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientState)
      });
      if (!response.ok) throw new Error('Failed to save updates');
      const updatedClient = await response.json();
      setClientState(updatedClient.client);
      setIsEdited(false);
    } catch (error) {
      console.error('Save error:', error);
      alert('There was an issue saving the updates.');
    }
  }, [clientState]);

  return { clientState, initialClient: initialClientState, isEdited, handleChange, handleSave };
};