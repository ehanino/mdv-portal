<template>
  <div class="form-container">
    <div class="tabs-nav">
      <button @click="selectTab(1)" :class="{ active: activeTab === 1 }">
        <span class="tab-icon">👤</span>
        Datos de Usuario
      </button>
      <button @click="selectTab(2)" :class="{ active: activeTab === 2 }">
        <span class="tab-icon">🛡️</span>
        Roles y Perfiles
      </button>
    </div>

    <div class="tabs-content" ref="contentContainer">
      <!-- Contenedor para el contenido de las pestañas -->
      <div v-if="activeTab === 1" class="tab-panel">
        <BaseValidaDni
          ref="baseValidaDniRef"
          :hideUbigeo="true"
          :hideEstadoCivil="true"
          :hideButtonValidaDni="true"
          @save-data="handleSaveData"
          @image-upload="handleImageFile"
        />
      </div>

      <div v-if="activeTab === 2" class="tab-panel">
        <!-- Contenido para Roles y Perfiles -->
        <div class="placeholder-content">
          <h3>Gestión de Roles y Perfiles</h3>
          <p>Aquí irá la gestión de roles y perfiles del usuario.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// ========================
// IMPORTS
// ========================
import { ref, computed, toRefs, watch } from 'vue'

// Components
import BaseValidaDni from '@/components/base/BaseValidaDni.vue'

// Services & Utilities
import { extractErrorMessage } from '@/common/utilities.js'
import { showMessageDialog } from '@/common/messageUtils.js'

// Stores
import { useAuthStore } from '@/stores/auth.js'

// ========================
// PROPS & EMITS
// ========================
const props = defineProps({
  usuarioId: {
    type: [String, Number],
    required: true,
  },
})
console.log('ID recibido en el modal:', props.usuarioId)
const emit = defineEmits(['close-modal'])

// ========================
// STORE MANAGEMENT
// ========================
const authStore = useAuthStore()
const { accessToken } = toRefs(authStore)
const jwt = accessToken.value

// ========================
// REACTIVE VARIABLES
// ========================
// Form references
const baseValidaDniRef = ref(null)

// Form data
const userEmail = ref('')
const userCelular = ref('')

// Tab management
const activeTab = ref(1)

// ========================
// COMPUTED PROPERTIES
// ========================
const isUpdatingUser = computed(() => !!props.userToEdit?.id)

// ========================
// TAB MANAGEMENT FUNCTIONS
// ========================
const selectTab = (tabNumber) => {
  activeTab.value = tabNumber
}

// ========================
// FORM HANDLING FUNCTIONS
// ========================
const clearForm = () => {
  if (baseValidaDniRef.value) {
    baseValidaDniRef.value.persId = ''
    baseValidaDniRef.value.persDni = ''
    baseValidaDniRef.value.persApellidoPaterno = ''
    baseValidaDniRef.value.persApellidoMaterno = ''
    baseValidaDniRef.value.persNombres = ''
    baseValidaDniRef.value.persEstadoCivil = ''
    baseValidaDniRef.value.persUbigeo = ''
    baseValidaDniRef.value.persRestriccion = ''
    baseValidaDniRef.value.persDireccion = ''
    baseValidaDniRef.value.persPhotoUrl = ''
    baseValidaDniRef.value.imagePreview = null
    baseValidaDniRef.value.user_username = ''
    baseValidaDniRef.value.user_is_active = false
  }
  userEmail.value = ''
  userCelular.value = ''
}

const buildFormData = () => {
  const formData = new FormData()

  formData.append('ape_paterno', baseValidaDniRef.value.persApellidoPaterno)
  formData.append('ape_materno', baseValidaDniRef.value.persApellidoMaterno)
  formData.append('nombres', baseValidaDniRef.value.persNombres)
  formData.append('dni', baseValidaDniRef.value.persDni)
  formData.append('estado_civil', baseValidaDniRef.value.persEstadoCivil)
  formData.append('ubigeo', baseValidaDniRef.value.persUbigeo)
  formData.append('restriccion', baseValidaDniRef.value.persRestriccion)
  formData.append('direccion', baseValidaDniRef.value.persDireccion)
  formData.append('email', userEmail.value)
  formData.append('celular', userCelular.value)
  formData.append('username', baseValidaDniRef.value.user_username)
  formData.append('is_active', baseValidaDniRef.value.user_is_active)

  if (baseValidaDniRef.value.user_photo_url instanceof File) {
    formData.append(
      'image',
      baseValidaDniRef.value.pers_photo_url,
      baseValidaDniRef.value.pers_photo_url.name,
    )
  }

  return formData
}

// ========================
// ERROR HANDLING FUNCTIONS
// ========================
const handleError = (error) => {
  const errorMessage = extractErrorMessage(error.response?.data || error.message)
  showMessageDialog(errorMessage)
}

