import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import './AuditPage.css';
import { Download, Filter, Search, RefreshCw, Calendar } from 'lucide-react';

const AuditPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Pagination
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // Filters
    const [filters, setFilters] = useState({
        action: '',
        startDate: '',
        endDate: '',
    });

    // Statistics
    const [actionStats, setActionStats] = useState({
        UPLOAD: 0,
        DOWNLOAD: 0,
        DELETE: 0,
        RENAME: 0,
        CREATE_FOLDER: 0,
        SHARE_FILE: 0,
        REVOKE_SHARE: 0,
    });

    // Fetch logs
    const fetchLogs = async (pageNum = 0) => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                page: pageNum,
                size: pageSize,
                sortBy: 'timestamp',
                direction: 'DESC',
            };

            if (filters.action) params.action = filters.action;
            if (filters.startDate) params.startDate = new Date(filters.startDate).toISOString();
            if (filters.endDate) params.endDate = new Date(filters.endDate).toISOString();

            const response = await api.get('/logs/filter', { params });

            setLogs(response.data.content || []);
            setTotalPages(response.data.totalPages);
            setTotalElements(response.data.totalElements);
            setPage(pageNum);
        } catch (err) {
            console.error('Error fetching logs:', err);
            setError('Failed to load audit logs. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch stats
    const fetchStats = async () => {
        try {
            const actionList = Object.keys(actionStats);
            for (const action of actionList) {
                try {
                    const response = await api.get(`/logs/stats/action/${action}`);
                    setActionStats(prev => ({
                        ...prev,
                        [action]: response.data || 0
                    }));
                } catch (err) {
                    // Ignore individual stat failures
                }
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    // Load logs on mount and filter change
    useEffect(() => {
        fetchLogs(0);
        fetchStats();
    }, [filters, pageSize]);

    // Handle filter changes
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
        setPage(0);
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            fetchLogs(newPage);
        }
    };

    // Export to CSV
    const handleExportCSV = async () => {
        try {
            const params = {
                action: filters.action || undefined,
                startDate: filters.startDate ? new Date(filters.startDate).toISOString() : undefined,
                endDate: filters.endDate ? new Date(filters.endDate).toISOString() : undefined,
            };

            const response = await api.get('/logs/export/csv', { params });

            // Create blob and download
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentElement.removeChild(link);
        } catch (err) {
            console.error('Export failed:', err);
            setError('Failed to export logs. Please try again.');
        }
    };

    // Export to JSON
    const handleExportJSON = async () => {
        try {
            const params = {
                page: 0,
                size: 1000,
                action: filters.action || undefined,
                startDate: filters.startDate ? new Date(filters.startDate).toISOString() : undefined,
                endDate: filters.endDate ? new Date(filters.endDate).toISOString() : undefined,
            };

            const response = await api.get('/logs/export/json', { params });

            // Create blob and download
            const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.json`);
            document.body.appendChild(link);
            link.click();
            link.parentElement.removeChild(link);
        } catch (err) {
            console.error('Export failed:', err);
            setError('Failed to export logs. Please try again.');
        }
    };

    // Refresh logs
    const handleRefresh = () => {
        fetchLogs(page);
        fetchStats();
    };

    // Format timestamp
    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    // Get action badge color
    const getActionBadgeClass = (action) => {
        const colorMap = {
            'UPLOAD': 'badge-blue',
            'DOWNLOAD': 'badge-green',
            'DELETE': 'badge-red',
            'RENAME': 'badge-yellow',
            'CREATE_FOLDER': 'badge-purple',
            'SHARE_FILE': 'badge-teal',
            'REVOKE_SHARE': 'badge-orange',
        };
        return colorMap[action] || 'badge-gray';
    };

    // Get status badge
    const getStatusBadgeClass = (status) => {
        return status === 'SUCCESS' ? 'badge-success' : 'badge-danger';
    };

    return (
        <div className="audit-page">
            <header className="audit-header">
                <div className="header-content">
                    <h1>Audit Logs</h1>
                    <p>View and manage all system activities and user actions</p>
                </div>
                <div className="header-actions">
                    <button onClick={handleRefresh} className="btn-icon" title="Refresh">
                        <RefreshCw size={18} />
                    </button>
                </div>
            </header>

            {/* Statistics Cards */}
            <section className="stats-section">
                <div className="stats-grid">
                    <StatCard label="Uploads" value={actionStats.UPLOAD} color="blue" />
                    <StatCard label="Downloads" value={actionStats.DOWNLOAD} color="green" />
                    <StatCard label="Deletions" value={actionStats.DELETE} color="red" />
                    <StatCard label="Shares" value={actionStats.SHARE_FILE} color="teal" />
                </div>
            </section>

            {/* Filters */}
            <section className="filters-section">
                <div className="filters-container">
                    <div className="filter-group">
                        <label htmlFor="action">Action</label>
                        <select
                            id="action"
                            name="action"
                            value={filters.action}
                            onChange={handleFilterChange}
                            className="filter-input"
                        >
                            <option value="">All Actions</option>
                            <option value="UPLOAD">Upload</option>
                            <option value="DOWNLOAD">Download</option>
                            <option value="DELETE">Delete</option>
                            <option value="RENAME">Rename</option>
                            <option value="CREATE_FOLDER">Create Folder</option>
                            <option value="SHARE_FILE">Share File</option>
                            <option value="REVOKE_SHARE">Revoke Share</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label htmlFor="startDate">Start Date</label>
                        <input
                            id="startDate"
                            type="date"
                            name="startDate"
                            value={filters.startDate}
                            onChange={handleFilterChange}
                            className="filter-input"
                        />
                    </div>

                    <div className="filter-group">
                        <label htmlFor="endDate">End Date</label>
                        <input
                            id="endDate"
                            type="date"
                            name="endDate"
                            value={filters.endDate}
                            onChange={handleFilterChange}
                            className="filter-input"
                        />
                    </div>

                    <div className="filter-group">
                        <label htmlFor="pageSize">Records per page</label>
                        <select
                            id="pageSize"
                            value={pageSize}
                            onChange={(e) => setPageSize(Number(e.target.value))}
                            className="filter-input"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                    </div>

                    <div className="filter-actions">
                        <button onClick={handleExportCSV} className="btn-export csv">
                            <Download size={16} /> CSV
                        </button>
                        <button onClick={handleExportJSON} className="btn-export json">
                            <Download size={16} /> JSON
                        </button>
                    </div>
                </div>
            </section>

            {/* Error Message */}
            {error && (
                <div className="alert alert-error">
                    {error}
                    <button onClick={() => setError(null)} className="btn-close">×</button>
                </div>
            )}

            {/* Logs Table */}
            <section className="logs-section">
                {loading ? (
                    <div className="loading">
                        <div className="spinner"></div>
                        <p>Loading audit logs...</p>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="empty-state">
                        <p>No audit logs found</p>
                    </div>
                ) : (
                    <>
                        <div className="table-wrapper">
                            <table className="logs-table">
                                <thead>
                                    <tr>
                                        <th>Timestamp</th>
                                        <th>User</th>
                                        <th>Action</th>
                                        <th>File Name</th>
                                        <th>Details</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log) => (
                                        <tr key={log.id} className="log-row">
                                            <td className="timestamp" title={log.timestamp}>
                                                {formatTimestamp(log.timestamp)}
                                            </td>
                                            <td className="user">
                                                <span className="user-name">{log.userName}</span>
                                            </td>
                                            <td className="action">
                                                <span className={`badge ${getActionBadgeClass(log.action)}`}>
                                                    {log.action.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="file-name">
                                                {log.fileName || '-'}
                                            </td>
                                            <td className="details">
                                                {log.details}
                                            </td>
                                            <td className="status">
                                                <span className={`badge ${getStatusBadgeClass(log.status)}`}>
                                                    {log.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="pagination">
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 0}
                                className="btn-pagination"
                            >
                                ← Previous
                            </button>
                            <div className="pagination-info">
                                Page {page + 1} of {totalPages} ({totalElements} total)
                            </div>
                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page === totalPages - 1}
                                className="btn-pagination"
                            >
                                Next →
                            </button>
                        </div>
                    </>
                )}
            </section>
        </div>
    );
};

// Statistics Card Component
const StatCard = ({ label, value, color }) => {
    return (
        <div className={`stat-card stat-${color}`}>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
        </div>
    );
};

export default AuditPage;
