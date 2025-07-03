<template>
  <Card>
    <template #title>
      <div class="header-container text-3d sombra">
        <div class="left-text">MUDIVE</div>
        <div class="size-text--title">Sistema de Gestión Municipal</div>
        <div class="right-image">
          <a href="#" @click="openModal('userModal')">
            <img
              :src="getFullImageUrl(user?.user_imagen)"
              alt="Imagen de usuario"
              class="user-image"
              title="CRUD User"
              style="margin-top: 3px"
            />
          </a>
        </div>
      </div>
    </template>
    <template #nav-menu>
      <div>
        <NavMenu :menuItems="menuItems" />
      </div>
    </template>
    <template #body>
      <DashboardHeaderComponent
        v-if="isLoaded"
        :ejercicio="ejercicio"
        @ejercicio-changed="onEjercicioChanged"
        @razon-social-change="onRazonSocialChanged"
      />
    </template>
    <template #footer-left>
      <div>
        <a href="#" @click="openModal('userModal')">
          <img
            v-if="user?.is_staff"
            :src="iconUser"
            title="Usuario: Mantenimiento"
            alt="Imagen para staff"
            class="icon-menu sombra"
            style="width: 30px; height: 30px"
          />
        </a>
        <a href="#" @click="openModal('administradoModal')">
          <img
            :src="iconAdministrados"
            title="Crear Administrado"
            alt="Imagen para administrados"
            class="icon-menu sombra"
            style="width: 30px; height: 30px"
          />
        </a>
      </div>
    </template>
    <template #footer-right>
      <div>
        <a href="#" title="Cerrar sesión" @click.prevent="logout">{{ user?.full_name }}</a>
      </div>
    </template>
  </Card>
  <!-- M O D A L   -->
  <ModalComponent :isOpen="!!activeModal.key" @close="closeModal">
    <!-- Contenido personalizado dentro de la modal -->
    <template #modal-content>
      <!-- Aquí pasamos el BaseCard dentro del modal -->
      <CardRow>
        <template #title>{{ modalTitles[activeModal.key] }}</template>

        <template #body>
          <div v-if="activeModal.key === 'userModal'">
            <UserModal></UserModal>
          </div>
          <div v-else-if="activeModal.key === 'administradoModal'">
            <AdministradoModal></AdministradoModal>
          </div>
          <div v-else-if="activeModal.key === 'predioModal'">
            <PredioModal :predio-id="activeModal.id" @close="closeModal"></PredioModal>
          </div>
        </template>
      </CardRow>
    </template>
    <button @click="closeModal">Cerrar Modal</button>
  </ModalComponent>
</template>
<script setup>
// ========================================================================
// 1. IMPORTACIONES
// ========================================================================

// Importaciones de Vue
import { ref, reactive, computed, onMounted, watch, toRefs } from 'vue'

// Importaciones de Store (Pinia)
import { useAuthStore } from '@/stores/auth.js'

// Importaciones de Utilidades y Funciones
import { getFullImageUrl } from '@/services/apiFunctions.js'
import { showMessageDialog, showErrorDialog } from '@/common/messageUtils.js'
import { extractErrorMessage, formatearFecha, formatearConSeparadorMiles } from '@/common/utilities'

// Importaciones de Assets (Imágenes e Íconos)
import iconUser from '../assets/img/user.png'
import iconAdministrados from '@/assets/img/business-people.png'

// ========================================================================
// 2. CONFIGURACIÓN DE STORE (PINIA)
// ========================================================================
const authStore = useAuthStore()
const { accessToken } = toRefs(authStore)
const jwt = accessToken.value

// ========================================================================
// 3. ESTADO REACTIVO DEL COMPONENTE (REFS Y REACTIVES)
// ========================================================================

// Estado general del componente
const isLoaded = ref(false)
const idAdministrado = ref(null)
const ejercicioSeleccionado = ref(null)
const ejercicio = reactive({
  e_inicial: null,
  e_final: null,
})

