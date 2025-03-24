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
  CircularProgress
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
  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
}));

const ColumnHeader = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: '#fff',
  padding: '0.75rem 1rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
}));

const ColumnTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  fontSize: '1.1rem'
}));

const FilterArea = styled('div')({
  backgroundColor: '#f9f9f9',
  borderBottom: '1px solid #ddd',
  padding: '0.75rem 1rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem'
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
  loadMoreClients,
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [page, setPage] = useState(1);
  const columnBodyRef = useRef(null);

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
    onSearch(title, '', selectedStatus || undefined);
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
  }, [title]);

  // Manual Load More button
  const handleLoadMore = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      await loadMoreClients(title, nextPage);
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more:', error);
    } finally {
      setLoadingMore(false);
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

  // Determine actual total count
  const actualTotal = typeof totalAvailable === 'number' ? totalAvailable : totalCount;

  return (
    <ColumnContainer id={id} ref={dropRef} sx={{ boxShadow: isOver && canDrop ? '0 0 6px rgba(0,200,0,0.5)' : undefined }}>
      {/* Header */}
      <ColumnHeader>
        {typeof title === 'string' ? (
          <ColumnTitle>{title}</ColumnTitle>
        ) : (
          <Box display="flex" alignItems="center" gap={1}>
            {title}
          </Box>
        )}
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          {displayedChildren.length} / {actualTotal}
        </Typography>
      </ColumnHeader>

      {/* Filter Area */}
      <FilterArea>
        {STATUS_OPTIONS[title] && (
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select value={selectedStatus} onChange={handleStatusChange} label="Status">
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
                  <IconButton size="small" onClick={handleClearSearch} disabled={isSearching}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                )}
                <IconButton size="small" onClick={handleServerSearch} disabled={!inputValue || isSearching} edge="end">
                  {isSearching ? <CircularProgress size={16} /> : <SearchIcon fontSize="small" />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </FilterArea>

      {/* Body */}
      <ColumnBody ref={columnBodyRef}>
        {displayedChildren.length > 0 ? (
          displayedChildren.map((child, idx) => (
            <Box key={child.key || idx}>{child}</Box>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 2 }}>
            {inputValue ? 'No matching clients found' : 'No clients in this status'}
          </Typography>
        )}
        {loadingMore && <LoadingSpinner />}
      </ColumnBody>

      {/* Footer with Load More button */}
      {!isSearchActive && currentCount < actualTotal && (
        <ColumnFooter>
          <Button variant="contained" size="small" disabled={loadingMore || !hasMore} onClick={handleLoadMore}>
            {loadingMore ? 'Loading...' : `Load More (${actualTotal - currentCount} remaining)`}
          </Button>
          <Typography variant="caption" display="block" mt={1}>
            {currentCount} of {actualTotal}
          </Typography>
        </ColumnFooter>
      )}

      {/* Modal for sub-status selection */}
      <Dialog open={statusModalOpen} onClose={() => setStatusModalOpen(false)}>
        <DialogTitle>Select Status</DialogTitle>
        <DialogContent>
          <Box sx={{ minWidth: 300 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select value={selectedStatus} onChange={handleStatusChange} label="Status">
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
          <Button onClick={() => setStatusModalOpen(false)}>Cancel</Button>
          <Button onClick={confirmStatusChange} disabled={!selectedStatus} variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </ColumnContainer>
  );
};

export default DroppableColumn;
