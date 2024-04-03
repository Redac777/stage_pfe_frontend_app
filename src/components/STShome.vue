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
        <!-- List stss with associated switches -->
        <div class="stss-container">
          <div v-for="(chunk, colIndex) in chunkedSTSs" :key="colIndex" class="column">
            <div v-for="(item, rowIndex) in chunk" :key="rowIndex" class="sts">
              <div class="name">{{ item }}</div>
              <v-switch v-model="selectedSTSs" :value="item" hide-details @change="onChange(item)"></v-switch>

              <!-- Dialog for adding sts time intervals -->
              <v-dialog v-model="dialog[item]" max-width="400">
                <v-card>
                    <v-card-text v-for="(interval, index) in intervals[item]" :key="index">
                        <v-text-field label="Start Time" v-model="interval.startTime" type="time"></v-text-field>
                        <v-text-field label="End Time" v-model="interval.endTime" type="time"></v-text-field>
                    </v-card-text>
                  <v-card-actions>
                    <v-btn color="primary" @click="addInterval(item)">Add Interval</v-btn>
                    <v-btn color="primary" @click="saveTime(item)">Save</v-btn>
                    <v-btn @click="dialog[item] = false">Close</v-btn>
                  </v-card-actions>
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
        stssList: [
          "STS1", "STS2", "STS3", "STS4", "STS5", "STS6", "STS7", "STS8",
          "STS9", "STS10", "STS11", "STS12", "STS13", "STS14", "STS15", "STS16",
          "STS17", "STS18", "STS19", "STS20", "STS21", "STS22"
        ],
        selectedDrivers: [],
        selectedSTSs: [],
        intervals:{},
        dialog: {}, // Object to store dialog state for each STS
        startTime: '',
        endTime: ''
      };
    },
    computed: {
      // returns array of 6 drivers per chunk
      chunkedDrivers() {
        return this.chunkArray(this.driversList, 6);
      },

      // returns array of 6 stss per chunk
      chunkedSTSs() {
        return this.chunkArray(this.stssList, 6);
      },
    },
    methods: {
      // splits array into chunks of size
      chunkArray(arr, size) {
        return arr.reduce((acc, _, i) => (i % size === 0 ? [...acc, arr.slice(i, i + size)] : acc), []);
      },
      // returns selected drivers and stss      
      getData() {
        console.log("Selected drivers : " + this.selectedDrivers);
        console.log("Selected STSs : " + JSON.stringify(this.intervals));
      },
      // switch on change state
      onChange(item) {
        if(this.selectedSTSs.includes(item)) {
            this.openDialog(item)
        }
        else{
            delete this.intervals[item];
        }
       
  },
  //open sts intervals dialog 
  openDialog(item) {
    // Set dialog state for the specific STS item to true
    this.dialog[item] = true;
    if (!this.intervals[item]) {
    this.intervals[item] = [{ startTime: '', endTime: '' }];
  }
  },
    // save sts intervals
      saveTime(item) {
        // Here you can handle saving the entered time intervals
        console.log(JSON.stringify(this.intervals))
        console.log("Time Intervals: " + JSON.stringify(this.intervals[item]));
        this.dialog[item] = false;
      },

      // add sts interval in dialog
      addInterval(item) {
        this.intervals[item].push({ startTime: '', endTime: '' });
      }
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
  .drivers-container, .stss-container {
    display: flex;
    gap: 2rem;
  }
  .column {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  .driver, .sts {
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
  }
  </style>
  