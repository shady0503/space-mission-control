import { useState, useEffect, useCallback, useRef } from 'react';
import wsClient, { WebSocketMessageHandler } from '../api/wsClient';
import { useAuth } from './useAuth';

/**
 * Custom hook for WebSocket connections with automatic connection management
 * @param endpoint WebSocket endpoint to connect to
 * @param initialParser Optional function to parse incoming messages
 */
export const useWebSocket = <T = any>(
  endpoint: string,
  initialParser?: (data: any) => T
) => {
  // State
  const [data, setData] = useState<T | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'reconnecting'>('disconnected');
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(0);
  const { user } = useAuth(); // Assuming useAuth is a custom hook to get user info
  
  // Refs to avoid dependency issues in hooks
  const parserRef = useRef(initialParser);
  const endpointRef = useRef(endpoint);
  const userRef = useRef(user); // Add user ref
  
  // Update refs when props change
  useEffect(() => {
    parserRef.current = initialParser;
  }, [initialParser]);
  
  useEffect(() => {
    endpointRef.current = endpoint;
  }, [endpoint]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  /**
   * Message handler function - parses incoming data and updates state
   */
  const handleMessage = useCallback<WebSocketMessageHandler>((event: MessageEvent) => {
    try {
      let parsed: any;
      
      // Parse the message based on its type
      if (typeof event.data === 'string') {
        try {
          parsed = JSON.parse(event.data);
        } catch (e) {
          parsed = event.data;
        }
      } else {
        parsed = event.data;
      }
      
      // Apply custom parser if provided
      if (parserRef.current) {
        parsed = parserRef.current(parsed);
      }
      
      // Update state with new data
      setData(parsed);
      setLastUpdated(Date.now());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error parsing WebSocket data'));
    }
  }, []);

  /**
   * Status handler function - updates connection state
   */
  const handleStatus = useCallback((status: string) => {
    switch (status) {
      case 'connected':
        setIsConnected(true);
        setConnectionStatus('connected');
        setError(null);
        break;
      case 'disconnected':
        setIsConnected(false);
        setConnectionStatus('disconnected');
        break;
      case 'reconnecting':
        setIsConnected(false);
        setConnectionStatus('reconnecting');
        break;
      default:
        setConnectionStatus('connecting');
    }
  }, []);

  /**
   * Error handler function
   */
  const handleError = useCallback((err: Error) => {
    setError(err);
  }, []);

  /**
   * Set up connection when component mounts and clean up on unmount
   */
  useEffect(() => {
    const currentEndpoint = endpointRef.current;
    
    // Connect to WebSocket - update to match new API
    wsClient.connect(
      currentEndpoint,
      userRef.current, // Pass user object
      {}, // userData (optional)
      handleMessage,
      handleStatus,
      handleError
    );
    
    // Clean up on unmount
    return () => {
      wsClient.removeMessageHandler(currentEndpoint, handleMessage);
      wsClient.removeStatusHandler(currentEndpoint, handleStatus);
      wsClient.removeErrorHandler(currentEndpoint, handleError);
    };
  }, [handleMessage, handleStatus, handleError, user]); // Added user to dependency array

  /**
   * Send a message through the WebSocket
   */
  const sendMessage = useCallback((message: any): boolean => {
    return wsClient.send(endpointRef.current, message);
  }, []);

  /**
   * Manually disconnect from the WebSocket
   */
  const disconnect = useCallback(() => {
    wsClient.disconnect(endpointRef.current);
  }, []);

  /**
   * Manually reconnect to the WebSocket
   */
  const reconnect = useCallback(() => {
    wsClient.reconnect(endpointRef.current, userRef.current); // Pass user for reconnect
  }, []);

  /**
   * Update the parser function
   */
  const setParser = useCallback((newParser: (data: any) => T) => {
    parserRef.current = newParser;
  }, []);

  // Return hook API
  return {
    data,
    isConnected,
    connectionStatus,
    error,
    lastUpdated,
    sendMessage,
    disconnect,
    reconnect,
    setParser
  };
};