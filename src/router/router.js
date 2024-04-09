import { createRouter, createWebHistory } from 'vue-router'
import App from '@/App.vue' 
import Login from "@/components/Login.vue"
import Dashboard from "@/components/Dashboard.vue"
import Users from "@/components/Users.vue"
import equipements from '@/components/equipements.vue'
import Equipements from '@/components/equipements.vue'

const Router = createRouter({
    history:createWebHistory(),
    routes : [
        {path:'/',component:Login},
        {path:'/dashboard',component:Dashboard},
        {path: '/users' , component:Users},
        {path:'/equipements' , component:Equipements},
    ]
})

export default Router