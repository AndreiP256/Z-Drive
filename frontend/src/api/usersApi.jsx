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
    }
};

// export const uploadFile = async (file, parentDirId = null) => {
//     const formData = new FormData();
//     formData.append('file', file);
//     if (parentDirId) {
//         formData.append('parentDirId', parentDirId);
//     }

//     const response = await api.post('/files/upload', formData, {
//         headers: {
//             'Content-Type': 'multipart/form-data',
//         },
//     });
//     return response.data;
// };

// export const downloadFile = async (fileId, fileName) => {
//     const response = await api.get(`/files/download/${fileId}`, {
//         responseType: 'blob',
//     });

//     const url = window.URL.createObjectURL(new Blob([response.data]));
//     const link = document.createElement('a');
//     link.href = url;
//     link.setAttribute('download', fileName);
//     document.body.appendChild(link);
//     link.click();
//     link.remove();
// };