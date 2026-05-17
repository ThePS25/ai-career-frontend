import { Button, type ButtonProps } from 'antd';
import styles from './AppButton.module.scss';

export type AppButtonProps = ButtonProps;

export function AppButton({ className, ...props }: AppButtonProps) {
  return (
    <Button
      className={[styles.button, className].filter(Boolean).join(' ')}
      {...props}
    />
  );
}
