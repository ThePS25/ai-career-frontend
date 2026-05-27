export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export interface GoogleLoginPayload {
  credential: string;
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

export interface ResumeSkills {
  technical?: string[];
  soft?: string[];
  tools?: string[];
}

export interface ResumeSections {
  hasSummary?: boolean;
  hasProjects?: boolean;
  hasExperience?: boolean;
  hasEducation?: boolean;
  hasSkills?: boolean;
  hasCertifications?: boolean;
}

export interface ResumeImprovements {
  improvedBullets?: string[];
  summaryRewrite?: string;
}

export interface CourseRecommendation {
  title: string;
  platform: string;
  reason: string;
  skillsCovered: string[];
}

export interface JobRecommendation {
  title: string;
  jobCode?: string;
  company: string;
  location: string;
  matchScore: number;
  reason: string;
  requiredSkills: string[];
  source?: 'adzuna' | 'naukri' | 'indeed' | 'ai' | string;
  jobUrl?: string;
}

export interface ResumeDetail {
  _id: string;
  fileName: string;
  createdAt: string;
  atsScore: number | null;
  sections?: ResumeSections | null;
  skills?: ResumeSkills | null;
  strengths: string[];
  weaknesses: string[];
  improvements?: ResumeImprovements | null;
  courseRecommendations?: CourseRecommendation[];
  jobRecommendations?: JobRecommendation[];
}

export interface CourseRecommendationsData {
  courses: CourseRecommendation[];
}

export interface JobRecommendationsData {
  jobs: JobRecommendation[];
}

export type AiProvider = 'huggingface' | 'gemini';

export interface AiStatusData {
  availableProviders: AiProvider[];
  activeProvider: AiProvider | null;
  canSwitch: boolean;
}
