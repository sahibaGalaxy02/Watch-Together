import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
});

export const createRoom = async (nickname) => {
  const { data } = await api.post('/api/rooms/create', { nickname });
  return data;
};

export const getRoom = async (roomId) => {
  const { data } = await api.get(`/api/rooms/${roomId}`);
  return data;
};

export const uploadVideo = async (roomId, file, onProgress) => {
  const formData = new FormData();
  formData.append('video', file);
  const { data } = await api.post(`/api/rooms/${roomId}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
    },
  });
  return data;
};

export default api;
