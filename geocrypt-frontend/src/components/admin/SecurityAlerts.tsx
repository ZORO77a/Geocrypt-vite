import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Card,
  CardContent,
  GridLegacy as Grid,
  LinearProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Warning,
  Security,
  Notifications,
  Refresh,
  Visibility,
  Block,
  CheckCircle,
  Timeline,
  Person,
  LocationOn,
  AccessTime,
  Clear,
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { format, subDays } from 'date-fns';
import { toast } from 'react-toastify';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const SecurityAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    high: 0,
    medium: 0,
    low: 0,
    total: 0,
    resolved: 0,
  });
  const [trendData, setTrendData] = useState<any>(null);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [filter, setFilter] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchAlerts();
    
    let interval: ReturnType<typeof setInterval>;
    if (autoRefresh) {
      interval = setInterval(fetchAlerts, 30000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  useEffect(() => {
    fetchTrendData();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    
    // Mock alerts data
    const mockAlerts = [
      {
        id: 'alert-001',
        type: 'multiple_failures',
        severity: 'high',
        userId: 'emp-002',
        userName: 'Jane Smith',
        description: 'Multiple failed login attempts from unusual location',
        detectedAt: new Date('2024-01-15T22:30:00'),
        status: 'active',
        aiConfidence: 92,
        riskFactors: ['Unusual location', 'Multiple failures', 'Off-hours access'],
        recommendedActions: ['Temporarily block account', 'Notify user', 'Review location logs'],
        location: 'Remote',
        ipAddress: '45.67.89.123',
        deviceInfo: 'Windows 11 / Chrome 120',
      },
      {
        id: 'alert-002',
        type: 'unusual_location',
        severity: 'medium',
        userId: 'emp-001',
        userName: 'John Doe',
        description: 'File access from new location',
        detectedAt: new Date('2024-01-15T18:15:00'),
        status: 'active',
        aiConfidence: 78,
        riskFactors: ['New location', 'Different device'],
        recommendedActions: ['Verify location', 'Check device authorization'],
        location: 'Unknown',
        ipAddress: '203.0.113.45',
        deviceInfo: 'MacOS / Safari 17',
      },
      {
        id: 'alert-003',
        type: 'after_hours',
        severity: 'low',
        userId: 'emp-003',
        userName: 'Bob Johnson',
        description: 'File access outside working hours',
        detectedAt: new Date('2024-01-14T20:45:00'),
        status: 'resolved',
        resolvedAt: new Date('2024-01-14T21:00:00'),
        aiConfidence: 65,
        riskFactors: ['After hours', 'Weekend access'],
        recommendedActions: ['Review access logs', 'Check if remote access approved'],
        location: 'Home Office',
        ipAddress: '192.168.1.200',
        deviceInfo: 'Windows 10 / Edge 119',
      },
      {
        id: 'alert-004',
        type: 'suspicious_pattern',
        severity: 'high',
        userId: 'emp-004',
        userName: 'Alice Brown',
        description: 'Unusual file access pattern detected',
        detectedAt: new Date('2024-01-13T11:20:00'),
        status: 'active',
        aiConfidence: 88,
        riskFactors: ['Unusual access pattern', 'Multiple file types', 'Rapid succession'],
        recommendedActions: ['Investigate pattern', 'Review user permissions', 'Enhanced monitoring'],
        location: 'Office Building',
        ipAddress: '192.168.1.150',
        deviceInfo: 'Windows 11 / Chrome 120',
      },
      {
        id: 'alert-005',
        type: 'unauthorized_access',
        severity: 'critical',
        userId: 'unknown',
        userName: 'Unknown User',
        description: 'Attempt to access restricted admin files',
        detectedAt: new Date('2024-01-12T03:15:00'),
        status: 'resolved',
        resolvedAt: new Date('2024-01-12T03:30:00'),
        aiConfidence: 95,
        riskFactors: ['Admin file access', 'Unknown user', 'Night time'],
        recommendedActions: ['Block IP', 'Investigate source', 'Review firewall rules'],
        location: 'Unknown',
        ipAddress: '185.220.101.34',
        deviceInfo: 'Unknown',
      },
    ];

    // Apply filter
    let filtered = mockAlerts;
    if (filter !== 'all') {
      if (filter === 'unresolved') {
        filtered = filtered.filter(alert => alert.status === 'active');
      } else {
        filtered = filtered.filter(alert => alert.severity === filter);
      }
    }

    // Calculate stats
    const statsData = {
      high: mockAlerts.filter(a => a.severity === 'high' || a.severity === 'critical').length,
      medium: mockAlerts.filter(a => a.severity === 'medium').length,
      low: mockAlerts.filter(a => a.severity === 'low').length,
      total: mockAlerts.length,
      resolved: mockAlerts.filter(a => a.status === 'resolved').length,
    };

    setAlerts(filtered);
    setStats(statsData);
    setLoading(false);
  };

  const fetchTrendData = () => {
    // Mock trend data for last 7 days
    const dates = Array.from({ length: 7 }, (_, i) => 
      format(subDays(new Date(), 6 - i), 'MMM dd')
    );
    
    setTrendData({
      labels: dates,
      datasets: [
        {
          label: 'High Risk',
          data: [2, 3, 1, 4, 2, 3, 2],
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Medium Risk',
          data: [4, 5, 3, 6, 4, 5, 4],
          borderColor: '#f97316',
          backgroundColor: 'rgba(249, 115, 22, 0.1)',
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Low Risk',
          data: [6, 8, 5, 9, 7, 8, 6],
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    });
  };

  const handleResolveAlert = async (_alertId: string) => {
    if (window.confirm('Mark this alert as resolved?')) {
      toast.success('Alert marked as resolved (demo mode)');
      fetchAlerts();
    }
  };

  const handleBlockUser = async (_userId: string) => {
    if (window.confirm('Block this user from accessing the system?')) {
      toast.warning('User blocked (demo mode)');
      fetchAlerts();
    }
  };

  const handleViewDetails = (alert: any) => {
    setSelectedAlert(alert);
    setOpenDetails(true);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'multiple_failures': return <Security />;
      case 'unusual_location': return <LocationOn />;
      case 'after_hours': return <AccessTime />;
      case 'suspicious_pattern': return <Timeline />;
      case 'unauthorized_access': return <Warning />;
      default: return <Warning />;
    }
  };

  const getSeverityLabel = (severity: string) => {
    return severity.charAt(0).toUpperCase() + severity.slice(1);
  };

  const getTypeLabel = (type: string) => {
    const labels: any = {
      'multiple_failures': 'Multiple Failures',
      'unusual_location': 'Unusual Location',
      'after_hours': 'After Hours',
      'suspicious_pattern': 'Suspicious Pattern',
      'unauthorized_access': 'Unauthorized Access',
    };
    return labels[type] || type.replace('_', ' ').toUpperCase();
  };

  return (
    <Container maxWidth="xl" className="py-6">
      {/* Header */}
      <Paper className="p-6 mb-6 shadow-md">
        <Box className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <Box>
            <Typography variant="h5" className="font-bold text-gray-900">
              Security Alerts Dashboard
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              AI-powered threat detection and real-time monitoring
            </Typography>
          </Box>
          <Box className="flex gap-2">
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchAlerts}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Notifications />}
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'}
            >
              {autoRefresh ? 'Auto: ON' : 'Auto: OFF'}
            </Button>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} className="mb-6">
          {[
            { label: 'Critical & High', value: stats.high, color: 'red', severity: 'high' },
            { label: 'Medium', value: stats.medium, color: 'orange', severity: 'medium' },
            { label: 'Low', value: stats.low, color: 'green', severity: 'low' },
            { label: 'Total Alerts', value: stats.total, color: 'blue', severity: 'all' },
            { label: 'Resolved', value: stats.resolved, color: 'purple', severity: 'resolved' },
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={2} key={index}>
              <Card 
                className={`border hover:shadow-lg transition-shadow cursor-pointer ${filter === stat.severity ? `border-${stat.color}-500` : 'border-gray-200'}`}
                onClick={() => setFilter(stat.severity)}
              >
                <CardContent className="text-center p-4">
                  <Typography variant="h4" className={`font-bold text-${stat.color}-600`}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" className="text-gray-600">
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Filter Chips */}
        <Box className="flex gap-2 mb-6 flex-wrap">
          <Chip
            label="All Alerts"
            onClick={() => setFilter('all')}
            color={filter === 'all' ? 'primary' : 'default'}
            variant={filter === 'all' ? 'filled' : 'outlined'}
          />
          <Chip
            label="Critical & High"
            onClick={() => setFilter('high')}
            color="error"
            variant={filter === 'high' ? 'filled' : 'outlined'}
          />
          <Chip
            label="Medium"
            onClick={() => setFilter('medium')}
            color="warning"
            variant={filter === 'medium' ? 'filled' : 'outlined'}
          />
          <Chip
            label="Low"
            onClick={() => setFilter('low')}
            color="success"
            variant={filter === 'low' ? 'filled' : 'outlined'}
          />
          <Chip
            label="Unresolved"
            onClick={() => setFilter('unresolved')}
            color="default"
            variant={filter === 'unresolved' ? 'filled' : 'outlined'}
          />
          {filter !== 'all' && (
            <Chip
              label="Clear Filter"
              onClick={() => setFilter('all')}
              color="default"
              variant="outlined"
              icon={<Clear />}
            />
          )}
        </Box>
      </Paper>

      {/* Trend Chart */}
      <Paper className="p-6 mb-6 shadow-md">
        <Typography variant="h6" className="font-semibold mb-4">
          Security Alert Trends (Last 7 Days)
        </Typography>
        {trendData && (
          <Box className="h-80">
            <Line
              data={trendData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Number of Alerts',
                      font: { weight: 'bold' },
                    },
                    grid: { color: 'rgba(0,0,0,0.05)' },
                  },
                  x: {
                    grid: { color: 'rgba(0,0,0,0.05)' },
                  },
                },
                plugins: {
                  legend: {
                    position: 'top',
                    labels: { padding: 20 },
                  },
                },
              }}
            />
          </Box>
        )}
      </Paper>

      {/* Alerts Table */}
      <Paper className="p-4 shadow-md">
        {loading ? (
          <LinearProgress />
        ) : alerts.length === 0 ? (
          <Alert severity="success" className="my-4">
            <Typography variant="body1">
              No security alerts detected. System is secure.
            </Typography>
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Alert Type</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Detected At</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {alerts.map((alert) => (
                  <TableRow
                    key={alert.id}
                    hover
                    className={`${alert.severity === 'critical' || alert.severity === 'high' ? 'bg-red-50' : ''}`}
                  >
                    <TableCell>
                      <Box className="flex items-center">
                        {getAlertIcon(alert.type)}
                        <Typography variant="body2" className="font-medium ml-2">
                          {getTypeLabel(alert.type)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getSeverityLabel(alert.severity)}
                        color={getSeverityColor(alert.severity)}
                        size="small"
                        className="font-bold"
                      />
                    </TableCell>
                    <TableCell>
                      {alert.userId !== 'unknown' ? (
                        <Box className="flex items-center">
                          <Person className="text-gray-400 mr-1" fontSize="small" />
                          <Typography variant="body2">
                            {alert.userName}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" className="text-gray-500">
                          Unknown
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" className="line-clamp-2 max-w-[300px]">
                        {alert.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {format(new Date(alert.detectedAt), 'MMM dd')}
                        </Typography>
                        <Typography variant="caption" className="text-gray-500">
                          {format(new Date(alert.detectedAt), 'HH:mm:ss')}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={alert.status === 'active' ? 'Active' : 'Resolved'}
                        color={alert.status === 'active' ? 'error' : 'success'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Box className="flex gap-1">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleViewDetails(alert)}
                          title="View details"
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                        {alert.status === 'active' && (
                          <>
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleResolveAlert(alert.id)}
                              title="Mark as resolved"
                            >
                              <CheckCircle fontSize="small" />
                            </IconButton>
                            {alert.userId !== 'unknown' && (
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleBlockUser(alert.userId)}
                                title="Block user"
                              >
                                <Block fontSize="small" />
                              </IconButton>
                            )}
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Alert Details Dialog */}
      <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="md" fullWidth>
        {selectedAlert && (
          <>
            <DialogTitle>
              <Box className="flex items-center">
                <Warning color={getSeverityColor(selectedAlert.severity) as any} className="mr-2" />
                Security Alert Details
                <Chip
                  label={getSeverityLabel(selectedAlert.severity)}
                  color={getSeverityColor(selectedAlert.severity)}
                  className="ml-2"
                  size="small"
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3} className="py-4">
                {/* Alert Info */}
                <Grid item xs={12}>
                  <Paper className="p-4 border border-gray-200">
                    <Typography variant="h6" className="font-semibold mb-3">
                      Alert Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" className="text-gray-600">
                          Type
                        </Typography>
                        <Typography variant="body1" className="font-medium">
                          {getTypeLabel(selectedAlert.type)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" className="text-gray-600">
                          Severity
                        </Typography>
                        <Chip
                          label={getSeverityLabel(selectedAlert.severity)}
                          color={getSeverityColor(selectedAlert.severity)}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" className="text-gray-600">
                          Detected At
                        </Typography>
                        <Typography variant="body1" className="font-medium">
                          {format(new Date(selectedAlert.detectedAt), 'PPpp')}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" className="text-gray-600">
                          Status
                        </Typography>
                        <Chip
                          label={selectedAlert.status === 'active' ? 'Active' : 'Resolved'}
                          color={selectedAlert.status === 'active' ? 'error' : 'success'}
                          size="small"
                          variant="outlined"
                        />
                      </Grid>
                      {selectedAlert.resolvedAt && (
                        <Grid item xs={12}>
                          <Typography variant="body2" className="text-gray-600">
                            Resolved At
                          </Typography>
                          <Typography variant="body1" className="font-medium">
                            {format(new Date(selectedAlert.resolvedAt), 'PPpp')}
                          </Typography>
                        </Grid>
                      )}
                      <Grid item xs={12}>
                        <Typography variant="body2" className="text-gray-600">
                          AI Confidence
                        </Typography>
                        <Box className="flex items-center">
                          <Box className="w-full mr-2">
                            <LinearProgress 
                              variant="determinate" 
                              value={selectedAlert.aiConfidence} 
                              color={selectedAlert.aiConfidence > 80 ? 'error' : selectedAlert.aiConfidence > 60 ? 'warning' : 'success'}
                            />
                          </Box>
                          <Typography variant="body1" className="font-bold">
                            {selectedAlert.aiConfidence}%
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* User Info */}
                <Grid item xs={12}>
                  <Paper className="p-4 border border-gray-200">
                    <Typography variant="h6" className="font-semibold mb-3 flex items-center">
                      <Person className="mr-2" />
                      User Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" className="text-gray-600">
                          User Name
                        </Typography>
                        <Typography variant="body1" className="font-medium">
                          {selectedAlert.userName}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" className="text-gray-600">
                          User ID
                        </Typography>
                        <Typography variant="body1" className="font-medium">
                          {selectedAlert.userId}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Alert Details */}
                <Grid item xs={12}>
                  <Paper className="p-4 border border-gray-200">
                    <Typography variant="h6" className="font-semibold mb-3">
                      Alert Details
                    </Typography>
                    <Typography variant="body1" className="mb-4">
                      {selectedAlert.description}
                    </Typography>
                    
                    {selectedAlert.riskFactors && selectedAlert.riskFactors.length > 0 && (
                      <Box className="mb-4">
                        <Typography variant="subtitle2" className="font-semibold mb-2">
                          Risk Factors Detected:
                        </Typography>
                        <Box className="flex gap-1 flex-wrap">
                          {selectedAlert.riskFactors.map((factor: string, index: number) => (
                            <Chip
                              key={index}
                              label={factor}
                              color="warning"
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Box>
                    )}

                    {selectedAlert.recommendedActions && selectedAlert.recommendedActions.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" className="font-semibold mb-2">
                          Recommended Actions:
                        </Typography>
                        <ul className="list-disc pl-5 space-y-1">
                          {selectedAlert.recommendedActions.map((action: string, index: number) => (
                            <li key={index}>
                              <Typography variant="body2">{action}</Typography>
                            </li>
                          ))}
                        </ul>
                      </Box>
                    )}
                  </Paper>
                </Grid>

                {/* Location & Network */}
                <Grid item xs={12}>
                  <Paper className="p-4 border border-gray-200">
                    <Typography variant="h6" className="font-semibold mb-3">
                      Location & Network Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" className="text-gray-600">
                          Location
                        </Typography>
                        <Typography variant="body1" className="font-medium">
                          {selectedAlert.location || 'Unknown'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" className="text-gray-600">
                          IP Address
                        </Typography>
                        <Typography variant="body1" className="font-medium font-mono">
                          {selectedAlert.ipAddress}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" className="text-gray-600">
                          Device Info
                        </Typography>
                        <Typography variant="body1" className="font-medium">
                          {selectedAlert.deviceInfo || 'Unknown'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* AI Analysis */}
                <Grid item xs={12}>
                  <Paper className="p-4 border border-gray-200 border-l-4 border-l-orange-500">
                    <Typography variant="h6" className="font-semibold mb-3 flex items-center">
                      <Security className="mr-2 text-orange-500" />
                      AI Analysis
                    </Typography>
                    <Typography variant="body2" className="mb-3">
                      Our AI system detected this activity as potentially suspicious based on behavior patterns and access anomalies.
                    </Typography>
                    <Alert severity="info">
                      <Typography variant="body2">
                        <strong>Note:</strong> AI-powered monitoring continuously analyzes user behavior to detect anomalies and potential threats.
                        All detections are logged for security review.
                      </Typography>
                    </Alert>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDetails(false)}>Close</Button>
              {selectedAlert.status === 'active' && (
                <>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Block />}
                    onClick={() => {
                      handleBlockUser(selectedAlert.userId);
                      setOpenDetails(false);
                    }}
                  >
                    Block User
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircle />}
                    onClick={() => {
                      handleResolveAlert(selectedAlert.id);
                      setOpenDetails(false);
                    }}
                  >
                    Mark as Resolved
                  </Button>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* AI Monitoring Info */}
      <Paper className="p-6 mt-6 shadow-md border border-orange-200">
        <Typography variant="h6" className="font-semibold mb-4 flex items-center">
          <Security className="mr-2 text-orange-500" />
          AI Monitoring System
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box className="p-3 bg-orange-50 rounded-lg">
              <Typography variant="subtitle2" className="font-semibold text-orange-700 mb-2">
                What We Monitor
              </Typography>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                <li>Login patterns and failed attempts</li>
                <li>File access from unusual locations</li>
                <li>Access outside working hours</li>
                <li>Suspicious file access patterns</li>
                <li>Multiple file downloads in short time</li>
                <li>Access to sensitive files</li>
              </ul>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box className="p-3 bg-blue-50 rounded-lg">
              <Typography variant="subtitle2" className="font-semibold text-blue-700 mb-2">
                Response Actions
              </Typography>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                <li>Real-time alerts to administrators</li>
                <li>Temporary account suspension for high-risk alerts</li>
                <li>Automatic logging of all suspicious activities</li>
                <li>Email notifications for critical alerts</li>
                <li>Detailed investigation reports</li>
                <li>Pattern analysis for recurring threats</li>
              </ul>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default SecurityAlerts;