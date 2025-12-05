import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type User } from '@/types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<LoginResponse>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  updateUser: (user: User) => void;
}

interface LoginResponse {
  requiresOTP: boolean;
  email?: string;
  user?: User;
  message?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem('geocrypt_user');
      const storedToken = localStorage.getItem('geocrypt_token');
      
      if (storedUser && storedToken) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        } catch (error) {
          localStorage.removeItem('geocrypt_user');
          localStorage.removeItem('geocrypt_token');
        }
      }
      setLoading(false);
    };

    initializeAuth();
    
    // Auto logout after session timeout
    const timeout = parseInt(import.meta.env.VITE_SESSION_TIMEOUT || '30') * 60 * 1000;
    const timer = setTimeout(() => {
      if (user) {
        toast.info('Session expired. Please login again.');
        logout();
      }
    }, timeout);

    return () => clearTimeout(timer);
  }, [user]);

  const login = async (username: string, password: string): Promise<LoginResponse> => {
    try {
      // Admin login: require OTP (demo) and send to configured admin email
      if (username === 'admin' && password === 'admin') {
        // Store pending email for OTP verification
        const adminOtpEmail = 'ananthakrishnan272004@gmail.com';
        localStorage.setItem('pending_email', adminOtpEmail);
        localStorage.setItem('pending_admin', 'true');
        // Simulate sending OTP to admin email
        toast.info('OTP sent to admin email');
        return { requiresOTP: true, email: adminOtpEmail };
      }
      // Employee login
      else if (username.includes('@')) {
        // Simulate API call - In real app, this would call your backend
        // Check if employee exists with this email
        const employeeExists = true; // Assume exists for demo
        
        if (employeeExists) {
          // Store pending email for OTP verification
          localStorage.setItem('pending_email', username);
          // Simulate sending OTP
          toast.info('OTP sent to your email');
          return { requiresOTP: true, email: username };
        } else {
          throw new Error('Employee account not found. Contact administrator.');
        }
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    try {
      // Demo OTP verification - accept any 6-digit OTP
      if (otp.length === 6 && /^\d+$/.test(otp)) {
        const isAdmin = localStorage.getItem('pending_admin') === 'true';
        
        let user: User;
        if (isAdmin) {
          // Admin user data
          user = {
            id: 'admin-001',
            email: 'ananthakrishnan272004@gmail.com',
            name: 'Administrator',
            role: 'admin',
            department: 'Administration',
            isActive: true,
            permissions: ['all'],
            createdAt: new Date(),
            remoteAccess: false,
          };
          localStorage.removeItem('pending_admin');
        } else {
          // Simulate employee data
          user = {
            id: 'emp-' + Date.now(),
            email,
            name: email.split('@')[0].replace('.', ' ').replace(/_/g, ' '),
            role: 'employee',
            department: 'Engineering',
            isActive: true,
            permissions: ['file_read', 'file_access'],
            createdAt: new Date(),
            remoteAccess: false,
          };
        }
        
        localStorage.setItem('geocrypt_user', JSON.stringify(user));
        localStorage.setItem('geocrypt_token', (user.role === 'admin' ? 'admin-token-' : 'employee-token-') + Date.now());
        setUser(user);
        setToken((user.role === 'admin' ? 'admin-token-' : 'employee-token-') + Date.now());
        localStorage.removeItem('pending_email');
        
        toast.success('OTP verified successfully!');
      } else {
        throw new Error('Invalid OTP');
      }
    } catch (error: any) {
      toast.error(error.message || 'OTP verification failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('geocrypt_user');
    localStorage.removeItem('geocrypt_token');
    localStorage.removeItem('pending_email');
    setUser(null);
    setToken(null);
    toast.info('Logged out successfully');
    navigate('/login');
  };

  const updateUser = (updatedUser: User) => {
    localStorage.setItem('geocrypt_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const value = {
    user,
    token,
    login,
    verifyOTP,
    logout,
    isAuthenticated: !!user,
    loading,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};