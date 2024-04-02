<template>
    <div>
      <v-list lines="one">
        <v-list-item
          v-for="(item, index) in driversList"
          :key="index"
        >
          <div class="driver-info">
            <!-- Driver title -->
            <div class="title">{{ item }}</div>
  
            <!-- Radio group with two radio buttons -->
            <div>
                <v-radio-group v-model="selectedDriver[index]" inline>
                    <div><v-radio label="Option 1" value="option1" class="radio-button"></v-radio></div>
                    <div><v-radio label="Option 2" value="option2" class="radio-button"></v-radio></div>
                </v-radio-group>
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
  .driver-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
  }
  .title{
    background-color: blue;
  }

  .v-list-item{
    background-color: red;
    display: flex;
    margin: 1rem 0;
    height: fit-content;
  }
  
.radio-button{
    background-color: green;
}
  .intcontent{
    width: 80%;
  }
  </style>
  