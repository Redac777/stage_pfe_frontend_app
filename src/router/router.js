import { createRouter, createWebHistory } from 'vue-router'
import Login from "@/components/Authentification/Login.vue"
import Dashboard from "@/components/Dashboard/Dashboard.vue"
import Users from "@/components/Users/Users.vue"
import Equipements from '@/components/Equipements/Equipements.vue'
import RTGPlanningOutput from '@/components/Cranes/RTG-Crane/RTGPlanningOutput.vue'
import RTGhome from '@/components/Cranes/RTG-Crane/RTGhome.vue'

const Router = createRouter({
    history:createWebHistory(),
    routes : [
        {path:'/',component:Dashboard},
        {path:'/dashboard',component:Dashboard},
        {path: '/users' , component:Users},
        {path:'/equipements' , component:Equipements},
        {path:'/rtg-home', component:RTGhome},
    ]
})

export default Router