<template>
  <div class="main-parent">
    <div class="parent">
      <!-- List ams with associated switches -->
      <div class="label-column">AMS</div>
      <div class="ams-container">
        <div
          v-for="(chunk, colIndex) in chunkedAMs"
          :key="colIndex"
          class="column"
        >
          <div v-for="(item, rowIndex) in chunk" :key="rowIndex" class="am">
            <div class="amname">{{ item }}</div>
            <v-switch
              v-model="selectedAMs"
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
            <div
              class="stsname"
              @click="openDialog(item)"
              @mouseover="showIcons[item] = true"
              @mouseleave="showIcons[item] = false"
            >
              <span
                :class="{
                  'blue-text': hasIntervalsOrWorkers(item),
                  'green-text': includedWoutIntOrWork(item),
                }"
                >{{ item }}</span
              >
            </div>
            <v-switch
              v-model="selectedSTSs"
              :value="item"
              hide-details
              @change="onChange(item)"
            ></v-switch>
            <v-icon
              v-if="showIcons[item] === true"
              :class="{
                'timer-icon-blue': !includedWoutIntOrWork(item),
                'timer-icon-green': includedWoutIntOrWork(item),
              }"
              @click="openDialog(item)"
              >mdi-cog</v-icon
            >

            <!-- Dialog for adding sts time intervals -->
            <v-dialog
              v-model="dialog[item]"
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
      <!-- List ams roles with associated switches -->
      <div class="label-column">Roles</div>
      <div class="amsroles-container">
        <div
          v-for="(chunk, colIndex) in chunkedRoles"
          :key="colIndex"
          class="column"
        >
          <div v-for="(item, rowIndex) in chunk" :key="rowIndex" class="role">
            <div
              :class="item !== 'assistant' ? 'rolename' : 'assistantrolename'"
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
    <!-- Start Button -->
    <div class="start-button">
      <v-btn
        @click="openSelectionDialog"
        density="default"
        style="background-color: #15263f; color: white; width: 120px"
        >Start</v-btn
      >
    </div>
    <SelectionDialog
      equipementType="AM"
      v-model="showValidateDialog"
      @validateSelections="getData"
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
      @closeDialog="showValidateDialog = false"
    />
  </div>
</template>

