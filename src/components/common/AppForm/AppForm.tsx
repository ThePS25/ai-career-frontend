import { Form, type FormProps } from 'antd';
import type { ReactNode } from 'react';
import styles from './AppForm.module.scss';

export type AppFormProps = FormProps;

export function AppForm({ className, children, ...props }: AppFormProps) {
  return (
    <Form
      layout="vertical"
      requiredMark={false}
      className={[styles.form, className].filter(Boolean).join(' ')}
      {...props}
    >
      {children as ReactNode}
    </Form>
  );
}

AppForm.useForm = Form.useForm;
AppForm.Item = Form.Item;
AppForm.List = Form.List;
