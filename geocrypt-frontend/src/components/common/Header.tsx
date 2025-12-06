import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Tooltip,
  InputBase,
  alpha,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search,
  Notifications,
  Settings,
  Security,
  Logout,
  Person,
  LocationOn,
  Wifi,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState<null | HTMLElement>(null);
  
  // Mock user data
  const user = {
    name: 'John Doe',
    email: 'john.doe@company.com',
    role: 'Admin',
    avatar: 'JD',
    location: 'Main Office',
    wifi: 'Office-WiFi-5G',
  };

  const notifications = [
    { id: 1, text: 'New file uploaded by Sarah', time: '5 min ago', read: false },
    { id: 2, text: 'Suspicious login attempt detected', time: '1 hour ago', read: false },
    { id: 3, text: 'System backup completed', time: '2 hours ago', read: true },
    { id: 4, text: 'AI monitoring threshold reached', time: '1 day ago', read: true },
  ];

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };

  const handleLogout = () => {
    // TODO: Implement logout logic
    toast.success('Logged out successfully');
    navigate('/auth/login');
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <AppBar position="fixed" className="bg-white text-gray-900 shadow-md">
      <Toolbar>
        {/* Left side */}
        <Box className="flex items-center flex-1">
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleSidebar}
            className="mr-4"
          >
            <MenuIcon />
          </IconButton>

          <Box className="flex items-center mr-4">
            <Security className="text-blue-600 mr-2" />
            <Typography variant="h6" noWrap className="font-bold">
              GeoCrypt
            </Typography>
          </Box>

          {/* Search bar */}
          <Box
            className="ml-4 flex-1 max-w-md"
            sx={{
              backgroundColor: alpha('#000', 0.05),
              borderRadius: 1,
            }}
          >
            <Box className="flex items-center px-2 py-1">
              <Search className="text-gray-400" />
              <InputBase
                placeholder="Search files, users, or settings..."
                className="ml-2 flex-1"
                sx={{ fontSize: '0.875rem' }}
              />
            </Box>
          </Box>
        </Box>

        {/* Right side */}
        <Box className="flex items-center space-x-2">
          {/* Location and WiFi status */}
          <Tooltip title={`Connected to ${user.wifi} at ${user.location}`}>
            <Box className="flex items-center px-3 py-1 bg-gray-100 rounded-lg">
              <LocationOn fontSize="small" className="text-green-600 mr-1" />
              <Typography variant="caption" className="font-medium">
                {user.location}
              </Typography>
              <Wifi fontSize="small" className="ml-2 text-blue-600" />
            </Box>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton color="inherit" onClick={handleNotificationsOpen}>
              <Badge badgeContent={unreadNotifications} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Settings */}
          <Tooltip title="Settings">
            <IconButton color="inherit" onClick={() => navigate('/admin/settings')}>
              <Settings />
            </IconButton>
          </Tooltip>

          {/* User menu */}
          <Box className="flex items-center cursor-pointer" onClick={handleMenuOpen}>
            <Avatar className="bg-blue-600">
              {user.avatar}
            </Avatar>
            <Box className="ml-2 hidden md:block">
              <Typography variant="subtitle2" className="font-semibold">
                {user.name}
              </Typography>
              <Typography variant="caption" className="text-gray-600">
                {user.role}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Toolbar>

      {/* User Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          className: 'mt-2',
        }}
      >
        <Box className="px-4 py-2">
          <Typography variant="subtitle1" className="font-semibold">
            {user.name}
          </Typography>
          <Typography variant="body2" className="text-gray-600">
            {user.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
          <Person className="mr-2" />
          Profile
        </MenuItem>
        <MenuItem onClick={() => { navigate('/admin/settings'); handleMenuClose(); }}>
          <Settings className="mr-2" />
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <Logout className="mr-2" />
          Logout
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationsAnchorEl}
        open={Boolean(notificationsAnchorEl)}
        onClose={handleNotificationsClose}
        PaperProps={{
          className: 'mt-2 w-80',
        }}
      >
        <Box className="px-4 py-2">
          <Typography variant="subtitle1" className="font-semibold">
            Notifications
          </Typography>
        </Box>
        <Divider />
        {notifications.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" className="text-gray-500">
              No new notifications
            </Typography>
          </MenuItem>
        ) : (
          notifications.map((notification) => (
            <MenuItem key={notification.id} className="py-2">
              <Box className="w-full">
                <Typography variant="body2" className={notification.read ? '' : 'font-semibold'}>
                  {notification.text}
                </Typography>
                <Typography variant="caption" className="text-gray-500">
                  {notification.time}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
        <Divider />
        <MenuItem onClick={() => navigate('/notifications')}>
          <Typography variant="body2" className="text-center w-full text-blue-600">
            View all notifications
          </Typography>
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Header;