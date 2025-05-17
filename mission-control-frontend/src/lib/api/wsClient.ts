/**
 * WebSocket Client
 * Improved WebSocket client for efficient real-time data handling with enhanced error debugging
 */

import { API_CONFIG } from "./config";
import { getAuthToken } from "./auth";

export type WebSocketMessageHandler = (event: MessageEvent) => void;
export type WebSocketStatusHandler = (status: string) => void;
export type WebSocketErrorHandler = (error: Error) => void;

// Configuration
const RECONNECT_DELAY = 2000; // 2 seconds fixed reconnect delay
const CONNECTION_TIMEOUT = 10000; // 10 seconds connection timeout
const PING_INTERVAL = 20000; // 20 seconds ping interval
const PROTOCOLS = ["json", ""]; // Try both with and without protocol

/**
 * Singleton WebSocket client that manages connections efficiently
 */
class WebSocketClient {
  private static instance: WebSocketClient;
  private connections: Map<string, WebSocket> = new Map();
  private messageHandlers: Map<string, Set<WebSocketMessageHandler>> = new Map();
  private statusHandlers: Map<string, Set<WebSocketStatusHandler>> = new Map();
  private errorHandlers: Map<string, Set<WebSocketErrorHandler>> = new Map();
  private reconnectTimers: Map<string, NodeJS.Timeout> = new Map();
  private pingTimers: Map<string, NodeJS.Timeout> = new Map();
  private connectionTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private lastActivityTime: Map<string, number> = new Map();
  private messageCount: Map<string, number> = new Map();
  private connectionAttempts: Map<string, number> = new Map();

