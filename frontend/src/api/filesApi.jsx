import api from './axios';

export const getMyFiles = async () => {
    const response = await api.get('/files/myFiles');
    return response.data;
};

export const getAccessibleFiles = async () => {
    const response = await api.get('/files/accessible');
    return response.data;
};

export const uploadFile = async (file, parentDirId = null) => {
    const formData = new FormData();
    formData.append('file', file);
    if (parentDirId) {
        formData.append('parentDirId', parentDirId);
    }

    const response = await api.post('/files/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const downloadFile = async (fileId, fileName) => {
    const response = await api.get(`/files/download/${fileId}`, {
        responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};

export const deleteFile = async (fileId) => {
    const response = await api.delete(`/files/delete/${fileId}`);
    return response.data;
};

export const uploadProfilePicture = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/files/profile-picture', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const getProfilePictureUrl = async () => {
    const response = await api.get('/files/profile-picture', {
        responseType: 'blob',
    });

    const contentType = response.headers?.['content-type'] || 'image/*';
    const blob = new Blob([response.data], { type: contentType });
    return window.URL.createObjectURL(blob);
};
