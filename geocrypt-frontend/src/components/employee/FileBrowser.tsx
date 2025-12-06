import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  GridLegacy as Grid,
  Card,
  CardContent,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  LinearProgress,
  Alert,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Folder,
  InsertDriveFile,
  Search,
  MoreVert,
  Download,
  Share,
  Visibility,
  Cancel,
  Refresh,
  Add,
  FolderOpen,
  Lock,
  Public,
  Schedule,
  LocationOn,
  Wifi,
  Person,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size: string;
  modified: string;
  uploadedBy: string;
  permissions: string[];
  encrypted: boolean;
  accessible: boolean;
  locationRestricted: boolean;
  wifiRestricted: boolean;
}

const EmployeeFileBrowser: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    file: FileItem | null;
  }>({ mouseX: 0, mouseY: 0, file: null });
  const [openPreview, setOpenPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [currentPath, setCurrentPath] = useState(['All Files']);

  // Mock data
  useEffect(() => {
    setTimeout(() => {
      setFiles([
        {
          id: '1',
          name: 'Project Proposal',
          type: 'file',
          size: '2.4 MB',
          modified: '2024-01-15',
          uploadedBy: 'John Doe',
          permissions: ['view', 'download'],
          encrypted: true,
          accessible: true,
          locationRestricted: true,
          wifiRestricted: false,
        },
        {
          id: '2',
          name: 'Financial Reports',
          type: 'folder',
          size: '45 MB',
          modified: '2024-01-14',
          uploadedBy: 'Sarah Smith',
          permissions: ['view'],
          encrypted: true,
          accessible: true,
          locationRestricted: true,
          wifiRestricted: true,
        },
        {
          id: '3',
          name: 'Client Contracts',
          type: 'file',
          size: '5.1 MB',
          modified: '2024-01-13',
          uploadedBy: 'Mike Johnson',
          permissions: ['view', 'download', 'share'],
          encrypted: true,
          accessible: false,
          locationRestricted: true,
          wifiRestricted: true,
        },
        {
          id: '4',
          name: 'Marketing Materials',
          type: 'folder',
          size: '120 MB',
          modified: '2024-01-12',
          uploadedBy: 'Emma Wilson',
          permissions: ['view', 'download'],
          encrypted: false,
          accessible: true,
          locationRestricted: false,
          wifiRestricted: false,
        },
        {
          id: '5',
          name: 'Research Data',
          type: 'file',
          size: '15.7 MB',
          modified: '2024-01-11',
          uploadedBy: 'David Brown',
          permissions: ['view'],
          encrypted: true,
          accessible: true,
          locationRestricted: false,
          wifiRestricted: true,
        },
        {
          id: '6',
          name: 'Training Videos',
          type: 'folder',
          size: '2.1 GB',
          modified: '2024-01-10',
          uploadedBy: 'Lisa Taylor',
          permissions: ['view', 'download'],
          encrypted: true,
          accessible: true,
          locationRestricted: true,
          wifiRestricted: true,
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleContextMenu = (event: React.MouseEvent, file: FileItem) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
      file,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu({ mouseX: 0, mouseY: 0, file: null });
  };

  const handleFileClick = (file: FileItem) => {
    if (file.type === 'folder') {
      // Navigate into folder
      setCurrentPath([...currentPath, file.name]);
      toast.info(`Opening ${file.name}`);
    } else {
      setSelectedFile(file);
      setOpenPreview(true);
    }
  };

  const handleDownload = (file: FileItem) => {
    if (!file.permissions.includes('download')) {
      toast.error('You do not have permission to download this file');
      return;
    }
    
    if (!file.accessible) {
      toast.error('File not accessible from your current location/network');
      return;
    }
    
    toast.success(`Downloading ${file.name}...`);
    handleCloseContextMenu();
  };

  const handleShare = (file: FileItem) => {
    if (!file.permissions.includes('share')) {
      toast.error('You do not have permission to share this file');
      return;
    }
    toast.info(`Share options for ${file.name}`);
    handleCloseContextMenu();
  };

  const handleRequestAccess = (file: FileItem) => {
    navigate('/employee/request-remote-access', {
      state: { fileName: file.name, fileId: file.id }
    });
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFileIcon = (file: FileItem) => {
    if (file.type === 'folder') {
      return <Folder className="text-yellow-600" />;
    }
    return <InsertDriveFile className="text-blue-600" />;
  };

  const getAccessIcon = (file: FileItem) => {
    if (!file.accessible) {
      return <Cancel className="text-red-500" />;
    }
    if (file.encrypted) {
      return <Lock className="text-green-600" />;
    }
    return <Public className="text-gray-400" />;
  };

  return (
    <Container maxWidth="xl" className="py-6">
      {/* Header */}
      <Paper className="p-6 mb-6 shadow-md">
        <Box className="flex justify-between items-center mb-4">
          <Box>
            <Typography variant="h5" className="font-bold text-gray-900">
              File Browser
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Access and manage your files with advanced security controls
            </Typography>
          </Box>
          <Box>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => window.location.reload()}
              className="mr-2"
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/files/upload')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Upload File
            </Button>
          </Box>
        </Box>

        {/* Breadcrumbs */}
        <Breadcrumbs className="mb-4">
          {currentPath.map((path, index) => (
            <Link
              key={index}
              color={index === currentPath.length - 1 ? 'textPrimary' : 'inherit'}
              onClick={() => {
                if (index < currentPath.length - 1) {
                  setCurrentPath(currentPath.slice(0, index + 1));
                }
              }}
              className="cursor-pointer"
            >
              {path}
            </Link>
          ))}
        </Breadcrumbs>

        {/* Search and Filters */}
        <Box className="flex gap-4 mb-6">
          <TextField
            fullWidth
            placeholder="Search files by name or uploader..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <Button variant="outlined" startIcon={<FilterList />}>
            Filters
          </Button>
        </Box>

        {/* Security Alert */}
        <Alert severity="info" className="mb-4">
          <Typography variant="body2">
            <strong>Security Note:</strong> Some files have location and WiFi restrictions. 
            You may need to request remote access if you're working from an unauthorized location.
          </Typography>
        </Alert>
      </Paper>

      {/* File Grid */}
      {loading ? (
        <LinearProgress />
      ) : filteredFiles.length === 0 ? (
        <Paper className="p-8 text-center">
          <FolderOpen className="text-gray-400 text-6xl mb-4" />
          <Typography variant="h6" className="text-gray-600 mb-2">
            No files found
          </Typography>
          <Typography variant="body2" className="text-gray-500 mb-4">
            {searchTerm ? 'Try a different search term' : 'Upload your first file to get started'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/files/upload')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Upload File
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredFiles.map((file) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={file.id}>
              <Card
                variant="outlined"
                onContextMenu={(e) => handleContextMenu(e, file)}
                className={`hover:shadow-lg transition-shadow ${
                  !file.accessible ? 'opacity-70' : ''
                }`}
              >
                <CardContent>
                  <Box className="flex justify-between items-start mb-3">
                    <Box className="flex items-center">
                      {getFileIcon(file)}
                      <Box className="ml-2">
                        {getAccessIcon(file)}
                      </Box>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContextMenu(e, file);
                      }}
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>

                  <Typography
                    variant="h6"
                    className="font-semibold mb-2 cursor-pointer truncate"
                    onClick={() => handleFileClick(file)}
                    title={file.name}
                  >
                    {file.name}
                  </Typography>

                  <Box className="space-y-2 mb-3">
                    <Typography variant="body2" className="text-gray-600 flex items-center">
                      <Schedule fontSize="small" className="mr-1" />
                      Modified: {file.modified}
                    </Typography>
                    <Typography variant="body2" className="text-gray-600 flex items-center">
                      <Person fontSize="small" className="mr-1" />
                      By: {file.uploadedBy}
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      Size: {file.size}
                    </Typography>
                  </Box>

                  <Box className="flex flex-wrap gap-1 mb-3">
                    {file.encrypted && (
                      <Chip
                        label="Encrypted"
                        size="small"
                        color="success"
                        variant="outlined"
                        icon={<Lock fontSize="small" />}
                      />
                    )}
                    {file.locationRestricted && (
                      <Chip
                        label="Location Locked"
                        size="small"
                        color="warning"
                        variant="outlined"
                        icon={<LocationOn fontSize="small" />}
                      />
                    )}
                    {file.wifiRestricted && (
                      <Chip
                        label="WiFi Locked"
                        size="small"
                        color="info"
                        variant="outlined"
                        icon={<Wifi fontSize="small" />}
                      />
                    )}
                  </Box>

                  <Box className="flex justify-between items-center">
                    <Typography
                      variant="caption"
                      className={`font-medium ${
                        file.accessible ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {file.accessible ? 'Accessible' : 'Not Accessible'}
                    </Typography>
                    {!file.accessible && (
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => handleRequestAccess(file)}
                      >
                        Request Access
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Context Menu */}
      <Menu
        open={contextMenu.mouseY !== 0}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu.mouseY !== 0 && contextMenu.mouseX !== 0
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        {contextMenu.file && (
          <>
            <MenuItem onClick={() => { handleFileClick(contextMenu.file!); handleCloseContextMenu(); }}>
              <ListItemIcon>
                <Visibility fontSize="small" />
              </ListItemIcon>
              <ListItemText>Preview</ListItemText>
            </MenuItem>
            {contextMenu.file.permissions.includes('download') && (
              <MenuItem onClick={() => handleDownload(contextMenu.file!)}>
                <ListItemIcon>
                  <Download fontSize="small" />
                </ListItemIcon>
                <ListItemText>Download</ListItemText>
              </MenuItem>
            )}
            {contextMenu.file.permissions.includes('share') && (
              <MenuItem onClick={() => handleShare(contextMenu.file!)}>
                <ListItemIcon>
                  <Share fontSize="small" />
                </ListItemIcon>
                <ListItemText>Share</ListItemText>
              </MenuItem>
            )}
            <Divider />
            {!contextMenu.file.accessible && (
              <MenuItem onClick={() => handleRequestAccess(contextMenu.file!)}>
                <ListItemIcon>
                  <Lock fontSize="small" />
                </ListItemIcon>
                <ListItemText>Request Remote Access</ListItemText>
              </MenuItem>
            )}
          </>
        )}
      </Menu>

      {/* File Preview Dialog */}
      <Dialog open={openPreview} onClose={() => setOpenPreview(false)} maxWidth="md" fullWidth>
        {selectedFile && (
          <>
            <DialogTitle className="flex justify-between items-center">
              <Typography variant="h6">{selectedFile.name}</Typography>
              <Box>
                {selectedFile.permissions.includes('download') && (
                  <IconButton onClick={() => handleDownload(selectedFile)}>
                    <Download />
                  </IconButton>
                )}
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Paper className="p-4 h-64 flex items-center justify-center">
                    {selectedFile.type === 'folder' ? (
                      <Folder className="text-yellow-600 text-8xl" />
                    ) : (
                      <InsertDriveFile className="text-blue-600 text-8xl" />
                    )}
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <List>
                    <ListItem>
                      <ListItemText primary="Type" secondary={selectedFile.type.toUpperCase()} />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText primary="Size" secondary={selectedFile.size} />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText primary="Modified" secondary={selectedFile.modified} />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText primary="Uploaded By" secondary={selectedFile.uploadedBy} />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText
                        primary="Security Status"
                        secondary={
                          <Box className="flex items-center gap-1 mt-1">
                            {selectedFile.encrypted && (
                              <Chip label="Encrypted" size="small" color="success" />
                            )}
                            {selectedFile.locationRestricted && (
                              <Chip label="Location Locked" size="small" color="warning" />
                            )}
                            {selectedFile.wifiRestricted && (
                              <Chip label="WiFi Locked" size="small" color="info" />
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              {!selectedFile.accessible && (
                <Button
                  onClick={() => handleRequestAccess(selectedFile)}
                  className="text-blue-600"
                >
                  Request Access
                </Button>
              )}
              <Button onClick={() => setOpenPreview(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Stats */}
      <Paper className="p-4 mt-6">
        <Grid container spacing={2}>
          <Grid item xs={6} md={3}>
            <Box className="text-center">
              <Typography variant="h4" className="font-bold">
                {files.length}
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Total Files
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box className="text-center">
              <Typography variant="h4" className="font-bold">
                {files.filter(f => f.accessible).length}
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Accessible Now
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box className="text-center">
              <Typography variant="h4" className="font-bold">
                {files.filter(f => f.encrypted).length}
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Encrypted
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box className="text-center">
              <Typography variant="h4" className="font-bold">
                {files.filter(f => f.locationRestricted).length}
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Location Restricted
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

// Add missing import
import { FilterList } from '@mui/icons-material';

export default EmployeeFileBrowser;