<template>
  <div class="table-container">
    <table class="custom-table">
      <thead>
        <tr>
          <th v-for="(column, index) in visibleColumns" :key="index">
            {{ column }}
          </th>
          <th v-if="$slots.actions" class="actions-column"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in rows" :key="rowIndex" :class="getRowClasses(row)">
          <td
            v-for="(column, colIndex) in visibleColumnIndexes"
            :key="colIndex"
            :class="['manito', getCellClass(row[column], column)]"
            @click="handleRowClick(row)"
            class="font-td"
          >
            <slot :name="`cell-${colIndex}`" :value="row[column]" :row="row">
              {{ formatCellValue(row[column], column) }}
            </slot>
          </td>
          <td v-if="$slots.actions" class="actions-column">
            <slot name="actions" :row="row"></slot>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="rows.length === 0" class="empty-state">
      <slot name="empty"> No hay datos disponibles </slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props para recibir los datos de las columnas y los registros
const props = defineProps({
  columns: {
    type: Array,
    required: true,
  },
  rows: {
    type: Array,
    required: true,
    default: () => [],
  },
  // Nueva prop: permite especificar columnas ocultas mediante índices
  hiddenColumns: {
    type: Array,
    default: () => [], // Por defecto, oculta la primera columna como en el ejemplo original
  },
  // Nueva prop: permite definir el criterio para filas con estado especial
  statusField: {
    type: [String, Number],
    default: 3, // Índice usado en el original
  },
  // Nueva prop: valor que indica que la fila debe tener clase de peligro
  dangerValue: {
    type: String,
    default: 'D',
  },
  // Nueva prop: permite definir tipos de columnas para formateo específico
  columnTypes: {
    type: Object,
    default: () => ({}),
  },
})

// Emitir evento de clic en la fila
const emit = defineEmits(['rowClick'])

// Calcular columnas visibles (filtrar las ocultas)
const visibleColumnIndexes = computed(() => {
  return Array.from({ length: props.columns.length }, (_, i) => i).filter(
    (index) => !props.hiddenColumns.includes(index),
  )
})

// Obtener solo los nombres de las columnas visibles
const visibleColumns = computed(() => {
  return props.columns.filter((_, index) => !props.hiddenColumns.includes(index))
})

// Manejar clic en fila
function handleRowClick(row) {
  emit('rowClick', row)
}

// Asignar clases dinámicamente a las filas
function getRowClasses(row) {
  if (typeof props.statusField === 'number') {
    // Si statusField es un índice
    return row[props.statusField] === props.dangerValue ? 'row-danger' : ''
  } else if (typeof props.statusField === 'string' && row[props.statusField] !== undefined) {
    // Si statusField es una clave de objeto
    return row[props.statusField] === props.dangerValue ? 'row-danger' : ''
  }
  return ''
}

// Obtener clase para una celda basada en su tipo
function getCellClass(value, colIndex) {
  const type = props.columnTypes[colIndex]
  if (type === 'number' || type === 'decimal') {
    return type
  }

  // Detección automática de tipo numérico
  if (!type && !isNaN(parseFloat(value)) && isFinite(value)) {
    return 'numero'
  }

  return ''
}

// Formatear el valor de una celda según su tipo
function formatCellValue(value, colIndex) {
  const type = props.columnTypes[colIndex]

  if (type === 'decimal' && !isNaN(parseFloat(value))) {
    return parseFloat(value).toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  if (type === 'number' && !isNaN(parseFloat(value))) {
    return parseFloat(value).toLocaleString('es-ES')
  }

  if (type === 'date' && value) {
    try {
      const date = new Date(value)
      return date.toLocaleDateString('es-ES')
    } catch (e) {
      console.log(e)
      return value
    }
  }

  return value
}
</script>

<style lang="sass" scoped>
@use '@/assets/sass/_mixin' as mixins

.font-td
    font-weight: bold
    @include mixins.phone
        font-size: 10px !important
        color: black !important
.row-danger
    background-color: #fee2e2 !important

.table-container
    max-height: 400px
    overflow-y: auto
    position: relative

.custom-table
    width: 100%
    border-collapse: collapse
    min-height: 10px
    margin-bottom: 5px

.custom-table th,
.custom-table td
    border: 1px solid #ddd
    padding: 5px
    vertical-align: middle

.custom-table th
    background-color: #f1f1f1
    font-weight: bold
    font-size: 12px
    text-align: center
    position: sticky
    top: 0
    z-index: 10


.custom-table td
    background-color: #fff
    font-size: 11px
    text-align: left

.custom-table tbody tr:nth-child(even) td
    background-color: #f9f9f9

.numero,
.decimal
    text-align: right !important

.manito
    cursor: pointer

.actions-column
    width: 25px
    text-align: center !important

.empty-state
    display: flex
    justify-content: center
    align-items: center
    padding: 20px
    font-style: italic
    color: #666
</style>
