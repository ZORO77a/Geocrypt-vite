import { api } from './api';

// Types
export interface FileMetadata {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size: number;
  mimeType?: string;
  extension?: string;
  path: string;
  parentId?: string;
  encrypted: boolean;
  encryptionAlgorithm?: string;
  hash: string;
  version: number;
}

export interface FileSecurity {
  locationRestricted: boolean;
  wifiRestricted: boolean;
  timeRestricted: boolean;
  allowedLocations?: string[];
  allowedWiFiNetworks?: string[];
  allowedHours?: {
    start: string;
    end: string;
    timezone: string;
  };
  maxAccessCount?: number;
  expiresAt?: string;
  requireApproval: boolean;
  encryptionKeyId?: string;
}

export interface FileAccess {
  id: string;
  fileId: string;
  userId: string;
  userName: string;
  action: 'view' | 'download' | 'upload' | 'delete' | 'share' | 'modify';
  timestamp: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    address?: string;
  };
  wifiNetwork?: string;
  ipAddress?: string;
  userAgent?: string;
  status: 'granted' | 'denied' | 'pending';
  reason?: string;
}

export interface FileShare {
  id: string;
  fileId: string;
  sharedBy: string;
  sharedWith: string;
  sharedWithEmail: string;
  permission: 'view' | 'download' | 'edit';
  expiresAt?: string;
  createdAt: string;
  accessedAt?: string;
  accessCount: number;
  isActive: boolean;
  shareLink?: string;
  requirePassword?: boolean;
}

export interface FileVersion {
  id: string;
  fileId: string;
  version: number;
  size: number;
  hash: string;
  uploadedBy: string;
  uploadedAt: string;
  changes?: string;
  encrypted: boolean;
}

export interface FileUploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'encrypting' | 'processing' | 'completed' | 'failed';
  error?: string;
  uploadedBytes: number;
  totalBytes: number;
  speed?: number;
  estimatedTime?: number;
}

export interface FileSearchFilters {
  name?: string;
  type?: string[];
  uploadedBy?: string;
  dateFrom?: string;
  dateTo?: string;
  sizeMin?: number;
  sizeMax?: number;
  tags?: string[];
  encrypted?: boolean;
  locationRestricted?: boolean;
  sortBy?: 'name' | 'size' | 'date' | 'type';
  sortOrder?: 'asc' | 'desc';
}

export interface FileStats {
  totalFiles: number;
  totalSize: number;
  encryptedFiles: number;
  locationRestricted: number;
  wifiRestricted: number;
  byType: Record<string, number>;
  byUser: Array<{ userId: string; count: number; size: number }>;
  recentActivity: FileAccess[];
}

