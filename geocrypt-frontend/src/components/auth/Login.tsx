import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  GridLegacy as Grid,
  ToggleButtonGroup,
  ToggleButton,
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material';
import {
  LockOutlined,
  Visibility,
  VisibilityOff,
  AdminPanelSettings,
  Person,
  Email,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userType, setUserType] = useState<'admin' | 'employee'>('employee');
  const { login } = useAuth();
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    username: userType === 'admin' 
      ? Yup.string().required('Username is required')
      : Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string()
      .min(5, 'Password must be at least 5 characters')
      .required('Password is required'),
  });

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema,
    validateOnMount: true,
    onSubmit: async (values) => {
      setError('');
      setLoading(true);
      try {
        const result = await login(values.username, values.password);
        if (result.requiresOTP) {
          // Use the email returned from the login response (admin OTP uses configured admin email)
          navigate('/verify-otp', { state: { email: result.email || values.username } });
        } else {
          navigate(result.user?.role === 'admin' ? '/admin' : '/employee');
        }
      } catch (err: any) {
        setError(err.message || 'Login failed');
      } finally {
        setLoading(false);
      }
    },
  });

  const handleUserTypeChange = (_event: React.MouseEvent<HTMLElement>, newUserType: 'admin' | 'employee') => {
    if (newUserType !== null) {
      setUserType(newUserType);
      formik.resetForm();
    }
  };

  const handleDemoLogin = (type: 'admin' | 'employee') => {
    if (type === 'admin') {
      formik.setValues({
        username: 'admin',
        password: 'admin',
      });
      // Auto-submit demo login so the OTP flow starts immediately
      formik.submitForm();
    } else {
      formik.setValues({
        username: 'employee@company.com',
        password: 'employee123',
      });
      formik.submitForm();
    }
  };

  return (
    <Container component="main" maxWidth="xs" className="min-h-screen flex items-center justify-center">
      <Box className="w-full">
        <Paper elevation={3} className="p-8 rounded-2xl shadow-xl">
          <Box className="flex flex-col items-center mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full mb-4">
              <LockOutlined className="text-white text-4xl" />
            </div>
            <Typography component="h1" variant="h4" className="font-bold text-gray-900">
              GeoCrypt Login
            </Typography>
            <Typography variant="body2" className="text-gray-600 mt-2">
              Secure Geofencing Access Control System
            </Typography>
          </Box>

          {/* User Type Selection */}
          <Box className="mb-6">
            <ToggleButtonGroup
              value={userType}
              exclusive
              onChange={handleUserTypeChange}
              aria-label="user type"
              fullWidth
              className="mb-4"
            >
              <ToggleButton 
                value="employee" 
                aria-label="employee"
                className={`${userType === 'employee' ? 'bg-blue-100 text-blue-600' : ''}`}
              >
                <Person className="mr-2" />
                Employee
              </ToggleButton>
              <ToggleButton 
                value="admin" 
                aria-label="admin"
                className={`${userType === 'admin' ? 'bg-purple-100 text-purple-600' : ''}`}
              >
                <AdminPanelSettings className="mr-2" />
                Administrator
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {error && (
            <Alert severity="error" className="mb-6">
              {error}
            </Alert>
          )}

          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={userType === 'admin' ? 'Admin Username' : 'Email Address'}
                  name="username"
                  type={userType === 'admin' ? 'text' : 'email'}
                  autoComplete={userType === 'admin' ? 'username' : 'email'}
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.username && Boolean(formik.errors.username)}
                  helperText={formik.touched.username && formik.errors.username}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        {userType === 'admin' ? <AdminPanelSettings className="text-gray-400" /> : <Email className="text-gray-400" />}
                      </InputAdornment>
                    ),
                    placeholder: userType === 'admin' ? 'Enter "admin"' : 'employee@company.com',
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined className="text-gray-400" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          disabled={loading}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    placeholder: userType === 'admin' ? 'Enter "admin"' : 'Enter your password',
                  }}
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || !formik.isValid}
              className="mt-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign In'
              )}
            </Button>

            <Divider className="my-6">
              <Typography variant="body2" className="text-gray-500">
                Quick Demo
              </Typography>
            </Divider>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AdminPanelSettings />}
                  onClick={() => {
                    setUserType('admin');
                    handleDemoLogin('admin');
                  }}
                  className="py-2.5"
                >
                  Admin Demo
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Person />}
                  onClick={() => {
                    setUserType('employee');
                    handleDemoLogin('employee');
                  }}
                  className="py-2.5"
                >
                  Employee Demo
                </Button>
              </Grid>
            </Grid>
          </form>

          <Box className="mt-8 space-y-4">
            <Alert severity="info" className="rounded-lg">
              <Typography variant="body2" className="font-medium">
                Demo Credentials:
              </Typography>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li className="text-sm">
                  <strong>Admin:</strong> username: <code>admin</code>, password: <code>admin</code>
                </li>
                <li className="text-sm">
                  <strong>Employee:</strong> any email, password: <code>employee123</code>
                </li>
                <li className="text-sm">
                  <em>Employee login requires OTP verification (enter any 6-digit code)</em>
                </li>
              </ul>
            </Alert>

            <Box className="text-center">
              <Typography variant="body2" className="text-gray-600">
                Forgot your password?{' '}
                <Button
                  variant="text"
                  size="small"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Contact Administrator
                </Button>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;