import {
  FileAddOutlined,
  FileTextOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import { Layout, Menu, type MenuProps } from 'antd';
import styles from './Sidebar.module.scss';

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
  activeSection: 'upload' | 'reports';
  onNavigate: (section: 'upload' | 'reports') => void;
  isMobile?: boolean;
}

const menuItems: MenuProps['items'] = [
  {
    key: 'upload',
    icon: <FileAddOutlined />,
    label: 'Upload Resume',
  },
  {
    key: 'reports',
    icon: <FileTextOutlined />,
    label: 'My Reports',
  },
];

export function Sidebar({
  collapsed,
  activeSection,
  onNavigate,
  isMobile = false,
}: SidebarProps) {
  return (
    <Sider
      collapsible
      collapsed={collapsed}
      trigger={null}
      width={240}
      collapsedWidth={isMobile ? 0 : 72}
      className={[styles.sider, isMobile && !collapsed && styles.siderMobileOpen]
        .filter(Boolean)
        .join(' ')}
      breakpoint="lg"
    >
      <div className={styles.brand}>
        <RocketOutlined className={styles.logo} />
        {!collapsed && <span>AI Career Copilot</span>}
      </div>
      <Menu
        mode="inline"
        selectedKeys={[activeSection]}
        items={menuItems}
        onClick={({ key }) => onNavigate(key as 'upload' | 'reports')}
        className={styles.menu}
      />
    </Sider>
  );
}
