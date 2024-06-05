<template>
  <div class="main-parent">
    <div class="header">
      <h2>Current Shift: {{ actualShift }}</h2>
      <p>Today's Date: {{ todayDate }}</p>
    </div>
    <div class="parent">
      <!-- List ams with associated switches -->
      <div class="resources">
        <div class="label-column">AMS</div>
        <div class="selectAll">
          <label class="amname">Select All</label>
          <v-switch
            v-model="selectAll"
            @change="toggleSelectAll"
            hide-details
          ></v-switch>
        </div>
        <hr class="hr" />
        <div class="ams-container">
          <div
            v-for="(chunk, colIndex) in chunkedAMs"
            :key="colIndex"
            class="column"
          >
            <div v-for="(item, rowIndex) in chunk" :key="rowIndex" class="am">
              <div class="amname">
                {{ item.firstname + " " + item.lastname }}
              </div>
              <v-switch
                v-model="selectedAMs"
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
                    'blue-text': hasIntervalsOrWorkers(item),
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
                v-if="showIcons[item.matricule] === true"
                :class="{
                  'timer-icon-blue': !includedWoutIntOrWork(item),
                  'timer-icon-green': includedWoutIntOrWork(item),
                }"
                @click="openDialog(item)"
                >mdi-cog</v-icon
              >

              <!-- Dialog for adding sts time intervals -->
              <v-dialog
                v-model="dialog[item.matricule]"
                max-width="400"
                @click:outside="closeDialog(item)"
              >
                <v-card>
                  <v-card-text>
                    <v-radio-group v-model="selectedRole" row>
                      <v-radio :label="'TA'" value="TA"></v-radio>
                      <v-radio :label="'ST'" value="ST"></v-radio>
                    </v-radio-group>
                  </v-card-text>
                </v-card>
                <v-card v-if="selectedRole === 'TA'">
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
                      @click="saveTime(item)"
                      :disabled="isSaveButtonDisabled(item)"
                      :class="{ 'disabled-button': isSaveButtonDisabled(item) }"
                      >Save</v-btn
                    >
                    <v-btn @click="closeDialog(item)">Close</v-btn>
                  </v-card-actions>
                </v-card>
                <v-card v-else-if="selectedRole === 'ST'">
                  <v-select
                    v-model="selectedSTWorker"
                    :items="stComps"
                    label="Select ST Company"
                  ></v-select>
                  <v-card-actions>
                    <v-btn
                      color="primary"
                      @click="saveTime(item)"
                      :disabled="isSaveButtonDisabled(item)"
                      :class="{ 'disabled-button': isSaveButtonDisabled(item) }"
                      >Save</v-btn
                    >
                    <v-btn @click="closeDialog(item)">Close</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </div>
          </div>
        </div>
      </div>

      <!-- List ams roles with associated switches -->
      <div class="resources">
        <div class="label-column">Roles</div>
        <div class="selectAll">
          <label class="amname">Select All</label>
          <v-switch
            v-model="selectAllRoles"
            @change="toggleSelectAllRoles"
            hide-details
          ></v-switch>
        </div>
        <hr class="hr" />
        <div class="amsroles-container">
          <div
            v-for="(chunk, colIndex) in chunkedRoles"
            :key="colIndex"
            class="column"
          >
            <div v-for="(item, rowIndex) in chunk" :key="rowIndex" class="role">
              <div
                :class="
                  item.name !== 'assistant' ? 'rolename' : 'assistantrolename'
                "
                @click="openRoleDialog(item)"
                @mouseover="
                  item !== 'assistant'
                    ? (showRoleIcons[item] = true)
                    : (showRoleIcons[item] = false)
                "
                @mouseleave="showRoleIcons[item] = false"
              >
                <span
                  :class="{
                    'blue-text': hasNumber(item),
                    'green-text': includedWoutNum(item),
                  }"
                  >{{ item }}</span
                >
              </div>
              <v-switch
                v-model="selectedRoles"
                :value="item"
                hide-details
                @change="onChangeRole(item)"
              ></v-switch>
              <v-icon
                v-if="showRoleIcons[item] == true"
                :class="{
                  'timer-icon-blue': !includedWoutNum(item),
                  'timer-icon-green': includedWoutNum(item),
                }"
                @click="openRoleDialog(item)"
                >mdi-cog</v-icon
              >
              <v-dialog v-model="roleDialog[item]" max-width="400">
                <v-card>
                  <v-card-title
                    >Enter Number of Workers for {{ item }}</v-card-title
                  >
                  <v-card-text>
                    <v-text-field
                      v-model="roleCount"
                      label="Number of Workers"
                      type="number"
                    ></v-text-field>
                  </v-card-text>
                  <v-card-actions>
                    <v-btn color="primary" @click="saveRoleData(item)"
                      >Save</v-btn
                    >
                    <v-btn @click="closeRoleDialog(item, false)">Close</v-btn>
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
      equipementType="AM"
      v-model="showConfirmDialog"
      @validateSelections="createPlanning"
      @removeDriver="removeDriver"
      @removeEquipement="removeEquipement"
      @removeSTSTS="removeSTSTS"
      :selectedDrivers="selectedAMs"
      :workers="workers"
      :intervals="intervals"
      :selectedEqus="keysArray"
      :selectedRoles="selectedRoles"
      :numWorkers="numWorkers"
      @removeAMRole="removeAMRole"
      @closeDialog="showConfirmDialog = false"
    />
  </div>
