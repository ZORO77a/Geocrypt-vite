import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Alert,
  LinearProgress,
  Menu,
  MenuItem,
  GridLegacy as Grid,
  InputAdornment,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Edit,
  Delete,
  MoreVert,
  Search,
  PersonAdd,
  Block,
  CheckCircle,
  Cancel,
  Email,
  Phone,
  LocationOn,
  FilterList,
  Refresh,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  // Mock data for demo
  const mockEmployees = [
    {
      id: 'emp-001',
      name: 'John Doe',
      email: 'john.doe@company.com',
      phone: '+1 (555) 123-4567',
      department: 'Engineering',
      position: 'Senior Developer',
      isActive: true,
      lastActive: new Date('2024-01-15T10:30:00'),
      accessLevel: 'Full',
      remoteAccess: false,
      createdAt: new Date('2023-06-01'),
    },
    {
      id: 'emp-002',
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      phone: '+1 (555) 987-6543',
      department: 'Marketing',
      position: 'Marketing Manager',
      isActive: true,
      lastActive: new Date('2024-01-14T15:45:00'),
      accessLevel: 'Limited',
      remoteAccess: true,
      remoteAccessExpiry: new Date('2024-02-14'),
      createdAt: new Date('2023-07-15'),
    },
    {
      id: 'emp-003',
      name: 'Bob Johnson',
      email: 'bob.johnson@company.com',
      phone: '+1 (555) 456-7890',
      department: 'Sales',
      position: 'Sales Executive',
      isActive: false,
      lastActive: new Date('2024-01-10T09:15:00'),
      accessLevel: 'Standard',
      remoteAccess: false,
      createdAt: new Date('2023-08-20'),
    },
    {
      id: 'emp-004',
      name: 'Alice Brown',
      email: 'alice.brown@company.com',
      phone: '+1 (555) 789-0123',
      department: 'HR',
      position: 'HR Manager',
      isActive: true,
      lastActive: new Date('2024-01-15T14:20:00'),
      accessLevel: 'Admin',
      remoteAccess: true,
      remoteAccessExpiry: new Date('2024-03-01'),
      createdAt: new Date('2023-09-10'),
    },
  ];

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setEmployees(mockEmployees);
      setLoading(false);
    }, 1000);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, employee: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedEmployee(employee);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedEmployee(null);
  };

  const handleEdit = () => {
    setEditingEmployee(selectedEmployee);
    setOpenDialog(true);
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedEmployee.name}?`)) {
      toast.success(`Employee ${selectedEmployee.name} deleted (demo mode)`);
      fetchEmployees();
    }
    handleMenuClose();
  };

  const handleToggleStatus = async () => {
    const newStatus = !selectedEmployee.isActive;
    toast.info(`Employee ${selectedEmployee.name} ${newStatus ? 'activated' : 'deactivated'} (demo mode)`);
    fetchEmployees();
    handleMenuClose();
  };

  const handleToggleRemoteAccess = async () => {
    const newStatus = !selectedEmployee.remoteAccess;
    toast.info(`Remote access ${newStatus ? 'granted' : 'revoked'} for ${selectedEmployee.name} (demo mode)`);
    fetchEmployees();
    handleMenuClose();
  };

  const handleOpenDialog = () => {
    setEditingEmployee(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingEmployee(null);
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="xl" className="py-6">
      {/* Header */}
      <Paper className="p-6 mb-6 shadow-md">
        <Box className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <Box>
            <Typography variant="h5" className="font-bold text-gray-900">
              Employee Management
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Manage employee accounts, permissions, and access controls
            </Typography>
          </Box>
          <Box className="flex gap-2">
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => toast.info('Filter feature coming soon')}
            >
              Filter
            </Button>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchEmployees}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={handleOpenDialog}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add Employee
            </Button>
          </Box>
        </Box>

        {/* Search Bar */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search employees by name, email, or department..."
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
                  <Cancel fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
          className="mb-6"
        />

        {/* Stats */}
        <Grid container spacing={2} className="mb-6">
          <Grid item xs={6} md={3}>
            <Paper className="p-4 text-center border border-gray-200">
              <Typography variant="h6" className="font-bold">
                {employees.length}
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Total Employees
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={3}>
            <Paper className="p-4 text-center border border-gray-200">
              <Typography variant="h6" className="font-bold text-green-600">
                {employees.filter(e => e.isActive).length}
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Active
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={3}>
            <Paper className="p-4 text-center border border-gray-200">
              <Typography variant="h6" className="font-bold text-red-600">
                {employees.filter(e => !e.isActive).length}
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Inactive
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={3}>
            <Paper className="p-4 text-center border border-gray-200">
              <Typography variant="h6" className="font-bold text-blue-600">
                {employees.filter(e => e.remoteAccess).length}
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Remote Access
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Employees Table */}
      <Paper className="p-4 shadow-md">
        {loading ? (
          <LinearProgress />
        ) : filteredEmployees.length === 0 ? (
          <Alert severity="info" className="my-4">
            No employees found. Add your first employee!
          </Alert>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Active</TableCell>
                    <TableCell>Access</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEmployees
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((employee) => (
                      <TableRow key={employee.id} hover>
                        <TableCell>
                          <Box className="flex items-center">
                            <Avatar
                              className={`w-10 h-10 mr-3 ${employee.isActive ? 'bg-blue-500' : 'bg-gray-400'}`}
                            >
                              {employee.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body1" className="font-medium">
                                {employee.name}
                              </Typography>
                              <Typography variant="caption" className="text-gray-500">
                                ID: {employee.id}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Box className="flex items-center mb-1">
                              <Email fontSize="small" className="text-gray-400 mr-1" />
                              <Typography variant="body2">
                                {employee.email}
                              </Typography>
                            </Box>
                            {employee.phone && (
                              <Box className="flex items-center">
                                <Phone fontSize="small" className="text-gray-400 mr-1" />
                                <Typography variant="body2">
                                  {employee.phone}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={employee.department}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          <Typography variant="caption" className="block mt-1 text-gray-600">
                            {employee.position}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={employee.isActive ? 'Active' : 'Inactive'}
                            color={employee.isActive ? 'success' : 'error'}
                            size="small"
                            icon={employee.isActive ? <CheckCircle /> : <Block />}
                          />
                        </TableCell>
                        <TableCell>
                          {employee.lastActive ? (
                            <Box>
                              <Typography variant="body2">
                                {format(new Date(employee.lastActive), 'MMM dd, yyyy')}
                              </Typography>
                              <Typography variant="caption" className="text-gray-500">
                                {format(new Date(employee.lastActive), 'HH:mm')}
                              </Typography>
                            </Box>
                          ) : (
                            'Never'
                          )}
                        </TableCell>
                        <TableCell>
                          <Box className="space-y-1">
                            <Chip
                              label={employee.accessLevel}
                              size="small"
                              color="secondary"
                            />
                            {employee.remoteAccess && (
                              <Tooltip title={`Expires: ${format(new Date(employee.remoteAccessExpiry), 'MMM dd, yyyy')}`}>
                                <Chip
                                  label="Remote"
                                  size="small"
                                  color="warning"
                                  variant="outlined"
                                  icon={<LocationOn />}
                                />
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuClick(e, employee)}
                          >
                            <MoreVert />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredEmployees.length}
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

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <Edit fontSize="small" className="mr-2" />
          Edit Details
        </MenuItem>
        <MenuItem onClick={handleToggleStatus}>
          {selectedEmployee?.isActive ? (
            <>
              <Block fontSize="small" className="mr-2" />
              Deactivate Account
            </>
          ) : (
            <>
              <CheckCircle fontSize="small" className="mr-2" />
              Activate Account
            </>
          )}
        </MenuItem>
        <MenuItem onClick={handleToggleRemoteAccess}>
          <LocationOn fontSize="small" className="mr-2" />
          {selectedEmployee?.remoteAccess ? 'Revoke Remote Access' : 'Grant Remote Access'}
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <Delete fontSize="small" className="mr-2" />
          Delete Employee
        </MenuItem>
      </Menu>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
        </DialogTitle>
        <DialogContent>
          <Box className="py-4">
            <Alert severity="info" className="mb-4">
              <Typography variant="body2">
                Employee accounts are created by administrators. Employees will receive login credentials via email.
              </Typography>
            </Alert>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  variant="outlined"
                  defaultValue={editingEmployee?.name || ''}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  variant="outlined"
                  defaultValue={editingEmployee?.email || ''}
                  disabled={!!editingEmployee}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  variant="outlined"
                  defaultValue={editingEmployee?.phone || ''}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Department"
                  variant="outlined"
                  defaultValue={editingEmployee?.department || ''}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Position"
                  variant="outlined"
                  defaultValue={editingEmployee?.position || ''}
                />
              </Grid>
              {!editingEmployee && (
                <Grid item xs={12}>
                  <Alert severity="warning">
                    <Typography variant="body2">
                      A temporary password will be generated and sent to the employee's email.
                    </Typography>
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              toast.success(editingEmployee ? 'Employee updated (demo)' : 'Employee added (demo)');
              handleCloseDialog();
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {editingEmployee ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EmployeeManagement;