import api from './axios';

/**
 * Get all audit logs with pagination and filtering
 */
export const getLogs = async (page = 0, size = 10, sortBy = 'timestamp', direction = 'DESC') => {
    try {
        const response = await api.get('/logs', {
            params: {
                page,
                size,
                sortBy,
                direction,
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching logs:', error);
        throw error;
    }
};

/**
 * Get logs for a specific user
 */
export const getUserLogs = async (userId, page = 0, size = 10) => {
    try {
        const response = await api.get(`/logs/user/${userId}`, {
            params: { page, size }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching user logs:', error);
        throw error;
    }
};

/**
 * Get logs for a specific file
 */
export const getFileLogs = async (fileId, page = 0, size = 10) => {
    try {
        const response = await api.get(`/logs/file/${fileId}`, {
            params: { page, size }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching file logs:', error);
        throw error;
    }
};

/**
 * Get filtered logs with advanced search criteria
 */
export const getFilteredLogs = async (filters = {}, page = 0, size = 10) => {
    try {
        const params = {
            page,
            size,
            sortBy: 'timestamp',
            direction: 'DESC',
        };

        if (filters.userId) params.userId = filters.userId;
        if (filters.action) params.action = filters.action;
        if (filters.fileId) params.fileId = filters.fileId;
        if (filters.startDate) params.startDate = filters.startDate;
        if (filters.endDate) params.endDate = filters.endDate;

        const response = await api.get('/logs/filter', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching filtered logs:', error);
        throw error;
    }
};

/**
 * Get logs within a specific date range
 */
export const getLogsByDateRange = async (startDate, endDate, page = 0, size = 10) => {
    try {
        const response = await api.get('/logs/filter', {
            params: {
                startDate,
                endDate,
                page,
                size,
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching logs by date range:', error);
        throw error;
    }
};

/**
 * Export logs to CSV format
 */
export const exportLogsToCSV = async (filters = {}) => {
    try {
        const params = {};
        if (filters.userId) params.userId = filters.userId;
        if (filters.action) params.action = filters.action;
        if (filters.fileId) params.fileId = filters.fileId;
        if (filters.startDate) params.startDate = filters.startDate;
        if (filters.endDate) params.endDate = filters.endDate;

        const response = await api.get('/logs/export/csv', {
            params,
            responseType: 'blob',
        });

        // Create blob and download
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.parentElement.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exporting logs to CSV:', error);
        throw error;
    }
};

/**
 * Export logs to JSON format
 */
export const exportLogsToJSON = async (filters = {}, page = 0, size = 1000) => {
    try {
        const params = {
            page,
            size,
        };
        if (filters.userId) params.userId = filters.userId;
        if (filters.action) params.action = filters.action;
        if (filters.fileId) params.fileId = filters.fileId;
        if (filters.startDate) params.startDate = filters.startDate;
        if (filters.endDate) params.endDate = filters.endDate;

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
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exporting logs to JSON:', error);
        throw error;
    }
};

/**
 * Get statistics for a specific action type
 */
export const getActionStats = async (action) => {
    try {
        const response = await api.get(`/logs/stats/action/${action}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching stats for action ${action}:`, error);
        return 0;
    }
};

/**
 * Get health status of logging service
 */
export const getLogsHealth = async () => {
    try {
        const response = await api.get('/logs/health');
        return response.data;
    } catch (error) {
        console.error('Error checking logs health:', error);
        throw error;
    }
};
