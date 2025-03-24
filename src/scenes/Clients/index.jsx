import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as XLSX from 'xlsx';
import DeleteModal from '../../components/DeleteModal';
import { constructWsUrl } from 'src/utils/apiUtils';
import { constructUrl } from 'src/utils/apiUtils';
import { useAuth } from '../../services/UserContext';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { VALID_STATUSES } from './statusConstants';

// MUI Imports
import {
    Box,
    Button,
    Container,
    TextField,
    MenuItem,
    Typography,
    Paper,
    Stack,
    IconButton,
    Select,
    FormControl,
    InputLabel,
    Grid,
    Snackbar,
    Alert,
    CircularProgress,
    Checkbox,
    FormControlLabel,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    LinearProgress
} from '@mui/material';

import {
    Download as DownloadIcon,
    Edit as EditIcon,
    Save as SaveIcon,
    Search as SearchIcon,
    Delete as DeleteIcon,
    ViewColumn as ViewColumnIcon
} from '@mui/icons-material';

// Field definitions
const fields = [
    { fieldName: 'id', displayName: 'ID', required: true },
    { fieldName: 'client_name', displayName: 'Name', required: true },
    { fieldName: 'date', displayName: 'Date', required: true },
    { fieldName: 'week', displayName: 'Week' },
    { fieldName: 'month', displayName: 'Month' },
    { fieldName: 'company', displayName: 'Company' },
    { fieldName: 'title', displayName: 'Title' },
    { fieldName: 'industry', displayName: 'Industry' },
    { fieldName: 'source', displayName: 'Source' },
    { fieldName: 'mobile_phone_number', displayName: 'Mobile Phone' },
    { fieldName: 'office_phone_number', displayName: 'Office Phone' },
    { fieldName: 'email_address', displayName: 'Email' },
    { fieldName: 'street_address', displayName: 'Address' },
    { fieldName: 'city_county', displayName: 'City' },
    { fieldName: 'state', displayName: 'State' },
    { fieldName: 'zip', displayName: 'Zip' },
    { fieldName: 'facebook', displayName: 'Facebook' },
    { fieldName: 'linkedin', displayName: 'LinkedIn' },
    { fieldName: 'instagram', displayName: 'Instagram' },
    { fieldName: 'tiktok', displayName: 'TikTok' },
    { fieldName: 'status', displayName: 'Status', required: true },
    { fieldName: 'notes', displayName: 'Notes' },
    { fieldName: 'growth_backer', displayName: 'Growth Backer' },
    { fieldName: 'franchise', displayName: 'Franchise' },
    { fieldName: 'contact_history', displayName: 'Contact History' }
];

const tableStyles = {
    header: {
        padding: '16px',
        backgroundColor: '#1a237e',
        color: 'white',
        position: 'sticky',
        top: 0,
        zIndex: 1,
        textAlign: 'left',
        borderBottom: '2px solid #0d47a1',
        fontWeight: 'bold',
        fontSize: '14px'
    },
    cell: {
        padding: '12px 16px',
        borderBottom: '1px solid #e0e0e0',
        borderRight: '1px solid #e0e0e0',
        fontSize: '14px',
        color: '#333'
    }
};

