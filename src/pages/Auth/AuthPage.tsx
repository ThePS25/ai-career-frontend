import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RocketOutlined } from '@ant-design/icons';
import { App, Divider, Input, Tabs, type TabsProps } from 'antd';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppForm } from '@/components/common/AppForm';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/utils/errors';
import type { LoginPayload, RegisterPayload } from '@/types/api';
import styles from './AuthPage.module.scss';

export function AuthPage() {
  const { message } = App.useApp();
  const { login, register, loginWithGoogle } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const googleEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('session') === 'expired') {
      message.warning('Your session has expired. Please sign in again.');
      searchParams.delete('session');
      searchParams.delete('returnTo');
      setSearchParams(searchParams, { replace: true });
    }
  }, [message, searchParams, setSearchParams]);
  const [loginForm] = AppForm.useForm<LoginPayload>();
  const [registerForm] = AppForm.useForm<RegisterPayload>();

  const handleLogin = async (values: LoginPayload) => {
    setLoading(true);
    try {
      await login(values);
      message.success('Welcome back!');
    } catch (error) {
      message.error(getErrorMessage(error, 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credential: string) => {
    setLoading(true);
    try {
      await loginWithGoogle(credential);
      message.success('Signed in with Google!');
    } catch (error) {
      message.error(getErrorMessage(error, 'Google sign-in failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: RegisterPayload) => {
    setLoading(true);
    try {
      await register(values);
      message.success('Account created successfully!');
    } catch (error) {
      message.error(getErrorMessage(error, 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  const tabItems: TabsProps['items'] = [
    {
      key: 'login',
      label: 'Login',
      children: (
        <AppForm form={loginForm} onFinish={handleLogin}>
          <AppForm.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Enter a valid email' },
            ]}
          >
            <Input placeholder="you@example.com" size="large" />
          </AppForm.Item>
          <AppForm.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Password is required' }]}
          >
            <Input.Password placeholder="Your password" size="large" />
          </AppForm.Item>
          <AppButton type="primary" htmlType="submit" block size="large" loading={loading}>
            Sign in
          </AppButton>
        </AppForm>
      ),
    },
    {
      key: 'register',
      label: 'Register',
      children: (
        <AppForm form={registerForm} onFinish={handleRegister}>
          <AppForm.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Enter a valid email' },
            ]}
          >
            <Input placeholder="you@example.com" size="large" />
          </AppForm.Item>
          <AppForm.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Password is required' },
              { min: 8, message: 'Password must be at least 8 characters' },
            ]}
          >
            <Input.Password placeholder="Min. 8 characters" size="large" />
          </AppForm.Item>
          <AppButton type="primary" htmlType="submit" block size="large" loading={loading}>
            Create account
          </AppButton>
        </AppForm>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <AppCard className={styles.card}>
        <div className={styles.hero}>
          <RocketOutlined className={styles.icon} />
          <h1>AI Career Copilot</h1>
          <p>Upload your resume, get ATS insights, and personalized course recommendations.</p>
        </div>
        <Tabs defaultActiveKey="login" items={tabItems} className={styles.tabs} />
        {googleEnabled && (
          <>
            <Divider plain className={styles.divider}>
              or
            </Divider>
            <GoogleSignInButton
              onSuccess={handleGoogleSuccess}
              onError={() => message.error('Google sign-in was cancelled or failed')}
            />
          </>
        )}
      </AppCard>
    </div>
  );
}
