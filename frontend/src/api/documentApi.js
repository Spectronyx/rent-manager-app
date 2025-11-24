import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + '/api/tenants';

// Get token from local storage
const getToken = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.token;
};

// Config with token
const getConfig = () => {
    const token = getToken();
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

// Config for file upload
const getUploadConfig = (onProgress) => {
    const token = getToken();
    return {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            if (onProgress) {
                onProgress(percentCompleted);
            }
        },
    };
};

// Upload document
export const uploadDocument = async (tenantId, formData, onProgress) => {
    const response = await axios.post(
        `${API_URL}/${tenantId}/documents`,
        formData,
        getUploadConfig(onProgress)
    );
    return response.data;
};

// Get documents
export const getDocuments = async (tenantId) => {
    const response = await axios.get(`${API_URL}/${tenantId}/documents`, getConfig());
    return response.data;
};

// Delete document
export const deleteDocument = async (tenantId, documentId) => {
    const response = await axios.delete(
        `${API_URL}/${tenantId}/documents/${documentId}`,
        getConfig()
    );
    return response.data;
};

const documentApi = {
    uploadDocument,
    getDocuments,
    deleteDocument,
};

export default documentApi;