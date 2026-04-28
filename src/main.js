import { createApp } from 'vue'
import './style.css' // Pastikan Tailwind sudah terinstall di sini
import App from './App.vue'
import { router } from './router' // Kita akan buat file ini di langkah 2
import VueApexCharts from "vue3-apexcharts";

const app = createApp(App)
app.use(router)
app.use(VueApexCharts);
app.mount('#app')