import React, { useState, useEffect } from 'react';
import {
  Container,
  GridLegacy as Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Avatar,
  Alert,
} from '@mui/material';
import {
  People,
  Folder,
  Security,
  Warning,
  AccessTime,
  TrendingUp,
  Refresh,
  Visibility,
  Block,
  Notifications,
  LocationOn,
  Wifi,
  Schedule,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { toast } from 'react-toastify';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalFiles: 0,
    activeAccess: 0,
    pendingRequests: 0,
    suspiciousActivities: 0,
    encryptedFiles: 0,
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessChartData, setAccessChartData] = useState<any>(null);
  const [fileTypeChartData, setFileTypeChartData] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Simulate API calls
      setLoading(true);
      
      // Mock data
      const mockStats = {
        totalEmployees: 24,
        totalFiles: 156,
        activeAccess: 8,
        pendingRequests: 3,
        suspiciousActivities: 2,
        encryptedFiles: 89,
      };
      
      const mockActivities = [
        {
          id: '1',
          userName: 'John Doe',
          userEmail: 'john@company.com',
          action: 'file_access',
          fileName: 'project_document.pdf',
          status: 'success',
          timestamp: new Date(Date.now() - 3600000),
          location: 'Office Building',
          ipAddress: '192.168.1.100',
        },
        {
          id: '2',
          userName: 'Jane Smith',
          userEmail: 'jane@company.com',
          action: 'failed_attempt',
          fileName: 'confidential_report.docx',
          status: 'failed',
          timestamp: new Date(Date.now() - 7200000),
          location: 'Unknown',
          ipAddress: '10.0.0.15',
        },
        {
          id: '3',
          userName: 'Bob Johnson',
          userEmail: 'bob@company.com',
          action: 'login',
          status: 'success',
          timestamp: new Date(Date.now() - 10800000),
          location: 'Remote',
          ipAddress: '203.0.113.25',
        },
      ];
      
      // Prepare chart data
      const hourData = Array.from({ length: 24 }, () => Math.floor(Math.random() * 50) + 10);
      const accessData = {
        labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
        datasets: [
          {
            label: 'File Accesses',
            data: hourData,
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1,
          },
        ],
      };
      
      const fileTypeData = {
        labels: ['Documents', 'Images', 'Videos', 'Archives', 'Others'],
        datasets: [
          {
            data: [45, 30, 15, 25, 20],
            backgroundColor: [
              'rgba(59, 130, 246, 0.7)',
              'rgba(16, 185, 129, 0.7)',
              'rgba(245, 158, 11, 0.7)',
              'rgba(239, 68, 68, 0.7)',
              'rgba(139, 92, 246, 0.7)',
            ],
            borderWidth: 1,
          },
        ],
      };
      
      setStats(mockStats);
      setRecentActivities(mockActivities);
      setAccessChartData(accessData);
      setFileTypeChartData(fileTypeData);
      
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockEmployee = (_employeeId: string) => {
    if (window.confirm('Are you sure you want to block this employee?')) {
      toast.info('Employee blocked (demo mode)');
      // Implement block logic
    }
  };

  if (loading && recentActivities.length === 0) {
    return (
      <Box className="min-h-screen flex flex-col">
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <Paper className="p-6 mb-6 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-none shadow-lg">
        <Container maxWidth="xl">
          <Box className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <Box>
              <Typography variant="h4" className="font-bold mb-2">
                Admin Dashboard
              </Typography>
              <Typography variant="body1" className="opacity-90">
                Welcome back, {user?.name}! Here's what's happening with your system.
              </Typography>
            </Box>
            <Box className="flex gap-2">
              <Button
                variant="contained"
                color="secondary"
                startIcon={<Refresh />}
                onClick={fetchDashboardData}
                className="bg-white text-blue-600 hover:bg-gray-100 shadow-md"
              >
                Refresh
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<Notifications />}
                href="/admin/alerts"
                className="border-white text-white hover:bg-white/20"
              >
                Alerts ({stats.suspiciousActivities})
              </Button>
            </Box>
          </Box>
        </Container>
      </Paper>

      <Container maxWidth="xl">
        {/* Stats Cards */}
        <Grid container spacing={3} className="mb-8">
          {[
            { 
              icon: People, 
              label: 'Total Employees', 
              value: stats.totalEmployees, 
              color: 'blue',
              change: '+2 this week',
            },
            { 
              icon: Folder, 
              label: 'Encrypted Files', 
              value: stats.encryptedFiles, 
              color: 'green',
              change: `${Math.round((stats.encryptedFiles / stats.totalFiles) * 100)}% encrypted`,
            },
            { 
              icon: Security, 
              label: 'Active Access', 
              value: stats.activeAccess, 
              color: 'purple',
              change: 'Real-time monitoring',
            },
            { 
              icon: AccessTime, 
              label: 'Pending Requests', 
              value: stats.pendingRequests, 
              color: 'orange',
              change: 'Requires attention',
            },
            { 
              icon: Warning, 
              label: 'Security Alerts', 
              value: stats.suspiciousActivities, 
              color: 'red',
              change: 'AI detected',
            },
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={2.4} key={index}>
              <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200">
                <CardContent className="p-4">
                  <Box className="flex items-center justify-between mb-3">
                    <Box className={`p-3 rounded-lg bg-${stat.color}-100`}>
                      <stat.icon className={`text-${stat.color}-600 text-2xl`} />
                    </Box>
                    <Chip
                      label={stat.value}
                      size="small"
                      className={`bg-${stat.color}-100 text-${stat.color}-800 font-bold`}
                    />
                  </Box>
                  <Typography variant="h6" className="font-semibold text-gray-800">
                    {stat.label}
                  </Typography>
                  <Typography variant="caption" className="text-gray-600">
                    {stat.change}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={3} className="mb-8">
          <Grid item xs={12} lg={8}>
            <Paper className="p-4 shadow-md border border-gray-200">
              <Box className="flex justify-between items-center mb-4">
                <Typography variant="h6" className="font-semibold">
                  File Access Pattern (Last 24 Hours)
                </Typography>
                <Box className="flex items-center gap-2">
                  <LocationOn className="text-blue-500" fontSize="small" />
                  <Typography variant="caption" className="text-gray-600">
                    Geofencing Active
                  </Typography>
                </Box>
              </Box>
              {accessChartData && (
                <Box className="h-80">
                  <Bar
                    data={accessChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: { color: 'rgba(0,0,0,0.05)' },
                          title: {
                            display: true,
                            text: 'Number of Accesses',
                            font: { weight: 'bold' },
                          },
                        },
                        x: {
                          grid: { color: 'rgba(0,0,0,0.05)' },
                        },
                      },
                    }}
                  />
                </Box>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} lg={4}>
            <Paper className="p-4 shadow-md border border-gray-200">
              <Typography variant="h6" className="font-semibold mb-4">
                File Type Distribution
              </Typography>
              {fileTypeChartData && (
                <Box className="h-64 flex items-center justify-center">
                  <Pie
                    data={fileTypeChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: { padding: 20 },
                        },
                      },
                    }}
                  />
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Recent Activities & Quick Stats */}
        <Grid container spacing={3} className="mb-8">
          <Grid item xs={12} lg={8}>
            <Paper className="p-4 shadow-md border border-gray-200">
              <Box className="flex justify-between items-center mb-4">
                <Typography variant="h6" className="font-semibold">
                  Recent Security Activities
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<TrendingUp />}
                  href="/admin/logs"
                >
                  View All Logs
                </Button>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Activity</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentActivities.map((activity) => (
                      <TableRow key={activity.id} hover>
                        <TableCell>
                          <Box className="flex items-center">
                            <Avatar className="w-8 h-8 mr-2 bg-blue-500">
                              {activity.userName?.charAt(0) || 'U'}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" className="font-medium">
                                {activity.userName}
                              </Typography>
                              <Typography variant="caption" className="text-gray-500">
                                {activity.userEmail}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box className="flex items-center">
                            {activity.action === 'file_access' && <Folder fontSize="small" className="mr-1" />}
                            {activity.action === 'login' && <Security fontSize="small" className="mr-1" />}
                            {activity.action === 'failed_attempt' && <Warning fontSize="small" className="mr-1" />}
                            <Typography variant="body2">
                              {activity.action.replace('_', ' ').toUpperCase()}
                              {activity.fileName && `: ${activity.fileName}`}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {format(new Date(activity.timestamp), 'HH:mm')}
                          <Typography variant="caption" className="text-gray-500 block">
                            {format(new Date(activity.timestamp), 'MMM dd')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={activity.status}
                            size="small"
                            variant="outlined"
                            color={activity.status === 'success' ? 'success' : 'error'}
                            className="font-medium"
                          />
                        </TableCell>
                        <TableCell>
                          <Box className="flex items-center">
                            {activity.location === 'Office Building' ? (
                              <>
                                <LocationOn className="text-green-500 mr-1" fontSize="small" />
                                <Typography variant="body2" className="text-green-700">
                                  {activity.location}
                                </Typography>
                              </>
                            ) : (
                              <>
                                <LocationOn className="text-red-500 mr-1" fontSize="small" />
                                <Typography variant="body2" className="text-red-700">
                                  {activity.location}
                                </Typography>
                              </>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" color="primary" title="View details">
                            <Visibility />
                          </IconButton>
                          {activity.status === 'failed' && (
                            <IconButton 
                              size="small" 
                              color="error" 
                              title="Block user"
                              onClick={() => handleBlockEmployee(activity.userId || '')}
                            >
                              <Block />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
          
          <Grid item xs={12} lg={4}>
            <Paper className="p-4 shadow-md border border-gray-200">
              <Typography variant="h6" className="font-semibold mb-4">
                System Status
              </Typography>
              <Box className="space-y-4">
                <Alert severity="success" icon={<Wifi />}>
                  <Typography variant="body2" className="font-medium">
                    WiFi Monitoring: Active
                  </Typography>
                  <Typography variant="caption">
                    Office network: Office-WiFi-5G
                  </Typography>
                </Alert>
                
                <Alert severity="info" icon={<Schedule />}>
                  <Typography variant="body2" className="font-medium">
                    Time Restrictions: 9:00 AM - 5:00 PM
                  </Typography>
                  <Typography variant="caption">
                    {new Date().getHours() >= 9 && new Date().getHours() < 17 
                      ? '✅ Currently within working hours' 
                      : '⚠️ Outside working hours'}
                  </Typography>
                </Alert>
                
                <Alert severity="warning" icon={<Security />}>
                  <Typography variant="body2" className="font-medium">
                    AI Monitoring: Enabled
                  </Typography>
                  <Typography variant="caption">
                    Analyzing behavior patterns in real-time
                  </Typography>
                </Alert>
                
                <Box className="bg-gray-50 p-3 rounded-lg">
                  <Typography variant="body2" className="font-medium mb-2">
                    Quick Actions
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant="contained"
                        size="small"
                        href="/admin/employees"
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        Manage Users
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant="contained"
                        size="small"
                        href="/admin/requests"
                        className="bg-green-500 hover:bg-green-600"
                      >
                        View Requests
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant="contained"
                        size="small"
                        href="/admin/settings"
                        className="bg-purple-500 hover:bg-purple-600"
                      >
                        Settings
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant="contained"
                        size="small"
                        href="/admin/alerts"
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Security Alerts
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AdminDashboard;