import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import InputData from '../views/InputData.vue'
import ManageData from '../views/ManageData.vue'
import NasabahPrioritas from '../views/NasabahPrioritas.vue'

const routes = [
    { path: '/', component: Dashboard },
    { path: '/input', component: InputData },
    { path: '/manage', component: ManageData },
    { path: '/nasabah', component: NasabahPrioritas }
]

export const router = createRouter({
    history: createWebHistory(),
    routes
})