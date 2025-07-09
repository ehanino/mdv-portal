<!-- src/views/administrados/AdministradoView.vue -->

<template>
  <BaseValidaDni ref="baseValidaDniRef" :hideUbigeo="false" :hideEstadoCivil="false" />

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
    :columns="estAdministrado.columns"
    :rows="estAdministrado.rows"
    :columnTypes="estAdministrado.columnsTypes"
    :hiddenColumns="estAdministrado.columnsHidden"
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
import BaseInputData from '@/components/base/BaseInputData.vue'

import iconExcel from '@/assets/img/excel.png'
import imgPdf from '@/assets/img/pdf.png'
import imgDelete from '@/assets/img/eliminar.png'

const baseValidaDniRef = ref(null)

const textToSearch = ref('')

//Estados en Administrado
const estAdministrado = reactive({
  columns: ref(['id', 'Ape. Paterno', 'Ape. Materno', 'Nombres', 'D.N.I.', 'Email', 'Estado']),
  columnsTypes: ref({ 0: 'numeric', 1: 'text', 2: 'text', 3: 'text', 4: 'text', 5: 'text' }),
  columnsHidden: ref([0]),
  rows: ref([]),
})

const isHidden = ref(false)

const getEstadoClass = (value) => {
  // Implement your logic for getEstadoClass here
  return ''
}

const openModal = (modalName, rowId) => {
  // Implement your logic for openModal here
  console.log(`Opening modal ${modalName} for row ${rowId}`)
}

const deleteRow = (rowId) => {
  // Implement your logic for deleteRow here
  console.log(`Deleting row ${rowId}`)
}
</script>

<style lang="sass" scoped>
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
  margin-top: 17px
</style>
