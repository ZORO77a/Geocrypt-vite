import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  GridLegacy as Grid,
  Card,
  CardContent,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Search,
  FilterList,
  Refresh,
  Download,
  Visibility,
  Warning,
  LocationOn,
  Wifi,
  Lock,
  LockOpen,
  Clear,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { toast } from 'react-toastify';

const FileAccessLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    action: 'all',
    dateFrom: subDays(new Date(), 7),
    dateTo: new Date(),
  });
  const [stats, setStats] = useState({
    total: 0,
    successful: 0,
    failed: 0,
    suspicious: 0,
  });
  const [openFilter, setOpenFilter] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [openDetails, setOpenDetails] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const fetchLogs = async () => {
    setLoading(true);
    
    // Mock data
    const mockLogs = [
      {
        id: 'log-001',
        userName: 'John Doe',
        userEmail: 'john@company.com',
        action: 'file_access',
        fileName: 'project_document.pdf',
        status: 'success',
        timestamp: new Date('2024-01-15T10:30:00'),
        location: 'Office Building',
        coordinates: { lat: 12.9716, lng: 77.5946 },
        ipAddress: '192.168.1.100',
        userAgent: 'Chrome/120.0.0.0',
        aiRiskScore: 12,
      },
      {
        id: 'log-002',
        userName: 'Jane Smith',
        userEmail: 'jane@company.com',
        action: 'failed_attempt',
        fileName: 'confidential_report.docx',
        status: 'failed',
        timestamp: new Date('2024-01-15T09:15:00'),
        location: 'Unknown',
        ipAddress: '10.0.0.15',
        userAgent: 'Firefox/121.0.0',
        aiRiskScore: 85,
        details: 'Failed to decrypt file - incorrect permissions',
      },
      {
        id: 'log-003',
        userName: 'Bob Johnson',
        userEmail: 'bob@company.com',
        action: 'login',
        status: 'success',
        timestamp: new Date('2024-01-14T14:20:00'),
        location: 'Remote',
        ipAddress: '203.0.113.25',
        userAgent: 'Safari/17.2.1',
        aiRiskScore: 25,
      },
      {
        id: 'log-004',
        userName: 'Alice Brown',
        userEmail: 'alice@company.com',
        action: 'file_decrypt',
        fileName: 'financial_report.xlsx',
        status: 'success',
        timestamp: new Date('2024-01-14T11:45:00'),
        location: 'Office Building',
        coordinates: { lat: 12.9716, lng: 77.5946 },
        ipAddress: '192.168.1.150',
        userAgent: 'Chrome/120.0.0.0',
        aiRiskScore: 18,
      },
      {
        id: 'log-005',
        userName: 'Mike Wilson',
        userEmail: 'mike@company.com',
        action: 'suspicious_activity',
        fileName: 'client_data.csv',
        status: 'blocked',
        timestamp: new Date('2024-01-13T22:15:00'),
        location: 'Unknown',
        ipAddress: '45.67.89.123',
        userAgent: 'Chrome/119.0.0.0',
        aiRiskScore: 92,
        details: 'Access attempt from unusual location during off-hours',
      },
    ];

    // Apply filters
    let filtered = mockLogs;
    
    if (filters.status !== 'all') {
      filtered = filtered.filter(log => log.status === filters.status);
    }
    
    if (filters.action !== 'all') {
      filtered = filtered.filter(log => log.action === filters.action);
    }
    
    if (filters.dateFrom && filters.dateTo) {
      filtered = filtered.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= startOfDay(filters.dateFrom) && logDate <= endOfDay(filters.dateTo);
      });
    }
    
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ipAddress?.includes(searchTerm) ||
        log.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Calculate stats
    const statsData = {
      total: filtered.length,
      successful: filtered.filter(log => log.status === 'success').length,
      failed: filtered.filter(log => log.status === 'failed').length,
      suspicious: filtered.filter(log => log.aiRiskScore > 70).length,
    };

    setLogs(filtered);
    setStats(statsData);
    setLoading(false);
  };

  const handleExport = async () => {
    toast.info('Exporting logs... (demo mode)');
    // Implement CSV/Excel export
  };

  const handleViewDetails = (log: any) => {
    setSelectedLog(log);
    setOpenDetails(true);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'file_access': return 'primary';
      case 'file_decrypt': return 'success';
      case 'login': return 'info';
      case 'logout': return 'default';
      case 'failed_attempt': return 'error';
      case 'suspicious_activity': return 'warning';
      default: return 'default';
    }
  };

  const getActionLabel = (action: string) => {
    const labels: any = {
      'file_access': 'File Access',
      'file_decrypt': 'File Decrypt',
      'login': 'Login',
      'logout': 'Logout',
      'failed_attempt': 'Failed Attempt',
      'suspicious_activity': 'Suspicious Activity',
    };
    return labels[action] || action;
  };

  const getStatusIcon = (status: string) => {
    return status === 'success' ? <LockOpen fontSize="small" /> : <Lock fontSize="small" />;
  };

  const handleClearFilters = () => {
    setFilters({
      status: 'all',
      action: 'all',
      dateFrom: subDays(new Date(), 7),
      dateTo: new Date(),
    });
    setSearchTerm('');
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="xl" className="py-6">
        {/* Header */}
        <Paper className="p-6 mb-6 shadow-md">
          <Box className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <Box>
              <Typography variant="h5" className="font-bold text-gray-900">
                File Access Logs
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Monitor and analyze all file access activities with AI-powered security
              </Typography>
            </Box>
            <Box className="flex gap-2">
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => setOpenFilter(true)}
              >
                Filters
              </Button>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={handleExport}
              >
                Export
              </Button>
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={fetchLogs}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Refresh
              </Button>
            </Box>
          </Box>

          {/* Stats */}
          <Grid container spacing={3} className="mb-6">
            <Grid item xs={6} md={3}>
              <Card className="border border-gray-200">
                <CardContent className="text-center">
                  <Typography variant="h4" className="font-bold">
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" className="text-gray-600">
                    Total Logs
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card className="border border-gray-200">
                <CardContent className="text-center">
                  <Typography variant="h4" className="font-bold text-green-600">
                    {stats.successful}
                  </Typography>
                  <Typography variant="body2" className="text-gray-600">
                    Successful
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card className="border border-gray-200">
                <CardContent className="text-center">
                  <Typography variant="h4" className="font-bold text-red-600">
                    {stats.failed}
                  </Typography>
                  <Typography variant="body2" className="text-gray-600">
                    Failed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card className="border border-gray-200">
                <CardContent className="text-center">
                  <Typography variant="h4" className="font-bold text-orange-600">
                    {stats.suspicious}
                  </Typography>
                  <Typography variant="body2" className="text-gray-600">
                    Suspicious
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Search */}
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search logs by user, file, IP, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    <Clear fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Active Filters */}
          {(filters.status !== 'all' || filters.action !== 'all') && (
            <Box className="mt-4 flex items-center gap-2">
              <Typography variant="body2" className="text-gray-600">
                Active filters:
              </Typography>
              {filters.status !== 'all' && (
                <Chip
                  label={`Status: ${filters.status}`}
                  size="small"
                  onDelete={() => setFilters({...filters, status: 'all'})}
                />
              )}
              {filters.action !== 'all' && (
                <Chip
                  label={`Action: ${getActionLabel(filters.action)}`}
                  size="small"
                  onDelete={() => setFilters({...filters, action: 'all'})}
                />
              )}
              <Button
                size="small"
                startIcon={<Clear />}
                onClick={handleClearFilters}
              >
                Clear All
              </Button>
            </Box>
          )}
        </Paper>

        {/* Logs Table */}
        <Paper className="p-4 shadow-md">
          {loading ? (
            <LinearProgress />
          ) : logs.length === 0 ? (
            <Alert severity="info" className="my-4">
              No logs found for the selected filters
            </Alert>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Action</TableCell>
                      <TableCell>File</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>IP Address</TableCell>
                      <TableCell>Risk Score</TableCell>
                      <TableCell>Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {logs
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((log) => (
                        <TableRow key={log.id} hover>
                          <TableCell>
                            <Box>
                              <Typography variant="body2">
                                {format(new Date(log.timestamp), 'MMM dd, yyyy')}
                              </Typography>
                              <Typography variant="caption" className="text-gray-500">
                                {format(new Date(log.timestamp), 'HH:mm:ss')}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" className="font-medium">
                                {log.userName}
                              </Typography>
                              <Typography variant="caption" className="text-gray-500">
                                {log.userEmail}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={getStatusIcon(log.status)}
                              label={getActionLabel(log.action)}
                              color={getActionColor(log.action)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {log.fileName ? (
                              <Typography variant="body2" className="truncate max-w-[200px]">
                                {log.fileName}
                              </Typography>
                            ) : (
                              <Typography variant="body2" className="text-gray-500">
                                N/A
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={log.status}
                              color={log.status === 'success' ? 'success' : 'error'}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Box className="flex items-center">
                              <LocationOn fontSize="small" className="text-gray-400 mr-1" />
                              <Typography variant="body2">
                                {log.location || 'Unknown'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" className="font-mono">
                              {log.ipAddress || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Tooltip title={`AI Risk Score: ${log.aiRiskScore}/100`}>
                              <Box className="w-16">
                                <LinearProgress 
                                  variant="determinate" 
                                  value={log.aiRiskScore} 
                                  color={log.aiRiskScore > 70 ? 'error' : log.aiRiskScore > 40 ? 'warning' : 'success'}
                                />
                                <Typography variant="caption" className="text-gray-600">
                                  {log.aiRiskScore}
                                </Typography>
                              </Box>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => handleViewDetails(log)}
                            >
                              <Visibility />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[10, 20, 50, 100]}
                component="div"
                count={logs.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(_event, newPage) => setPage(newPage)}
                onRowsPerPageChange={(event) => {
                  setRowsPerPage(parseInt(event.target.value, 10));
                  setPage(0);
                }}
              />
            </>
          )}
        </Paper>

        {/* Filter Dialog */}
        <Dialog open={openFilter} onClose={() => setOpenFilter(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Filter Logs</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} className="mt-1">
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    label="Status"
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="success">Success</MenuItem>
                    <MenuItem value="failed">Failed</MenuItem>
                    <MenuItem value="blocked">Blocked</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Action Type</InputLabel>
                  <Select
                    value={filters.action}
                    label="Action Type"
                    onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                  >
                    <MenuItem value="all">All Actions</MenuItem>
                    <MenuItem value="file_access">File Access</MenuItem>
                    <MenuItem value="file_decrypt">File Decrypt</MenuItem>
                    <MenuItem value="login">Login</MenuItem>
                    <MenuItem value="failed_attempt">Failed Attempt</MenuItem>
                    <MenuItem value="suspicious_activity">Suspicious Activity</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="From Date"
                  value={filters.dateFrom}
                  onChange={(date) => setFilters({ ...filters, dateFrom: date || subDays(new Date(), 7) })}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="To Date"
                  value={filters.dateTo}
                  onChange={(date) => setFilters({ ...filters, dateTo: date || new Date() })}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    },
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClearFilters}>Reset</Button>
            <Button onClick={() => setOpenFilter(false)}>Close</Button>
            <Button
              variant="contained"
              onClick={() => {
                fetchLogs();
                setOpenFilter(false);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Apply Filters
            </Button>
          </DialogActions>
        </Dialog>

        {/* Log Details Dialog */}
        <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="md" fullWidth>
          {selectedLog && (
            <>
              <DialogTitle>
                Log Details
                <Chip
                  label={selectedLog.status}
                  color={selectedLog.status === 'success' ? 'success' : 'error'}
                  className="ml-2"
                  size="small"
                />
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={3} className="py-4">
                  {/* Basic Info */}
                  <Grid item xs={12}>
                    <Paper className="p-4 border border-gray-200">
                      <Typography variant="h6" className="font-semibold mb-3">
                        Basic Information
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" className="text-gray-600">
                            User Name
                          </Typography>
                          <Typography variant="body1" className="font-medium">
                            {selectedLog.userName}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" className="text-gray-600">
                            User Email
                          </Typography>
                          <Typography variant="body1" className="font-medium">
                            {selectedLog.userEmail}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" className="text-gray-600">
                            Action
                          </Typography>
                          <Chip
                            label={getActionLabel(selectedLog.action)}
                            color={getActionColor(selectedLog.action)}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" className="text-gray-600">
                            Timestamp
                          </Typography>
                          <Typography variant="body1" className="font-medium">
                            {format(new Date(selectedLog.timestamp), 'PPpp')}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>

                  {/* File Info */}
                  {selectedLog.fileName && (
                    <Grid item xs={12}>
                      <Paper className="p-4 border border-gray-200">
                        <Typography variant="h6" className="font-semibold mb-3">
                          File Information
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <Typography variant="body2" className="text-gray-600">
                              File Name
                            </Typography>
                            <Typography variant="body1" className="font-medium">
                              {selectedLog.fileName}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  )}

                  {/* Network & Location */}
                  <Grid item xs={12}>
                    <Paper className="p-4 border border-gray-200">
                      <Typography variant="h6" className="font-semibold mb-3">
                        Network & Location Information
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Box className="flex items-center mb-2">
                            <LocationOn className="text-gray-400 mr-2" />
                            <Typography variant="body2" className="text-gray-600">
                              Location
                            </Typography>
                          </Box>
                          <Typography variant="body1" className="font-medium">
                            {selectedLog.location || 'Unknown'}
                          </Typography>
                          {selectedLog.coordinates && (
                            <Typography variant="caption" className="text-gray-500">
                              {selectedLog.coordinates.lat}, {selectedLog.coordinates.lng}
                            </Typography>
                          )}
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Box className="flex items-center mb-2">
                            <Wifi className="text-gray-400 mr-2" />
                            <Typography variant="body2" className="text-gray-600">
                              IP Address
                            </Typography>
                          </Box>
                          <Typography variant="body1" className="font-medium font-mono">
                            {selectedLog.ipAddress || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2" className="text-gray-600">
                            User Agent
                          </Typography>
                          <Typography variant="body1" className="font-medium">
                            {selectedLog.userAgent || 'N/A'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>

                  {/* AI Analysis */}
                  <Grid item xs={12}>
                    <Paper className="p-4 border border-gray-200 border-l-4 border-l-orange-500">
                      <Typography variant="h6" className="font-semibold mb-3 flex items-center">
                        <Warning className="mr-2 text-orange-500" />
                        AI Security Analysis
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Typography variant="body2" className="text-gray-600 mb-1">
                            Risk Score
                          </Typography>
                          <Box className="flex items-center">
                            <Box className="w-full mr-2">
                              <LinearProgress 
                                variant="determinate" 
                                value={selectedLog.aiRiskScore} 
                                color={selectedLog.aiRiskScore > 70 ? 'error' : selectedLog.aiRiskScore > 40 ? 'warning' : 'success'}
                              />
                            </Box>
                            <Typography variant="body1" className="font-bold">
                              {selectedLog.aiRiskScore}/100
                            </Typography>
                          </Box>
                          <Typography variant="caption" className={`mt-1 ${selectedLog.aiRiskScore > 70 ? 'text-red-600' : selectedLog.aiRiskScore > 40 ? 'text-orange-600' : 'text-green-600'}`}>
                            {selectedLog.aiRiskScore > 70 ? 'High Risk' : selectedLog.aiRiskScore > 40 ? 'Medium Risk' : 'Low Risk'}
                          </Typography>
                        </Grid>
                        {selectedLog.details && (
                          <Grid item xs={12}>
                            <Typography variant="body2" className="text-gray-600">
                              Details
                            </Typography>
                            <Typography variant="body1" className="font-medium">
                              {selectedLog.details}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </Paper>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenDetails(false)}>Close</Button>
                {selectedLog.aiRiskScore > 70 && (
                  <Button
                    variant="contained"
                    color="warning"
                    onClick={() => {
                      toast.warning('Security action triggered (demo mode)');
                      setOpenDetails(false);
                    }}
                  >
                    Investigate
                  </Button>
                )}
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};

export default FileAccessLogs;