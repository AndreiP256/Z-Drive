import SidebarItem from './SidebarItem';
import './Sidebar.css'
import { FolderIcon, ShareIcon, UsersIcon, ShieldIcon, ClockIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { name: 'My Files', icon: <FolderIcon />, path: '/dashboard' },
  { name: 'Shared Items', icon: <ShareIcon />, path: '/shared' },
  { name: 'User Management', icon: <UsersIcon />, path: '/users', visibleTo: ['ADMIN'] },
  { name: 'Role Management', icon: <ShieldIcon />, path: '/roles', visibleTo: ['ADMIN', 'MANAGER'] },
  { name: 'Audit Logs', icon: <ClockIcon />, path: '/audit', visibleTo: ['ADMIN', 'MANAGER'] },
  { name: 'Profile', icon: <UsersIcon />, path: '/profile' },
];

const Sidebar = () => {
  const { user } = useAuth();
  const currentRole = user?.role;

  const visibleNavItems = navItems.filter((item) => {
    if (!item.visibleTo) {
      return true;
    }

    return currentRole ? item.visibleTo.includes(currentRole) : false;
  });

  return (
    <aside className="sidebar">
      <div className="sidebar_header">
        <p className="sidebar_brand">FILE VAULT</p>
        <p className="sidebar_subtitle">Institutional Security</p>
      </div>

      <nav className="sidebar-nav">
        {visibleNavItems.map((item) => (
          <SidebarItem key={item.path} {...item} />
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;