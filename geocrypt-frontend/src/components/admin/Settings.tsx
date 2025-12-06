import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  GridLegacy as Grid,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Alert,
  LinearProgress,
  Divider,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Save,
  Security,
  LocationOn,
  Wifi,
  AccessTime,
  Lock,
  Refresh,
  Add,
  Delete,
  Edit,
  VerifiedUser,
  Notifications,
  Storage,
  Settings as SettingsIcon,
  NetworkWifi,
  Schedule,
  People,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box className="py-4">{children}</Box>}
    </div>
  );
};

const AdminSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [openWifiDialog, setOpenWifiDialog] = useState(false);
  const [openLocationDialog, setOpenLocationDialog] = useState(false);
  const [editingWifi, setEditingWifi] = useState<any>(null);
  const [editingLocation, setEditingLocation] = useState<any>(null);

  // Mock data
  const [settings] = useState({
    accessControl: {
      workingHoursStart: '09:00',
      workingHoursEnd: '17:00',
      maxFailedAttempts: 5,
      sessionTimeout: 30,
    },
    security: {
      requireMFA: true,
      requireLocation: true,
      requireWifi: true,
      autoLogout: true,
      encryptionAlgorithm: 'Kyber-1024',
    },
    notifications: {
      notifyFailedAttempts: true,
      notifySuspiciousActivity: true,
      notifyAdminOnAccess: false,
      emailNotifications: true,
    },
    aiMonitoring: {
      enableAIMonitoring: true,
      aiRiskThreshold: 70,
      monitorBehaviorPatterns: true,
      detectAnomalies: true,
    },
    wifiNetworks: [
      { id: 'wifi-001', ssid: 'Office-WiFi-5G', bssid: '00:11:22:33:44:55', securityType: 'WPA2', isPrimary: true },
      { id: 'wifi-002', ssid: 'Guest-WiFi', bssid: 'AA:BB:CC:DD:EE:FF', securityType: 'WPA2', isPrimary: false },
    ],
    locations: [
      { id: 'loc-001', name: 'Main Office', latitude: 12.9716, longitude: 77.5946, radius: 500, address: '123 Business Street', isPrimary: true },
      { id: 'loc-002', name: 'Branch Office', latitude: 13.0827, longitude: 80.2707, radius: 300, address: '456 Corporate Avenue', isPrimary: false },
    ],
    systemInfo: {
      totalEmployees: 24,
      encryptedFiles: 89,
      uptime: '15 days',
      lastBackup: '2024-01-14',
    },
  });

  // Formik for main settings
  const formik = useFormik({
    initialValues: {
      // Access Control
      workingHoursStart: settings.accessControl.workingHoursStart,
      workingHoursEnd: settings.accessControl.workingHoursEnd,
      maxFailedAttempts: settings.accessControl.maxFailedAttempts,
      sessionTimeout: settings.accessControl.sessionTimeout,
      
      // Security
      requireMFA: settings.security.requireMFA,
      requireLocation: settings.security.requireLocation,
      requireWifi: settings.security.requireWifi,
      autoLogout: settings.security.autoLogout,
      encryptionAlgorithm: settings.security.encryptionAlgorithm,
      
      // Notifications
      notifyFailedAttempts: settings.notifications.notifyFailedAttempts,
      notifySuspiciousActivity: settings.notifications.notifySuspiciousActivity,
      notifyAdminOnAccess: settings.notifications.notifyAdminOnAccess,
      emailNotifications: settings.notifications.emailNotifications,
      
      // AI Monitoring
      enableAIMonitoring: settings.aiMonitoring.enableAIMonitoring,
      aiRiskThreshold: settings.aiMonitoring.aiRiskThreshold,
      monitorBehaviorPatterns: settings.aiMonitoring.monitorBehaviorPatterns,
      detectAnomalies: settings.aiMonitoring.detectAnomalies,
    },
    validationSchema: Yup.object({
      workingHoursStart: Yup.string().required('Required'),
      workingHoursEnd: Yup.string().required('Required'),
      maxFailedAttempts: Yup.number().min(1).max(10).required('Required'),
      sessionTimeout: Yup.number().min(5).max(120).required('Required'),
      aiRiskThreshold: Yup.number().min(0).max(100).required('Required'),
    }),
    onSubmit: async (_values) => {
      setSuccessMessage('');
      setErrorMessage('');
      
      try {
        // Simulate API call
        setTimeout(() => {
          toast.success('Settings saved successfully!');
          setSuccessMessage('Settings saved successfully!');
          setTimeout(() => setSuccessMessage(''), 3000);
          setSaving(false);
        }, 1000);
      } catch (error: any) {
        setErrorMessage(error.message || 'Error saving settings');
        setSaving(false);
      }
    },
  });

  // Formik for WiFi networks
  const wifiFormik = useFormik({
    initialValues: {
      ssid: '',
      bssid: '',
      securityType: 'WPA2',
      isPrimary: false,
    },
    validationSchema: Yup.object({
      ssid: Yup.string().required('SSID is required'),
      bssid: Yup.string().required('BSSID is required'),
    }),
    onSubmit: async (_values) => {
      try {
        if (editingWifi) {
          toast.success('WiFi network updated (demo mode)');
        } else {
          toast.success('WiFi network added (demo mode)');
        }
        setOpenWifiDialog(false);
        wifiFormik.resetForm();
        setEditingWifi(null);
      } catch (error: any) {
        toast.error(error.message || 'Error saving WiFi network');
      }
    },
  });

  // Formik for locations
  const locationFormik = useFormik({
    initialValues: {
      name: '',
      latitude: '',
      longitude: '',
      radius: 100,
      address: '',
      isPrimary: false,
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      latitude: Yup.number().required('Latitude is required'),
      longitude: Yup.number().required('Longitude is required'),
      radius: Yup.number().min(10).max(1000).required('Radius is required'),
    }),
    onSubmit: async (_values) => {
      try {
        if (editingLocation) {
          toast.success('Location updated (demo mode)');
        } else {
          toast.success('Location added (demo mode)');
        }
        setOpenLocationDialog(false);
        locationFormik.resetForm();
        setEditingLocation(null);
      } catch (error: any) {
        toast.error(error.message || 'Error saving location');
      }
    },
  });

  useEffect(() => {
    // Simulate loading settings
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const handleEditWifi = (wifi: any) => {
    setEditingWifi(wifi);
    wifiFormik.setValues(wifi);
    setOpenWifiDialog(true);
  };

  const handleDeleteWifi = async (_wifiId: string) => {
    if (window.confirm('Are you sure you want to delete this WiFi network?')) {
      toast.success('WiFi network deleted (demo mode)');
    }
  };

  const handleEditLocation = (location: any) => {
    setEditingLocation(location);
    locationFormik.setValues(location);
    setOpenLocationDialog(true);
  };

  const handleDeleteLocation = async (_locationId: string) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      toast.success('Location deleted (demo mode)');
    }
  };

  const handleTestLocation = (location: any) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
    window.open(url, '_blank');
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box className="min-h-screen flex flex-col">
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" className="py-6">
      {/* Header */}
      <Paper className="p-6 mb-6 shadow-md">
        <Box className="flex items-center mb-4">
          <SettingsIcon className="text-4xl text-blue-600 mr-3" />
          <Box>
            <Typography variant="h5" className="font-bold text-gray-900">
              System Settings
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Configure GeoCrypt security, access controls, and monitoring settings
            </Typography>
          </Box>
        </Box>

        {/* Success/Error Messages */}
        {successMessage && (
          <Alert severity="success" className="mb-4">
            {successMessage}
          </Alert>
        )}
        {errorMessage && (
          <Alert severity="error" className="mb-4">
            {errorMessage}
          </Alert>
        )}

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="settings tabs">
            <Tab label="Access Control" icon={<People />} iconPosition="start" />
            <Tab label="Security" icon={<Security />} iconPosition="start" />
            <Tab label="Geofencing" icon={<LocationOn />} iconPosition="start" />
            <Tab label="AI Monitoring" icon={<VerifiedUser />} iconPosition="start" />
            <Tab label="System Info" icon={<Storage />} iconPosition="start" />
          </Tabs>
        </Box>
      </Paper>

      <form onSubmit={formik.handleSubmit}>
        {/* Access Control Tab */}
        <TabPanel value={tabValue} index={0}>
          <Paper className="p-6 mb-6 shadow-md">
            <Typography variant="h6" className="font-semibold mb-4 flex items-center">
              <AccessTime className="mr-2" />
              Access Control Settings
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Working Hours Start"
                  name="workingHoursStart"
                  type="time"
                  value={formik.values.workingHoursStart}
                  onChange={formik.handleChange}
                  error={formik.touched.workingHoursStart && Boolean(formik.errors.workingHoursStart)}
                  helperText={formik.touched.workingHoursStart && formik.errors.workingHoursStart}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Working Hours End"
                  name="workingHoursEnd"
                  type="time"
                  value={formik.values.workingHoursEnd}
                  onChange={formik.handleChange}
                  error={formik.touched.workingHoursEnd && Boolean(formik.errors.workingHoursEnd)}
                  helperText={formik.touched.workingHoursEnd && formik.errors.workingHoursEnd}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Max Failed Login Attempts"
                  name="maxFailedAttempts"
                  type="number"
                  value={formik.values.maxFailedAttempts}
                  onChange={formik.handleChange}
                  error={formik.touched.maxFailedAttempts && Boolean(formik.errors.maxFailedAttempts)}
                  helperText={formik.touched.maxFailedAttempts && formik.errors.maxFailedAttempts}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">attempts</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Session Timeout"
                  name="sessionTimeout"
                  type="number"
                  value={formik.values.sessionTimeout}
                  onChange={formik.handleChange}
                  error={formik.touched.sessionTimeout && Boolean(formik.errors.sessionTimeout)}
                  helperText={formik.touched.sessionTimeout && formik.errors.sessionTimeout}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">minutes</InputAdornment>,
                  }}
                />
              </Grid>
            </Grid>

            <Alert severity="info" className="mt-4">
              <Typography variant="body2">
                <strong>Note:</strong> Employees can only access files during working hours unless they have approved remote access.
              </Typography>
            </Alert>
          </Paper>
        </TabPanel>

        {/* Security Tab */}
        <TabPanel value={tabValue} index={1}>
          <Paper className="p-6 mb-6 shadow-md">
            <Typography variant="h6" className="font-semibold mb-4 flex items-center">
              <Security className="mr-2" />
              Security Settings
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.requireMFA}
                      onChange={formik.handleChange}
                      name="requireMFA"
                      color="primary"
                    />
                  }
                  label="Require Multi-Factor Authentication"
                />
                <Typography variant="caption" color="text.secondary" display="block">
                  All employees must verify with OTP via email
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.autoLogout}
                      onChange={formik.handleChange}
                      name="autoLogout"
                      color="primary"
                    />
                  }
                  label="Auto Logout Inactive Sessions"
                />
                <Typography variant="caption" color="text.secondary" display="block">
                  Automatically log out users after inactivity
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.requireLocation}
                      onChange={formik.handleChange}
                      name="requireLocation"
                      color="primary"
                    />
                  }
                  label="Require Location Verification"
                />
                <Typography variant="caption" color="text.secondary" display="block">
                  Employees must be at authorized locations
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.requireWifi}
                      onChange={formik.handleChange}
                      name="requireWifi"
                      color="primary"
                    />
                  }
                  label="Require WiFi Verification"
                />
                <Typography variant="caption" color="text.secondary" display="block">
                  Employees must be on approved WiFi networks
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Encryption Algorithm</InputLabel>
                  <Select
                    name="encryptionAlgorithm"
                    value={formik.values.encryptionAlgorithm}
                    onChange={formik.handleChange}
                    label="Encryption Algorithm"
                  >
                    <MenuItem value="Kyber-512">Kyber-512 (Light Security)</MenuItem>
                    <MenuItem value="Kyber-768">Kyber-768 (Standard Security)</MenuItem>
                    <MenuItem value="Kyber-1024">Kyber-1024 (High Security)</MenuItem>
                    <MenuItem value="NTRU">NTRU (Alternative PQC)</MenuItem>
                    <MenuItem value="AES-256">AES-256 (Traditional)</MenuItem>
                  </Select>
                </FormControl>
                <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                  Post-Quantum Cryptography algorithm for file encryption
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </TabPanel>

        {/* Geofencing Tab */}
        <TabPanel value={tabValue} index={2}>
          {/* WiFi Networks Management */}
          <Paper className="p-6 mb-6 shadow-md">
            <Box className="flex justify-between items-center mb-4">
              <Typography variant="h6" className="font-semibold flex items-center">
                <NetworkWifi className="mr-2" />
                Approved WiFi Networks
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => {
                  setEditingWifi(null);
                  wifiFormik.resetForm();
                  setOpenWifiDialog(true);
                }}
              >
                Add WiFi Network
              </Button>
            </Box>

            {settings.wifiNetworks.length === 0 ? (
              <Alert severity="info">
                No WiFi networks configured. Add approved WiFi networks for access control.
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {settings.wifiNetworks.map((wifi) => (
                  <Grid item xs={12} md={6} key={wifi.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box className="flex justify-between items-center">
                          <Box>
                            <Typography variant="h6" className="font-medium">
                              {wifi.ssid}
                              {wifi.isPrimary && (
                                <Chip
                                  label="Primary"
                                  color="primary"
                                  size="small"
                                  className="ml-2"
                                />
                              )}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              BSSID: {wifi.bssid}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Security: {wifi.securityType}
                            </Typography>
                          </Box>
                          <Box>
                            <IconButton
                              size="small"
                              onClick={() => handleEditWifi(wifi)}
                            >
                              <Edit />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteWifi(wifi.id)}
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>

          {/* Locations Management */}
          <Paper className="p-6 shadow-md">
            <Box className="flex justify-between items-center mb-4">
              <Typography variant="h6" className="font-semibold flex items-center">
                <LocationOn className="mr-2" />
                Approved Locations
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => {
                  setEditingLocation(null);
                  locationFormik.resetForm();
                  setOpenLocationDialog(true);
                }}
              >
                Add Location
              </Button>
            </Box>

            {settings.locations.length === 0 ? (
              <Alert severity="info">
                No locations configured. Add approved locations for geofencing.
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {settings.locations.map((location) => (
                  <Grid item xs={12} md={6} key={location.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box className="flex justify-between items-start">
                          <Box>
                            <Typography variant="h6" className="font-medium">
                              {location.name}
                              {location.isPrimary && (
                                <Chip
                                  label="Primary"
                                  color="primary"
                                  size="small"
                                  className="ml-2"
                                />
                              )}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Coordinates: {location.latitude}, {location.longitude}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Radius: {location.radius} meters
                            </Typography>
                            {location.address && (
                              <Typography variant="body2" color="text.secondary">
                                Address: {location.address}
                              </Typography>
                            )}
                          </Box>
                          <Box>
                            <IconButton
                              size="small"
                              onClick={() => handleTestLocation(location)}
                              title="View on Google Maps"
                            >
                              <LocationOn />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleEditLocation(location)}
                            >
                              <Edit />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteLocation(location.id)}
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </TabPanel>

        {/* AI Monitoring Tab */}
        <TabPanel value={tabValue} index={3}>
          <Paper className="p-6 mb-6 shadow-md">
            <Typography variant="h6" className="font-semibold mb-4 flex items-center">
              <VerifiedUser className="mr-2" />
              AI Monitoring Settings
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.enableAIMonitoring}
                      onChange={formik.handleChange}
                      name="enableAIMonitoring"
                      color="primary"
                    />
                  }
                  label="Enable AI Monitoring"
                />
                <Typography variant="caption" color="text.secondary" display="block">
                  Monitor employee behavior patterns using AI
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="AI Risk Threshold"
                  name="aiRiskThreshold"
                  type="number"
                  value={formik.values.aiRiskThreshold}
                  onChange={formik.handleChange}
                  error={formik.touched.aiRiskThreshold && Boolean(formik.errors.aiRiskThreshold)}
                  helperText={formik.touched.aiRiskThreshold && formik.errors.aiRiskThreshold}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                />
                <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                  Generate alerts when risk score exceeds this threshold
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.monitorBehaviorPatterns}
                      onChange={formik.handleChange}
                      name="monitorBehaviorPatterns"
                      color="primary"
                    />
                  }
                  label="Monitor Behavior Patterns"
                />
                <Typography variant="caption" color="text.secondary" display="block">
                  Analyze user behavior for anomalies
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.detectAnomalies}
                      onChange={formik.handleChange}
                      name="detectAnomalies"
                      color="primary"
                    />
                  }
                  label="Detect Anomalies in Real-time"
                />
                <Typography variant="caption" color="text.secondary" display="block">
                  Real-time anomaly detection and alerting
                </Typography>
              </Grid>
            </Grid>

            <Alert severity="info" className="mt-4">
              <Typography variant="body2">
                <strong>AI Monitoring Capabilities:</strong>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Behavior pattern analysis</li>
                  <li>Anomaly detection in file access</li>
                  <li>Location access pattern analysis</li>
                  <li>Time-based access pattern analysis</li>
                  <li>Predictive threat modeling</li>
                </ul>
              </Typography>
            </Alert>
          </Paper>
        </TabPanel>

        {/* System Info Tab */}
        <TabPanel value={tabValue} index={4}>
          <Paper className="p-6 mb-6 shadow-md">
            <Typography variant="h6" className="font-semibold mb-4 flex items-center">
              <Storage className="mr-2" />
              System Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent className="text-center">
                    <People className="text-4xl text-blue-500 mb-2" />
                    <Typography variant="h4" className="font-bold">
                      {settings.systemInfo.totalEmployees}
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      Total Employees
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent className="text-center">
                    <Storage className="text-4xl text-green-500 mb-2" />
                    <Typography variant="h4" className="font-bold">
                      {settings.systemInfo.encryptedFiles}
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      Encrypted Files
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent className="text-center">
                    <Schedule className="text-4xl text-purple-500 mb-2" />
                    <Typography variant="h4" className="font-bold">
                      {settings.systemInfo.uptime}
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      System Uptime
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box className="mt-6">
              <Typography variant="subtitle1" className="font-semibold mb-2">
                System Logs
              </Typography>
              <List className="border border-gray-200 rounded-lg">
                <ListItem>
                  <ListItemText 
                    primary="Last Backup" 
                    secondary={settings.systemInfo.lastBackup}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText 
                    primary="Database Size" 
                    secondary="245.6 MB"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText 
                    primary="Active Sessions" 
                    secondary="8"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText 
                    primary="Security Checks" 
                    secondary="All systems operational"
                    secondaryTypographyProps={{ className: 'text-green-600' }}
                  />
                </ListItem>
              </List>
            </Box>

            <Alert severity="warning" className="mt-4">
              <Typography variant="body2">
                <strong>System Maintenance:</strong> Regular backups and updates are essential for security.
                Next scheduled maintenance: January 21, 2024 at 02:00 AM.
              </Typography>
            </Alert>
          </Paper>
        </TabPanel>

        {/* Save Button */}
        <Box className="flex justify-end gap-2 mt-6">
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => window.location.reload()}
          >
            Reset
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<Save />}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saving ? 'Saving...' : 'Save All Settings'}
          </Button>
        </Box>
      </form>

      {/* WiFi Dialog */}
      <Dialog open={openWifiDialog} onClose={() => setOpenWifiDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingWifi ? 'Edit WiFi Network' : 'Add WiFi Network'}
        </DialogTitle>
        <form onSubmit={wifiFormik.handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="SSID (Network Name)"
                  name="ssid"
                  value={wifiFormik.values.ssid}
                  onChange={wifiFormik.handleChange}
                  error={wifiFormik.touched.ssid && Boolean(wifiFormik.errors.ssid)}
                  helperText={wifiFormik.touched.ssid && wifiFormik.errors.ssid}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="BSSID (MAC Address)"
                  name="bssid"
                  placeholder="00:11:22:33:44:55"
                  value={wifiFormik.values.bssid}
                  onChange={wifiFormik.handleChange}
                  error={wifiFormik.touched.bssid && Boolean(wifiFormik.errors.bssid)}
                  helperText={wifiFormik.touched.bssid && wifiFormik.errors.bssid}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Security Type</InputLabel>
                  <Select
                    name="securityType"
                    value={wifiFormik.values.securityType}
                    onChange={wifiFormik.handleChange}
                    label="Security Type"
                  >
                    <MenuItem value="Open">Open</MenuItem>
                    <MenuItem value="WEP">WEP</MenuItem>
                    <MenuItem value="WPA">WPA</MenuItem>
                    <MenuItem value="WPA2">WPA2</MenuItem>
                    <MenuItem value="WPA3">WPA3</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={wifiFormik.values.isPrimary}
                      onChange={wifiFormik.handleChange}
                      name="isPrimary"
                      color="primary"
                    />
                  }
                  label="Primary Network"
                />
                <Typography variant="caption" color="text.secondary" display="block">
                  Set as primary network for access control
                </Typography>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenWifiDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained" className="bg-blue-600 hover:bg-blue-700">
              {editingWifi ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Location Dialog */}
      <Dialog open={openLocationDialog} onClose={() => setOpenLocationDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingLocation ? 'Edit Location' : 'Add Location'}
        </DialogTitle>
        <form onSubmit={locationFormik.handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location Name"
                  name="name"
                  value={locationFormik.values.name}
                  onChange={locationFormik.handleChange}
                  error={locationFormik.touched.name && Boolean(locationFormik.errors.name)}
                  helperText={locationFormik.touched.name && locationFormik.errors.name}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Latitude"
                  name="latitude"
                  type="number"
                  inputProps={{ step: 'any' }}
                  value={locationFormik.values.latitude}
                  onChange={locationFormik.handleChange}
                  error={locationFormik.touched.latitude && Boolean(locationFormik.errors.latitude)}
                  helperText={locationFormik.touched.latitude && locationFormik.errors.latitude}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Longitude"
                  name="longitude"
                  type="number"
                  inputProps={{ step: 'any' }}
                  value={locationFormik.values.longitude}
                  onChange={locationFormik.handleChange}
                  error={locationFormik.touched.longitude && Boolean(locationFormik.errors.longitude)}
                  helperText={locationFormik.touched.longitude && locationFormik.errors.longitude}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Radius (meters)"
                  name="radius"
                  type="number"
                  value={locationFormik.values.radius}
                  onChange={locationFormik.handleChange}
                  error={locationFormik.touched.radius && Boolean(locationFormik.errors.radius)}
                                   helperText={locationFormik.touched.radius && locationFormik.errors.radius}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">m</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  multiline
                  rows={2}
                  value={locationFormik.values.address}
                  onChange={locationFormik.handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={locationFormik.values.isPrimary}
                      onChange={locationFormik.handleChange}
                      name="isPrimary"
                      color="primary"
                    />
                  }
                  label="Primary Location"
                />
                <Typography variant="caption" color="text.secondary" display="block">
                  Set as primary location for access control
                </Typography>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenLocationDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained" className="bg-blue-600 hover:bg-blue-700">
              {editingLocation ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Notification Settings Section */}
      <Paper className="p-6 mt-6 shadow-md">
        <Typography variant="h6" className="font-semibold mb-4 flex items-center">
          <Notifications className="mr-2" />
          Notification Settings
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formik.values.notifyFailedAttempts}
                  onChange={formik.handleChange}
                  name="notifyFailedAttempts"
                  color="primary"
                />
              }
              label="Notify on Failed Login Attempts"
            />
            <Typography variant="caption" color="text.secondary" display="block">
              Send alerts when users fail to login multiple times
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formik.values.notifySuspiciousActivity}
                  onChange={formik.handleChange}
                  name="notifySuspiciousActivity"
                  color="primary"
                />
              }
              label="Notify on Suspicious Activity"
            />
            <Typography variant="caption" color="text.secondary" display="block">
              Alert admins about potential security threats
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formik.values.notifyAdminOnAccess}
                  onChange={formik.handleChange}
                  name="notifyAdminOnAccess"
                  color="primary"
                />
              }
              label="Notify Admins on High-Risk Access"
            />
            <Typography variant="caption" color="text.secondary" display="block">
              Send notifications when sensitive files are accessed
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formik.values.emailNotifications}
                  onChange={formik.handleChange}
                  name="emailNotifications"
                  color="primary"
                />
              }
              label="Enable Email Notifications"
            />
            <Typography variant="caption" color="text.secondary" display="block">
              Receive notifications via email
            </Typography>
          </Grid>
        </Grid>

        <Box className="mt-6">
          <Typography variant="subtitle1" className="font-semibold mb-2">
            Test Notifications
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Notifications />}
            onClick={() => toast.info('Test notification sent!')}
          >
            Send Test Notification
          </Button>
        </Box>
      </Paper>

      {/* Security Audit Log */}
      <Paper className="p-6 mt-6 shadow-md">
        <Typography variant="h6" className="font-semibold mb-4 flex items-center">
          <Security className="mr-2" />
          Security Audit Log
        </Typography>
        
        <List className="border border-gray-200 rounded-lg">
          <ListItem>
            <ListItemText 
              primary="Settings Last Updated" 
              secondary="January 15, 2024 at 14:30"
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText 
              primary="Last Security Scan" 
              secondary="Today at 03:00 AM"
              secondaryTypographyProps={{ className: 'text-green-600' }}
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText 
              primary="Failed Login Attempts (24h)" 
              secondary="3 attempts"
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText 
              primary="Active Security Policies" 
              secondary="12 policies enabled"
            />
          </ListItem>
        </List>

        <Box className="flex justify-end mt-4">
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => toast.info('Audit log refreshed')}
          >
            Refresh Log
          </Button>
          <Button
            variant="outlined"
            startIcon={<Storage />}
            onClick={() => toast.info('Export started')}
            className="ml-2"
          >
            Export Log
          </Button>
        </Box>
      </Paper>

      {/* System Status */}
      <Paper className="p-6 mt-6 shadow-md">
        <Box className="flex justify-between items-center mb-4">
          <Typography variant="h6" className="font-semibold flex items-center">
            <VerifiedUser className="mr-2" />
            System Status
          </Typography>
          <Chip label="All Systems Operational" color="success" icon={<VerifiedUser />} />
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Box className="text-center p-3 border border-gray-200 rounded-lg">
              <Wifi className="text-green-500 mb-2" />
              <Typography variant="body2" className="font-medium">WiFi Verification</Typography>
              <Typography variant="caption" color="text.secondary">Active</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box className="text-center p-3 border border-gray-200 rounded-lg">
              <LocationOn className="text-green-500 mb-2" />
              <Typography variant="body2" className="font-medium">Geofencing</Typography>
              <Typography variant="caption" color="text.secondary">Active</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box className="text-center p-3 border border-gray-200 rounded-lg">
              <VerifiedUser className="text-green-500 mb-2" />
              <Typography variant="body2" className="font-medium">AI Monitoring</Typography>
              <Typography variant="caption" color="text.secondary">Active</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box className="text-center p-3 border border-gray-200 rounded-lg">
              <Lock className="text-green-500 mb-2" />
              <Typography variant="body2" className="font-medium">Encryption</Typography>
              <Typography variant="caption" color="text.secondary">Kyber-1024</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default AdminSettings;