// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Importamos nuestro nuevo Layout y las VISTAS que irán dentro de él
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import LoginView from '@/views/LoginView.vue'
import AdministradoView from '@/views/administrados/AdministradoView.vue'
import UsuarioView from '@/views/usuarios/UsuarioView.vue'
// import DashboardHomeView from '@/views/DashboardHomeView.vue' // La página de bienvenida del dashboard
// import AccountActivationView from '@/views/AccountActivationView.vue'

const routes = [
  // --- Rutas Públicas (no usan el layout principal) ---
  {
    path: '/login',
    name: 'login',
    component: LoginView,
  },
  // {
  //   path: '/activate/:slug',
  //   name: 'account-activation',
  //   component: AccountActivationView,
  // },

  // --- GRUPO DE RUTAS PRIVADAS / AUTENTICADAS ---
  {
    path: '/', // La ruta raíz ahora es el contenedor de nuestro layout principal
    component: AuthenticatedLayout,
    meta: { requiresAuth: true }, // Protegemos todo este grupo de rutas

    // Estas son las páginas que se renderizarán DENTRO del <RouterView /> del layout
    children: [
      {
        path: 'administrados/Administrado',
        name: 'administrado',
        component: AdministradoView,
      },
      {
        path: 'usuarios/usuario',
        name: 'usuario',
        component: UsuarioView,
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// --- Guardia de Navegación Corregido y Final ---
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Esta lógica intenta restaurar la sesión desde localStorage al cargar la app
  if (localStorage.getItem('accessToken') && !authStore.isAuthenticated) {
    try {
      await authStore.checkAuthOnLoad()
    } catch (e) {
      // Si el token almacenado es inválido, no hacemos nada y dejamos que el guardia continúe.
    }
  }

  const requiresAuth = to.meta.requiresAuth

  // Si la ruta es protegida Y el usuario NO está autenticado, lo enviamos al login.
  if (requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' })
  }
  // Si el usuario YA está autenticado e intenta ir a la página de login,
  // lo redirigimos a la página principal del dashboard.
  else if (to.name === 'login' && authStore.isAuthenticated) {
    next({ name: 'dashboard' }) // CORREGIDO: 'home' no existía en tu definición de rutas.
  }
  // En cualquier otro caso, le permitimos el paso.
  else {
    next()
  }
})

export default router