// File Service
export const fileService = {
  // File operations
  uploadFile: async (
    file: File,
    parentId?: string,
    security?: Partial<FileSecurity>,
    onProgress?: (progress: FileUploadProgress) => void
  ): Promise<FileMetadata> => {
    const formData = new FormData();
    formData.append('file', file);
    if (parentId) formData.append('parentId', parentId);
    if (security) formData.append('security', JSON.stringify(security));

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent: any) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          const speed = progressEvent.rate || 0;
          const estimatedTime = progressEvent.estimated || 0;

          onProgress({
            fileId: 'temp',
            fileName: file.name,
            progress,
            status: 'uploading',
            uploadedBytes: progressEvent.loaded,
            totalBytes: progressEvent.total,
            speed,
            estimatedTime,
          });
        }
      },
    };

    const response = await api.post<FileMetadata>('/files/upload', formData, config);
    return response;
  },

  getFiles: async (
    folderId?: string,
    page = 1,
    limit = 50,
    filters?: FileSearchFilters
  ): Promise<{
    files: FileMetadata[];
    folders: FileMetadata[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> => {
    const params: any = { page, limit };
    if (folderId) params.folderId = folderId;
    if (filters) {
      Object.assign(params, filters);
    }

    const response = await api.get<{
      files: FileMetadata[];
      folders: FileMetadata[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>('/files', { params });
    return response;
  },

  getFile: async (fileId: string): Promise<FileMetadata & { security: FileSecurity }> => {
    const response = await api.get<FileMetadata & { security: FileSecurity }>(`/files/${fileId}`);
    return response;
  },

  updateFile: async (fileId: string, updates: Partial<FileMetadata>): Promise<FileMetadata> => {
    const response = await api.put<FileMetadata>(`/files/${fileId}`, updates);
    return response;
  },

  deleteFile: async (fileId: string, permanent = false): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/files/${fileId}`, {
      params: { permanent },
    });
    return response;
  },

  renameFile: async (fileId: string, newName: string): Promise<FileMetadata> => {
    const response = await api.patch<FileMetadata>(`/files/${fileId}/rename`, { newName });
    return response;
  },

  moveFile: async (fileId: string, newParentId: string): Promise<FileMetadata> => {
    const response = await api.patch<FileMetadata>(`/files/${fileId}/move`, { newParentId });
    return response;
  },

  copyFile: async (fileId: string, targetFolderId: string): Promise<FileMetadata> => {
    const response = await api.post<FileMetadata>(`/files/${fileId}/copy`, { targetFolderId });
    return response;
  },

  // File content operations
  downloadFile: async (
    fileId: string,
    version?: number,
    onProgress?: (progress: number) => void
  ): Promise<Blob> => {
    const params = version ? { version } : undefined;
    
    const config = {
      params,
      responseType: 'blob' as const,
      onDownloadProgress: (progressEvent: any) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    };

    const response = await api.get(`/files/${fileId}/download`, config);
    return response;
  },

  previewFile: async (fileId: string, version?: number): Promise<string> => {
    const params = version ? { version } : undefined;
    const response = await api.get<string>(`/files/${fileId}/preview`, { params });
    return response;
  },

  // Security operations
  updateFileSecurity: async (
    fileId: string,
    security: Partial<FileSecurity>
  ): Promise<FileSecurity> => {
    const response = await api.put<FileSecurity>(`/files/${fileId}/security`, security);
    return response;
  },

  requestFileAccess: async (
    fileId: string,
    reason: string,
    accessType: 'temporary' | 'scheduled' | 'emergency',
    duration?: string,
    startTime?: string,
    endTime?: string
  ): Promise<{
    requestId: string;
    status: 'pending' | 'approved' | 'denied';
    message: string;
  }> => {
    const response = await api.post<{
      requestId: string;
      status: 'pending' | 'approved' | 'denied';
      message: string;
    }>(`/files/${fileId}/access/request`, {
      reason,
      accessType,
      duration,
      startTime,
      endTime,
    });
    return response;
  },

  checkFileAccess: async (fileId: string): Promise<{
    canAccess: boolean;
    reasons?: string[];
    requiresApproval?: boolean;
    pendingRequest?: boolean;
  }> => {
    const response = await api.get<{
      canAccess: boolean;
      reasons?: string[];
      requiresApproval?: boolean;
      pendingRequest?: boolean;
    }>(`/files/${fileId}/access/check`);
    return response;
  },

  // Share operations
  shareFile: async (
    fileId: string,
    email: string,
    permission: 'view' | 'download' | 'edit',
    expiresAt?: string,
    requirePassword?: boolean,
    password?: string
  ): Promise<FileShare> => {
    const response = await api.post<FileShare>(`/files/${fileId}/share`, {
      email,
      permission,
      expiresAt,
      requirePassword,
      password,
    });
    return response;
  },

  getFileShares: async (fileId: string): Promise<FileShare[]> => {
    const response = await api.get<FileShare[]>(`/files/${fileId}/shares`);
    return response;
  },

  updateShare: async (
    shareId: string,
    updates: Partial<FileShare>
  ): Promise<FileShare> => {
    const response = await api.put<FileShare>(`/files/shares/${shareId}`, updates);
    return response;
  },

  revokeShare: async (shareId: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/files/shares/${shareId}`);
    return response;
  },

  // Version control
  getFileVersions: async (fileId: string): Promise<FileVersion[]> => {
    const response = await api.get<FileVersion[]>(`/files/${fileId}/versions`);
    return response;
  },

  restoreVersion: async (fileId: string, version: number): Promise<FileMetadata> => {
    const response = await api.post<FileMetadata>(`/files/${fileId}/versions/${version}/restore`);
    return response;
  },

  // Search operations
  searchFiles: async (
    query: string,
    page = 1,
    limit = 50,
    filters?: FileSearchFilters
  ): Promise<{
    results: FileMetadata[];
    total: number;
    page: number;
    limit: number;
  }> => {
    const params: any = { query, page, limit };
    if (filters) {
      Object.assign(params, filters);
    }

    const response = await api.get<{
      results: FileMetadata[];
      total: number;
      page: number;
      limit: number;
    }>('/files/search', { params });
    return response;
  },

  // Folder operations
  createFolder: async (
    name: string,
    parentId?: string,
    security?: Partial<FileSecurity>
  ): Promise<FileMetadata> => {
    const response = await api.post<FileMetadata>('/folders', {
      name,
      parentId,
      security,
    });
    return response;
  },

  getFolderTree: async (folderId?: string): Promise<FileMetadata[]> => {
    const params = folderId ? { folderId } : undefined;
    const response = await api.get<FileMetadata[]>('/folders/tree', { params });
    return response;
  },

  // Statistics and analytics
  getFileStats: async (timeRange?: 'day' | 'week' | 'month' | 'year'): Promise<FileStats> => {
    const params = timeRange ? { timeRange } : undefined;
    const response = await api.get<FileStats>('/files/stats', { params });
    return response;
  },

  getAccessLogs: async (
    fileId?: string,
    page = 1,
    limit = 50,
    dateFrom?: string,
    dateTo?: string
  ): Promise<{
    logs: FileAccess[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> => {
    const params: any = { page, limit };
    if (fileId) params.fileId = fileId;
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;

    const response = await api.get<{
      logs: FileAccess[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>('/files/access-logs', { params });
    return response;
  },

  // Bulk operations
  bulkDelete: async (fileIds: string[], permanent = false): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/files/bulk/delete', {
      fileIds,
      permanent,
    });
    return response;
  },

  bulkMove: async (fileIds: string[], targetFolderId: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/files/bulk/move', {
      fileIds,
      targetFolderId,
    });
    return response;
  },

  bulkUpdateSecurity: async (
    fileIds: string[],
    security: Partial<FileSecurity>
  ): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/files/bulk/security', {
      fileIds,
      security,
    });
    return response;
  },

  // Trash operations
  getTrash: async (page = 1, limit = 50): Promise<{
    items: Array<FileMetadata & { deletedAt: string; deletedBy: string }>;
    total: number;
    page: number;
    limit: number;
  }> => {
    const response = await api.get<{
      items: Array<any>;
      total: number;
      page: number;
      limit: number;
    }>('/files/trash', { params: { page, limit } });
    return response;
  },

  restoreFromTrash: async (fileId: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(`/files/trash/${fileId}/restore`);
    return response;
  },

  emptyTrash: async (): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/files/trash/empty');
    return response;
  },

  // Real-time updates
  subscribeToFileUpdates: (fileId: string, callback: (file: FileMetadata) => void) => {
    // Implementation would depend on your real-time solution (WebSocket, SSE, etc.)
    console.log(`Subscribed to updates for file ${fileId}`);
    // Return unsubscribe function
    return () => {
      console.log(`Unsubscribed from updates for file ${fileId}`);
    };
  },

  // Encryption operations
  reencryptFile: async (
    fileId: string,
    newAlgorithm?: string
  ): Promise<{ message: string; algorithm: string }> => {
    const response = await api.post<{ message: string; algorithm: string }>(
      `/files/${fileId}/reencrypt`,
      { newAlgorithm }
    );
    return response;
  },

  verifyFileIntegrity: async (fileId: string): Promise<{ valid: boolean; hash: string }> => {
    const response = await api.get<{ valid: boolean; hash: string }>(
      `/files/${fileId}/verify`
    );
    return response;
  },
};

