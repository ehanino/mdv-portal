<!-- src/views/usuarios/UsuarioView.vue -->

<template>
  <BaseValidaDni
    ref="baseValidaDniRef"
    :hideUbigeo="true"
    :hideEstadoCivil="true"
    :hideButtonValidaDni="true"
    @save-data="handleSaveData"
    @image-upload="handleImageFile"
  />

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
        <img :src="imgEdit" alt="Ícono de PDF" class="pdf-min" @click="openEditUserModal(row)" />
        <!-- @click="openModal('parrafosModal', row[0])" -->
        <!-- <img :src="imgDelete" @click="deleteRow(row[0])" class="pdf-min" /> -->
      </div>
    </template>
  </BaseTemplateData>

  <!-- ADDED: User Edit Modal -->
  <ModalComponent :is-open="isEditUserModalOpen" @close="closeEditUserModal">
    <template #modal-content>
      <UserModalView :user-to-edit="selectedUser" @close-modal="closeEditUserModal" />
    </template>
  </ModalComponent>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'

import BaseValidaDni from '@/components/base/BaseValidaDni.vue'
import BaseTemplateData from '@/components/base/BaseTemplateData.vue'
import apiService from '@/services/apiService'

import iconExcel from '@/assets/img/excel.png'
import imgEdit from '@/assets/img/edit.png'
import imgDelete from '@/assets/img/eliminar.png'

import { exportDataToExcel } from '@/common/utilities'

// ADDED: Import ModalComponent and UserModalView
import ModalComponent from '@/components/base/ModalComponent.vue'
import UserModalView from '@/views/usuarios/UserModalView.vue'

const baseValidaDniRef = ref(null)

const textToSearch = ref('')

const imageFile = ref(null)

const estUsuarioRows = ref([])

// ADDED: Reactive variables for modal control
const isEditUserModalOpen = ref(false)
const selectedUser = ref(null)

const estUsuario = reactive({
  columns: ref(['id', 'Ape. Paterno', 'Ape. Materno', 'Nombres', 'D.N.I.', 'Email', 'Estado']),
  columnsTypes: ref({ 0: 'numeric', 1: 'text', 2: 'text', 3: 'text', 4: 'text', 5: 'text' }),
  columnsHidden: ref([0]),
})

const estAplicacion = reactive({
  columns: ref(['id', 'Aplicación', 'Descripción', 'Estado']),
  columnsTypes: ref({ 0: 'numeric', 1: 'text', 2: 'text', 3: 'text' }),
  columnsHidden: ref([0]),
  rows: ref([]),
})

const mapApiDataToRows = (apiData) => {
  estUsuarioRows.value = (apiData || []).map((user) => [
    user.id || '',
    user.apellido_paterno || '',
    user.apellido_materno || '',
    user.nombres || '',
    user.dni || '',
    user.email || '',
    user.is_active ? 'Activo' : 'Inactivo',
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

const exportToExcel = () => {
  const filename = `usuarios_${new Date().toISOString().slice(0, 10)}.xlsx`
  exportDataToExcel(
    '/api/v1/identity/usuarios/export/excel/', // Backend endpoint for Excel export
    { search: textToSearch.value }, // Pass current search filter
    filename,
  )
}

onMounted(() => {
  fetchUsuarios()
})

const isHidden = ref(false)

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
    fetchUsuarios()
  } catch (error) {
    console.error('Error al crear el usuario:', error.response?.data || error.message)
  }
}

// ADDED: Functions to open and close the edit user modal
const openEditUserModal = (userRow) => {
  // Map the row array back to an object for easier access in the modal
  selectedUser.value = {
    id: userRow[0],
    apellido_paterno: userRow[1],
    apellido_materno: userRow[2],
    nombres: userRow[3],
    dni: userRow[4],
    email: userRow[5],
    is_active: userRow[6] === 'Activo' ? true : false, // Convert back to boolean
  }
  isEditUserModalOpen.value = true
}

const closeEditUserModal = () => {
  isEditUserModalOpen.value = false
  selectedUser.value = null
  fetchUsuarios() // Refresh user list after closing modal (in case of update)
}
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