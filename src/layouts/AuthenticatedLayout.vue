<!-- src/layouts/AuthenticatedLayout.vue -->

<template>
  <Card>
    <template #title>
      <div class="header-container text-3d">
        <div class="left-text">MUDIVE</div>
        <div class="size-text--title">Sistema Integrado de Gestión Municipal</div>
        <div class="right-image">
          <a href="#" @click.prevent="goToProfile" title="Ver Perfil">
            <img :src="userImageUrl" alt="Imagen de usuario" class="user-image" />
          </a>
        </div>
      </div>
    </template>

    <template #nav-menu>
      <div style="background-color: aqua !important">
        <NavMenu :menuItems="menuItems" />
      </div>
    </template>

    <template #body>
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </template>

    <template #footer-left>
      <div>
        <a href="https://ehasoft.com" target="_blank">EhaSoft.pe</a>
      </div>
    </template>
    <template #footer-right>
      <div>
        <a href="#" title="Cerrar sesión" @click.prevent="logout">{{ authStore.fullName }}</a>
      </div>
    </template>
  </Card>
</template>

<script setup>
import { computed } from 'vue'
import { RouterView, useRouter } from 'vue-router' // Importamos RouterView y useRouter
import { useAuthStore } from '@/stores/auth'

// Importamos tus componentes base
import Card from '@/components/base/Component-Card.vue'
import NavMenu from '@/components/base/BaseNavMenu.vue'

// 1. OBTENEMOS LA INSTANCIA DEL STORE
const authStore = useAuthStore()
const router = useRouter()

// 2. CREAMOS PROPIEDADES COMPUTADAS PARA EL TEMPLATE
// Esto es más seguro y reactivo que acceder directamente.

// Computed para la URL de la imagen, con una imagen por defecto
const userImageUrl = computed(() => {
  // 1. Obtenemos la ruta relativa de la imagen desde el store
  const userImageRelativeUrl = authStore.user?.imageUrl;

  // 2. Si existe una ruta para la imagen del usuario, la usamos.
  //    Esta será una ruta relativa como '/media/photos/user.png'.
  //    El proxy de Vite se encargará de redirigirla al backend.
  console.log('User Image URL:', userImageRelativeUrl);
  if (userImageRelativeUrl) {
    return userImageRelativeUrl;
  }

  // 3. Si no hay imagen, devolvemos la ruta a una imagen por defecto
  //    que debe estar en tu carpeta `public` del proyecto de Vue.
  return 'src/img/user.png';
});

// Computed para transformar el 'accessMap' del token en una lista para el NavMenu
const menuItems = computed(() => {
  if (!authStore.accessMap) return []

  const allMenuItems = []
  // Recorremos cada 'aplicación' en nuestro mapa de acceso
  for (const appKey in authStore.accessMap) {
    const app = authStore.accessMap[appKey]
    allMenuItems.push({
      isHeader: true, // Un item especial para el título de la aplicación
      name: app.nombre,
    })
    // Añadimos cada menú de esa aplicación
    app.menus.forEach((menu) => {
      allMenuItems.push({
        name: menu.nombre,
        path: menu.url, // La URL a la que navegará
        // Aquí podrías añadir un icono, etc.
        submenus: menu.submenus, // Pasamos los submenús también
      })
    })
  }
  console.log('Menu Items:', allMenuItems)
  return allMenuItems
})

// 3. MÉTODOS
const logout = () => {
  // Simplemente llamamos a la acción del store.
  // El store se encargará de limpiar todo y redirigir.
  authStore.logout()
}

const goToProfile = () => {
  // Ejemplo de cómo navegar a una página de perfil
  router.push('/profile')
}

// Se eliminó toda la lógica del proyecto anterior (speak, onMounted, watchers, etc.)
// para mantener este componente limpio y enfocado en ser un layout.
</script>

<style scoped lang="sass">
@use "../assets/sass/_mixin" as mixins
/* Tu SCSS se mantiene igual. Solo un pequeño ajuste para el nombre de usuario */
.size-text--title
    font-size: 1.5rem
    @include mixins.phone
        font-size: 20px
        // color: red
.header-container
    display: flex
    justify-content: space-between
    max-height: 60px !important
    background-color: #F3F3F3
    font-size: 1.5rem !important
    @include mixins.phone
        font-size: .9rem !important
.text-3d
    font: bold /1 arial
    text-transform: uppercase
    color: #85939e !important
    text-shadow: 3px 8px 15px rgba(0,0,0,0.1), 3px 5px 5px rgba(0,0,0,0.3)
    letter-spacing: 3px
    @include mixins.phone
        font-size: .9rem !important
.left-text
    display: flex
    flex-direction: row
    font-size: 1rem
    margin-top: 5px
    @include mixins.phone
        font-size: 11px
        margin-top: 10px

.right-image
    display: flex
    // gap: 0.75rem
    // border: 1px solid red
    display: flex
    flex-direction: column
    align-items: center
    justify-content: center

.user-image
    width: 60px
    height: 60px
    margin-top: 20px
    border-radius: 50%
    border: 2px solid white
    cursor: pointer

.user-name
    font-weight: italic
    font-size: 0.7rem

/* ... el resto de tu SCSS se mantiene intacto ... */
</style>
