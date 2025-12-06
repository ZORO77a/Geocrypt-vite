import React from 'react';
import { Box, Typography, Container, Link, GridLegacy as Grid } from '@mui/material';
import { Security, LocationOn, Wifi, VerifiedUser } from '@mui/icons-material';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box component="footer" className="bg-gray-900 text-white mt-auto">
      <Container maxWidth="xl" className="py-8">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box className="flex items-center mb-4">
              <Security className="text-blue-400 mr-2" />
              <Typography variant="h6" className="font-bold">
                GeoCrypt
              </Typography>
            </Box>
            <Typography variant="body2" className="text-gray-400">
              Advanced file security with post-quantum encryption, 
              geofencing, and AI-powered threat detection.
            </Typography>
          </Grid>

          <Grid item xs={12} md={2}>
            <Typography variant="subtitle1" className="font-semibold mb-3">
              Features
            </Typography>
            <Box className="space-y-2">
              <Typography variant="body2" className="text-gray-400 hover:text-white cursor-pointer">
                <LocationOn fontSize="small" className="mr-2" />
                Geofencing
              </Typography>
              <Typography variant="body2" className="text-gray-400 hover:text-white cursor-pointer">
                <Wifi fontSize="small" className="mr-2" />
                WiFi Verification
              </Typography>
              <Typography variant="body2" className="text-gray-400 hover:text-white cursor-pointer">
                <VerifiedUser fontSize="small" className="mr-2" />
                AI Monitoring
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={3}>
            <Typography variant="subtitle1" className="font-semibold mb-3">
              Quick Links
            </Typography>
            <Box className="space-y-2">
              <Link href="/dashboard" color="inherit" className="block text-gray-400 hover:text-white">
                Dashboard
              </Link>
              <Link href="/files" color="inherit" className="block text-gray-400 hover:text-white">
                Files
              </Link>
              <Link href="/settings" color="inherit" className="block text-gray-400 hover:text-white">
                Settings
              </Link>
              <Link href="/help" color="inherit" className="block text-gray-400 hover:text-white">
                Help Center
              </Link>
            </Box>
          </Grid>

          <Grid item xs={12} md={3}>
            <Typography variant="subtitle1" className="font-semibold mb-3">
              Contact
            </Typography>
            <Typography variant="body2" className="text-gray-400 mb-2">
              Email: support@geocrypt.com
            </Typography>
            <Typography variant="body2" className="text-gray-400 mb-2">
              Phone: +1 (555) 123-4567
            </Typography>
            <Typography variant="body2" className="text-gray-400">
              Office Hours: Mon-Fri, 9AM-6PM
            </Typography>
          </Grid>
        </Grid>

        <Box className="border-t border-gray-800 mt-8 pt-6 text-center">
          <Typography variant="body2" className="text-gray-400">
            © {currentYear} GeoCrypt Security Systems. All rights reserved.
            <Link href="/privacy" color="inherit" className="ml-4 hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" color="inherit" className="ml-4 hover:text-white">
              Terms of Service
            </Link>
            <Link href="/security" color="inherit" className="ml-4 hover:text-white">
              Security
            </Link>
          </Typography>
          <Typography variant="caption" className="text-gray-500 block mt-2">
            Version 2.4.1 • Post-Quantum Cryptography Enabled
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;