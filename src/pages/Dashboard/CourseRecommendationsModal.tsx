import { Tag, Empty, Row, Col } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import { AppModal } from '@/components/common/AppModal';
import { PageLoader } from '@/components/common/PageLoader';
import type { CourseRecommendation } from '@/types/api';
import styles from './CourseRecommendationsModal.module.scss';

interface CourseRecommendationsModalProps {
  open: boolean;
  loading: boolean;
  courses: CourseRecommendation[];
  onClose: () => void;
}

export function CourseRecommendationsModal({
  open,
  loading,
  courses,
  onClose,
}: CourseRecommendationsModalProps) {
  return (
    <AppModal
      title="AI Course Recommendations"
      open={open}
      onCancel={onClose}
      footer={null}
      width={720}
    >
      {loading ? (
        <PageLoader tip="Generating recommendations..." fullPage={false} />
      ) : courses.length === 0 ? (
        <Empty description="No courses recommended yet" />
      ) : (
        <Row gutter={[16, 16]}>
          {courses.map((course) => (
            <Col xs={24} sm={24} md={12} key={course.title}>
              <div className={styles.courseCard}>
                <div className={styles.courseHeader}>
                  <BookOutlined className={styles.icon} />
                  <h3>{course.title}</h3>
                </div>
                <Tag color="blue">{course.platform}</Tag>
                <p className={styles.reason}>{course.reason}</p>
                <div className={styles.skills}>
                  {course.skillsCovered?.map((skill) => (
                    <Tag key={skill}>{skill}</Tag>
                  ))}
                </div>
              </div>
            </Col>
          ))}
        </Row>
      )}
    </AppModal>
  );
}
