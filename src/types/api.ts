export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}

export interface User {
  id: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
}

export interface ResumeListItem {
  _id: string;
  fileName: string;
  createdAt: string;
  aiAnalysis: {
    atsScore: number | null;
  };
}

export interface CourseRecommendation {
  title: string;
  platform: string;
  reason: string;
  skillsCovered: string[];
}

export interface CourseRecommendationsData {
  courses: CourseRecommendation[];
}
