import { useCallback, useEffect, useState } from 'react';
import {
  DownloadOutlined,
  FileTextOutlined,
  InboxOutlined,
  RobotOutlined,
  ReadOutlined,
  ReloadOutlined,
  SolutionOutlined,
} from '@ant-design/icons';
import { App, Collapse, Empty, Segmented, Space, Skeleton, Tag } from 'antd';
import { RateLimitAlert } from '@/components/common/RateLimitAlert';
import { useOutletContext } from 'react-router-dom';
import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { FileUploader } from '@/components/common/FileUploader';
import { UploadSkeleton } from '@/components/common/UploadSkeleton';
import { resumeApi } from '@/api/resumeApi';
import { systemApi } from '@/api/systemApi';
import {
  getErrorMessage,
  isTooManyRequestsError,
  notifyApiError,
} from '@/utils/errors';
import type { AiProvider, ResumeDetail } from '@/types/api';
import { ResumeDetailsPanel } from './ResumeDetailsPanel';
import styles from './DashboardPage.module.scss';

type DashboardContext = { activeSection: 'upload' | 'reports' };

async function fetchRecommendationsForResume(
  resume: ResumeDetail,
  provider?: AiProvider
): Promise<ResumeDetail> {
  let updated = { ...resume };

  if (!updated.courseRecommendations?.length) {
    const { data } = await resumeApi.getCourseRecommendations(resume._id, provider);
    updated = { ...updated, courseRecommendations: data.data?.courses ?? [] };
  }

  if (!updated.jobRecommendations?.length) {
    const { data } = await resumeApi.getJobRecommendations(resume._id, provider);
    updated = { ...updated, jobRecommendations: data.data?.jobs ?? [] };
  }

  return updated;
}

