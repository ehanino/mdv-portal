<template>
  <LoginForm
    title="SIGEM"
    subtitle="Municipalidad Distrital de Ventanilla"
    redirectPath="redirectPath"
    :loginHandler="loginHandler"
    :validateEmail="validateEmail"
    :validatePassword="validatePassword"
    :globalErrorMessage="serverError"
  />
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import LoginForm from '@/components/base/Component-LoginForm.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { extractErrorMessage } from '@/common/utilities' // Asumo que aquí tienes tu helper

// Este estado es para los errores que vienen del servidor/API
const serverError = ref('')

const authStore = useAuthStore()
const router = useRouter()

// --- NUEVO Y SIMPLIFICADO loginHandler ---
const loginHandler = async (credentials) => {
  serverError.value = ''
  try {
    // 1. Llamamos a la acción del store y guardamos la URL que nos devuelve
    const redirectUrl = await authStore.login(credentials)

    // 2. Usamos el router del componente para navegar a esa URL
    // Usamos replace: true para que el usuario no pueda volver a la página de login con el botón "atrás" del navegador.
    await router.replace(redirectUrl || '/')
  } catch (error) {
    serverError.value = extractErrorMessage(error)
  }
}

// Las funciones de validación que pasas como props se mantienen igual. ¡Están perfectas!
function validateEmail(email) {
  if (!email) return 'El email es requerido'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Por favor, ingresa un email válido'
  }
  return ''
}

function validatePassword(password) {
  if (!password) return 'La contraseña es requerida'
  if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres'
  return ''
}
</script>

<style lang="sass"></style>
