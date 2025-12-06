import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import { geolocationService } from '../services/geolocation';
import { useAuth } from './useAuth';

interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
  address?: string;
}

interface WiFiNetwork {
  ssid: string;
  bssid: string;
  strength: number;
  frequency: number;
  channel: number;
  security: string;
  timestamp: number;
}

interface GeofenceStatus {
  isWithinGeofence: boolean;
  isOnApprovedWiFi: boolean;
  currentLocation: Location | null;
  currentWiFi: WiFiNetwork | null;
  complianceScore: number;
  lastCheck: number;
}

interface UseGeofenceReturn {
  // State
  location: Location | null;
  wifi: WiFiNetwork | null;
  geofenceStatus: GeofenceStatus;
  isLoading: boolean;
  isTracking: boolean;
  hasPermission: boolean;
  error: string | null;
  
  // Methods
  requestPermissions: () => Promise<boolean>;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  checkCompliance: () => Promise<{
    compliant: boolean;
    score: number;
    message: string;
    details: {
      location: boolean;
      wifi: boolean;
      time: boolean;
    };
  }>;
  getNearbyLocations: () => Promise<Array<{
    id: string;
    name: string;
    distance: number;
    isWithin: boolean;
  }>>;
  simulateLocation: (lat: number, lng: number) => void;
  simulateWiFi: (ssid: string, bssid: string) => void;
}

