import api from './axios';

export const shareFile = async ({ fileId, targetUserId, accessLevel }) => {
    const response = await api.post('/sharing', {
        fileId,
        targetUserId,
        accessLevel,
    });
    return response.data;
};

export const revokeShare = async ({ fileId, targetUserId }) => {
    const response = await api.delete('/sharing', {
        data: {
            fileId,
            targetUserId,
        },
    });
    return response.data;
};

export const getShareLink = async (fileId, targetUserId) => {
    const response = await api.get('/sharing/link', {
        params: {
            fileId,
            targetUserId,
        },
    });
    return response.data;
};
