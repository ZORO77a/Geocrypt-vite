import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const Profile: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4">Employee Profile</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Employee profile component - to be implemented
        </Typography>
      </Box>
    </Container>
  );
};

export default Profile;
