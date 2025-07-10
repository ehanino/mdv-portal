<template>
	<div class="card" :class="cardClass">
		<div class="card-header">
			<h2 class="card-title" :class="titleClass">
				<slot name="title" />
			</h2>
			<h4 class="card-subtitle">
				<slot name="subtitle" />
			</h4>
		</div>
		<div class="card-body" :class="bodyClass">
			<slot name="body" />
		</div>

	</div>
</template>

<script setup>
const props = defineProps({
	cardClass: {
		type: String,
		default: '',
	},
	titleClass: {
		type: String,
		default: '',
	},
	bodyClass: {
		type: String,
		default: '',
	},
	footerClass: {
		type: String,
		default: '',
	},
})
</script>

<style lang="sass" scoped>
@use "@/assets/sass/_mixin" as mixins

.card
	min-width: 350px
	height: 100%
	display: flex
	flex-direction: column
	justify-content: start //space-between
	background: #f3f3f3
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5)
	-moz-box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5)
	-webkit-box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5)

.card-header
	padding-left: 5px
	background-color: #fff
	border-bottom: 1px solid #ddd

.card-title
	font-family: 'Bree Serif', serif
	font-weight: bold
	font-size: 1.2em
	line-height: 25px
	color: #3498db
	text-align: center
	text-shadow: 1px 1px 0 rgba(256, 256, 256, 1)
	// @include mixins.phone
	// 	border: 1px solid red

.card-subtitle
	font-size: 13px
	line-height: 25px
	color: #9d9e9e
	margin: 0

.card-body
	font-size: 14px
	color: #414848
	// background-color: red
// .card-footer
// 	margin-top: 5px
// 	@include mixins.phone
// 		margin-top: -100px !important
</style>
