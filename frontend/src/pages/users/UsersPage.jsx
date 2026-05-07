import React, { useState } from 'react';
import './UserPage.css';
import User from './User.jsx';

const UsersPage = () => {
    const users = [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Editor', status: 'Inactive' },
        { id: 4, name: 'Alice Williams', email: 'alice@example.com', role: 'User', status: 'Active' },
        { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', role: 'User', status: 'Inactive' },
        { id: 6, name: 'Eve Davis', email: 'eve@example.com', role: 'User', status: 'Active' },
        { id: 7, name: 'Frank Miller', email: 'frank@example.com', role: 'Editor', status: 'Active' },
        { id: 8, name: 'Grace Lee', email: 'grace@example.com', role: 'User', status: 'Active' },
        { id: 9, name: 'Henry Wilson', email: 'henry@example.com', role: 'User', status: 'Inactive' },
        { id: 10, name: 'Ivy Moore', email: 'ivy@example.com', role: 'Editor', status: 'Active' },
        { id: 11, name: 'Jack Taylor', email: 'jack@example.com', role: 'User', status: 'Active' },
        { id: 12, name: 'Kate Anderson', email: 'kate@example.com', role: 'User', status: 'Inactive' },
    ];

    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 6;
    const total = 124;
    const totalPages = Math.ceil(total / perPage);

    const start = (currentPage - 1) * perPage + 1;
    const end = Math.min(currentPage * perPage, total);

    const startPage = Math.max(1, Math.min(currentPage - 1, Math.max(1, totalPages - 2)));
    const endPage = Math.min(totalPages, startPage + 2);
    const pages = [];
    for (let p = startPage; p <= endPage; p++) pages.push(p);

    const goToPage = (p) => setCurrentPage(Math.max(1, Math.min(totalPages, p)));

    return (
        <div className="users-table-container">
            <div className="users-table-wrapper">
                <table className="users-table">
                    <thead>
                        <tr className="users-table-header-row">
                            <th className="users-table-header-cell">Name</th>
                            <th className="users-table-header-cell">Email</th>
                            <th className="users-table-header-cell">Role</th>
                            <th className="users-table-header-cell">Status</th>
                            <th className="users-table-header-cell users-table-actions-cell">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.slice(start - 1, end).map(user => (
                            <User key={user.id} user={user} />
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
                        ‹
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
                        ›
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UsersPage;