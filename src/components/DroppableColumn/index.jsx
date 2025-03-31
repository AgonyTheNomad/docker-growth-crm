import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
  Children
} from 'react';
import { useDrop } from 'react-dnd';
import {
  Paper,
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { styled } from '@mui/system';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

// Example sub-status options; adjust these as needed.
const STATUS_OPTIONS = {
  "On Pause": ["On Pause", "Returned SA", "Awaiting OS"],
  "Active": [
    "MAPS Credit",
    "Trade",
    "Active",
    "Active but Awaiting Replacement",
    "Active (Winback)",
    "Winback",
    "Active (NR - 6months)"
  ],
  "Awaiting Replacement": [
    "Awaiting Replacement",
    "Suspended",
    "Ghosted",
    "Pending On Hold",
    "Pending Cancellation",
    "On Hold"
  ]
};

// ---------- Styled Components ----------
const ColumnContainer = styled(Paper)(({ theme }) => ({
  width: 320,
  display: 'flex',
  flexDirection: 'column',
  margin: '0.75rem',
  borderRadius: 8,
  overflow: 'hidden',
  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
  borderTop: `4px solid ${theme.palette.primary.main}` // Colored top border to indicate status type
}));

const FilterArea = styled('div')({
  backgroundColor: '#f9f9f9',
  padding: '0.75rem 1rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  borderBottom: '1px solid #ddd'
});

// The body is set to flex:1 so it fills available space, with its own vertical scroll.
const ColumnBody = styled('div')({
  flex: 1,
  overflowY: 'auto',
  backgroundColor: '#fff',
  padding: '0.75rem 1rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem'
});

const ColumnFooter = styled('div')({
  padding: '0.75rem 1rem',
  borderTop: '1px solid #ddd',
  backgroundColor: '#fafafa',
  textAlign: 'center'
});

const LoadingSpinner = () => (
  <Box display="flex" justifyContent="center" alignItems="center" py={2}>
    <CircularProgress size={24} />
  </Box>
);

// ---------- Main Component ----------
const DroppableColumn = ({
  id,
  title,
  children,
  onDrop,
  selectedClients = [],
  loadAllClients,
  hasMore,
  totalCount,
  totalAvailable,
  onSearch,
  isSearchActive
}) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [clientToUpdate, setClientToUpdate] = useState(null);
  const [loadingAll, setLoadingAll] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [allLoaded, setAllLoaded] = useState(false);
  const columnBodyRef = useRef(null);
  const [feedback, setFeedback] = useState({ open: false, message: '', severity: 'info' });

  // Convert children to array
  const allChildren = Children.toArray(children);
  const currentCount = allChildren.length;

  // Compute unique client names (for search suggestions)
  const clientNames = useMemo(() => {
    const names = new Set();
    allChildren.forEach(child => {
      const clientName = child.props.client?.client_name;
      if (clientName) names.add(clientName);
    });
    return Array.from(names);
  }, [allChildren]);

  // Handler for sub-status selection
  const handleStatusChange = useCallback((e) => {
    setSelectedStatus(e.target.value);
  }, []);

  // Search handlers
  const handleSearchChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleServerSearch = useCallback(async () => {
    if (!inputValue.trim() || isSearching) return;
    setIsSearching(true);
    try {
      await onSearch(title, inputValue, selectedStatus || undefined);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, [inputValue, isSearching, onSearch, title, selectedStatus]);

  const handleClearSearch = () => {
    setInputValue('');
    onSearch && onSearch(title, '', selectedStatus || undefined);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleServerSearch();
  };

  // Filter displayed children based on search and sub-status
  const displayedChildren = useMemo(() => {
    if (isSearchActive) return allChildren;
    return allChildren.filter(child => {
      const client = child.props.client;
      if (!client) return false;
      const matchesStatus = !selectedStatus || client.status === selectedStatus;
      const matchesSearch =
        !inputValue ||
        client.client_name?.toLowerCase().includes(inputValue.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [allChildren, inputValue, selectedStatus, isSearchActive]);

  useEffect(() => {
    setPage(1);
    setAllLoaded(false); // Reset allLoaded state when title changes
  }, [title]);

  // Check if we've loaded all clients when count changes
  useEffect(() => {
    if (currentCount >= totalCount * 0.99) { // Allow for small discrepancies
      console.log(`All clients loaded for ${title}: ${currentCount}/${totalCount}`);
      setAllLoaded(true);
      setLoadingAll(false);
    }
  }, [currentCount, totalCount, title]);

  // Handle Load All
  const handleLoadAll = () => {
    if (loadingAll) return;
    
    console.log(`Starting loadAll for status: ${title}`);
    setLoadingAll(true);
    
    try {
      // Make sure loadAllClients exists and is a function
      if (typeof loadAllClients !== 'function') {
        console.error('loadAllClients is not a function:', loadAllClients);
        setFeedback({
          open: true,
          message: 'Load all function not properly configured',
          severity: 'error'
        });
        return;
      }
      
      // Call the loadAllClients function directly
      loadAllClients(title);
      console.log(`Called loadAllClients(${title})`);
      
      // We rely on WebSocket message handler to update state and UI
    } catch (error) {
      console.error('Error loading all clients:', error);
      setFeedback({
        open: true,
        message: `Failed to load all clients: ${error.message}`,
        severity: 'error'
      });
      setLoadingAll(false);
    }
  };

  // Drag-and-drop logic
  const [{ canDrop, isOver }, dropRef] = useDrop({
    accept: 'client',
    drop: (item) => {
      if (selectedClients.length > 0) {
        handleClientDrop(selectedClients, title);
      } else {
        handleClientDrop([item.id], title);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  });

  const handleClientDrop = useCallback((clientIds, newColumn) => {
    if (["On Pause", "Active", "Awaiting Replacement"].includes(newColumn)) {
      setClientToUpdate({ clientIds, newColumn });
      setStatusModalOpen(true);
    } else {
      onDrop(clientIds, newColumn);
    }
  }, [onDrop]);

  const confirmStatusChange = useCallback(() => {
    if (!clientToUpdate) return;
    const { clientIds, newColumn } = clientToUpdate;
    clientIds.forEach(id => onDrop(id, newColumn, selectedStatus));
    setStatusModalOpen(false);
    setClientToUpdate(null);
    setSelectedStatus('');
  }, [clientToUpdate, selectedStatus, onDrop]);

  // Determine actual total count - use totalCount directly if provided
  // fallback to totalAvailable and finally to the children count
  const actualTotalCount = totalCount || totalAvailable || currentCount;

  // Determine if we should show the load all button
  const showLoadAllButton = !isSearchActive && currentCount < actualTotalCount && hasMore && !allLoaded;

  return (
    <ColumnContainer 
      id={id} 
      ref={dropRef} 
      sx={{ 
        boxShadow: isOver && canDrop ? '0 0 6px rgba(0,200,0,0.5)' : undefined,
        backgroundColor: '#1e293b' // Dark background
      }}
    >
      {/* Status header that matches your StatusHeaders component styling */}
      <div className="status-header flex-shrink-0 px-4 py-2 mx-0 rounded-t-md bg-gray-700 text-center">
        <div className="flex items-center justify-between">
          <span className="font-medium text-white">{title}</span>
          <span className="text-sm px-2 py-1 bg-gray-600 text-blue-300 rounded-md">
            {currentCount} / {actualTotalCount}
          </span>
        </div>
      </div>

      {/* Filter Area */}
      <FilterArea sx={{ backgroundColor: '#111827', borderBottom: '1px solid #374151' }}>
        {STATUS_OPTIONS[title] && (
          <FormControl fullWidth size="small">
            <InputLabel sx={{ color: '#94a3b8' }}>Status</InputLabel>
            <Select 
              value={selectedStatus} 
              onChange={handleStatusChange} 
              label="Status"
              sx={{
                color: 'white',
                '.MuiOutlinedInput-notchedOutline': {
                  borderColor: '#374151'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#4b5563'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#60a5fa'
                },
                '.MuiSvgIcon-root': {
                  color: '#94a3b8'
                }
              }}
            >
              <MenuItem value="">
                <em>All</em>
              </MenuItem>
              {STATUS_OPTIONS[title].map(s => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        <TextField
          variant="outlined"
          size="small"
          fullWidth
          label="Search client..."
          value={inputValue}
          onChange={handleSearchChange}
          onKeyPress={handleKeyPress}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {inputValue && (
                  <IconButton size="small" onClick={handleClearSearch} disabled={isSearching} sx={{ color: '#94a3b8' }}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                )}
                <IconButton size="small" onClick={handleServerSearch} disabled={!inputValue || isSearching} edge="end" sx={{ color: '#94a3b8' }}>
                  {isSearching ? <CircularProgress size={16} sx={{ color: '#60a5fa' }} /> : <SearchIcon fontSize="small" />}
                </IconButton>
              </InputAdornment>
            ),
            sx: {
              color: 'white',
              '.MuiOutlinedInput-notchedOutline': {
                borderColor: '#374151'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#4b5563'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#60a5fa'
              }
            }
          }}
          InputLabelProps={{
            sx: { color: '#94a3b8' }
          }}
        />
        
        {/* Small indicator of how many items are shown */}
        <Typography variant="caption" sx={{ color: '#94a3b8' }} align="right">
          {displayedChildren.length} of {currentCount} loaded items
        </Typography>
      </FilterArea>

      {/* Body */}
      <ColumnBody ref={columnBodyRef} sx={{ backgroundColor: '#0f172a' }}>
        {displayedChildren.length > 0 ? (
          displayedChildren.map((child, idx) => (
            <Box key={child.key || idx}>{child}</Box>
          ))
        ) : (
          <Typography variant="body2" sx={{ color: '#94a3b8' }} textAlign="center" mt={2}>
            {inputValue ? 'No matching clients found' : 'No clients in this status'}
          </Typography>
        )}
        {loadingAll && (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <CircularProgress size={24} sx={{ color: '#3b82f6' }} />
            <Typography variant="body2" sx={{ color: '#94a3b8', mt: 1 }}>
              Loading all clients...
            </Typography>
          </Box>
        )}
      </ColumnBody>

      {/* Footer with Load All button */}
      {showLoadAllButton && (
        <ColumnFooter sx={{ backgroundColor: '#1e293b', borderTop: '1px solid #374151' }}>
          <Button 
            variant="contained" 
            size="small" 
            disabled={loadingAll} 
            onClick={handleLoadAll}
            sx={{ 
              backgroundColor: '#3b82f6',
              '&:hover': {
                backgroundColor: '#2563eb',
              }
            }}
          >
            {loadingAll ? (
              <React.Fragment>
                <CircularProgress size={16} sx={{ mr: 1, color: 'white' }} />
                Loading...
              </React.Fragment>
            ) : (
              `Load All (${actualTotalCount - currentCount} remaining)`
            )}
          </Button>
        </ColumnFooter>
      )}

      {/* Show message when all clients are loaded */}
      {allLoaded && (
        <ColumnFooter sx={{ backgroundColor: '#1e293b', borderTop: '1px solid #374151' }}>
          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
            All clients loaded ({currentCount})
          </Typography>
        </ColumnFooter>
      )}

      {/* Modal for sub-status selection */}
      <Dialog 
        open={statusModalOpen} 
        onClose={() => setStatusModalOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: '#1e293b',
            color: 'white'
          }
        }}
      >
        <DialogTitle>Select Status</DialogTitle>
        <DialogContent>
          <Box sx={{ minWidth: 300 }}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: '#94a3b8' }}>Status</InputLabel>
              <Select 
                value={selectedStatus} 
                onChange={handleStatusChange} 
                label="Status"
                sx={{
                  color: 'white',
                  '.MuiOutlinedInput-notchedOutline': {
                    borderColor: '#374151'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#4b5563'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#60a5fa'
                  },
                  '.MuiSvgIcon-root': {
                    color: '#94a3b8'
                  }
                }}
              >
                <MenuItem value="">
                  <em>Select a status</em>
                </MenuItem>
                {STATUS_OPTIONS[clientToUpdate?.newColumn]?.map(s => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusModalOpen(false)} sx={{ color: '#94a3b8' }}>Cancel</Button>
          <Button 
            onClick={confirmStatusChange} 
            disabled={!selectedStatus} 
            variant="contained"
            sx={{ 
              backgroundColor: '#3b82f6',
              '&:hover': {
                backgroundColor: '#2563eb',
              }
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Snackbar */}
      <Snackbar
        open={feedback.open}
        autoHideDuration={6000}
        onClose={() => setFeedback(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setFeedback(prev => ({ ...prev, open: false }))} 
          severity={feedback.severity} 
          sx={{ width: '100%' }}
        >
          {feedback.message}
        </Alert>
      </Snackbar>
    </ColumnContainer>
  );
};

export default DroppableColumn;