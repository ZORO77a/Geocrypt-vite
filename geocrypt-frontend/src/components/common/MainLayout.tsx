import React, { type ReactNode } from 'react';
import { Box } from '@mui/material';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box component="main" sx={{ flex: 1, p: 3, overflowY: 'auto' }}>
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;
