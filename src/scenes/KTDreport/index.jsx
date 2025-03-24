import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  Tabs, 
  Tab,
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  Area,
  AreaChart
} from 'recharts';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TimelineIcon from '@mui/icons-material/Timeline';
import BarChartIcon from '@mui/icons-material/BarChart';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

const API_URL = 'http://127.0.0.1:8000/api/analytics/status-history';
const HARDCODED_USER = 'Kolton Jones';

const StatusHistoryDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(API_URL, {
        headers: {
          'Authorization': HARDCODED_USER,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleRefresh = () => {
    fetchData();
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const StatCard = ({ title, value, icon, description }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="start">
          <Box>
            <Typography color="textSecondary" variant="subtitle2" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {description}
            </Typography>
          </Box>
          {icon}
        </Box>
      </CardContent>
    </Card>
  );

  const renderStatistics = () => {
    if (!data?.flow?.length) return null;

    const totalChanges = data.flow.reduce((acc, curr) => acc + curr.count, 0);
    const recentWeeklyChanges = data.weekly[data.weekly.length - 1]?.count || 0;
    const mostCommonTransition = data.flow[0];
    
    return (
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Status Changes"
            value={totalChanges.toLocaleString()}
            icon={<TrendingUpIcon color="primary" />}
            description="All time status transitions"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Recent Weekly Changes"
            value={recentWeeklyChanges.toLocaleString()}
            icon={<TimelineIcon color="secondary" />}
            description="Changes in the last week"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Most Common Transition"
            value={mostCommonTransition?.count.toLocaleString() || '0'}
            icon={<CompareArrowsIcon color="success" />}
            description={`${mostCommonTransition?.old_status || 'None'} → ${mostCommonTransition?.new_status || 'None'}`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Periods"
            value={`${data.weekly.length} Weeks`}
            icon={<BarChartIcon color="info" />}
            description={`${formatDate(data.weekly[0]?.week)} - ${formatDate(data.weekly[data.weekly.length - 1]?.week)}`}
          />
        </Grid>
      </Grid>
    );
  };

  const renderWeeklyChart = () => (
    <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Weekly Status Changes</Typography>
        <Tooltip title="Refresh data">
          <IconButton onClick={handleRefresh} size="small">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Box height={400}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data?.weekly || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="week" 
              tickFormatter={formatDate}
              angle={-45}
              textAnchor="end"
              height={70}
            />
            <YAxis />
            <RechartsTooltip
              labelFormatter={formatDate}
              formatter={(value) => [`${value} changes`, 'Count']}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="count"
              name="Status Changes"
              stroke="#1976d2"
              fill="#1976d2"
              fillOpacity={0.1}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );

  const renderMonthlyChart = () => (
    <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Monthly Status Changes</Typography>
        <Tooltip title="Refresh data">
          <IconButton onClick={handleRefresh} size="small">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Box height={400}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data?.monthly || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month"
              angle={-45}
              textAnchor="end"
              height={70}
            />
            <YAxis />
            <RechartsTooltip
              formatter={(value) => [`${value} changes`, 'Count']}
            />
            <Legend />
            <Bar 
              dataKey="count" 
              name="Status Changes"
              fill="#1976d2"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );

  const renderFlowTable = () => (
    <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Status Transition Flows</Typography>
        <Tooltip title="Refresh data">
          <IconButton onClick={handleRefresh} size="small">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Previous Status</TableCell>
              <TableCell>New Status</TableCell>
              <TableCell align="right">Count</TableCell>
              <TableCell align="right">Percentage</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(data?.flow || []).map((flow, index) => {
              const totalTransitions = data.flow.reduce((acc, curr) => acc + curr.count, 0);
              const percentage = ((flow.count / totalTransitions) * 100).toFixed(1);
              
              return (
                <TableRow 
                  key={index}
                  sx={{
                    backgroundColor: index === 0 ? 'rgba(25, 118, 210, 0.08)' : 'inherit'
                  }}
                >
                  <TableCell>{flow.old_status || 'Initial Status'}</TableCell>
                  <TableCell>{flow.new_status}</TableCell>
                  <TableCell align="right">{flow.count.toLocaleString()}</TableCell>
                  <TableCell align="right">{percentage}%</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );

  if (loading && !lastUpdated) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Status History Analytics
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          {lastUpdated && (
            <Typography variant="body2" color="text.secondary">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Typography>
          )}
          <IconButton 
            onClick={handleRefresh} 
            size="small" 
            color="primary"
            disabled={loading}
          >
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <IconButton
              color="inherit"
              size="small"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshIcon />
            </IconButton>
          }
        >
          {error}
        </Alert>
      )}

      {renderStatistics()}

      <Paper sx={{ width: '100%', bgcolor: 'background.paper', mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab 
            label="Weekly" 
            icon={<TimelineIcon />} 
            iconPosition="start"
            disabled={loading}
          />
          <Tab 
            label="Monthly" 
            icon={<BarChartIcon />} 
            iconPosition="start"
            disabled={loading}
          />
          <Tab 
            label="Flow" 
            icon={<CompareArrowsIcon />} 
            iconPosition="start"
            disabled={loading}
          />
        </Tabs>
      </Paper>

      {loading && lastUpdated && (
        <Box display="flex" justifyContent="center" my={2}>
          <CircularProgress size={24} />
        </Box>
      )}

      {activeTab === 0 && renderWeeklyChart()}
      {activeTab === 1 && renderMonthlyChart()}
      {activeTab === 2 && renderFlowTable()}
    </Container>
  );
};

export default StatusHistoryDashboard;