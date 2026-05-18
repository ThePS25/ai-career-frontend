import { Skeleton } from 'antd';
import styles from './UploadSkeleton.module.scss';

export function UploadSkeleton() {
  return (
    <div className={styles.skeleton}>
      <Skeleton.Image active className={styles.icon} />
      <Skeleton.Input active block size="large" className={styles.line} />
      <Skeleton.Input active block size="small" className={styles.lineShort} />
      <p className={styles.hint}>AI is analyzing your resume — this may take a minute…</p>
    </div>
  );
}
