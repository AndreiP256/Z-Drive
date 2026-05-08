import React, { useState } from 'react';
import './UserPage.css';
import User from './User.jsx';
import AddUserModal from './AddUserModal.jsx';
import { getUsers, deleteUser } from '../../api/usersApi';
import { useEffect } from 'react';
import EditUserModal from './EditUserModal.jsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const UsersPage = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            const data = await getUsers();
            setUsers(data);
        };
        fetchUsers();
    }, []);

    const handleDelete = async (userId) => {
        await deleteUser(userId);
        setUsers(users.filter(user => user.id !== userId));
    };

    const handleUserAdded = (newUser) => {
        setUsers(prev => [...prev, newUser]);
    }

    const handleUserChanged = (updatedUser) => {
        setUsers(prev =>
            prev.map(u => (u.id === updatedUser.id ? updatedUser : u))
        );
    };

    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 6;
    const total = users.length;
    const totalPages = Math.ceil(total / perPage);

    const start = (currentPage - 1) * perPage + 1;
    const end = Math.min(currentPage * perPage, total);

    const startPage = Math.max(1, Math.min(currentPage - 1, Math.max(1, totalPages - 2)));
    const endPage = Math.min(totalPages, startPage + 2);
    const pages = [];
    for (let p = startPage; p <= endPage; p++) pages.push(p);

    const goToPage = (p) => setCurrentPage(Math.max(1, Math.min(totalPages, p)));

    // Add user form state
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);


    return (
        <div className="users-page">
            <header className="page-header">
                <div className="header-info">
                    <h1>User Management</h1>
                    <p>Manage your institution's users.</p>
                </div>
                <button className="upload-btn" onClick={() => setShowModal(true)}>
                        + Add User
                </button>
                {showModal && (
                    <AddUserModal
                        onClose= {() => setShowModal(false)}
                        onUserAdded= {handleUserAdded}
                    />
                )}

                {showEditModal && (
                    <EditUserModal
                        onClose= {() => setShowEditModal(false)}
                        onUserChanged= {handleUserChanged}
                        user= {selectedUser}
                    />
                )}
            </header>
            <div className="users-table-container">
                <div className="users-table-wrapper">
                    <table className="users-table">
                        <thead>
                            <tr className="users-table-header-row">
                                <th className="users-table-header-cell">Name</th>
                                <th className="users-table-header-cell">Email</th>
                                <th className="users-table-header-cell">Role</th>
                                <th className="users-table-header-cell users-table-actions-cell">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.slice(start - 1, end).map(user => (
                                <User key={user.id} user={user} onDelete={handleDelete} onEdit={() => {
                                    setSelectedUser(user);
                                    setShowEditModal(true);
                                }} />
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="users-table-footer">
                    <div className="users-results-summary">
                        Showing {start} to {end} of {total} results
                    </div>

                    <div className="users-pagination">
                        <button
                            className="pagination-button"
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft size={16} aria-hidden="true" />
                        </button>

                        {pages.map(p => (
                            <button
                                key={p}
                                className={`pagination-button ${p === currentPage ? 'pagination-active' : ''}`}
                                onClick={() => goToPage(p)}
                            >
                                {p}
                            </button>
                        ))}

                        <button
                            className="pagination-button"
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight size={16} aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UsersPage;