  private constructor() {
    // Clean up connections when window is closed
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.connections.forEach((_, endpoint) => {
          this.disconnect(endpoint);
        });
      });
    }
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): WebSocketClient {
    if (!WebSocketClient.instance) {
      WebSocketClient.instance = new WebSocketClient();
    }
    return WebSocketClient.instance;
  }

  /**
   * Connect to a WebSocket endpoint
   * @param endpoint The WebSocket endpoint to connect to
   * @param user The authenticated user object
   * @param userData Optional user data to include in the connection URL
   * @param onMessage Optional message handler
   * @param onStatus Optional status handler
   * @param onError Optional error handler
   */
  public async connect(
    endpoint: string,
    user: { id: string; enterpriseId?: string } | null,
    userData?: { enterpriseId?: string; [key: string]: any },
    onMessage?: WebSocketMessageHandler,
    onStatus?: WebSocketStatusHandler,
    onError?: WebSocketErrorHandler
  ): Promise<void> {
    // Already connected and healthy
    if (this.isConnected(endpoint)) {
      if (onMessage) this.addMessageHandler(endpoint, onMessage);
      if (onStatus) this.addStatusHandler(endpoint, onStatus);
      if (onError) this.addErrorHandler(endpoint, onError);
      
      if (onStatus) onStatus('connected');
      return;
    }

    // Clear any existing reconnect timer
    if (this.reconnectTimers.has(endpoint)) {
      clearTimeout(this.reconnectTimers.get(endpoint)!);
      this.reconnectTimers.delete(endpoint);
    }

    // Register handlers
    if (onMessage) this.addMessageHandler(endpoint, onMessage);
    if (onStatus) this.addStatusHandler(endpoint, onStatus);
    if (onError) this.addErrorHandler(endpoint, onError);

    try {
      // Track connection attempts
      const attempts = this.connectionAttempts.get(endpoint) || 0;
      this.connectionAttempts.set(endpoint, attempts + 1);
      
      // Build WebSocket URL
      let urlWithParams;
      
      // Ensure URL is correctly formatted with ws:// or wss:// prefix
      if (typeof window !== 'undefined') {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
        const baseUrl = API_CONFIG.WS_BASE_URL.replace(/^(ws:\/\/|wss:\/\/)/, '');
        const urlString = `${wsProtocol}${baseUrl}${endpoint}`;
        urlWithParams = new URL(urlString);
      } else {
        urlWithParams = new URL(`${API_CONFIG.WS_BASE_URL}${endpoint}`);
      }
      
      // Add user information if available
      if (user) {
        const enterpriseId = user.enterpriseId || user.id;
        urlWithParams.searchParams.append('enterpriseId', enterpriseId);
      }
      
      // Add user data parameters if provided
      if (userData) {
        Object.entries(userData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            urlWithParams.searchParams.append(key, value.toString());
          }
        });
      }
      
      // Close any existing connection
      this.closeConnection(endpoint);
      
      // Initialize message count
      this.messageCount.set(endpoint, 0);
      
      console.log(`[WebSocket] Connecting to ${urlWithParams.toString()}, attempt #${attempts + 1}`);
      
      // Choose protocol based on reconnection attempts to try different options
      const protocolIndex = attempts % PROTOCOLS.length;
      const protocol = PROTOCOLS[protocolIndex];
      
      // Create new WebSocket with protocol
      const ws = protocol ? new WebSocket(urlWithParams.toString(), protocol) : new WebSocket(urlWithParams.toString());
      this.connections.set(endpoint, ws);
      
      // Log connection attempt details
      console.log(`[WebSocket] Connection attempt details:`, {
        url: urlWithParams.toString(),
        protocol: protocol || 'none',
        binaryType: ws.binaryType,
        readyState: this.getReadyStateText(ws.readyState)
      });
      
      // Set binary type to arraybuffer to handle binary data consistently
      ws.binaryType = 'arraybuffer';
      
      // Set connection timeout
      this.connectionTimeouts.set(
        endpoint,
        setTimeout(() => {
          if (ws.readyState !== WebSocket.OPEN) {
            console.warn(`[WebSocket] Connection timeout for ${endpoint}`);
            ws.close();
            this.notifyErrorHandlers(endpoint, new Error(`Connection timeout for ${endpoint}`));
            this.scheduleReconnect(endpoint, user);
          }
        }, CONNECTION_TIMEOUT)
      );
      
      // Handle WebSocket events
      ws.onopen = (event) => {
        // Clear connection timeout
        if (this.connectionTimeouts.has(endpoint)) {
          clearTimeout(this.connectionTimeouts.get(endpoint)!);
          this.connectionTimeouts.delete(endpoint);
        }
        
        // Reset connection attempts counter on successful connection
        this.connectionAttempts.set(endpoint, 0);
        
        console.log(`[WebSocket] Connected to ${endpoint}`, {
          protocol: ws.protocol || 'none',
          extensions: ws.extensions || 'none',
          binaryType: ws.binaryType
        });
        
        // Update activity time
        this.lastActivityTime.set(endpoint, Date.now());
        
        // Start ping interval
        this.startPingInterval(endpoint, user);
        
        // Notify status handlers
        this.notifyStatusHandlers(endpoint, 'connected');
      };
      
      ws.onmessage = (event) => {
        // Update activity time
        this.lastActivityTime.set(endpoint, Date.now());
        
        // Increment message count and log occasional statistics
        const count = (this.messageCount.get(endpoint) || 0) + 1;
        this.messageCount.set(endpoint, count);
        
        if (count % 10 === 0) {
          console.log(`[WebSocket] Received ${count} messages from ${endpoint}`);
        }
        
        // Handle different message types
        if (typeof event.data === 'string') {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'ping' || data.type === 'pong') {
              console.log(`[WebSocket] Received ${data.type} from ${endpoint}`);
              return;
            }
            
            // Log message size (truncate if too large)
            if (event.data.length > 1000) {
              console.log(`[WebSocket] Received data of size ${event.data.length} bytes from ${endpoint}`);
              console.log(`[WebSocket] Sample: ${event.data.substring(0, 100)}...`);
            }
          } catch (e) {
            // Not JSON or not a ping/pong message
            console.log(`[WebSocket] Received non-JSON message: ${event.data.length > 100 ? 
              event.data.substring(0, 100) + '...' : event.data}`);
          }
        } else if (event.data instanceof ArrayBuffer) {
          console.log(`[WebSocket] Received binary data of size ${event.data.byteLength} bytes from ${endpoint}`);
        } else {
          console.log(`[WebSocket] Received data of type ${typeof event.data} from ${endpoint}`);
        }
        
        // Notify message handlers
        this.notifyMessageHandlers(endpoint, event);
      };
      
      ws.onclose = (event) => {
        console.log(`[WebSocket] Closed connection to ${endpoint}`, {
          code: event.code,
          reason: event.reason || 'no reason provided',
          wasClean: event.wasClean,
          endpoint: endpoint
        });
        
        // Clean up resources
        this.stopPingInterval(endpoint);
        this.clearConnectionTimeout(endpoint);
        this.connections.delete(endpoint);
        
        // Don't reconnect if closed normally
        if (event.code === 1000 && event.reason === 'Closed by client') {
          this.notifyStatusHandlers(endpoint, 'disconnected');
          return;
        }
        
        // Schedule reconnect
        this.notifyStatusHandlers(endpoint, 'disconnected');
        this.scheduleReconnect(endpoint, user);
      };
      
      ws.onerror = (event) => {
        // Capture as much error info as possible
        console.error(`[WebSocket] Error on ${endpoint}:`, event);
        
        try {
          const errorDetails = {
            type: event.type,
            target: {
              url: (event.target as WebSocket).url,
              readyState: (event.target as WebSocket).readyState,
              readyStateText: this.getReadyStateText((event.target as WebSocket).readyState),
              protocol: (event.target as WebSocket).protocol || 'none',
              extensions: (event.target as WebSocket).extensions || 'none',
              binaryType: (event.target as WebSocket).binaryType
            },
            isTrusted: 'isTrusted' in event ? event.isTrusted : 'unknown',
            timeStamp: event.timeStamp,
            currentTarget: event.currentTarget ? {
              url: (event.currentTarget as WebSocket).url,
              readyState: (event.currentTarget as WebSocket).readyState
            } : 'none'
          };
          
          console.error(`[WebSocket] Error details:`, errorDetails);
        } catch (e) {
          console.error(`[WebSocket] Error extracting error details:`, e);
        }
        
        // Create a more informative error message
        let errorMessage = `WebSocket error on ${endpoint}`;
        if ((event.target as WebSocket).readyState === WebSocket.CLOSED) {
          errorMessage += ` (connection closed)`;
        }
        
        this.notifyErrorHandlers(endpoint, new Error(errorMessage));
      };
    } catch (error) {
      console.error(`[WebSocket] Error creating connection to ${endpoint}:`, error);
      this.notifyErrorHandlers(endpoint, error instanceof Error ? error : new Error(String(error)));
      this.scheduleReconnect(endpoint, user);
    }
  }

  /**
   * Close a connection to an endpoint
   */
  private closeConnection(endpoint: string): void {
    const ws = this.connections.get(endpoint);
    if (ws) {
      // Remove event handlers
      ws.onopen = null;
      ws.onmessage = null;
      ws.onclose = null;
      ws.onerror = null;
      
      // Close the connection
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        try {
          ws.close(1000, 'Closed by client');
        } catch (e) {
          // Ignore errors during close
          console.warn(`[WebSocket] Error closing connection to ${endpoint}:`, e);
        }
      }
      
      // Clean up resources
      this.stopPingInterval(endpoint);
      this.clearConnectionTimeout(endpoint);
      this.connections.delete(endpoint);
    }
  }

  /**
   * Schedule a reconnection attempt
   */
  private scheduleReconnect(endpoint: string, user?: { id: string; enterpriseId?: string } | null): void {
    if (this.reconnectTimers.has(endpoint)) {
      clearTimeout(this.reconnectTimers.get(endpoint)!);
    }
    
    // Use progressive backoff based on connection attempts
    const attempts = this.connectionAttempts.get(endpoint) || 0;
    const delay = Math.min(RECONNECT_DELAY * Math.pow(1.5, Math.min(attempts, 5)), 30000); // Cap at 30 seconds
    
    console.log(`[WebSocket] Scheduling reconnect to ${endpoint} in ${delay}ms (attempt #${attempts + 1})`);
    
    this.reconnectTimers.set(
      endpoint,
      setTimeout(() => {
        this.notifyStatusHandlers(endpoint, 'reconnecting');
        if (user) {
          this.connect(endpoint, user);
        } else {
          this.connect(endpoint, null);
        }
      }, delay)
    );
  }

  /**
   * Start ping interval to keep connection alive
   */
  private startPingInterval(endpoint: string, user?: { id: string; enterpriseId?: string } | null): void {
    this.stopPingInterval(endpoint);
    
    this.pingTimers.set(
      endpoint,
      setInterval(() => {
        const ws = this.connections.get(endpoint);
        if (ws && ws.readyState === WebSocket.OPEN) {
          try {
            console.log(`[WebSocket] Sending ping to ${endpoint}`);
            ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
            
            // Check for inactivity
            const lastActivity = this.lastActivityTime.get(endpoint) || 0;
            if (Date.now() - lastActivity > PING_INTERVAL * 2) {
              console.warn(`[WebSocket] No activity for ${PING_INTERVAL * 2}ms on ${endpoint}, reconnecting`);
              // No activity for too long, reconnect
              this.reconnect(endpoint, user);
            }
          } catch (e) {
            console.error(`[WebSocket] Error sending ping to ${endpoint}:`, e);
            // Error sending ping, reconnect
            this.reconnect(endpoint, user);
          }
        }
      }, PING_INTERVAL)
    );
  }

  /**
   * Stop ping interval
   */
  private stopPingInterval(endpoint: string): void {
    if (this.pingTimers.has(endpoint)) {
      clearInterval(this.pingTimers.get(endpoint)!);
      this.pingTimers.delete(endpoint);
    }
  }

  /**
   * Clear connection timeout
   */
  private clearConnectionTimeout(endpoint: string): void {
    if (this.connectionTimeouts.has(endpoint)) {
      clearTimeout(this.connectionTimeouts.get(endpoint)!);
      this.connectionTimeouts.delete(endpoint);
    }
  }

  /**
   * Reconnect to an endpoint
   */
  public reconnect(endpoint: string, user?: { id: string; enterpriseId?: string } | null): void {
    console.log(`[WebSocket] Manually reconnecting to ${endpoint}`);
    this.closeConnection(endpoint);
    if (user) {
      this.connect(endpoint, user);
    } else {
      this.connect(endpoint, null);
    }
  }

  /**
   * Disconnect from an endpoint
   */
  public disconnect(endpoint: string): void {
    console.log(`[WebSocket] Disconnecting from ${endpoint}`);
    this.closeConnection(endpoint);
    
    // Clear reconnect timer
    if (this.reconnectTimers.has(endpoint)) {
      clearTimeout(this.reconnectTimers.get(endpoint)!);
      this.reconnectTimers.delete(endpoint);
    }
    
    // Notify status handlers
    this.notifyStatusHandlers(endpoint, 'disconnected');
  }

  /**
   * Send a message to an endpoint
   */
  public send(endpoint: string, data: any): boolean {
    const ws = this.connections.get(endpoint);
    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        const message = typeof data === 'string' ? data : JSON.stringify(data);
        ws.send(message);
        console.log(`[WebSocket] Sent message to ${endpoint}: ${message.length > 100 ? message.substring(0, 100) + '...' : message}`);
        return true;
      } catch (e) {
        console.error(`[WebSocket] Error sending message to ${endpoint}:`, e);
        return false;
      }
    } else if (!ws) {
      console.warn(`[WebSocket] Cannot send message to ${endpoint}: No connection exists`);
    } else {
      console.warn(`[WebSocket] Cannot send message to ${endpoint}: Connection not open (state: ${this.getReadyStateText(ws.readyState)})`);
    }
    return false;
  }

  /**
   * Check if connected to an endpoint
   */
  public isConnected(endpoint: string): boolean {
    return !!this.connections.get(endpoint) && 
           this.connections.get(endpoint)?.readyState === WebSocket.OPEN;
  }

  /**
   * Add a message handler
   */
  public addMessageHandler(endpoint: string, handler: WebSocketMessageHandler): void {
    if (!this.messageHandlers.has(endpoint)) {
      this.messageHandlers.set(endpoint, new Set());
    }
    this.messageHandlers.get(endpoint)!.add(handler);
  }

  /**
   * Remove a message handler
   */
  public removeMessageHandler(endpoint: string, handler: WebSocketMessageHandler): void {
    const handlers = this.messageHandlers.get(endpoint);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Add a status handler
   */
  public addStatusHandler(endpoint: string, handler: WebSocketStatusHandler): void {
    if (!this.statusHandlers.has(endpoint)) {
      this.statusHandlers.set(endpoint, new Set());
    }
    this.statusHandlers.get(endpoint)!.add(handler);
  }

  /**
   * Remove a status handler
   */
  public removeStatusHandler(endpoint: string, handler: WebSocketStatusHandler): void {
    const handlers = this.statusHandlers.get(endpoint);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Add an error handler
   */
  public addErrorHandler(endpoint: string, handler: WebSocketErrorHandler): void {
    if (!this.errorHandlers.has(endpoint)) {
      this.errorHandlers.set(endpoint, new Set());
    }
    this.errorHandlers.get(endpoint)!.add(handler);
  }

  /**
   * Remove an error handler
   */
  public removeErrorHandler(endpoint: string, handler: WebSocketErrorHandler): void {
    const handlers = this.errorHandlers.get(endpoint);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Notify message handlers
   */
  private notifyMessageHandlers(endpoint: string, event: MessageEvent): void {
    const handlers = this.messageHandlers.get(endpoint);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (e) {
          console.error(`[WebSocket] Error in message handler for ${endpoint}:`, e);
        }
      });
    }
  }

  /**
   * Notify status handlers
   */
  private notifyStatusHandlers(endpoint: string, status: string): void {
    const handlers = this.statusHandlers.get(endpoint);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(status);
        } catch (e) {
          console.error(`[WebSocket] Error in status handler for ${endpoint}:`, e);
        }
      });
    }
  }

  /**
   * Notify error handlers
   */
  private notifyErrorHandlers(endpoint: string, error: Error): void {
    const handlers = this.errorHandlers.get(endpoint);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(error);
        } catch (e) {
          console.error(`[WebSocket] Error in error handler for ${endpoint}:`, e);
        }
      });
    }
  }
  
  /**
   * Get connection status information
   */
  public getStatus(endpoint: string): any {
    const ws = this.connections.get(endpoint);
    if (!ws) return { connected: false, state: 'no connection' };
    
    return {
      connected: ws.readyState === WebSocket.OPEN,
      state: this.getReadyStateText(ws.readyState),
      messageCount: this.messageCount.get(endpoint) || 0,
      lastActivity: this.lastActivityTime.get(endpoint) || 0,
      attempts: this.connectionAttempts.get(endpoint) || 0,
      url: ws.url,
      protocol: ws.protocol || 'none',
      extensions: ws.extensions || 'none',
      binaryType: ws.binaryType
    };
  }

  /**
   * Get text representation of WebSocket ready state
   */
  private getReadyStateText(readyState: number): string {
    switch (readyState) {
      case WebSocket.CONNECTING:
        return 'CONNECTING';
      case WebSocket.OPEN:
        return 'OPEN';
      case WebSocket.CLOSING:
        return 'CLOSING';
      case WebSocket.CLOSED:
        return 'CLOSED';
      default:
        return 'UNKNOWN';
    }
  }
  
  /**
   * Test if there's a connection problem by checking if both protocols fail
   */
  public testConnection(endpoint: string): Promise<boolean> {
    return new Promise((resolve) => {
      // Try each protocol
      let successfulConnection = false;
      let completedTests = 0;
      
      const testWithProtocol = (protocol: string) => {
        try {
          console.log(`[WebSocket] Testing connection with protocol: "${protocol || 'none'}"`);
          
          // Build URL
          const wsProtocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss://' : 'ws://';
          const baseUrl = API_CONFIG.WS_BASE_URL.replace(/^(ws:\/\/|wss:\/\/)/, '');
          const urlString = `${wsProtocol}${baseUrl}${endpoint}`;
          const url = new URL(urlString);
          
          // Create test WebSocket
          const testWs = protocol ? new WebSocket(url.toString(), protocol) : new WebSocket(url.toString());
          
          // Set timeout to close if not connected
          const timeout = setTimeout(() => {
            console.log(`[WebSocket] Test connection with protocol "${protocol || 'none'}" timed out`);
            testWs.close();
            checkComplete();
          }, 5000);
          
          // Handle events
          testWs.onopen = () => {
            console.log(`[WebSocket] Test connection with protocol "${protocol || 'none'}" succeeded`);
            successfulConnection = true;
            clearTimeout(timeout);
            testWs.close();
            checkComplete();
          };
          
          testWs.onerror = () => {
            console.log(`[WebSocket] Test connection with protocol "${protocol || 'none'}" failed`);
            clearTimeout(timeout);
            checkComplete();
          };
          
          testWs.onclose = () => {
            clearTimeout(timeout);
            checkComplete();
          };
        } catch (e) {
          console.error(`[WebSocket] Error testing connection:`, e);
          checkComplete();
        }
      };
      
      // Check if all tests are complete
      const checkComplete = () => {
        completedTests++;
        if (completedTests >= PROTOCOLS.length) {
          resolve(successfulConnection);
        }
      };
      
      // Test with each protocol
      PROTOCOLS.forEach(testWithProtocol);
    });
  }
}

export default WebSocketClient.getInstance();