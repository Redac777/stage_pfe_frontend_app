<template>
  <div class="main-parent">
    <div class="parent">
      <!-- List drivers with associated switches -->
      <div class="label-column">Drivers</div>
      <div class="drivers-container">
        <div
          v-for="(chunk, colIndex) in chunkedDrivers"
          :key="colIndex"
          class="column"
        >
          <div v-for="(item, rowIndex) in chunk" :key="rowIndex" class="driver">
            <div class="drivername">{{ item }}</div>
            <v-switch
              v-model="selectedDrivers"
              :value="item"
              hide-details
            ></v-switch>
          </div>
        </div>
      </div>
      <!-- List rss with associated switches -->
      <div class="label-column">RSs</div>
      <div class="rss-container">
        <div
          v-for="(chunk, colIndex) in chunkedRSs"
          :key="colIndex"
          class="column"
        >
          <div v-for="(item, rowIndex) in chunk" :key="rowIndex" class="rs">
            <div class="rsname">{{ item }}</div>
            <v-switch
              v-model="selectedRSs"
              :value="item"
              hide-details
              @change="onChange(item)"
            ></v-switch>

            <!-- Dialog for adding rs time intervals -->
            <v-dialog v-model="dialog[item]" max-width="400">
              <v-card text="Define STS as SBY ?">
                <template v-slot:actions>
                  <v-spacer></v-spacer>

                  <v-btn @click="confirm(false, item)"> Disagree </v-btn>

                  <v-btn @click="confirm(true, item)"> Agree </v-btn>
                </template>
              </v-card>
            </v-dialog>
          </div>
        </div>
      </div>
    </div>
    <!-- Start Button -->
    <div class="start-button">
      <v-btn
        @click="getData"
        density="default"
        style="background-color: #15263f; color: white; width: 120px"
        >Start</v-btn
      >
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
export default {
  data() {
    return {
      driversList: [
      ],
      rssList: [
        "RS1",
        "RS2",
        "RS3",
        "RS4",
        "RS5",
        "RS6",
        "RS7",
        "RS8",
        "RS9",
        "RS10",
        "RS11",
        "RS12",
        "RS13",
        "RS14",
        "RS15",
        "RS16",
        "RS17",
        "RS18",
        "RS19",
        "RS20",
        "RS21",
        "RS22",
      ],
      selectedDrivers: [],
      selectedRSs: [],
      rssStates: [],
      dialog: {}, // Object to store dialog state for each RS
      startTime: "",
      endTime: "",
    };
  },
  computed: {
    ...mapGetters(["getDrivers"]),
    // returns array of 6 drivers per chunk
    chunkedDrivers() {
      return this.chunkArray(this.driversList, 6);
    },

    // returns array of 6 rss per chunk
    chunkedRSs() {
      return this.chunkArray(this.rssList, 6);
    },
  },
  mounted() {
    this.setDrivers();
  },
  methods: {
    ...mapActions(["setDriversAction", "setLoadingValueAction"]),
    setDrivers() {
      const inputs = {
        profile_group: "rs",
        role: "driver",
      };
      this.setLoadingValueAction(true);
      this.setDriversAction(inputs).then(() => {
        this.setLoadingValueAction(false);
        this.driversList = this.getDrivers.map(
          (driver) => driver.firstname + " " + driver.lastname
        );
      });
    },
    // splits array into chunks of size
    chunkArray(arr, size) {
      return arr.reduce(
        (acc, _, i) =>
          i % size === 0 ? [...acc, arr.slice(i, i + size)] : acc,
        []
      );
    },
    // returns selected drivers and rss
    getData() {
      console.log("Selected drivers : " + this.selectedDrivers);
      console.log("Selected RSs : " + this.selectedRSs);
      console.log("Selected RSs : " + JSON.stringify(this.rssStates));
    },
    // switch on change state
    onChange(item) {
      const index = this.selectedRSs.indexOf(item);
      if (index !== -1) {
        if (this.selectedRSs.length <= 3) {
          this.rssStates.push({
            rs: item,
            state: "works",
          });
          const index = this.rssStates.findIndex((c) => c.state === "sby");
          if (
            this.selectedRSs.length == 3 &&
            this.selectedRSs.includes(item) &&
            index === -1
          ) {
            this.dialog[item] = true;
          }
        } else {
          alert("RS number exceeded");
          this.selectedRSs = this.selectedRSs.filter((rs) => rs !== item);
          this.rssStates = this.rssStates.filter((c) => c.rs !== item);
        }
      } else {
        this.rssStates = this.rssStates.filter((c) => c.rs !== item);
      }
    },

    // confirm rs as sby
    confirm(value, item) {
      if (value) {
        const index = this.rssStates.findIndex((c) => c.rs === item);
        if (index === -1) {
          this.rssStates.splice(index, 1);
        } else {
          this.rssStates[index].state = "sby";
        }
      } else {
        const index = this.selectedRSs.indexOf(item);
        if (index === -1) {
          this.selectedRSs.splice(index, 1);
        } else {
          this.selectedRSs = this.selectedRSs.filter((rs) => rs !== item);
          this.rssStates = this.rssStates.filter((c) => c.rs !== item);
        }
      }
      this.dialog[item] = false;
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
  gap: 2rem;
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
.drivers-container,
.rss-container {
  display: flex;
  gap: 2rem;
}
.column {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.driver,
.rs {
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
.drivername {
  font-size: 0.9rem;
  font-weight: bold;
  width: 100px;
}
.rsname{
  font-size: 0.9rem;
  font-weight: bold;
}
.label-column {
  writing-mode: vertical-rl; /* Écriture verticale */
  text-align: center; /* Alignement horizontal */
  font-weight: bold;
  font-size: 1.2rem;
  transform: rotate(180deg);
}
</style>
