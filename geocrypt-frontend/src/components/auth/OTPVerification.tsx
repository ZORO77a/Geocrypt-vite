import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  LinearProgress,
} from '@mui/material';
import { VerifiedUser, Refresh, ArrowBack } from '@mui/icons-material';
import OtpInput from 'react-otp-input';

const OTPVerification: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOTP } = useAuth();
  
  const email = location.state?.email || localStorage.getItem('pending_email') || '';

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  useEffect(() => {
    if (otp.length === 6) {
      handleSubmit();
    }
  }, [otp]);

  const handleSubmit = async () => {
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await verifyOTP(email, otp);
      // Determine role from stored user (verifyOTP sets geocrypt_user in localStorage)
      const stored = localStorage.getItem('geocrypt_user');
      const parsed = stored ? JSON.parse(stored) : null;
      const role = parsed?.role || 'employee';
      navigate(role === 'admin' ? '/admin' : '/employee');
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please try again.');
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = () => {
    setTimer(60);
    setCanResend(false);
    setError('');
    setOtp('');
    // Simulate OTP resend
    console.log('Resending OTP to:', email);
    // In real app: await authService.resendOTP(email);
  };

  if (!email) {
    return (
      <Container maxWidth="sm" className="min-h-screen flex items-center justify-center">
        <Paper className="p-8 w-full text-center">
          <Alert severity="error" className="mb-4">
            No email found. Please login first.
          </Alert>
          <Button 
            variant="contained" 
            href="/login"
            startIcon={<ArrowBack />}
          >
            Go to Login
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" className="min-h-screen flex items-center justify-center">
      <Paper className="p-8 w-full rounded-2xl shadow-xl">
        <Box className="text-center mb-8">
          <div className="bg-gradient-to-r from-green-500 to-teal-500 p-4 rounded-full inline-block mb-4">
            <VerifiedUser className="text-white text-4xl" />
          </div>
          <Typography variant="h5" className="font-bold text-gray-900 mb-2">
            Two-Factor Authentication
          </Typography>
          <Typography variant="body2" className="text-gray-600">
            We've sent a 6-digit verification code to
          </Typography>
          <Typography variant="body1" className="font-medium text-green-600 mt-1">
            {email}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" className="mb-6">
            {error}
          </Alert>
        )}

        <Box className="mb-8">
          <Typography variant="body2" className="text-center text-gray-600 mb-4">
            Enter the verification code
          </Typography>
          
          <Box className="flex justify-center mb-6">
            <OtpInput
              value={otp}
              onChange={setOtp}
              numInputs={6}
              renderSeparator={<span className="w-3" />}
              renderInput={(props) => (
                <input
                  {...props}
                  className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none disabled:bg-gray-100"
                  disabled={loading}
                />
              )}
              shouldAutoFocus
            />
          </Box>

          {loading && <LinearProgress className="mb-4" />}

          <Box className="space-y-4">
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={loading || otp.length !== 6}
              className="py-3 rounded-lg bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Verify & Continue'
              )}
            </Button>

            <Typography variant="body2" className="text-center text-gray-600">
              Didn't receive the code?{' '}
              {canResend ? (
                <Button
                  variant="text"
                  size="small"
                  startIcon={<Refresh />}
                  onClick={handleResendOTP}
                  className="ml-1"
                >
                  Resend OTP
                </Button>
              ) : (
                <span className="font-medium">
                  Resend in {timer}s
                </span>
              )}
            </Typography>
          </Box>
        </Box>

        <Box className="text-center space-y-4">
          <Typography variant="caption" className="text-gray-500 block">
            ⚠️ For security reasons, this OTP will expire in 10 minutes.
          </Typography>

          <Button
            variant="text"
            size="small"
            href="/login"
            startIcon={<ArrowBack />}
          >
            Back to Login
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default OTPVerification;