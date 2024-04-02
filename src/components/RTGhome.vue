<template>
  <div>
    <v-list lines="one">
      <v-list-item
        v-for="(item, index) in driversList"
        :key="index"
      >
     <div class="driver">
      <div class="name">
        {{ index }}
      </div>
      
       </div>
        </v-list-item>
      </v-list>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        driversList: [
          "driver1",
          "driver2",
          "driver3",
          "driver4",
          "driver5",
          "driver6",
        ],
        selectedDriver: []
      };
    },
  };
  </script>
  
  <style scoped>

  </style>
  
