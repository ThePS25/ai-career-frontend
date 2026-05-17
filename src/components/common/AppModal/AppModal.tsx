import { Modal, type ModalProps } from 'antd';
import styles from './AppModal.module.scss';

export type AppModalProps = ModalProps;

export function AppModal({ className, ...props }: AppModalProps) {
  return (
    <Modal
      className={[styles.modal, className].filter(Boolean).join(' ')}
      centered
      destroyOnClose
      {...props}
    />
  );
}
