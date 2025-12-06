import React, { useState } from 'react';
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Collapse,
  Typography,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Dashboard,
  Folder,
  Security,
  People,
  Settings,
  BarChart,
  Notifications,
  Help,
  ExpandLess,
  ExpandMore,
  Lock,
  LocationOn,
  Wifi,
  VerifiedUser,
  AccessTime,
  FileUpload,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  variant?: 'permanent' | 'persistent' | 'temporary';
}

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  children?: MenuItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose, variant = 'persistent' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['files']);

  const menuItems: MenuItem[] = [
    {
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/dashboard',
    },
    {
      text: 'File Management',
      icon: <Folder />,
      path: '/files',
      children: [
        { text: 'File Browser', icon: <Folder />, path: '/files/browser' },
        { text: 'Upload Files', icon: <FileUpload />, path: '/files/upload' },
        { text: 'Shared Files', icon: <People />, path: '/files/shared' },
      ],
    },
    {
      text: 'Security',
      icon: <Security />,
      path: '/security',
      children: [
        { text: 'Access Logs', icon: <AccessTime />, path: '/security/logs' },
        { text: 'Geofencing', icon: <LocationOn />, path: '/security/geofencing' },
        { text: 'WiFi Networks', icon: <Wifi />, path: '/security/wifi' },
        { text: 'AI Monitoring', icon: <VerifiedUser />, path: '/security/ai' },
      ],
    },
    {
      text: 'Employees',
      icon: <People />,
      path: '/employees',
    },
    {
      text: 'Remote Access',
      icon: <Lock />,
      path: '/remote-access',
    },
    {
      text: 'Analytics',
      icon: <BarChart />,
      path: '/analytics',
    },
    {
      text: 'Notifications',
      icon: <Notifications />,
      path: '/notifications',
    },
    {
      text: 'Settings',
      icon: <Settings />,
      path: '/settings',
    },
    {
      text: 'Help',
      icon: <Help />,
      path: '/help',
    },
  ];

  const handleMenuClick = (item: MenuItem) => {
    if (item.children) {
      if (expandedMenus.includes(item.text.toLowerCase())) {
        setExpandedMenus(expandedMenus.filter(menu => menu !== item.text.toLowerCase()));
      } else {
        setExpandedMenus([...expandedMenus, item.text.toLowerCase()]);
      }
    } else {
      navigate(item.path);
      if (variant === 'temporary') {
        onClose();
      }
    }
  };

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const isMenuExpanded = (text: string) => {
    return expandedMenus.includes(text.toLowerCase());
  };

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const active = isActive(item.path);
    const expanded = isMenuExpanded(item.text);

    return (
      <React.Fragment key={item.path}>
        <Tooltip title={item.text} placement="right" disableHoverListener={open}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleMenuClick(item)}
              className={active ? 'bg-blue-50 border-r-4 border-blue-600' : ''}
              sx={{
                pl: depth === 0 ? 2 : depth * 4,
                py: 1.5,
              }}
            >
              <ListItemIcon className={active ? 'text-blue-600' : 'text-gray-600'}>
                {item.icon}
              </ListItemIcon>
              {open && (
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    className: active ? 'font-semibold text-blue-600' : 'font-medium',
                  }}
                />
              )}
              {hasChildren && open && (
                <Box>
                  {expanded ? <ExpandLess /> : <ExpandMore />}
                </Box>
              )}
            </ListItemButton>
          </ListItem>
        </Tooltip>
        
        {hasChildren && open && (
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map(child => renderMenuItem(child, depth + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: open ? 280 : 60,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? 280 : 60,
          boxSizing: 'border-box',
          overflowX: 'hidden',
          transition: 'width 0.3s ease',
        },
      }}
    >
      {/* Logo */}
      <Box className="p-4 border-b">
        <Box className="flex items-center">
          <Security className="text-blue-600" />
          {open && (
            <Typography variant="h6" className="font-bold ml-2">
              GeoCrypt
            </Typography>
          )}
        </Box>
      </Box>

      {/* Security Status */}
      {open && (
        <Box className="p-3 border-b">
          <Typography variant="caption" className="text-gray-600 block mb-2">
            SECURITY STATUS
          </Typography>
          <Box className="space-y-2">
            <Box className="flex items-center justify-between">
              <Typography variant="caption" className="text-gray-700">
                Encryption
              </Typography>
              <Chip
                label="Active"
                size="small"
                color="success"
                variant="outlined"
              />
            </Box>
            <Box className="flex items-center justify-between">
              <Typography variant="caption" className="text-gray-700">
                Geofencing
              </Typography>
              <Chip
                label="Active"
                size="small"
                color="success"
                variant="outlined"
              />
            </Box>
            <Box className="flex items-center justify-between">
              <Typography variant="caption" className="text-gray-700">
                WiFi
              </Typography>
              <Chip
                label="Connected"
                size="small"
                color="success"
                variant="outlined"
              />
            </Box>
          </Box>
        </Box>
      )}

      {/* Navigation Menu */}
      <List className="flex-1 py-2">
        {menuItems.map(item => renderMenuItem(item))}
      </List>

      {/* System Info */}
      {open && (
        <Box className="p-3 border-t">
          <Typography variant="caption" className="text-gray-600 block mb-2">
            SYSTEM INFO
          </Typography>
          <Typography variant="caption" className="text-gray-700 block">
            Version: 2.4.1
          </Typography>
          <Typography variant="caption" className="text-gray-700 block">
            Encryption: Kyber-1024
          </Typography>
          <Typography variant="caption" className="text-gray-700 block">
            Uptime: 99.8%
          </Typography>
        </Box>
      )}
    </Drawer>
  );
};

export default Sidebar;