import { useState } from 'react';
import { InboxOutlined } from '@ant-design/icons';
import { App, Progress, Upload, type UploadProps } from 'antd';
import { getErrorMessage, notifyApiError } from '@/utils/errors';
import styles from './FileUploader.module.scss';

const { Dragger } = Upload;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface FileUploaderProps {
  onUpload: (file: File, onProgress?: (percent: number) => void) => Promise<void>;
  disabled?: boolean;
}

function validatePdf(file: File): string | null {
  const isPdf =
    file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

  if (!isPdf) {
    return 'Only PDF files are allowed';
  }

  if (file.size > MAX_FILE_SIZE) {
    return 'File too large. Maximum size is 5MB.';
  }

  return null;
}

export function FileUploader({ onUpload, disabled }: FileUploaderProps) {
  const { message } = App.useApp();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const customRequest: UploadProps['customRequest'] = async (options) => {
    const file = options.file as File;
    const validationError = validatePdf(file);

    if (validationError) {
      message.error(validationError);
      options.onError?.(new Error(validationError));
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      await onUpload(file, setProgress);
      message.success('Resume uploaded and analyzed successfully');
      options.onSuccess?.({});
    } catch (err) {
      notifyApiError(message, err, 'Upload failed. Please try again.');
      const errorMessage = getErrorMessage(err, 'Upload failed. Please try again.');
      options.onError?.(new Error(errorMessage));
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const uploadProps: UploadProps = {
    name: 'resume',
    multiple: false,
    accept: '.pdf,application/pdf',
    showUploadList: false,
    disabled: disabled || uploading,
    beforeUpload: (file) => {
      const validationError = validatePdf(file);
      if (validationError) {
        message.error(validationError);
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
        <p className="ant-upload-hint">PDF only · Max 5MB · One file at a time</p>
      </Dragger>
      {uploading && (
        <Progress
          percent={progress}
          status="active"
          className={styles.progress}
          format={(p) => (p !== undefined && p < 100 ? `Uploading ${p}%` : 'Analyzing...')}
        />
      )}
    </div>
  );
}
