import { api } from './api';

// Types
export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
}

export interface WiFiNetwork {
  ssid: string;
  bssid: string;
  strength: number;
  frequency: number;
  channel: number;
  security: string;
  timestamp: number;
  ipAddress?: string;
  gateway?: string;
  dns?: string[];
}

export interface GeofenceArea {
  id: string;
  name: string;
  type: 'office' | 'remote' | 'home' | 'custom';
  latitude: number;
  longitude: number;
  radius: number; // in meters
  address?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovedWiFiNetwork {
  id: string;
  ssid: string;
  bssid: string;
  locationId?: string;
  description?: string;
  securityType: string;
  isActive: boolean;
  createdAt: string;
  lastSeen?: string;
}

export interface ComplianceCheck {
  userId: string;
  locationCompliant: boolean;
  wifiCompliant: boolean;
  timeCompliant: boolean;
  location?: Location;
  wifi?: WiFiNetwork;
  timestamp: number;
  score: number;
  message?: string;
}

export interface LocationHistory {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  address?: string;
  wifiNetwork?: string;
  timestamp: string;
  source: 'gps' | 'wifi' | 'ip' | 'manual';
  activity?: string;
}

export interface TimeRestriction {
  id: string;
  name: string;
  days: number[]; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  timezone: string;
  isActive: boolean;
  appliesTo: string[]; // user IDs or 'all'
  createdAt: string;
}

// Geolocation Service
export const geolocationService = {
  // Location methods
  getCurrentPosition: async (options?: PositionOptions): Promise<Location> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || undefined,
            altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined,
            timestamp: position.timestamp,
          };
          resolve(location);
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
          ...options,
        }
      );
    });
  },

  watchPosition: (
    onSuccess: (location: Location) => void,
    onError: (error: Error) => void,
    options?: PositionOptions
  ): number => {
    if (!navigator.geolocation) {
      onError(new Error('Geolocation is not supported by this browser'));
      return -1;
    }

    return navigator.geolocation.watchPosition(
      (position) => {
        const location: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || undefined,
          altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
          heading: position.coords.heading || undefined,
          speed: position.coords.speed || undefined,
          timestamp: position.timestamp,
        };
        onSuccess(location);
      },
      (error) => {
        onError(new Error(`Geolocation error: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
        ...options,
      }
    );
  },

  clearWatch: (watchId: number): void => {
    navigator.geolocation.clearWatch(watchId);
  },

  // Reverse geocoding
  reverseGeocode: async (latitude: number, longitude: number): Promise<Partial<Location>> => {
    try {
      // Using Nominatim (OpenStreetMap) for reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Reverse geocoding failed');
      }

      const data = await response.json();
      
      return {
        address: data.display_name,
        city: data.address?.city || data.address?.town || data.address?.village,
        country: data.address?.country,
        postalCode: data.address?.postcode,
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return {};
    }
  },

  // WiFi methods (Note: Browser APIs don't provide WiFi info directly)
  scanWiFi: async (): Promise<WiFiNetwork | null> => {
    // In a real application, this would use platform-specific APIs
    // For web, we can only get network info, not specific WiFi details
    try {
      // Check connection type
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      
      if (connection) {
        return {
          ssid: 'Unknown', // Cannot get SSID in browsers for security reasons
          bssid: 'Unknown',
          strength: connection.downlink || 0,
          frequency: connection.effectiveType === '4g' ? 2400 : 5000,
          channel: 1,
          security: 'Unknown',
          timestamp: Date.now(),
        };
      }
      
      return null;
    } catch (error) {
      console.error('WiFi scan error:', error);
      return null;
    }
  },

  // Geofence management
  getApprovedLocations: async (): Promise<GeofenceArea[]> => {
    const response = await api.get<GeofenceArea[]>('/geofence/locations');
    return response;
  },

  addApprovedLocation: async (location: Omit<GeofenceArea, 'id' | 'createdAt' | 'updatedAt'>): Promise<GeofenceArea> => {
    const response = await api.post<GeofenceArea>('/geofence/locations', location);
    return response;
  },

  updateApprovedLocation: async (id: string, updates: Partial<GeofenceArea>): Promise<GeofenceArea> => {
    const response = await api.put<GeofenceArea>(`/geofence/locations/${id}`, updates);
    return response;
  },

  deleteApprovedLocation: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/geofence/locations/${id}`);
    return response;
  },

  checkLocationInGeofence: async (latitude: number, longitude: number): Promise<{
    isWithin: boolean;
    matchedLocation?: GeofenceArea;
    distance?: number;
  }> => {
    const response = await api.post<{
      isWithin: boolean;
      matchedLocation?: GeofenceArea;
      distance?: number;
    }>('/geofence/check', { latitude, longitude });
    return response;
  },

  // WiFi network management
  getApprovedWiFiNetworks: async (): Promise<ApprovedWiFiNetwork[]> => {
    const response = await api.get<ApprovedWiFiNetwork[]>('/geofence/wifi');
    return response;
  },

  addApprovedWiFiNetwork: async (
    network: Omit<ApprovedWiFiNetwork, 'id' | 'createdAt' | 'lastSeen'>
  ): Promise<ApprovedWiFiNetwork> => {
    const response = await api.post<ApprovedWiFiNetwork>('/geofence/wifi', network);
    return response;
  },

  updateApprovedWiFiNetwork: async (
    id: string,
    updates: Partial<ApprovedWiFiNetwork>
  ): Promise<ApprovedWiFiNetwork> => {
    const response = await api.put<ApprovedWiFiNetwork>(`/geofence/wifi/${id}`, updates);
    return response;
  },

  deleteApprovedWiFiNetwork: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/geofence/wifi/${id}`);
    return response;
  },

  checkWiFiCompliance: async (ssid: string, bssid: string): Promise<{
    isApproved: boolean;
    matchedNetwork?: ApprovedWiFiNetwork;
  }> => {
    const response = await api.post<{
      isApproved: boolean;
      matchedNetwork?: ApprovedWiFiNetwork;
    }>('/geofence/wifi/check', { ssid, bssid });
    return response;
  },

  // Compliance checking
  checkCompliance: async (location?: Location, wifi?: WiFiNetwork): Promise<ComplianceCheck> => {
    const response = await api.post<ComplianceCheck>('/geofence/compliance/check', {
      location,
      wifi,
    });
    return response;
  },

  reportCompliance: async (check: Omit<ComplianceCheck, 'id'>): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/geofence/compliance/report', check);
    return response;
  },

  getComplianceHistory: async (
    userId?: string,
    startDate?: string,
    endDate?: string,
    page = 1,
    limit = 50
  ): Promise<{
    checks: ComplianceCheck[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> => {
    const params: any = { page, limit };
    if (userId) params.userId = userId;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await api.get<{
      checks: ComplianceCheck[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>('/geofence/compliance/history', { params });
    return response;
  },

  // Time restrictions
  getTimeRestrictions: async (): Promise<TimeRestriction[]> => {
    const response = await api.get<TimeRestriction[]>('/geofence/time-restrictions');
    return response;
  },

  addTimeRestriction: async (
    restriction: Omit<TimeRestriction, 'id' | 'createdAt'>
  ): Promise<TimeRestriction> => {
    const response = await api.post<TimeRestriction>('/geofence/time-restrictions', restriction);
    return response;
  },

  updateTimeRestriction: async (
    id: string,
    updates: Partial<TimeRestriction>
  ): Promise<TimeRestriction> => {
    const response = await api.put<TimeRestriction>(`/geofence/time-restrictions/${id}`, updates);
    return response;
  },

  deleteTimeRestriction: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/geofence/time-restrictions/${id}`);
    return response;
  },

  checkTimeCompliance: async (timestamp?: number): Promise<boolean> => {
    const ts = timestamp || Date.now();
    const response = await api.post<boolean>('/geofence/time/check', { timestamp: ts });
    return response;
  },

  // Location history
  logLocation: async (location: Omit<LocationHistory, 'id' | 'timestamp'>): Promise<LocationHistory> => {
    const response = await api.post<LocationHistory>('/geofence/location/log', location);
    return response;
  },

  getLocationHistory: async (
    userId?: string,
    startDate?: string,
    endDate?: string,
    page = 1,
    limit = 100
  ): Promise<{
    locations: LocationHistory[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> => {
    const params: any = { page, limit };
    if (userId) params.userId = userId;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await api.get<{
      locations: LocationHistory[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>('/geofence/location/history', { params });
    return response;
  },

  // Analytics
  getGeofenceStats: async (timeRange?: 'day' | 'week' | 'month' | 'year'): Promise<{
    totalLocations: number;
    totalWiFiNetworks: number;
    complianceRate: number;
    averageScore: number;
    topLocations: Array<{ location: GeofenceArea; accessCount: number }>;
    recentViolations: ComplianceCheck[];
  }> => {
    const params = timeRange ? { timeRange } : undefined;
    const response = await api.get<{
      totalLocations: number;
      totalWiFiNetworks: number;
      complianceRate: number;
      averageScore: number;
      topLocations: Array<any>;
      recentViolations: ComplianceCheck[];
    }>('/geofence/stats', { params });
    return response;
  },

  // Permissions
  requestLocationPermission: async (): Promise<boolean> => {
    if (!navigator.permissions) {
      return false;
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' as any });
      return result.state === 'granted';
    } catch (error) {
      console.error('Permission query error:', error);
      return false;
    }
  },

  requestWiFiPermission: async (): Promise<boolean> => {
    // WiFi permissions are not available in standard web APIs
    // In a real app, this would be platform-specific
    return true;
  },

  checkPermissions: async (): Promise<{ location: boolean; wifi: boolean }> => {
    const locationPermission = await geolocationService.requestLocationPermission();
    const wifiPermission = await geolocationService.requestWiFiPermission();
    
    return {
      location: locationPermission,
      wifi: wifiPermission,
    };
  },

  // Helper methods
  calculateDistance: (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  },

  isPointInCircle: (
    pointLat: number,
    pointLon: number,
    circleLat: number,
    circleLon: number,
    radius: number
  ): boolean => {
    const distance = geolocationService.calculateDistance(
      pointLat,
      pointLon,
      circleLat,
      circleLon
    );
    return distance <= radius;
  },

  formatLocation: (location: Location): string => {
    if (location.address) {
      return location.address;
    }
    return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
  },

  // Batch operations
  bulkCheckCompliance: async (
    checks: Array<{ userId: string; location?: Location; wifi?: WiFiNetwork }>
  ): Promise<ComplianceCheck[]> => {
    const response = await api.post<ComplianceCheck[]>('/geofence/compliance/bulk-check', { checks });
    return response;
  },
};

// Export as default
export default geolocationService;