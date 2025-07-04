// vite.config.js

import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  // --- BLOQUE AÑADIDO CON MIS RECOMENDACIONES ---
  server: {
    // Escucha en todas las interfaces de red, crucial para que funcione con WSL
    host: '0.0.0.0',

    // El puerto estándar de Vite
    port: 5173,

    // Configuración del proxy para redirigir peticiones
    proxy: {
      // Cualquier petición que haga tu frontend a una URL que empiece con '/api'...
      '/api': {
        // ...Vite la redirigirá a tu backend de Django.
        target: 'http://127.0.0.1:8000',
        // Necesario para que el proxy funcione correctamente con hosts virtuales.
        changeOrigin: true,
      },
      // Hacemos lo mismo para las imágenes y otros archivos media.
      '/media': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      }
    }
  }
})
