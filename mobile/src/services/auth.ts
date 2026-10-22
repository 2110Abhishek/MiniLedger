import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest, setAuthToken, removeAuthToken } from './api';
import { User, AuthResponse } from '../types';

export async function sendOtp(phoneNumber: string): Promise<{ message: string; expiresIn: number }> {
  return apiRequest<{ message: string; expiresIn: number }>('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ phoneNumber }),
  });
}

export async function verifyOtp(phoneNumber: string, otp: string): Promise<AuthResponse> {
  const data = await apiRequest<AuthResponse>('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phoneNumber, otp }),
  });

  if (data.accessToken) {
    await setAuthToken(data.accessToken);
    await AsyncStorage.setItem('@miniledger_user', JSON.stringify(data.user));
  }

  return data;
}

export async function getStoredUser(): Promise<User | null> {
  try {
    const raw = await AsyncStorage.getItem('@miniledger_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  await removeAuthToken();
  await AsyncStorage.removeItem('@miniledger_user');
}
