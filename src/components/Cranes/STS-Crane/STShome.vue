<template>
  <div class="main-parent">
    <div class="header">
      <h2>Current Shift: {{ actualShift }}</h2>
      <p>Today's Date: {{ todayDate }}</p>
    </div>
    <div class="parent">
      <!-- List drivers with associated switches -->
      <div class="resources">
        <div class="label-column">Drivers</div>
        <div class="selectAll">
          <label class="drivername">Select All</label>
          <v-switch
            v-model="selectAll"
            @change="toggleSelectAll"
            hide-details
          ></v-switch>
        </div>
        <hr class="hr" />
        <div class="drivers-container">
          <div
            v-for="(chunk, colIndex) in chunkedDrivers"
            :key="colIndex"
            class="column"
          >
            <div
              v-for="(item, rowIndex) in chunk"
              :key="rowIndex"
              class="driver"
            >
              <div class="drivername">
                {{ item.firstname + " " + item.lastname }}
              </div>
              <v-switch
                v-model="selectedDrivers"
                :value="item"
                hide-details
              ></v-switch>
            </div>
          </div>
        </div>
      </div>
      <!-- List stss with associated switches -->
      <div class="resources">
        <div class="label-column">STSs</div>
        <div class="selectAll">
          <label class="stsname">Select All</label>
          <v-switch
            v-model="selectAllSTSs"
            @change="toggleSelectAllSTSs"
            hide-details
          ></v-switch>
        </div>
        <hr class="hr" />
        <div class="stss-container">
          <div
            v-for="(chunk, colIndex) in chunkedSTSs"
            :key="colIndex"
            class="column"
          >
            <div v-for="(item, rowIndex) in chunk" :key="rowIndex" class="sts">
              <div
                class="stsname"
                @click="openDialog(item)"
                @mouseover="showIcons[item.matricule] = true"
                @mouseleave="showIcons[item.matricule] = false"
              >
                <span
                  :class="{
                    'blue-text': hasIntervals(item),
                    'green-text': includedWoutIntOrWork(item),
                  }"
                  >{{ item.matricule }}</span
                >
              </div>
              <v-switch
                v-model="selectedSTSs"
                :value="item"
                hide-details
                @change="onChange(item)"
              ></v-switch>
              <v-icon
                v-if="showIcons[item.matricule] == true"
                :class="{
                  'timer-icon-blue': !includedWoutIntOrWork(item),
                  'timer-icon-green': includedWoutIntOrWork(item),
                }"
                @click="openDialog(item)"
                >mdi-timer</v-icon
              >

              <!-- Dialog for adding sts time intervals -->
              <v-dialog
                v-model="dialog[item.matricule]"
                max-width="400"
                @click:outside="closeDialog(item)"
              >
                <v-card>
                  <v-card-text
                    v-for="(interval, index) in intervals[item.matricule]"
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
                      :rules="[
                        () => endsTimeRule(interval.endTime, item, index),
                      ]"
                    ></v-text-field>
                    <div
                      :class="
                        isAddIntervalButtonDisabled(item)
                          ? 'add-interval-button-disabled'
                          : 'add-interval-button'
                      "
                      @click="addIntervalBelow(item, index)"
                      v-if="index === intervals[item.matricule].length - 1"
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
    </div>

    <!-- Create Button -->
    <div class="create-button">
      <v-btn
        @click="openConfirmDialog"
        density="default"
        style="background-color: #15263f; color: white; width: 120px"
        >Create</v-btn
      >
    </div>

    <!-- Confirm Dialog -->
    <ConfirmDialog
      equipementType="STS"
      v-model="showConfirmDialog"
      @validateSelections="createPlanning"
      @removeDriver="removeDriver"
      @removeEquipement="removeEquipement"
      :selectedDrivers="selectedDrivers"
      :intervals="intervals"
      :selectedEqus="keysArray"
      @closeDialog="showConfirmDialog = false"
    />
  </div>
</template>

<script>
import ConfirmDialog from "../ConfirmDialog.vue";
import moment from "moment";
import { mapGetters, mapActions } from "vuex";

