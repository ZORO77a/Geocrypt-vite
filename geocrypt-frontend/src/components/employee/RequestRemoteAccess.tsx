import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const RequestRemoteAccess: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4">Request Remote Access</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Remote access request component - to be implemented
        </Typography>
      </Box>
    </Container>
  );
};

export default RequestRemoteAccess;
