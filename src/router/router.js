import { createRouter, createWebHistory } from 'vue-router'
import Login from "@/components/Authentification/Login.vue"
import Dashboard from "@/components/Dashboard/Dashboard.vue"
import Users from "@/components/Users/Users.vue"
import Equipements from '@/components/Equipements/Equipements.vue'
import RTGPlanningOutput from '@/components/Cranes/RTG-Crane/RTGPlanningOutput.vue'

const Router = createRouter({
    history:createWebHistory(),
    routes : [
        {path:'/',component:Login},
        {path:'/dashboard',component:Dashboard},
        {path: '/users' , component:Users},
        {path:'/equipements' , component:Equipements},
        {path:'/rtg-planning-output' , component:RTGPlanningOutput}
    ]
})

export default Router