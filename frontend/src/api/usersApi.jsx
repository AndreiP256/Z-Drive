import api from './axios';

export const getUsers = async () => {
    try {
        const response = await api.get('/users');
        const users = response.data;

        console.log(users)
        return users;
    } catch (error) {
        console.error("Error loading users:", error);
    }
};

export const deleteUser = async (userId) => {
    try {
        const response = await api.delete(`/users/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting user:", error);
    }
};

export const createUser = async (userData) => {
    try {
        const response = await api.post('/users', {
            name: userData.name,
            email: userData.email,
            password: userData.password,
            role: userData.role
        });
        return response.data;
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
};

export const updateUser = async (userId, userData) => {
    try {
        const response = await api.put(`/users/${userId}`, {
            name: userData.name,
            email: userData.email,
            password: userData.password,
            role: userData.role
        });
        return response.data;
    } catch (error) {
        console.error("Error updating user:", error);
        throw error;
    }
}

export const changePassword = async (newPassword) => {
    try {
        await api.patch('/users/password', newPassword, {
            headers: {
                'Content-Type': 'text/plain',
            },
        });
    } catch (error) {
        console.error("Error changing password:", error);
        throw error;
    }
};