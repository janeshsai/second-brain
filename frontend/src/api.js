import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// BEFORE every request → attach the access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// AFTER every response → if 401, try to refresh the token automatically
api.interceptors.response.use(
  // If response is fine, just return it as-is
  (response) => response,

  // If response has an error...
  async (error) => {
    const original = error.config;

    // Only try refresh if: it's a 401 AND we haven't already retried this request
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true; // mark so we don't infinite loop

      try {
        const refresh = localStorage.getItem('refresh');
        if (!refresh) throw new Error('No refresh token');

        // Ask Django for a new access token using the refresh token
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/token/refresh/`,
          { refresh }
        );

        // Store the new access token
        const newAccess = res.data.access;
        localStorage.setItem('access', newAccess);

        // Retry the original failed request with the new token
        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);

      } catch (refreshError) {
        // Refresh token also expired → force logout
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;