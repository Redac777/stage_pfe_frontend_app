<template>
    <div class="main">
            <div class="content">
                <!-- <v-btn @click="reset">
                    Reset
                </v-btn> -->
            <DashboardNavigation @updateActiveComponent="updateActiveComponent"/>
            <RTGhome v-if="activeComponent == 'RTGhome' && (this.plannings && this.plannings.length===0) || this.createdPlanningData" :planningData="createdPlanningData"  />
            <RTGPlanningOutput v-if="activeComponent == 'RTGhome' && this.plannings && this.plannings.length!==0 && !this.createdPlanningData"  @createPlanning="handleCreatePlanning"/>
            <STShome v-if="activeComponent == 'STShome'"/>
            <RShome v-if="activeComponent == 'RShome'"/>
            <AMhome v-if="activeComponent == 'AMhome'"/>
            </div>
    </div>
    
  </template>

<script>
import { mapActions, mapGetters } from 'vuex';
import RTGPlanningOutput from '../Cranes/RTG-Crane/RTGPlanningOutput.vue';

export default {
    data(){
        return{
            activeComponent: 'RTGhome',
            plannings: null,
            createdPlanningData: null
        }
    },
    computed:{
        ...mapGetters(["getPlannings"])
    },

    mounted(){
        this.getCurrentPlanningMethod()
    },

    methods:{
        ...mapActions(["clearPlannings"]),
        updateActiveComponent(value){
            this.activeComponent = value
        },
        getCurrentPlanningMethod(){
            this.plannings = this.getPlannings
        },

        reset(){
            this.clearPlannings()
        },

        handleCreatePlanning(data){
            console.log(data)
            this.createdPlanningData = data
            console.log(JSON.stringify(this.createdPlanningData))
        }
    }
    
}

</script>

<style scoped>
.main{
    background-color: white;
    height: 100%;
}

.content{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
}


</style>