import { Alert } from 'antd';
import styles from './RateLimitAlert.module.scss';

interface RateLimitAlertProps {
  message: string;
  onClose?: () => void;
}

export function RateLimitAlert({ message, onClose }: RateLimitAlertProps) {
  return (
    <Alert
      type="warning"
      showIcon
      closable={Boolean(onClose)}
      onClose={onClose}
      className={styles.alert}
      message="Too many requests"
      description={message}
    />
  );
}
