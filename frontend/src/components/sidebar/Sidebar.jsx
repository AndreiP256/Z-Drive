import SidebarItem from './SidebarItem';
import './Sidebar.css'
import { FolderIcon, ShareIcon, UsersIcon, ShieldIcon, ClockIcon } from 'lucide-react';

const navItems = [
  { name: 'My Files',         icon: <FolderIcon />, path: '/dashboard' },
  { name: 'Shared Items',     icon: <ShareIcon />,  path: '/shared' },
  { name: 'User Management',  icon: <UsersIcon />,  path: '/users' },
  { name: 'Role Management',  icon: <ShieldIcon />, path: '/roles' },
  { name: 'Audit Logs',       icon: <ClockIcon />,  path: '/audit' },
];

const Sidebar = () => (
  <aside className="sidebar">
    <div className="sidebar_header">
      <p className="sidebar_brand">FILE VAULT</p>
      <p className="sidebar_subtitle">Institutional Security</p>
    </div>

    <nav className="sidebar-nav">
      {navItems.map((item) => (
        <SidebarItem key={item.path} {...item} />
      ))}
    </nav>
  </aside>
);

export default Sidebar;