<template>
  <div class="parent">
    <!-- Settings dialog -->
    <div class="header">
      <h2>Current Shift: {{ selectedShift }}</h2>
      <p>Today's Date: {{ todayDate }}</p>
    </div>
    <div>
      <v-dialog v-model="showSettingsDialog" max-width="500">
        <template v-slot:activator="{ on }"></template>
        <v-card>
          <v-card-title>Settings</v-card-title>
          <v-card-text>
            <!-- Date picker -->
            <v-date-picker v-model="selectedDate"></v-date-picker>
            <!-- Shift select -->
            <v-select
              v-model="selectedShift"
              :items="shifts"
              label="Select Shift"
            ></v-select>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="applySettings">Apply</v-btn>
            <v-btn @click="closeSettingsDialog">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
    <div>
      <v-dialog v-model="showCreateDialog" max-width="500">
        <template v-slot:activator="{ on }"></template>
        <v-card>
          <v-card-title>New Planning</v-card-title>
          <v-card-text>
            <!-- Date picker -->
            <v-date-picker v-model="selectedCreateDate"></v-date-picker>
            <!-- Shift select -->
            <v-select
              v-model="selectedCreateShift"
              :items="shifts"
              label="Select Shift"
            ></v-select>
            <v-select
              v-model="selectedDayTime"
              :items="dayTimes"
              label="Select Day Period"
            ></v-select>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="applyCreate">Apply</v-btn>
            <v-btn @click="closeCreateDialog">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
    <div>
      <v-dialog v-model="dialogDelete" max-width="500px">
        <v-card>
          <v-card-title class="dialogText"
            >Are you sure you want to delete this planning?</v-card-title
          >
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="dialogCancel" variant="text" @click="closeDelete"
              >Cancel</v-btn
            >
            <v-btn class="dialogOk" variant="text" @click="deleteItemConfirm"
              >OK</v-btn
            >
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>

    <div>
      <template>
        <div>
          <v-dialog id="printDialog" v-model="printPlanning" max-width="1500">
            <v-card>
              <v-card-title
                >STS Planning for : {{ formattedDate }} \\ Shift
                {{ selectedShift }}</v-card-title
              >
              <v-card-text>
                <PrintableTable
                  :headers="tableHeaders"
                  :items="planningTable"
                />
              </v-card-text>
              <v-card-actions>
                <v-btn @click="generatePdf" class="dialogOk"
                  >Print as PDF</v-btn
                >
                <v-btn @click="printPlanning = false" class="dialogCancel"
                  >Close</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-dialog>
        </div>
      </template>
    </div>

    <!-- Planning table -->
    <div class="planning">
      <!-- Settings button -->

      <!-- Legend -->
      <div class="legend">
        <!-- Search me -->
        <v-btn
          v-if="
            userRole && (userRole.name === 'driver' || userRole.name === 'am')
          "
          class="search-me"
          @click="searchMe"
        >
          <v-icon>mdi-account-search</v-icon>
        </v-btn>

        <!-- Search Planning -->
        <v-btn @click="openSettingsDialog" class="settings-btn">
          <v-icon>mdi-magnify</v-icon>
        </v-btn>

        <!-- Create Planning-->
        <v-btn
          @click="openCreateDialog"
          class="add-btn"
          v-if="
            userRole && userRole.name !== 'driver' && userRole.name !== 'am'
          "
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>

        <!-- Delete Planning -->
        <v-btn
          @click="openDeleteDialog"
          class="delete-btn"
          v-if="
            userRole && userRole.name !== 'driver' && userRole.name !== 'am'
          "
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>

        <!-- Edit Planning -->
        <v-btn
          v-if="
            userRole && userRole.name !== 'driver' && userRole.name !== 'am'
          "
          @click="editStateOn"
          class="edit-btn"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>

        <!-- Print Planning  -->
        <v-btn @click="openPrintDialog" class="print-button">
          <v-icon>mdi-printer</v-icon>
        </v-btn>
        <!-- Add other legend items here -->
      </div>

      <!-- Table -->
      <v-data-table :headers="header" :items="planningTable" :search="search">
        <template v-slot:thead>
          <thead>
            <tr>
              <th
                v-for="header in tableHeaders"
                :key="header.key"
                :style="{ color: header.color }"
              >
                {{ header.title }}
              </th>
            </tr>
          </thead>
        </template>
        <template v-slot:item="{ item }">
          <tr>
            <template v-for="(value, key) in item" :key="key">
              <td v-if="key !== 'id'">
                <div
                  class="content"
                  :class="{
                    'red-driver': isDriver(key) && isActiveUser(value),
                    'break': !isDriver(key) && isBreak(value.matricule || value),
                    'none-break':
                      !isDriver(key) &&
                      !isBreak(value.matricule || value) &&
                      isST(value.matricule || value),
                    'st':
                      !isDriver(key) &&
                      !isST(value.matricule || value) &&
                      !isBreak(value.matricule || value) &&
                      !isAssistant(value),
                  }"
                >
                  <span
                    class="edit-icon"
                    v-if="
                      editState &&
                      !isDriver(key) &&
                      !isSTSTS(value.matricule || value)
                    "
                    @click="value !== null && openEditDialog(item, key)"
                  >
                    ✏️
                    <!-- Or use an icon from a library like Font Awesome -->
                  </span>
                  {{
                    isActiveUser(value)
                      ? value + " (Me)"
                      : value.matricule || value
                  }}
                </div>
              </td>
            </template>
            <template>
              <v-dialog
                v-model="showEditDialog"
                max-width="500"
                class="custom-dialog"
              >
                <v-card>
                  <v-card-title>Edit Cell</v-card-title>
                  <v-card-text class="edit-cell">
                    <!-- Display the current cell value and allow the user to edit -->
                    <v-select
                      v-model="equip"
                      :items="filteredEquipements"
                      label="Select Equipment"
                      item-title="value"
                      item-value="value"
                      dense
                    ></v-select>
                    <v-select
                      v-model="role"
                      :items="roles"
                      label="Select Role"
                      item-title="value"
                      item-value="value"
                      dense
                    ></v-select>
                    <span v-if="isToReplace" class="replace-span"
                      >( Replace )</span
                    >
                  </v-card-text>
                  <v-card-actions>
                    <!-- Save and Cancel buttons -->
                    <v-btn color="primary" @click="saveCell()">Save</v-btn>
                    <v-btn @click="cancelEdit">Cancel</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </template>
          </tr>
        </template>
        <template v-slot:body.append>
          <tr v-if="editState">
            <td :colspan="tableHeaders.length" class="add-new-item-row">
              <v-btn @click="openAddDialog" class="rounded-plus-btn" fab small>
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </td>
          </tr>
        </template>
      </v-data-table>
      <!-- Plus Button -->

      <!-- Add Dialog -->
      <template>
        <v-dialog v-model="showAddDialog" max-width="500" class="custom-dialog">
          <v-card>
            <v-card-title>Add New Item</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="6">
                  <v-select
                    v-model="selectedDriver"
                    :items="formattedUnassignedDrivers"
                    item-title="fullName"
                    item-value="id"
                    label="Select Driver"
                  ></v-select>
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" @click="handleAddDriver">Apply</v-btn>
              <v-btn @click="cancelAdd">Close</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </template>
    </div>
    <div
      class="buttons"
      v-if="userRole && userRole.name !== 'driver' && userRole.name !== 'am'"
    >
      <v-btn
        class="finish"
        @click="finishPlanning"
        density="default"
        style="background-color: #15263f; color: white; width: 120px"
        >Finish</v-btn
      >
      <v-btn
        :class="{
          'disabled-button': !editState,
          'enabled-button': editState,
        }"
        @click="saveEdits"
        density="default"
        :disabled="!editState"
        style="background-color: #15263f; color: white; width: 120px"
        >Update</v-btn
      >
    </div>
  </div>
