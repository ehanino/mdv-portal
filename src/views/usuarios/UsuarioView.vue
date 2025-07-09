<!-- src/views/usuarios/UsuarioView.vue -->

<template>
  <BaseValidaDni ref="baseValidaDniRef" :hideUbigeo="true" :hideEstadoCivil="true" @save-data="handleSaveData" @image-upload="handleImageFile" />

  <div class="input-icon-container">
    <BaseInputData
      type="text"
      v-model="textToSearch"
      name="text-to-search"
      inputId="text-to-search"
      labelValue="Texto a Buscar"
      style="width: 150px; margin-left: 2px"
    />
    <img class="icon" :src="iconExcel" alt="ícono de excel" />
  </div>
  <BaseTemplateData
    class=""
    :columns="estUsuario.columns"
    :rows="estUsuario.rows"
    :columnTypes="estUsuario.columnsTypes"
    :hiddenColumns="estUsuario.columnsHidden"
  >
    <template #cell-5="{ value }">
      <span :class="getEstadoClass(value)">
        {{ value }}
      </span>
    </template>
    <template #actions="{ row }">
      <div class="flex gap-5">
        <img
          :src="imgPdf"
          alt="Ícono de PDF"
          @click="openModal('parrafosModal', row[0])"
          class="pdf-min"
        />
        <img :src="imgDelete" @click="deleteRow(row[0])" class="pdf-min" />
      </div>
    </template>
  </BaseTemplateData>
</template>

<script setup>
import { reactive, ref } from 'vue'

import BaseValidaDni from '@/components/base/BaseValidaDni.vue'
import BaseTemplateData from '@/components/base/BaseTemplateData.vue'
import apiService from '@/services/apiService'

import iconExcel from '@/assets/img/excel.png'

const baseValidaDniRef = ref(null)

const textToSearch = ref('')

const imageFile = ref(null)

//Estados en Usuario
const estUsuario = reactive({
  columns: ref(['id', 'Ape. Paterno', 'Ape. Materno', 'Nombres', 'D.N.I.', 'Emai', 'Estado']),
  columnsTypes: ref({ 0: 'numeric', 1: 'text', 2: 'text', 3: 'text', 4: 'text', 5: 'text' }),
  columnsHidden: ref([0]),
  rows: ref([]),
})

//Estados en Aplicación
const estAplicacion = reactive({
  columns: ref(['id', 'Aplicación', 'Descripción', 'Estado']),
  columnsTypes: ref({ 0: 'numeric', 1: 'text', 2: 'text', 3: 'text' }),
  columnsHidden: ref([0]),
  rows: ref([]),
})

const isHidden = ref(false)
// const imagePreview = ref(null)

const handleImageFile = (file) => {
  imageFile.value = file
}

const handleSaveData = async (personaData) => {
  const formData = new FormData()

  Object.keys(personaData).forEach((key) => {
    if (personaData[key]) {
      formData.append(key, personaData[key])
    }
  })

  if (imageFile.value) {
    formData.append('photo', imageFile.value)
  }

  try {
    const datos = await apiService.post('/api/v1/identity/usuarios/', formData)
    console.log('Usuario insertado con éxito:', datos.data)
    // Aquí puedes añadir lógica adicional, como mostrar un mensaje de éxito,
    // limpiar el formulario (si el padre lo controla), o actualizar una tabla.
    alert('Usuario insertado con éxito.') // Mensaje de éxito simple
  } catch (error) {
    console.error('Error al crear el usuario:', error.response?.data || error.message)
    const mensaje = error.response?.data
      ? Object.values(error.response.data).flat().join('\n')
      : 'Ocurrió un error inesperado.'
    alert(`Error al crear el usuario:\n${mensaje}`)
  }
}
</script>

<style lang="sass" scoped>
.input-icon-container
  display: flex
  align-items: center
  // border: 1px solid #ccc
  // border-radius: 20px
  padding: 0.2rem 0.5rem
  // background: white
  width: fit-content
.icon
  width: 22px
  height: 30px
  margin-left: 0.5rem
  cursor: pointer
  display: blcok
  margin-top: 17px
</style>
