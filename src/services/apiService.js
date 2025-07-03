// src/services/apiService.js

import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const apiService = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // Lee la URL desde tu archivo .env
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// --- Interceptor para AÑADIR el token a cada petición ---
apiService.interceptors.request.use(
  (config) => {
    // Leemos el token directamente desde localStorage para evitar dependencias circulares
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// --- Interceptor para MANEJAR la expiración de tokens (errores 401) ---
apiService.interceptors.response.use(
  (response) => response, // Si la respuesta es exitosa, no hacemos nada.
  async (error) => {
    const originalRequest = error.config

    // Si el error es un 401 y no hemos reintentado ya esta petición
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const authStore = useAuthStore()

      try {
        // Intentamos refrescar el token
        const newAccessToken = await authStore.refreshAccessToken()
        // Actualizamos la cabecera de la petición original con el nuevo token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        // Reintentamos la petición original que había fallado
        return apiService(originalRequest)
      } catch (refreshError) {
        // Si el refresco falla, el store se encargará de hacer logout.
        // Propagamos el error.
        return Promise.reject(refreshError)
      }
    }

    // Para cualquier otro error, simplemente lo propagamos.
    return Promise.reject(error)
  },
)

export default apiService
