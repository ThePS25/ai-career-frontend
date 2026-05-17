import { Card, type CardProps } from 'antd';
import styles from './AppCard.module.scss';

export type AppCardProps = CardProps;

export function AppCard({ className, ...props }: AppCardProps) {
  return (
    <Card
      className={[styles.card, className].filter(Boolean).join(' ')}
      bordered={false}
      {...props}
    />
  );
}