const Clients = () => {
    // State management
    const [editableClients, setEditableClients] = useState([]);
    const [originalClients, setOriginalClients] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('info');
    const [searchId, setSearchId] = useState('');
    const [searchName, setSearchName] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [clientToDelete, setClientToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [week, setWeek] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [growthbacker, setGrowthbacker] = useState('');
    const [franchise, setFranchise] = useState('');
    const [source, setSource] = useState('');
    const [status, setStatus] = useState('');
    const [industry, setIndustry] = useState('');
    const wsRef = useRef(null);
    const { user } = useAuth();
    const [isWsOpen, setIsWsOpen] = useState(false);
    const [connectionError, setConnectionError] = useState(null);
    const [isConnecting, setIsConnecting] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    const [isColumnManagerOpen, setIsColumnManagerOpen] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState(() => {
        return fields
            .filter(field => field.required || ['company', 'email_address'].includes(field.fieldName))
            .map(field => field.fieldName);
    });

    // Progress tracking for downloads
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadTotal, setDownloadTotal] = useState(0);
    const [downloadProcessed, setDownloadProcessed] = useState(0);

    // Options for dropdowns
    const weeksOptions = Array.from({ length: 53 }, (_, i) => `Week ${(i + 1).toString().padStart(2, '0')}`);
    const monthsOptions = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentYear = new Date().getFullYear();
    const yearsOptions = Array.from({ length: (currentYear - 2020 + 1) }, (_, i) => (2020 + i).toString());

    // WebSocket connection setup using constructWsUrl
    const connectWebSocket = useCallback(() => {
        const wsUrl = constructWsUrl(`/ws/all-clients?authorization=Kolton%20Jones`);
        console.log('Attempting to connect to WebSocket:', wsUrl);
        
        const options = {
            WebSocket: WebSocket,
            connectionTimeout: 10000,
            maxRetries: 5,
            maxRetryInterval: 30000,
            reconnectionDelayGrowFactor: 1.3,
            minReconnectionDelay: 1000,
            maxReconnectionDelay: 30000,
            headers: {
                Authorization: 'Kolton Jones',
            },
        };
        
        wsRef.current = new ReconnectingWebSocket(wsUrl, [], options);

        wsRef.current.onopen = () => {
            console.log('WebSocket connected successfully');
            setIsWsOpen(true);
            setConnectionError(null);
            setIsConnecting(false);
            setTimeout(() => {
                fetchClients();
            }, 500);
        };

        wsRef.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('Received message:', data);
                
                switch(data.type) {
                    case 'clients':
                        setEditableClients(data.clients);
                        setOriginalClients(data.clients);
                        setTotal(data.total);
                        setTotalPages(Math.ceil(data.total / itemsPerPage));
                        setIsLoading(false);
                        break;
                        
                    case 'updateConfirmation':
                        setMessage('Changes saved successfully');
                        setMessageType('success');
                        fetchClients();
                        break;
                        
                    case 'deleteConfirmation':
                        setMessage('Client deleted successfully');
                        setMessageType('success');
                        fetchClients();
                        break;
                    
                    case 'processingStart':
                        setIsDownloading(true);
                        setDownloadProgress(0);
                        setDownloadTotal(0);
                        setDownloadProcessed(0);
                        setMessage(data.message);
                        setMessageType('info');
                        break;
                        
                    case 'processingProgress':
                        setDownloadProgress(data.progress || 0);
                        setDownloadTotal(data.total || 0);
                        setDownloadProcessed(data.processed || 0);
                        if (data.progress < 10 && data.processed > 1000) {
                            setMessage(`Processing large dataset (${data.processed}/${data.total} records). This may take several minutes...`);
                        } else {
                            setMessage(`Generating Excel file: ${data.progress}% complete (${data.processed}/${data.total} records)`);
                        }
                        setMessageType('info');
                        break;
                        
                        case 'downloadReady': {
                            console.log('Download ready:', data);
                            // Use constructUrl to build the full download URL, including the /api prefix
                            const fullUrl = constructUrl(data.downloadUrl);
                            console.log('Using full download URL:', fullUrl);
                        
                            fetch(fullUrl, { credentials: 'include' })
                              .then(response => {
                                  if (!response.ok) {
                                      throw new Error('File is not available on site');
                                  }
                                  return response.blob();
                              })
                              .then(blob => {
                                  const url = window.URL.createObjectURL(blob);
                                  const anchor = document.createElement('a');
                                  anchor.href = url;
                                  anchor.download = data.filename;
                                  document.body.appendChild(anchor);
                                  anchor.click();
                                  document.body.removeChild(anchor);
                                  window.URL.revokeObjectURL(url);
                                  setIsLoading(false);
                                  setIsDownloading(false);
                                  setDownloadProgress(100);
                                  setMessage(`Download complete: ${data.recordCount} records saved to ${data.filename}`);
                                  setMessageType('success');
                              })
                              .catch(error => {
                                  console.error('Download error:', error);
                                  setMessage(`Error downloading file: ${error.message}. Try again or contact support.`);
                                  setMessageType('error');
                                  setIsLoading(false);
                                  setIsDownloading(false);
                              });
                            break;
                        }
                        
                    case 'error':
                        setMessage(data.message);
                        setMessageType('error');
                        console.error('Error from server:', data.message);
                        setIsLoading(false);
                        setIsDownloading(false);
                        break;
                        
                    case 'pong':
                        break;
                        
                    default:
                        console.log('Unhandled message type:', data.type);
                        setIsLoading(false);
                }
            } catch (error) {
                console.error('Error processing WebSocket message:', error);
                setIsLoading(false);
                setIsDownloading(false);
            }
        };

        wsRef.current.onclose = (event) => {
            console.log('WebSocket disconnected', event);
            setIsWsOpen(false);
            setIsConnecting(true);
        };

        wsRef.current.onerror = (error) => {
            console.error('WebSocket error:', error);
            setConnectionError('Connection error. Attempting to reconnect...');
            setIsConnecting(true);
        };
    }, [itemsPerPage]);

    useEffect(() => {
        connectWebSocket();
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [connectWebSocket]);

    useEffect(() => {
        const pingInterval = setInterval(() => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({ type: 'ping' }));
            }
        }, 30000);
        return () => clearInterval(pingInterval);
    }, []);

    const sendMessage = useCallback((type, data = {}) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            const message = JSON.stringify({ type, ...data });
            console.log('Sending message:', message);
            wsRef.current.send(message);
        } else {
            console.error('WebSocket is not connected');
            setMessage('Connection lost. Please wait or refresh the page.');
            setMessageType('error');
        }
    }, []);

    const fetchClients = useCallback(() => {
        console.log('Fetching clients...');
        setIsLoading(true);
        sendMessage('fetchClients', {
            page: currentPage,
            itemsPerPage,
            searchId,
            searchName,
            week,
            month,
            year,
            growthbacker,
            franchise,
            source,
            status,
            industry
        });
    }, [currentPage, itemsPerPage, searchId, searchName, week, month, year, growthbacker, franchise, source, status, industry, sendMessage]);
        
    useEffect(() => {
        if (isWsOpen) {
            fetchClients();
        }
    }, [fetchClients, isWsOpen]);
    
    const handleEdit = () => {
        setIsEditing(!isEditing);
        if (!isEditing) {
            setOriginalClients([...editableClients]);
        }
    };

    const handleSave = () => {
        setIsEditing(false);
        setIsLoading(true);
        editableClients.forEach((client, index) => {
            const originalClient = originalClients[index];
            const changes = {};
            let hasChanges = false;
            Object.keys(client).forEach(key => {
                if (client[key] !== originalClient[key]) {
                    changes[key] = client[key];
                    hasChanges = true;
                }
            });
            if (hasChanges) {
                sendMessage('update', {
                    clientId: client.id,
                    ...changes,
                    user: `${user.displayName} - ${user.uid}`
                });
            }
        });
    };

    const handleSearch = () => {
        setCurrentPage(1);
        fetchClients();
    };

    const handleValueChange = (index, fieldName, value) => {
        const updatedClients = [...editableClients];
        updatedClients[index] = { ...updatedClients[index], [fieldName]: value };
        setEditableClients(updatedClients);
    };

    const requestDeleteClient = (clientId, clientName) => {
        setClientToDelete({ clientId, clientName });
        setIsModalOpen(true);
    };

    const handleDeleteClient = async () => {
        if (!clientToDelete) return;
        setIsDeleting(true);
        sendMessage('delete', { clientId: clientToDelete.clientId });
        setIsDeleting(false);
        setIsModalOpen(false);
        setClientToDelete(null);
    };

    const downloadAllClientsAsExcel = () => {
        setIsLoading(true);
        setIsDownloading(true);
        setDownloadProgress(0);
        setMessage('Initiating download of all clients. This may take a few minutes for large datasets...');
        setMessageType('info');
    
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            const downloadMessage = {
                type: 'downloadAll',
                useServerSide: true
            };
            // Log the WebSocket URL and the download message being sent
            console.log('Sending downloadAll request to backend via WebSocket URL:', wsRef.current.url, 'Message:', downloadMessage);
            wsRef.current.send(JSON.stringify(downloadMessage));
        } else {
            setMessage('WebSocket not connected. Please try again.');
            setMessageType('error');
            setIsLoading(false);
            setIsDownloading(false);
        }
        
        const timeoutId = setTimeout(() => {
            if (downloadProgress === 0) {
                setMessage('Download is taking longer than expected. The server is processing your request. You will receive a notification when the file is ready to download.');
                setMessageType('warning');
            }
        }, 30000);
        return () => clearTimeout(timeoutId);
    };

    const downloadVisibleClientsAsExcel = () => {
        const clientsForDownload = editableClients.map(({ client_name_hash, email_address_hash, ...client }) => client);
        const ws = XLSX.utils.json_to_sheet(clientsForDownload);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Visible Clients");
        XLSX.writeFile(wb, "Results.xlsx");
    };

    const handleColumnToggle = (fieldName) => {
        setVisibleColumns(prev => {
            if (prev.includes(fieldName)) {
                const field = fields.find(f => f.fieldName === fieldName);
                if (field?.required) return prev;
                return prev.filter(col => col !== fieldName);
            }
            return [...prev, fieldName];
        });
    };

    const handleItemsPerPageChange = (event) => {
        setItemsPerPage(Number(event.target.value));
        setCurrentPage(1);
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };
    
    return (
        <Container maxWidth="xl">
            <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
                {/* Header Section */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                        <Typography variant="h4" component="h1" gutterBottom>
                            Client Management
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                            Total Clients: {total}
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="contained"
                            startIcon={<ViewColumnIcon />}
                            onClick={() => setIsColumnManagerOpen(true)}
                            sx={{ backgroundColor: '#2196f3', '&:hover': { backgroundColor: '#1976d2' } }}
                        >
                            Manage Columns
                        </Button>
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<DownloadIcon />}
                            onClick={downloadVisibleClientsAsExcel}
                            disabled={isLoading || isDownloading}
                        >
                            Export Visible
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<DownloadIcon />}
                            onClick={downloadAllClientsAsExcel}
                            disabled={isLoading || isDownloading}
                        >
                            Export All
                        </Button>
                    </Stack>
                </Box>

                {/* Status Messages and Progress Bar */}
                {isConnecting && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Connecting to server...
                    </Alert>
                )}
                {message && (
                    <Alert severity={messageType} sx={{ mb: 2 }} onClose={() => !isDownloading && setMessage('')}>
                        {message}
                    </Alert>
                )}
                {isDownloading && (
                    <Box sx={{ width: '100%', mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                Generating Excel file...
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {downloadProcessed} of {downloadTotal} records ({downloadProgress}%)
                            </Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={downloadProgress} sx={{ height: 8, borderRadius: 4 }} />
                    </Box>
                )}
                {connectionError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {connectionError}
                    </Alert>
                )}

                {/* Search Filters */}
                <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={12} md={2}>
                            <TextField fullWidth label="Search by ID" value={searchId} onChange={(e) => setSearchId(e.target.value)} size="small" />
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <TextField fullWidth label="Search by Name" value={searchName} onChange={(e) => setSearchName(e.target.value)} size="small" />
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Week</InputLabel>
                                <Select value={week} label="Week" onChange={(e) => setWeek(e.target.value)}>
                                    <MenuItem value="">None</MenuItem>
                                    {weeksOptions.map((wk) => (
                                        <MenuItem key={wk} value={wk}>{wk}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Month</InputLabel>
                                <Select value={month} label="Month" onChange={(e) => setMonth(e.target.value)}>
                                    <MenuItem value="">None</MenuItem>
                                    {monthsOptions.map((mn) => (
                                        <MenuItem key={mn} value={mn}>{mn}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Year</InputLabel>
                                <Select value={year} label="Year" onChange={(e) => setYear(e.target.value)}>
                                    <MenuItem value="">None</MenuItem>
                                    {yearsOptions.map((yr) => (
                                        <MenuItem key={yr} value={yr}>{yr}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Growthbacker</InputLabel>
                                <Select value={growthbacker} label="Growthbacker" onChange={(e) => setGrowthbacker(e.target.value)}>
                                    <MenuItem value="">All</MenuItem>
                                    {editableClients?.map(client => client.growth_backer)
                                        ?.filter((value, index, self) => value && self.indexOf(value) === index)
                                        ?.sort()
                                        ?.map((gb) => (
                                            <MenuItem key={gb} value={gb}>{gb}</MenuItem>
                                        )) || []
                                    }
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Franchise</InputLabel>
                                <Select value={franchise} label="Franchise" onChange={(e) => setFranchise(e.target.value)}>
                                    <MenuItem value="">All</MenuItem>
                                    <MenuItem value="Yes">Yes</MenuItem>
                                    <MenuItem value="No">No</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Source</InputLabel>
                                <Select value={source} label="Source" onChange={(e) => setSource(e.target.value)}>
                                    <MenuItem value="">All</MenuItem>
                                    {editableClients?.map(client => client.source)
                                        ?.filter((value, index, self) => value && self.indexOf(value) === index)
                                        ?.sort()
                                        ?.map((src) => (
                                            <MenuItem key={src} value={src}>{src}</MenuItem>
                                        )) || []
                                    }
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Status</InputLabel>
                                <Select value={status} label="Status" onChange={(e) => setStatus(e.target.value)}>
                                    <MenuItem value="">All</MenuItem>
                                    {VALID_STATUSES.map((stat) => (
                                        <MenuItem key={stat} value={stat}>{stat}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Industry</InputLabel>
                                <Select value={industry} label="Industry" onChange={(e) => setIndustry(e.target.value)}>
                                    <MenuItem value="">All</MenuItem>
                                    {editableClients?.map(client => client.industry)
                                        ?.filter((value, index, self) => value && self.indexOf(value) === index)
                                        ?.sort()
                                        ?.map((ind) => (
                                            <MenuItem key={ind} value={ind}>{ind}</MenuItem>
                                        )) || []
                                    }
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Button variant="contained" startIcon={<SearchIcon />} onClick={handleSearch} disabled={isLoading || isDownloading}>
                            Search
                        </Button>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel>Items per page</InputLabel>
                                <Select value={itemsPerPage} label="Items per page" onChange={handleItemsPerPageChange}>
                                    <MenuItem value={10}>10 per page</MenuItem>
                                    <MenuItem value={20}>20 per page</MenuItem>
                                    <MenuItem value={50}>50 per page</MenuItem>
                                    <MenuItem value={100}>100 per page</MenuItem>
                                </Select>
                            </FormControl>
                            <Button
                                variant="contained"
                                color={isEditing ? "success" : "primary"}
                                startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
                                onClick={isEditing ? handleSave : handleEdit}
                                disabled={isLoading || isDownloading}
                            >
                                {isEditing ? 'Save Changes' : 'Edit Clients'}
                            </Button>
                        </Box>
                    </Box>
                </Paper>

                {/* Table Section */}
                {isLoading && !isDownloading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Paper sx={{ width: '100%', overflow: 'auto', maxHeight: 'calc(100vh - 400px)' }}>
                        <Box sx={{ minWidth: 800 }}>
                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                                <thead>
                                    <tr>
                                        <th style={tableStyles.header}>Actions</th>
                                        {fields.filter(field => visibleColumns.includes(field.fieldName))
                                            .map(field => (
                                                <th key={field.fieldName} style={tableStyles.header}>
                                                    {field.displayName}
                                                </th>
                                            ))
                                        }
                                    </tr>
                                </thead>
                                <tbody>
                                    {editableClients.map((client, index) => (
                                        <tr key={client.id} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f5f5f5' }}>
                                            <td style={tableStyles.cell}>
                                                <IconButton
                                                    color="error"
                                                    onClick={() => requestDeleteClient(client.id, client.client_name)}
                                                    size="small"
                                                    disabled={isDownloading}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </td>
                                            {fields.filter(field => visibleColumns.includes(field.fieldName))
                                                .map(({ fieldName }) => (
                                                    <td key={fieldName} style={tableStyles.cell}>
                                                        {isEditing && fieldName !== 'id' ? (
                                                            <TextField
                                                                size="small"
                                                                defaultValue={client[fieldName] || ''}
                                                                onChange={(e) => handleValueChange(index, fieldName, e.target.value)}
                                                                fullWidth
                                                                variant="outlined"
                                                                disabled={isDownloading}
                                                            />
                                                        ) : (
                                                            client[fieldName] || 'N/A'
                                                        )}
                                                    </td>
                                                ))
                                            }
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Box>
                    </Paper>
                )}

                {/* Pagination */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3, mb: 2 }}>
                    <Button
                        variant="contained"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || isLoading || isDownloading}
                        sx={{
                            backgroundColor: '#2196f3',
                            '&:hover': { backgroundColor: '#1976d2' },
                            '&.Mui-disabled': { backgroundColor: '#bdbdbd' }
                        }}
                    >
                        Previous
                    </Button>
                    <Typography variant="body1" sx={{ alignSelf: 'center' }}>
                        Page {currentPage} of {totalPages}
                    </Typography>
                    <Button
                        variant="outlined"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || isLoading || isDownloading}
                    >
                        Next
                    </Button>
                </Box>

                {/* Column Manager Dialog */}
                <Dialog open={isColumnManagerOpen} onClose={() => setIsColumnManagerOpen(false)} maxWidth="md" fullWidth>
                    <DialogTitle>Manage Visible Columns</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            {fields.map(field => (
                                <Grid item xs={12} sm={6} md={4} key={field.fieldName}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={visibleColumns.includes(field.fieldName)}
                                                onChange={() => handleColumnToggle(field.fieldName)}
                                                disabled={field.required}
                                            />
                                        }
                                        label={field.displayName}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setIsColumnManagerOpen(false)}>Close</Button>
                    </DialogActions>
                </Dialog>

                {/* Delete Confirmation Modal */}
                <DeleteModal
                    isOpen={isModalOpen}
                    title="Confirm Deletion"
                    message={`Are you sure you want to delete ${clientToDelete?.clientName} from the database?`}
                    onConfirm={handleDeleteClient}
                    onCancel={() => setIsModalOpen(false)}
                />

                {/* Loading Overlay */}
                {isDeleting && (
                    <Box
                        sx={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 9999,
                        }}
                    >
                        <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <CircularProgress size={24} />
                            <Typography>Deleting {clientToDelete?.clientName}...</Typography>
                        </Paper>
                    </Box>
                )}

                {/* Error Snackbar */}
                <Snackbar open={!!connectionError} autoHideDuration={6000} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                    <Alert severity="error" sx={{ width: '100%' }}>
                        {connectionError}
                    </Alert>
                </Snackbar>
            </Paper>
        </Container>
    );
};

export default Clients;
