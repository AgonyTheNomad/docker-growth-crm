import React, { useState, useEffect, useRef } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TextField, Checkbox, FormControlLabel, Box, Typography, CircularProgress,
  ThemeProvider, createTheme, Toolbar, IconButton, Tooltip, Card, CardContent,
  TablePagination, TableSortLabel, Button
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import { constructUrl } from 'src/utils/apiUtils'; // Adjust the path as necessary

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderRight: '1px solid rgba(224, 224, 224, 1)',
          '&:last-child': {
            borderRight: 'none',
          },
        },
        head: {
          backgroundColor: '#1976d2',
          color: '#ffffff',
          fontWeight: 'bold',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:last-child td': {
            borderBottom: 'none',
          },
        },
      },
    },
  },
});

const Referrer = () => {
  const [fetchedData, setFetchedData] = useState([]);
  const checkNumbersRef = useRef({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('referrer_full_name');
  const [order, setOrder] = useState('asc');
  const [visibleColumns, setVisibleColumns] = useState({
    referrer_full_name: true,
    phone_number: true,
    email_address: true,
    contract_sent_date: true,
    contract_signed_date: true,
    mailing_address: true,
    date_added: true,
    w9_form: true,
    check_number: true,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const url = constructUrl('/non-cb-referrers');
      console.log('Fetching data from:', url);
      const response = await fetch(url);

      if (response.ok) {
        let data = await response.json();
        console.log('Fetched data:', data);
        data = data.filter(row => 
          row.referrer_full_name !== "string" && row.referrer_full_name !== "Full Name"
        );
        console.log('Filtered data:', data);
        setFetchedData(data);
        // Initialize check numbers
        data.forEach(row => {
          if (row.id !== undefined) {
            checkNumbersRef.current[row.id] = row.check_number || '';
          } else {
            console.error('Row is missing id:', row);
          }
        });
        console.log('Initialized check numbers:', checkNumbersRef.current);
      } else {
        const errorMessage = await response.text();
        console.error('Failed to fetch data:', errorMessage);
        setError(`Failed to fetch data: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(`Error fetching data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilterChange = (event) => {
    const newFilter = event.target.value.toLowerCase();
    console.log('Filter changed:', newFilter);
    setFilter(newFilter);
    setPage(0);
  };

  const handleCheckNumberChange = (id, value) => {
    console.log('Check number changed for id:', id, 'New value:', value);
    checkNumbersRef.current[id] = value;
  };

  const submitCheckNumber = async (referrerId) => {
    console.log('submitCheckNumber called with referrerId:', referrerId);
    try {
      const checkNumber = checkNumbersRef.current[referrerId] || '';
      const url = constructUrl('/save-check-number');
      const requestBody = { 
        referrer_id: referrerId,
        check_number: checkNumber 
      };
      
      console.log('Sending to backend:', requestBody);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
  
      if (response.ok) {
        console.log('Check number saved successfully');
        fetchData(); // Refresh data after saving
      } else {
        const errorMessage = await response.text();
        console.error('Failed to save check number:', errorMessage);
        setError(`Failed to save check number: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error saving check number:', error);
      setError(`Error saving check number: ${error.message}`);
    }
  };

  const toggleColumn = (columnName) => {
    console.log('Toggling column:', columnName);
    setVisibleColumns(prev => ({
      ...prev,
      [columnName]: !prev[columnName],
    }));
  };

  const handleChangePage = (event, newPage) => {
    console.log('Page changed to:', newPage);
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    console.log('Rows per page changed to:', newRowsPerPage);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleSort = (property) => () => {
    const isAsc = orderBy === property && order === 'asc';
    const newOrder = isAsc ? 'desc' : 'asc';
    console.log('Sorting by:', property, 'Order:', newOrder);
    setOrder(newOrder);
    setOrderBy(property);
  };

  const filteredData = fetchedData.filter((row) =>
    Object.entries(row).some(([key, value]) =>
      visibleColumns[key] && value && value.toString().toLowerCase().includes(filter)
    )
  );
  console.log('Filtered data:', filteredData);

  const sortedData = filteredData.sort((a, b) => {
    if (a[orderBy] < b[orderBy]) return order === 'asc' ? -1 : 1;
    if (a[orderBy] > b[orderBy]) return order === 'asc' ? 1 : -1;
    return 0;
  });
  console.log('Sorted data:', sortedData);

  const paginatedData = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  console.log('Paginated data:', paginatedData);

  const columnOrder = [
    'referrer_full_name',
    'phone_number',
    'email_address',
    'contract_sent_date',
    'contract_signed_date',
    'mailing_address',
    'date_added',
    'w9_form',
    'check_number'
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Card sx={{ maxWidth: 600, margin: 'auto', mt: 4 }}>
        <CardContent>
          <Typography color="error" variant="h6">{error}</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: '100%', padding: 3, backgroundColor: 'background.default' }}>
        <Card elevation={3}>
          <CardContent>
            <Toolbar>
              <Typography variant="h4" component="div" sx={{ flexGrow: 1, color: 'primary.main' }}>
                Referrers Data
              </Typography>
              <Tooltip title="Toggle Filters">
                <IconButton onClick={() => setShowFilters(!showFilters)}>
                  <FilterListIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Refresh Data">
                <IconButton onClick={fetchData}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Toolbar>
            {showFilters && (
              <Box sx={{ mt: 2 }}>
                <TextField
                  label="Filter"
                  variant="outlined"
                  size="small"
                  onChange={handleFilterChange}
                  fullWidth
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {columnOrder.map((columnName) => (
                    <FormControlLabel
                      key={columnName}
                      control={
                        <Checkbox
                          checked={visibleColumns[columnName]}
                          onChange={() => toggleColumn(columnName)}
                        />
                      }
                      label={columnName.split('_').join(' ').toUpperCase()}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
        
        {paginatedData.length > 0 ? (
          <TableContainer component={Paper} elevation={3} sx={{ mt: 3 }}>
            <Table sx={{ minWidth: 650 }} aria-label="referrers table">
              <TableHead>
                <TableRow>
                  {columnOrder.map((columnName) =>
                    visibleColumns[columnName] && (
                      <TableCell key={columnName}>
                        <TableSortLabel
                          active={orderBy === columnName}
                          direction={orderBy === columnName ? order : 'asc'}
                          onClick={handleSort(columnName)}
                        >
                          {columnName.split('_').join(' ').toUpperCase()}
                        </TableSortLabel>
                      </TableCell>
                    )
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map((row) => (
                  <TableRow key={row.id} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}>
                    {columnOrder.map((columnName) =>
                      visibleColumns[columnName] && (
                        <TableCell key={columnName}>
                          {columnName === 'check_number' ? (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <TextField
                                defaultValue={checkNumbersRef.current[row.id] || ''}
                                onChange={(e) => handleCheckNumberChange(row.id, e.target.value)}
                                placeholder="Enter check number"
                                size="small"
                                sx={{ mr: 1 }}
                              />
                              <Button
                                onClick={() => submitCheckNumber(row.id)}
                                variant="contained"
                                color="primary"
                                size="small"
                              >
                                Save
                              </Button>
                            </Box>
                          ) : (
                            row[columnName] || ''
                          )}
                        </TableCell>
                      )
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        ) : (
          <Typography sx={{ mt: 3 }}>No data available</Typography>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default Referrer;