// Estado para la gestión de modales
const activeModal = ref({
  key: null, // Guarda el 'nombre' del modal a mostrar ('predioModal', etc.)
  id: null, // Guarda el ID a pasar como prop
})

const modalTitles = {
  userModal: 'Mantenimiento de Usuario',
  administradoModal: 'Creación de Administrados',
  predioModal: 'Mantenimiento de Predio',
}

// --- Estados para las tablas de datos ---

// Estado para "Autovaluo Calculados"
const estadoAutovaluoCalculados = reactive({
  totalAreaConstruida: '0.00',
  valorConstruccion: '0.00',
  valorTotalTerreno: '0.00',
  valorOtrasInstalaciones: '0.00',
  valorAvaluo: '0.00',
  incremento: '0.00',
  descuento: '0.00',
  valorAvaluoNeto: '0.00',
})

// Estado para "Declaración Jurada"
const estadoDeclaracionJurada = reactive({
  columns: ref(['id', 'Número', 'Motivo', 'Fecha', 'B. Imp.', 'Est', 'Ejercicio', 'Confirmada']),
  columnTypes: ref({ 0: 'number', 1: 'text', 2: 'text', 3: 'text', 4: 'decimal' }),
  columnsHidden: ref([0, 5, 6, 7]),
  rows: ref([]),
  djNumero: ref(null),
  djEjercicio: ref(null),
  is_confirmed: ref(null),
})

// Estado para "Predios en Propiedad"
const estadoPrediosPropiedad = reactive({
  columns: ref(['id', 'Predio', 'Ubicación']),
  columnTypes: ref({ 0: 'text', 1: 'text', 2: 'text' }),
  columnsHidden: ref([0]),
  rows: ref([]),
})

// Estado para "Datos de la Construcción"
const estadoDatosConstruccion = reactive({
  columns: ref([
    'id',
    'Pi Ni',
    'Ant',
    'Material Predominante',
    'Estado Conservación',
    'Categoría',
    'Valor Unitario',
    'Inc 5%',
    '% Dep.',
    'Val. Unit. Dep.',
    'Área Construida',
    'Val. Área Construida',
    '% A. Común',
    'Val. Área Común',
    'Val. Total Construcción',
  ]),
  columnTypes: ref({
    0: 'text',
    1: 'text',
    2: 'number',
    3: 'text',
    4: 'text',
    5: 'text',
    6: 'decimal',
    7: 'decimal',
    8: 'decimal',
    9: 'decimal',
    10: 'decimal',
    11: 'decimal',
    12: 'decimal',
    13: 'decimal',
    14: 'decimal',
  }),
  columnsHidden: ref([0]),
  rows: ref([]),
})

// Estado para "Otras Instalaciones"
const estadoOtrasInstalaciones = reactive({
  columns: ref(['id', 'Obra Complementaria', 'Valor']),
  columnTypes: ref({ 0: 'number', 1: 'text', 2: 'decimal' }),
  columnsHidden: ref([0]),
  rows: ref([]),
})

// Estado para "Condominantes"
const estadoCondominantes = reactive({
  columns: ref(['Id', 'Código', 'Nombre / Razón Social', 'N° Declar.', '%']),
  columnTypes: ref({ 0: 'text', 1: 'text', 2: 'text', 3: 'text', 4: 'decimal' }),
  columnsHidden: ref([0]),
  rows: ref([]),
})

// Estado para "Determinación del Impuesto Predial"
const estadoDeterminacionImpuestoPredial = reactive({
  columns: ref(['id', 'Anual', 'Trimestral']),
  columnTypes: ref({ 0: 'text', 1: 'decimal', 2: 'decimal' }),
  columnsHidden: ref([0]),
  rows: ref([]),
})

