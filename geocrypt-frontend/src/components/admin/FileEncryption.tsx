import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  GridLegacy as Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Lock,
  LockOpen,
  Security,
  Refresh,
  Download,
  Delete,
  Visibility,
  Key,
  CloudUpload,
  Folder,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const FileEncryption: React.FC = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [openEncryptDialog, setOpenEncryptDialog] = useState(false);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [encrypting, setEncrypting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [encryptionType, setEncryptionType] = useState('postquantum');
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

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
        algorithm: 'Kyber-1024',
        createdAt: new Date('2024-01-10'),
        modifiedAt: new Date('2024-01-14'),
        owner: 'Admin',
        status: 'encrypted',
      },
      {
        id: 'file-002',
        name: 'Design Specifications.docx',
        size: 1896543,
        type: 'docx',
        encrypted: true,
        encryptionType: 'postquantum',
        algorithm: 'Kyber-768',
        createdAt: new Date('2024-01-12'),
        modifiedAt: new Date('2024-01-15'),
        owner: 'Admin',
        status: 'encrypted',
      },
      {
        id: 'file-003',
        name: 'Meeting Notes.txt',
        size: 45678,
        type: 'txt',
        encrypted: false,
        encryptionType: 'none',
        algorithm: 'None',
        createdAt: new Date('2024-01-15'),
        modifiedAt: new Date('2024-01-15'),
        owner: 'John Doe',
        status: 'unencrypted',
      },
      {
        id: 'file-004',
        name: 'Financial Report.xlsx',
        size: 3456789,
        type: 'xlsx',
        encrypted: true,
        encryptionType: 'postquantum',
        algorithm: 'Kyber-1024',
        createdAt: new Date('2024-01-05'),
        modifiedAt: new Date('2024-01-13'),
        owner: 'Admin',
        status: 'encrypted',
      },
      {
        id: 'file-005',
        name: 'Client Database.sql',
        size: 56789012,
        type: 'sql',
        encrypted: false,
        encryptionType: 'none',
        algorithm: 'None',
        createdAt: new Date('2024-01-08'),
        modifiedAt: new Date('2024-01-08'),
        owner: 'Admin',
        status: 'unencrypted',
      },
    ];

    setTimeout(() => {
      setFiles(mockFiles);
      setLoading(false);
    }, 1000);
  };

  const handleEncryptFile = (file: any) => {
    setSelectedFile(file);
    setOpenEncryptDialog(true);
  };

  const handleDecryptFile = async (file: any) => {
    setEncrypting(true);
    // Simulate decryption
    setTimeout(() => {
      toast.success(`File "${file.name}" decrypted successfully`);
      setEncrypting(false);
      fetchFiles();
    }, 2000);
  };

  const handleDeleteFile = (file: any) => {
    if (window.confirm(`Are you sure you want to delete "${file.name}"?`)) {
      toast.success(`File "${file.name}" deleted (demo mode)`);
      fetchFiles();
    }
  };

  const handleEncryptSubmit = async () => {
    setEncrypting(true);
    // Simulate encryption
    setTimeout(() => {
      toast.success(`File "${selectedFile?.name}" encrypted with ${encryptionType === 'postquantum' ? 'Post-Quantum Cryptography' : 'AES-256'}`);
      setEncrypting(false);
      setOpenEncryptDialog(false);
      fetchFiles();
    }, 2000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadFile(file);
      setOpenUploadDialog(true);
    }
  };

  const handleUploadSubmit = async () => {
    if (!uploadFile) return;
    
    setUploading(true);
    // Simulate upload
    setTimeout(() => {
      toast.success(`File "${uploadFile.name}" uploaded successfully`);
      setUploading(false);
      setOpenUploadDialog(false);
      setUploadFile(null);
      fetchFiles();
    }, 2000);
  };

  const stats = {
    total: files.length,
    encrypted: files.filter(f => f.encrypted).length,
    unencrypted: files.filter(f => !f.encrypted).length,
    postQuantum: files.filter(f => f.encryptionType === 'postquantum').length,
  };

  return (
    <Container maxWidth="xl" className="py-6">
      {/* Header */}
      <Paper className="p-6 mb-6 shadow-md">
        <Box className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <Box>
            <Typography variant="h5" className="font-bold text-gray-900">
              File Encryption Management
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Secure files with Post-Quantum Cryptography and manage encryption settings
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
              startIcon={<CloudUpload />}
              component="label"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Upload File
              <input
                type="file"
                hidden
                onChange={handleFileUpload}
              />
            </Button>
          </Box>
        </Box>

        {/* Stats */}
        <Grid container spacing={3} className="mb-6">
          <Grid item xs={6} md={3}>
            <Card className="border border-gray-200">
              <CardContent className="text-center">
                <Folder className="text-4xl text-blue-500 mb-2" />
                <Typography variant="h4" className="font-bold">
                  {stats.total}
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Total Files
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card className="border border-gray-200">
              <CardContent className="text-center">
                <Lock className="text-4xl text-green-500 mb-2" />
                <Typography variant="h4" className="font-bold text-green-600">
                  {stats.encrypted}
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Encrypted
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card className="border border-gray-200">
              <CardContent className="text-center">
                <LockOpen className="text-4xl text-orange-500 mb-2" />
                <Typography variant="h4" className="font-bold text-orange-600">
                  {stats.unencrypted}
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Unencrypted
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card className="border border-gray-200">
              <CardContent className="text-center">
                <Security className="text-4xl text-purple-500 mb-2" />
                <Typography variant="h4" className="font-bold text-purple-600">
                  {stats.postQuantum}
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Post-Quantum
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Encryption Info */}
        <Alert severity="info" className="mb-4">
          <Typography variant="body2">
            <strong>Post-Quantum Cryptography:</strong> Uses quantum-resistant algorithms (Kyber) to protect against future quantum computer attacks.
            All encrypted files are automatically decrypted when access conditions are met.
          </Typography>
        </Alert>
      </Paper>

      {/* Files Table */}
      <Paper className="p-4 shadow-md">
        <Box className="mb-4">
          <Typography variant="h6" className="font-semibold">
            Files
          </Typography>
        </Box>

        {loading ? (
          <LinearProgress />
        ) : files.length === 0 ? (
          <Alert severity="info" className="my-4">
            No files found. Upload your first file!
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>File Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Encryption Status</TableCell>
                  <TableCell>Algorithm</TableCell>
                  <TableCell>Owner</TableCell>
                  <TableCell>Modified</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {files.map((file) => (
                  <TableRow key={file.id} hover>
                    <TableCell>
                      <Box className="flex items-center">
                        <Folder className="text-gray-400 mr-2" />
                        <Typography variant="body2" className="font-medium">
                          {file.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={file.type.toUpperCase()}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={file.encrypted ? <Lock /> : <LockOpen />}
                        label={file.encrypted ? 'Encrypted' : 'Unencrypted'}
                        color={file.encrypted ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={file.algorithm}
                        size="small"
                        color={file.encryptionType === 'postquantum' ? 'primary' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {file.owner}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(file.modifiedAt), 'MMM dd, yyyy')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box className="flex gap-1">
                        <Tooltip title="View details">
                          <IconButton size="small">
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={file.encrypted ? "Decrypt file" : "Encrypt file"}>
                          <IconButton
                            size="small"
                            color={file.encrypted ? "warning" : "primary"}
                            onClick={() => file.encrypted ? handleDecryptFile(file) : handleEncryptFile(file)}
                            disabled={encrypting}
                          >
                            {file.encrypted ? <LockOpen fontSize="small" /> : <Lock fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download">
                          <IconButton size="small">
                            <Download fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteFile(file)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Encryption Dialog */}
      <Dialog open={openEncryptDialog} onClose={() => setOpenEncryptDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box className="flex items-center">
            <Key className="mr-2" />
            Encrypt File
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedFile && (
            <Box className="py-4 space-y-4">
              <Alert severity="info">
                <Typography variant="body2">
                  File: <strong>{selectedFile.name}</strong> ({selectedFile.type.toUpperCase()})
                </Typography>
              </Alert>

              <FormControl fullWidth>
                <InputLabel>Encryption Type</InputLabel>
                <Select
                  value={encryptionType}
                  label="Encryption Type"
                  onChange={(e) => setEncryptionType(e.target.value)}
                >
                  <MenuItem value="postquantum">Post-Quantum Cryptography (Kyber)</MenuItem>
                  <MenuItem value="aes">AES-256 (Standard)</MenuItem>
                </Select>
              </FormControl>

              {encryptionType === 'postquantum' && (
                <FormControl fullWidth>
                  <InputLabel>Algorithm</InputLabel>
                  <Select
                    value="kyber-1024"
                    label="Algorithm"
                  >
                    <MenuItem value="kyber-512">Kyber-512 (Light Security)</MenuItem>
                    <MenuItem value="kyber-768">Kyber-768 (Standard Security)</MenuItem>
                    <MenuItem value="kyber-1024">Kyber-1024 (High Security)</MenuItem>
                  </Select>
                </FormControl>
              )}

              <TextField
                fullWidth
                label="Encryption Key (Optional)"
                type="password"
                helperText="Leave blank to use system-generated key"
              />

              <Alert severity="warning">
                <Typography variant="body2">
                  ⚠️ Once encrypted, the file can only be accessed when all conditions are met (location, WiFi, time).
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEncryptDialog(false)} disabled={encrypting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleEncryptSubmit}
            disabled={encrypting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {encrypting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Encrypt File'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={openUploadDialog} onClose={() => !uploading && setOpenUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box className="flex items-center">
            <CloudUpload className="mr-2" />
            Upload File
          </Box>
        </DialogTitle>
        <DialogContent>
          {uploadFile && (
            <Box className="py-4 space-y-4">
              <Alert severity="info">
                <Typography variant="body2">
                  Uploading: <strong>{uploadFile.name}</strong>
                  <br />
                  Size: {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                </Typography>
              </Alert>

              <FormControl fullWidth>
                <InputLabel>Auto-encrypt on upload</InputLabel>
                <Select
                  value="yes"
                  label="Auto-encrypt on upload"
                >
                  <MenuItem value="yes">Yes, encrypt immediately</MenuItem>
                  <MenuItem value="no">No, keep unencrypted</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Description (Optional)"
                multiline
                rows={2}
              />

              <FormControl fullWidth>
                <InputLabel>Access Permissions</InputLabel>
                <Select
                  multiple
                  value={['employees']}
                  label="Access Permissions"
                >
                  <MenuItem value="admin">Administrators</MenuItem>
                  <MenuItem value="employees">All Employees</MenuItem>
                  <MenuItem value="specific">Specific Departments</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUploadDialog(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUploadSubmit}
            disabled={uploading || !uploadFile}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {uploading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Upload & Encrypt'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Encryption Guidelines */}
      <Paper className="p-6 mt-6 shadow-md border border-blue-200">
        <Typography variant="h6" className="font-semibold mb-4 flex items-center">
          <Security className="mr-2 text-blue-500" />
          Encryption Guidelines
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box className="p-3 bg-blue-50 rounded-lg">
              <Typography variant="subtitle2" className="font-semibold text-blue-700 mb-2">
                Post-Quantum Cryptography
              </Typography>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                <li>Quantum-resistant algorithms (Kyber, NTRU)</li>
                <li>Protects against future quantum computer attacks</li>
                <li>Recommended for highly sensitive data</li>
                <li>Slightly larger file sizes</li>
              </ul>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box className="p-3 bg-green-50 rounded-lg">
              <Typography variant="subtitle2" className="font-semibold text-green-700 mb-2">
                Automatic Decryption
              </Typography>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                <li>Files decrypt automatically when conditions are met</li>
                <li>Location, WiFi, and time verified in real-time</li>
                <li>No manual decryption required for authorized users</li>
                <li>Full audit trail of all decryption events</li>
              </ul>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default FileEncryption;