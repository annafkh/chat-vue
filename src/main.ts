import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@fontsource-variable/inter'
import '@fontsource-variable/manrope'
import './style.css'
import App from './App.vue'
import { createAppRouter } from './router'

const pinia = createPinia()

createApp(App).use(pinia).use(createAppRouter(pinia)).mount('#app')
