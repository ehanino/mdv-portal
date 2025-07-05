<template>
  <fieldset class="form__div"  v-if="!hidden">
    <select
      v-bind="$attrs"
      class="form__input width-20"
      :disabled="!editable"
      @change="$emit('update:modelValue', $event.target.value)"
      :id="inputId"
      :value="modelValue !== undefined && modelValue !== '' ? modelValue : firstOptionValue"
    >
      <option :value="firstOptionValue">----------------</option>
      <!-- Renderizamos las opciones dinámicamente -->
      <option v-for="(option, index) in options" :key="index" :value="option.value">
        {{ option.label }}
      </option>
    </select>

    <!-- Aplicamos la clase al label basado en el valor del modelValue -->
    <label
      :for="inputId"
      class="form__label"
      :class="{ active: modelValue !== undefined && modelValue !== '' }"
    >
      {{ labelValue }}
    </label>
  </fieldset>
</template>

<script setup>
import { defineProps, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    required: true,
  },
  options: {
    type: Array,
    required: true,
    default: () => [],
  },
  inputId: {
    type: String,
    required: true,
  },
  labelValue: {
    type: String,
    required: true,
  },
  firstOptionValue: {
    type: [String, Number],
    default: '0', // Valor predeterminado para la primera opción
  },
  editable: {
    type: Boolean,
    default: true, // Hacer editable por defecto
  },
  hidden: {
    type: Boolean,
    default: false, // Prop hidden con valor por defecto false
  },
})

const firstOptionValue = computed(() => props.firstOptionValue)
</script>

<style lang="sass" scoped>
// .form__input[disabled]
// 	cursor: not-allowed

.form__div
	margin-top: 20px
	margin-bottom: 2px
	width: 100% !important
	position: relative
	display: inline-block

.form__input
	// margin-top: 50px
	padding-left: 18px
	padding-right: 5px
	margin-right: 2px
	width: 100% !important
	margin-top: 0px
	height: 30px
	border-radius: 0.5rem
	border: 1px solid #cad5f3
	outline: none
	box-sizing: border-box
	transform: 0.3s
	font-family: futura
	font-weight: 300
	font-size: .8rem
	outline: none

.form__input:focus, .form__input:hover
	border-color: #c9c8c8
	box-shadow: 0 0 6px 0 #c9c8c8

.form__label
	position: absolute
	left: 1rem
	top: 0.3rem
	padding: 0 0.25rem
	background-color: red
	color: #80868B
	font-size: 0.8rem !important
	transition: 0.3s

.form__input:focus + .form__label, .active
	top: -1.15rem
	left: 0.1rem
	background-color: transparent
	color: #53B0ED
	font-family: futura
	font-size: 0.9rem !important
	font-weight: 300
	// text-transform: uppercase

.form__input:not(:placeholder-shown).form__input:not(:focus) + .form__label,
.active
	top: -1.15rem
	left: 0.1rem
	background-color: transparent
	color: #53B0ED
	font-family: futura
	font-size: 0.9rem !important
	font-weight: 300
	// text-transform: uppercase
</style>
