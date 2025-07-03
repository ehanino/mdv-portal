<!-- src/components/base/BaseValidaDni.vue -->

<template>
  <div style="width: 65%; margin: auto auto; margin-top: 10px">
    <div class="form-container sombra" style="padding: 5px">
      <div class="profile-section">
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
        <label for="image" class="label-img" hidden>Selecciona imagen</label>
      </div>
      <div class="form-section" style="min-width: 500px">
        <div class="row row-double">
          <BaseInputData
            type="text"
            v-model="estadoPersona.dni"
            name="estadoPersona-dni"
            inputId="estadoPersona-dni"
            labelValue="DNI"
            style="max-width: 300px"
          />
          <BaseInputData
            type="text"
            v-model="estadoPersona.restriccion"
            name="estadoPersona-restriccion"
            inputId="estadoPersona-restriccion"
            labelValue="Restricción"
            :readonly="isReadonly"
            :hidden="isHidden"
          />
        </div>
        <div class="row row-double">
          <BaseInputData
            type="text"
            v-model="estadoPersona.apellido_paterno"
            name="estadoPersona-apellido-paterno"
            inputId="estadoPersona-apellido-paterno"
            labelValue="Apellido Paterno"
          />
          <BaseInputData
            type="text"
            v-model="estadoPersona.apellido_materno"
            name="estadoPersona-apellido-materno"
            inputId="estadoPersona-apellido-materno"
            labelValue="Apellido Materno"
          />
        </div>

        <BaseInputData
          type="text"
          v-model="estadoPersona.nombres"
          name="estadoPersona-nombres"
          inputId="estadoPersona-nombres"
          labelValue="Nombres"
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
          />
          <!-- @change="updateSelectedType" -->
          <BaseInputData
            type="text"
            v-model="estadoPersona.ubigeo"
            name="estadoPersona-ubigeo"
            inputId="estadoPersona-ubigeo"
            labelValue="Ubigeo"
          />
        </div>

        <div class="form-row-double row-buttons">
          <button class="btn-nuevo">Nuevo</button>
          <button class="btn-grabar">Grabar</button>
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
import axios from 'axios'
import { ref, defineEmits, toRefs, defineExpose, reactive } from 'vue'
// import { useAuthStore } from '@/stores/auth'

import iconUsersPath from '@/assets/img/user.png'
import { getFullImageUrl } from '@/views/usuarios/services/usuarioServices'

const isReadonly = ref(true)
const isHidden = ref(false)
const imagePreview = ref(null)

// const apiBaseURL = import.meta.env.VITE_API_BASE_URL

// Store
// const authStore = useAuthStore()
// const { accessToken } = toRefs(authStore)
// const jwt = accessToken.value

// Emits
const emit = defineEmits(['update:modelValue', 'image-upload'])

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
  { value: 2, label: 'Divorciado' },
  { value: 3, label: 'Viudo' },
])

// Refs

// Methods
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

// const validaDni = () => {
//   if (!persDni.value || persDni.value.length !== 8 || isNaN(persDni.value)) {
//     alert('El DNI debe tener 8 dígitos numéricos')
//     return
//   }
//   apiValidaDocIdentidad(persDni.value, jwt, loadValidatedData)
// }

// const apiValidaDocIdentidad = (nro_dni, jwt, callback) => {
//   console.log('NINO')
//   const apiURL = `${apiBaseURL}/usuario/api/valida-dni/?dni=${nro_dni}`
//   console.log(`apiValidaDocIndentidad ${apiURL}`)

//   // Hacer la solicitud POST con axios
//   axios
//     .get(apiURL, {
//       headers: {
//         'Content-Type': 'application/json', // Especificar que enviamos datos en formato JSON
//         Authorization: `Bearer ${jwt}`,
//       },
//     })
//     .then((response) => {
//       // Manejar la respuesta exitosa
//       if (callback) {
//         console.log('responsable', response.data)
//         if (
//           response.data['error'] === 'La contraseña para el DNI y RUC está caducada' ||
//           response.data['error'] === 'Clave incorrecta'
//         ) {
//           alert(response.data['error'])
//         } else {
//           callback(response.data) // Ejecutar la función callback
//         }
//       }
//     })
//     .catch((error) => {
//       // Manejar los errores
//       console.log(`ErroresNino....${error}`)
//       // alert(error.response.data['error'])
//       // console.error('Error al validar el documento22:', error.response.data['error'])
//     })
// }
</script>

<style lang="sass" scoped>
.form-container
  display: flex
  flex-direction: row
  gap: 1rem
  margin-bottom: 5px
  // padding: 2rem
  // background: #f5f5f5
  // border-radius: 10px

.profile-section
  display: flex
  flex-direction: column
  align-items: center
  margin-right: 2rem

.avatar
  width: 120px
  height: 120px
  border-radius: 50%
  background: #ddd
  object-fit: cover

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
  // gap: 1rem

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
</style>
