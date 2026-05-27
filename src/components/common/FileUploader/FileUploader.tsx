import { useState } from 'react';
import { InboxOutlined } from '@ant-design/icons';
import { App, Upload, type UploadProps } from 'antd';
import styles from './FileUploader.module.scss';

const { Dragger } = Upload;

interface FileUploaderProps {
  onUpload: (file: File) => Promise<void>;
  disabled?: boolean;
}

export function FileUploader({ onUpload, disabled }: FileUploaderProps) {
  const { message } = App.useApp();
  const [uploading, setUploading] = useState(false);

  const customRequest: UploadProps['customRequest'] = async (options) => {
    const file = options.file as File;

    if (file.type !== 'application/pdf') {
      message.error('Only PDF files are allowed');
      options.onError?.(new Error('Invalid file type'));
      return;
    }

    setUploading(true);

    try {
      await onUpload(file);
      message.success('Resume uploaded and analyzed successfully');
      options.onSuccess?.({});
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Upload failed. Please try again.';
      message.error(errorMessage);
      options.onError?.(err as Error);
    } finally {
      setUploading(false);
    }
  };

  const uploadProps: UploadProps = {
    name: 'resume',
    multiple: false,
    accept: '.pdf,application/pdf',
    showUploadList: false,
    disabled: disabled || uploading,
    beforeUpload: (file) => {
      if (file.type !== 'application/pdf') {
        message.error('Only PDF files are allowed');
        return Upload.LIST_IGNORE;
      }
      return true;
    },
    customRequest,
  };

  return (
    <div className={styles.wrapper}>
      <Dragger {...uploadProps} className={styles.dragger}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag PDF resume to upload</p>
        <p className="ant-upload-hint">Only PDF files · Max one file at a time</p>
      </Dragger>
    </div>
  );
}
