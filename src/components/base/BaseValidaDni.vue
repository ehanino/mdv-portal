<!-- src/components/base/BaseValidaDni.vue -->

<template>
  <div style="width: 65%; margin: auto auto; margin-top: 10px">
    <div class="form-container" style="padding: 5px">
      <div class="profile-section user-photo">
        <input id="image" type="file" @change="handleImageUpload" accept="image/*" hidden />
        <img
          :src="
            imagePreview ||
            (estadoPersona.photo_url ? getFullImageUrl(estadoPersona.photo_url) : iconUsersPath)
          "
          alt="Vista previa de la imagen"
          class="avatar"
          title="CRUD User"
        />
        <label for="image" class="label-img" :hidden="hideSeleccionarImagen"
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
              :style="{ width: hideButtonValidaDni ? '312px' : '180px' }"
              @keydown="forceNumeric"
              @blur="validateDniLength"
            />
          </div>
          <div class="row-buttons" v-if="!hideButtonValidaDni" style="padding-right: 4px">
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
            :hidden="hideEstadoCivil"
          />
          <!-- @change="updateSelectedType" -->
          <BaseInputData
            type="text"
            v-model="estadoPersona.ubigeo"
            name="estadoPersona-ubigeo"
            inputId="estadoPersona-ubigeo"
            labelValue="Ubigeo"
            :readonly="isReadonly"
            :hidden="hideUbigeo"
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
import { ref, defineEmits, defineExpose, reactive } from 'vue'
import apiService from '@/services/apiService'
import { showErrorDialog } from '@/common/messageUtils'

import iconUsersPath from '@/assets/img/user.png'
import { getFullImageUrl } from '@/views/usuarios/services/usuarioServices'

const isReadonly = ref(true)

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
})

const imagePreview = ref(null)

// Emits
const emit = defineEmits(['update:modelValue', 'image-upload', 'save-data'])

const estadoPersona = reactive({
  id: '',
  dni: '',
  apellido_paterno: '',
  apellido_materno: '',
  nombres: '',
  estadoCivil: 0,
  ubigeo: '',
  restriccion: '',
  direccion: '',
  photo_url: '',
})

const selectionOptionsPersona = ref([
  { value: 0, label: 'Soltero' },
  { value: 1, label: 'Casado' },
  { value: 2, label: 'Viudo' },
  { value: 3, label: 'Divorciado' },
])

// Methods
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

const loadValidatedData = (data) => {
  estadoPersona.id = data.pk
  estadoPersona.dni = data.dni
  estadoPersona.apellido_paterno = data.apellido_paterno
  estadoPersona.apellido_materno = data.apellido_materno
  estadoPersona.nombres = data.nombres
  estadoPersona.estadoCivil = data.estadoCivil
  estadoPersona.ubigeo = data.ubigeo
  estadoPersona.restriccion = data.restriccion
  estadoPersona.direccion = data.direccion
  estadoPersona.photo_url = data.photo_url
}

// Expose
defineExpose({
  estadoPersona,
  loadValidatedData,
})

const resetFormulario = () => {
  Object.keys(estadoPersona).forEach((key) => {
    estadoPersona[key] = ''
  })
  console.log('Formulario reseteado')
}
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