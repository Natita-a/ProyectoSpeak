import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
});

// Agrega access token a cada petición
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Refresca el token expirado en la sesion
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Refrescar token
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === 'token_not_valid' &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {

        return Promise.reject(error);
      }

      try {
        const res = await axios.post('http://localhost:8000/api/token/refresh/', {
          refresh: refreshToken,
        });

        const newAccessToken = res.data.access;
        localStorage.setItem('access_token', newAccessToken);


        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (err) {

        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
