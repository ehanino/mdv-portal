// src/main.js

import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import './assets/sass/style.css'

import BaseInputData from '@/components/base/BaseInputData.vue'
import BaseSelectData from '@/components/base/BaseSelectData.vue'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.component('BaseInputData', BaseInputData)
app.component('BaseSelectData', BaseSelectData)

app.use(createPinia())
app.use(router)

app.mount('#app')
