export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'employee';
  department: string;
  position?: string;
  phone?: string;
  isActive: boolean;
  lastLogin?: Date;
  permissions: string[];
  createdAt: Date;
  remoteAccess: boolean;
  remoteAccessExpiry?: Date;
}

export interface File {
  id: string;
  name: string;
  path: string;
  size: number;
  type: string;
  encrypted: boolean;
  encryptionType: 'postquantum' | 'aes' | 'none';
  createdAt: Date;
  modifiedAt: Date;
  accessedAt?: Date;
  ownerId: string;
  permissions: string[];
  isPublic: boolean;
  tags: string[];
}

export interface AccessLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: 'login' | 'logout' | 'file_access' | 'file_decrypt' | 'failed_attempt' | 'suspicious_activity';
  fileId?: string;
  fileName?: string;
  status: 'success' | 'failed' | 'blocked';
  ipAddress: string;
  location?: string;
  coordinates?: { lat: number; lng: number };
  userAgent: string;
  timestamp: Date;
  details?: string;
  aiRiskScore?: number;
}

export interface GeofenceRule {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  wifiNetwork?: string;
  wifiBSSID?: string;
  timeStart: string;
  timeEnd: string;
  daysOfWeek: number[];
  isActive: boolean;
  isPrimary: boolean;
}

export interface AccessRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  notes?: string;
  durationDays: number;
  location?: string;
  filesRequested?: string[];
}

export interface SecurityAlert {
  id: string;
  type: 'multiple_failures' | 'unusual_location' | 'after_hours' | 'suspicious_pattern' | 'unauthorized_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  userName?: string;
  description: string;
  detectedAt: Date;
  resolvedAt?: Date;
  status: 'active' | 'resolved';
  aiConfidence: number;
  riskFactors: string[];
  recommendedActions: string[];
}

export interface FileAccessConditions {
  location: boolean;
  wifi: boolean;
  time: boolean;
  remoteAccess: boolean;
  locationName?: string;
  wifiNetwork?: string;
  currentTime?: string;
}