import { Outlet } from 'react-router-dom';
import AdminHeader from '../admin-dashboard/components/AdminHeader';
import AdminSidebar from '../admin-dashboard/components/AdminSidebar';
import './DashboardLayout.css';

const DashboardLayout = () => {
    return (
        <div className="dashboard-container">
            <AdminHeader />
            <div className="dashboard-body">
                <AdminSidebar />
                <main className="dashboard-content">
                    <Outlet />
                </main>
            </div>
            <footer className="footer-copyright">
                <p>© 2024 Z-Drive Enterprise. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default DashboardLayout;