</template>

<script>
import DashboardNavigation from "@/components/Dashboard/DashboardNavigation.vue";
import { createWebHistory } from "vue-router";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { mapActions, mapGetters } from "vuex";
import moment from "moment";
import PrintableTable from "../../Print/PrintableTable.vue";

export default {
  data() {
    return {
      planning: [],
      planningId: -1,
      planningTable: [],
      tableHeaders: [],
      header: [],
      selectedDate: new Date(),
      selectedShift: "",
      shifts: ["A", "B", "C", "D"],
      showDatePicker: false,
      activeProfileGroup: "am",
      shiftId: -1,
      profileGroupId: -1,
      showSettingsDialog: false,
      showCreateDialog: false,
      selectedCreateDate: new Date(),
      selectedCreateShift: "",
      createdPlanningData: null,
      dateCountChange: 0,
      userWorkingHours: {},
      usersWorkingHours: [],
      dialogDelete: false,
      dayTimes: ["Morning", "Evening", "Night"],
      selectedDayTime: "",
      todayDate: "",
      showEditDialog: false,
      editableCell: null,
      itemToEdit: {
        item: null,
        key: null,
        value: null,
        role: null,
      },
      equipments: [],
      filteredEquipements: [],
      boxesObjects: {},
      userRole: null,
      editState: false,
      itemsToEdit: [],
      userActive: null,
      search: "",
      oldValue: null,
      oldRole: null,
      showAddDialog: false,
      unassignedDrivers: [],
      selectedDriver: {
        id: -1,
        fullName: "",
      },
      formattedUnassignedDrivers: [],
      unassignedIntervalSTS: [],
      planningEquipments: [],
      uncoveredIntervals: [],
      transormedData: [],
      neededSTSIntervals: [],
      printPlanning: false,
      roles: ["checker", "deckman", "assistant"],
      equip: "",
      role: "",
      isToReplace: false,
      stEquipements: [],
    };
  },
  components: {
    DashboardNavigation,
    PrintableTable,
  },
  watch: {
    activeProfileGroup(newVal, oldVal) {
      // Reload the page when activeProfileGroup changes
      if (newVal !== oldVal) {
        if (this.selectedDate && this.selectedShift) this.setPlanning(true);
        else this.setPlanning();
      }
    },
    selectedDate(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.dateCountChange += 1;
      }
    },
    selectedDayTime(newVal, oldVal) {
      if (newVal !== oldVal) {
        if (this.selectedCreateDate) {
          switch (this.selectedDayTime) {
            case "Morning":
              this.selectedCreateShift = this.shifts[0];
              break;
            case "Evening":
              this.selectedCreateShift = this.shifts[1];
              break;
            case "Night":
              this.selectedCreateShift = this.shifts[2];
              break;
            default:
              time = "00:00:00";
          }
        }
      }
    },
    selectedCreateDate(newVal, oldVal) {
      if (newVal !== oldVal) {
        if (this.selectedDayTime) {
          switch (this.selectedDayTime) {
            case "Morning":
              this.selectedCreateShift = this.shifts[0];
              break;
            case "Evening":
              this.selectedCreateShift = this.shifts[1];
              break;
            case "Night":
              this.selectedCreateShift = this.shifts[2];
              break;
            default:
              time = "00:00:00";
          }
        }
      }
    },
    equip(newVal, oldVal) {
      if (newVal !== oldVal) {
        if (newVal === "B") {
          this.role = "";
        }

        console.log(this.planningTable);
        const sameCol = [];
        console.log(sameCol);
        const sameColPlanning = this.planningTable.filter((item) => {
          if (item[this.itemToEdit.key]) {
            return (
              item[this.itemToEdit.key].matricule ===
                newVal + "-" + this.role &&
              item[this.itemToEdit.key].matricule !==
                this.itemToEdit.value + "-" + this.itemToEdit.role
            );
          }
        });
        if (sameColPlanning[0]) this.isToReplace = true;
        else this.isToReplace = false;
        this.itemToEdit.value = newVal;
      }
    },
    role(newVal, oldVal) {
      if (newVal !== oldVal) {
        if (newVal === "assistant") {
          this.equip = "";
        }
        const sameColPlanning = this.planningTable.filter((item) => {
          if (item[this.itemToEdit.key]) {
            return (
              item[this.itemToEdit.key].matricule ===
                this.equip + "-" + newVal &&
              item[this.itemToEdit.key].matricule !==
                this.itemToEdit.value + "-" + this.itemToEdit.role
            );
          }
        });
        if (sameColPlanning[0]) this.isToReplace = true;
        else this.isToReplace = false;
        this.itemToEdit.role = newVal;
      }
    },
  },

  computed: {
    ...mapGetters([
      "getCurrentAMPlanning",
      "getPlanningBoxes",
      "getEquipements",
      "getUserRole",
      "getUserActive",
      "getDrivers",
      "getPlanningEquipements",
    ]),
    formattedDate() {
      // Convert selectedDate to local timezone
      if (this.dateCountChange > 0) {
        const localDate = new Date(
          this.selectedDate.getTime() +
            this.selectedDate.getTimezoneOffset() * 60000
        );
        // if (localDate.getTime() !== todayDate.getTime())
        // localDate.setDate(localDate.getDate()+1);
        // else
        localDate.setDate(localDate.getDate() + 1);
        // console.log(localDate)
        // Get the date string in yyyy-mm-dd format
        return localDate.toISOString().split("T")[0];
      } else {
        return new Date().toISOString().split("T")[0];
      }
    },
  },
  mounted() {
    this.setEquipements();
  },

  methods: {
    ...mapActions([
      "setCurrentAMPlanning",
      "setLoadingValueAction",
      "setPlanningBoxes",
      "setShiftByCategory",
      "setShiftByTime",
      "setProfileGroupByType",
      "editUserAction",
      "deleteAMPlanningAction",
      "setEquipementsAction",
      "setBoxUpdateAction",
      "setDriversAction",
      "setPlanningDrivers",
      "setBoxAction",
      "addUserToPlanning",
      "setPlanningEquipements",
    ]),
    openSettingsDialog() {
      this.showSettingsDialog = true;
    },
    openDeleteDialog() {
      this.dialogDelete = true;
    },
    openCreateDialog() {
      this.showCreateDialog = true;
    },
    closeSettingsDialog() {
      this.showSettingsDialog = false;
    },
    closeCreateDialog() {
      this.showCreateDialog = false;
    },
    applySettings() {
      this.setLoadingValueAction(true);
      this.setPlanning(true);
      this.closeSettingsDialog();
    },
    applyCreate() {
      this.createdPlanningData = {
        date: this.selectedCreateDate,
        shift: this.selectedCreateShift,
      };
      // console.log(this.createdPlanningData)
      this.$emit("createPlanning", this.createdPlanningData);
      this.closeCreateDialog();
    },
    setInitialShift() {
      const nowDate = new Date();
      if (nowDate.getHours() >= 7 && nowDate.getHours() < 15)
        this.selectedShift = this.getActualShift()[0];
      else if (nowDate.getHours() >= 15 && nowDate.getHours() < 23)
        this.selectedShift = this.getActualShift()[1];
      else if (
        nowDate.getHours() == 23 ||
        (nowDate.getHours() >= 0 && nowDate.getHours() < 7)
      )
        this.selectedShift = this.getActualShift()[2];
      this.selectedCreateShift = this.selectedShift;
      this.setShiftByCategory({ category: this.selectedShift }).then(
        (response) => {
          this.shiftId = response[0].id;
          // console.log(this.shiftId)
          const inputs = {
            profile_group: "am",
            role: "am",
            shift_id: this.shiftId,
          };
          // console.log(inputs)
          this.setDriversAction(inputs).then((response) => {
            this.unassignedDrivers = this.getDrivers;
            // console.log(this.unassignedDrivers)
          });
          this.setPlanning();
        }
      );
    },
    updateActiveComponent(value) {
      switch (value) {
        case "RTGhome":
          this.activeProfileGroup = "rtg";
          break;
        case "STShome":
          this.activeProfileGroup = "sts";
          break;
        case "RShome":
          this.activeProfileGroup = "rs";
          break;
        case "AMhome":
          this.activeProfileGroup = "am";
          break;
      }
    },
    isDriver(key) {
      return key === "driver";
    },
    isST(value) {
      return value.includes("STS") || value==="assistant";
    },
    isSTSTS(value) {
      return (
        !value.includes("-") &&
        value !== "B" &&
        value !== "DB" &&
        value !== "assistant"
      );
    },
    isActiveUser(value) {
      return (
        value ===
        this.userActive.firstname +
          " " +
          this.userActive.lastname +
          " (" +
          this.userActive.workingHours +
          ")"
      );
    },
    isBreak(value) {
      return value === "B" || value === "DB";
    },
    isAssistant(value) {
      return value === "assistant";
    },
    setPlanning(value) {
      const today = new Date(this.formattedDate);
      const options = { year: "numeric", month: "long", day: "numeric" };
      this.todayDate = today.toLocaleDateString(undefined, options);
      this.planningTable = [];
      if (!value) {
        let currentDate = new Date();
        let year = currentDate.getFullYear();
        let month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // Months are zero indexed, so we add 1
        let day = currentDate.getDate().toString().padStart(2, "0");
        let formattedDate = year + "-" + month + "-" + day;
        const activeType = {
          type: this.activeProfileGroup,
        };
        this.setProfileGroupByType(activeType).then((response) => {
          this.profileGroupId = response[0].id;
          const dateObject = {
            date: formattedDate,
            shift_id: this.shiftId,
            profile_group_id: this.profileGroupId,
            profileType: "am",
          };
          // console.log(dateObject);
          this.DisplayPlanning(dateObject);
        });
      } else {
        this.showDatePicker = false;
        const shift = {
          category: this.selectedShift,
        };

        this.setShiftByCategory(shift).then((response) => {
          this.shiftId = response[0].id;
          const activeType = {
            type: this.activeProfileGroup,
          };
          this.setProfileGroupByType(activeType).then((response) => {
            this.profileGroupId = response[0].id;
            // console.log(this.formattedDate);
            const dateObject = {
              date: this.formattedDate,
              shift_id: this.shiftId,
              profile_group_id: this.profileGroupId,
              profileType: "am",
            };

            this.DisplayPlanning(dateObject);
          });
        });
      }
    },
    transformPlanningBoxes() {
      // Assuming this.planning is your array of boxes
      let transformed = {};
      let transformedMatricule = {};

      this.planning.forEach((box) => {
        // Create the time interval key
        const timeInterval = `${box.start_time}-${box.ends_time}`;

        // If the key doesn't exist in the transformed object, create it
        if (!transformed[timeInterval]) {
          transformed[timeInterval] = [];
          transformedMatricule[timeInterval] = [];
        }

        // Push the equipment_id into the array for this time interval
        if (box.equipement_id) {
          transformed[timeInterval].push(box.equipement_id);
          transformedMatricule[timeInterval].push(box.equipement.matricule);
        }
      });

      // If you need the transformed object as an array of key-value pairs
      const transformedArray = Object.keys(transformed).map((timeInterval) => ({
        timeInterval,
        equipment_ids: transformed[timeInterval],
        matricules: transformedMatricule[timeInterval],
      }));

      return transformedArray;
    },
    getUncoveredIntervals(equipmentArray, intervalsArray) {
      const uncoveredIntervals = [];

      for (const intervalObj of intervalsArray) {
        const [intervalStart, intervalEnd] =
          intervalObj.timeInterval.split("-");
        const uncoveredSts = [];

        for (const equipment of equipmentArray) {
          for (const workingInterval of equipment.workingHours) {
            const workingStart = this.timeToMinutes(workingInterval.start_time);
            const workingEnd = this.timeToMinutes(workingInterval.end_time);

            const start = this.timeToMinutes(intervalStart);
            const end = this.timeToMinutes(intervalEnd);

            if (
              start >= workingStart &&
              end <= workingEnd &&
              !intervalObj.equipment_ids.includes(equipment.id)
            ) {
              uncoveredSts.push(equipment.matricule);
            }
          }
        }

        if (uncoveredSts.length > 0) {
          uncoveredIntervals.push({
            interval: intervalObj.timeInterval,
            sts: uncoveredSts,
          });
        }
      }

      console.log(uncoveredIntervals);
      return uncoveredIntervals;
    },
    async DisplayPlanning(dateObject) {
      console.log(dateObject);
      try {
        await this.setCurrentAMPlanning(dateObject);
        this.planning = this.getCurrentAMPlanning;
        if (this.planning) {
          //   console.log(JSON.stringify(this.planning));
          this.planningId = this.planning.id;
          const planningId = {
            planning_id: this.planning.id,
          };
          this.setPlanningEquipements(planningId).then(() => {
            this.planningEquipments = this.getPlanningEquipements.map(
              (pEquip) => {
                const workingHours =
                  pEquip.equipement_planning_working_hours.map((it) => {
                    return {
                      start_time: it.start_time,
                      end_time: it.end_time,
                    };
                  });
                return {
                  id: pEquip.equipement_id,
                  matricule: pEquip.equipement.matricule,
                  workingHours: workingHours,
                };
              }
            );
            this.stEquipements = this.getPlanningEquipements
              .filter((pe) => pe.subcontract != null)
              .map((pe) => {
                return {
                  worker: pe.subcontract,
                  STS: pe.equipement.matricule,
                };
              });
            // console.log(this.stEquipements);
            this.stEquipements = this.stEquipements.map((item) => {
              // Create a row starting with the STS property
              const row = [item.worker];

              // Add 8 columns of the worker property
              for (let i = 0; i < 8; i++) {
                row.push(item.STS);
              }

              return row;
            });
            console.log(this.stEquipements);
          });
          this.setPlanningDrivers(planningId).then((response) => {
            // console.log(response);
            // console.log(this.unassignedDrivers);
            this.unassignedDrivers = this.unassignedDrivers.filter(
              (driver) =>
                !response.some(
                  (planningDriver) => planningDriver.user_id === driver.id
                )
            );
            this.formattedUnassignedDrivers = this.unassignedDrivers.map(
              (driver) => ({
                id: driver.id,
                fullName: `${driver.firstname} ${driver.lastname}`,
              })
            );
            // console.log(this.formattedUnassignedDrivers);
          });
          this.setPlanningBoxes(planningId).then(() => {
            this.planning = this.getPlanningBoxes;

            const transformed = this.transformPlanningBoxes();
            console.log(transformed);
            this.transormedData = transformed;
            // console.log(transformed)
            this.uncoveredIntervals = this.getUncoveredIntervals(
              this.planningEquipments,
              transformed
            );
            // console.log(this.uncoveredIntervals)
            this.neededSTSIntervals = this.uncoveredIntervals.map((item) => {
              return item.interval;
            });

            // console.log(this.neededSTSIntervals);
            this.transormedData.forEach((item) => {
              const transData = this.uncoveredIntervals.find((uncovInt) => {
                return uncovInt.interval === item.timeInterval;
              });
              if (transData) {
                transData.sts.forEach((tData) => {
                  item.matricules.push(tData);
                });
              }
            });
            // console.log(this.uncoveredIntervals);
            // Extract unique time intervals
            // Initialize an empty array to store unique time intervals
            const timeIntervals = [];
            const timeIntervalsTable = [];
            this.planning.forEach((box) => {
              // Check if the current time interval already exists in the timeIntervals array
              const existingIntervalIndex = timeIntervalsTable.findIndex(
                (interval) => {
                  return (
                    interval.title === `${box.start_time}-${box.ends_time}`
                  );
                }
              );

              // If the current time interval doesn't exist in the array, add it
              if (existingIntervalIndex === -1) {
                timeIntervalsTable.push({
                  title: `${box.start_time}-${box.ends_time}`,
                  sortable: false,
                  key: `interval_${timeIntervalsTable.length}`,
                });
                timeIntervals.push({
                  start_time: box.start_time,
                  ends_time: box.ends_time,
                });
              }
            });

            // Create the table headers
            this.tableHeaders = [
              {
                title: "AM",
                align: "start",
                sortable: false,
                key: "driver",
              },
              ...timeIntervalsTable,
            ];
            // console.log("this.needed : ", this.neededSTSIntervals);
            // console.log("this.tableheaders : ", this.tableHeaders);

            // Extract unique users from the planning array
            const uniqueUsers = Array.from(
              new Set(this.planning.map((box) => box.user.id || box.role))
            );

            // Initialize the planning table data
            this.planningTable = [];

            // Iterate over each unique user
            this.userWorkingHours = {};
            this.usersWorkingHours = [];
            uniqueUsers.forEach((userId) => {
              // Find the boxes for the current user
              const userBoxes = this.planning.filter(
                (box) => box.user.id === userId
              );

              userBoxes.forEach((box) => {
                // console.log(box)
                const {
                  user,
                  start_time,
                  ends_time,
                  break: isBreak,
                  id,
                  role,
                } = box;
                // this.boxesObjects.push({
                //   user_id:user_id,
                //   start_time:start_time,
                //   ends_time:ends_time,
                // })
                // console.log(user.firstname+ " "+user.workingHours)
                // this.userWorkingHours = {}
                // Check if break is false
                if (!isBreak) {
                  // Convert start_time and ends_time to minutes
                  const [startHours, startMinutes] = start_time
                    .split(":")
                    .map(Number);
                  const [endHours, endMinutes] = ends_time
                    .split(":")
                    .map(Number);

                  // Calculate working hours
                  const startTimeMinutes = startHours * 60 + startMinutes;
                  const endTimeMinutes = endHours * 60 + endMinutes;
                  const workingMinutes = endTimeMinutes - startTimeMinutes;
                  // console.log(workingMinutes);
                  if (!this.userWorkingHours[user.id]) {
                    // If this.userWorkingHours[user.id] doesn't exist, initialize it as an object with oldValue and totalWorkingHours properties
                    this.userWorkingHours[user.id] = {
                      oldCheckerValue: user.checker_workingHours,
                      totalCheckerWorkingHours:
                        role === "checker"
                          ? user.checker_workingHours + workingMinutes
                          : user.checker_workingHours,
                      oldDeckmanValue: user.deckman_workingHours,
                      totalDeckmanWorkingHours:
                        role === "deckman"
                          ? user.deckman_workingHours + workingMinutes
                          : user.deckman_workingHours,
                      oldAssistantValue: user.assistant_workingHours,
                      totalAssistantWorkingHours:
                        role === "assistant"
                          ? user.assistant_workingHours + workingMinutes
                          : user.assistant_workingHours,
                    };
                  } else {
                    // If this.userWorkingHours[user.id] already exists, update its properties
                    if (role === "checker") {
                      this.userWorkingHours[user.id].totalCheckerWorkingHours +=
                        workingMinutes;
                    } else if (role === "deckman") {
                      this.userWorkingHours[user.id].totalDeckmanWorkingHours +=
                        workingMinutes;
                    } else if (role === "assistant") {
                      this.userWorkingHours[
                        user.id
                      ].totalAssistantWorkingHours += workingMinutes;
                    }
                  }
                }
              });

              // console.log(this.userWorkingHours);
              const userToUpdate = {
                id: userId,
                checker_workingHours:
                  this.userWorkingHours[userId]?.totalCheckerWorkingHours || 0,
                deckman_workingHours:
                  this.userWorkingHours[userId]?.totalDeckmanWorkingHours || 0,
                assistant_workingHours:
                  this.userWorkingHours[userId]?.totalAssistantWorkingHours ||
                  0,
              };
              // console.log(userToUpdate);
              //console.log(userToUpdate)
              this.usersWorkingHours.push(userToUpdate);
              // this.editUserAction(userToUpdate),then((response)=>{
              //   console.log(response)
              // })

              // Create a new row for the current user
              const row = {
                driver: `${userBoxes[0].user.firstname} ${userBoxes[0].user.lastname} (${userBoxes[0].user.checker_workingHours} | ${userBoxes[0].user.deckman_workingHours} | ${userBoxes[0].user.assistant_workingHours} )`, // Driver's full name from the first box
                id: userBoxes[0].user.id,
              };

              // Iterate over each interval (header)
              timeIntervals.forEach((interval, index) => {
                // Find the boxes for the current user and interval
                const boxesInInterval = userBoxes.filter(
                  (box) =>
                    box.start_time === interval.start_time &&
                    box.ends_time === interval.ends_time
                );

                // If there are boxes in the interval, concatenate their equipement_ids

                if (boxesInInterval.length > 0) {
                  let cellContent = "";
                  boxesInInterval.forEach((box) => {
                    if (!box.equipement_id) {
                      if (box.break) {
                        cellContent = {
                          matricule: "B",
                          boxId: box.id,
                        };
                      } else {
                        cellContent = {
                          matricule: "assistant",
                          boxId: box.id,
                        };
                      }
                    } else {
                      cellContent = {
                        matricule: box.equipement.matricule + "-" + box.role,
                        boxId: box.id,
                      };
                    }
                  });
                  row[`interval_${index}`] = cellContent;
                } else {
                  row[`interval_${index}`] = ""; // If no boxes, leave the cell empty
                }
              });

              // Push the row to the planning table data
              let hasEncounteredP = false;

              // Iterate over each key in the row object
              for (let key in row) {
                // Check if the value is "P" and if it's the second occurrence
                if (row[key].matricule === "B" && hasEncounteredP) {
                  // Replace "P" with "DP"
                  row[key].matricule = "DB";
                } else if (row[key].matricule === "B") {
                  // Set the flag to true if "P" is encountered for the first time
                  hasEncounteredP = true;
                }
              }

              this.planningTable.push(row);
              // console.log(row)
              this.setLoadingValueAction(false);
            });
            this.planningTable = [...this.planningTable, ...this.stEquipements];
            // console.log(this.planningTable)
          });
        } else {
          console.log("Planning not found");
          this.setLoadingValueAction(false);
        }
      } catch (error) {
        this.setLoadingValueAction(false);
        console.error(error);
      }
    },
    toggleDatePicker() {
      this.showDatePicker = !this.showDatePicker; // Toggle the visibility
    },
    timeToMinutes(time) {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    },
    finishPlanning() {
      const usersWorkingHoursToSave = this.usersWorkingHours.map((usWh) => {
        const userWorkingHours = { id: usWh.id };

        if (usWh.checker_workingHours !== 0) {
          userWorkingHours.checker_workingHours = usWh.checker_workingHours;
        }

        if (usWh.deckman_workingHours !== 0) {
          userWorkingHours.deckman_workingHours = usWh.deckman_workingHours;
        }

        if (usWh.assistant_workingHours !== 0) {
          userWorkingHours.assistant_workingHours = usWh.assistant_workingHours;
        }

        return userWorkingHours;
      });
      console.log(usersWorkingHoursToSave);
      this.setLoadingValueAction(true);
      usersWorkingHoursToSave.forEach((user) => {
        this.editUserAction(user).then(() => {
          this.setLoadingValueAction(false);
          console.log("updated successfully");
        });
      });
      console.log(this.userWorkingHours);
    },
    closeDelete() {
      this.dialogDelete = false;
    },
    deleteItemConfirm() {
      this.setLoadingValueAction(true);
      this.deleteAMPlanningAction({ id: this.planning[0].planning_id }).then(
        () => {
          this.dialogDelete = false;
          this.setLoadingValueAction(false);
          this.createdPlanningData = {
            date: this.selectedDate,
            shift: this.selectedShift,
          };

          this.$emit("createPlanning", this.createdPlanningData);
        }
      );
      // this.createdPlanningData = {
      //   date: this.selectedDate,
      //   shift: this.selectedShift,
      // };
      // console.log(this.createdPlanningData)
      // console.log(this.selectedShift)
      // console.log(this.selectedDate)
      // console.log(this.planning[0].planning.shift_id)
    },
    getActualShift(date) {
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
    setEquipements() {
      this.setLoadingValueAction(true);
      let date = new Date(this.selectedCreateDate);
      let year = date.getFullYear();
      let month = ("0" + (date.getMonth() + 1)).slice(-2);
      let day = ("0" + date.getDate()).slice(-2);
      let formattedDate = `${year}-${month}-${day}`;
      let dateTime = `${formattedDate}`;
      this.shifts = this.getActualShift(dateTime);
      this.shifts.pop();
      this.search = "";
      this.userRole = this.getUserRole;
      this.userActive = this.getUserActive;
      //   console.log(this.userRole);
      this.setEquipementsAction().then(() => {
        this.equipments = this.getEquipements
          .filter((equipement) => equipement.profile_group.type === "sts")
          .map((equip) => equip.matricule);
        this.equipments.push("B");
        // console.log(this.equipments)
        this.setInitialShift();
        console.log("shift : " + this.shiftId);
      });
    },
    openEditDialog(item, key) {
      // Reset old value
      this.oldValue = null;
      this.oldRole = null;
      this.isToReplace = false;
      // Get the existing equipment matricules for the column, filtering out "B"
      let existingEquipements = this.planningTable.map((item) => {
        if (item[key]) {
          if (item[key].matricule.includes("-")) {
            return item[key].matricule.split("-")[0];
          }
        }
      });
      existingEquipements = existingEquipements.filter(
        (equ) => equ != undefined && equ != "B"
      );

      existingEquipements = Array.from(new Set(existingEquipements));
      // console.log(existingEquipements);
      // Filter equipments, adding a "replace" option
      const index = parseInt(key.match(/\d+/)[0]);
      //   console.log(this.tableHeaders[index+1].title)
      //   console.log(this.uncoveredIntervals)
      console.log(this.transormedData);
      const wantedItem = this.transormedData.find(
        (uncocInt) =>
          uncocInt.timeInterval === this.tableHeaders[index + 1].title
      );
      //   console.log(wantedItem)
      if (wantedItem) {
        this.filteredEquipements = wantedItem.matricules
          .filter((sts) => sts != item[key].sts)
          .map((sts) => {
            // Check if the equipment is already in use in the column
            const isExisting = existingEquipements.includes(sts);

            // If it's the current item being edited, keep it in the list with a "replace" tag
            // if (isExisting && equipment !== item[key].matricule) {
            //   return null; // Skip adding to the filtered list
            // }

            // Add the "replace" label if the equipment is existing
            return {
              value: sts,
            };
          })
          .filter(Boolean);
        this.filteredEquipements.push("B");
      }
      const objectArray = this.filteredEquipements.filter(
        (item) => typeof item === "object" && item !== null
      );

      // Create a Map to filter out duplicates based on 'value' property
      const uniqueObjectsMap = new Map();
      objectArray.forEach((item) => {
        uniqueObjectsMap.set(item.value, item);
      });

      // Convert the map back to an array
      const uniqueObjectsArray = Array.from(uniqueObjectsMap.values());

      // If you need to include other non-object items (like 'B'), you can do the following:
      this.filteredEquipements = [
        ...uniqueObjectsArray,
        ...this.filteredEquipements.filter(
          (item) => typeof item !== "object" || item === null
        ),
      ];
      console.log(this.filteredEquipements);
      // Set up the item to edit
      this.itemToEdit.item = item;
      this.oldValue = item[key]?.matricule;

      this.itemToEdit.key = key;
      if (this.oldValue === "B") {
        this.itemToEdit.value = item[key]?.matricule;
        this.itemToEdit.role = null;
      } else if (this.oldValue === "assistant") {
        this.itemToEdit.role = item[key]?.matricule;
        this.itemToEdit.value = null;
      } else {
        this.itemToEdit.value = item[key]?.matricule.split("-")[0];
        this.itemToEdit.role = item[key]?.matricule.split("-")[1];
      }
      this.equip = this.itemToEdit.value;
      this.role = this.itemToEdit.role;
      console.log(this.itemToEdit);
      // Open the edit dialog
      this.showEditDialog = true;
    },
    saveCell() {
      // this.itemsToEdit = [];
      // Check if this.editableCell is not null
      if (this.itemToEdit.item && this.itemToEdit.key !== null) {
        // Update the value of the cell in the item object
        let objectToSave = null;
        if (this.itemToEdit.value === "B") {
          this.itemToEdit.item[this.itemToEdit.key].matricule =
            this.itemToEdit.value;
          objectToSave = {
            id: this.itemToEdit.item[this.itemToEdit.key].boxId,
            equipement_id: null,
            role: null,
            break: 1,
          };
        } else if (this.itemToEdit.role === "assistant") {
          this.itemToEdit.item[this.itemToEdit.key].matricule =
            this.itemToEdit.role;
          objectToSave = {
            id: this.itemToEdit.item[this.itemToEdit.key].boxId,
            equipement_id: null,
            role: this.itemToEdit.role,
            break: false,
          };
        } else {
          this.itemToEdit.item[this.itemToEdit.key].matricule =
            this.itemToEdit.value + "-" + this.itemToEdit.role;
        }
        const equipement = this.getEquipements.find(
          (equ) => equ.matricule === this.itemToEdit.value
        );
        const sameColumnItem = this.planningTable
          .filter((it) => {
            if(it[this.itemToEdit.key]){
              return (
              it[this.itemToEdit.key].boxId !=
                this.itemToEdit.item[this.itemToEdit.key].boxId &&
              it[this.itemToEdit.key].matricule ===
                this.itemToEdit.item[this.itemToEdit.key].matricule &&
              it[this.itemToEdit.key].matricule !== "B" &&
              it[this.itemToEdit.key].matricule !== "DB" &&
              it[this.itemToEdit.key].matricule !== "assistant"
            );
            }
            
          })
          .map((it) => it[this.itemToEdit.key]);
        if (sameColumnItem && sameColumnItem.length > 0) {
          let equipement2 = null;
          let role = null;
          if (this.oldValue != "B" && this.oldValue != "assistant") {
            equipement2 = this.getEquipements.find(
              (equ) => equ.matricule === this.oldValue.split("-")[0]
            );
            role = this.oldValue.split("-")[1];
          } else if (this.oldValue === "assistant") {
            role = this.oldValue;
          }
          sameColumnItem[0].matricule = this.oldValue;
          const objectToReplace = {
            id: sameColumnItem[0].boxId,
            equipement_id: equipement2 ? equipement2.id : null,
            role: role,
            break:
              sameColumnItem[0].matricule === "B" ||
              sameColumnItem[0].matricule === "DB",
          };
          this.itemsToEdit.push(objectToReplace);
        }
        if (
          equipement ||
          this.itemToEdit.value === "B" ||
          this.itemToEdit.value === "DB"
        ) {
          objectToSave = {
            id: this.itemToEdit.item[this.itemToEdit.key].boxId,
            equipement_id:
              equipement && this.itemToEdit.role != "assistant"
                ? equipement.id
                : null,
            role: equipement ? this.itemToEdit.role : null,
            break:
              this.itemToEdit.value === "B" || this.itemToEdit.value === "DB",
          };
        }

        this.itemsToEdit.push(objectToSave);
        console.log(this.itemsToEdit);

        // Reset itemToEdit
        this.itemToEdit.item = null;
        this.itemToEdit.key = null;
        this.itemToEdit.value = null;
        this.itemToEdit.role = null;
        this.showEditDialog = false;
      }
      // console.log(this.editableCell.value)
      // console.log(this.editableCell.item[this.editableCell.key])
    },
    cancelEdit() {
      // Reset any changes made in the dialog
      // Close the edit dialog
      this.showEditDialog = false;
    },
    editStateOn() {
      this.editState = !this.editState;
    },
    saveEdits() {
      // console.log(this.itemsToEdit);
      const promises = [];
      if (this.itemsToEdit && this.itemsToEdit.length > 0) {
        this.setLoadingValueAction(true);
        this.itemsToEdit.forEach((item) => {
          promises.push(this.setBoxUpdateAction(item));
        });
        Promise.all(promises).then(() => {
          this.setLoadingValueAction(false);
          this.editState = false;
          this.itemsToEdit = [];
          window.location.reload();
        });
        // console.log(this.itemsToEdit)
      }
    },
    searchMe() {
      this.search =
        this.search === ""
          ? this.userActive.firstname + " " + this.userActive.lastname
          : "";
    },
    openAddDialog() {
      this.showAddDialog = true;
      console.log("add");
      console.log(this.planningTable);
    },
    cancelAdd() {
      this.showAddDialog = false;
    },
    addDriverToPlanningTable(driver) {
      // Set loading value to true
      this.setLoadingValueAction(true);

      // Array to hold promises for adding the user to planning and creating boxes
      const promises = [];

      // Prepare data for adding the user to planning
      const userWPlanning = {
        user_id: driver.id,
        planning_id: this.planningId,
      };

      // Add promise for adding the user to planning
      promises.push(this.addUserToPlanning(userWPlanning));

      // Create promises for creating boxes for each time interval
      this.tableHeaders
        .filter((header) => header.key.startsWith("interval_"))
        .forEach((header, index) => {
          // Prepare data for box creation
          const boxData = {
            planning_id: this.planningId,
            user_id: driver.id,
            equipement_id: null,
            break: true,
            start_time: this.tableHeaders[index + 1].title.split("-")[0], // Adjust index to skip the driver column
            ends_time: this.tableHeaders[index + 1].title.split("-")[1], // Same as start time
            role: null,
          };

          // Add promise for creating the box
          promises.push(
            this.setBoxAction(boxData).then((response) => {
              // Return the cell content for the header key
              return {
                [header.key]: {
                  matricule: "B",
                  boxId: response.id,
                },
              };
            })
          );
        });

      // Execute all promises
      Promise.all(promises)
        .then((results) => {
          // Separate results into user addition response and cell contents
          const [userAdditionResponse, ...cellContents] = results;

          // Combine all cell contents into a single object
          const combinedCellContents = Object.assign({}, ...cellContents);

          // Create the new row with the combined cell contents
          const newRow = {
            driver: `${driver.firstname} ${driver.lastname}`,
            id: driver.id,
            ...combinedCellContents,
          };

          // Push the new row to the planningTable array
          this.planningTable.push(newRow);
          this.setEquipements();
          // Set loading value to false
          this.setLoadingValueAction(false);
        })
        .catch((error) => {
          console.error(
            "Error adding user to planning or creating boxes:",
            error
          );
          // Set loading value to false in case of error
          this.setLoadingValueAction(false);
        });
    },
    handleAddDriver() {
      // Add the driver to the planningTable
      // this.addDriverToPlanningTable(this.selectedDriver);

      // Optionally, perform any other actions needed after adding the driver
      // For example, closing the add dialog
      const driver = this.unassignedDrivers.find(
        (driver) => driver.id === this.selectedDriver
      );
      this.addDriverToPlanningTable(driver);
      // console.log(driver);
      this.cancelAdd();
    },
    minutesToTime(minutes) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${String(hours).padStart(2, "0")}:${String(mins).padStart(
        2,
        "0"
      )}`;
    },
    openPrintDialog() {
      this.printPlanning = true;
    },
    generatePdf() {
      const dialogContent = document.querySelector("#printDialog");

      // Hide the buttons temporarily
      const buttons = dialogContent.querySelectorAll(".v-card-actions");
      buttons.forEach((button) => {
        button.style.display = "none";
      });

      html2canvas(dialogContent, { height: dialogContent.scrollHeight }).then(
        (canvas) => {
          const pdf = new jsPDF("landscape", "mm", "a4");
          const imgData = canvas.toDataURL("image/png");
          const imgWidth = 297; // A4 width in mm
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          const header = "Tanger Alliance";
          const fontSize = 24;
          const textColor = "#15263f"; // Blue color (you can change this to any valid CSS color)
          const fontWeight = "bold";
          const textX =
            (pdf.internal.pageSize.getWidth() -
              (pdf.getStringUnitWidth(header) * fontSize) /
                pdf.internal.scaleFactor) /
            2; // X coordinate for text (centered horizontally)
          const textY = 20; // Y coordinate for text
          const imageX = 10; // X coordinate for image
          const imageY = 50; // Y coordinate for image
          pdf.setFontSize(fontSize);
          pdf.setTextColor(textColor);
          pdf.setFont("helvetica", fontWeight);
          pdf.text(header, textX, textY);
          pdf.addImage(imgData, "PNG", 0, imageY, imgWidth, imgHeight);
          buttons.forEach((button) => {
            button.style.display = "flex";
          });
          const fileName = `am-planning-${this.formattedDate}-${this.selectedShift}`;
          pdf.save(`${fileName}.pdf`);
        }
      );
    },
  },
};
</script>
<style scoped>
.select-container {
  /* Ensure the select container takes the full width of the cell */
  width: fit-content;
  height: fit-content; /* Set a max width for the select container */
}

.break {
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid #ebb8b8;
  border-radius: 5px;
  padding: 5px;
  background-color: #ebb8b8;
}

.none-break {
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid #79997e;
  border-radius: 5px;
  padding: 5px;
  background-color: #79997e;
}
.st {
  display: flex;
  justify-content: center;
  align-items: center;
  color: blue;
  border-radius: 5px;
  padding: 5px;
}

.dialogCancel {
  background-color: red;
  color: white;
}

.dialogOk {
  background-color: blue;
  color: white;
}

td {
  font-weight: bold;
  font-size: 0.55rem;
}

thead td {
  font-weight: bolder;
  font-size: 0.75rem;
}

.legend {
  display: flex;
  justify-content: center;
  flex-direction: column;
  gap: 2rem;
  margin: 0 8px;
}

.legend-item {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 14px;
  font-weight: bolder;
}

.selects-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px; /* Adjust the gap between selects as needed */
}

.shift-select {
  width: 200px;
}

.shift-select-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.dashnavigation {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.settings-btn {
  background-color: #15263f;
  color: white;
}

.delete-btn {
  background-color: rgb(205, 48, 48);
  color: white;
}

.edit-btn {
  background-color: #1d6d0d;
  color: white;
}

.planning {
  margin-top: 1rem;
  height: 60vh;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.parent {
  width: 100%;
}

.v-data-table {
  position: relative;
  max-height: 60vh;
  /* max-width: 60vw; */
  overflow-y: auto;
  margin: 0 8px;
}

.add-btn {
  background-color: #1177b3;
  color: white;
}

.buttons {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  height: fit-content;
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

.custom-dialog .v-dialog__content {
  background-color: rgba(
    0,
    0,
    0,
    0.5
  ); /* Adjust the opacity here (0.5 for 50% opacity) */
}

.content {
  position: relative;
}

.edit-icon {
  position: absolute;
  top: 2px; /* Adjust the value to your preference */
  right: 4px; /* Adjust the value to your preference */
  cursor: pointer;
  font-size: 0.8rem; /* Adjust the size of the icon */
  /* Optional: background color for better visibility */
  border-radius: 50%; /* Optional: make it a circle */
  padding: 2px; /* Optional: padding for better click area */
}

.enabled-button {
  background-color: #1d6d0d !important;
}

.disabled-button {
  background-color: gray !important;
}

.red-driver {
  color: red;
}

.search-me {
  color: white;
  background-color: purple;
}

.print-button {
  background-color: #c37125;
  color: white;
}

.rounded-plus-btn {
  border-radius: 50%;
  background-color: #054d25; /* Customize the color */
  color: white;
}

.add-new-item-row {
  text-align: center;
}

.red-header {
  color: red !important; /* Set color to red for headers with the 'red-header' class */
}

.dialogOk {
  background-color: blue;
  color: white;
}

.dialogCancel {
  background-color: red;
  color: white;
}

.edit-cell {
  display: flex;
  justify-content: center;
  align-items: center;
}
.replace-span {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
