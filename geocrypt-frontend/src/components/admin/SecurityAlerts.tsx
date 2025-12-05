import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const SecurityAlerts: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4">Security Alerts</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Security alerts component - to be implemented
        </Typography>
      </Box>
    </Container>
  );
};

export default SecurityAlerts;
