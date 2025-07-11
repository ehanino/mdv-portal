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
      <div v-show="activeTab === 1" class="tab-panel">
        <BaseValidaDni
          ref="baseValidaDniRef"
          :hideUbigeo="true"
          :hideEstadoCivil="true"
          :hideButtonValidaDni="true"
          :readOnlyDni="true"
          :showIsActiveCheckbox="true"
          @image-upload="handleImageFile"
        />
        <hr class="linea-horizontal" />
        <div class="modal-actions">
          <button class="btn-grabar" @click="handleUpdateUser">Guardar Cambios</button>
        </div>
      </div>

      <div v-show="activeTab === 2" class="tab-panel">
        <!-- Contenido para Roles y Perfiles -->
        <BaseUserGroups v-if="props.usuarioId" :user-id="props.usuarioId" />
      </div>
    </div>
  </div>
</template>

<script setup>
// ========================
// IMPORTS
// ========================
import { ref, watch } from 'vue'

// Components
import BaseValidaDni from '@/components/base/BaseValidaDni.vue'
import BaseUserGroups from '@/components/base/BaseUserGroups.vue'

// Services & Utilities
import apiService from '@/services/apiService'
import { extractErrorMessage } from '@/common/utilities.js'
import { showMessageDialog } from '@/common/messageUtils.js'

// ========================
// PROPS & EMITS
// ========================
const props = defineProps({
  usuarioId: {
    type: [String, Number],
    required: true,
  },
})

const emit = defineEmits(['close-modal'])

// ========================
// REACTIVE VARIABLES
// ========================
const baseValidaDniRef = ref(null)
const imageFile = ref(null)
const activeTab = ref(1)

// ========================
// TAB MANAGEMENT
// ========================
const selectTab = (tabNumber) => {
  activeTab.value = tabNumber
}

// ========================
// DATA & FORM HANDLING
// ========================
const handleImageFile = (file) => {
  imageFile.value = file
}

const handleUpdateUser = async () => {
  if (!baseValidaDniRef.value) return

  try {
    const userData = baseValidaDniRef.value.estadoPersona
    const formData = new FormData()

    Object.keys(userData).forEach((key) => {
      // Exclude DNI from the form data on updates
      // Also exclude photo_url if a new image file is selected
      if (
        key !== 'dni' &&
        !(key === 'photo_url' && imageFile.value) &&
        userData[key] !== null &&
        userData[key] !== undefined
      ) {
        formData.append(key, userData[key])
      }
    })

    if (imageFile.value) {
      formData.append('image', imageFile.value)
    }

    // Use PATCH for partial updates, excluding DNI
    await apiService.patch(`/api/v1/identity/usuarios/${props.usuarioId}/`, formData)

    showMessageDialog('Éxito', 'Usuario actualizado correctamente.')
    emit('close-modal', { updated: true })
  } catch (error) {
    handleError(error)
  }
}

// ========================
// ERROR HANDLING
// ========================
const handleError = (error) => {
  const errorMessage = extractErrorMessage(error.response?.data || error.message)
  showMessageDialog('Error', errorMessage)
}

// ========================
// WATCHERS
// ========================
watch(
  () => props.usuarioId,
  async (newId) => {
    imageFile.value = null // Reset image on user change
    if (newId) {
      try {
        const response = await apiService.get(`/api/v1/identity/usuarios/${newId}/`)

        if (baseValidaDniRef.value) {
          baseValidaDniRef.value.loadValidatedData(response.data)
        }
      } catch (error) {
        handleError(error)
      }
    } else {
      if (baseValidaDniRef.value) {
        baseValidaDniRef.value.resetFormulario()
      }
    }
  },
  { immediate: true },
)
</script>

<style lang="sass" scoped>

.linea-horizontal
  width: 100%
  border: 0
  border-top: 1px solid #000
  margin: 0
.modal-actions
  display: flex
  justify-content: flex-end
  padding: 1rem 1.5rem
  background-color: #f8fafc
  border-top: 1px solid #e5e7eb

// .btn-grabar
//   padding: 0.5rem 1.5rem
//   border: none
//   border-radius: 6px
//   color: white
//   font-weight: bold
//   cursor: pointer
//   background-color: #42b3d4
//   &:hover
//     background-color: #369cb8
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
