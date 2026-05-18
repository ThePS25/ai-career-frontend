import axiosClient from './axiosClient';
import type {
  AuthResponse,
  GoogleLoginPayload,
  LoginPayload,
  RegisterPayload,
  User,
} from '@/types/api';

export const authApi = {
  login: (payload: LoginPayload) =>
    axiosClient.post<AuthResponse>('/auth/login', payload),

  register: (payload: RegisterPayload) =>
    axiosClient.post<AuthResponse>('/auth/register', payload),

  googleLogin: (payload: GoogleLoginPayload) =>
    axiosClient.post<AuthResponse>('/auth/google', payload),

  getMe: () =>
    axiosClient.get<{ success: boolean; user: User }>('/auth/me'),
};