// Estado para "Datos Relativos al Predio"
const estadoRelativosPredio = reactive({
  tipoPredio: ref(''),
  estado: ref(''),
  tipo: ref(''),
  uso: ref(''),
  usoEspecial: ref(''),
  cercaParque: ref(''),
  clasificacion: ref(''),
  condicionPropiedad: ref(''),
  porcentajePropiedad: ref('0.00'),
  frontis: ref('0.00'),
  areaTerreno: ref('0.00'),
  area_comun: ref('0.00'),
  arancel: ref('0.00'),
  fechaAdquisicion: ref('2000-01-01'),
  afectacion: ref(''),
  afectoArb: ref(''),
  totalAreaConstruida: '0.00',
  valorConstruccion: '0.00',
  valorTotalTerreno: '0.00',
  valorOtrasInstalaciones: '0.00',
  valorAvaluo: '0.00',
  valorAvaluoNeto: '0.00',
})

// ========================================================================
// 4. PROPIEDADES COMPUTADAS (COMPUTED)
// ========================================================================
const user = computed(() => authStore.getUserData)

// ========================================================================
// 5. OBSERVADORES (WATCHERS)
// ========================================================================
watch(
  () => estadoDeclaracionJurada.rows,
  (newRows) => {
    // Auto-selección de la primera DJ de la lista
    if (Array.isArray(newRows) && newRows.length > 0) {
      estadoDeclaracionJurada.djNumero = newRows[0][1] || ''
      estadoDeclaracionJurada.djEjercicio = newRows[0][6]
      estadoDeclaracionJurada.is_confirmed = newRows[0][7]
    } else {
      estadoDeclaracionJurada.djNumero = ''
      estadoDeclaracionJurada.djEjercicio = ''
    }
  },
)

// ========================================================================
// 6. HOOKS DE CICLO DE VIDA (LIFECYCLE HOOKS)
// ========================================================================
onMounted(async () => {
  await authStore.checkAuth()

  try {
    const jwt = authStore.token
    const resp = await apiGetConfiguracion(jwt)
    ejercicio.e_inicial = Number(resp.ejercicio_inicial)
    ejercicio.e_final = Number(resp.ejercicio_final)
  } catch (err) {
    console.error('Error al cargar configuración:', err)
    showErrorDialog('No se pudo cargar la configuración inicial.')
  } finally {
    isLoaded.value = true
  }
})

// ========================================================================
// 7. MÉTODOS
// ========================================================================

// --- Métodos de carga y actualización de datos ---

const dashboardData = async (idAdmin, ejercicio) => {
  idAdministrado.value = idAdmin
  if (!idAdmin || !ejercicio) return

  // Limpiar estados antes de la carga
  estadoDeclaracionJurada.rows = []
  estadoOtrasInstalaciones.rows = []
  estadoCondominantes.rows = []
  estadoPrediosPropiedad.rows = []
  // (Puedes crear una función helper para resetear los estados si se vuelve repetitivo)

  try {
    const response = await apiDashboardData(jwt, ejercicio, idAdministrado.value)

    // Poblar los estados con los datos recibidos
    estadoRowsDeclaraciones(response.declaraciones)
    estadoDeterminacionImpuestoPredialRows(response.determinacion_predial)
    estadoPrediosPropiedadRows(response.predios_propiedad)
    datosRelativosPredio(response.datos_relativos_predios)
    estadoOtrasInstalacionesRows(response.datos_otras_instalaciones)
    estadoCondominantesRows(response.datos_condominantes)
    estadoConstruccionesRows(response.predio_construcciones)
  } catch (error) {
    showMessageDialog('No existen Declaraciones Juradas para los criterios seleccionados.')
    handleError(error)
  }
}

// --- Métodos manejadores de eventos (Handlers) ---

function onEjercicioChanged(nuevoEjercicio) {
  ejercicioSeleccionado.value = nuevoEjercicio
  dashboardData(idAdministrado.value, ejercicioSeleccionado.value)
}

function onRazonSocialChanged(idAdmin, ejercicio) {
  dashboardData(idAdmin, ejercicio)
}