// ========================
// SUBMIT FUNCTIONS
// ========================
const submitForm = async () => {
  try {
    const formData = buildFormData()
    if (isUpdatingUser.value) {
      await actualizarDatosUsuario(formData, props.userToEdit.id, jwt)
      emit('close-modal')
    } else {
      await grabarDatosUsuario(formData, jwt)
      emit('close-modal')
    }
  } catch (error) {
    handleError(error)
  }
}

// ========================
// WATCHERS
// ========================
watch(
  () => props.userToEdit,
  (newUser) => {
    if (newUser) {
      // Precargar datos del usuario para edición
      if (baseValidaDniRef.value) {
        baseValidaDniRef.value.loadValidatedData({
          persDni: newUser.dni,
          persApellidoPaterno: newUser.ape_paterno,
          persApellidoMaterno: newUser.ape_materno,
          persNombres: newUser.nombres,
          persEstadoCivil: newUser.estado_civil,
          persUbigeo: newUser.ubigeo,
          persRestriccion: newUser.restriccion,
          persDireccion: newUser.direccion,
          persPhotoUrl: newUser.image_url,
          user_username: newUser.username,
          user_is_active: newUser.is_active,
        })
      }
      userEmail.value = newUser.email || ''
      userCelular.value = newUser.celular || ''
    } else {
      // Limpiar formulario para creación
      clearForm()
    }
  },
  { immediate: true },
)

// ========================
// COMMENTED CODE (for reference)
// ========================
/*
// User details and error handling - commented out for now
const isReadonly = ref(true)
const userDetails = ref(null)
const error = ref(null)

const fetchUserDetails = async (dni) => {
  try {
    const response = await apiUsuarioDetail(dni, jwt)
    userEmail.value = response['email'] || ''
    userCelular.value = response['celular'] || ''
    userDetails.value = response
    error.value = null // Limpiar errores si la solicitud es exitosa
  } catch (err) {
    error.value = err.response?.data?.detail || 'Error desconocido'
    userDetails.value = null // Limpiar detalles si hay un error
  }
}

// Additional imports that might be needed later
import BaseInputData from '@/components/base/BaseInputData.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { grabarDatosUsuario, actualizarDatosUsuario, apiUsuarioDetail } from '@/views/usuarios/services/usuarioServices.js'
*/
</script>

<style lang="sass" scoped>
.form-container
  background-color: #ffffff
  display: flex
  flex-direction: column
  border: 1px solid #e5e7eb
  border-radius: 12px
  margin: 0 auto
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)
  overflow: hidden

.tabs-nav
  display: flex
  background-color: #f8fafc
  border-bottom: 1px solid #e5e7eb
  padding: 0
  position: relative

  &::after
    content: ''
    position: absolute
    bottom: 0
    left: 0
    right: 0
    height: 1px
    background-color: #e5e7eb

.tabs-nav button
  flex: 1
  padding: 1rem 1.5rem
  border: none
  background-color: transparent
  cursor: pointer
  font-size: 0.95rem
  font-weight: 500
  color: #6b7280
  display: flex
  align-items: center
  justify-content: center
  gap: 0.5rem
  position: relative
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
  border-bottom: 3px solid transparent

  &:hover
    color: #3b82f6
    background-color: #f1f5f9
    transform: translateY(-1px)

  &.active
    color: #3b82f6
    background-color: #ffffff
    border-bottom-color: #3b82f6
    font-weight: 600

    // &::before
    //   content: ''
    //   position: absolute
    //   top: 0
    //   left: 0
    //   right: 0
    //   height: 3px
    //   background: linear-gradient(90deg, #3b82f6, #1d4ed8)
    //   border-radius: 0 0 2px 2px

.tab-icon
  font-size: 1.1rem
  opacity: 0.8
  transition: opacity 0.3s ease

  .active &
    opacity: 1

.tabs-content
  padding: 0
  background-color: #ffffff
  min-height: 400px
  position: relative

.tab-panel
  // padding: 2rem
  animation: fadeInUp 0.4s ease-out

.placeholder-content
  text-align: center
  padding: 3rem 1rem
  color: #6b7280

  h3
    font-size: 1.5rem
    font-weight: 600
    color: #374151
    margin-bottom: 1rem

  p
    font-size: 1rem
    line-height: 1.6

// Animaciones
@keyframes fadeInUp
  from
    opacity: 0
    transform: translateY(10px)
  to
    opacity: 1
    transform: translateY(0)

// Responsive design
@media (max-width: 768px)
  .tabs-nav button
    padding: 0.75rem 1rem
    font-size: 0.9rem
    flex-direction: column
    gap: 0.25rem

  .tab-icon
    font-size: 1rem

  .tab-panel
    padding: 1.5rem

// Variables CSS para consistencia
:root
  --primary-color: #3b82f6
  --primary-hover: #2563eb
  --background-light: #f8fafc
  --border-color: #e5e7eb
  --text-primary: #374151
  --text-secondary: #6b7280
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)
</style>
