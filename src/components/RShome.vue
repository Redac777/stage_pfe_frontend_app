<template>
    <div class="main-parent">
      <div class="parent">

        <!-- List drivers with associated switches -->
        <div class="drivers-container">
          <div v-for="(chunk, colIndex) in chunkedDrivers" :key="colIndex" class="column">
            <div v-for="(item, rowIndex) in chunk" :key="rowIndex" class="driver">
              <div class="name">{{ item }}</div>
              <v-switch v-model="selectedDrivers" :value="item" hide-details></v-switch>
            </div>
          </div>
        </div>
        <!-- List rss with associated switches -->
        <div class="rss-container">
          <div v-for="(chunk, colIndex) in chunkedRSs" :key="colIndex" class="column">
            <div v-for="(item, rowIndex) in chunk" :key="rowIndex" class="rs">
              <div class="name">{{ item }}</div>
              <v-switch v-model="selectedRSs" :value="item" hide-details @change="onChange(item)"></v-switch>

              <!-- Dialog for adding rs time intervals -->
              <v-dialog v-model="dialog[item]" max-width="400">

                <v-card
        text="Define STS as SBY ?"
      >
        <template v-slot:actions>
          <v-spacer></v-spacer>

          <v-btn @click="confirm(false,item)">
            Disagree
          </v-btn>

          <v-btn @click="confirm(true,item)">
            Agree
          </v-btn>
        </template>
      </v-card>

              </v-dialog>
                
                
            </div>
          </div>
        </div>
      </div>
      <!-- Start Button -->
      <div class="start-button">
        <v-btn @click="getData" density="default" style="background-color:#15263F ; color: white; width: 120px;">Start</v-btn>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        driversList: [
          "Driver1",
          "Driver2",
          "Driver3",
          "Driver4",
          "Driver5",
          "Driver6",
        ],
        rssList: [
          "RS1", "RS2", "RS3", "RS4", "RS5", "RS6", "RS7", "RS8",
          "RS9", "RS10", "RS11", "RS12", "RS13", "RS14", "RS15", "RS16",
          "RS17", "RS18", "RS19", "RS20", "RS21", "RS22"
        ],
        selectedDrivers: [],
        selectedRSs: [],
        rssStates:[],
        dialog: {}, // Object to store dialog state for each RS
        startTime: '',
        endTime: ''
      };
    },
    computed: {
      // returns array of 6 drivers per chunk
      chunkedDrivers() {
        return this.chunkArray(this.driversList, 6);
      },

      // returns array of 6 rss per chunk
      chunkedRSs() {
        return this.chunkArray(this.rssList, 6);
      },
    },
    methods: {
      // splits array into chunks of size
      chunkArray(arr, size) {
        return arr.reduce((acc, _, i) => (i % size === 0 ? [...acc, arr.slice(i, i + size)] : acc), []);
      },
      // returns selected drivers and rss      
      getData() {
        console.log("Selected drivers : " + this.selectedDrivers);
        console.log("Selected RSs : " + JSON.stringify(this.rssStates));
      },
      // switch on change state
      onChange(item) {
        const index = this.selectedRSs.indexOf(item);
        if(this.selectedRSs.length<=3){
          this.rssStates.push({
          rs:item,
          state:"works"
        })
          if(this.selectedRSs.length==3 && this.selectedRSs.includes(item)){
          this.dialog[item] = true;
        }
        }
        else{
          alert("RS number exceeded");
          this.selectedRSs.pop();
        }
        console.log(this.rssStates);
  },

    // confirm rs as sby
      confirm(value,item) {
        
        if(value){
          const index = this.rssStates.findIndex((c) => c.rs === item);
          if (index === -1) {
            this.rssStates.splice(index, 1);
          }
          else{
            this.rssStates[index].state = "sby";
          }
        }
        else{
          const index = this.selectedRSs.indexOf(item);
          if (index === -1) {
            this.selectedRSs.splice(index, 1);
          }
          delete this.selectedRSs.pop();
          delete this.rssStates.pop();
        }
        this.dialog[item] = false;
        console.log(this.selectedRSs);
      },
    },
  };
  </script>
  
  <style scoped>
  .main-parent {
    display: flex;
    width: fit-content;
    flex-direction: column;
    height: 88%;
    gap: 0.3rem;
  }
  .parent {
    display: flex;
    justify-content: center;
    gap: 6rem;
    width: 100%;
    height: fit-content;
  }
  .start-button {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    height: fit-content;
  }
  .drivers-container, .rss-container {
    display: flex;
    gap: 2rem;
  }
  .column {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  .driver, .rs {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem; /* Espacement entre les drivers */
  }
  .v-switch {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: x-small !important;
  }
  .name {
    font-size: 0.9rem;
    font-weight: bold;
    width: 30px;
  }
  </style>
  