<script>
import SelectionDialog from "./ValidateDialog.vue";
import { mapGetters, mapActions } from "vuex";
export default {
  components: {
    SelectionDialog,
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
      showValidateDialog: false,
      keysArray: [],
      showIcons: {},
      showRoleIcons: {},
      roleCount: 0,
      isSaved: {},
      isRoleSaved:{}
    };
  },
  computed: {
    ...mapGetters(["getDrivers", "getEquipements"]),
    hasIntervalsOrWorkers() {
      return (item) => {
        return (
          !!this.intervals[item] ||
          !!this.workers.find((worker) => worker.STS === item)
        );
      };
    },
    hasNumber(){
      return (item) => {
        return !!this.numWorkers[item];
      }
    },
    includedWoutIntOrWork() {
      return (item) => {
        return (
          this.selectedSTSs.includes(item) && !this.isSaved[item]
        );
      };
    },

    includedWoutNum() {
      return (item) => {
        return (
          this.selectedRoles.includes(item) && !this.isRoleSaved[item]
        );
      };
    },

    isSaveButtonDisabled() {
      return (item) => {
        if (this.selectedRole === "TA") {
          if (this.intervals[item]) {
            const isValidIntervals = this.intervals[item].every(
              (interval, i) => {
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
              }
            );
            // Check if any interval is empty
            return (
              this.intervals[item].some(
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
    // returns array of 6 ams per chunk
    chunkedAMs() {
      return this.chunkArray(this.amsList, 6);
    },

    // returns array of 6 stss per chunk
    chunkedSTSs() {
      return this.chunkArray(this.stssList, 6);
    },
    chunkedRoles() {
      return this.chunkArray(this.roles, 6);
    },
  },
  mounted() {
    this.setDrivers();
    this.setIsRoleSaved();
  },
  methods: {
    ...mapActions([
      "setDriversAction",
      "setLoadingValueAction",
      "setEquipementsAction",
    ]),
    setDrivers() {
      const inputs = {
        profile_group: "am",
        role: "am",
      };
      this.setLoadingValueAction(true);
      this.setDriversAction(inputs).then((response) => {
        this.setLoadingValueAction(false);
        this.amsList = this.getDrivers.map(
          (driver) => driver.firstname + " " + driver.lastname
        );
      });
      this.setEquipementsAction().then(() => {
        this.setLoadingValueAction(false);
        this.stssList = this.getEquipements
          .filter((equipement) => equipement.profile_group.type === "sts")
          .map((equipement) => equipement.matricule);
      });
    },
    setIsRoleSaved(){
      for(let role in this.roles){
        this.isRoleSaved[role] = false
      }
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
    // returns selected ams and stss
    getData() {
      console.log("Selected ams : " + this.selectedAMs);
      console.log("Selected TA STSs : " + JSON.stringify(this.intervals));
      console.log("Selected ST STSs : " + JSON.stringify(this.workers));
      console.log("Selected roles : " + this.selectedRoles);
      console.log(
        "Selected roles W ass Num : " + JSON.stringify(this.numWorkers)
      );
      this.showValidateDialog = false;
    },
    // switch on change state
    onChange(item) {
      if (!this.selectedSTSs.includes(item)) {
        this.selectedSTSs = this.selectedSTSs.filter((sts) => sts !== item);
        delete this.intervals[item];
        this.workers = this.workers.filter((worker) => worker.STS !== item);
        this.isSaved[item]=false
      }
    },

    //open sts intervals dialog
    openDialog(item) {
      // Set dialog state for the specific STS item to true
      if (!this.dialog[item]) {
        this.dialog[item] = true;
      }

      // Initialize intervals and workers arrays if not already initialized
      if (!this.intervals[item] || this.intervals[item].length === 0) {
        this.intervals[item] = [{ startTime: "", endTime: "" }];
      }

      if (!this.workers[item] && this.selectedRole === "ST") {
        this.workers[item] = [{ STS: item, worker: "" }];
      }
    },
    // save sts intervals
    saveTime(item) {
      this.isSaved[item] = true;
      if (this.selectedRole === "ST") {
        // Save ST worker for ST role
        delete this.intervals[item];
        const itemToGet = this.workers.find((worker) => worker.STS === item);
        if (!itemToGet)
          this.workers.push({ STS: item, worker: this.selectedSTWorker });
        else {
          itemToGet.worker = this.selectedSTWorker;
          this.workers = this.workers.filter((worker) => worker.STS !== item);
          this.workers.push(itemToGet);
        }
      }
      this.selectedSTSs.push(item);
      this.closeDialog(item, true);
    },

    // close sts intervals dialog
    closeDialog(item, value) {
      if (!value) {
        if (!this.selectedSTSs.includes(item)) {
          this.selectedSTSs = this.selectedSTSs.filter((sts) => sts !== item);
          this.workers = this.workers.filter((worker) => worker.STS !== item);
          delete this.intervals[item];
        } else {
          if (this.selectedRole === "TA") {
            const itemToGet = this.workers.find(
              (worker) => worker.STS === item
            );
            if (itemToGet) {
              delete this.intervals[item];
            } else if (
              this.intervals[item][this.intervals[item].length - 1]
                .startTime === "" &&
              this.intervals[item][this.intervals[item].length - 1].endTime ===
                ""
            ) {
              this.intervals[item].pop();
            }
          }
        }
      } else {
        if (this.selectedRole === "TA") {
          this.workers = this.workers.filter((worker) => worker.STS !== item);
        } else {
          delete this.intervals[item];
        }
      }

      this.dialog[item] = false;
    },

    // Method to change the selected role

    // Method to open the role dialog for a specific role
    openRoleDialog(item) {
      if (item !== "assistant") {
        this.roleCount = this.numWorkers[item] || 1;
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
      this.isRoleSaved[item]=true
      // Close the dialog for the specific role
      if (!this.selectedRoles.includes(item)) {
        this.selectedRoles.push(item);
      }
      this.numWorkers[item] = this.roleCount;
      this.closeRoleDialog(item, true);
    },
    removeDriver(driver) {
      this.selectedAMs = this.selectedAMs.filter((item) => item !== driver);
    },
    removeEquipement(equ) {
      this.selectedSTSs = this.selectedSTSs.filter((sts) => sts !== equ);
      delete this.intervals[equ];
      this.keysArray = Object.keys(this.intervals);
    },
    removeSTSTS(sts) {
      this.selectedSTSs = this.selectedSTSs.filter((item) => item !== sts);
      this.workers = this.workers.filter((worker) => worker.STS !== sts);
      this.isSaved[sts]=false
    },
    openSelectionDialog() {
      this.selectedSTSs = this.selectedSTSs.filter((sts) => {
        return (
          (this.intervals[sts] &&
          this.intervals[sts].length > 0 &&
          (this.intervals[sts][this.intervals[sts].length - 1].startTime !==
            "" ||
            this.intervals[sts][this.intervals[sts].length - 1].endTime !== "")
        ) || this.workers.find((worker) => worker.STS === sts)
      );
      });
      this.keysArray = Object.keys(this.intervals).filter(
        (key) =>
          this.intervals[key].length !== 0 &&
          this.intervals[key][0].startTime !== "" &&
          this.intervals[key][0].endTime !== ""
      );
      this.showValidateDialog = true;
    },
    removeAMRole(role) {
      this.selectedRoles = this.selectedRoles.filter((item) => item !== role);
      delete this.numWorkers[role];
      this.isRoleSaved[role] = false;
    },
    onChangeRole(item){
      if(!this.selectedRoles.includes(item)){
        this.isRoleSaved[item] = false
        delete this.numWorkers[item]
      }
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
.ams-container,
.stss-container,
.amsroles-container {
  display: flex;
  gap: 2rem;
}
.column {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.am,
.sts {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem; /* Espacement entre les ams */
}
.role {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}
.v-switch {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: x-small !important;
}
.amname {
  font-size: 0.9rem;
  font-weight: bold;
  width: 100px;
}
.stsname,
.rolename {
  font-size: 0.9rem;
  font-weight: bold;
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
  writing-mode: vertical-rl; /* Écriture verticale */
  text-align: center; /* Alignement horizontal */
  font-weight: bold;
  font-size: 1.2rem;
  transform: rotate(180deg);
}
.sts,
.role {
  position: relative;
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
</style>
