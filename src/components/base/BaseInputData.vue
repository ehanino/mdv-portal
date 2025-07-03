<template>
  <fieldset class="form__div" v-if="!hidden">
    <input
      placeholder=" "
      v-bind="$attrs"
      class="form__input text-12"
      :type="type"
      :readonly="readonly"
      @input="$emit('update:modelValue', $event.target.value)"
      :value="modelValue"
      :id="inputId"
      :title="modelValue"
    />
    <label :for="inputId" class="form__label">
      {{ labelValue }}
    </label>
  </fieldset>
</template>

<script setup>
defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  labelValue: {
    type: String,
    default: '',
  },
  inputId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'text',
  },
  hidden: {
    type: Boolean,
    default: false, // Prop hidden con valor por defecto false
  },
  readonly: {
    type: Boolean,
    default: false, // Prop readonly con valor por defecto false
  },
})
</script>

<style lang="sass" scoped></style>