</template>

<script>
import ConfirmDialog from "../ConfirmDialog.vue";
import { mapGetters, mapActions } from "vuex";
import moment from "moment";
export default {
  components: {
    ConfirmDialog,
  },
  props: {
    amplanningData: {
      type: Object,
      default: null,
    },
  },

  data() {
    return {
      minTimeIndex: -1,
      amsList: [],
      stssList: [],
      selectedAMs: [],
      selectedSTSs: [],
      intervals: {},
      workers: [],
      dialog: {}, // Object to store dialog state for each STS
      startTime: "",
      endTime: "",
      respectedStart: false,
      respectedEnd: false,
      selectedRole: "TA",
      selectedSTWorker: "",
      stComps: ["St1", "St2", "St3", "St4", "St5"],
      roles: ["checker", "deckman", "assistant"],
      selectedRoles: [],
      roleDialog: {},
      numWorkers: {},
      showConfirmDialog: false,
      keysArray: [],
      showIcons: {},
      showRoleIcons: {},
      roleCount: 0,
      isSaved: {},
      isRoleSaved: {},
      shiftId: null,
      profileGroupId: null,
      selectAll: false,
      selectAllSTSs: false,
      selectAllRoles: false,
      inputs: null,
      actualShift: null,
      todayDate: "",
      inputs: null,
      shift: [],
      planningId: -1,
      startTime: "",
      endTime: "",
    };
  },

  //computed
  computed: {
    // include getters
    ...mapGetters(["getDrivers", "getEquipements"]),

    // change sts item color based on intervals or workers
    hasIntervalsOrWorkers() {
      return (item) => {
        return (
          !!this.intervals[item.matricule] ||
          !!this.workers.find((worker) => worker.STS === item.matricule)
        );
      };
    },

    // change role item color based on number of workers
    hasNumber() {
      return (item) => {
        return !!this.numWorkers[item];
      };
    },

    // change icon color based on number of workers
    includedWoutIntOrWork() {
      return (item) => {
        return (
          this.selectedSTSs.includes(item) && !this.isSaved[item.matricule]
        );
      };
    },

    // change icon color based on number of workers
    includedWoutNum() {
      return (item) => {
        return this.selectedRoles.includes(item) && !this.isRoleSaved[item];
      };
    },

    // save button state
    isSaveButtonDisabled() {
      return (item) => {
        if (this.selectedRole === "TA") {
          if (this.intervals[item.matricule]) {
            const isValidIntervals = this.intervals[item.matricule].every(
              (interval, i) => {
                if (i === 0) {
                  // For the first interval, there's no previous interval to compare with
                  return true;
                } else {
                  // For subsequent intervals, compare with the previous interval's end time
                  const previousInterval =
                    this.intervals[item.matricule][i - 1];
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
                (interval) =>
                  interval.startTime === "" || interval.endTime === ""
              ) ||
              !this.respectedStart ||
              !this.respectedEnd ||
              !isValidIntervals
            );
          }
        } else if (this.selectedRole === "ST") {
          return this.selectedSTWorker === "";
        }
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
            ].endTime == this.endTime
          );
        }
        return true; // Disable if intervals are not defined
      };
    },

    // returns array of 6 ams per chunk
    chunkedAMs() {
      return this.chunkArray(this.amsList, 4);
    },

    // returns array of 6 stss per chunk
    chunkedSTSs() {
      return this.chunkArray(this.stssList, 6);
    },

    chunkedRoles() {
      return this.chunkArray(this.roles, 6);
    },
  },

  //mounted
  mounted() {
    this.setData();
    this.setIsRoleSaved();
  },

  //methods
  methods: {
    // include actions
    ...mapActions([
      "setDriversAction",
      "setLoadingValueAction",
      "setEquipementsAction",
      "createPlanningAction",
      "addUserToPlanning",
      "addEquipementToPlanning",
      "addEquipementWorkingHoursToPlanning",
      "setShiftByCategory",
      "createAMPlanningAction",
      "setBoxAction",
      "setProfileGroupByType"
    ]),
    toggleSelectAll() {
      if (this.selectAll) {
        this.selectAllDrivers();
      } else {
        this.deselectAllDrivers();
      }
    },
    selectAllDrivers() {
      this.selectedAMs = [];
      this.chunkedAMs.forEach((chunk) => {
        chunk.forEach((driver) => {
          if (!this.selectedAMs.includes(driver)) {
            this.selectedAMs.push(driver);
          }
        });
      });
    },
    deselectAllDrivers() {
      this.selectedAMs = [];
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

    toggleSelectAllRoles() {
      if (this.selectAllRoles) {
        this.selectAllRolesList();
      } else {
        this.deselectAllRolesList();
      }
    },
    selectAllRolesList() {
      this.selectedRoles = [];
      this.chunkedRoles.forEach((chunk) => {
        chunk.forEach((role) => {
          if (!this.selectedRoles.includes(role)) {
            this.selectedRoles.push(role);
          }
        });
      });
    },
    deselectAllRolesList() {
      this.selectedRoles = [];
    },

    // set AMs
    async setData() {
      const today = new Date();
      const options = { year: "numeric", month: "long", day: "numeric" };
      this.todayDate = today.toLocaleDateString(undefined, options);
      this.setLoadingValueAction(true);
      if (this.amplanningData) {
        console.log(JSON.stringify(this.amplanningData));
        this.actualShift = this.amplanningData.shift;
        const dateToPlan = new Date(this.amplanningData.date);
        let year = dateToPlan.getFullYear();
        let month = ("0" + (dateToPlan.getMonth() + 1)).slice(-2);
        let day = ("0" + dateToPlan.getDate()).slice(-2);
        let formattedDate = `${year}-${month}-${day}`;
        let dateTime = `${formattedDate}`;
        const shift = this.getDayShifts(dateTime);
        console.log(shift);
        const dayIndex = shift.indexOf(this.actualShift);
        switch (dayIndex) {
          case 0:
            this.startTime = "07:00";
            this.endTime = "15:00";
            this.shift = [
              "07:00-08:00",
              "08:00-09:00",
              "09:00-10:00",
              "10:00-11:00",
              "11:00-12:00",
              "12:00-13:00",
              "13:00-14:00",
              "14:00-15:00",
            ];
            break;
          case 1:
            this.startTime = "15:00";
            this.endTime = "23:00";
            this.shift = [
              "15:00-16:00",
              "16:00-17:00",
              "17:00-18:00",
              "18:00-19:00",
              "19:00-20:00",
              "20:00-21:00",
              "21:00-22:00",
              "22:00-23:00",
            ];
            break;
          case 2:
            this.startTime = "23:00";
            this.endTime = "07:00";
            this.shift = [
              "23:00-00:00",
              "00:00-01:00",
              "01:00-02:00",
              "02:00-03:00",
              "03:00-04:00",
              "04:00-05:00",
              "05:00-06:00",
              "06:00-07:00",
            ];
            break;
          default:
            this.startTime = "";
            this.endTime = "";
            break;
        }
        this.todayDate = dateToPlan.toLocaleDateString(undefined, options);
        const response = await this.setShiftByCategory({
          category: this.amplanningData.shift,
        });
        // console.log(this.stsplanningData);
        this.inputs = {
          profile_group: "am",
          role: "am",
          shift_id: response[0].id,
        };

      } else {
        const hours = today.getHours();
        if (hours >= 7 && hours < 15) {
          this.startTime = "07:00";
          this.endTime = "15:00";
          this.shift = [
            "07:00-08:00",
            "08:00-09:00",
            "09:00-10:00",
            "10:00-11:00",
            "11:00-12:00",
            "12:00-13:00",
            "13:00-14:00",
            "14:00-15:00",
          ];
        } else if (hours >= 15 && hours < 23) {
          this.startTime = "15:00";
          this.endTime = "23:00";
          this.shift = [
            "15:00-16:00",
            "16:00-17:00",
            "17:00-18:00",
            "18:00-19:00",
            "19:00-20:00",
            "20:00-21:00",
            "21:00-22:00",
            "22:00-23:00",
          ];
        } else if (hours >= 23 || (hours >= 0 && hours < 7)) {
          this.startTime = "23:00";
          this.endTime = "07:00";
          this.shift = [
            "23:00-00:00",
            "00:00-01:00",
            "01:00-02:00",
            "02:00-03:00",
            "03:00-04:00",
            "04:00-05:00",
            "05:00-06:00",
            "06:00-07:00",
          ];
        }
        this.actualShift = this.getActualShift();
        // console.log(this.getActualShift());
        const response = await this.setShiftByCategory({
          category: this.actualShift,
        });
        this.inputs = {
          profile_group: "am",
          role: "am",
          shift_id: response[0].id,
        };

      }
      this.setDriversAction(this.inputs).then((response) => {
        this.amsList = this.getDrivers;
        if (this.amsList.length > 0) {
          this.shiftId = this.amsList[0].shift_id;
        }
      });
      this.setEquipementsAction().then(() => {
        this.stssList = this.getEquipements.filter(
          (equipement) => equipement.profile_group.type === "sts"
        );
        const activeType = {
          type: "am",
        };
        this.setProfileGroupByType(activeType).then((response) => {
          this.profileGroupId = response[0].id;
          this.setLoadingValueAction(false);
        });
      });
    },

    // initialize roles with false value in isRoleSaved array
    setIsRoleSaved() {
      for (let role in this.roles) {
        this.isRoleSaved[role] = false;
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
        currentIntervals[currentIntervals.length - 1].endTime < this.endTime;

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
      if (this.startTime === "23:00") {
        if (value < "23:00" && value > "06:00") {
          this.respectedStart = false;
          return `${this.startTime} <= interval <= ${this.endTime}`;
        }
      } else {
        if (value < this.startTime || value > this.endTime) {
          this.respectedStart = false;
          return `${this.startTime} <= interval <= ${this.endTime}`;
        }
      }

      if (index === 0) {
        return true;
      }

      const keys = Object.keys(this.intervals);
      const indexX = keys.indexOf(item.matricule);
      const previousItem = this.intervals[keys[indexX]][index - 1];
      if (previousItem.endTime != "23:00" && value < previousItem.endTime) {
        this.respectedStart = false;
        return "Start time > Previous end time !!";
      }
      return true;
    },

    // define time validation for end time
    endsTimeRule(value, item, index) {
      // Reset respected to true at the beginning
      this.respectedEnd = true;

      if (value > this.endTime) {
        this.respectedEnd = false;
        return `interval <= ${this.endTime}`;
      }

      if (
        this.intervals[item.matricule][index].startTime != "23:00" &&
        value < this.intervals[item.matricule][index].startTime
      ) {
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

    // returns selected ams and stss
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
        checker_number: this.numWorkers["checker"],
        deckman_number: this.numWorkers["deckman"],
        assistant: this.selectedRoles.includes("assistant") ? 1 : 0,
      };
      this.createAMPlanningAction(planning).then((response) => {
        let userPromises = [];
        let equipementPromises = [];
        let usersAddedSuccessfully = [];
        let equAddedSuccessfully = [];
        this.planningId = response.id;
        for (let am in this.selectedAMs) {
          let userWPlanning = {
            user_id: this.selectedAMs[am].id,
            planning_id: response.id,
          };
          userPromises.push(
            this.addUserToPlanning(userWPlanning).then(() => {
              usersAddedSuccessfully.push(this.selectedAMs[am]);
            })
          );
        }
        for (let equ in this.keysArray) {
          if (this.intervals[this.selectedSTSs[equ].matricule]) {
            let equWPlanning = {
              equipement_id: this.selectedSTSs[equ].id,
              planning_id: response.id,
            };
            equipementPromises.push(
              this.addEquipementToPlanning(equWPlanning).then((response) => {
                let intervalPromises = [];
                this.intervals[this.selectedSTSs[equ].matricule].forEach(
                  (interval) => {
                    let intervalWPlanning = {
                      equipement_planning_id: response.id,
                      start_time: interval.startTime,
                      end_time: interval.endTime,
                    };
                    intervalPromises.push(
                      this.addEquipementWorkingHoursToPlanning(
                        intervalWPlanning
                      )
                    );
                  }
                );
                return Promise.all(intervalPromises).then(() => {
                  equAddedSuccessfully.push(this.selectedSTSs[equ]);
                });
              })
            );
          } else {
            let equWPlanning = {
              equipement_id: this.selectedSTSs[equ].id,
              planning_id: response.id,
              subcontract: this.workers.find(
                (worker) => worker.STS === this.selectedSTSs[equ].matricule
              ).worker,
            };
            equipementPromises.push(
              this.addEquipementToPlanning(equWPlanning).then((response) => {
                equAddedSuccessfully.push(this.selectedSTSs[equ]);
              })
            );
          }
        }
        Promise.all(userPromises.concat(equipementPromises)).then(() => {
          // console.log(usersAddedSuccessfully);
          // console.log(equAddedSuccessfully);
          this.setBoxesData(outputs);
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
        this.workers = this.workers.filter(
          (worker) => worker.STS !== item.matricule
        );
        this.isSaved[item.matricule] = false;
      }
    },

    //open sts intervals dialog
    openDialog(item) {
      // Set dialog state for the specific STS item to true
      if (!this.dialog[item.matricule]) {
        this.dialog[item.matricule] = true;
      }

      // Initialize intervals and workers arrays if not already initialized
      if (
        !this.intervals[item.matricule] ||
        this.intervals[item.matricule].length === 0
      ) {
        this.intervals[item.matricule] = [{ startTime: "", endTime: "" }];
      }

      if (!this.workers[item.name] && this.selectedRole === "ST") {
        this.workers[item.matricule] = [{ STS: item.matricule, worker: "" }];
      }
    },

    // save sts intervals
    saveTime(item) {
      this.isSaved[item.matricule] = true;
      if (this.selectedRole === "ST") {
        // Save ST worker for ST role
        delete this.intervals[item.matricule];
        const itemToGet = this.workers.find(
          (worker) => worker.STS === item.matricule
        );
        if (!itemToGet)
          this.workers.push({
            STS: item.matricule,
            worker: this.selectedSTWorker,
          });
        else {
          itemToGet.worker = this.selectedSTWorker;
          this.workers = this.workers.filter(
            (worker) => worker.STS !== item.matricule
          );
          this.workers.push(itemToGet);
        }
      }
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
          this.workers = this.workers.filter(
            (worker) => worker.STS !== item.matricule
          );
          delete this.intervals[item.matricule];
        } else {
          if (this.selectedRole === "TA") {
            const itemToGet = this.workers.find(
              (worker) => worker.STS === item.matricule
            );
            if (itemToGet) {
              delete this.intervals[item.matricule];
            } else if (
              this.intervals[item.matricule][
                this.intervals[item.matricule].length - 1
              ].startTime === "" &&
              this.intervals[item.matricule][
                this.intervals[item.matricule].length - 1
              ].endTime === ""
            ) {
              this.intervals[item.matricule].pop();
            }
          }
        }
      } else {
        if (this.selectedRole === "TA") {
          this.workers = this.workers.filter(
            (worker) => worker.STS !== item.matricule
          );
        } else {
          delete this.intervals[item.matricule];
        }
      }

      this.dialog[item.matricule] = false;
    },

    // Method to open the role dialog for a specific role
    openRoleDialog(item) {
      if (item !== "assistant") {
        this.roleCount = this.numWorkers[item] || 0;
        this.roleDialog[item] = true;
      }
    },

    // Method to close the role dialog for a specific role
    closeRoleDialog(item, value) {
      if (!value) {
        if (!this.selectedRoles.includes(item)) {
          this.selectedRoles = this.selectedRoles.filter(
            (role) => role !== item
          );
          delete this.numWorkers[item];
        }
      }
      this.roleDialog[item] = false;
    },

    // Method to save role data for a specific role
    saveRoleData(item) {
      this.isRoleSaved[item] = true;
      // Close the dialog for the specific role
      if (!this.selectedRoles.includes(item)) {
        this.selectedRoles.push(item);
      }
      this.numWorkers[item] = this.roleCount;
      this.closeRoleDialog(item, true);
    },

    //remove am from confirm dialog
    removeDriver(driver) {
      this.selectedAMs = this.selectedAMs.filter((item) => item !== driver);
    },

    // remove TA sts from confirm dialog
    removeEquipement(equ) {
      this.selectedSTSs = this.selectedSTSs.filter(
        (sts) => sts.matricule !== equ
      );
      delete this.intervals[keysArrayequ.matricule];
      this.keysArray = Object.keys(this.intervals);
    },

    // remove ST sts from confirm dialog
    removeSTSTS(sts) {
      this.selectedSTSs = this.selectedSTSs.filter(
        (item) => item.matricule !== sts
      );
      this.workers = this.workers.filter(
        (worker) => worker.STS !== sts.matricule
      );
      this.isSaved[sts.matricule] = false;
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
          (this.intervals[sts.matricule] &&
            this.intervals[sts.matricule].length > 0 &&
            (this.intervals[sts.matricule][
              this.intervals[sts.matricule].length - 1
            ].startTime !== "" ||
              this.intervals[sts.matricule][
                this.intervals[sts.matricule].length - 1
              ].endTime !== "")) ||
          this.workers.find((worker) => worker.STS === sts.matricule)
        );
      });
      this.selectedSTSs = Array.from(new Set(this.selectedSTSs));
      console.log(this.selectedSTSs);
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
    // remove AM role from confirm dialog
    removeAMRole(role) {
      this.selectedRoles = this.selectedRoles.filter((item) => item !== role);
      delete this.numWorkers[role];
      this.isRoleSaved[role] = false;
    },

    // on role switch changes
    onChangeRole(item) {
      if (!this.selectedRoles.includes(item)) {
        this.isRoleSaved[item] = false;
        delete this.numWorkers[item];
      }
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
    getDayShifts(date) {
      let nowDate = null;
      if (!date) {
        nowDate = new Date();
      } else {
        nowDate = new Date(date);
      }
      let thisDate = new Date("2022-02-10T07:00:00");

      let shift = ["D", "A", "B", "C"];
      let momentDate = moment(thisDate);

      while (momentDate.add(72, "hours").toDate() < nowDate) {
        shift = this.shiftArrays(shift);
      }
      // if (nowDate.getHours() >= 7 && nowDate.getHours() < 15) return shift[0];
      // else if (nowDate.getHours() >= 15 && nowDate.getHours() < 23)
      //   return shift[1];
      // else if (
      //   nowDate.getHours() == 23 ||
      //   (nowDate.getHours() >= 0 && nowDate.getHours() < 7)
      // )
      //   return shift[2];
      return shift;
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

    splitIntoHourlyIntervals({ startTime, endTime }) {
      const [startHour, startMin] = startTime.split(":").map(Number);
      const [endHour, endMin] = endTime.split(":").map(Number);

      const intervals = [];
      let currentHour = startHour;
      let currentMin = startMin;

      // Function to format time with leading zeros
      const formatTime = (hour, minute) => {
        return `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
      };

      // Determine if we are spanning across midnight
      const isSpanningMidnight =
        endHour < startHour || (endHour === startHour && endMin < startMin);

      while (
        currentHour < endHour ||
        (currentHour === endHour && currentMin < endMin) ||
        (isSpanningMidnight &&
          (currentHour !== endHour || currentMin !== endMin))
      ) {
        const nextHour = (currentHour + 1) % 24;
        intervals.push(
          `${formatTime(currentHour, currentMin)}-${formatTime(
            nextHour,
            currentMin
          )}`
        );

        currentHour = nextHour;
        currentMin = 0; // Since we are working with hourly intervals, minutes will always be 0

        // If we are spanning midnight and we looped back to the start hour, we can stop
        if (isSpanningMidnight && currentHour === startHour) {
          break;
        }
      }

      return intervals;
    },
    setBoxesData(outputs) {
      const promises=[];
      const formattedSelectedAms = this.selectedAMs.map((am) => {
        return {
          id: am.id,
          checker_workingHours: am.checker_workingHours
            ? am.checker_workingHours
            : 0,
          deckman_workingHours: am.deckman_workingHours
            ? am.deckman_workingHours
            : 0,
          assistant_workingHours: am.assistant_workingHours
            ? am.assistant_workingHours
            : 0,
        };
      });
      const tableHeaders = ["Manutention agents", ...this.shift];
      // console.log("STS : ");
      // console.log(outputs);
      // console.log("AM List : ");
      // console.log(formattedSelectedAms);
      // console.log("Roles List : ");
      // console.log(this.selectedRoles);
      // console.log(this.numWorkers);
      const sortedPlanning = this.generatePlanning(outputs, this.shift);
      // console.log("Sorted Planning : ");
      // console.table(sortedPlanning);
      const amsList = this.sortedAmList(
        formattedSelectedAms,
        this.numWorkers["deckman"],
        this.numWorkers["checker"]
      );
      // console.log("Sorted AmList : ");
      // console.log(amsList);
      const finalPlanning = this.combineAmListWithPlanning(
        sortedPlanning,
        amsList
      );
      finalPlanning.unshift(tableHeaders);
      // console.log("Final Planning : ");
      console.table(finalPlanning);

      for (let i = 1; i < finalPlanning.length; i++) {
        for (let j = 1; j < tableHeaders.length; j++) {
          let box = null;
          let matricule = "";
          let role = "";
          let sts = null;
          let timeInterval = finalPlanning[0][j];
          let timeIntervalParts = finalPlanning[0][j].split('-');
          let start = timeIntervalParts[0];
          let end = timeIntervalParts[1];
          console.log("start time : ",start);
          console.log("end time : ",end);
          if (finalPlanning[i][j] === "Assistant") {
            role = "assistant";
          } else if (
            finalPlanning[i][j] !== "Assistant" &&
            finalPlanning[i][j] !== "B"
          ) {
            box = finalPlanning[i][j].split("-");
            matricule = box[0];
            sts =  this.selectedSTSs.find(sts=>sts.matricule===matricule);
            if(sts)
            console.log("sts ID : ",sts.id);
            role = box[1];
          }
          const boxObject = {
            planning_id: this.planningId,
            user_id: finalPlanning[i][0],
            equipement_id: sts ? sts.id : null,
            break: finalPlanning[i][j] === "B",
            role:role,
            start_time: start,
            ends_time: end,
          };
          promises.push(this.setBoxAction(boxObject));
        }
      }
      Promise.all(promises).then(() => {
        this.setLoadingValueAction(false);
        window.location.reload();
      });
    },
    countAssistants(row) {
      return row.filter((cell) => cell === "Assistant").length;
    },
    sortPlanning(planning) {
      let checkers = [];
      let deckmans = [];
      for (let i = 0; i < planning.length; i++) {
        if (planning[i].some((cell) => cell.includes("-checker"))) {
          checkers.push(planning[i]);
        } else if (planning[i].some((cell) => cell.includes("-deckman"))) {
          deckmans.push(planning[i]);
        }
      }
      checkers.sort(
        (a, b) => this.countAssistants(b) - this.countAssistants(a)
      );
      deckmans.sort(
        (a, b) => this.countAssistants(b) - this.countAssistants(a)
      );
      let sortedPlanning = checkers.concat(deckmans);
      return sortedPlanning;
    },
    generatePlanning(stsListLastEdition, headers) {
      const planning = Array.from(
        { length: stsListLastEdition.length * 2 },
        () => Array(headers.length).fill("")
      );
      const lineBreaks = Array(stsListLastEdition.length).fill(0);
      for (let j = 0; j < headers.length; j++) {
        let stsListIndex = 0;
        let currentStsToPut = stsListLastEdition[stsListIndex];
        for (let i = 0; i < stsListLastEdition.length; i++) {
          if (j === 7) {
            if (lineBreaks[i] === 0) {
              planning[i][j] = "B";
              lineBreaks[i]++;
            } else {
              if (currentStsToPut.intervals.includes(headers[j])) {
                planning[i][j] = currentStsToPut.matricule + "-checker";
                stsListIndex++;
                currentStsToPut = stsListLastEdition[stsListIndex];
              } else {
                planning[i][j] = "B";
                lineBreaks[i]++;
                stsListIndex++;
                currentStsToPut = stsListLastEdition[stsListIndex];
              }
            }
          } else {
            if (currentStsToPut.intervals.includes(headers[j])) {
              planning[i][j] = currentStsToPut.matricule + "-checker";
              stsListIndex++;
              currentStsToPut = stsListLastEdition[stsListIndex];
            } else {
              planning[i][j] = "B";
              lineBreaks[i]++;
              stsListIndex++;
              currentStsToPut = stsListLastEdition[stsListIndex];
            }
          }
        }
      }

      const deckermanLineBreaks = Array(stsListLastEdition.length).fill(0);
      for (let j = 0; j < headers.length; j++) {
        let stsListIndex = 0;
        let currentStsToPut = stsListLastEdition[stsListIndex];
        for (
          let i = stsListLastEdition.length;
          i < stsListLastEdition.length * 2;
          i++
        ) {
          if (j === 7) {
            if (deckermanLineBreaks[i - stsListLastEdition.length] === 0) {
              planning[i][j] = "B";
              deckermanLineBreaks[i - stsListLastEdition.length]++;
            } else {
              if (currentStsToPut.intervals.includes(headers[j])) {
                planning[i][j] = currentStsToPut.matricule + "-deckman";
                stsListIndex++;
                currentStsToPut = stsListLastEdition[stsListIndex];
              } else {
                planning[i][j] = "B";
                deckermanLineBreaks[i - stsListLastEdition.length]++;
                stsListIndex++;
                currentStsToPut = stsListLastEdition[stsListIndex];
              }
            }
          } else {
            if (currentStsToPut.intervals.includes(headers[j])) {
              planning[i][j] = currentStsToPut.matricule + "-deckman";
              stsListIndex++;
              currentStsToPut = stsListLastEdition[stsListIndex];
            } else {
              planning[i][j] = "B";
              deckermanLineBreaks[i - stsListLastEdition.length]++;
              stsListIndex++;
              currentStsToPut = stsListLastEdition[stsListIndex];
            }
          }
        }
      }

      for (let i = 0; i < planning.length; i++) {
        let breakCount = 0;
        for (let j = 0; j < planning[i].length; j++) {
          if (planning[i][j] === "B") {
            breakCount++;
            if (breakCount > 1) {
              planning[i][j] = "Assistant";
            }
          }
        }
      }

      for (let i = 0; i < planning.length; i++) {
        let breakCount = 0;
        for (let j = 0; j < planning[i].length; j++) {
          if (planning[i][j] === "B") {
            breakCount++;
            if (breakCount > 1) {
              planning[i][j] = "Assistant";
            }
          }
        }
      }

      const sortedPlanning = this.sortPlanning(planning);
      return sortedPlanning;
    },
    generateRandomHours(maxHours) {
      // Generate a random number that is a multiple of 10 up to maxHours
      return Math.floor(Math.random() * (maxHours / 10 + 1)) * 10;
    },
    sortedAmList(amsList, firstLength, secondLength) {
      amsList.sort(
        (a, b) =>
          b.deckman_workingHours - a.deckman_workingHours ||
          a.checker_workingHours - b.checker_workingHours
      );
      const firstHalf = amsList.slice(0, firstLength);
      const secondHalf = amsList.slice(firstLength, firstLength + secondLength);

      // Sort each half by assistant_workingHours in descending order
      firstHalf.sort(
        (a, b) => a.assistant_workingHours - b.assistant_workingHours
      );
      secondHalf.sort(
        (a, b) => a.assistant_workingHours - b.assistant_workingHours
      );

      // Combine the sorted halves
      const sortedAmsList = [...firstHalf, ...secondHalf];

      return sortedAmsList;
    },
    combineAmListWithPlanning(sortedPlanning, sortedAmList) {
      for (let i = 0; i < sortedPlanning.length; i++) {
        sortedPlanning[i].unshift(sortedAmList[i].id);
      }
      return sortedPlanning;
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
  max-width: 80vw;
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

.ams-container,
.stss-container,
.amsroles-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.8rem;
}

.column {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.am {
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
}

.role {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 120px;
  margin: 0 0.6rem;
  flex-wrap: wrap;
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

.amname,
.stsname,
.rolename {
  font-size: 0.6rem;
  font-weight: bold;
  width: fit-content;
}

.stsname,
.rolename {
  cursor: pointer;
}

.assistantrolename {
  font-size: 0.9rem;
  font-weight: bold;
  cursor: auto;
}

.stsname:hover,
.rolename:hover {
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

.sts,
.role {
  position: relative;
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