const onRowClickDJ = async (row) => {
  estadoDeclaracionJurada.djNumero = row[1] || ''
  estadoDeclaracionJurada.djEjercicio = row[6]
  estadoDeclaracionJurada.is_confirmed = row[7] || true

  try {
    const response = await apiPrediosPropiedad(jwt, row[0])
    estadoPrediosPropiedad.rows = []
    estadoPrediosPropiedadRows(response.predios_propiedad)
    datosRelativosPredio(response.datos_relativos_predios)
    estadoCondominantesRows(response.datos_condominantes)
  } catch (error) {
    handleError(error)
  }
}

const onRowClickPrediosPropiedad = async (row) => {
  try {
    const response = await apiDatosRelativosPredio(jwt, row[0], ejercicioSeleccionado.value)
    datosRelativosPredio(response.datos_relativos_predios)
    estadoOtrasInstalacionesRows(response.otras_instalaciones)
    estadoCondominantesRows(response.datos_condominantes)
    estadoConstruccionesRows(response.predio_construcciones)
  } catch (error) {
    handleError(error)
  }
}

// --- Métodos de parseo y formato de datos ---

const estadoRowsDeclaraciones = (data) => {
  estadoDeclaracionJurada.rows = (data || []).map((row) => [
    row.id || ' ',
    row.nro_declaracion || ' ',
    row.motivo_declaracion || ' ',
    formatearFecha(row.fec_declaracion) || ' ',
    formatearConSeparadorMiles(row.total_valuo_afecto) || '0.00',
    row.is_active,
    row.ejercicio,
    row.is_confirmed,
  ])
}

const estadoDeterminacionImpuestoPredialRows = (data) => {
  console.log('estadoDeterminacionImpuestoPredialRows', data)
  const sourceData = data ? [data] : []
  estadoDeterminacionImpuestoPredial.rows = (sourceData || []).map((row) => [
    row.id || ' ',
    formatearConSeparadorMiles(row.valor_predial_anual) || '0.00',
    formatearConSeparadorMiles(row.valor_predial_trim) || '0.00',
  ])
}

const estadoPrediosPropiedadRows = (data) => {
  estadoPrediosPropiedad.rows = (data || []).map((row) => [
    row.predio_id || ' ',
    row.codigo || ' ',
    row.direccion || ' ',
  ])
}

const estadoOtrasInstalacionesRows = (data) => {
  estadoOtrasInstalaciones.rows = (data || []).map((row) => [
    row.id || ' ',
    row.obra_complementaria || ' ',
    formatearConSeparadorMiles(row.val_otra_instalacion) || '0.00',
  ])
}

const estadoCondominantesRows = (data) => {
  const idPrincipal = idAdministrado.value
  estadoCondominantes.rows = (data || [])
    .filter((row) => row.administrado_id != idPrincipal)
    .map((row) => [
      row.administrado_id || ' ',
      row.administrado_id || ' ',
      `${row.ape_paterno} ${row.ape_materno} ${row.nombres}`.trim() || ' ',
      row.nro_declaracion || ' ',
      formatearConSeparadorMiles(row.porcentaje_propiedad) || '0.00',
    ])
}

