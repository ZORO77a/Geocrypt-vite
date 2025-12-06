import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  GridLegacy as Grid,
  Avatar,
  TextField,
  Button,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Alert,
  LinearProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  LocationOn,
  Security,
  Edit,
  Save,
  Cancel,
  VerifiedUser,
  AccessTime,
  Wifi,
  Lock,
  Refresh,
  Badge,
  Work,
  CalendarToday,
  CheckCircle,
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

const EmployeeProfile: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  // Mock employee data
  const [employeeData, setEmployeeData] = useState({
    personalInfo: {
      id: 'EMP-2024-001',
      name: 'John Doe',
      email: 'john.doe@company.com',
      phone: '+1 (555) 123-4567',
      department: 'Engineering',
      position: 'Senior Developer',
      hireDate: '2022-03-15',
      avatar: 'JD',
    },
    security: {
      twoFactorEnabled: true,
      lastPasswordChange: '2024-01-01',
      lastLogin: '2024-01-15 09:30',
      failedAttempts: 0,
      locationAccess: true,
      wifiAccess: true,
    },
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      darkMode: false,
      autoLogout: true,
      sessionTimeout: 30,
    },
    accessStats: {
      filesAccessed: 245,
      remoteAccessRequests: 12,
      accessDenied: 3,
      avgSessionTime: '45 min',
      lastLocation: 'Main Office',
      lastWifi: 'Office-WiFi-5G',
    },
  });

  const formik = useFormik({
    initialValues: {
      name: employeeData.personalInfo.name,
      email: employeeData.personalInfo.email,
      phone: employeeData.personalInfo.phone,
      department: employeeData.personalInfo.department,
      position: employeeData.personalInfo.position,
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Required'),
      email: Yup.string().email('Invalid email').required('Required'),
      phone: Yup.string().required('Required'),
      department: Yup.string().required('Required'),
      position: Yup.string().required('Required'),
    }),
    onSubmit: async (values) => {
      setSaving(true);
      try {
        // TODO: Implement API call
        setTimeout(() => {
          setEmployeeData(prev => ({
            ...prev,
            personalInfo: {
              ...prev.personalInfo,
              ...values,
            },
          }));
          toast.success('Profile updated successfully');
          setEditing(false);
          setSaving(false);
        }, 1000);
      } catch (error: any) {
        toast.error(error.message || 'Error updating profile');
        setSaving(false);
      }
    },
  });

  useEffect(() => {
    // Load employee data
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleResetPassword = () => {
    toast.info('Password reset email sent!');
  };

  const handleToggle2FA = () => {
    toast.info('Two-factor authentication settings updated');
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Container maxWidth="lg" className="py-6">
      {/* Header */}
      <Paper className="p-6 mb-6 shadow-md">
        <Box className="flex justify-between items-center mb-6">
          <Box className="flex items-center">
            <Avatar className="bg-blue-600 text-2xl w-20 h-20">
              {employeeData.personalInfo.avatar}
            </Avatar>
            <Box className="ml-4">
              <Typography variant="h4" className="font-bold">
                {employeeData.personalInfo.name}
              </Typography>
              <Typography variant="body1" className="text-gray-600">
                {employeeData.personalInfo.position}
              </Typography>
              <Box className="flex items-center mt-1 space-x-2">
                <Chip label={employeeData.personalInfo.department} size="small" />
                <Chip label="Active" size="small" color="success" />
                <Chip label="Verified" size="small" color="info" icon={<VerifiedUser />} />
              </Box>
            </Box>
          </Box>
          <Box>
            {editing ? (
              <Box className="space-x-2">
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={() => {
                    setEditing(false);
                    formik.resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={() => formik.handleSubmit()}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </Box>
            ) : (
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={() => setEditing(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Edit Profile
              </Button>
            )}
          </Box>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Personal Info" icon={<Person />} iconPosition="start" />
            <Tab label="Security" icon={<Security />} iconPosition="start" />
            <Tab label="Preferences" icon={<Settings />} iconPosition="start" />
            <Tab label="Access Stats" icon={<BarChart />} iconPosition="start" />
          </Tabs>
        </Box>
      </Paper>

      {/* Personal Info Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper className="p-6">
              <Typography variant="h6" className="font-semibold mb-4">
                Personal Information
              </Typography>
              <form>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      error={formik.touched.name && Boolean(formik.errors.name)}
                      helperText={formik.touched.name && formik.errors.name}
                      disabled={!editing}
                      InputProps={{
                        startAdornment: <Person className="mr-2 text-gray-400" />,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      error={formik.touched.email && Boolean(formik.errors.email)}
                      helperText={formik.touched.email && formik.errors.email}
                      disabled={!editing}
                      InputProps={{
                        startAdornment: <Email className="mr-2 text-gray-400" />,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      name="phone"
                      value={formik.values.phone}
                      onChange={formik.handleChange}
                      error={formik.touched.phone && Boolean(formik.errors.phone)}
                      helperText={formik.touched.phone && formik.errors.phone}
                      disabled={!editing}
                      InputProps={{
                        startAdornment: <Phone className="mr-2 text-gray-400" />,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Department"
                      name="department"
                      value={formik.values.department}
                      onChange={formik.handleChange}
                      error={formik.touched.department && Boolean(formik.errors.department)}
                      helperText={formik.touched.department && formik.errors.department}
                      disabled={!editing}
                      InputProps={{
                        startAdornment: <Work className="mr-2 text-gray-400" />,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Position"
                      name="position"
                      value={formik.values.position}
                      onChange={formik.handleChange}
                      error={formik.touched.position && Boolean(formik.errors.position)}
                      helperText={formik.touched.position && formik.errors.position}
                      disabled={!editing}
                    />
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper className="p-6">
              <Typography variant="h6" className="font-semibold mb-4">
                Employee Details
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Badge />
                  </ListItemIcon>
                  <ListItemText primary="Employee ID" secondary={employeeData.personalInfo.id} />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <CalendarToday />
                  </ListItemIcon>
                  <ListItemText primary="Hire Date" secondary={employeeData.personalInfo.hireDate} />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <AccessTime />
                  </ListItemIcon>
                  <ListItemText primary="Last Login" secondary={employeeData.security.lastLogin} />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <LocationOn />
                  </ListItemIcon>
                  <ListItemText primary="Current Location" secondary={employeeData.accessStats.lastLocation} />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <Wifi />
                  </ListItemIcon>
                  <ListItemText primary="Connected WiFi" secondary={employeeData.accessStats.lastWifi} />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Security Tab */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper className="p-6">
              <Typography variant="h6" className="font-semibold mb-4">
                Security Settings
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Security />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Two-Factor Authentication"
                    secondary="Add an extra layer of security to your account"
                  />
                  <Switch
                    checked={employeeData.security.twoFactorEnabled}
                    onChange={handleToggle2FA}
                    color="primary"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <Lock />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Password"
                    secondary="Last changed on 2024-01-01"
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleResetPassword}
                  >
                    Reset
                  </Button>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <LocationOn />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Location Access"
                    secondary="Allow location-based access control"
                  />
                  <Switch
                    checked={employeeData.security.locationAccess}
                    disabled
                    color="primary"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <Wifi />
                  </ListItemIcon>
                  <ListItemText 
                    primary="WiFi Access Control"
                    secondary="Require approved WiFi networks"
                  />
                  <Switch
                    checked={employeeData.security.wifiAccess}
                    disabled
                    color="primary"
                  />
                </ListItem>
              </List>

              <Alert severity="info" className="mt-4">
                <Typography variant="body2">
                  <strong>Security Note:</strong> Some security settings are managed by system administrators.
                  Contact support if you need changes to location or WiFi access controls.
                </Typography>
              </Alert>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper className="p-6">
              <Typography variant="h6" className="font-semibold mb-4">
                Security Status
              </Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Failed Login Attempts"
                    secondary={
                      <Typography className={employeeData.security.failedAttempts > 0 ? 'text-red-600' : 'text-green-600'}>
                        {employeeData.security.failedAttempts} (24h)
                      </Typography>
                    }
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText 
                    primary="Active Sessions"
                    secondary="1 device"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText 
                    primary="Security Score"
                    secondary={
                      <Box className="flex items-center">
                        <Typography className="font-bold text-green-600 mr-2">
                          95/100
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={95} 
                          className="flex-1"
                          color="success"
                        />
                      </Box>
                    }
                  />
                </ListItem>
              </List>

              <Box className="mt-4">
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Refresh />}
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => toast.info('Security status refreshed')}
                >
                  Refresh Security Status
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Preferences Tab */}
      <TabPanel value={tabValue} index={2}>
        <Paper className="p-6">
          <Typography variant="h6" className="font-semibold mb-4">
            Preferences
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={employeeData.preferences.emailNotifications}
                    onChange={() => toast.info('Email notifications updated')}
                    color="primary"
                  />
                }
                label="Email Notifications"
              />
              <Typography variant="caption" color="text.secondary" display="block">
                Receive notifications via email
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={employeeData.preferences.pushNotifications}
                    onChange={() => toast.info('Push notifications updated')}
                    color="primary"
                  />
                }
                label="Push Notifications"
              />
              <Typography variant="caption" color="text.secondary" display="block">
                Receive push notifications in browser
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={employeeData.preferences.darkMode}
                    onChange={() => toast.info('Theme updated')}
                    color="primary"
                  />
                }
                label="Dark Mode"
              />
              <Typography variant="caption" color="text.secondary" display="block">
                Use dark theme interface
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={employeeData.preferences.autoLogout}
                    onChange={() => toast.info('Auto-logout settings updated')}
                    color="primary"
                  />
                }
                label="Auto Logout"
              />
              <Typography variant="caption" color="text.secondary" display="block">
                Automatically log out after {employeeData.preferences.sessionTimeout} minutes of inactivity
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </TabPanel>

      {/* Access Stats Tab */}
      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent className="text-center">
                <Typography variant="h3" className="font-bold text-blue-600">
                  {employeeData.accessStats.filesAccessed}
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Files Accessed
                </Typography>
                <Typography variant="caption" className="text-gray-500">
                  Last 30 days
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent className="text-center">
                <Typography variant="h3" className="font-bold text-green-600">
                  {employeeData.accessStats.remoteAccessRequests}
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Remote Access Requests
                </Typography>
                <Typography variant="caption" className="text-gray-500">
                  Total
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent className="text-center">
                <Typography variant="h3" className="font-bold text-red-600">
                  {employeeData.accessStats.accessDenied}
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Access Denied
                </Typography>
                <Typography variant="caption" className="text-gray-500">
                  Last 30 days
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent className="text-center">
                <Typography variant="h3" className="font-bold text-purple-600">
                  {employeeData.accessStats.avgSessionTime}
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Avg Session Time
                </Typography>
                <Typography variant="caption" className="text-gray-500">
                  Per session
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Paper className="p-6">
              <Typography variant="h6" className="font-semibold mb-4">
                Recent Activity
              </Typography>
              <List>
                {[
                  { action: 'Accessed file', details: 'Project Proposal.pdf', time: '10:30 AM', status: 'success' },
                  { action: 'Requested remote access', details: 'Financial Reports', time: 'Yesterday', status: 'pending' },
                  { action: 'Failed location verification', details: 'Client Contracts', time: '2 days ago', status: 'failed' },
                  { action: 'Downloaded file', details: 'Marketing Plan.docx', time: '3 days ago', status: 'success' },
                ].map((activity, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemIcon>
                        {activity.status === 'success' ? (
                          <CheckCircle className="text-green-600" />
                        ) : activity.status === 'pending' ? (
                          <AccessTime className="text-yellow-600" />
                        ) : (
                          <Cancel className="text-red-600" />
                        )}
                      </ListItemIcon>
                      <ListItemText 
                        primary={activity.action}
                        secondary={`${activity.details} • ${activity.time}`}
                      />
                      <Chip 
                        label={activity.status.toUpperCase()} 
                        size="small" 
                        color={
                          activity.status === 'success' ? 'success' :
                          activity.status === 'pending' ? 'warning' : 'error'
                        }
                      />
                    </ListItem>
                    {index < 3 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>
    </Container>
  );
};

// Add missing import
import { Settings, BarChart } from '@mui/icons-material';

export default EmployeeProfile;