export function DashboardPage() {
  const { message } = App.useApp();
  const { activeSection } = useOutletContext<DashboardContext>();

  const [resumes, setResumes] = useState<ResumeDetail[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [latestResume, setLatestResume] = useState<ResumeDetail | null>(null);
  const [loadingCoursesId, setLoadingCoursesId] = useState<string | null>(null);
  const [loadingJobsId, setLoadingJobsId] = useState<string | null>(null);
  const [reanalyzingId, setReanalyzingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [rateLimitMessage, setRateLimitMessage] = useState<string | null>(null);
  const [availableProviders, setAvailableProviders] = useState<AiProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<AiProvider | null>(null);

  const fetchResumes = useCallback(async () => {
    setLoadingList(true);
    try {
      const { data } = await resumeApi.getMyResumes();
      if (data.success && data.data) {
        setResumes(data.data);
      }
    } catch (error) {
      notifyApiError(message, error, 'Failed to load resumes');
      if (isTooManyRequestsError(error)) {
        setRateLimitMessage(getErrorMessage(error, 'Failed to load resumes'));
      }
    } finally {
      setLoadingList(false);
    }
  }, [message]);

  useEffect(() => {
    if (activeSection === 'reports') {
      fetchResumes();
    }
  }, [activeSection, fetchResumes]);

  useEffect(() => {
    systemApi
      .getAiStatus()
      .then(({ data }) => {
        const providers = data.data?.availableProviders ?? [];
        setAvailableProviders(providers);
        setSelectedProvider(data.data?.activeProvider ?? providers[0] ?? null);
      })
      .catch((error) => {
        notifyApiError(message, error, 'Failed to load AI provider settings');
      });
  }, [message]);

  const handleUpload = async (file: File, onProgress?: (percent: number) => void) => {
    setProcessing(true);
    setLatestResume(null);
    setRateLimitMessage(null);
    try {
      const { data } = await resumeApi.upload(file, onProgress, selectedProvider ?? undefined);
      if (data.success && data.data) {
        const withRecommendations = await fetchRecommendationsForResume(
          data.data,
          selectedProvider ?? undefined
        );
        setLatestResume(withRecommendations);
        setResumes((prev) => {
          const filtered = prev.filter((r) => r._id !== withRecommendations._id);
          return [withRecommendations, ...filtered];
        });
      }
    } catch (error) {
      const errorText = getErrorMessage(error, 'Upload failed');
      if (isTooManyRequestsError(error)) {
        setRateLimitMessage(errorText);
      }
      throw new Error(errorText, { cause: error });
    } finally {
      setProcessing(false);
    }
  };

  const handleLoadJobs = async (resumeId: string) => {
    setLoadingJobsId(resumeId);
    try {
      const { data } = await resumeApi.getJobRecommendations(
        resumeId,
        selectedProvider ?? undefined
      );
      const jobs = data.data?.jobs ?? [];
      const updater = (r: ResumeDetail) =>
        r._id === resumeId ? { ...r, jobRecommendations: jobs } : r;
      setResumes((prev) => prev.map(updater));
      setLatestResume((prev) => (prev?._id === resumeId ? updater(prev) : prev));
      message.success('Job recommendations loaded');
    } catch (error) {
      notifyApiError(message, error, 'Failed to load jobs');
    } finally {
      setLoadingJobsId(null);
    }
  };

  const handleLoadCourses = async (resumeId: string) => {
    setLoadingCoursesId(resumeId);
    try {
      const { data } = await resumeApi.getCourseRecommendations(
        resumeId,
        selectedProvider ?? undefined
      );
      const courses = data.data?.courses ?? [];
      const updater = (r: ResumeDetail) =>
        r._id === resumeId ? { ...r, courseRecommendations: courses } : r;
      setResumes((prev) => prev.map(updater));
      setLatestResume((prev) => (prev?._id === resumeId ? updater(prev) : prev));
      message.success('Course recommendations loaded');
    } catch (error) {
      notifyApiError(message, error, 'Failed to load courses');
    } finally {
      setLoadingCoursesId(null);
    }
  };

  const handleReanalyze = async (resumeId: string) => {
    setReanalyzingId(resumeId);
    try {
      const { data } = await resumeApi.reanalyze(resumeId, selectedProvider ?? undefined);
      if (data.success && data.data) {
        const existing = resumes.find((r) => r._id === resumeId);
        const updated: ResumeDetail = {
          ...data.data,
          courseRecommendations:
            data.data.courseRecommendations ?? existing?.courseRecommendations,
          jobRecommendations: data.data.jobRecommendations ?? existing?.jobRecommendations,
        };
        setResumes((prev) => prev.map((r) => (r._id === resumeId ? updated : r)));
        setLatestResume((prev) => (prev?._id === resumeId ? updated : prev));
        message.success('Resume re-analyzed successfully');
      }
    } catch (error) {
      notifyApiError(message, error, 'Reanalysis failed');
      if (isTooManyRequestsError(error)) {
        setRateLimitMessage(getErrorMessage(error, 'Reanalysis failed'));
      }
    } finally {
      setReanalyzingId(null);
    }
  };

  const handleDownloadReport = async (resumeId: string, fileName: string) => {
    setDownloadingId(resumeId);
    try {
      const response = await resumeApi.downloadReport(resumeId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report-${fileName.replace(/\.pdf$/i, '')}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      message.success('Report downloaded');
    } catch (error) {
      notifyApiError(message, error, 'Failed to download report');
    } finally {
      setDownloadingId(null);
    }
  };

  const renderActions = (resume: ResumeDetail) => (
    <Space wrap className={styles.actions}>
      <AppButton
        size="small"
        icon={<ReloadOutlined />}
        loading={reanalyzingId === resume._id}
        onClick={() => handleReanalyze(resume._id)}
      >
        Re-analyze
      </AppButton>
      {(!resume.jobRecommendations || resume.jobRecommendations.length === 0) && (
        <AppButton
          size="small"
          icon={<SolutionOutlined />}
          loading={loadingJobsId === resume._id}
          onClick={() => handleLoadJobs(resume._id)}
        >
          Get Jobs
        </AppButton>
      )}
      {(!resume.courseRecommendations || resume.courseRecommendations.length === 0) && (
        <AppButton
          size="small"
          icon={<ReadOutlined />}
          loading={loadingCoursesId === resume._id}
          onClick={() => handleLoadCourses(resume._id)}
        >
          Get Courses
        </AppButton>
      )}
      <AppButton
        size="small"
        icon={<DownloadOutlined />}
        loading={downloadingId === resume._id}
        onClick={() => handleDownloadReport(resume._id, resume.fileName)}
      >
        Download Report
      </AppButton>
    </Space>
  );

  if (activeSection === 'upload') {
    return (
      <div className={`${styles.page} page-enter`}>
        <AppCard
          title={
            <Space>
              <InboxOutlined />
              Upload Resume
            </Space>
          }
        >
          <p className={styles.sectionDesc}>
            Upload a PDF resume to get an ATS score, strengths, weaknesses, job matches, and
            course recommendations.
          </p>

          {rateLimitMessage && (
            <RateLimitAlert
              message={rateLimitMessage}
              onClose={() => setRateLimitMessage(null)}
            />
          )}

          {selectedProvider && (
            <div className={styles.actions}>
              <Space align="center" wrap>
                <Tag icon={<RobotOutlined />} color="blue">
                  Active AI: {selectedProvider}
                </Tag>
                {availableProviders.length > 1 && (
                  <Segmented
                    value={selectedProvider}
                    options={availableProviders.map((provider) => ({
                      label: provider === 'huggingface' ? 'Hugging Face' : 'Gemini',
                      value: provider,
                    }))}
                    onChange={(value) => setSelectedProvider(value as AiProvider)}
                  />
                )}
              </Space>
            </div>
          )}

          {processing ? (
            <UploadSkeleton />
          ) : (
            <FileUploader onUpload={handleUpload} disabled={processing} />
          )}

          {latestResume && !processing && (
            <>
              {renderActions(latestResume)}
              <ResumeDetailsPanel resume={latestResume} />
            </>
          )}
        </AppCard>
      </div>
    );
  }

  return (
    <div className={`${styles.page} page-enter`}>
      <AppCard
        title={
          <Space>
            <FileTextOutlined />
            My Resumes
          </Space>
        }
      >
        {loadingList ? (
          <div className={styles.listSkeleton}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} active paragraph={{ rows: 4 }} className={styles.skeletonItem} />
            ))}
          </div>
        ) : resumes.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No resumes yet. Upload your first PDF from the Upload Resume tab."
          />
        ) : (
          <Collapse
            accordion
            className={styles.collapse}
            items={resumes.map((resume) => ({
              key: resume._id,
              label: (
                <div className={styles.collapseLabel}>
                  <span className={styles.collapseName}>{resume.fileName}</span>
                  <span className={styles.collapseMeta}>
                    ATS: {resume.atsScore ?? 'N/A'}% ·{' '}
                    {new Date(resume.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ),
              children: reanalyzingId === resume._id ? (
                <UploadSkeleton />
              ) : (
                <>
                  {renderActions(resume)}
                  <ResumeDetailsPanel resume={resume} compact />
                </>
              ),
            }))}
          />
        )}
      </AppCard>
    </div>
  );
}
