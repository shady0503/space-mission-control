'use client'
import { useState, useEffect, useCallback, useRef } from 'react';
import wsClient, { WebSocketMessageHandler } from '../api/wsClient';
import { useAuth } from './useAuth';

/**
 * Custom hook for WebSocket connections with automatic connection management
 * @param endpoint WebSocket endpoint to connect to
 * @param initialParser Optional function to parse incoming messages
 * @param additionalParams Optional additional parameters to include in the connection URL
 */
export const useWebSocket = <T = any>(
  endpoint: string,
  initialParser?: (data: any) => T,
  additionalParams?: Record<string, string | number | boolean>
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
  const userRef = useRef(user);
  const additionalParamsRef = useRef(additionalParams);
  
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
  
  useEffect(() => {
    additionalParamsRef.current = additionalParams;
  }, [additionalParams]);

  /**
   * Message handler function - parses incoming data and updates state
   * This has been updated to handle the new API response format
   */
  const handleMessage = useCallback<WebSocketMessageHandler>((event: MessageEvent) => {
    try {
      let parsed: any;
      
      // Parse the message based on its type
      if (typeof event.data === 'string') {
        try {
          parsed = JSON.parse(event.data);
          
          // Log the raw data to help diagnose issues
          console.log('[WebSocket] Received data structure:', parsed);
          
          // Check for error messages in the API response
          if (parsed.error) {
            console.error('[WebSocket] API Error:', parsed.error);
            setError(new Error(parsed.error.message || 'API Error'));
            return;
          }
          
          // Handle different API response formats
          if (parsed.data !== undefined) {
            // New API format with data field
            parsed = parsed.data;
          } else if (parsed.payload !== undefined) {
            // Alternative API format with payload field
            parsed = parsed.payload;
          }
          // If neither data nor payload exists, use the whole response
        } catch (e) {
          // If it's not valid JSON, use as-is
          parsed = event.data;
          console.log('[WebSocket] Received non-JSON data:', 
            typeof event.data === 'string' && event.data.length > 100 
              ? `${event.data.substring(0, 100)}...` 
              : event.data
          );
        }
      } else if (event.data instanceof ArrayBuffer) {
        // Handle binary data
        parsed = event.data;
        console.log('[WebSocket] Received binary data of size:', event.data.byteLength);
      } else {
        parsed = event.data;
        console.log('[WebSocket] Received data of type:', typeof event.data);
      }
      
      // Apply custom parser if provided
      if (parserRef.current) {
        try {
          parsed = parserRef.current(parsed);
        } catch (parseError) {
          console.error('[WebSocket] Error in custom parser:', parseError);
          setError(parseError instanceof Error 
            ? parseError 
            : new Error('Error in custom parser'));
          return;
        }
      }
      
      // Update state with new data
      setData(parsed);
      setLastUpdated(Date.now());
      setError(null);
    } catch (err) {
      console.error('[WebSocket] Error handling message:', err);
      setError(err instanceof Error ? err : new Error('Error parsing WebSocket data'));
    }
  }, []);

  /**
   * Status handler function - updates connection state
   */
  const handleStatus = useCallback((status: string) => {
    console.log(`[WebSocket] Connection status: ${status}`);
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
    console.error('[WebSocket] Connection error:', err);
    setError(err);
  }, []);

  /**
   * Set up connection when component mounts and clean up on unmount
   */
  useEffect(() => {
    const currentEndpoint = endpointRef.current;
    const currentUser = userRef.current;
    const currentParams = additionalParamsRef.current;
    
    console.log(`[WebSocket] Setting up connection to ${currentEndpoint}`, { 
      user: currentUser?.id, 
      params: currentParams 
    });
    
    // Connect to WebSocket
    wsClient.connect(
      currentEndpoint,
      currentUser,
      currentParams, // Pass additional parameters
      handleMessage,
      handleStatus,
      handleError
    );
    
    // Clean up on unmount
    return () => {
      console.log(`[WebSocket] Cleaning up handlers for ${currentEndpoint}`);
      wsClient.removeMessageHandler(currentEndpoint, handleMessage);
      wsClient.removeStatusHandler(currentEndpoint, handleStatus);
      wsClient.removeErrorHandler(currentEndpoint, handleError);
    };
  }, [handleMessage, handleStatus, handleError]);

  /**
   * Send a message through the WebSocket
   */
  const sendMessage = useCallback((message: any): boolean => {
    const currentEndpoint = endpointRef.current;
    console.log(`[WebSocket] Sending message to ${currentEndpoint}:`, message);
    return wsClient.send(currentEndpoint, message);
  }, []);

  /**
   * Manually disconnect from the WebSocket
   */
  const disconnect = useCallback(() => {
    const currentEndpoint = endpointRef.current;
    console.log(`[WebSocket] Manually disconnecting from ${currentEndpoint}`);
    wsClient.disconnect(currentEndpoint);
  }, []);

  /**
   * Manually reconnect to the WebSocket
   */
  const reconnect = useCallback(() => {
    const currentEndpoint = endpointRef.current;
    const currentUser = userRef.current;
    console.log(`[WebSocket] Manually reconnecting to ${currentEndpoint}`);
    wsClient.reconnect(currentEndpoint, currentUser);
  }, []);

  /**
   * Update the parser function
   */
  const setParser = useCallback((newParser: (data: any) => T) => {
    console.log('[WebSocket] Updating parser function');
    parserRef.current = newParser;
  }, []);

  // Log state changes for debugging
  useEffect(() => {
    console.log('[WebSocket] Connection state updated:', { 
      isConnected, 
      status: connectionStatus,
      error: error?.message,
      lastUpdated
    });
  }, [isConnected, connectionStatus, error, lastUpdated]);

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