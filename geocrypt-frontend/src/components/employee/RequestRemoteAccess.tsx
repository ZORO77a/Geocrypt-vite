import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  GridLegacy as Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  RadioGroup,
  Radio,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import {
  LocationOn,
  Wifi,
  Security,
  CheckCircle,
  Cancel,
  Warning,
  Info,
  Schedule,
  Lock,
  Public,
  // Send removed (unused)
  ArrowBack,
  Refresh,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

const steps = ['Select Files', 'Access Details', 'Review & Submit'];

const RequestRemoteAccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  const [currentWifi, setCurrentWifi] = useState<string | null>(null);

  // Mock files from location state
  const [selectedFiles, setSelectedFiles] = useState<any[]>(() => {
    const state = location.state as { fileName?: string; fileId?: string };
    return state?.fileName ? [{
      id: state.fileId || 'temp-001',
      name: state.fileName,
      type: 'file',
      encrypted: true,
      locationRestricted: true,
      wifiRestricted: true,
    }] : [];
  });

  // Mock available files
  const [availableFiles, _setAvailableFiles] = useState([
    {
      id: 'file-001',
      name: 'Project Proposal.pdf',
      type: 'file',
      encrypted: true,
      locationRestricted: true,
      wifiRestricted: true,
      accessible: false,
    },
    {
      id: 'file-002',
      name: 'Financial Reports',
      type: 'folder',
      encrypted: true,
      locationRestricted: true,
      wifiRestricted: false,
      accessible: false,
    },
    {
      id: 'file-003',
      name: 'Client Contracts.docx',
      type: 'file',
      encrypted: true,
      locationRestricted: true,
      wifiRestricted: true,
      accessible: false,
    },
    {
      id: 'file-004',
      name: 'Marketing Materials',
      type: 'folder',
      encrypted: false,
      locationRestricted: false,
      wifiRestricted: false,
      accessible: true,
    },
  ]);

  // Formik for access request
  const formik = useFormik({
    initialValues: {
      accessType: 'temporary',
      duration: '24',
      startTime: '',
      endTime: '',
      reason: '',
      emergencyAccess: false,
      notifyAdmins: true,
    },
    validationSchema: Yup.object({
      accessType: Yup.string().required('Required'),
      duration: Yup.string().required('Required'),
      reason: Yup.string().required('Reason is required').min(10, 'Please provide more details'),
      startTime: Yup.string().when('accessType', (accessType: any, schema: any) =>
        accessType === 'scheduled' ? schema.required('Start time is required for scheduled access') : schema
      ),
      endTime: Yup.string().when('accessType', (accessType: any, schema: any) =>
        accessType === 'scheduled' ? schema.required('End time is required for scheduled access') : schema
      ),
    }),
    onSubmit: async (_values) => {
      setSubmitting(true);
      try {
        // TODO: Implement API call
        setTimeout(() => {
          toast.success('Access request submitted successfully!');
          setSubmitting(false);
          setOpenConfirmDialog(false);
          navigate('/employee/files');
        }, 2000);
      } catch (error: any) {
        toast.error(error.message || 'Failed to submit request');
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    // Simulate getting current location and WiFi
    setLoading(true);
    setTimeout(() => {
      setCurrentLocation('Home Office (Unauthorized)');
      setCurrentWifi('Home-WiFi (Unauthorized)');
      setLoading(false);
    }, 1000);
  }, []);

  const handleNext = () => {
    if (activeStep === 0 && selectedFiles.length === 0) {
      toast.error('Please select at least one file');
      return;
    }
    
    if (activeStep === 1 && !formik.isValid) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (activeStep === steps.length - 1) {
      setOpenConfirmDialog(true);
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleFileSelect = (file: any) => {
    const isSelected = selectedFiles.some(f => f.id === file.id);
    if (isSelected) {
      setSelectedFiles(selectedFiles.filter(f => f.id !== file.id));
    } else {
      setSelectedFiles([...selectedFiles, file]);
    }
  };

  const handleDetectLocation = () => {
    setLoading(true);
    toast.info('Detecting your location...');
    setTimeout(() => {
      setCurrentLocation('Home Office (GPS: 12.9716, 77.5946)');
      setLoading(false);
      toast.success('Location detected successfully');
    }, 1500);
  };

  const getAccessTypeDescription = (type: string) => {
    switch (type) {
      case 'temporary':
        return 'One-time access for a specified duration';
      case 'scheduled':
        return 'Access during specific time windows';
      case 'emergency':
        return 'Immediate access with admin notification';
      default:
        return '';
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Container maxWidth="lg" className="py-6">
      {/* Header */}
      <Paper className="p-6 mb-6 shadow-md">
        <Box className="flex items-center mb-4">
          <Security className="text-4xl text-blue-600 mr-3" />
          <Box>
            <Typography variant="h4" className="font-bold text-gray-900">
              Request Remote Access
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Request access to location-restricted files from your current location
            </Typography>
          </Box>
        </Box>

        {/* Current Status */}
        <Alert 
          severity="warning" 
          icon={<Warning />}
          className="mb-4"
        >
          <Typography variant="body2">
            <strong>Access Restricted:</strong> You are currently at an unauthorized location and cannot access selected files.
          </Typography>
        </Alert>

        <Grid container spacing={2} className="mb-4">
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Box className="flex items-center">
                  <LocationOn className="text-red-600 mr-2" />
                  <Box>
                    <Typography variant="subtitle2" className="font-semibold">
                      Current Location
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      {currentLocation || 'Detecting...'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Box className="flex items-center">
                  <Wifi className="text-red-600 mr-2" />
                  <Box>
                    <Typography variant="subtitle2" className="font-semibold">
                      Current WiFi Network
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      {currentWifi || 'Detecting...'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleDetectLocation}
          disabled={loading}
        >
          Refresh Location & Network
        </Button>
      </Paper>

      {/* Stepper */}
      <Stepper activeStep={activeStep} orientation="vertical" className="mb-6">
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
            <StepContent>
              {index === 0 && (
                <Box className="mt-4">
                  <Typography variant="subtitle1" className="font-semibold mb-3">
                    Select Files for Remote Access
                  </Typography>
                  <Grid container spacing={2}>
                    {availableFiles.map((file) => {
                      const isSelected = selectedFiles.some(f => f.id === file.id);
                      return (
                        <Grid item xs={12} md={6} key={file.id}>
                          <Card
                            variant="outlined"
                            className={`cursor-pointer transition-all ${
                              isSelected ? 'border-blue-500 border-2 bg-blue-50' : ''
                            } ${file.accessible ? 'opacity-50' : ''}`}
                            onClick={() => !file.accessible && handleFileSelect(file)}
                          >
                            <CardContent>
                              <Box className="flex justify-between items-center">
                                <Box>
                                  <Typography variant="subtitle1" className="font-medium">
                                    {file.name}
                                  </Typography>
                                  <Box className="flex gap-1 mt-1">
                                    {file.encrypted && (
                                      <Chip label="Encrypted" size="small" color="success" />
                                    )}
                                    {file.locationRestricted && (
                                      <Chip label="Location Locked" size="small" color="warning" />
                                    )}
                                    {file.wifiRestricted && (
                                      <Chip label="WiFi Locked" size="small" color="info" />
                                    )}
                                  </Box>
                                </Box>
                                <Box>
                                  {isSelected ? (
                                    <CheckCircle className="text-green-600" />
                                  ) : file.accessible ? (
                                    <Public className="text-gray-400" />
                                  ) : (
                                    <Lock className="text-red-600" />
                                  )}
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                  
                  {selectedFiles.length > 0 && (
                    <Box className="mt-4">
                      <Typography variant="subtitle2" className="font-semibold mb-2">
                        Selected Files ({selectedFiles.length})
                      </Typography>
                      <List dense>
                        {selectedFiles.map((file) => (
                          <ListItem key={file.id}>
                            <ListItemIcon>
                              {file.encrypted ? (
                                <Lock fontSize="small" />
                              ) : (
                                <Public fontSize="small" />
                              )}
                            </ListItemIcon>
                            <ListItemText primary={file.name} />
                            <IconButton
                              size="small"
                              onClick={() => handleFileSelect(file)}
                            >
                              <Cancel fontSize="small" />
                            </IconButton>
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </Box>
              )}

              {index === 1 && (
                <Box className="mt-4">
                  <Typography variant="subtitle1" className="font-semibold mb-3">
                    Configure Access Details
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <FormControl component="fieldset">
                        <Typography variant="subtitle2" className="font-semibold mb-2">
                          Access Type
                        </Typography>
                        <RadioGroup
                          name="accessType"
                          value={formik.values.accessType}
                          onChange={formik.handleChange}
                        >
                          <FormControlLabel
                            value="temporary"
                            control={<Radio />}
                            label={
                              <Box>
                                <Typography variant="body2" className="font-medium">
                                  Temporary Access
                                </Typography>
                                <Typography variant="caption" className="text-gray-600">
                                  One-time access for a specified duration
                                </Typography>
                              </Box>
                            }
                          />
                          <FormControlLabel
                            value="scheduled"
                            control={<Radio />}
                            label={
                              <Box>
                                <Typography variant="body2" className="font-medium">
                                  Scheduled Access
                                </Typography>
                                <Typography variant="caption" className="text-gray-600">
                                  Access during specific time windows
                                </Typography>
                              </Box>
                            }
                          />
                          <FormControlLabel
                            value="emergency"
                            control={<Radio />}
                            label={
                              <Box>
                                <Typography variant="body2" className="font-medium">
                                  Emergency Access
                                </Typography>
                                <Typography variant="caption" className="text-gray-600">
                                  Immediate access with admin notification
                                </Typography>
                              </Box>
                            }
                          />
                        </RadioGroup>
                      </FormControl>
                    </Grid>

                    {formik.values.accessType === 'temporary' && (
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Access Duration</InputLabel>
                          <Select
                            name="duration"
                            value={formik.values.duration}
                            onChange={formik.handleChange}
                            label="Access Duration"
                          >
                            <MenuItem value="1">1 hour</MenuItem>
                            <MenuItem value="4">4 hours</MenuItem>
                            <MenuItem value="8">8 hours</MenuItem>
                            <MenuItem value="24">24 hours</MenuItem>
                            <MenuItem value="72">3 days</MenuItem>
                            <MenuItem value="168">1 week</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    )}

                    {formik.values.accessType === 'scheduled' && (
                      <>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Start Date & Time"
                            name="startTime"
                            type="datetime-local"
                            value={formik.values.startTime}
                            onChange={formik.handleChange}
                            error={formik.touched.startTime && Boolean(formik.errors.startTime)}
                            helperText={formik.touched.startTime && formik.errors.startTime}
                            InputLabelProps={{ shrink: true }}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="End Date & Time"
                            name="endTime"
                            type="datetime-local"
                            value={formik.values.endTime}
                            onChange={formik.handleChange}
                            error={formik.touched.endTime && Boolean(formik.errors.endTime)}
                            helperText={formik.touched.endTime && formik.errors.endTime}
                            InputLabelProps={{ shrink: true }}
                          />
                        </Grid>
                      </>
                    )}

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Reason for Access"
                        name="reason"
                        multiline
                        rows={4}
                        placeholder="Please explain why you need access from your current location..."
                        value={formik.values.reason}
                        onChange={formik.handleChange}
                        error={formik.touched.reason && Boolean(formik.errors.reason)}
                        helperText={formik.touched.reason && formik.errors.reason}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formik.values.emergencyAccess}
                            onChange={formik.handleChange}
                            name="emergencyAccess"
                            color="warning"
                          />
                        }
                        label="Emergency Access Request"
                      />
                      <Typography variant="caption" color="text.secondary" display="block">
                        Check this if you need immediate access for critical business needs
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formik.values.notifyAdmins}
                            onChange={formik.handleChange}
                            name="notifyAdmins"
                            color="primary"
                          />
                        }
                        label="Notify Administrators"
                      />
                      <Typography variant="caption" color="text.secondary" display="block">
                        Send notifications to system administrators about this request
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {index === 2 && (
                <Box className="mt-4">
                  <Typography variant="subtitle1" className="font-semibold mb-3">
                    Review Your Request
                  </Typography>
                  
                  <Paper className="p-4 mb-4">
                    <Typography variant="subtitle2" className="font-semibold mb-2">
                      Request Summary
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemText 
                          primary="Selected Files" 
                          secondary={selectedFiles.map(f => f.name).join(', ')}
                        />
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemText 
                          primary="Access Type" 
                          secondary={`${formik.values.accessType} (${getAccessTypeDescription(formik.values.accessType)})`}
                        />
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemText 
                          primary="Duration" 
                          secondary={
                            formik.values.accessType === 'temporary' 
                              ? `${formik.values.duration} hours`
                              : formik.values.accessType === 'scheduled'
                              ? `${formik.values.startTime} to ${formik.values.endTime}`
                              : 'Immediate (Emergency)'
                          }
                        />
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemText 
                          primary="Current Location" 
                          secondary={currentLocation}
                        />
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemText 
                          primary="Reason" 
                          secondary={formik.values.reason}
                        />
                      </ListItem>
                    </List>
                  </Paper>

                  <Alert severity="info">
                    <Typography variant="body2">
                      <strong>Note:</strong> Your request will be reviewed by system administrators.
                      You will receive a notification once it's approved or denied.
                      Emergency requests are prioritized for review.
                    </Typography>
                  </Alert>
                </Box>
              )}

              <Box className="mt-4">
                <Button
                  variant="contained"
                  onClick={handleNext}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {activeStep === steps.length - 1 ? 'Submit Request' : 'Continue'}
                </Button>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  className="ml-2"
                >
                  Back
                </Button>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>

      {/* Confirmation Dialog */}
      <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
        <DialogTitle>Confirm Access Request</DialogTitle>
        <DialogContent>
          <Alert severity="warning" className="mb-3">
            <Typography variant="body2">
              You are requesting access to {selectedFiles.length} file(s) from an unauthorized location.
            </Typography>
          </Alert>
          
          <Typography variant="body2" className="mb-2">
            <strong>Files:</strong> {selectedFiles.map(f => f.name).join(', ')}
          </Typography>
          <Typography variant="body2" className="mb-2">
            <strong>Access Type:</strong> {formik.values.accessType}
          </Typography>
          <Typography variant="body2">
            <strong>Reason:</strong> {formik.values.reason}
          </Typography>
          
          <Alert severity="info" className="mt-3">
            <Typography variant="body2">
              Administrators will be notified of this request. You may be contacted for additional verification.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)}>Cancel</Button>
          <Button
            onClick={() => formik.handleSubmit()}
            variant="contained"
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {submitting ? 'Submitting...' : 'Confirm Request'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Quick Actions */}
      <Paper className="p-6 mt-6">
        <Typography variant="h6" className="font-semibold mb-4">
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate('/employee/files')}
            >
              Back to File Browser
            </Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Schedule />}
              onClick={() => navigate('/employee/access-history')}
            >
              View Access History
            </Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Info />}
              onClick={() => toast.info('Help information would appear here')}
            >
              Help & Support
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default RequestRemoteAccess;