// Axios HTTP client instance configured with interceptors for headers/JWT refresh.
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

export default api;
