import { useCallback, useEffect, useState } from 'react';
import {
  DownloadOutlined,
  ReadOutlined,
  FileTextOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import { App, Empty, Progress, Space, Table, Tag, type TableColumnsType } from 'antd';
import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { FileUploader } from '@/components/common/FileUploader';
import { resumeApi } from '@/api/resumeApi';
import { getErrorMessage } from '@/utils/errors';
import type { CourseRecommendation, ResumeListItem } from '@/types/api';
import { CourseRecommendationsModal } from './CourseRecommendationsModal';
import styles from './DashboardPage.module.scss';

function getScoreColor(score: number | null): string {
  if (score === null) return 'default';
  if (score >= 80) return 'success';
  if (score >= 60) return 'warning';
  return 'error';
}

export function DashboardPage() {
  const { message } = App.useApp();
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [courses, setCourses] = useState<CourseRecommendation[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const fetchResumes = useCallback(async () => {
    setLoadingList(true);
    try {
      const { data } = await resumeApi.getMyResumes();
      if (data.success && data.data) {
        setResumes(data.data);
      }
    } catch (error) {
      message.error(getErrorMessage(error, 'Failed to load resumes'));
    } finally {
      setLoadingList(false);
    }
  }, [message]);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const handleUpload = async (file: File, onProgress: (percent: number) => void) => {
    setProcessing(true);
    try {
      await resumeApi.upload(file, onProgress);
      await fetchResumes();
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Upload failed'));
    } finally {
      setProcessing(false);
    }
  };

  const handleGetCourses = async (resumeId: string) => {
    setCoursesOpen(true);
    setCoursesLoading(true);
    setCourses([]);
    try {
      const { data } = await resumeApi.getCourseRecommendations(resumeId);
      if (data.success && data.data?.courses) {
        setCourses(data.data.courses);
      }
    } catch (error) {
      message.error(getErrorMessage(error, 'Failed to load courses'));
      setCoursesOpen(false);
    } finally {
      setCoursesLoading(false);
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
      message.error(getErrorMessage(error, 'Failed to download report'));
    } finally {
      setDownloadingId(null);
    }
  };

  const columns: TableColumnsType<ResumeListItem> = [
    {
      title: 'File Name',
      dataIndex: 'fileName',
      key: 'fileName',
      ellipsis: true,
      render: (name: string) => (
        <Space>
          <FileTextOutlined />
          {name}
        </Space>
      ),
    },
    {
      title: 'ATS Score',
      key: 'atsScore',
      width: 120,
      render: (_, record) => {
        const score = record.aiAnalysis?.atsScore;
        return (
          <Tag color={getScoreColor(score ?? null)}>
            {score !== null && score !== undefined ? `${score}%` : 'N/A'}
          </Tag>
        );
      },
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      responsive: ['md'],
      render: (date: string) =>
        new Date(date).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 280,
      render: (_, record) => (
        <Space wrap>
          <AppButton
            size="small"
            icon={<ReadOutlined />}
            onClick={() => handleGetCourses(record._id)}
          >
            Get Courses
          </AppButton>
          <AppButton
            size="small"
            icon={<DownloadOutlined />}
            loading={downloadingId === record._id}
            onClick={() => handleDownloadReport(record._id, record.fileName)}
          >
            Download Report
          </AppButton>
        </Space>
      ),
    },
  ];

  return (
    <div className={`${styles.page} page-enter`}>
      <section id="upload" className={styles.section}>
        <AppCard
          title={
            <Space>
              <InboxOutlined />
              Upload Resume
            </Space>
          }
        >
          <p className={styles.sectionDesc}>
            Upload a PDF resume to get an ATS score, AI analysis, and personalized insights.
          </p>
          <FileUploader onUpload={handleUpload} disabled={processing} />
          {processing && (
            <div className={styles.processing}>
              <Progress percent={99} status="active" showInfo={false} strokeColor="#5b6cff" />
              <span>AI is analyzing your resume — this may take a minute…</span>
            </div>
          )}
        </AppCard>
      </section>

      <section id="reports" className={styles.section}>
        <AppCard
          title={
            <Space>
              <FileTextOutlined />
              Resume History
            </Space>
          }
        >
          <Table
            rowKey="_id"
            columns={columns}
            dataSource={resumes}
            loading={loadingList}
            pagination={{ pageSize: 8, showSizeChanger: false }}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No resumes yet. Upload your first PDF above."
                />
              ),
            }}
            scroll={{ x: 600 }}
          />
        </AppCard>
      </section>

      <CourseRecommendationsModal
        open={coursesOpen}
        loading={coursesLoading}
        courses={courses}
        onClose={() => setCoursesOpen(false)}
      />
    </div>
  );
}
