import { useEffect, useState } from 'react';
import { Layout } from 'antd';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import styles from './DashboardLayout.module.scss';

const { Content } = Layout;
const MOBILE_BREAKPOINT = 992;

export function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const activeSection = location.hash === '#reports' ? 'reports' : 'upload';

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavigate = (section: 'upload' | 'reports') => {
    navigate(`/dashboard#${section}`);
    if (isMobile) {
      setCollapsed(true);
    }
  };

  const showMobileOverlay = isMobile && !collapsed;

  return (
    <Layout className={styles.layout}>
      {showMobileOverlay && (
        <button
          type="button"
          className={styles.overlay}
          aria-label="Close sidebar"
          onClick={() => setCollapsed(true)}
        />
      )}
      <Sidebar
        collapsed={collapsed}
        activeSection={activeSection}
        onNavigate={handleNavigate}
        isMobile={isMobile}
      />
      <Layout className={styles.main}>
        <Header
          collapsed={collapsed}
          onToggleSidebar={() => setCollapsed((c) => !c)}
        />
        <Content className={styles.content}>
          <Outlet context={{ activeSection }} />
        </Content>
      </Layout>
    </Layout>
  );
}