const estadoConstruccionesRows = (data) => {
  // if (!data) return;
  const rawData = data || []
  estadoAutovaluoCalculados.totalAreaConstruida = 0
  estadoAutovaluoCalculados.valorConstruccion = 0
  rawData.forEach((row) => {
    estadoAutovaluoCalculados.totalAreaConstruida += parseFloat(row.area_construida)
    // console.log('Valor Total Construcción:', typeof (row.area_construida));
    estadoAutovaluoCalculados.valorConstruccion += parseFloat(
      row.valor_total_construccion_calculado,
    )

    //     // Aquí podrías agregar otras sumas necesarias para los campos de estadoAutovaluoCalculados
    //     // como valorAvaluo, valorAvaluoNeto, etc., si dependen de las filas de construcción
  })
  estadoAutovaluoCalculados.totalAreaConstruida =
    formatearConSeparadorMiles(estadoAutovaluoCalculados.totalAreaConstruida) || '0.00'
  estadoAutovaluoCalculados.valorConstruccion =
    formatearConSeparadorMiles(estadoAutovaluoCalculados.valorConstruccion) || '0.00'

  estadoDatosConstruccion.rows = (data || []).map((row) => [
    row.id || ' ',
    row.piso || ' ',
    row.antiguedad || ' ',
    row.material_predominante || ' ',
    row.estado_conservacion || ' ',
    row.categoria || ' ',
    formatearConSeparadorMiles(row.valor_unitario) || '0.00',
    row.incremento || '0.00',
    row.porcentaje_depreciacion || '0.00',
    formatearConSeparadorMiles(row.valor_unit_depreciado) || '0.00',
    formatearConSeparadorMiles(row.area_construida) || '0.00',
    formatearConSeparadorMiles(row.valor_area_construida_calculado) || '0.00',
    formatearConSeparadorMiles(row.porcentaje_area_comun) || '0.00',
    formatearConSeparadorMiles(row.valor_area_comun_calculado) || '0.00',
    formatearConSeparadorMiles(row.valor_total_construccion_calculado) || '0.00',
  ])
}

const datosRelativosPredio = (data) => {
  if (!data) return
  estadoRelativosPredio.tipoPredio = data.tipo_predio || ''
  estadoRelativosPredio.estado = data.estado || ''
  estadoRelativosPredio.tipo = data.tipo || ''
  estadoRelativosPredio.uso = data.uso || ''
  estadoRelativosPredio.usoEspecial = data.uso_especial || ''
  estadoRelativosPredio.cercaParque = data.cerca_parque || ''
  estadoRelativosPredio.clasificacion = data.clasificacion || ''
  estadoRelativosPredio.condicionPropiedad = data.condicion_propiedad || ''
  estadoRelativosPredio.porcentajePropiedad = data.porcentaje_propiedad
    ? formatearConSeparadorMiles(data.porcentaje_propiedad)
    : '0.00'
  estadoRelativosPredio.frontis = data.frontis ? formatearConSeparadorMiles(data.frontis) : '0.00'
  estadoRelativosPredio.areaTerreno = data.area_terreno
    ? formatearConSeparadorMiles(data.area_terreno)
    : '0.00'
  estadoRelativosPredio.area_comun = data.area_comun
    ? formatearConSeparadorMiles(data.area_comun)
    : '0.00'
  estadoRelativosPredio.arancel = data.arancel ? formatearConSeparadorMiles(data.arancel) : '0.00'
  estadoRelativosPredio.fechaAdquisicion = data.fecha_adquisicion || '2000-01-01'
  estadoRelativosPredio.afectacion = data.afecto_predial || ''
  estadoRelativosPredio.afectoArb = data.afecto_arbitrio || ''
  estadoRelativosPredio.totalAreaConstruida = data.total_area_construida
    ? formatearConSeparadorMiles(data.total_area_construida)
    : '0.00'
  estadoRelativosPredio.valorConstruccion = data.valor_construccion
    ? formatearConSeparadorMiles(data.valor_construccion)
    : '0.00'
  estadoRelativosPredio.valorTotalTerreno = data.valor_total_terreno
    ? formatearConSeparadorMiles(data.valor_total_terreno)
    : '0.00'
  estadoRelativosPredio.valorOtrasInstalaciones = data.valor_otras_instalaciones
    ? formatearConSeparadorMiles(data.valor_otras_instalaciones)
    : '0.00'
  estadoRelativosPredio.valorAvaluo = data.total_avaluo
    ? formatearConSeparadorMiles(data.total_avaluo)
    : '0.00'
  estadoRelativosPredio.valorAvaluoNeto = data.total_avaluo
    ? formatearConSeparadorMiles(data.total_avaluo)
    : '0.00'
}

// --- Métodos de Utilidad y UI ---

const openModal = (key, id) => {
  activeModal.value = { key, id }
}

