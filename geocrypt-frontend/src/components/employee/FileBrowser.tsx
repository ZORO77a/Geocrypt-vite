import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const FileBrowser: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4">File Browser</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          File browser component - to be implemented
        </Typography>
      </Box>
    </Container>
  );
};

export default FileBrowser;
