import { createApp } from 'vue'
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
// import './style.css'
import App from './App.vue'
import router from './router'
import './assets/css/style.css'
import { useAuthStore } from "./stores/auth";

const app = createApp(App);

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(pinia); 
app.use(router);

useAuthStore(pinia);

app.mount("#app");
