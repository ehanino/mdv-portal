<!-- DashboardHeaderComponent.vue -->
<template>
  <div class="flex-bi">
    <div class="flex-item-half">
      <BaseSelectData
        v-model="selectionState.ejercicio"
        :options="selectOptions"
        inputId="year-select"
        labelValue="Ejercicio"
        style="font-weight: bold; font-size: 1.2rem !important"
      />
    </div>

    <div class="flex-item-full">
      <BaseInputData
        type="text"
        v-model="searchState.string"
        name="text-search"
        inputId="text-search"
        labelValue="Buscar"
        style="font-weight: bold; font-size: 1.2rem !important"
        @keyup.enter="handleSearch(searchState.string)"
        @keyup="handleKeyPress"
      />
    </div>
    <div class="flex-bi flex-item-quart" v-if="searchState.registros === 1">
      <BaseInputData
        type="text"
        v-model="adminData.razonSocial"
        name="razon-social"
        inputId="razon-social"
        labelValue="Nombre o razón social"
      />
      <a href="#" @click.prevent="openModal('administrado')">
        <img
          :src="iconAdministrados"
          title="Administrado: Mantenimiento"
          alt="Administrado"
          class="icon-menu sombra"
        />
      </a>
    </div>
    <div class="flex-item-quart" v-else-if="searchState.registros > 1">
      <BaseSelectData
        v-model="nombreSeleccionado"
        :options="adminData.nombresDisponibles"
        inputId="nombres-select"
        labelValue="Nombre o razón social"
        @change="handleSelectChange"
      />
    </div>
    <div class="flex-item-quart">
      <BaseInputData
        type="text"
        v-model="adminData.domicilioFiscal"
        name="domicilio-fiscal"
        inputId="domicilio-fiscal"
        labelValue="Domicilio fiscal"
      />
    </div>
  </div>

  <!-- Modal -->
  <ModalComponent
    v-for="(modal, key) in modalState"
    :key="key"
    :isOpen="modal.visible"
    @close="closeModal(key)"
  >
    <template #modal-content>
      <CardRow>
        <template #title>{{ modal.title }}</template>
        <template #body>
          <AdministradoModal v-if="key === 'administrado'" />
          <UserModal v-else-if="key === 'user'" />
        </template>
      </CardRow>
    </template>
    <button @click="closeModal(key)">Cerrar</button>
  </ModalComponent>
</template>

<script setup>
// ==============================================
// 1. IMPORTS
// ==============================================
import { ref, computed, reactive, watch, defineEmits, onBeforeUnmount, toRefs } from 'vue'
import { showMessageDialog } from '@/common/messageUtils.js'

// Componentes base
// import ModalComponent from '@/components/base/ModalComponent.vue'
// import CardRow from '@/components/base/BaseCard.vue'

// Componentes modales
// import AdministradoModal from '@/components/modals/AdministradoModal.vue'
// import UserModal from '@/components/modals/UserModal.vue'

// Stores
import { useAuthStore } from '@/stores/auth'

// Metodos de Servicios
// import { apiNombreDireccion } from '@/components/administrado/AdministradoService'

// Assets
// import iconAdministrados from '@/assets/img/business-people.png'

// ==============================================
// 2. PROPS & EMITS
// ==============================================
const props = defineProps({
  ejercicio: {
    type: Object,
    required: true,
    validator: (val) => !isNaN(Number(val.e_inicial)) && !isNaN(Number(val.e_final)),
  },
})

const emit = defineEmits(['ejercicio-changed', 'razon-social-change'])

// ==============================================
// 3. STATE (REACTIVE DATA)
// ==============================================
// Estado de Store
const authStore = useAuthStore()
const { accessToken } = toRefs(authStore)
const jwt = accessToken.value

// Estado de búsqueda
const searchState = reactive({
  string: ref(''),
  timeoutId: null,
  resultados: ref([]),
  registros: ref(1),
})

// Estado de selección
const selectionState = reactive({
  ejercicio: ref(''),
})

// Datos administrativos
const adminData = reactive({
  razonSocial: ref(''),
  domicilioFiscal: ref(''),
  nombresDisponibles: ref([]),
})

// Control de modales
const modalState = reactive({
  user: {
    visible: false,
    title: 'Mantenimiento de Usuarios',
  },
  administrado: {
    visible: false,
    title: 'Mantenimiento de Administrado',
  },
})

// ==============================================
// 4. COMPUTED PROPERTIES
// ==============================================
const selectOptions = computed(() => {
  const { e_inicial, e_final } = props.ejercicio
  const ini = Number(e_inicial)
  const fin = Number(e_final)

  if (isNaN(ini) || isNaN(fin)) return []

  return Array.from({ length: fin - ini + 1 }, (_, i) => ({
    label: String(fin - i),
    value: String(fin - i),
  }))
})

