import axiosClient from './axiosClient';
import type {
  ApiResponse,
  CourseRecommendationsData,
  ResumeListItem,
} from '@/types/api';

export const resumeApi = {
  upload: (file: File, onProgress?: (percent: number) => void) => {
    const formData = new FormData();
    formData.append('resume', file);

    return axiosClient.post<ApiResponse>('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (event.total && onProgress) {
          onProgress(Math.round((event.loaded * 100) / event.total));
        }
      },
    });
  },

  getMyResumes: () =>
    axiosClient.get<ApiResponse<ResumeListItem[]>>('/resume/my'),

  getCourseRecommendations: (resumeId: string) =>
    axiosClient.get<ApiResponse<CourseRecommendationsData>>(
      `/courses/${resumeId}/recommend`
    ),

  downloadReport: (resumeId: string) =>
    axiosClient.get(`/report/${resumeId}/download`, {
      responseType: 'blob',
    }),
};
