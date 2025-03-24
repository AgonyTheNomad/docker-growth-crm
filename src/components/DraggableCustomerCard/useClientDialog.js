import { useState, useCallback } from 'react';

export const useClientDialog = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenDialog = useCallback(() => setIsDialogOpen(true), []);
  const handleCloseDialog = useCallback(() => setIsDialogOpen(false), []);

  return { isDialogOpen, handleOpenDialog, handleCloseDialog };
};