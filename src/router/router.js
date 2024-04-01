import { createRouter, createWebHistory } from 'vue-router'
import App from '../App.vue' 
import Login from "../components/Login.vue"
import HelloWorld from "@/components/HelloWorld.vue"


const Router = createRouter({
    history:createWebHistory(),
    routes : [
        {path:'/',component:Login},
        {path:'/users',component:HelloWorld},
    ]
})

export default Router