import { api, setAuthToken, clearAuthToken, reinitializeApi, addRequestInterceptor, type RequestInterceptor } from './api';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'employee';
  department: string;
  employeeId: string;
  avatar?: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  lastLogin?: string;
  permissions: string[];
  settings?: UserSettings;
}

export interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    securityAlerts: boolean;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  twoFactorCode?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  department: string;
  employeeId: string;
  inviteCode?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: User;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPasswordConfirm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

// Auth Service
export const authService = {
  // Login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    
    // Store tokens
    setAuthToken(response.access_token);
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);
    
    if (credentials.rememberMe) {
      localStorage.setItem('remember_me', 'true');
    }
    
    // Store user info
    localStorage.setItem('user', JSON.stringify(response.user));
    
    return response;
  },

  // Register
  register: async (data: RegisterData): Promise<{ message: string; userId: string }> => {
    const response = await api.post<{ message: string; userId: string }>('/auth/register', data);
    return response;
  },

  // Logout
  logout: async (refreshToken: string): Promise<{ message: string }> => {
    try {
      const response = await api.post<{ message: string }>('/auth/logout', { refresh_token: refreshToken });
      return response;
    } finally {
      // Always clear local storage
      clearAuthToken();
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('remember_me');
      reinitializeApi();
    }
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<{ access_token: string; refresh_token?: string }> => {
    const response = await api.post<{ access_token: string; refresh_token?: string }>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    
    // Update stored tokens
    setAuthToken(response.access_token);
    localStorage.setItem('access_token', response.access_token);
    
    if (response.refresh_token) {
      localStorage.setItem('refresh_token', response.refresh_token);
    }
    
    return response;
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    
    // Update stored user info
    localStorage.setItem('user', JSON.stringify(response));
    
    return response;
  },

  // Update profile
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put<User>('/auth/profile', data);
    
    // Update stored user info
    localStorage.setItem('user', JSON.stringify(response));
    
    return response;
  },

  // Change password
  changePassword: async (data: ChangePasswordRequest): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/change-password', data);
    return response;
  },

  // Reset password request
  resetPassword: async (email: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/reset-password', { email });
    return response;
  },

  // Reset password confirm
  resetPasswordConfirm: async (data: ResetPasswordConfirm): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/reset-password/confirm', data);
    return response;
  },

  // Verify email
  verifyEmail: async (token: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/verify-email', { token });
    return response;
  },

  // Resend verification email
  resendVerificationEmail: async (email: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/resend-verification', { email });
    return response;
  },

  // Two-factor authentication
  setupTwoFactor: async (): Promise<TwoFactorSetup> => {
    const response = await api.post<TwoFactorSetup>('/auth/two-factor/setup');
    return response;
  },

  verifyTwoFactor: async (code: string): Promise<{ verified: boolean; backupCodes?: string[] }> => {
    const response = await api.post<{ verified: boolean; backupCodes?: string[] }>('/auth/two-factor/verify', { code });
    return response;
  },

  disableTwoFactor: async (code: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/two-factor/disable', { code });
    return response;
  },

  // Get backup codes
  getBackupCodes: async (): Promise<{ backupCodes: string[] }> => {
    const response = await api.get<{ backupCodes: string[] }>('/auth/two-factor/backup-codes');
    return response;
  },

  // Generate new backup codes
  generateBackupCodes: async (): Promise<{ backupCodes: string[] }> => {
    const response = await api.post<{ backupCodes: string[] }>('/auth/two-factor/generate-backup-codes');
    return response;
  },

  // Check session
  checkSession: async (): Promise<{ valid: boolean; user?: User }> => {
    try {
      const user = await api.get<User>('/auth/me');
      return { valid: true, user };
    } catch (error) {
      return { valid: false };
    }
  },

  // Get user permissions
  getUserPermissions: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/auth/permissions');
    return response;
  },

  // Update user settings
  updateUserSettings: async (settings: Partial<UserSettings>): Promise<UserSettings> => {
    const response = await api.put<UserSettings>('/auth/settings', settings);
    
    // Update stored user info
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    currentUser.settings = response;
    localStorage.setItem('user', JSON.stringify(currentUser));
    
    return response;
  },

  // Get login history
  getLoginHistory: async (limit?: number, page?: number): Promise<{
    logs: Array<{
      id: string;
      timestamp: string;
      ipAddress: string;
      userAgent: string;
      location?: string;
      success: boolean;
    }>;
    total: number;
  }> => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (page) params.append('page', page.toString());
    
    const response = await api.get<{
      logs: Array<any>;
      total: number;
    }>(`/auth/login-history?${params.toString()}`);
    return response;
  },

  // Revoke session
  revokeSession: async (sessionId: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(`/auth/sessions/${sessionId}/revoke`);
    return response;
  },

  // Revoke all sessions
  revokeAllSessions: async (): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/sessions/revoke-all');
    return response;
  },

  // Get active sessions
  getActiveSessions: async (): Promise<Array<{
    id: string;
    createdAt: string;
    lastActive: string;
    ipAddress: string;
    userAgent: string;
    location?: string;
    current: boolean;
  }>> => {
    const response = await api.get<Array<any>>('/auth/sessions');
    return response;
  },
};

// Setup request interceptor for auth
export const setupRequestInterceptor = (
  getToken: () => string | null,
  _refreshToken: () => Promise<string | null>
) => {
  const interceptor: RequestInterceptor = async (config) => {
    const token = getToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return config;
  };
  return addRequestInterceptor(interceptor);
};

// Helper functions
export const getStoredUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const getStoredToken = (): string | null => {
  return localStorage.getItem('access_token');
};

export const isAuthenticated = (): boolean => {
  const token = getStoredToken();
  return !!token;
};

export const hasRole = (role: string): boolean => {
  const user = getStoredUser();
  return user?.role === role;
};

export const hasPermission = (permission: string): boolean => {
  const user = getStoredUser();
  return user?.permissions?.includes(permission) || false;
};

export const clearAuthStorage = (): void => {
  clearAuthToken();
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  localStorage.removeItem('remember_me');
  reinitializeApi();
};

export default authService;