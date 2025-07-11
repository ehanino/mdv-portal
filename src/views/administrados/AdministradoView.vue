<!-- src/views/administrados/AdministradoView.vue -->

<template>
  <div style="width: 65%; margin: auto auto">
    <BaseValidaDni
      ref="baseValidaDniRef"
      :hideUbigeo="false"
      :hideEstadoCivil="false"
      :hideButtonValidaDni="true"
    />
    <div :class="{ 'disabled-div': isDivDisabled }" style="margin-top: 10px">
      <div style="display: flex; flex-direction: row">
        <BaseSelectData
          v-model="conceptos"
          inputId="nombres-select"
          labelValue="Concepto"
          :options="conceptoOptions"
          style="width: 220px !important"
        />

        <template v-if="Number(selectedType) === 2">
          <BaseSelectData
            v-model="detalleSelect"
            inputId="inputId"
            labelValue="Seleccionar"
            :options="detalleOptions"
          />
        </template>

        <BaseInputData
          v-else
          :type="selectedType"
          v-model="detalle"
          inputId="detalle"
          labelValue="Detalle"
        />

        <img
          :src="iconDownArrowPath"
          alt="icono flecha abajo"
          class="img-arrow"
          @click="submitDownArrow"
        />
      </div>
      <BaseTemplateData :columns="['Id', 'Concepto', 'Detalle']" :rows="formattedRows">
        <template #actions="{ row }">
          <button @click="deleteRow(row[1], row[2])" class="btn-delete">🗑️</button>
        </template>
      </BaseTemplateData>
    </div>
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
import iconDownArrowPath from '@/assets/img/down-arrow.png'

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
.img-arrow
    width: 30px
    height: 30px
    margin-top: 20px
</style>
