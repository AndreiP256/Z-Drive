import { Link, useLocation } from 'react-router-dom';

import './Sidebar.css'

const SidebarItem = ({ name, icon, path }) => {
  const { pathname } = useLocation();
  const isActive = pathname === path;

  return (
    <Link to={path} className={`sidebar-item ${isActive ? 'sidebar-item--active' : ''}`}>
      <span className="sidebar-item_icon">{icon}</span>
      <span className="sidebar-item_label">{name}</span>
    </Link>
  );
};

export default SidebarItem;