export const useGeofence = (): UseGeofenceReturn => {
  const { user } = useAuth();
  const [location, setLocation] = useState<Location | null>(null);
  const [wifi, setWifi] = useState<WiFiNetwork | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [geofenceStatus, setGeofenceStatus] = useState<GeofenceStatus>({
    isWithinGeofence: false,
    isOnApprovedWiFi: false,
    currentLocation: null,
    currentWiFi: null,
    complianceScore: 0,
    lastCheck: 0,
  });

  const watchId = useRef<number | null>(null);
  const wifiIntervalId = useRef<ReturnType<typeof setInterval> | null>(null);

  // Calculate distance between two coordinates in meters
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }, []);

  // Check if within approved locations
  const checkLocationCompliance = useCallback(async (currentLocation: Location): Promise<boolean> => {
    try {
      const approvedLocations = await geolocationService.getApprovedLocations();
      
      return approvedLocations.some((loc: any) => {
        const distance = calculateDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          loc.latitude,
          loc.longitude
        );
        return distance <= loc.radius;
      });
    } catch (err) {
      console.error('Error checking location compliance:', err);
      return false;
    }
  }, [calculateDistance]);

  // Check if on approved WiFi
  const checkWiFiCompliance = useCallback(async (currentWiFi: WiFiNetwork): Promise<boolean> => {
    try {
      const approvedNetworks = await geolocationService.getApprovedWiFiNetworks();
      
      return approvedNetworks.some((network: any) => 
        network.ssid === currentWiFi.ssid || 
        network.bssid === currentWiFi.bssid
      );
    } catch (err) {
      console.error('Error checking WiFi compliance:', err);
      return false;
    }
  }, []);

  // Update geofence status
  const updateGeofenceStatus = useCallback(async () => {
    if (!location) return;

    const locationCompliant = await checkLocationCompliance(location);
    const wifiCompliant = wifi ? await checkWiFiCompliance(wifi) : true;
    
    // Calculate compliance score (0-100)
    let score = 0;
    if (locationCompliant) score += 70;
    if (wifiCompliant) score += 30;
    
    const now = Date.now();
    const timeCompliant = await geolocationService.checkTimeCompliance(now);

    setGeofenceStatus({
      isWithinGeofence: locationCompliant,
      isOnApprovedWiFi: wifiCompliant,
      currentLocation: location,
      currentWiFi: wifi,
      complianceScore: score,
      lastCheck: now,
    });

    // Send compliance data to server
    try {
      await geolocationService.reportCompliance({
        userId: user?.id || 'anonymous',
        locationCompliant,
        wifiCompliant,
        timeCompliant,
        location,
        wifi: wifi || undefined,
        timestamp: now,
        score,
      });
    } catch (err) {
      console.error('Error reporting compliance:', err);
    }

    return { locationCompliant, wifiCompliant, timeCompliant };
  }, [location, wifi, checkLocationCompliance, checkWiFiCompliance, user]);

  // Request location and WiFi permissions
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const locationPermission = await geolocationService.requestLocationPermission();
      const wifiPermission = await geolocationService.requestWiFiPermission();
      
      const granted = locationPermission && wifiPermission;
      setHasPermission(granted);
      
      if (granted) {
        toast.success('Location and WiFi permissions granted');
      } else {
        toast.warning('Some permissions were denied. Some features may not work properly.');
      }
      
      return granted;
    } catch (err: any) {
      setError(err.message);
      toast.error(`Permission error: ${err.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Start tracking location and WiFi
  const startTracking = useCallback(async () => {
    if (!hasPermission) {
      const granted = await requestPermissions();
      if (!granted) return;
    }

    setIsTracking(true);
    
    // Start location tracking
    try {
      const watchIdRef = geolocationService.watchPosition(
        (position) => {
          const newLocation: Location = {
            latitude: position.latitude,
            longitude: position.longitude,
            accuracy: position.accuracy,
            timestamp: position.timestamp,
          };
          setLocation(newLocation);
          updateGeofenceStatus();
        },
        (err) => {
          setError(`Location error: ${err.message}`);
          toast.error('Location tracking error');
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 5000,
        }
      );
      
      watchId.current = watchIdRef;
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to start location tracking');
    }

    // Start WiFi scanning (simulated in browser)
    wifiIntervalId.current = setInterval(async () => {
      try {
        const wifiInfo = await geolocationService.scanWiFi();
        if (wifiInfo) {
          setWifi(wifiInfo);
          updateGeofenceStatus();
        }
      } catch (err) {
        console.error('WiFi scan error:', err);
      }
    }, 30000); // Scan every 30 seconds

    toast.success('Geofence tracking started');
  }, [hasPermission, requestPermissions, updateGeofenceStatus]);

  // Stop tracking
  const stopTracking = useCallback(() => {
    if (watchId.current !== null) {
      geolocationService.clearWatch(watchId.current);
      watchId.current = null;
    }
    
    if (wifiIntervalId.current !== null) {
      clearInterval(wifiIntervalId.current);
      wifiIntervalId.current = null;
    }
    
    setIsTracking(false);
    toast.info('Geofence tracking stopped');
  }, []);

  // Check compliance manually
  const checkCompliance = useCallback(async () => {
    setIsLoading(true);
    
    try {
      if (!location) {
        throw new Error('No location data available');
      }

      const compliance = await updateGeofenceStatus();
      if (!compliance) {
        throw new Error('Failed to check compliance');
      }

      const { locationCompliant, wifiCompliant, timeCompliant } = compliance;
      const compliant = locationCompliant && wifiCompliant && timeCompliant;
      
      let message = '';
      if (!locationCompliant && !wifiCompliant) {
        message = 'You are not at an authorized location and not connected to approved WiFi';
      } else if (!locationCompliant) {
        message = 'You are not at an authorized location';
      } else if (!wifiCompliant) {
        message = 'You are not connected to an approved WiFi network';
      } else if (!timeCompliant) {
        message = 'Access is not allowed at this time';
      } else {
        message = 'Access compliant with all security policies';
      }

      const score = geofenceStatus.complianceScore;
      
      return {
        compliant,
        score,
        message,
        details: {
          location: locationCompliant,
          wifi: wifiCompliant,
          time: timeCompliant,
        },
      };
    } catch (err: any) {
      setError(err.message);
      toast.error(`Compliance check failed: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [location, updateGeofenceStatus, geofenceStatus.complianceScore]);

  // Get nearby approved locations
  const getNearbyLocations = useCallback(async () => {
    if (!location) {
      throw new Error('No location data available');
    }

    try {
      const approvedLocations = await geolocationService.getApprovedLocations();
      
      return approvedLocations.map(loc => {
        const distance = calculateDistance(
          location.latitude,
          location.longitude,
          loc.latitude,
          loc.longitude
        );
        
        return {
          id: loc.id,
          name: loc.name,
          distance: Math.round(distance),
          isWithin: distance <= loc.radius,
        };
      }).sort((a, b) => a.distance - b.distance);
    } catch (err) {
      console.error('Error getting nearby locations:', err);
      throw err;
    }
  }, [location, calculateDistance]);

  // Simulation methods for development
  const simulateLocation = useCallback((lat: number, lng: number) => {
    const simulatedLocation: Location = {
      latitude: lat,
      longitude: lng,
      accuracy: 10,
      timestamp: Date.now(),
    };
    setLocation(simulatedLocation);
    updateGeofenceStatus();
    toast.info(`Location simulated to ${lat}, ${lng}`);
  }, [updateGeofenceStatus]);

  const simulateWiFi = useCallback((ssid: string, bssid: string) => {
    const simulatedWiFi: WiFiNetwork = {
      ssid,
      bssid,
      strength: 85,
      frequency: 5,
      channel: 36,
      security: 'WPA2',
      timestamp: Date.now(),
    };
    setWifi(simulatedWiFi);
    updateGeofenceStatus();
    toast.info(`WiFi simulated to ${ssid}`);
  }, [updateGeofenceStatus]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  // Initial load
  useEffect(() => {
    const initialize = async () => {
      try {
        const permissions = await geolocationService.checkPermissions();
        setHasPermission(permissions.location && permissions.wifi);
        
        if (permissions.location) {
          const currentLocation = await geolocationService.getCurrentPosition();
          if (currentLocation) {
            setLocation(currentLocation);
          }
          
          const currentWiFi = await geolocationService.scanWiFi();
          if (currentWiFi) {
            setWifi(currentWiFi);
          }
          
          await updateGeofenceStatus();
        }
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [updateGeofenceStatus]);

  return {
    location,
    wifi,
    geofenceStatus,
    isLoading,
    isTracking,
    hasPermission,
    error,
    requestPermissions,
    startTracking,
    stopTracking,
    checkCompliance,
    getNearbyLocations,
    simulateLocation,
    simulateWiFi,
  };
};

export default useGeofence;