// ==============================================
// 5. WATCHERS
// ==============================================
// Auto-selección del primer año disponible
watch(
  selectOptions,
  (opts) => {
    if (opts.length && !selectionState.ejercicio) {
      selectionState.ejercicio = opts[0].value
      emit('ejercicio-changed', selectionState.ejercicio)
    }
  },
  { immediate: true },
)

// Emitir cambios de ejercicio
watch(
  () => selectionState.ejercicio,
  (nuevoEjercicio) => {
    emit('ejercicio-changed', nuevoEjercicio)
    if (searchState.string.length > 0) {
      emit('razon-social-change', searchState.string, nuevoEjercicio)
    }
  },
)

watch(
  () => adminData.razonSocial,
  (nuevaRazonSocial) => {
    emit('razon-social-change', searchState.string, selectionState.ejercicio)
  },
)

// Búsqueda con debounce
watch(
  () => searchState.string,
  (nuevoTexto) => {
    clearTimeout(searchState.timeoutId)

    searchState.timeoutId = setTimeout(() => {
      handleSearch(nuevoTexto)
    }, 500)
  },
)

// ==============================================
// 6. METHODS
// ==============================================
const nombreDirecccion = async (texto) => {
  const response = await apiNombreDireccion(texto, jwt)
  // console.log("MAKARENA response 001", response.data.data.length)
  const resp = response.data.data
  // const resp = JSON.parse(response)
  return resp
}

const handleSearch = async (texto) => {
  // Si el texto de búsqueda está vacío, no hacemos nada
  console.log('handleSearch', typeof texto.toString())
  texto = String(texto)
  if (!texto || texto.trim() === '') {
    searchState.registros = 0
    return
  }

  // ENVOLVEMOS TODA LA LÓGICA DE LA API EN UN TRY...CATCH
  try {
    // 1. Llamamos a la función de API y esperamos la respuesta
    const response = await apiNombreDireccion(texto, jwt)

    // Si por alguna razón la respuesta es nula, salimos.
    // (Esto podría pasar si la función apiNombreDireccion devuelve null en un error manejado)
    if (!response || !response.data || !response.data.data) {
      searchState.registros = 0
      return
    }

    // 2. Extraemos el array de resultados. 'response.data.data' es el array que viene de Django
    const resultados = response.data.data
    searchState.registros = resultados.length

    // console.log("Búsqueda exitosa. Nro de registros:", searchState.registros);

    // 3. Procesamos los resultados
    if (searchState.registros === 1) {
      // Caso: 1 solo resultado
      adminData.razonSocial = resultados[0].full_name

      searchState.string = resultados[0].id // Asumo que quieres el ID para alguna referencia
      adminData.nombresDisponibles = [] // Limpiamos la lista de opciones
    } else {
      // Caso: Múltiples resultados
      adminData.razonSocial = '' // Limpiamos el nombre único

      // === CORRECCIÓN IMPORTANTE ===
      // `resultados` ya es el array, por lo que usamos resultados.map() directamente.
      adminData.nombresDisponibles = resultados.map((item) => ({
        label: item.full_name,
        value: item.id,
      }))
    }
  } catch (error) {
    // ¡AQUÍ ES DONDE ATRAPAMOS EL ERROR 404!
    // El error 'Uncaught' desaparecerá porque ahora está siendo 'caught' (atrapado)
    // console.error("Error atrapado durante la búsqueda:", error.serverMessage || error.message);

    // Aquí actualizamos la UI para reflejar que no se encontró nada o hubo un error
    showMessageDialog(error.serverMessage || 'Ocurrió un error inesperado.')

    searchState.registros = 0
    adminData.razonSocial = ''
    adminData.nombresDisponibles = []
  }
}

const handleKeyPress = (event) => {
  // Puedes usar esto para ver qué tecla se presiona, si lo necesitas.
  //   console.log(`Tecla presionada: ${event.key}`);
  // Por ahora puede estar vacía si no necesitas una lógica específica en cada tecla,
  // pero DEBE EXISTIR para que la plantilla no dé error.
}

// Método para manejar selección de opción en select
const handleSelectChange = (event) => {
  event.stopPropagation()
  const selectedValue = event.target.value
  searchState.string = selectedValue
  handleKeyPress()
}

const openModal = (modalType) => {
  modalState[modalType].visible = true
}

const closeModal = (modalType) => {
  modalState[modalType].visible = false
}

// ==============================================
// 7. LIFECYCLE HOOKS
// ==============================================
onBeforeUnmount(() => {
  clearTimeout(searchState.timeoutId)
})
</script>

<style lang="sass" scoped>
.flex-bi
  display: flex
//   gap: 1rem
.flex-item-half
  flex: 0.5
.flex-item-full
  flex: 1
.flex-item-quart
  flex: 4
.icon-menu
  width: 30px
  height: 30px
  margin-top: 16px
.sombra
  box-shadow: 0 2px 4px rgba(0,0,0,0.1)
</style>
