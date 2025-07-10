<template>
  <div class="form-container">
    <div class="tabs">
      <button :class="{ active: currentTab === 'userData' }" @click="currentTab = 'userData'">
        Datos de Usuario
      </button>
      <button
        :class="{ active: currentTab === 'rolesAndProfiles' }"
        @click="currentTab = 'rolesAndProfiles'"
      >
        Roles y Perfiles
      </button>
    </div>

    <div v-if="currentTab === 'userData'" class="tab-content">
      <BaseValidaDni ref="baseValidaDniRef" />
      <div class="div-dat">
        <div class="div-int">
          <div>
            <BaseInputData
              type="text"
              v-model="userEmail"
              name="user-email"
              inputId="user-email"
              labelValue="Correo Electrónico"
              style="width: 355px !important"
            />
          </div>

          <div>
            <BaseInputData
              type="text"
              v-model="userCelular"
              name="user-celular"
              inputId="user-celular"
              labelValue="Celular"
              style="width: 200px !important"
            />
          </div>
        </div>
        <div style="margin-top: 10px">
          <BaseButton class="button button-secundary" type="button" @click="clearForm()"
            >Nuevo</BaseButton
          >
          <BaseButton class="button button-primary" type="button" @click="submitForm"
            >Grabar
          </BaseButton>
        </div>
      </div>
    </div>
    <div v-if="currentTab === 'rolesAndProfiles'" class="tab-content">
      <!-- Contenido para Roles y Perfiles -->
      <p>Aquí irá la gestión de roles y perfiles del usuario.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, toRefs, watch, onMounted } from 'vue'
import { extractErrorMessage } from '@/common/utilities.js'
// import { useAuthStore } from '@/stores/auth/authStore'
import { useAuthStore } from '@/stores/auth.js'
// import { grabarDatosUsuario, actualizarDatosUsuario, apiUsuarioDetail } from '@/views/usuarios/services/usuarioServices.js'

import BaseValidaDni from '@/components/base/BaseValidaDni.vue'
import BaseInputData from '@/components/base/BaseInputData.vue'
import BaseButton from '@/components/base/BaseButton.vue'

// Props y Emits
const props = defineProps({
  userToEdit: {
    type: Object,
    default: null,
  },
})
const emit = defineEmits(['close-modal'])

// Store
const authStore = useAuthStore()
const { accessToken, userId } = toRefs(authStore)
const jwt = accessToken.value

// Refs
const baseValidaDniRef = ref(null)
const userEmail = ref('')
const userCelular = ref('')
const isReadonly = ref(true)
const userDetails = ref(null)
const error = ref(null)

const currentTab = ref('userData') // 'userData' o 'rolesAndProfiles'

// const fetchUserDetails = async (dni) => {
//   try {
//     const response = await apiUsuarioDetail(dni, jwt)
//     userEmail.value = response['email'] || ''
//     userCelular.value = response['celular'] || ''
//     userDetails.value = response
//     error.value = null // Limpiar errores si la solicitud es exitosa
//   } catch (err) {
//     error.value = err.response?.data?.detail || 'Error desconocido'
//     userDetails.value = null // Limpiar detalles si hay un error
//   }
// }

// Métodos
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

// Computed
const isUpdatingUser = computed(() => !!props.userToEdit?.id)

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

const handleError = (error) => {
  const errorMessage = extractErrorMessage(error.response?.data || error.message)
  // alert(errorMessage)
}

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
</script>

<style lang="sass" scoped>
.form-container
	// background-color: yellow
	display: flex
	padding: 20px
	//border: 1px solid #ccc
	//border-radius: 8px
	width: 97%
	max-width: 600px
	margin: 0 auto
	flex-wrap: wrap
.div-dat
	// border: 1px solid red
	width: 100%
	display: flex
	flex-direction: column
	align-items: flex-end
	justify-content: flex-end
.div-int
	width: 100%
	display: flex

.tabs
	display: flex
	margin-bottom: 20px


.tabs button
	padding: 10px 15px
	border: none
	background-color: #f0f0f0
	cursor: pointer
	font-size: 16px
	border-bottom: 2px solid transparent


.tabs button.active
	background-color: #e0e0e0
	border-bottom: 2px solid #007bff
	color: #007bff


.tab-content
	width: 100%
</style>
