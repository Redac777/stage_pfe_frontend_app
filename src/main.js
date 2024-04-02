/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'
import Store from './stores/index'
import Router from "./router/router"
// Composables
import { createApp } from 'vue'

const app = createApp(App)

registerPlugins(app)
app.use(Store)
app.use(Router)

app.mount('#app')
