import {
  BookOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { Col, Progress, Row, Tag, Typography } from 'antd';
import type { CourseRecommendation, ResumeDetail } from '@/types/api';
import styles from './ResumeDetailsPanel.module.scss';

const { Title, Text } = Typography;

interface ResumeDetailsPanelProps {
  resume: ResumeDetail;
  courses?: CourseRecommendation[];
  compact?: boolean;
}

function getScoreStatus(score: number | null): 'success' | 'normal' | 'exception' {
  if (score === null) return 'normal';
  if (score >= 80) return 'success';
  if (score >= 60) return 'normal';
  return 'exception';
}

export function ResumeDetailsPanel({
  resume,
  courses = resume.courseRecommendations ?? [],
  compact = false,
}: ResumeDetailsPanelProps) {
  const allSkills = [
    ...(resume.skills?.technical ?? []),
    ...(resume.skills?.soft ?? []),
    ...(resume.skills?.tools ?? []),
  ];

  return (
    <div className={[styles.panel, compact && styles.compact].filter(Boolean).join(' ')}>
      <div className={styles.header}>
        <div>
          <Title level={compact ? 5 : 4} className={styles.fileName}>
            {resume.fileName}
          </Title>
          <Text type="secondary">
            {new Date(resume.createdAt).toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </Text>
        </div>
        <div className={styles.scoreBlock}>
          <Progress
            type="circle"
            percent={resume.atsScore ?? 0}
            size={compact ? 72 : 88}
            status={getScoreStatus(resume.atsScore)}
            format={(p) => (
              <span className={styles.scoreLabel}>
                <small>ATS</small>
                {p}%
              </span>
            )}
          />
        </div>
      </div>

      <Row gutter={[16, 16]} className={styles.grid}>
        <Col xs={24} md={12}>
          <div className={styles.block}>
            <Title level={5}>
              <CheckCircleOutlined className={styles.iconSuccess} />
              Strengths
            </Title>
            {resume.strengths.length > 0 ? (
              <ul className={styles.list}>
                {resume.strengths.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <Text type="secondary">No strengths identified</Text>
            )}
          </div>
        </Col>

        <Col xs={24} md={12}>
          <div className={styles.block}>
            <Title level={5}>
              <CloseCircleOutlined className={styles.iconError} />
              Weaknesses
            </Title>
            {resume.weaknesses.length > 0 ? (
              <ul className={styles.list}>
                {resume.weaknesses.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <Text type="secondary">No weaknesses identified</Text>
            )}
          </div>
        </Col>

        {allSkills.length > 0 && (
          <Col xs={24}>
            <div className={styles.block}>
              <Title level={5}>
                <TrophyOutlined className={styles.iconPrimary} />
                Skills
              </Title>
              <div className={styles.tags}>
                {allSkills.map((skill) => (
                  <Tag key={skill}>{skill}</Tag>
                ))}
              </div>
            </div>
          </Col>
        )}

        {courses.length > 0 && (
          <Col xs={24}>
            <div className={styles.block}>
              <Title level={5}>
                <BookOutlined className={styles.iconPrimary} />
                Recommended Courses
              </Title>
              <div className={styles.courses}>
                {courses.map((course) => (
                  <div key={course.title} className={styles.courseItem}>
                    <div className={styles.courseTop}>
                      <strong>{course.title}</strong>
                      <Tag color="blue">{course.platform}</Tag>
                    </div>
                    <Text type="secondary" className={styles.courseReason}>
                      {course.reason}
                    </Text>
                    <div className={styles.tags}>
                      {course.skillsCovered?.map((s) => (
                        <Tag key={s}>{s}</Tag>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Col>
        )}
      </Row>
    </div>
  );
}
