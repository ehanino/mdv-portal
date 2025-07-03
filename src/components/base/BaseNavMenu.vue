<template>
  <div class="nav-container">
    <nav class="navigation">
      <div class="menu-header">
        <button class="hamburger" @click="toggleMenu" aria-label="Toggle Menu">
          <span :class="{ open: isMenuOpen }"></span>
          <span :class="{ open: isMenuOpen }"></span>
          <span :class="{ open: isMenuOpen }"></span>
        </button>
      </div>

      <ul class="nav-menu" :class="{ active: isMenuOpen }">
        <li v-for="item in menuItems" :key="item.name">
          <div v-if="item.isHeader" class="menu-app-header"></div>

          <router-link v-else :to="item.path" :title="item.name" @click="closeMenu">
            {{ item.name }}
          </router-link>
          <!--
          <ul v-if="item.submenus && item.submenus.length > 0" class="sub-menu">
            <li v-for="submenu in item.submenus" :key="submenu.slug">
              <router-link :to="submenu.url" :title="submenu.nombre" @click="closeMenu">
                {{ submenu.nombre }}
              </router-link>
            </li>
          </ul>
           -->
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  menuItems: {
    type: Array,
    required: true,
  },
})

const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}
</script>

<style lang="sass" scoped>
// .router-link-active
// 	border-bottom: 2px solid #029daf
.nav-container
	display: flex
	flex-direction: column
	z-index: 9999
	background: #F3F3F3

.navigation
	// margin: 10px
	position: relative

.menu-header
	display: none
	justify-content: flex-end

.hamburger
	display: flex
	flex-direction: column
	justify-content: space-around
	width: 30px
	height: 25px
	background: transparent
	border: none
	cursor: pointer
	padding: 0
	z-index: 10000
	transition: max-height 0.3s ease

	span
		width: 100%
		height: 3px
		background-color: #333
		border-radius: 2px
		transition: all 0.3s ease

	span.open:nth-child(1)
		transform: rotate(45deg) translate(5px, 5px)

	span.open:nth-child(2)
		opacity: 0

	span.open:nth-child(3)
		transform: rotate(-45deg) translate(5px, -5px)

.nav-menu
	list-style: none
	display: flex
	justify-content: center
	flex-wrap: wrap
	padding: 0
	margin: 0
	transition: transform 0.3s ease
	li
		margin-right: 15px
	a
		text-decoration: none
		color: #A4D0EE
		position: relative
		&::before
			content: ''
			position: absolute
			bottom: -2px
			left: 0
			width: 100%
			height: 3px
			background: linear-gradient(to right, #56e4f0, #03c6d3, #029daf)
			// z-index: 0 // Ajustado para que no interfiera con el texto
			transform: scaleX(0)
			transform-origin: left
			transition: transform 0.5s ease-in-out
		&:hover::before // Corrección del selector
			transform: scaleX(1)
		&:hover
			color: #029daf // Cambio de color al hacer hover (opcional)
		// Estilos para enlaces activos
		&.router-link-active::before,
		&.router-link-exact-active::before
			transform: scaleX(1)
		&.router-link-active,
		&.router-link-exact-active
			color: #03c6d3 // Cambio de color para enlaces activos (opcional)

/* Estilos responsivos */
@media (max-width: 768px)
	.menu-header
		display: flex

	.nav-menu
		position: fixed
		top: 0
		left: 0
		width: 100%
		height: 100vh
		background-color: rgba(44, 82, 103, 0.85)
		flex-direction: column
		align-items: center
		justify-content: center
		z-index: 9999 // Encima del formulario
		transform: translateY(-100%)
		transition: transform 0.3s ease-in-out

		&.active
			transform: translateY(0)

		li
			width: 100%
			margin: 10px 0

		a
			display: block
			width: 100%
			padding: 10px 20px
			box-sizing: border-box
			color: #fff
			&.router-link-active::before,
			&.router-link-exact-active::before
				transform: scaleX(0) // Ocultar el subrayado

			&.router-link-active,
			&.router-link-exact-active
				color: #70D888 // Restaurar el color original del textorayado
</style>
