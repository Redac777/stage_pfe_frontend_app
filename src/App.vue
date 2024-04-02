<template>
  <v-app>
    <v-main class="main">
      <div >
        <Loading v-if="load"/>
    </div>
    <div v-if="isLogged">
        <router-view></router-view>
    </div>
    <div v-else>
        <Login /> 
    </div>
    </v-main>
  </v-app>
</template>

<script>
import {mapGetters} from 'vuex'
import Login from './components/Login';
import Loading from './components/Loading';
export default {
    components: { Login, Loading},
    data(){
        return {
            isLogged:false,
            load:false
        }
    },
    computed:{
        ...mapGetters(["getUserActive","getLoadingValue"]),
    },
    watch: {
    getUserActive(newVal) {
      this.isLogged = newVal !== null;
    },
    getLoadingValue(val){
        this.load = val===true
    },
  },
    mounted(){
        if(this.getUserActive!=null){
            this.isLogged = true
        }
        else{
            this.$router.push('/')
        }
    }

}
  //
</script>
<style scoped>
.main{
  position: relative;
}
</style>
