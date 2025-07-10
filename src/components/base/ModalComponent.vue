<!-- Modal.vue -->
<template>
  <div v-if="isOpen">
    <!-- Contenedor de la modal -->
    <div class="modal" :class="modalClass">
      <div class="modal-content">
        <span class="close-btn" @click="closeModal">&times;</span>
        <!-- Slot para contenido personalizado -->

        <slot name="modal-content"></slot>
      </div>
    </div>

    <!-- Fondo oscuro detrás de la modal -->
    <div class="modal-overlay"></div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

// Props para controlar la apertura de la modal
const props = defineProps({
  modalClass: {
    type: String,
    default: '',
  },
  isOpen: {
    type: Boolean,
    default: false,
  },
})

// Emitir evento para cerrar la modal
const emit = defineEmits(['close'])

// Método para cerrar la modal
const closeModal = () => {
  emit('close')
}
</script>

<style lang="sass" scoped>
.modal-overlay
  position: fixed
  top: 0
  left: 0
  width: 100%
  height: 100%
  background-color: rgba(0, 0, 0, 0.6)
  z-index: 999
  border: 1px solid red

.modal
  position: fixed
  top: 50%
  left: 50%
  transform: translate(-50%, -50%)
  z-index: 1000
  // min-width: 500px
  // max-width: 100%
  background-color: transparent
  border-radius: 10px
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1)

.modal-content
  padding: 20px
  text-align: center

.close-btn
  position: absolute
  top: 12px
  right: 25px
  font-size: 24px
  cursor: pointer
  color: red

.close-btn:hover
  /* color: red; */
  font-size: 25px
  top: 12px
</style>