export default {
  components: {
    ConfirmDialog,
  },

  //data
  data() {
    return {
      minTimeIndex: -1,
      driversList: [],
      stssList: [],
      selectedDrivers: [],
      selectedSTSs: [],
      intervals: {},
      dialog: {}, // Object to store dialog state for each STS
      startTime: "",
      endTime: "",
      respectedStart: false,
      respectedEnd: false,
      showConfirmDialog: false,
      showIcons: {},
      isSaved: {},
      keysArray: [],
      shiftId: null,
      profileGroupId: null,
      selectAll: false,
      selectAllSTSs: false,
      actualShift: null,
      todayDate: '',
      inputs: null,
    };
  },

  //computed
  computed: {
    //include getters
    ...mapGetters(["getDrivers", "getEquipements"]),

    //sts item color based on intervals

    includedWoutIntOrWork() {
      return (item) => {
        return (
          this.selectedSTSs.includes(item) && !this.isSaved[item.matricule]
        );
      };
    },
    //sts icon color based on intervals
    hasIntervals() {
      return (item) => {
        return !!this.intervals[item.matricule];
      };
    },

    //save Button state
    isSaveButtonDisabled() {
      return (item) => {
        if (this.intervals[item.matricule]) {
          const isValidIntervals = this.intervals[item.matricule].every(
            (interval, i) => {
              if (i === 0) {
                // For the first interval, there's no previous interval to compare with
                return true;
              } else {
                // For subsequent intervals, compare with the previous interval's end time
                const previousInterval = this.intervals[item.matricule][i - 1];
                return (
                  interval.startTime >= previousInterval.endTime &&
                  interval.startTime < interval.endTime
                );
              }
            }
          );
          // Check if any interval is empty
          return (
            this.intervals[item.matricule].some(
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
    // add interval button state
    isAddIntervalButtonDisabled() {
      return (item) => {
        if (this.intervals[item.matricule]) {
          // Check if any interval is empty
          const isValidIntervals = this.intervals[item.matricule].every(
            (interval, i) => {
              if (i === 0) {
                // For the first interval, there's no previous interval to compare with
                return true;
              } else {
                // For subsequent intervals, compare with the previous interval's end time
                const previousInterval = this.intervals[item.matricule][i - 1];
                return (
                  interval.startTime >= previousInterval.endTime &&
                  interval.startTime < interval.endTime
                );
              }
            }
          );
          return (
            this.intervals[item.matricule].some(
              (interval) => interval.startTime === "" || interval.endTime === ""
            ) ||
            !this.respectedStart ||
            !this.respectedEnd ||
            !isValidIntervals ||
            this.intervals[item.matricule][
              this.intervals[item.matricule].length - 1
            ].endTime == "15:00"
          );
        }
        return true; // Disable if intervals are not defined
      };
    },

    // returns array of 6 drivers per chunk
    chunkedDrivers() {
      return this.chunkArray(this.driversList, 4);
    },

    // returns array of 6 stss per chunk
    chunkedSTSs() {
      return this.chunkArray(this.stssList, 4);
    },
  },

  //mounted
  mounted() {
    this.setData();
    this.setIsSaved();
  },

  //methods
  methods: {
    ...mapActions([
      "setDriversAction",
      "setLoadingValueAction",
      "setEquipementsAction",
      "createPlanningAction",
      "addUserToPlanning",
      "addEquipementToPlanning",
      "addEquipementWorkingHoursToPlanning",
      "setShiftByCategory"
    ]),

    toggleSelectAll() {
      if (this.selectAll) {
        this.selectAllDrivers();
      } else {
        this.deselectAllDrivers();
      }
    },
    selectAllDrivers() {
      this.selectedDrivers = [];
      this.chunkedDrivers.forEach((chunk) => {
        chunk.forEach((driver) => {
          if (!this.selectedDrivers.includes(driver)) {
            this.selectedDrivers.push(driver);
          }
        });
      });
    },
    deselectAllDrivers() {
      this.selectedDrivers = [];
    },

    toggleSelectAllSTSs() {
      if (this.selectAllSTSs) {
        this.selectAllSTSsList();
      } else {
        this.deselectAllSTSsList();
      }
    },
    selectAllSTSsList() {
      this.selectedSTSs = [];
      this.chunkedSTSs.forEach((chunk) => {
        chunk.forEach((sts) => {
          if (!this.selectedSTSs.includes(sts)) {
            this.selectedSTSs.push(sts);
          }
        });
      });
    },
    deselectAllSTSsList() {
      this.selectedSTSs = [];
    },

    //set drivers and equipements data
    async setData() {
      const today = new Date();
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      this.todayDate = today.toLocaleDateString(undefined, options);
      this.actualShift = this.getActualShift();
        const response = await this.setShiftByCategory({
          category: this.actualShift,
        });
        this.inputs = {
          profile_group: "sts",
          role: "driver",
          shift_id: response[0].id,
        };
      this.setLoadingValueAction(true);
      this.setDriversAction(this.inputs).then((response) => {
        this.driversList = this.getDrivers;
        if (this.driversList.length > 0) {
          this.shiftId = this.driversList[0].shift_id;
        }
      });
      this.setEquipementsAction().then(() => {
        this.setLoadingValueAction(false);
        this.stssList = this.getEquipements.filter(
          (equipement) => equipement.profile_group.type === "sts"
        );
        if (this.stssList.length > 0) {
          this.profileGroupId = this.stssList[0].profile_group.id;
        }
      });
    },

    //if sts intervals are saved
    setIsSaved() {
      for (let sts in this.stssList) {
        this.isSaved[sts.matricule] = false;
      }
    },

    // add interval below
    addIntervalBelow(item, index) {
      const currentIntervals = this.intervals[item.matricule];

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
        this.intervals[item.matricule].splice(index + 1, 0, {
          startTime: "",
          endTime: "",
        });
      }
    },

    // define time validation for start time
    startTimeRule(value, item, index) {
      // Reset respected to true at the beginning
      this.respectedStart = true;
      if (value < "07:00" || value > "15:00") {
        this.respectedStart = false;
        return "07:00 <= interval <= 15:00";
      }

      if (index === 0) {
        return true;
      }

      const keys = Object.keys(this.intervals);
      const indexX = keys.indexOf(item.matricule);
      const previousItem = this.intervals[keys[indexX]][index - 1];
      if (value < previousItem.endTime) {
        this.respectedStart = false;
        return "Start time > Previous end time !!";
      }
      return true;
    },

    // define time validation for end time
    endsTimeRule(value, item, index) {
      // Reset respected to true at the beginning
      this.respectedEnd = true;

      if (value > "15:00") {
        this.respectedEnd = false;
        return "interval <= 15:00";
      }

      if (value < this.intervals[item.matricule][index].startTime) {
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
    createPlanning() {
      let usersAddedSuccessfully = [];
      let equAddedSuccessfully = [];
      this.showConfirmDialog = false;
      this.setLoadingValueAction(true);
      const planning = {
        shift_id: this.shiftId,
        profile_group_id: this.profileGroupId,
      };
      this.createPlanningAction(planning).then((response) => {
        for (let driver in this.selectedDrivers) {
          let userWPlanning = {
            user_id: this.selectedDrivers[driver].id,
            planning_id: response.id,
          };
          this.addUserToPlanning(userWPlanning).then(() => {
            usersAddedSuccessfully.push(this.selectedDrivers[driver]);
          });
        }

        for (let equ in this.keysArray) {
          let equWPlanning = {
            equipement_id: this.selectedSTSs[equ].id,
            planning_id: response.id,
          };
          this.addEquipementToPlanning(equWPlanning).then((response) => {
            console.log("STS : " + this.selectedSTSs[equ].matricule);
            for (let interval in this.intervals[
              this.selectedSTSs[equ].matricule
            ]) {
              let intervalWPlanning = {
                equipement_planning_id: response.id,
                start_time:
                  this.intervals[this.selectedSTSs[equ].matricule][interval]
                    .startTime,
                end_time:
                  this.intervals[this.selectedSTSs[equ].matricule][interval]
                    .endTime,
              };
              this.addEquipementWorkingHoursToPlanning(intervalWPlanning).then(
                (response) => {
                  console.log(response);
                }
              );
            }

            equAddedSuccessfully.push(this.selectedSTSs[equ]);
          });
        }

        this.setLoadingValueAction(false);
        console.log(usersAddedSuccessfully);
        console.log(equAddedSuccessfully);
      });
      this.showConfirmDialog = false;
    },

    // switch on change state
    onChange(item) {
      if (!this.selectedSTSs.includes(item)) {
        this.selectedSTSs = this.selectedSTSs.filter(
          (sts) => sts.matricule !== item.matricule
        );
        delete this.intervals[item.matricule];
        this.isSaved[item.matricule] = false;
      }
    },

    //open sts intervals dialog
    openDialog(item) {
      if (!this.intervals) {
        this.intervals = {};
      }
      if (!this.intervals[item.matricule]) {
        this.intervals[item.matricule] = [{ startTime: "", endTime: "" }];
      }
      this.dialog[item.matricule] = true;
    },

    // save sts intervals
    saveDialog(item) {
      this.isSaved[item.matricule] = true;
      this.selectedSTSs.push(item);
      this.closeDialog(item, true);
    },

    // close sts intervals dialog
    closeDialog(item, value) {
      if (!value) {
        if (
          !this.selectedSTSs.includes(item) ||
          !this.isSaved[item.matricule]
        ) {
          this.selectedSTSs = this.selectedSTSs.filter(
            (sts) => sts.matricule !== item.matricule
          );
          delete this.intervals[item.matricule];
        } else {
          if (
            this.intervals[item.matricule][0].startTime === "" &&
            this.intervals[item.matricule][0].endTime === ""
          ) {
            this.selectedSTSs = this.selectedSTSs.filter(
              (sts) => sts.matricule !== item.matricule
            );
            delete this.intervals[item.matricule];
          } else if (
            this.intervals[item.matricule][
              this.intervals[item.matricule].length - 1
            ].startTime === "" ||
            this.intervals[item.matricule][
              this.intervals[item.matricule].length - 1
            ].endTime === ""
          ) {
            this.intervals[item.matricule].pop();
          }
        }
      }
      this.dialog[item.matricule] = false;
    },

    // remove driver from confirm dialog
    removeDriver(driver) {
      this.selectedDrivers = this.selectedDrivers.filter(
        (item) => item !== driver
      );
    },

    // remove equipment from confirm dialog
    removeEquipement(equ) {
      this.selectedSTSs = this.selectedSTSs.filter(
        (sts) => sts.matricule !== equ
      );
      delete this.intervals[equ];
      this.keysArray = Object.keys(this.intervals);
    },

    // open confirm dialog
    openConfirmDialog() {
      this.selectedSTSs = this.selectedSTSs.filter((sts) => {
        return (
          this.intervals[sts.matricule] &&
          this.intervals[sts.matricule].length > 0 &&
          (this.intervals[sts.matricule][
            this.intervals[sts.matricule].length - 1
          ].startTime !== "" ||
            this.intervals[sts.matricule][
              this.intervals[sts.matricule].length - 1
            ].endTime !== "")
        );
      });
      if (this.selectedSTSs.length !== this.chunkedSTSs.length)
        this.selectAllSTSs = false;
      this.keysArray = Object.keys(this.intervals).filter(
        (key) =>
          this.intervals[key].length !== 0 &&
          this.intervals[key][0].startTime !== "" &&
          this.intervals[key][0].endTime !== ""
      );
      this.showConfirmDialog = true;
    },
    getActualShift() {
      let thisDate = new Date("2022-02-10T07:00:00");
      let nowDate = new Date();
      let shift = ["D", "A", "B", "C"];
      let momentDate = moment(thisDate);
      while (momentDate.add(72, "hours").toDate() < nowDate) {
        shift = this.shiftArrays(shift);
      }
      if (nowDate.getHours() >= 7 && nowDate.getHours() < 15) return shift[0];
      else if (nowDate.getHours() >= 15 && nowDate.getHours() < 23)
        return shift[1];
      else if (
        nowDate.getHours() == 23 ||
        (nowDate.getHours() >= 0 && nowDate.getHours() < 7)
      )
        return shift[2];
    },
    shiftArrays(array) {
      let c = "";
      c = array[3];
      array[3] = array[2];
      array[2] = array[1];
      array[1] = array[0];
      array[0] = c;

      return array;
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
  margin-top: 1rem;
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  width: fit-content;
  height: fit-content;
}

.create-button {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  height: fit-content;
  margin-top: 0.5rem;
}

.drivers-container,
.stss-container {
  display: flex;
  gap: 1rem;
}

.column {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.driver {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 120px;
  margin: 0 0.6rem;
  flex-wrap: wrap;
}
.sts {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.4rem;
  margin: 0 0.6rem;
  flex-wrap: wrap;
  position: relative;
}

.selectAll {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 120px;
  margin: 0.8rem 0.6rem;
}
.v-switch {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: x-small !important;
}

.drivername,
.stsname {
  font-size: 0.75rem;
  font-weight: bold;
  width: fit-content;
}

.stsname {
  cursor: pointer;
}

.stsname:hover {
  color: #1867c0;
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
  text-align: center; /* Alignement horizontal */
  font-weight: bold;
  font-size: 1.2rem;
}

.resources {
  display: flex;
  flex-direction: column;
  border: 1px solid #ddd; /* Light gray border */
  border-radius: 8px; /* Rounded corners */
  padding: 20px;
}

.hr {
  border: 1px solid #ddd;
}

.timer-icon-blue {
  position: absolute;
  top: 12px; /* Ajustez la position verticale selon vos besoins */
  left: -12px; /* Ajustez la position horizontale selon vos besoins */
  font-size: small;
  color: #1867c0;
}

.timer-icon-green {
  position: absolute;
  top: 12px; /* Ajustez la position verticale selon vos besoins */
  left: -12px; /* Ajustez la position horizontale selon vos besoins */
  font-size: small;
  color: #2e7d32;
}

.blue-text {
  color: #1867c0;
}

.green-text {
  color: #2e7d32;
}
.header {
  background-color: #f5f5f5; /* Light gray background */
  border-bottom: 2px solid #ccc; /* Bottom border */
  padding: 5px 10px; /* Padding for spacing */
  text-align: center; /* Center align the text */
  font-size: 0.7rem; /* Increase font size */
  font-weight: bold; /* Bold text */
  margin-bottom: 0.2rem; /* Space below the header */
}
</style>
