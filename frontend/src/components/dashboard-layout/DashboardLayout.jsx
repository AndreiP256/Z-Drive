import { Outlet } from 'react-router-dom';
import AdminHeader from '../header/Header';
import Sidebar from '../sidebar/Sidebar';
import './DashboardLayout.css';
import stitch from '../../assets/stitch.png';

const DashboardLayout = () => {
    return (
        <div className="dashboard-container">
            <AdminHeader />
            <div className="dashboard-body">
                <Sidebar />
                <main className="dashboard-content">
                    <Outlet />
                </main>
            </div>
            <footer className="footer-copyright">
                <img src={stitch} className='stitch'></img><p>© 2026 Z-Drive Enterprise. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default DashboardLayout;