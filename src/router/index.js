import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import InputData from '../views/InputData.vue'
import ManageData from '../views/ManageData.vue'

const routes = [
    { path: '/', component: Dashboard },
    { path: '/input', component: InputData },
    { path: '/manage', component: ManageData }
]

export const router = createRouter({
    history: createWebHistory(),
    routes
})