<template>
    <div class="main">
            <div class="content">
            <DashboardNavigation @updateActiveComponent="updateActiveComponent"/>
            <RTGhome v-if="activeComponent == 'RTGhome'" />
            <STShome v-if="activeComponent == 'STShome'"/>
            <RShome v-if="activeComponent == 'RShome'"/>
            <AMhome v-if="activeComponent == 'AMhome'"/>
            </div>
    </div>
    
  </template>

<script>
export default {
    data(){
        return{
            activeComponent: 'RTGhome',
        }
    },
    methods:{
        updateActiveComponent(value){
            this.activeComponent = value
        }
    }
    
}

</script>

<style scoped>
.main{
    background-color: white;
    height: 100%;
}

.right{
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}
.content{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}


</style>