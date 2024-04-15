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
      <!-- List stss with associated switches -->
      <div class="label-column">STSs</div>
      <div class="stss-container">
        <div
          v-for="(chunk, colIndex) in chunkedSTSs"
          :key="colIndex"
          class="column"
        >
          <div v-for="(item, rowIndex) in chunk" :key="rowIndex" class="sts">
            <div class="stsname">{{ item }}</div>
            <v-switch
              v-model="selectedSTSs"
              :value="item"
              hide-details
              @change="onChange(item)"
            ></v-switch>

            <!-- Dialog for adding sts time intervals -->
            <v-dialog
              v-model="dialog[item]"
              max-width="400"
              @click:outside="closeDialog(item)"
            >
              <v-card>
                <v-card-text
                  v-for="(interval, index) in intervals[item]"
                  :key="index"
                >
                  <v-text-field
                    label="Start Time"
                    v-model="interval.startTime"
                    type="time"
                    :rules="[
                      () => startTimeRule(interval.startTime, item, index),
                    ]"
                  ></v-text-field>
                  <v-text-field
                    label="End Time"
                    v-model="interval.endTime"
                    type="time"
                    :rules="[() => endsTimeRule(interval.endTime, item, index)]"
                  ></v-text-field>
                  <div
                    :class="
                      isAddIntervalButtonDisabled(item)
                        ? 'add-interval-button-disabled'
                        : 'add-interval-button'
                    "
                    @click="addIntervalBelow(item, index)"
                    v-if="index === intervals[item].length - 1"
                  >
                    <v-icon color="white">mdi-plus</v-icon>
                  </div>
                </v-card-text>
                <v-card-actions>
                  <v-btn
                    color="primary"
                    @click="saveDialog(item)"
                    :disabled="isSaveButtonDisabled(item)"
                    :class="{ 'disabled-button': isSaveButtonDisabled(item) }"
                    >Save</v-btn
                  >
                  <v-btn @click="closeDialog(item, false)">Close</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </div>
        </div>
      </div>
    </div>
    <!-- Start Button -->
    <div class="start-button">
      <v-btn
        @click="openSelectionDialog"
        density="default"
        style="background-color: #15263f; color: white; width: 120px"
        >Start</v-btn
      >
    </div>
    <SelectionDialog equipementType="STS" v-model="showValidateDialog" @validateSelections="getData" @removeDriver="removeDriver" @removeEquipement="removeEquipement" :selectedDrivers="selectedDrivers"  :intervals="intervals" :selectedEqus="selectedSTSs" @closeDialog="showValidateDialog = false" />
  </div>
</template>

