<!-- src/components/base/BaseValidaDni.vue -->

<template>
  <div style="margin: auto auto; margin-top: 10px">
    <div class="form-container" style="padding: 5px">
      <div class="profile-section user-photo">
        <input :id="uniqueId" type="file" @change="handleImageUpload" accept="image/*" hidden />
        <img
          :src="
            imagePreview ||
            (estadoPersona.photo_url ? `${getFullImageUrl(estadoPersona.photo_url)}?t=${imageTimestamp}` : iconUsersPath)
          "
          alt="Vista previa de la imagen"
          class="avatar"
          title="CRUD User"
        />
        <label :for="uniqueId" class="label-img" :hidden="props.hideSeleccionarImagen"
          >Selecciona imagen</label
        >
      </div>
      <div class="form-section">
        <div class="row row-double">
          <div class="search-container">
            <BaseInputData
              type="text"
              v-model="estadoPersona.dni"
              name="estadoPersona-dni"
              inputId="estadoPersona-dni"
              labelValue="DNI"
              :style="{ width: props.hideButtonValidaDni ? '312px' : '180px' }"
              :readonly="props.readOnlyDni"
              @keydown="forceNumeric"
              @blur="validateDniLength"
            />
          </div>
          <div class="row-buttons" v-if="!props.hideButtonValidaDni" style="padding-right: 4px">
            <button class="btn-nuevo" @click="validaDni">Valida</button>
          </div>
          <BaseInputData
            type="text"
            v-model="estadoPersona.restriccion"
            name="estadoPersona-restriccion"
            inputId="estadoPersona-restriccion"
            labelValue="Restricción"
            :readonly="isReadonly"
            style="width: 310px"
            tabindex="-1"
          />
        </div>
        <div class="row row-double">
          <BaseInputData
            type="text"
            v-model="estadoPersona.apellido_paterno"
            name="estadoPersona-apellido-paterno"
            inputId="estadoPersona-apellido-paterno"
            labelValue="Apellido Paterno"
            @keydown="forceAlphabetic"
          />
          <BaseInputData
            type="text"
            v-model="estadoPersona.apellido_materno"
            name="estadoPersona-apellido-materno"
            inputId="estadoPersona-apellido-materno"
            labelValue="Apellido Materno"
            @keydown="forceAlphabetic"
          />
        </div>

        <BaseInputData
          type="text"
          v-model="estadoPersona.nombres"
          name="estadoPersona-nombres"
          inputId="estadoPersona-nombres"
          labelValue="Nombres"
          @keydown="forceAlphabetic"
        />

        <BaseInputData
          type="text"
          v-model="estadoPersona.email"
          name="estadoPersona-email"
          inputId="estadoPersona-email"
          labelValue="Correo Electrónico"
        />

        <div class="row row-double">
          <BaseSelectData
            v-model="estadoPersona.estadoCivil"
            inputId="nombres-select"
            labelValue="Estado Civil"
            :options="selectionOptionsPersona"
            :readonly="isReadonly"
            :hidden="props.hideEstadoCivil"
          />
          <!-- @change="updateSelectedType" -->
          <BaseInputData
            type="text"
            v-model="estadoPersona.ubigeo"
            name="estadoPersona-ubigeo"
            inputId="estadoPersona-ubigeo"
            labelValue="Ubigeo"
            :readonly="isReadonly"
            :hidden="props.hideUbigeo"
          />
        </div>

        <div class="form-row-double row-buttons">
          <button class="btn-nuevo" @click="resetFormulario">Nuevo</button>
          <button class="btn-grabar" @click="emit('save-data', estadoPersona)">Grabar</button>
        </div>
      </div>
      <!--
      <div class="form-section">
        <div style="width: 100% !important; height: 100%">
          <BaseTemplateData
            class=""
            :columns="estAplicacion.columns"
            :rows="estAplicacion.rows"
            :columnTypes="estAplicacion.columnsTypes"
            :hiddenColumns="estAplicacion.columnsHidden"
          >
          </BaseTemplateData>
        </div>
      </div>
       -->
    </div>
  </div>
</template>

<script setup>
// ========================
// IMPORTS
// ========================

// Vue composables
import { ref, reactive, defineEmits, defineExpose, defineProps } from 'vue'

// Servicios y utilidades
import { showErrorDialog } from '@/common/messageUtils'
import { getFullImageUrl } from '@/views/usuarios/services/usuarioServices'

// Assets
import iconUsersPath from '@/assets/img/user.png'

// ========================
// UNIQUE ID
// ========================
const uniqueId = `file-upload-${Math.random().toString(36).substring(2, 9)}`

// ========================
// REACTIVE VARIABLES
// ========================

// Form references
const estadoPersona = reactive({
  id: '',
  dni: '',
  apellido_paterno: '',
  apellido_materno: '',
  nombres: '',
  email: '', // Added email field
  estadoCivil: 0,
  ubigeo: '',
  restriccion: '',
  direccion: '',
  photo_url: '',
})

const imagePreview = ref(null)
const imageTimestamp = ref(Date.now()) // New reactive variable for cache busting

const selectionOptionsPersona = ref([
  { value: 0, label: 'Soltero' },
  { value: 1, label: 'Casado' },
  { value: 2, label: 'Viudo' },
  { value: 3, label: 'Divorciado' },
])

// Datos de la aplicación
const isReadonly = ref(true)

