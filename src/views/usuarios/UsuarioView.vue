<!-- src/views/usuarios/UsuarioView.vue -->

<template>
  <div style="width: 65%; margin: auto auto">
    <BaseValidaDni
      ref="baseValidaDniRef"
      :hideUbigeo="true"
      :hideEstadoCivil="true"
      :hideButtonValidaDni="true"
      @save-data="handleSaveData"
      @image-upload="handleImageFile"
    />
  </div>
  <div
    class="row-buttons"
    style="width: 65%; margin: 1rem auto; padding-right: 1rem; justify-content: flex-end"
  >
    <button class="btn-nuevo" @click="handleNew">Nuevo</button>
    <button class="btn-grabar" @click="handleSaveData">Grabar</button>
  </div>
  <div class="input-icon-container">
    <BaseInputData
      type="text"
      v-model="textToSearch"
      name="text-to-search"
      inputId="text-to-search"
      labelValue="Texto a Buscar"
      style="width: 150px; margin-left: 2px"
    />
    <button class="btn-search" @click="fetchUsuarios(textToSearch)" style="margin-top: 15px">
      Buscar
    </button>
    <img class="icon" :src="iconExcel" alt="ícono de excel" @click="exportToExcel" />
  </div>
  <BaseTemplateData
    class=""
    :columns="estUsuario.columns"
    :rows="estUsuarioRows"
    :columnTypes="estUsuario.columnsTypes"
    :hiddenColumns="estUsuario.columnsHidden"
    :statusColumnIndex="6"
  >
    <template #cell-6="{ value }">
      {{ value }}
    </template>
    <template #actions="{ row }">
      <div class="flex gap-5">
        <img
          :src="imgEdit"
          alt="Ícono de PDF"
          class="pdf-min"
          @click="openModal('UsuarioModalView', row[0])"
        />
      </div>
    </template>
  </BaseTemplateData>

  <!-- M O D A L   -->
  <ModalComponent :isOpen="!!activeModal.key" @close="handleCloseModal">
    <!-- Contenido personalizado dentro de la modal -->
    <template #modal-content>
      <!-- Aquí pasamos el BaseCard dentro del modal -->
      <CardRow>
        <template #title>{{ modalTitles[activeModal.key] }}</template>

        <template #body>
          <div v-if="activeModal.key === 'UsuarioModalView'">
            <UsuarioModalView
              :usuario-id="activeModal.id"
              @close-modal="handleCloseModal"
            ></UsuarioModalView>
          </div>
        </template>
      </CardRow>
    </template>
    <button @click="handleCloseModal">Cerrar Modal</button>
  </ModalComponent>
  <!-- E N D   M O D A L  -->
</template>
<script setup>
// ========================
// IMPORTS
// ========================
import { reactive, ref, onMounted } from 'vue'

// Components
import CardRow from '@/components/base/BaseCard.vue'
import BaseValidaDni from '@/components/base/BaseValidaDni.vue'
import BaseTemplateData from '@/components/base/BaseTemplateData.vue'
import ModalComponent from '@/components/base/ModalComponent.vue'
import UsuarioModalView from '@/views/usuarios/UsuarioModalView.vue'

// Services & Utilities
import apiService from '@/services/apiService'
import { exportDataToExcel } from '@/common/utilities'
import { showMessageDialog } from '@/common/messageUtils.js'

// Assets
import iconExcel from '@/assets/img/excel.png'
import imgEdit from '@/assets/img/edit.png'

// ========================
// REACTIVE VARIABLES
// ========================
// Form references
const baseValidaDniRef = ref(null)
const textToSearch = ref('')
const imageFile = ref(null)

// Data
const estUsuarioRows = ref([])

// Modal management
const activeModal = ref({
  key: null, // Modal name ('UsuarioModalView', etc.)
  id: null, // ID to pass as prop
})

const modalTitles = {
  UsuarioModalView: 'Mantenimiento de Usuario',
}

