<template>
  <main class="activation-container">
    <div class="activation-card">
      <h1 v-if="!cuentaActivada">Crea tu Contraseña</h1>
      <h1 v-else>¡Cuenta Activada!</h1>

      <p v-if="!cuentaActivada">
        Estás a un paso de activar tu cuenta. Elige una contraseña segura.
      </p>
      <p v-else>Tu contraseña ha sido creada exitosamente. Ahora puedes iniciar sesión.</p>

      <form @submit.prevent="activarCuenta">
        <div class="form-group">
          <label for="password">Nueva Contraseña</label>
          <input
            type="password"
            id="password"
            v-model="password"
            :disabled="cuentaActivada"
            required
          />
        </div>

        <div class="form-group">
          <label for="password-confirm">Confirmar Contraseña</label>
          <input
            type="password"
            id="password-confirm"
            v-model="passwordConfirm"
            :disabled="cuentaActivada"
            required
          />
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <button v-if="!cuentaActivada" type="submit" class="submit-btn">Activar cuenta...</button>
        <button v-else type="button" @click="irAlLogin" class="submit-btn success-btn">
          Iniciar sesión
        </button>
      </form>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router' // 1. Importar useRouter
import apiService from '@/services/apiService'
import Swal from 'sweetalert2'

// --- Estado Reactivo ---
const password = ref('')
const passwordConfirm = ref('')
const errorMessage = ref('')
const activationToken = ref('')
const cuentaActivada = ref(false) // 2. Nuevo estado para controlar la UI

const route = useRoute()
const router = useRouter() // 3. Instancia del router para navegar
activationToken.value = route.params.slug

// --- Lógica de la Función ---
const activarCuenta = async () => {
  if (cuentaActivada.value) return // Si ya está activada, no hacer nada

  errorMessage.value = ''
  if (!password.value || !passwordConfirm.value) {
    errorMessage.value = 'Ambos campos son obligatorios.'
    return
  }
  if (password.value !== passwordConfirm.value) {
    errorMessage.value = 'Las contraseñas no coinciden.'
    return
  }

  try {
    const response = await apiService.post('/api/v1/identity/usuarios/activate-account/', {
      slug: activationToken.value,
      password: password.value,
    })

    // 4. En caso de éxito, mostrar alerta y cambiar el estado
    Swal.fire({
      icon: 'success',
      title: '¡Éxito!',
      text: response.data.message,
    })
    cuentaActivada.value = true
  } catch (error) {
    errorMessage.value = error.response?.data?.detail || 'Ocurrió un error inesperado.'
  }
}

// 5. Nueva función para navegar al login
const irAlLogin = () => {
  router.push({ name: 'login' })
}
</script>

<style lang="sass" scoped>
// Estilos para centrar el contenido en toda la página
.activation-container
  display: flex
  justify-content: center
  align-items: center
  min-height: 100vh
  padding: 20px

// La tarjeta central
.activation-card
  background-color: white
  padding: 40px
  border-radius: 12px
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08)
  width: 100%
  max-width: 400px
  text-align: center
  box-sizing: border-box

  h1
    margin-top: 0
    font-size: 26px
    font-weight: 600
    color: #333

  p
    color: #666
    margin-bottom: 30px
    line-height: 1.5

// Grupos de formulario
.form-group
  margin-bottom: 20px
  text-align: left

  label
    display: block
    margin-bottom: 8px
    font-weight: 500
    font-size: 14px

  input
    width: 100%
    padding: 12px
    border: 1px solid #ddd
    border-radius: 8px
    box-sizing: border-box
    font-size: 16px
    transition: border-color 0.3s, background-color 0.3s

    &:focus
      outline: none
      border-color: #007bff

    // 6. Estilo para los inputs deshabilitados
    &:disabled
      background-color: #f0f0f0
      cursor: not-allowed
      color: #888

// Mensaje de error
.error-message
  color: #d93025
  font-size: 14px
  text-align: left
  min-height: 20px
  margin-bottom: 15px

// Botón de envío
.submit-btn
  width: 100%
  padding: 14px
  border: none
  border-radius: 8px
  background-color: #007bff
  color: white
  font-size: 16px
  font-weight: 600
  cursor: pointer
  transition: background-color 0.3s

  &:hover
    background-color: #0056b3

  // 7. Nuevo estilo para el botón de éxito
  &.success-btn
    background-color: #28a745
    &:hover
      background-color: #218838

// --- Adaptable a Móviles (Responsive) ---
@media (max-width: 480px)
  .activation-card
    padding: 25px
</style>
