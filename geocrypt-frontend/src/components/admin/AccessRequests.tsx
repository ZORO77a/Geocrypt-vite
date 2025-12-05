import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const AccessRequests: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4">Access Requests</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Access requests management component - to be implemented
        </Typography>
      </Box>
    </Container>
  );
};

export default AccessRequests;
