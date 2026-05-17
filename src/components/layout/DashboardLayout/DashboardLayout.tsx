import { useEffect, useState } from 'react';
import { Layout } from 'antd';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import styles from './DashboardLayout.module.scss';

const { Content } = Layout;

export function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const activeSection = location.hash === '#reports' ? 'reports' : 'upload';

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 992) {
        setCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavigate = (section: 'upload' | 'reports') => {
    navigate(`/dashboard#${section}`);
    const el = document.getElementById(section);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <Layout className={styles.layout}>
      <Sidebar
        collapsed={collapsed}
        activeSection={activeSection}
        onNavigate={handleNavigate}
      />
      <Layout className={styles.main}>
        <Header
          collapsed={collapsed}
          onToggleSidebar={() => setCollapsed((c) => !c)}
        />
        <Content className={styles.content}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
