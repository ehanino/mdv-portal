<template>
	<button class="button" :type="type" :disabled="disabled" v-bind="$attrs">
		<slot />
	</button>
</template>

<script setup>
const props = defineProps({
	type: {
		type: String,
		default: 'button', // Valor por defecto
	},
	disabled: {
		type: Boolean,
		default: false, // Por defecto, el botón está habilitado
	},
})
</script>

<style scoped>
.button:disabled {
	background-color: #ccc; /* Cambia el color cuando está deshabilitado */
	cursor: not-allowed; /* Cambia el cursor */
}
.button {
	height: 30px;
	margin: 5px 5px;
	color: rgba(255, 255, 255, 0.9) !important;
	font-family:
		'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial,
		'Lucida Grande', sans-serif;
	font-weight: 400;
	font-size: 14px;
	padding: 5px 20px;
	background: #318aac;
	border: 2px solid;
	border-radius: 5px;
	/* border-color: #318aac; */
	position: relative;
	cursor: pointer;
}
.button:hover {
	color: rgba(255, 255, 255, 1) !important;
	box-shadow: 0 4px 16px rgba(49, 138, 172, 1);
	transition: all 0.2s ease;
}
.button-primary {
	background-color: #007bff;
	border-color: #007bff;
}
.button-secundary {
	background-color: #6c757d;
	border-color: #6c757d;
}
.button-secundary:hover {
	color: rgba(255, 255, 255, 1) !important;
	box-shadow: 0 6px 20px rgba(108, 117, 125, 0.5); /* Gris */
	transition: all 0.2s ease;
}
.button-validate {
	background-color: #28a745;
	border-color: #28a745;
}
/* .button-validate:hover {
	color: rgba(255, 255, 255, 1) !important;
	box-shadow: 0 6px 20px rgba(40, 167, 69, 0.5);
	transition: all 0.2s ease;
} */
.button-warnig {
	background-color: #ffc107;
	border-color: #ffc107;
	color: #000 !important;
}
.button-warnig:hover {
	color: rgba(0, 0, 255, 1) !important;
	box-shadow: 0 6px 20px rgba(255, 193, 7, 0.5); /* Amarillo */
	transition: all 0.2s ease;
}
</style>
