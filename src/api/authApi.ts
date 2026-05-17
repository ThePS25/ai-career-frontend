import axiosClient from './axiosClient';
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
} from '@/types/api';

export const authApi = {
  login: (payload: LoginPayload) =>
    axiosClient.post<AuthResponse>('/auth/login', payload),

  register: (payload: RegisterPayload) =>
    axiosClient.post<AuthResponse>('/auth/register', payload),

  getMe: () =>
    axiosClient.get<{ success: boolean; user: User }>('/auth/me'),
};
