import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { toast } from 'react-toastify';

interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

interface WiFiNetwork {
  ssid: string;
  bssid: string;
  strength: number;
  secured: boolean;
}

interface GeofenceSettings {
  enabled: boolean;
  requireLocation: boolean;
  requireWiFi: boolean;
  allowedLocations: Array<{
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    radius: number;
  }>;
  allowedWiFiNetworks: Array<{
    id: string;
    ssid: string;
    bssid: string;
  }>;
}

interface GeofenceContextType {
  // State
  currentLocation: Location | null;
  currentWiFi: WiFiNetwork | null;
  geofenceSettings: GeofenceSettings;
  isWithinGeofence: boolean;
  isOnApprovedWiFi: boolean;
  locationAccessGranted: boolean;
  locationLoading: boolean;
  
  // Methods
  requestLocationAccess: () => Promise<boolean>;
  refreshLocation: () => Promise<void>;
  checkGeofenceCompliance: () => Promise<{
    locationCompliant: boolean;
    wifiCompliant: boolean;
    message: string;
  }>;
  updateGeofenceSettings: (settings: Partial<GeofenceSettings>) => void;
}

const GeofenceContext = createContext<GeofenceContextType | undefined>(undefined);

export const useGeofence = () => {
  const context = useContext(GeofenceContext);
  if (!context) {
    throw new Error('useGeofence must be used within a GeofenceProvider');
  }
  return context;
};

interface GeofenceProviderProps {
  children: ReactNode;
}

export const GeofenceProvider: React.FC<GeofenceProviderProps> = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [currentWiFi, setCurrentWiFi] = useState<WiFiNetwork | null>(null);
  const [locationAccessGranted, setLocationAccessGranted] = useState<boolean>(false);
  const [locationLoading, setLocationLoading] = useState<boolean>(false);
  
  const [geofenceSettings, setGeofenceSettings] = useState<GeofenceSettings>({
    enabled: true,
    requireLocation: true,
    requireWiFi: false,
    allowedLocations: [
      {
        id: 'office-1',
        name: 'Main Office',
        latitude: 12.9716,
        longitude: 77.5946,
        radius: 500,
      },
      {
        id: 'office-2',
        name: 'Branch Office',
        latitude: 13.0827,
        longitude: 80.2707,
        radius: 300,
      },
    ],
    allowedWiFiNetworks: [
      {
        id: 'wifi-1',
        ssid: 'Office-WiFi-5G',
        bssid: '00:11:22:33:44:55',
      },
      {
        id: 'wifi-2',
        ssid: 'Guest-WiFi',
        bssid: 'AA:BB:CC:DD:EE:FF',
      },
    ],
  });

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
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
  };

  const isWithinGeofence = React.useMemo(() => {
    if (!geofenceSettings.enabled || !geofenceSettings.requireLocation) {
      return true;
    }
    
    if (!currentLocation) {
      return false;
    }

    return geofenceSettings.allowedLocations.some(location => {
      const distance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        location.latitude,
        location.longitude
      );
      return distance <= location.radius;
    });
  }, [currentLocation, geofenceSettings]);

  const isOnApprovedWiFi = React.useMemo(() => {
    if (!geofenceSettings.enabled || !geofenceSettings.requireWiFi) {
      return true;
    }
    
    if (!currentWiFi) {
      return false;
    }

    return geofenceSettings.allowedWiFiNetworks.some(network => 
      network.ssid === currentWiFi.ssid || network.bssid === currentWiFi.bssid
    );
  }, [currentWiFi, geofenceSettings]);

  const requestLocationAccess = async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return false;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationAccessGranted(true);
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          });
          toast.success('Location access granted');
          resolve(true);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error(`Location access denied: ${error.message}`);
          setLocationAccessGranted(false);
          resolve(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    });
  };

  const refreshLocation = async (): Promise<void> => {
    setLocationLoading(true);
    try {
      await requestLocationAccess();
      
      // Mock WiFi detection (in real app, this would use a WiFi API)
      const mockWiFi: WiFiNetwork = {
        ssid: 'Office-WiFi-5G',
        bssid: '00:11:22:33:44:55',
        strength: 85,
        secured: true,
      };
      setCurrentWiFi(mockWiFi);
      
      toast.success('Location and network refreshed');
    } catch (error: any) {
      toast.error(`Error refreshing location: ${error.message}`);
    } finally {
      setLocationLoading(false);
    }
  };

  const checkGeofenceCompliance = async (): Promise<{
    locationCompliant: boolean;
    wifiCompliant: boolean;
    message: string;
  }> => {
    if (!geofenceSettings.enabled) {
      return {
        locationCompliant: true,
        wifiCompliant: true,
        message: 'Geofencing is disabled',
      };
    }

    const locationCompliant = geofenceSettings.requireLocation ? isWithinGeofence : true;
    const wifiCompliant = geofenceSettings.requireWiFi ? isOnApprovedWiFi : true;

    let message = '';
    if (!locationCompliant && !wifiCompliant) {
      message = 'You are not at an authorized location and not connected to an approved WiFi network';
    } else if (!locationCompliant) {
      message = 'You are not at an authorized location';
    } else if (!wifiCompliant) {
      message = 'You are not connected to an approved WiFi network';
    } else {
      message = 'Access compliant with security policies';
    }

    return { locationCompliant, wifiCompliant, message };
  };

  const updateGeofenceSettings = (settings: Partial<GeofenceSettings>) => {
    setGeofenceSettings(prev => ({
      ...prev,
      ...settings,
    }));
    toast.success('Geofence settings updated');
  };

  useEffect(() => {
    // Initialize location access on mount
    const initializeLocation = async () => {
      const hasAccess = await requestLocationAccess();
      if (hasAccess) {
        await refreshLocation();
      }
    };

    initializeLocation();

    // Set up interval to refresh location periodically (every 5 minutes)
    const intervalId = setInterval(() => {
      if (locationAccessGranted) {
        refreshLocation();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  const value: GeofenceContextType = {
    currentLocation,
    currentWiFi,
    geofenceSettings,
    isWithinGeofence,
    isOnApprovedWiFi,
    locationAccessGranted,
    locationLoading,
    requestLocationAccess,
    refreshLocation,
    checkGeofenceCompliance,
    updateGeofenceSettings,
  };

  return (
    <GeofenceContext.Provider value={value}>
      {children}
    </GeofenceContext.Provider>
  );
};

export default GeofenceContext;