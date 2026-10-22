import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// In Expo web/simulator/device, determine the appropriate backend URL
export const getApiBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  // Android emulator uses 10.0.2.2 to access host localhost
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:4000/api';
  }
  // Web, iOS simulator, or default
  return 'http://localhost:4000/api';
};

export const API_BASE_URL = getApiBaseUrl();

// Retrieve token from AsyncStorage
export async function getAuthToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem('@miniledger_token');
  } catch {
    return null;
  }
}

export async function setAuthToken(token: string): Promise<void> {
  await AsyncStorage.setItem('@miniledger_token', token);
}

export async function removeAuthToken(): Promise<void> {
  await AsyncStorage.removeItem('@miniledger_token');
}

export class ApiError extends Error {
  public code: string;
  public status: number;

  constructor(message: string, code: string = 'API_ERROR', status: number = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err: any) {
    throw new ApiError(
      `Network connection failed. Unable to reach backend at ${API_BASE_URL}. Ensure the server is running.`,
      'NETWORK_ERROR',
      0
    );
  }

  let data: any = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  }

  if (!response.ok) {
    const message = data?.error?.message || data?.message || `Request failed with status ${response.status}`;
    const code = data?.error?.code || 'REQUEST_FAILED';
    throw new ApiError(message, code, response.status);
  }

  return data as T;
}
