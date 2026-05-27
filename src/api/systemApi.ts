import axiosClient from './axiosClient';
import type { AiStatusData, ApiResponse } from '@/types/api';

export const systemApi = {
  getAiStatus: () => axiosClient.get<ApiResponse<AiStatusData>>('/health/ai'),
};
