import React, { useState, useEffect } from 'react';
import {
  Container,
  GridLegacy as Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Folder,
  Lock,
  LockOpen,
  AccessTime,
  LocationOn,
  Wifi,
  Security,
  Warning,
  Refresh,
  Download,
  Visibility,
  RequestQuote,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [accessStatus, setAccessStatus] = useState({
    location: false,
    wifi: false,
    time: false,
    remoteAccess: false,
  });
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [openFileDialog, setOpenFileDialog] = useState(false);

  useEffect(() => {
    checkAccessConditions();
    fetchFiles();
    
    // Check conditions every 30 seconds
    const interval = setInterval(checkAccessConditions, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkAccessConditions = () => {
    const now = new Date();
    const currentHour = now.getHours();

    // Mock conditions
    const mockConditions = {
      location: Math.random() > 0.3, // 70% chance of being in location
      wifi: Math.random() > 0.4, // 60% chance of being on correct WiFi
      time: currentHour >= 9 && currentHour < 17, // 9 AM - 5 PM
      remoteAccess: user?.remoteAccess || false,
    };

    setAccessStatus(mockConditions);
  };

  const fetchFiles = async () => {
    setLoading(true);
    // Mock files data
    const mockFiles = [
      {
        id: 'file-001',
        name: 'Project Requirements.pdf',
        size: 2456789,
        type: 'pdf',
        encrypted: true,
        encryptionType: 'postquantum',
        createdAt: new Date('2024-01-10'),
        modifiedAt: new Date('2024-01-14'),
        tags: ['project', 'document'],
      },
      {
        id: 'file-002',
        name: 'Design Specifications.docx',
        size: 1896543,
        type: 'docx',
        encrypted: true,
        encryptionType: 'postquantum',
        createdAt: new Date('2024-01-12'),
        modifiedAt: new Date('2024-01-15'),
        tags: ['design', 'specs'],
      },
      {
        id: 'file-003',
        name: 'Meeting Notes.txt',
        size: 45678,
        type: 'txt',
        encrypted: false,
        encryptionType: 'none',
        createdAt: new Date('2024-01-15'),
        modifiedAt: new Date('2024-01-15'),
        tags: ['meeting', 'notes'],
      },
      {
        id: 'file-004',
        name: 'Financial Report.xlsx',
        size: 3456789,
        type: 'xlsx',
        encrypted: true,
        encryptionType: 'postquantum',
        createdAt: new Date('2024-01-05'),
        modifiedAt: new Date('2024-01-13'),
        tags: ['financial', 'confidential'],
      },
    ];

    setTimeout(() => {
      setFiles(mockFiles);
      setLoading(false);
    }, 1000);
  };

  const canAccessFiles = () => {
    return accessStatus.remoteAccess || 
           (accessStatus.location && accessStatus.wifi && accessStatus.time);
  };

  const handleFileAccess = (file: any) => {
    if (!canAccessFiles()) {
      toast.error('Access denied. Please check access conditions.');
      return;
    }

    if (file.encrypted) {
      // Simulate decryption
      toast.info(`Decrypting ${file.name}...`);
      setTimeout(() => {
        toast.success('File decrypted successfully!');
        setSelectedFile(file);
        setOpenFileDialog(true);
      }, 1500);
    } else {
      setSelectedFile(file);
      setOpenFileDialog(true);
    }
  };

  const handleDownload = () => {
    toast.success(`Downloading ${selectedFile?.name}...`);
    setOpenFileDialog(false);
  };

  const handleRequestRemoteAccess = () => {
    // Navigate to request page
    window.location.href = '/employee/request-access';
  };

  return (
    <Box className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100">
      {/* Welcome Header */}
      <Paper className="p-6 mb-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-none shadow-lg">
        <Container maxWidth="xl">
          <Box className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <Box>
              <Typography variant="h4" className="font-bold mb-2">
                Employee Dashboard
              </Typography>
              <Typography variant="body1" className="opacity-90">
                Welcome back, {user?.name}! Secure access to encrypted files.
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<RequestQuote />}
              onClick={handleRequestRemoteAccess}
              className="bg-white text-blue-600 hover:bg-gray-100 shadow-md"
            >
              Request Remote Access
            </Button>
          </Box>
        </Container>
      </Paper>

      <Container maxWidth="xl">
        {/* Access Status */}
        <Paper className="p-6 mb-8 shadow-md border border-gray-200">
          <Typography variant="h6" className="font-semibold mb-4">
            Access Conditions Status
          </Typography>
          
          <Grid container spacing={3} className="mb-6">
            <Grid item xs={12} sm={6} md={3}>
              <Card className={`border ${accessStatus.location ? 'border-green-200' : 'border-red-200'}`}>
                <CardContent className="text-center">
                  <LocationOn className={`text-4xl mb-2 ${accessStatus.location ? 'text-green-600' : 'text-red-600'}`} />
                  <Typography variant="body1" className="font-medium">
                    Location
                  </Typography>
                  <Chip
                    label={accessStatus.location ? "Verified" : "Not Verified"}
                    color={accessStatus.location ? "success" : "error"}
                    size="small"
                    className="mt-2"
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card className={`border ${accessStatus.wifi ? 'border-green-200' : 'border-red-200'}`}>
                <CardContent className="text-center">
                  <Wifi className={`text-4xl mb-2 ${accessStatus.wifi ? 'text-green-600' : 'text-red-600'}`} />
                  <Typography variant="body1" className="font-medium">
                    WiFi Network
                  </Typography>
                  <Chip
                    label={accessStatus.wifi ? "Connected" : "Not Connected"}
                    color={accessStatus.wifi ? "success" : "error"}
                    size="small"
                    className="mt-2"
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card className={`border ${accessStatus.time ? 'border-green-200' : 'border-red-200'}`}>
                <CardContent className="text-center">
                  <AccessTime className={`text-4xl mb-2 ${accessStatus.time ? 'text-green-600' : 'text-red-600'}`} />
                  <Typography variant="body1" className="font-medium">
                    Time Window
                  </Typography>
                  <Chip
                    label={accessStatus.time ? "Within Hours" : "Outside Hours"}
                    color={accessStatus.time ? "success" : "error"}
                    size="small"
                    className="mt-2"
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card className={`border ${accessStatus.remoteAccess ? 'border-blue-200' : 'border-gray-200'}`}>
                <CardContent className="text-center">
                  <Security className={`text-4xl mb-2 ${accessStatus.remoteAccess ? 'text-blue-600' : 'text-gray-400'}`} />
                  <Typography variant="body1" className="font-medium">
                    Remote Access
                  </Typography>
                  <Chip
                    label={accessStatus.remoteAccess ? "Approved" : "Not Approved"}
                    color={accessStatus.remoteAccess ? "primary" : "default"}
                    size="small"
                    className="mt-2"
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Access Alert */}
          {!canAccessFiles() && (
            <Alert 
              severity="warning" 
              icon={<Warning />}
              className="mb-4"
            >
              <Typography variant="body1" className="font-medium mb-2">
                You cannot access files at the moment. Please ensure:
              </Typography>
              <ul className="list-disc pl-5 space-y-1">
                <li>You are at the authorized location</li>
                <li>Connected to company WiFi</li>
                <li>Accessing during working hours (9AM-5PM)</li>
                <li>Or request remote access from admin</li>
              </ul>
              <Box className="mt-3 flex gap-2">
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleRequestRemoteAccess}
                >
                  Request Remote Access
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Refresh />}
                  onClick={checkAccessConditions}
                >
                  Re-check Conditions
                </Button>
              </Box>
            </Alert>
          )}

          {canAccessFiles() && (
            <Alert severity="success" icon={<LockOpen />}>
              <Typography variant="body1" className="font-medium">
                ✓ All access conditions satisfied. You can now access encrypted files.
              </Typography>
            </Alert>
          )}
        </Paper>

        {/* Files Section */}
        <Paper className="p-6 shadow-md border border-gray-200">
          <Box className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <Box>
              <Typography variant="h6" className="font-semibold">
                Encrypted Files
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Access files securely with Post-Quantum Cryptography
              </Typography>
            </Box>
            <Box className="flex gap-2">
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchFiles}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<Folder />}
                disabled={!canAccessFiles()}
                onClick={() => toast.info('Upload feature coming soon')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Upload File
              </Button>
            </Box>
          </Box>

          {loading ? (
            <LinearProgress />
          ) : files.length === 0 ? (
            <Alert severity="info">
              No files available. Upload your first file!
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {files.map((file) => (
                <Grid item xs={12} sm={6} md={4} key={file.id}>
                  <Card className="hover:shadow-lg transition-shadow duration-300 border border-gray-200">
                    <CardContent>
                      <Box className="flex items-center justify-between mb-3">
                        <Box className="flex items-center">
                          {file.encrypted ? (
                            <Lock className="text-red-500 mr-2" />
                          ) : (
                            <LockOpen className="text-green-500 mr-2" />
                          )}
                          <Typography variant="h6" className="font-medium">
                            {file.name}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => handleFileAccess(file)}
                          disabled={!canAccessFiles()}
                          title={canAccessFiles() ? "Access file" : "Access denied"}
                        >
                          <Visibility />
                        </IconButton>
                      </Box>
                      
                      <Box className="space-y-2">
                        <Typography variant="body2" className="text-gray-600">
                          Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                        </Typography>
                        
                        <Typography variant="body2" className="text-gray-600">
                          Type: {file.type.toUpperCase()}
                        </Typography>
                        
                        <Typography variant="body2" className="text-gray-600">
                          Modified: {format(new Date(file.modifiedAt), 'MMM dd, yyyy')}
                        </Typography>
                        
                        {file.encrypted && (
                          <Chip
                            label="Post-Quantum Encrypted"
                            size="small"
                            color="primary"
                            variant="outlined"
                            icon={<Security fontSize="small" />}
                          />
                        )}
                        
                        <Box className="flex gap-1 flex-wrap">
                          {file.tags.map((tag: string, index: number) => (
                            <Chip
                              key={index}
                              label={tag}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Box>
                      
                      <Button
                        fullWidth
                        variant="contained"
                        disabled={!canAccessFiles()}
                        onClick={() => handleFileAccess(file)}
                        startIcon={canAccessFiles() ? <LockOpen /> : <Lock />}
                        className={`mt-4 ${canAccessFiles() 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-gray-400'}`}
                      >
                        {canAccessFiles() ? 'Access File' : 'Access Denied'}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>

        {/* Quick Stats */}
        <Grid container spacing={3} className="mt-6">
          <Grid item xs={12} md={6}>
            <Paper className="p-4 border border-gray-200">
              <Typography variant="subtitle1" className="font-medium mb-2">
                📊 Your Activity
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box className="text-center">
                    <Typography variant="h6" className="font-bold text-blue-600">
                      12
                    </Typography>
                    <Typography variant="caption" className="text-gray-600">
                      Files Accessed
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box className="text-center">
                    <Typography variant="h6" className="font-bold text-green-600">
                      8
                    </Typography>
                    <Typography variant="caption" className="text-gray-600">
                      Successful Decryptions
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper className="p-4 border border-gray-200">
              <Typography variant="subtitle1" className="font-medium mb-2">
                ⚙️ Security Status
              </Typography>
              <Box className="space-y-2">
                <Box className="flex justify-between items-center">
                  <Typography variant="body2">AI Monitoring</Typography>
                  <Chip label="Active" size="small" color="success" />
                </Box>
                <Box className="flex justify-between items-center">
                  <Typography variant="body2">Behavior Analysis</Typography>
                  <Chip label="Normal" size="small" color="success" />
                </Box>
                <Box className="flex justify-between items-center">
                  <Typography variant="body2">Last Security Check</Typography>
                  <Typography variant="caption">Just now</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* File Access Dialog */}
      <Dialog open={openFileDialog} onClose={() => setOpenFileDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box className="flex items-center">
            <Folder className="mr-2" />
            {selectedFile?.name}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedFile && (
            <Box className="space-y-4 py-4">
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" className="text-gray-600">
                    File Type
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {selectedFile.type.toUpperCase()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" className="text-gray-600">
                    Size
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" className="text-gray-600">
                    Created
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {format(new Date(selectedFile.createdAt), 'MMM dd, yyyy')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" className="text-gray-600">
                    Modified
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {format(new Date(selectedFile.modifiedAt), 'MMM dd, yyyy')}
                  </Typography>
                </Grid>
              </Grid>
              
              {selectedFile.encrypted && (
                <Alert severity="success" icon={<LockOpen />}>
                  <Typography variant="body2">
                    File successfully decrypted using Post-Quantum Cryptography
                  </Typography>
                </Alert>
              )}
              
              <Alert severity="info">
                <Typography variant="body2">
                  This access has been logged and is being monitored by AI security systems.
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFileDialog(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleDownload}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeDashboard;