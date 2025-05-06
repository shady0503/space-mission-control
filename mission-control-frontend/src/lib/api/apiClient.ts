/**
 * API Client
 * Central REST API client using Axios with interceptors for authentication
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { API_CONFIG } from "./config";
import { getAuthToken, refreshToken } from "./auth";
import { getSession } from "next-auth/react";

// Improved caching interface
interface CacheItem<T> {
  data: T;
  timestamp: number;
  etag?: string;
}

class ApiClient {
  private client: AxiosInstance;
  private static instance: ApiClient;
  private requestCache: Map<string, CacheItem<any>>;
  private cacheLifetime: number;
  private pendingRequests: Map<string, Promise<any>>;
  // Add session token cache as a proper class property
  private sessionTokenCache: { token: string | null; expiry: number };

  private constructor() {
    // Create Axios instance with default configuration
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        "Content-Type": "application/json",
      },
    });

    

    this.requestCache = new Map();
    this.pendingRequests = new Map();
    this.cacheLifetime = 30000; // 30 seconds default cache lifetime
    
    // Initialize session token cache
    this.sessionTokenCache = {
      token: null,
      expiry: 0
    };
    
    this.setupInterceptors();
  }

  /**
   * Get singleton instance of ApiClient
   */
  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  // Set cache lifetime
  public setCacheLifetime(milliseconds: number): void {
    this.cacheLifetime = milliseconds;
  }

  // Clear entire cache or specific keys
  public clearCache(keys?: string[]): void {
    if (keys && keys.length > 0) {
      keys.forEach(key => {
        // Clear exact matches and pattern matches
        this.requestCache.forEach((_, cacheKey) => {
          if (cacheKey === key || cacheKey.startsWith(key)) {
            this.requestCache.delete(cacheKey);
          }
        });
      });
    } else {
      this.requestCache.clear();
    }
  }

  public monitorAuth(): void {
    console.log("Auth Status Check:");
    console.log("- Token exists:", !!localStorage.getItem("auth_token"));
    console.log("- Token expiry:", localStorage.getItem("token_expiry"));
    console.log("- Cached token exists:", !!this.sessionTokenCache.token);
    console.log("- Cached token expiry:", new Date(this.sessionTokenCache.expiry).toLocaleTimeString());

    const now = Date.now();
    const expiry = localStorage.getItem("token_expiry");
    if (expiry) {
      const timeRemaining = parseInt(expiry) - now;
      console.log(
        "- Time remaining:",
        Math.floor(timeRemaining / 1000 / 60),
        "minutes"
      );
    }

    // Log the actual token (first 10 chars only for security)
    const token = localStorage.getItem("auth_token");
    if (token) {
      console.log("- Token preview:", token.substring(0, 10) + "...");
    }
  }

  /**
   * Setup request and response interceptors for authentication
   */
  private setupInterceptors(): void {
    // Request interceptor to add token to all requests
    this.client.interceptors.request.use(
      async (config) => {
        // Add cache support headers for GET requests
        if (config.method?.toLowerCase() === 'get') {
          const cacheKey = this.generateCacheKey(config.url || '', config.params);
          const cachedItem = this.requestCache.get(cacheKey);
          
          if (cachedItem?.etag) {
            config.headers['If-None-Match'] = cachedItem.etag;
          }
        }
        
        // Use cached token if not expired yet
        if (this.sessionTokenCache.token && Date.now() < this.sessionTokenCache.expiry) {
          console.log(`[Auth] Using cached token (expires in ${Math.round((this.sessionTokenCache.expiry - Date.now()) / 1000)}s)`);
          config.headers.Authorization = `Bearer ${this.sessionTokenCache.token}`;
          return config;
        }
        
        console.log('[Auth] Token cache miss, checking session');
        
        // Otherwise proceed with session check
        const session = await getSession();
        let token = session?.accessToken;

        // Cache the token for 5 minutes
        if (token) {
          this.sessionTokenCache.token = token;
          this.sessionTokenCache.expiry = Date.now() + (5 * 60 * 1000);
          config.headers.Authorization = `Bearer ${token}`;
          console.log('[Auth] Session token cached');
        } else if (typeof window !== "undefined") {
          const localToken = localStorage.getItem("auth_token");
          if (localToken) {
            this.sessionTokenCache.token = localToken;
            this.sessionTokenCache.expiry = Date.now() + (5 * 60 * 1000);
            config.headers.Authorization = `Bearer ${localToken}`;
            console.log('[Auth] Local token cached');
          }
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor with improved error handling
    this.client.interceptors.response.use(
      (response) => {
        // Cache responses for GET requests
        if (response.config.method?.toLowerCase() === 'get') {
          const cacheKey = this.generateCacheKey(
            response.config.url || '', 
            response.config.params
          );
          
          // Store ETag if provided
          const etag = response.headers['etag'];
          
          this.requestCache.set(cacheKey, {
            data: response.data,
            timestamp: Date.now(),
            etag: etag
          });
          
          // Remove from pending requests
          this.pendingRequests.delete(cacheKey);
        }
        
        return response;
      },
      async (error) => {
        const originalRequest = error.config;
        const cacheKey = this.generateCacheKey(
          originalRequest?.url || '', 
          originalRequest?.params
        );
        
        // Handle 304 Not Modified responses
        if (error.response?.status === 304) {
          const cachedItem = this.requestCache.get(cacheKey);
          if (cachedItem) {
            // Update timestamp to extend cache life
            this.requestCache.set(cacheKey, {
              ...cachedItem,
              timestamp: Date.now()
            });
            
            // Remove from pending requests
            this.pendingRequests.delete(cacheKey);
            
            // Return cached data as if it was a fresh response
            return Promise.resolve({ data: cachedItem.data });
          }
        }

        // Log detailed error information
        console.error("API Error:", {
          url: originalRequest?.url,
          status: error.response?.status,
          statusText: error.response?.statusText,
        });

        // Remove from pending requests on any error
        this.pendingRequests.delete(cacheKey);

        // If unauthorized and not already retrying
        if (error.response?.status === 401 && !originalRequest._retry) {
          // Clear the token cache on 401
          this.sessionTokenCache.token = null;
          this.sessionTokenCache.expiry = 0;
          
          originalRequest._retry = true;

          try {
            // Attempt to refresh token
            const refreshed = await refreshToken();
            if (refreshed) {
              // Get the new token
              const newToken = await getAuthToken();
              // Update the Authorization header
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              // Cache the new token
              this.sessionTokenCache.token = newToken;
              this.sessionTokenCache.expiry = Date.now() + (5 * 60 * 1000);
              // Retry the original request
              return this.client(originalRequest);
            } else {
              // If refresh explicitly fails, redirect to login
              if (typeof window !== "undefined") {
                window.location.href = "/login";
              }
            }
          } catch (refreshError) {
            console.error("Token refresh error:", refreshError);
            // If refresh fails, redirect to login
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Generate a consistent cache key for a request
   */
  private generateCacheKey(url: string, params?: any): string {
    const paramsString = params ? JSON.stringify(params) : '';
    return `${url}${paramsString}`;
  }

  /**
   * HTTP GET request with improved caching and request deduplication
   */
  public async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const cacheKey = this.generateCacheKey(url, config?.params);
    const cachedItem = this.requestCache.get(cacheKey);
    
    // Return cached response if valid and not expired
    if (cachedItem && Date.now() - cachedItem.timestamp < this.cacheLifetime) {
      console.log(`[API Cache Hit] ${url}`);
      return cachedItem.data as T;
    }
    
    // Check if there's already a pending request for this URL/params
    if (this.pendingRequests.has(cacheKey)) {
      console.log(`[API Pending Request] ${url}`);
      return this.pendingRequests.get(cacheKey) as Promise<T>;
    }
    
    // Make the actual request
    console.log(`[API Request] ${url}`);
    
    // Create and store the promise
    const requestPromise = this.client.get<T>(url, config)
      .then(response => {
        return response.data;
      })
      .catch(error => {
        // In case of error, remove from pending requests to allow retry
        this.pendingRequests.delete(cacheKey);
        throw error;
      });
    
    // Store the pending request
    this.pendingRequests.set(cacheKey, requestPromise);
    
    return requestPromise;
  }

  /**
   * HTTP POST request
   */
  public async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    // Invalidate relevant cache entries on POST
    this.invalidateRelatedCache(url);
    
    const response: AxiosResponse<T> = await this.client.post(
      url,
      data,
      config
    );
    return response.data;
  }

  /**
   * HTTP PUT request
   */
  public async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    // Invalidate relevant cache entries on PUT
    this.invalidateRelatedCache(url);
    
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  /**
   * HTTP DELETE request
   */
  public async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    // Invalidate relevant cache entries on DELETE
    this.invalidateRelatedCache(url);
    
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }

  /**
   * HTTP PATCH request
   */
  public async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    // Invalidate relevant cache entries on PATCH
    this.invalidateRelatedCache(url);
    
    const response: AxiosResponse<T> = await this.client.patch(
      url,
      data,
      config
    );
    return response.data;
  }

  /**
   * Invalidate cache entries related to a specific URL
   */
  private invalidateRelatedCache(url: string): void {
    // Extract base path to invalidate related cache entries
    const pathSegments = url.split('/');
    // Remove the last segment if it's likely an ID
    if (pathSegments.length > 1 && /^\d+$/.test(pathSegments[pathSegments.length - 1])) {
      pathSegments.pop();
    }
    const basePath = pathSegments.join('/');
    
    // Invalidate all cache entries that start with this base path
    this.requestCache.forEach((_, key) => {
      if (key.startsWith(basePath)) {
        this.requestCache.delete(key);
      }
    });
  }

  /**
   * Get the underlying Axios client for advanced usage if needed
   */
  public getClient(): AxiosInstance {
    return this.client;
  }
}

// Export singleton instance
export default ApiClient.getInstance();