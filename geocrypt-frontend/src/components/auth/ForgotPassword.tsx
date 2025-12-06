import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Link,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Email, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';

const ForgotPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
    }),
    onSubmit: async (_values) => {
      setLoading(true);
      try {
        // TODO: Implement password reset API call
        setTimeout(() => {
          toast.success('Password reset email sent!');
          setEmailSent(true);
          setLoading(false);
        }, 1500);
      } catch (error: any) {
        toast.error(error.message || 'Failed to send reset email');
        setLoading(false);
      }
    },
  });

  return (
    <Container maxWidth="sm" className="min-h-screen flex items-center">
      <Paper className="p-8 w-full shadow-lg">
        <Box className="text-center mb-6">
          <Typography variant="h4" className="font-bold text-gray-900 mb-2">
            Forgot Password
          </Typography>
          <Typography variant="body2" className="text-gray-600">
            Enter your email address and we'll send you a link to reset your password
          </Typography>
        </Box>

        {emailSent ? (
          <Box className="text-center">
            <Alert severity="success" className="mb-4">
              Password reset email sent! Check your inbox.
            </Alert>
            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate('/auth/login')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Back to Login
            </Button>
          </Box>
        ) : (
          <form onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              margin="normal"
              InputProps={{
                startAdornment: <Email className="mr-2 text-gray-400" />,
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 mt-4"
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Send Reset Link'
              )}
            </Button>

            <Box className="text-center mt-4">
              <Link
                component="button"
                variant="body2"
                onClick={() => navigate('/auth/login')}
                className="flex items-center justify-center"
              >
                <ArrowBack fontSize="small" className="mr-1" />
                Back to Login
              </Link>
            </Box>
          </form>
        )}

        <Box className="mt-8 pt-6 border-t border-gray-200">
          <Typography variant="body2" className="text-gray-600 text-center">
            Need help? Contact support@geocrypt.com
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default ForgotPassword;