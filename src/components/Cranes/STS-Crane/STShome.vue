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
  props: {
    stsplanningData: {
      type: Object,
      default: null,
    },
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
      todayDate: "",
      inputs: null,
      shift: [
        "15:00-16:00",
        "16:00-17:00",
        "17:00-18:00",
        "18:00-19:00",
        "19:00-20:00",
        "20:00-21:00",
        "21:00-22:00",
        "22:00-23:00",
      ],
      planningId: -1,
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
      return this.chunkArray(this.driversList, 6);
    },

    // returns array of 6 stss per chunk
    chunkedSTSs() {
      return this.chunkArray(this.stssList, 6);
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
      "setShiftByCategory",
      "createSTSPlanningAction",
      "setBoxAction",
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
      const options = { year: "numeric", month: "long", day: "numeric" };
      this.todayDate = today.toLocaleDateString(undefined, options);
      this.setLoadingValueAction(true);
      if (this.stsplanningData) {
        console.log(JSON.stringify(this.stsplanningData));
        this.actualShift = this.stsplanningData.shift;
        const dateToPlan = new Date(this.stsplanningData.date);
        this.todayDate = dateToPlan.toLocaleDateString(undefined, options);
        const response = await this.setShiftByCategory({
          category: this.stsplanningData.shift,
        });
        // console.log(this.stsplanningData);
        this.inputs = {
          profile_group: "sts",
          role: "driver",
          shift_id: response[0].id,
        };
      } else {
        this.actualShift = this.getActualShift();
        console.log(this.getActualShift());
        const response = await this.setShiftByCategory({
          category: this.actualShift,
        });
        this.inputs = {
          profile_group: "sts",
          role: "driver",
          shift_id: response[0].id,
        };
      }

      // console.log(this.inputs);

      this.setDriversAction(this.inputs).then(() => {
        this.driversList = this.getDrivers;
        if (this.driversList.length > 0) {
          this.shiftId = this.driversList[0].shift_id;
        }
      });
      this.setEquipementsAction().then(() => {
        
        this.stssList = this.getEquipements.filter(
          (equipement) => equipement.profile_group.type === "sts"
        );
        this.setLoadingValueAction(false);
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
        currentIntervals[currentIntervals.length - 1].endTime < "23:00";

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
      if (value < "15:00" || value > "23:00") {
        this.respectedStart = false;
        return "15:00 <= interval <= 23:00";
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

      if (value > "23:00") {
        this.respectedEnd = false;
        return "interval <= 23:00";
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
      this.showConfirmDialog = false;
      this.setLoadingValueAction(true);
      const outputs = [];
      Object.keys(this.intervals).forEach((key) => {
        const keyIntervals = [];
        this.intervals[key].forEach((interval) => {
          const intervalHourly = this.splitIntoHourlyIntervals(interval);
          intervalHourly.forEach((interv) => {
            keyIntervals.push(interv);
          });
        });
        outputs.push({
          matricule: key,
          intervals: keyIntervals,
          length: keyIntervals.length,
        });
        outputs.sort((a, b) => b.length - a.length);
      });
      const planning = {
        shift_id: this.shiftId,
        profile_group_id: this.profileGroupId,
      };
      this.createSTSPlanningAction(planning).then((response) => {
        let userPromises = [];
        let equipementPromises = [];
        let usersAddedSuccessfully = [];
        let equAddedSuccessfully = [];
        this.planningId = response.id;
        for (let driver in this.selectedDrivers) {
          let userWPlanning = {
            user_id: this.selectedDrivers[driver].id,
            planning_id: response.id,
          };
          userPromises.push(
            this.addUserToPlanning(userWPlanning).then(() => {
              usersAddedSuccessfully.push(this.selectedDrivers[driver]);
            })
          );
        }

        for (let equ in this.keysArray) {
          let equWPlanning = {
            equipement_id: this.selectedSTSs[equ].id,
            planning_id: response.id,
          };
          equipementPromises.push(
            this.addEquipementToPlanning(equWPlanning).then((response) => {
              console.log("STS : " + this.selectedSTSs[equ].matricule);

              let intervalPromises = [];

              this.intervals[this.selectedSTSs[equ].matricule].forEach(
                (interval) => {
                  let intervalWPlanning = {
                    equipement_planning_id: response.id,
                    start_time: interval.startTime,
                    end_time: interval.endTime,
                  };
                  console.log(intervalWPlanning);
                  intervalPromises.push(
                    this.addEquipementWorkingHoursToPlanning(intervalWPlanning)
                  );
                }
              );

              return Promise.all(intervalPromises).then(() => {
                equAddedSuccessfully.push(this.selectedSTSs[equ]);
              });
            })
          );
        }

        Promise.all(userPromises.concat(equipementPromises)).then(() => {
          const output = this.setAllDriversPlanning(outputs).thePlanning;
          // output.unshift(this.shift);
          // console.table(output);
          this.setBoxes(output);
        });
      });
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

    generateIntervals(start, end) {
      const intervals = [];
      let [startHour, startMinute] = start.split(":").map(Number);
      let [endHour, endMinute] = end.split(":").map(Number);

      while (
        startHour < endHour ||
        (startHour === endHour && startMinute < endMinute)
      ) {
        const nextHour = startHour + 1;
        intervals.push(
          `${String(startHour).padStart(2, "0")}:${String(startMinute).padStart(
            2,
            "0"
          )}-${String(nextHour).padStart(2, "0")}:${String(
            startMinute
          ).padStart(2, "0")}`
        );
        startHour = nextHour;
      }

      return intervals;
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
        this.showConfirmDialog = true;
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
    getDriverinalWOrkingHours(driver, outputs) {
      const totalHours = outputs.reduce((total, sts) => {
        return (total += sts.intervals.length);
      }, 0);
      const T = this.selectedDrivers.length * 8 - totalHours;
      const numberOfBreaks = Math.floor(T / this.selectedDrivers.length);
      const numberOfDoubleBreaks =
        (numberOfBreaks * this.selectedDrivers.length - T) * -1;
      return 8 - numberOfBreaks - (driver <= numberOfDoubleBreaks ? 1 : 0);
    },
    moveToFirstByMatricule(arr, matricule) {
      // Find the index of the object with the specified matricule
      const index = arr.findIndex((item) => item.matricule === matricule);

      // If the object is found and it's not already the first element
      if (index > -1 && index !== 0) {
        // Remove the object from its current position
        const [item] = arr.splice(index, 1);
        // Insert the object at the beginning of the array
        arr.unshift(item);
      }

      return arr;
    },
    checkIntervalForSts(stsPlanning, matricule, interval) {
      const sts = stsPlanning.find((sts) => sts.matricule == matricule);
      if (sts) {
        return sts.intervals.includes(interval);
      }

      return false;
    },
    IntervalIsExistedInTheSTSList(stsPlanning, interval) {
      for (let sts of stsPlanning) {
        if (sts.intervals.includes(interval)) {
          return true;
        }
      }
      return false;
    },
    ItsABreak(
      stsPlanning,
      oneDriverPlanning,
      oneDriverPlanningHourex,
      driverIndex,
      outputs
    ) {
      if (driverIndex == 6 && oneDriverPlanningHourex == 2) {
        console.log("6 : ");
        console.table("stsPlanning :", JSON.parse(JSON.stringify(stsPlanning)));
        console.table("oneDriverPlanning :", oneDriverPlanning);
        console.table("oneDriverPlanningHourex :", oneDriverPlanningHourex);
        console.table("driverIndex :", driverIndex);
      }
      let countWorkingHours = oneDriverPlanning.filter((value) =>
        value.startsWith("STS")
      ).length;

      if (
        this.getDriverinalWOrkingHours(driverIndex, outputs) <=
        countWorkingHours
      )
        return true;

      if (
        oneDriverPlanningHourex == 0 ||
        oneDriverPlanning[oneDriverPlanningHourex - 1] == "-"
      ) {
        return !this.IntervalIsExistedInTheSTSList(
          stsPlanning,
          this.shift[oneDriverPlanningHourex]
        );
      } else {
        if (
          this.IntervalIsExistedInTheSTSList(
            stsPlanning,
            this.shift[oneDriverPlanningHourex]
          )
        ) {
          let occurence = oneDriverPlanning.filter(
            (item) => item === oneDriverPlanning[oneDriverPlanningHourex - 1]
          ).length;

          if (occurence > 2) {
            return true;
          } else {
            return !this.checkIntervalForSts(
              stsPlanning,
              oneDriverPlanning[oneDriverPlanningHourex - 1],
              this.shift[oneDriverPlanningHourex]
            );
          }
        } else {
          return true;
        }
      }
    },
    setOneDriverPlanning(stsListtoBegin, driverIndex, outputs) {
      let stsPlanning = [...stsListtoBegin];
      let oneDriverPlanning = [...this.shift];

      let countDouble = 0;
      let tooked = false;
      /* matricule: "STS4",
  
      intervals: [
          */

      oneDriverPlanning.forEach(
        (oneDriverPlanningHour, oneDriverPlanningHourex) => {
          if (oneDriverPlanningHourex > 0) {
            stsPlanning = this.moveToFirstByMatricule(
              stsPlanning,
              oneDriverPlanning[oneDriverPlanningHourex - 1]
            );
          }

          if (
            !this.ItsABreak(
              stsPlanning,
              oneDriverPlanning,
              oneDriverPlanningHourex,
              driverIndex,
              outputs
            )
          ) {
            stsPlanning.forEach((sts, index) => {
              countDouble = 0;

              tooked = false;
              sts.intervals.forEach((stsInterval, index) => {
                let occurence = oneDriverPlanning.filter(
                  (item) => item === sts.matricule
                ).length;
                if (occurence < 3)
                  if (
                    oneDriverPlanning[oneDriverPlanningHourex][0] != "S" &&
                    oneDriverPlanningHour == stsInterval
                  ) {
                    if (
                      oneDriverPlanningHourex == 0 ||
                      occurence == 0 ||
                      (oneDriverPlanningHourex > 0 &&
                        oneDriverPlanning[oneDriverPlanningHourex - 1] ==
                          sts.matricule)
                    ) {
                      oneDriverPlanning[oneDriverPlanningHourex] =
                        sts.matricule;
                      let stsCopy = stsPlanning.find(
                        (sts1) => sts1.matricule === sts.matricule
                      );
                      stsCopy.intervals = [
                        ...stsCopy.intervals.filter(
                          (interval) => interval != stsInterval
                        ),
                      ];
                      stsPlanning[
                        stsPlanning.findIndex(
                          (sts1) => sts1.matricule === stsCopy.matricule
                        )
                      ].intervals = [...stsCopy.intervals];
                    }
                  }
              });
            });
          } else {
            oneDriverPlanning[oneDriverPlanningHourex] = "-";
          }
        }
      );
      return {
        oneDriverPlanning: oneDriverPlanning,
        stsPlanning: stsPlanning,
      };
    },
    bestEnhancement(thePlanning, stsListtoBegin) {
      let stsListToReduce = [
        ...stsListtoBegin.filter((e) => e.intervals.length > 0),
      ];
      let thePlanningToReduce = [...thePlanning];
      console.log("from bestEnhancement :");
      console.log(
        "stsListToReduce.stsPlanning.filter((e)=>e.intervals.length>0).length :",
        stsListToReduce.length
      );
      //while(stsListToReduce.stsPlanning.filter((e)=>e.intervals.length>0)){
      if (stsListToReduce.length > 0) {
        for (
          let planningToEncanceIndex = 0;
          planningToEncanceIndex < stsListToReduce.length;
          planningToEncanceIndex++
        ) {
          const MissingStsIntervals = stsListToReduce[planningToEncanceIndex];
          for (
            let MissingStsIntervalsIndex = 0;
            MissingStsIntervalsIndex < MissingStsIntervals.intervals.length;
            MissingStsIntervalsIndex++
          ) {
            const stsInterval =
              MissingStsIntervals.intervals[MissingStsIntervalsIndex];
            console.log(MissingStsIntervals.matricule + "-" + stsInterval);
            console.log(this.shift.indexOf(stsInterval));
          }
        }
      }
      //}
    },
    setAllDriversPlanning(outputs) {
      console.log(outputs);
      console.log(this.selectedDrivers.length);
      let thePlanning = [];
      let stsListtoBegin = [...outputs];
      for (
        let driverIndex = 0;
        driverIndex < this.selectedDrivers.length;
        driverIndex++
      ) {
        let res = this.setOneDriverPlanning(
          stsListtoBegin,
          driverIndex,
          outputs
        );
        thePlanning.push(res.oneDriverPlanning);
        stsListtoBegin = [...res.stsPlanning];
        //stsListtoBegin = [...res.stsPlanning]
        console.table(driverIndex, stsListtoBegin);
        //console.table("stsPlanning :", JSON.parse(JSON.stringify(res.stsPlanning)))
      }
      //bestEnhancement(thePlanning, stsListtoBegin);
      return {
        thePlanning: thePlanning,
        stsListtoBegin: stsListtoBegin,
      };
    },
    splitIntoHourlyIntervals({ startTime, endTime }) {
      const [startHour, startMin] = startTime.split(":").map(Number);
      const [endHour, endMin] = endTime.split(":").map(Number);

      const intervals = [];
      let currentHour = startHour;
      let currentMin = startMin;

      while (
        currentHour < endHour ||
        (currentHour === endHour && currentMin < endMin)
      ) {
        const nextHour = currentHour + 1;
        const formattedCurrentHour = currentHour.toString().padStart(2, "0");
        const formattedCurrentMin = currentMin.toString().padStart(2, "0");
        const formattedNextHour = nextHour.toString().padStart(2, "0");

        intervals.push(
          `${formattedCurrentHour}:${formattedCurrentMin}-${formattedNextHour}:${formattedCurrentMin}`
        );

        currentHour = nextHour;
        currentMin = 0; // Since we are working with hourly intervals, minutes will always be 0
      }

      return intervals;
    },
    setBoxes(output) {
      const promises = [];
      this.selectedDrivers.sort((a, b) => b.workingHours > a.workingHours);
      // Iterate over the selectedDrivers and output table rows, starting from the second row of output
      for (let i = 0; i < this.selectedDrivers.length; i++) {
        let driver = this.selectedDrivers[i];

        // Adjust rowIndex to start from the second row (index 1)
        let rowIndex = i;
        if (output[rowIndex]) {
          // Insert driver's ID at the beginning of the row
          output[rowIndex].unshift(driver.id);
        } else {
          // If the row does not exist in the output, create a new row with just the driver's ID
          output[rowIndex] = [driver.id];
        }
      }
      output.push(["Drivers", ...this.shift]);

      //output.unshift(...["Drivers",...this.shift])
      console.table(output);

      for (let i = 0; i < this.selectedDrivers.length; i++) {
        for (let j = 1; j < 9; j++) {
          let sts = null;
          if (output[i][j] != "-") {
            sts = this.selectedSTSs.find(
              (sts) => sts.matricule === output[i][j]
            );
          }
          const parts = output[this.selectedDrivers.length][j].split("-");
          const start = parts[0];
          const end = parts[1];
          const boxObject = {
            planning_id: this.planningId,
            user_id: output[i][0],
            equipement_id: sts ? sts.id : null,
            break: output[i][j] == "-",
            start_time: start,
            ends_time: end,
          };
          promises.push(this.setBoxAction(boxObject));
          Promise.all(promises).then(() => {
            this.setLoadingValueAction(false);
            window.location.reload();
          });
          console.log(boxObject);
        }
      }
    },
  },
};
</script>

<style scoped>
.main-parent {
  display: flex;
  width: fit-content;
  flex-direction: column;
  max-height: 80vh; /* You can adjust this value as needed */
  gap: 0.3rem;
  overflow-y: auto;
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
  font-size: 0.5rem;
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
