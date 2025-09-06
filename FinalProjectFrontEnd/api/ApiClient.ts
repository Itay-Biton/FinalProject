// api/ApiClient.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';
import authService from '../services/AuthService';
import { Platform } from 'react-native';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  defaultHeaders?: Record<string, string>;
}

function resolveBaseURL(override?: string) {
  if (override) return override;

  // Prefer platform-specific env vars; fall back to generic API_URL; then dev defaults.
  const iosUrl =
    Config.API_IOS_URL ||
    Config.API_URL ||
    (__DEV__ ? 'http://127.0.0.1:3000' : undefined);

  const androidUrl =
    Config.API_ANDROID_URL ||
    Config.API_URL ||
    (__DEV__ ? 'http://10.0.2.2:3000' : undefined);

  const chosen = Platform.OS === 'ios' ? iosUrl : androidUrl;

  if (!chosen) {
    console.warn(
      'ApiClient: No base URL configured. Set API_IOS_URL / API_ANDROID_URL (or API_URL).',
    );
  }
  return chosen || 'http://127.0.0.1:3000'; // last-resort dev fallback
}

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;

  constructor(config: ApiClientConfig = {}) {
    this.baseURL = resolveBaseURL(config.baseURL);
    this.timeout = config.timeout || 10000;
    this.defaultHeaders = config.defaultHeaders || {};

    console.log('🚀 ApiClient initialized with:', {
      baseURL: this.baseURL,
      platform: Platform.OS,
      timeout: this.timeout,
      defaultHeaders: this.defaultHeaders,
      env: {
        API_IOS_URL: Config.API_IOS_URL,
        API_ANDROID_URL: Config.API_ANDROID_URL,
        API_URL: Config.API_URL,
      },
    });
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem('firebase_id_token');
      console.log('🔑 Auth token:', token ? 'found' : 'missing');
      return token;
    } catch (err) {
      console.error('❌ Error retrieving auth token', err);
      return null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retry: boolean = true,
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    console.log(`📡 ${options.method || 'GET'} → ${url}`);

    const token = await this.getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.defaultHeaders,
      ...((options.headers as Record<string, string>) || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error('🚨 Network error', err);
      if (err.name === 'AbortError') {
        return { success: false, error: 'Request timed out' };
      }
      return { success: false, error: err.message || 'Network error' };
    }
    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type') || '';
    const responseData = contentType.includes('application/json')
      ? await response.json()
      : await response.text();

    console.log(`📨 ${response.status} ${response.statusText}`, responseData);

    if (response.status === 401 && retry) {
      console.log('🔄 401 Unauthorized: refreshing token...');
      const newToken = await authService.getIdToken(true);
      if (newToken) {
        await AsyncStorage.setItem('firebase_id_token', newToken);
        return this.request(endpoint, options, false);
      }
      console.warn('❌ Token refresh failed');
      return { success: false, error: 'Unauthorized - token expired' };
    }

    if (response.ok) {
      return { success: true, data: responseData };
    } else {
      return {
        success: false,
        error:
          (responseData as any)?.message ||
          (responseData as any)?.error ||
          `HTTP ${response.status}`,
      };
    }
  }

  async get<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  async uploadImage<T>(
    endpoint: string,
    formData: FormData,
    options?: RequestInit & { timeoutMs?: number },
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const token = await this.getAuthToken();

    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...((options?.headers as Record<string, string>) || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    delete headers['Content-Type'];

    const timeoutMs =
      (options as any)?.timeoutMs ?? Math.max(60000, this.timeout);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      let response = await fetch(url, {
        ...options,
        method: 'POST',
        headers,
        body: formData,
        signal: controller.signal,
      });

      if (response.status === 401) {
        const newToken = await authService.getIdToken(true);
        if (newToken) {
          await AsyncStorage.setItem('firebase_id_token', newToken);
          const retryHeaders = {
            ...headers,
            Authorization: `Bearer ${newToken}`,
          };
          response = await fetch(url, {
            ...options,
            method: 'POST',
            headers: retryHeaders,
            body: formData,
          });
        }
      }

      const contentType = response.headers.get('content-type') || '';
      const responseData = contentType.includes('application/json')
        ? await response.json()
        : await response.text();

      if (response.ok) return { success: true, data: responseData as T };
      return {
        success: false,
        error:
          (responseData as any)?.message ||
          (responseData as any)?.error ||
          `HTTP ${response.status}`,
      };
    } catch (err: any) {
      const looksLikeAbort =
        err?.name === 'AbortError' ||
        /network request failed/i.test(err?.message || '');
      console.error('🚨 Image upload error', err);
      return {
        success: false,
        error: looksLikeAbort
          ? 'Upload timed out or was blocked'
          : err?.message || 'Image upload failed',
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  setBaseURL(newBaseURL: string): void {
    console.log(`🔄 baseURL: ${this.baseURL} → ${newBaseURL}`);
    this.baseURL = newBaseURL;
  }

  setTimeout(newTimeout: number): void {
    console.log(`⏱ timeout: ${this.timeout}ms → ${newTimeout}ms`);
    this.timeout = newTimeout;
  }

  setDefaultHeaders(headers: Record<string, string>): void {
    console.log('📋 defaultHeaders updated:', headers);
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
  }

  getBaseURL(): string {
    return this.baseURL;
  }

  getTimeout(): number {
    return this.timeout;
  }

  async testConnection(): Promise<ApiResponse<any>> {
    console.log('🔍 Testing connectivity...');
    try {
      const res = await fetch(`${this.baseURL}/`, { method: 'GET' });
      return {
        success: res.ok,
        data: { status: res.status, statusText: res.statusText },
      };
    } catch (err: any) {
      console.error('❌ Connectivity test failed', err);
      return { success: false, error: err.message || 'Connection failed' };
    }
  }
}

export default ApiClient;
