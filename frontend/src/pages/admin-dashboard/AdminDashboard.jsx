import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import AdminHeader from './components/AdminHeader';
import AdminSidebar from './components/AdminSidebar';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const itemsPerPage = 10;

    // useEffect(() => {
    //     fetchUsers();
    // }, [currentPage]);

    // const fetchUsers = async () => {
    //     try {
    //         setLoading(true);
    //         const response = await api.get('/users', {
    //             params: { page: currentPage, limit: itemsPerPage }
    //         });
    //         setUsers(response.data.users);
    //     } catch (err) {
    //         console.error('Failed to fetch users', err);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // const handleDeleteUser = async (userId) => {
    //     if (window.confirm('Delete this user?')) {
    //         try {
    //             await api.delete(`/users/${userId}`);
    //             fetchUsers(); // Refresh list
    //         } catch (err) {
    //             console.error('Failed to delete user', err);
    //         }
    //     }
    // };

    return (
    <div className="dashboard-container">
        <AdminHeader />
        <div className="dashboard-body">
        <AdminSidebar />
        <main className="dashboard-content">
            {/* page content */}
        </main>
        </div>
        <footer className="footer-copyright">
        <p>© 2024 Z-Drive Enterprise. All rights reserved.</p>
        </footer>
    </div>
    );
};

export default AdminDashboard;