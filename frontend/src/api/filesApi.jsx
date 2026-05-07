import api from './axios';

export const getMyFiles = async () => {
    try {
        const response = await api.get('/files/myFiles');
        const files = response.data;

        console.log(files)
        return files;
    } catch (error) {
        console.error("Error loading files:", error);
    }
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
};