const closeModal = () => {
  activeModal.value = { key: null, id: null }
}

const logout = () => {
  authStore.logout()
}

const handleError = (error) => {
  const message = extractErrorMessage(error.response?.data || error.message)
  showErrorDialog(message)
}

function getEstadoClass(value) {
  return value ? 'estado-aprobado' : 'estado-pendiente'
}
</script>
<style lang="sass" scoped>
@use '@/assets/sass/_mixin' as mixins

.estado-aprobado
    background-color: #d4edda
    color: #155724
    padding: 2px 6px
    border-radius: 4px

.estado-pendiente
    background-color: #fff3cd
    color: #856404
    padding: 2px 6px
    border-radius: 4px

.estado-rechazado
    background-color: #f8d7da
    color: #721c24
    padding: 2px 6px
    border-radius: 4px
.manito
    cursor: pointer
.pdf-min
    width: 20px
    height: 20px
.img-eye
    width: 20px
    height: 10px

.text-3d
    font: bold /1 arial
    text-transform: uppercase
    color: #85939e !important
    text-shadow: 3px 8px 15px rgba(0,0,0,0.1), 3px 5px 5px rgba(0,0,0,0.3)
    letter-spacing: 3px
    @include mixins.phone
        font-size: .9rem !important
.size-text--title
    font-size: 1.5rem
    @include mixins.phone
        font-size: 1rem
        // color: red
.header-container
    display: flex
    justify-content: space-between
    max-height: 55px !important
    background-color: #F3F3F3
    font-size: 1.5rem !important
    @include mixins.phone
        margin-top: 6px

.left-text
    display: flex
    flex-direction: row
    font-size: 1rem
    margin-top: 5px
    padding-left: 3px
    @include mixins.phone
        font-size: 11px
        margin-top: 10px

.right-image
    justify-self: end /* Alinear la imagen a la derecha */

.main-card--body
    width: 100%
    height: 100%
    // background-color: bisque
    display: flex
    flex-direction: column
.main-card--row
    width: 100%
    height: 100%
    margin-top: 2px
    // border: 1px solid red
    display: flex
    @include mixins.phone
        border: 1px solid blue
        flex-direction: column
.main-card--row-a
    // background-color: yellow
    width: 100%
    max-width: 350px
    height: 100%
    @include mixins.phone
        max-width: 100%
        height: 100%
.main-card--row-b
    // border: 1px solid red
    width: 100%
    // height: 30px
    margin-left: 2px
    @include mixins.phone
        width: 100%
        height: 100%
        // background-color: yellow

// Variables para colores y espaciado
// $border-color: #ccc
// $input-bg-color: #f0f0f0
// $padding-small: 8px
// $padding-medium: 10px

.container
    width: 100%
    // height: 275px
    // border: 1px solid black
    // padding: $padding-medium
    padding-right: 5px
    // box-sizing: border-box

    display: flex
    flex-direction: column
    align-items: flex-end
    label
        margin-top: 20px
        font-size: .9rem
        white-space: nowrap

    .header-section
        // border: 1px solid red
        margin-top: -15px
        display: flex
        gap: 20px
        // margin-bottom: $padding-medium

        // .value-group
            // display: flex
            // align-items: center
            // gap: $padding-small


            // input[type="text"]
            //     border: 1px solid $border-color
            //     background-color: $input-bg-color
            //     padding: $padding-small
            //     text-align: right
            //     font-family: monospace

    .details-section
        display: flex
        flex-direction: column
        // width: 300px
        // border: 1px solid $border-color
        // padding: $padding-medium
        // box-sizing: border-box

        .detail-item
            margin-top: -10px
            display: flex
            justify-content: space-between
            align-items: center
            // padding: $padding-small 0
            // border-bottom: 1px solid $border-color


            &:last-child
                border-bottom: none

            label
                font-size: .9rem
                white-space: nowrap
                margin-right: 5px
            &.total
                font-weight: bold
                // margin-top: $padding-small
</style>
