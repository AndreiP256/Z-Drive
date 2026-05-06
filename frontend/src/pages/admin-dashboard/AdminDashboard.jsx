import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import AdminHeader from './components/AdminHeader';

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
        <div className="flex h-screen bg-surface">
            {/* <AdminSidebar />
             */}
            <div className="flex-1 flex flex-col ml-64">
                <AdminHeader onCreateUserClick={() => setShowCreateModal(true)} />
                
                {/* <main className="flex-1 overflow-y-auto p-lg">
                    <div className="max-w-7xl mx-auto">
                        <UsersTable
                            users={users}
                            loading={loading}
                            currentPage={currentPage}
                            onPageChange={setCurrentPage}
                            onDeleteUser={handleDeleteUser}
                        />
                    </div>
                </main> */}

                <footer className="footer-copyright">
                    <p>© 2024 Z-Drive Enterprise. All rights reserved.</p>
                </footer>
            </div>
        </div>
    );
};

export default AdminDashboard;