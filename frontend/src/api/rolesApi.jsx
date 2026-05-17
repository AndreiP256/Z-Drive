import api from './axios';

export const createFileRole = async (roleData) => {
    try {
        const response = await api.post('/roles', roleData);
        return response.data;
    } catch (error) {
        console.error('Error creating role:', error);
        throw error;
    }
};

export const getFileRole = async (roleId) => {
    try {
        const response = await api.get(`/roles/${roleId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching role:', error);
        throw error;
    }
};

export const updateFileRole = async (roleId, roleData) => {
    try {
        const response = await api.put(`/roles/${roleId}`, roleData);
        return response.data;
    } catch (error) {
        console.error('Error updating role:', error);
        throw error;
    }
};

export const deleteFileRole = async (roleId) => {
    try {
        await api.delete(`/roles/${roleId}`);
        return true;
    } catch (error) {
        console.error('Error deleting role:', error);
        throw error;
    }
};

export const getRoleFiles = async (roleId) => {
    try {
        const response = await api.get(`/roles/${roleId}/files`);
        return response.data;
    } catch (error) {
        console.error('Error fetching role files:', error);
        throw error;
    }
};

export const assignRoleToUser = async (data) => {
    try {
        const response = await api.post('/roles/assign', data);
        return response.data;
    } catch (error) {
        console.error('Error assigning role:', error);
        throw error;
    }
};

export const revokeRoleFromUser = async (data) => {
    try {
        const response = await api.delete('/roles/revoke', { data });
        return response.data;
    } catch (error) {
        console.error('Error revoking role:', error);
        throw error;
    }
};

export const getRolesForUser = async (userId) => {
    try {
        const response = await api.get(`/roles/users/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching roles for user:', error);
        throw error;
    }
};

export const getEffectivePermissions = async (data) => {
    try {
        const response = await api.request({
            url: '/roles/permissions',
            method: 'GET',
            data,
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching effective permissions:', error);
        throw error;
    }
};