// Propiedades
const props = defineProps({
  hideUbigeo: {
    type: Boolean,
    default: false,
  },
  hideEstadoCivil: {
    type: Boolean,
    default: false,
  },
  hideSeleccionarImagen: {
    type: Boolean,
    default: false,
  },
  hideButtonValidaDni: {
    type: Boolean,
    default: false,
  },
  readOnlyDni: {
    type: Boolean,
    default: false,
  },
})

// Emits
const emit = defineEmits(['update:modelValue', 'image-upload', 'save-data'])

// ========================
// MODAL FUNCTIONS
// ========================
// (No hay funciones de modales en el código proporcionado)

// ========================
// DATA HANDLING FUNCTIONS
// ========================

// Mapeo de datos
const loadValidatedData = (data) => {
  estadoPersona.id = data.pk || data.id
  estadoPersona.dni = data.dni
  estadoPersona.apellido_paterno = data.apellido_paterno
  estadoPersona.apellido_materno = data.apellido_materno
  estadoPersona.nombres = data.nombres
  estadoPersona.email = data.email // Assign email
  estadoPersona.estadoCivil = data.estadoCivil !== undefined && data.estadoCivil !== null ? data.estadoCivil : 0 // Assign estadoCivil with a default value
  estadoPersona.ubigeo = data.ubigeo
  estadoPersona.restriccion = data.restriccion
  estadoPersona.direccion = data.direccion
  estadoPersona.photo_url = data.image || data.imageUrl || data.image_url || data.photo_url // Handle all possible names
  imagePreview.value = null // Clear previous preview
  imageTimestamp.value = Date.now() // Update timestamp to force image reload
}

// Fetch de usuarios
// (No hay funciones de fetch explícitas en el código proporcionado, pero apiService podría usarse para esto)

// ========================
// FORM HANDLING FUNCTIONS
// ========================

const forceNumeric = (event) => {
  // Allow control keys like backspace, delete, arrows, etc.
  if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(event.key)) {
    return
  }
  // Prevent non-numeric characters
  if (!/[0-9]/.test(event.key)) {
    event.preventDefault()
    return
  }
  // Prevent typing more than 8 digits
  if (event.target.value.length >= 8) {
    event.preventDefault()
  }
}

const validateDniLength = () => {
  if (estadoPersona.dni.length > 0 && estadoPersona.dni.length !== 8) {
    showErrorDialog('Error de Validación', 'El DNI debe contener exactamente 8 dígitos.')
  }
}

const forceAlphabetic = (event) => {
  // Allow control keys
  if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(event.key)) {
    return
  }
  // Regex for Spanish alphabet, including space
  const pattern = /^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s]$/
  if (!pattern.test(event.key)) {
    event.preventDefault()
  }
}

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target.result
      emit('image-upload', file)
    }
    reader.readAsDataURL(file)
  }
}

const resetFormulario = () => {
  Object.keys(estadoPersona).forEach((key) => {
    estadoPersona[key] = ''
  })
  imagePreview.value = null // Also reset the image preview
  console.log('Formulario reseteado')
}

// ========================
// EXPORT FUNCTIONS
// ========================

defineExpose({
  estadoPersona,
  loadValidatedData,
  resetFormulario,
})

// ========================
// LIFECYECLE HOOKS
// ========================
// (No hay hooks de ciclo de vida en el código proporcionado)

// ========================
// COMMENTED CODE
// ========================
// (No hay código comentado en el código proporcionado)
</script>

<style lang="sass" scoped>
.form-container
  display: flex
  justify-content: space-around
  flex-direction: row
  gap: 1rem
  margin-bottom: 5px

.profile-section
  display: flex
  flex-direction: column
  align-items: center

.avatar
  width: 120px
  height: 120px
  border-radius: 50%
  background: #ddd
  object-fit: cover
.user-photo
  display: flex
  justify-content: center
.btn-select
  margin-top: 1rem
  background-color: #55c2d6
  color: white
  padding: 0.5rem 1rem
  border: none
  border-radius: 6px
  cursor: pointer

.form-section
  flex: 1
  display: flex
  flex-direction: column

.row
  display: flex
  flex-direction: column

.row-double
  flex-direction: row
  gap: 1rem

  div
    flex: 1
    display: flex
    flex-direction: column

label
  color: #70a6bb
  font-size: 0.9rem
  margin-bottom: 0.3rem

input, select
  padding: 0.5rem
  border: 1px solid #ccc
  border-radius: 6px
  background: white

.row-buttons
  display: flex
  justify-content: flex-end
  gap: 1rem
  margin-top: 1rem

.btn-nuevo, .btn-grabar
  padding: 0.5rem 1.5rem
  border: none
  border-radius: 6px
  color: white
  font-weight: bold
  cursor: pointer

.btn-nuevo
  background-color: #55c2d6

.btn-grabar
  background-color: #42b3d4
.search-container
  position: relative
.search-button
  position: absolute
  right: 3px
  bottom: -13px
  transform: translateY(-50%)
  width: 30px
  height: 30px
  background-color: #55c2d6
  border: none
  border-radius: 50%
  cursor: pointer
  display: flex
  justify-content: center
  align-items: center
.label-img
  cursor: pointer
  color: #03c6d3
  font-style: italic
  font-size: 12px
  &:hover
    color: #42b3d4
</style>
