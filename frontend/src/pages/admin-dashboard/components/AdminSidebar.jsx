import SidebarItem from './SidebarItem';
import { FolderIcon, ShareIcon, UsersIcon, ShieldIcon, ClockIcon } from 'lucide-react';

const navItems = [
  { name: 'My Files',         icon: <FolderIcon />, path: '/dashboard' },
  { name: 'Shared Items',     icon: <ShareIcon />,  path: '/dashboard/shared' },
  { name: 'User Management',  icon: <UsersIcon />,  path: '/dashboard/users' },
  { name: 'Role Management',  icon: <ShieldIcon />, path: '/dashboard/roles' },
  { name: 'Audit Logs',       icon: <ClockIcon />,  path: '/dashboard/audit' },
];

const AdminSidebar = () => (
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

    {/* <div className="sidebar-footer">
      <button className="btn-upload">Upload File</button>
      <SidebarItem name="Support"       icon={<HelpIcon />}   path="/support" />
      <SidebarItem name="System Status" icon={<StatusIcon />} path="/status" />
    </div> */}
  </aside>
);

export default AdminSidebar;