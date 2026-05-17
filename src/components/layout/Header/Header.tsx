import { LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Layout } from 'antd';
import { AppButton } from '@/components/common/AppButton';
import { useAuth } from '@/hooks/useAuth';
import styles from './Header.module.scss';

const { Header: AntHeader } = Layout;

interface HeaderProps {
  collapsed: boolean;
  onToggleSidebar: () => void;
}

export function Header({ collapsed, onToggleSidebar }: HeaderProps) {
  const { logout, user } = useAuth();

  return (
    <AntHeader className={styles.header}>
      <div className={styles.left}>
        <AppButton
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggleSidebar}
          className={styles.menuBtn}
        />
        <h1 className={styles.title}>AI Career Copilot</h1>
      </div>
      <div className={styles.right}>
        {user?.email && <span className={styles.email}>{user.email}</span>}
        <AppButton
          type="default"
          icon={<LogoutOutlined />}
          onClick={logout}
        >
          Logout
        </AppButton>
      </div>
    </AntHeader>
  );
}
