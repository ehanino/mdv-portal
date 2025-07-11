<template>
  <div class="user-groups-manager">
    <!-- <h3>Gestión de Grupos</h3>
    <div v-if="loading">Cargando...</div>
    <div v-if="error" class="error">{{ error }}</div> -->

    <div class="selector-container">
      <div class="selector-box">
        <label>Grupos Disponibles</label>
        <select multiple v-model="selectedAvailable">
          <option v-for="group in availableGroups" :key="group.id" :value="group">
            {{ group.name }}
          </option>
        </select>
      </div>

      <div class="selector-actions">
        <button @click="assignGroups" title="Asignar seleccionados">&gt;</button>
        <button @click="removeGroups" title="Quitar seleccionados">&lt;</button>
      </div>

      <div class="selector-box">
        <label>Grupos Elegidos</label>
        <select multiple v-model="selectedChosen">
          <option v-for="group in chosenGroups" :key="group.id" :value="group">
            {{ group.name }}
          </option>
        </select>
      </div>
    </div>

    <button @click="saveUserGroups" class="save-button">Guardar Cambios</button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import apiService from '@/services/apiService' // Usamos el servicio de API centralizado
import { showMessageDialog } from '@/common/messageUtils.js' // Para mostrar mensajes
import { extractErrorMessage } from '@/common/utilities.js' // Para extraer mensajes de error

// Props para hacer el componente reutilizable
const props = defineProps({
  userId: {
    type: [Number, String],
    required: true,
  },
})

// --- Estado Reactivo ---
const allGroups = ref([]) // Todos los grupos que existen
const chosenGroups = ref([]) // Grupos que el usuario ya tiene
const loading = ref(true)
const error = ref(null)

// Modelos para las selecciones en las listas
const selectedAvailable = ref([])
const selectedChosen = ref([])

// --- Propiedad Computada ---
// Calcula los grupos disponibles dinámicamente.
const availableGroups = computed(() => {
  const chosenIds = new Set(chosenGroups.value.map((g) => g.id))
  return allGroups.value.filter((group) => !chosenIds.has(group.id))
})

// --- Lógica (Métodos) ---

// Mover de Disponibles a Elegidos
function assignGroups() {
  chosenGroups.value.push(...selectedAvailable.value)
  selectedAvailable.value = [] // Limpiar selección
}

// Mover de Elegidos a Disponibles
function removeGroups() {
  const selectedIds = new Set(selectedChosen.value.map((g) => g.id))
  chosenGroups.value = chosenGroups.value.filter((group) => !selectedIds.has(group.id))
  selectedChosen.value = [] // Limpiar selección
}

// Guardar los cambios en el servidor
async function saveUserGroups() {
  loading.value = true
  error.value = null
  try {
    // Extraemos solo los IDs de los grupos elegidos
    const groupIds = chosenGroups.value.map((g) => g.id)

    // Hacemos la petición PATCH a la API con los datos que espera el serializer
    // Se utiliza la ruta de la API consistente con el resto de la aplicación.
    await apiService.patch(`/api/v1/identity/usuarios/${props.userId}/`, {
      groups: groupIds,
    })

    showMessageDialog('Éxito', 'Grupos actualizados correctamente.')
  } catch (err) {
    const errorMessage = extractErrorMessage(err.response?.data || err.message)
    error.value = `No se pudieron guardar los cambios: ${errorMessage}`
    showMessageDialog('Error', error.value)
  } finally {
    loading.value = false
  }
}

// --- Ciclo de Vida ---
// Al montar el componente, cargamos los datos iniciales de la API
onMounted(async () => {
  loading.value = true
  error.value = null
  try {
    // Peticiones en paralelo para más eficiencia
    // Se utilizan las rutas de la API consistentes con el resto de la aplicación.
    // NOTA: Se asume que la ruta para obtener todos los grupos es '/api/v1/identity/groups/'.
    const [userResponse, groupsResponse] = await Promise.all([
      apiService.get(`/api/v1/identity/usuarios/${props.userId}/`),
      apiService.get('/api/v1/identity/groups/'),
    ])

    console.log('Datos del usuario:', userResponse.data)
    console.log('Datos de los grupos:', groupsResponse.data)

    allGroups.value = groupsResponse.data.results || groupsResponse.data // Soporte para paginación

    // Necesitamos los objetos completos de los grupos del usuario, no solo los IDs.
    const userGroupIds = new Set(userResponse.data.groups)
    chosenGroups.value = allGroups.value.filter((g) => userGroupIds.has(g.id))
  } catch (err) {
    const errorMessage = extractErrorMessage(err.response?.data || err.message)
    error.value = `No se pudieron cargar los datos: ${errorMessage}`
    showMessageDialog('Error', error.value)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.user-groups-manager {
  font-family: sans-serif;
  max-width: 600px;
}
.selector-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}
.selector-box {
  display: flex;
  flex-direction: column;
}
.selector-box label {
  margin-bottom: 0.5rem;
  font-weight: bold;
}
.selector-box select {
  width: 200px;
  height: 250px;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.selector-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.selector-actions button {
  padding: 0.5rem;
  cursor: pointer;
}
.save-button {
  margin-top: 1.5rem;
  padding: 0.8rem 1.5rem;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.save-button:hover {
  background-color: #218838;
}
.error {
  color: red;
}
</style>