// Helper functions
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileIcon = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  const iconMap: Record<string, string> = {
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    txt: '📃',
    xls: '📊',
    xlsx: '📊',
    ppt: '📽️',
    pptx: '📽️',
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    gif: '🖼️',
    mp4: '🎥',
    avi: '🎥',
    mov: '🎥',
    mp3: '🎵',
    wav: '🎵',
    zip: '📦',
    rar: '📦',
    exe: '⚙️',
    js: '📜',
    ts: '📜',
    html: '🌐',
    css: '🎨',
    json: '📋',
    xml: '📋',
    csv: '📋',
    sql: '🗄️',
  };
  
  return iconMap[extension || ''] || '📄';
};

export const isImageFile = (fileName: string): boolean => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
  const extension = fileName.split('.').pop()?.toLowerCase();
  return imageExtensions.includes(extension || '');
};

export const isVideoFile = (fileName: string): boolean => {
  const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'];
  const extension = fileName.split('.').pop()?.toLowerCase();
  return videoExtensions.includes(extension || '');
};

export const isAudioFile = (fileName: string): boolean => {
  const audioExtensions = ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'];
  const extension = fileName.split('.').pop()?.toLowerCase();
  return audioExtensions.includes(extension || '');
};

export const isDocumentFile = (fileName: string): boolean => {
  const documentExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'];
  const extension = fileName.split('.').pop()?.toLowerCase();
  return documentExtensions.includes(extension || '');
};

export default fileService;