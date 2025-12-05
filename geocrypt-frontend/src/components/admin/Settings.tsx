import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const Settings: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4">Admin Settings</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Admin settings component - to be implemented
        </Typography>
      </Box>
    </Container>
  );
};

export default Settings;
