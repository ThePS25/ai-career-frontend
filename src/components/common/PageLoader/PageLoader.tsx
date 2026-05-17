import { Spin } from 'antd';
import styles from './PageLoader.module.scss';

interface PageLoaderProps {
  tip?: string;
  fullPage?: boolean;
}

export function PageLoader({ tip = 'Loading...', fullPage = true }: PageLoaderProps) {
  return (
    <div className={[styles.loader, fullPage && styles.fullPage].filter(Boolean).join(' ')}>
      <Spin size="large" tip={tip} />
    </div>
  );
}
