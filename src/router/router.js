import { createRouter, createWebHistory } from 'vue-router'
import App from '../App.vue' 
import Login from "../components/Login.vue"
import Dashboard from "@/components/Dashboard.vue"


const Router = createRouter({
    history:createWebHistory(),
    routes : [
        {path:'/',component:Login},
        {path:'/home',component:Dashboard},
    ]
})

export default Router