<script>
import SelectionDialog from "./ValidateDialog.vue";
import { mapGetters, mapActions } from "vuex";
export default {
  components: {
    SelectionDialog
  },
  data() {
    return {
      minTimeIndex: -1,
      driversList: [],
      stssList: [
      ],
      selectedDrivers: [],
      selectedSTSs: [],
      intervals: {},
      dialog: {}, // Object to store dialog state for each STS
      startTime: "",
      endTime: "",
      respectedStart: false,
      respectedEnd: false,
      showValidateDialog: false
    };
  },
  computed: {
    ...mapGetters(["getDrivers","getEquipements"]),
    isSaveButtonDisabled() {
      return (item) => {
        if (this.intervals[item]) {
          const isValidIntervals = this.intervals[item].every((interval, i) => {
            if (i === 0) {
              // For the first interval, there's no previous interval to compare with
              return true;
            } else {
              // For subsequent intervals, compare with the previous interval's end time
              const previousInterval = this.intervals[item][i - 1];
              return (
                interval.startTime >= previousInterval.endTime &&
                interval.startTime < interval.endTime
              );
            }
          });
          // Check if any interval is empty
          return (
            this.intervals[item].some(
              (interval) => interval.startTime === "" || interval.endTime === ""
            ) ||
            !this.respectedStart ||
            !this.respectedEnd ||
            !isValidIntervals
          );
        }
        return true; // Disable if intervals are not defined
      };
    },
    isAddIntervalButtonDisabled() {
      return (item) => {
        if (this.intervals[item]) {
          // Check if any interval is empty
          const isValidIntervals = this.intervals[item].every((interval, i) => {
            if (i === 0) {
              // For the first interval, there's no previous interval to compare with
              return true;
            } else {
              // For subsequent intervals, compare with the previous interval's end time
              const previousInterval = this.intervals[item][i - 1];
              return (
                interval.startTime >= previousInterval.endTime &&
                interval.startTime < interval.endTime
              );
            }
          });
          return (
            this.intervals[item].some(
              (interval) => interval.startTime === "" || interval.endTime === ""
            ) ||
            !this.respectedStart ||
            !this.respectedEnd ||
            !isValidIntervals ||
            this.intervals[item][this.intervals[item].length - 1].endTime ==
              "15:00"
          );
        }
        return true; // Disable if intervals are not defined
      };
    },
    // returns array of 6 drivers per chunk
    chunkedDrivers() {
      return this.chunkArray(this.driversList, 6);
    },

    // returns array of 6 stss per chunk
    chunkedSTSs() {
      return this.chunkArray(this.stssList, 6);
    },
  },
    mounted() {
      this.setData();
    },
  methods: {
    ...mapActions(["setDriversAction", "setLoadingValueAction","setEquipementsAction"]),
    setData() {
      const inputs = {
        profile_group: "sts",
        role: "driver",
      };
      this.setLoadingValueAction(true);
      this.setDriversAction(inputs).then((response) => {
        this.driversList = this.getDrivers.map(
          (driver) => driver.firstname + " " + driver.lastname
        );
      });
      this.setEquipementsAction().then(() => {
        this.setLoadingValueAction(false);
        this.stssList = this.getEquipements.filter((equipement) => equipement.profile_group.type==="sts").map((equipement) => equipement.matricule);
      })
    },
    addIntervalBelow(item, index) {
      const currentIntervals = this.intervals[item];

      // Check if there are any existing intervals
      const hasIntervals = currentIntervals.some(
        (interval) => interval.startTime !== "" && interval.endTime !== ""
      );

      // Check if the start and end times are respected
      const areTimesRespected = this.respectedStart && this.respectedEnd;

      // Check if all existing intervals have start times before end times
      const isValidIntervals = currentIntervals.every((interval, i) => {
        if (i === 0) {
          // For the first interval, there's no previous interval to compare with
          return true;
        } else {
          // For subsequent intervals, compare with the previous interval's end time
          const previousInterval = currentIntervals[i - 1];
          return (
            interval.startTime >= previousInterval.endTime &&
            interval.startTime < interval.endTime
          );
        }
      });

      // Check if the end time of the last interval is before 15:00
      const isEndTimeBefore15 =
        currentIntervals.length === 0 ||
        currentIntervals[currentIntervals.length - 1].endTime < "15:00";

      // Check if all conditions are met
      if (
        hasIntervals &&
        areTimesRespected &&
        isValidIntervals &&
        isEndTimeBefore15
      ) {
        // Add a new interval
        this.intervals[item].splice(index + 1, 0, {
          startTime: "",
          endTime: "",
        });
      }
    },

    // define time validation for start time
    startTimeRule(value, item, index) {
      // Reset respected to true at the beginning
      this.respectedStart = true;
      if (value < "07:00") {
        this.respectedStart = false;
        return "07:00 <= interval";
      }

      if (index === 0) {
        return true;
      }

      const keys = Object.keys(this.intervals);
      const indexX = keys.indexOf(item);
      const previousItem = this.intervals[keys[indexX]][index - 1];
      if (value < previousItem.endTime) {
        this.respectedStart = false;
        return "Start time > Previous end time !!";
      }
      return true;
    },
    endsTimeRule(value, item, index) {
      // Reset respected to true at the beginning
      this.respectedEnd = true;

      if (value > "15:00") {
        this.respectedEnd = false;
        return "interval <= 15:00";
      }

      if (value < this.intervals[item][index].startTime) {
        this.respectedEnd = false;
        return "Ends Time > Start Time !!";
      }

      return true;
    },

    // splits array into chunks of size
    chunkArray(arr, size) {
      return arr.reduce(
        (acc, _, i) =>
          i % size === 0 ? [...acc, arr.slice(i, i + size)] : acc,
        []
      );
    },
    // returns selected drivers and stss
    getData() {
      console.log("Selected drivers : " + this.selectedDrivers);
      console.log("Selected STSs : " + JSON.stringify(this.intervals));
      this.showValidateDialog = false;
    },
    // switch on change state
    onChange(item) {
      if (this.selectedSTSs.includes(item)) {
        this.openDialog(item);
      } else {
        this.selectedSTSs = this.selectedSTSs.filter((sts) => sts !== item);
        delete this.intervals[item];
      }
    },
    //open sts intervals dialog
    openDialog(item) {
      if (!this.intervals) {
        this.intervals = {};
      }
      if (!this.intervals[item]) {
        this.intervals[item] = [{ startTime: "", endTime: "" }];
      }
      this.dialog[item] = true;
    },

    // save sts intervals
    saveDialog(item) {
      this.intervalsSaved = true;
      this.closeDialog(item, true);
    },

    // close sts intervals dialog
    closeDialog(item, value) {
      if (!value) {
        this.selectedSTSs = this.selectedSTSs.filter((sts) => sts !== item);
        delete this.intervals[item];
      }
      this.dialog[item] = false;
    },
    removeDriver(driver) {
      this.selectedDrivers = this.selectedDrivers.filter((item) => item !== driver);
    },
    removeEquipement(equ){
      this.selectedSTSs = this.selectedSTSs.filter((sts) => sts !== equ);
      delete this.intervals[equ];
    },
    openSelectionDialog() {
      this.showValidateDialog = true;
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
.stss-container {
  display: flex;
  gap: 2rem;
}
.column {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.driver,
.sts {
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
.stsname {
  font-size: 0.9rem;
  font-weight: bold;
}
.add-interval-button {
  margin: auto;
  display: flex;
  justify-content: center;
  align-items: center;

  height: 3rem;
  background-color: #1867c0;
  cursor: pointer;
}
.add-interval-button-disabled {
  margin: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 3rem;
  cursor: not-allowed;
  background-color: #1867c0;
  opacity: 0.6;
}

.v-card-actions {
  display: flex;
  justify-content: end;
  align-items: center;
}
.disabled-button {
  cursor: not-allowed;
}
.label-column {
  writing-mode: vertical-rl; /* Écriture verticale */
  text-align: center; /* Alignement horizontal */
  font-weight: bold;
  font-size: 1.2rem;
  transform: rotate(180deg);
}
</style>
