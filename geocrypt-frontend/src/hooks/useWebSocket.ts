import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './useauth';

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

interface WebSocketEvent {
  type: 'connected' | 'disconnected' | 'error' | 'message';
  data?: any;
  timestamp: number;
}

interface UseWebSocketReturn {
  // State
  isConnected: boolean;
  isConnecting: boolean;
  lastMessage: WebSocketMessage | null;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'reconnecting';
  events: WebSocketEvent[];
  
  // Methods
  connect: () => Promise<void>;
  disconnect: () => void;
  sendMessage: (type: string, data: any) => boolean;
  subscribe: (channel: string, callback: (data: any) => void) => string;
  unsubscribe: (subscriptionId: string) => void;
  reconnect: () => Promise<void>;
  
  // Statistics
  statistics: {
    messagesSent: number;
    messagesReceived: number;
    connectionTime: number;
    lastActivity: number;
  };
}

export const useWebSocket = (url?: string): UseWebSocketReturn => {
  const { user } = useAuth();
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const pingInterval = useRef<NodeJS.Timeout | null>(null);
  const subscriptions = useRef<Map<string, (data: any) => void>>(new Map());
  
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'reconnecting'>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [events, setEvents] = useState<WebSocketEvent[]>([]);
  const [statistics, setStatistics] = useState({
    messagesSent: 0,
    messagesReceived: 0,
    connectionTime: 0,
    lastActivity: Date.now(),
  });

  const wsUrl = url || process.env.REACT_APP_WS_URL || 'wss://api.geocrypt.com/ws';

  // Add event to log
  const addEvent = useCallback((type: WebSocketEvent['type'], data?: any) => {
    const event: WebSocketEvent = {
      type,
      data,
      timestamp: Date.now(),
    };
    setEvents(prev => [event, ...prev.slice(0, 99)]); // Keep last 100 events
  }, []);

  // Update statistics
  const updateStatistics = useCallback((updates: Partial<typeof statistics>) => {
    setStatistics(prev => ({ ...prev, ...updates }));
  }, []);

  // Send ping to keep connection alive
  const sendPing = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'ping', data: { timestamp: Date.now() } }));
    }
  }, []);

  // Handle incoming messages
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      setLastMessage(message);
      updateStatistics({
        messagesReceived: statistics.messagesReceived + 1,
        lastActivity: Date.now(),
      });

      // Handle different message types
      switch (message.type) {
        case 'notification':
          handleNotification(message.data);
          break;
        case 'file_access':
          handleFileAccess(message.data);
          break;
        case 'security_alert':
          handleSecurityAlert(message.data);
          break;
        case 'location_update':
          handleLocationUpdate(message.data);
          break;
        case 'pong':
          // Heartbeat response
          break;
        default:
          // Check for subscriptions
          subscriptions.current.forEach(callback => {
            if (message.type.startsWith('channel_')) {
              callback(message.data);
            }
          });
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }, [statistics.messagesReceived, updateStatistics]);

  // Handle different message types
  const handleNotification = useCallback((data: any) => {
    const { title, message, type = 'info' } = data;
    
    switch (type) {
      case 'success':
        toast.success(message, { toastId: `ws-${Date.now()}` });
        break;
      case 'error':
        toast.error(message, { toastId: `ws-${Date.now()}` });
        break;
      case 'warning':
        toast.warning(message, { toastId: `ws-${Date.now()}` });
        break;
      case 'info':
        toast.info(message, { toastId: `ws-${Date.now()}` });
        break;
    }
    
    // Dispatch custom event for notification handling
    window.dispatchEvent(new CustomEvent('websocket-notification', { detail: data }));
  }, []);

  const handleFileAccess = useCallback((data: any) => {
    const { file, user: accessUser, action, timestamp } = data;
    
    // Update file access in real-time
    window.dispatchEvent(new CustomEvent('file-access-update', { detail: data }));
    
    if (user?.id !== accessUser.id && action === 'download') {
      toast.info(`${accessUser.name} downloaded ${file.name}`, {
        toastId: `file-access-${timestamp}`,
      });
    }
  }, [user]);

  const handleSecurityAlert = useCallback((data: any) => {
    const { severity, message, location, timestamp } = data;
    
    // Dispatch security alert event
    window.dispatchEvent(new CustomEvent('security-alert', { detail: data }));
    
    // Show toast based on severity
    const toastOptions = {
      toastId: `security-alert-${timestamp}`,
      autoClose: severity === 'critical' ? false : 5000,
    };
    
    switch (severity) {
      case 'critical':
        toast.error(`🚨 CRITICAL: ${message}`, toastOptions);
        break;
      case 'high':
        toast.error(`⚠️ HIGH: ${message}`, toastOptions);
        break;
      case 'medium':
        toast.warning(`⚠️ MEDIUM: ${message}`, toastOptions);
        break;
      case 'low':
        toast.info(`ℹ️ LOW: ${message}`, toastOptions);
        break;
    }
  }, []);

  const handleLocationUpdate = useCallback((data: any) => {
    const { users } = data;
    
    // Update user locations in real-time
    window.dispatchEvent(new CustomEvent('location-update', { detail: data }));
    
    // Log activity for admins
    if (user?.role === 'admin') {
      console.log('Location updates:', users);
    }
  }, [user]);

  // Connect to WebSocket
  const connect = useCallback(async () => {
    if (ws.current?.readyState === WebSocket.OPEN || isConnecting) {
      return;
    }

    setIsConnecting(true);
    setConnectionStatus('connecting');
    addEvent('connecting');

    try {
      const token = localStorage.getItem('access_token');
      const wsUrlWithAuth = `${wsUrl}?token=${token}`;
      
      ws.current = new WebSocket(wsUrlWithAuth);

      ws.current.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        setConnectionStatus('connected');
        addEvent('connected');
        
        updateStatistics({ connectionTime: Date.now() });
        
        // Start ping interval
        pingInterval.current = setInterval(sendPing, 30000); // Ping every 30 seconds
        
        toast.success('Real-time connection established');
        
        // Subscribe to user-specific channels
        if (user) {
          sendMessage('subscribe', {
            channels: [`user_${user.id}`, `department_${user.department}`],
          });
          
          if (user.role === 'admin') {
            sendMessage('subscribe', {
              channels: ['admin_notifications', 'security_alerts'],
            });
          }
        }
      };

      ws.current.onclose = (event) => {
        setIsConnected(false);
        setIsConnecting(false);
        setConnectionStatus('disconnected');
        addEvent('disconnected', { code: event.code, reason: event.reason });
        
        // Clear ping interval
        if (pingInterval.current) {
          clearInterval(pingInterval.current);
          pingInterval.current = null;
        }
        
        // Attempt reconnect if not closed normally
        if (event.code !== 1000) {
          toast.warning('Connection lost. Reconnecting...');
          reconnect();
        } else {
          toast.info('Disconnected from server');
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        addEvent('error', { error: error });
        toast.error('WebSocket connection error');
      };

      ws.current.onmessage = handleMessage;

    } catch (error) {
      console.error('Failed to connect:', error);
      setIsConnecting(false);
      setConnectionStatus('disconnected');
      addEvent('error', { error });
      toast.error('Failed to establish connection');
    }
  }, [wsUrl, user, addEvent, updateStatistics, sendPing, handleMessage]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (ws.current) {
      // Send unsubscribe messages
      if (user) {
        sendMessage('unsubscribe', {
          channels: [`user_${user.id}`, `department_${user.department}`],
        });
      }
      
      ws.current.close(1000, 'User initiated disconnect');
      ws.current = null;
    }
    
    // Clear intervals
    if (pingInterval.current) {
      clearInterval(pingInterval.current);
      pingInterval.current = null;
    }
    
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }
    
    setIsConnected(false);
    setConnectionStatus('disconnected');
    addEvent('disconnected', { reason: 'User initiated' });
  }, [user, addEvent]);

  // Send message through WebSocket
  const sendMessage = useCallback((type: string, data: any): boolean => {
    if (ws.current?.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket is not connected');
      return false;
    }

    try {
      const message = JSON.stringify({ type, data, timestamp: Date.now() });
      ws.current.send(message);
      
      updateStatistics({
        messagesSent: statistics.messagesSent + 1,
        lastActivity: Date.now(),
      });
      
      return true;
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      return false;
    }
  }, [statistics.messagesSent, updateStatistics]);

  // Subscribe to channel
  const subscribe = useCallback((channel: string, callback: (data: any) => void): string => {
    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    subscriptions.current.set(subscriptionId, callback);
    
    // Send subscription to server if connected
    if (isConnected) {
      sendMessage('subscribe', { channel });
    }
    
    return subscriptionId;
  }, [isConnected, sendMessage]);

  // Unsubscribe from channel
  const unsubscribe = useCallback((subscriptionId: string) => {
    if (subscriptions.current.has(subscriptionId)) {
      subscriptions.current.delete(subscriptionId);
      
      // Send unsubscribe to server if connected
      if (isConnected) {
        // Note: We need to track which channels to unsubscribe from
        // This is a simplified implementation
        sendMessage('unsubscribe', { subscriptionId });
      }
    }
  }, [isConnected, sendMessage]);

  // Reconnect with exponential backoff
  const reconnect = useCallback(async () => {
    if (isConnecting || isConnected) return;
    
    let attempts = 0;
    const maxAttempts = 10;
    const maxDelay = 30000; // 30 seconds
    
    const attemptReconnect = () => {
      attempts++;
      setConnectionStatus('reconnecting');
      addEvent('reconnecting', { attempt: attempts });
      
      connect().catch(() => {
        if (attempts < maxAttempts) {
          const delay = Math.min(1000 * Math.pow(2, attempts), maxDelay);
          reconnectTimeout.current = setTimeout(attemptReconnect, delay);
        } else {
          toast.error('Failed to reconnect after multiple attempts');
          setConnectionStatus('disconnected');
        }
      });
    };
    
    attemptReconnect();
  }, [isConnecting, isConnected, connect, addEvent]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // Auto-connect on mount if user is authenticated
  useEffect(() => {
    if (user && !isConnected && !isConnecting) {
      connect();
    }
  }, [user, isConnected, isConnecting, connect]);

  // Auto-reconnect when connection is lost
  useEffect(() => {
    if (!isConnected && !isConnecting && user) {
      const timeout = setTimeout(() => {
        reconnect();
      }, 2000);
      
      return () => clearTimeout(timeout);
    }
  }, [isConnected, isConnecting, user, reconnect]);

  return {
    isConnected,
    isConnecting,
    lastMessage,
    connectionStatus,
    events,
    connect,
    disconnect,
    sendMessage,
    subscribe,
    unsubscribe,
    reconnect,
    statistics,
  };
};

export default useWebSocket;