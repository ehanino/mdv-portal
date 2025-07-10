// src/stores/auth.js

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import apiService from '@/services/apiService' // Importamos nuestro servicio
import { decodeJwt } from '@/common/jwtUtils' // Tu helper para decodificar

export const useAuthStore = defineStore('auth', () => {
  // --- STATE ---
  const accessToken = ref(localStorage.getItem('accessToken'))
  const refreshToken = ref(localStorage.getItem('refreshToken'))
  const user = ref(JSON.parse(localStorage.getItem('user')) || null)
  const router = useRouter()

  // --- GETTERS ---
  const isAuthenticated = computed(() => !!accessToken.value)
  const accessMap = computed(() => user.value?.accessMap || {})
  const fullName = computed(() => user.value?.fullName || 'Invitado')

  // --- ACTIONS ---
  function _setUserDataFromToken(token) {
    if (!token) return
    try {
      const payload = decodeJwt(token)
      user.value = {
        slug: payload.user_id,
        fullName: payload.full_name,
        imageUrl: payload.image_url,
        roles: payload.roles,
        accessMap: payload.access_map,
      }
      localStorage.setItem('user', JSON.stringify(user.value))
    } catch (e) {
      console.error('Error decodificando token, cerrando sesión.', e)
      logout()
    }
  }

  function _clearSession() {
    accessToken.value = null
    refreshToken.value = null
    user.value = null
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  }

  async function login(credentials) {
    try {
      const response = await apiService.post('/api/v1/identity/token/', credentials)
      accessToken.value = response.data.access
      refreshToken.value = response.data.refresh
      localStorage.setItem('accessToken', accessToken.value)
      localStorage.setItem('refreshToken', refreshToken.value)

      _setUserDataFromToken(accessToken.value)

      // --- LÓGICA PARA CALCULAR LA PRIMERA URL ---
      let redirectUrl = '/' // URL por defecto si el usuario no tiene menús asignados

      const accessMap = user.value?.accessMap
      if (accessMap && Object.keys(accessMap).length > 0) {
        // Obtenemos la clave de la primera aplicación en el mapa (ej. 'administrados')
        const firstAppKey = Object.keys(accessMap)[0]
        const firstApp = accessMap[firstAppKey]

        // Verificamos si esa aplicación tiene menús
        if (firstApp.menus && firstApp.menus.length > 0) {
          // Obtenemos la URL del primer menú de la lista
          redirectUrl = firstApp.menus[0].url
        }
      }

      // --- CAMBIO CLAVE: RETORNAMOS LA URL ---
      // En lugar de hacer router.push, devolvemos la ruta calculada.
      return redirectUrl

      // await router.push('/') // Redirección al éxito
    } catch (error) {
      _clearSession()
      console.error('Error en login action:', error)
      // Relanzamos el error para que el componente de login lo muestre
      throw error.response?.data || { detail: 'Error de conexión o credenciales inválidas.' }
    }
  }

  function logout() {
    _clearSession()
    router.push('/login')
  }

  async function refreshAccessToken() {
    try {
      const response = await apiService.post('/api/v1/identity/token/refresh/', {
        refresh: refreshToken.value,
      })
      accessToken.value = response.data.access
      localStorage.setItem('accessToken', accessToken.value)
      _setUserDataFromToken(accessToken.value)
      return accessToken.value
    } catch (error) {
      console.error('No se pudo refrescar el token.', error)
      logout()
      throw error
    }
  }

  // Exponemos todo para que los componentes lo usen
  return {
    user,
    isAuthenticated,
    fullName,
    accessMap,
    login,
    logout,
    refreshAccessToken,
    accessToken,
  }
})