// Table configuration
const estUsuario = reactive({
  columns: ref(['id', 'Ape. Paterno', 'Ape. Materno', 'Nombres', 'D.N.I.', 'Email', 'Estado']),
  columnsTypes: ref({ 0: 'numeric', 1: 'text', 2: 'text', 3: 'text', 4: 'text', 5: 'text' }),
  columnsHidden: ref([0]),
})

// ========================
// MODAL FUNCTIONS
// ========================
const openModal = (key, id) => {
  activeModal.value = { key, id }
}

const handleCloseModal = (payload) => {
  activeModal.value = { key: null, id: null }
  if (payload?.updated) {
    fetchUsuarios()
  }
}

// ========================
// DATA HANDLING FUNCTIONS
// ========================
const mapApiDataToRows = (apiData) => {
  estUsuarioRows.value = (apiData || []).map((row) => [
    row.slug || '',
    row.apellido_paterno || '',
    row.apellido_materno || '',
    row.nombres || '',
    row.dni || '',
    row.email || '',
    row.is_active ? 'Activo' : 'Inactivo',
  ])
}

const fetchUsuarios = async (searchQuery = '') => {
  try {
    const params = {}
    if (searchQuery) {
      params.search = searchQuery
    }
    const response = await apiService.get('/api/v1/identity/usuarios/', { params })
    mapApiDataToRows(response.data.results)
  } catch (error) {
    console.error('Error fetching users:', error)
  }
}

// ========================
// FORM HANDLING FUNCTIONS
// ========================
const handleImageFile = (file) => {
  imageFile.value = file
}

const handleNew = () => {
  if (baseValidaDniRef.value) {
    baseValidaDniRef.value.resetFormulario()
    imageFile.value = null // También reseteamos el archivo de imagen en el padre
  }
}

const handleSaveData = async () => {
  if (!baseValidaDniRef.value) return

  const personaData = baseValidaDniRef.value.estadoPersona
  if (!personaData.dni || personaData.dni.length !== 8) {
    showMessageDialog('Error de Validación', 'El DNI es obligatorio y debe tener 8 dígitos.')
    return
  }

  const formData = new FormData()
  Object.keys(personaData).forEach((key) => {
    if (personaData[key]) {
      formData.append(key, personaData[key])
    }
  })

  if (imageFile.value) {
    formData.append('image', imageFile.value)
  }

  try {
    await apiService.post('/api/v1/identity/usuarios/', formData)
    showMessageDialog('Éxito', 'Usuario creado correctamente.')
    handleNew() // Reutilizamos la lógica de reseteo
    fetchUsuarios()
  } catch (error) {
    console.error('Error al crear el usuario:', error.response?.data || error.message)
    // Aquí podrías usar tu messageUtils para mostrar el error al usuario
  }
}

// ========================
// EXPORT FUNCTIONS
// ========================
const exportToExcel = () => {
  const filename = `usuarios_${new Date().toISOString().slice(0, 10)}.xlsx`
  exportDataToExcel(
    '/api/v1/identity/usuarios/export/excel/', // Backend endpoint for Excel export
    { search: textToSearch.value }, // Pass current search filter
    filename,
  )
}

// ========================
// LIFECYCLE HOOKS
// ========================
onMounted(() => {
  fetchUsuarios()
})
</script>

<style lang="sass" scoped>
.pdf-min
  width: 20px
  height: 20px
  cursor: pointer
.input-icon-container
  display: flex
  align-items: center
  padding: 0.2rem 0.5rem
  width: fit-content
.icon
  width: 22px
  height: 30px
  margin-left: 0.5rem
  cursor: pointer
  display: blcok
  margin-top: 15px

.btn-search
  margin-left: 10px
  padding: 5px 10px
  background-color: #42b3d4
  color: white
  border: none
  border-radius: 4px
  cursor: pointer
  &:hover
    background-color: #369cb8
</style>
