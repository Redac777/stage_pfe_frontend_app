<template>
    <form class="mainPage" @submit.prevent="login">
      <v-img
        class="mx-auto my-12"
        max-width="128"
        src="../../assets/images/TA-logo.png"
      ></v-img>
  
      <v-card
        class="mx-auto pa-12 pb-8"
        elevation="8"
        max-width="448"
        rounded="lg"
      >
        <div class="text-subtitle-1 text-medium-emphasis">Matricule</div>
        <v-text-field
          density="compact"
          placeholder="Matricule"
          prepend-inner-icon="mdi-account-outline"
          variant="outlined"
          v-model="matricule"
          ref="matriculeInput"
          :autofocus="autofocus"
          required
        ></v-text-field>
        <div class="passwordZone">
          <div class="text-subtitle-1 text-medium-emphasis flex">
            Password
          </div>
          <div v-if="showCredError">
            <p class="error">
              {{this.showCredError}}
            </p>
          </div>
        </div>
        <v-text-field
          :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
          :type="visible ? 'text' : 'password'"
          density="compact"
          placeholder="Enter your password"
          prepend-inner-icon="mdi-lock-outline"
          variant="outlined"
          @click:append-inner="visible = !visible"
          v-model="password"
          required
        ></v-text-field>
        <v-btn
          class="mb-8"
          color="blue"
          size="large"
          variant="tonal"
          block
          type="submit"
        >
          Log In
        </v-btn>
      </v-card>
    </form>
  </template>
 <script>
 import {mapActions,mapGetters } from "vuex"
 export default {
   data() {
   return {
     visible:false,
     matricule:"",
     password:"",
     load:false,
     autofocus:true,
     error:"",
     showCredError:false
   }
   },
   mounted(){
       if (this.autofocus) {
       this.$refs.matriculeInput.focus();
       }
   },
   computed:{
       ...mapGetters(["getUserActive","getToken","getLoadingValue"])
   },
   watch: {
     getLoadingValue(val) {
     if(val===true)
       this.load=true
     else
       this.load=false
   },
   getUserActive(val){
       if(val===null)
       this.autofocus=true
   }
},
   methods:{
       ...mapActions(["LoginAction","setLoadingValueAction"]),
       login(){
           this.setLoadingValueAction(true);
           this.LoginAction({matricule:this.matricule,password:this.password})
               .then(user => {
                  //  console.log("User:", user.error);
                  if(user.error && user.error==="User is not active"){
                    this.showCredError = user.error;
                  }
                  else if(user.error && user.error==="Unauthorized"){
                    this.showCredError = "Matricule or Password incorrect";
                  }
                   console.log("Active user:", this.getUserActive);
                   this.redirectAfterLogin();
                   this.setLoadingValueAction(false);
       })
               .catch(error => {
                   this.showCredError=error.message
                   if(error=="TypeError: Cannot read properties of undefined (reading 'user')")
                   this.setLoadingValueAction(false);
       });
       },
       redirectAfterLogin(){
           this.$router.push('/dashboard');
        
       }

   }
}
 </script>
 <style scoped>
 .passwordZone{
  display: flex;
  align-items: center;
  justify-content: space-between;
 }
 .error{
  font-size: x-small;
  color: red;
 }
</style>

  