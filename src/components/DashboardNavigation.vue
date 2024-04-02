<template>
    <div class="intcontent">
        <v-btn rounded="lg" @click="select(1)" :style="{ color:'white',backgroundColor: selected!=1 ? 'rgba(21, 38, 63, 0.2)' : '#15263F' }">RTG</v-btn>
        <v-btn rounded="lg" @click="select(2)" :style="{ color:'white',backgroundColor: selected!=2 ? 'rgba(16, 69, 25, 0.2)' : '#104519' }">STS</v-btn>
        <v-btn rounded="lg" @click="select(3)" :style="{ color:'white',backgroundColor: selected!=3 ? 'rgba(69, 16, 16, 0.2)' : '#451010' }">RS</v-btn>
        <v-btn rounded="lg" @click="select(4)" :style="{ color:'white',backgroundColor: selected!=4 ? 'rgba(99, 8, 95, 0.2)' : '#63085F' }">AM</v-btn>
    </div>
</template>

<script>
    export default {
        data(){
            return{
                selected:1
            }
        },
        methods:{
            select(x){
                this.selected = x
            }
        }
    }
</script>

<style scoped>
.intcontent{
    display: flex;
    width: 60%;
    gap: 5%;
    justify-content: center;
    align-items: center;
    height: 12vh;
}

</style>