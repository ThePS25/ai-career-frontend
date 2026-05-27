import axiosClient from './axiosClient';
import type {
  AiProvider,
  ApiResponse,
  CourseRecommendation,
  CourseRecommendationsData,
  JobRecommendation,
  JobRecommendationsData,
  ResumeDetail,
} from '@/types/api';

function mapJobs(raw: Record<string, unknown>): JobRecommendation[] {
  const nested = raw.jobRecommendations as
    | JobRecommendation[]
    | { jobs?: JobRecommendation[] }
    | undefined;

  if (Array.isArray(nested)) return nested;
  if (nested?.jobs) return nested.jobs;
  return [];
}

function mapCourses(raw: Record<string, unknown>): CourseRecommendation[] {
  const nested = raw.courseRecommendations as
    | CourseRecommendation[]
    | { courses?: CourseRecommendation[] }
    | undefined;

  if (Array.isArray(nested)) return nested;
  if (nested?.courses) return nested.courses;
  return [];
}

function mapResumeFromApi(raw: Record<string, unknown>): ResumeDetail {
  const aiAnalysis = raw.aiAnalysis as { atsScore?: number } | undefined;

  return {
    _id: String(raw._id),
    fileName: String(raw.fileName ?? ''),
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
    atsScore:
      typeof raw.atsScore === 'number' ? raw.atsScore : (aiAnalysis?.atsScore ?? null),
    sections: (raw.sections as ResumeDetail['sections']) ?? null,
    skills: (raw.skills as ResumeDetail['skills']) ?? null,
    strengths: (raw.strengths as string[]) ?? [],
    weaknesses: (raw.weaknesses as string[]) ?? [],
    improvements: (raw.improvements as ResumeDetail['improvements']) ?? null,
    courseRecommendations: mapCourses(raw),
    jobRecommendations: mapJobs(raw),
  };
}

export const resumeApi = {
  upload: async (
    file: File,
    onProgress?: (percent: number) => void,
    provider?: AiProvider
  ) => {
    const formData = new FormData();
    formData.append('resume', file);

    const response = await axiosClient.post<ApiResponse<Record<string, unknown>>>(
      '/resume/upload',
      formData,
      {
        skipRateLimitToast: true,
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(provider ? { 'X-AI-Provider': provider } : {}),
        },
        onUploadProgress: (event) => {
          if (event.total && onProgress) {
            onProgress(Math.round((event.loaded * 100) / event.total));
          }
        },
      }
    );

    return {
      ...response,
      data: {
        ...response.data,
        data: response.data.data ? mapResumeFromApi(response.data.data) : undefined,
      },
    };
  },

  getMyResumes: async () => {
    const response = await axiosClient.get<ApiResponse<Record<string, unknown>[]>>(
      '/resume/my'
    );
    return {
      ...response,
      data: {
        ...response.data,
        data: response.data.data?.map(mapResumeFromApi),
      },
    };
  },

  reanalyze: async (resumeId: string, provider?: AiProvider) => {
    const response = await axiosClient.post<ApiResponse<Record<string, unknown>>>(
      `/resume/reanalyze/${resumeId}`,
      undefined,
      {
        headers: provider ? { 'X-AI-Provider': provider } : undefined,
      }
    );
    return {
      ...response,
      data: {
        ...response.data,
        data: response.data.data ? mapResumeFromApi(response.data.data) : undefined,
      },
    };
  },

  getCourseRecommendations: (resumeId: string, provider?: AiProvider) =>
    axiosClient.get<ApiResponse<CourseRecommendationsData>>(
      `/courses/${resumeId}/recommend`,
      {
        headers: provider ? { 'X-AI-Provider': provider } : undefined,
      }
    ),

  getJobRecommendations: (resumeId: string, provider?: AiProvider) =>
    axiosClient.get<ApiResponse<JobRecommendationsData>>(`/jobs/${resumeId}/recommend`, {
      headers: provider ? { 'X-AI-Provider': provider } : undefined,
    }),

  downloadReport: (resumeId: string) =>
    axiosClient.get(`/report/${resumeId}/download`, {
      responseType: 'blob',
    }),
};
