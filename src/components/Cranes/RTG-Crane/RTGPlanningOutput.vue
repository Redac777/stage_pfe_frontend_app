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

    <!-- Planning table -->
    <div class="planning">
      <!-- Settings button -->

      <!-- Legend -->
      <div class="legend">
        <v-btn @click="openCreateDialog" class="add-btn">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
        <v-btn @click="openSettingsDialog" class="settings-btn">
          <v-icon>mdi-magnify</v-icon>
        </v-btn>
        <v-btn @click="openDeleteDialog" class="delete-btn">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
        <div class="legend-item break">Break</div>
        <div class="legend-item none-break">Work</div>
        <!-- Add other legend items here -->
      </div>

      <!-- Table -->
      <v-data-table :headers="tableHeaders" :items="planningTable">
        <template v-slot:item="{ item }">
          <tr>
            <template v-for="(value, key) in item" :key="key">
              <td v-if="key !== 'id'">
                <div
                  class="content"
                  :class="{
                    break: !isDriver(key) && isBreak(value.matricule || value),
                    'none-break':
                      !isDriver(key) && !isBreak(value.matricule || value),
                  }"
                  @click="value !== null && openEditDialog(item, key)"
                >
                  {{ value.matricule || value }}
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
                  <v-card-text>
                    <!-- Display the current cell value and allow the user to edit -->
                    <v-select
                      v-model="itemToEdit.value"
                      :items="filteredEquipements"
                      label="Select Equipment"
                      dense
                    ></v-select>
                  </v-card-text>
                  <v-card-actions>
                    <!-- Save and Cancel buttons -->
                    <v-btn color="primary" @click="saveCell">Save</v-btn>
                    <v-btn @click="cancelEdit">Cancel</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </template>
          </tr>
        </template>
      </v-data-table>
    </div>
    <div class="finish-button">
      <v-btn
        @click="finishPlanning"
        density="default"
        style="background-color: #15263f; color: white; width: 120px"
        >Finish</v-btn
      >
    </div>
  </div>
</template>

<script>
import DashboardNavigation from "@/components/Dashboard/DashboardNavigation.vue";
import { createWebHistory } from "vue-router";
import { mapActions, mapGetters } from "vuex";
import moment from "moment";

export default {
  data() {
    return {
      planning: [],
      planningTable: [],
      tableHeaders: [],
      selectedDate: new Date(),
      selectedShift: "",
      shifts: ["A", "B", "C"],
      showDatePicker: false,
      activeProfileGroup: "rtg",
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
      },
      equipments: [],
      filteredEquipements: [],
      boxesObjects: {},
    };
  },
  components: {
    DashboardNavigation,
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
          let date = new Date(this.selectedCreateDate);
          let year = date.getFullYear();
          let month = ("0" + (date.getMonth() + 1)).slice(-2);
          let day = ("0" + date.getDate()).slice(-2);
          let formattedDate = `${year}-${month}-${day}`;
          let dateTime = `${formattedDate}`;
          this.shifts = this.getActualShift(dateTime);
          // console.log(this.shifts);
          this.shifts.pop();
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
          let date = new Date(this.selectedCreateDate);
          let year = date.getFullYear();
          let month = ("0" + (date.getMonth() + 1)).slice(-2);
          let day = ("0" + date.getDate()).slice(-2);
          let formattedDate = `${year}-${month}-${day}`;
          let dateTime = `${formattedDate}`;
          this.shifts = this.getActualShift(dateTime);

          this.shifts.pop();
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
  },

  computed: {
    ...mapGetters(["getCurrentPlanning", "getPlanningBoxes", "getEquipements"]),

    // Returns the formatted date in yyyy-mm-dd format
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
    this.setInitialShift();
    this.setEquipements();
    this.setPlanning();
  },

  methods: {
    ...mapActions([
      "setCurrentPlanning",
      "setLoadingValueAction",
      "setPlanningBoxes",
      "setShiftByCategory",
      "setShiftByTime",
      "setProfileGroupByType",
      "editUserAction",
      "deleteRTGPlanningAction",
      "setEquipementsAction",
      "setBoxUpdateAction"
    ]),
    // Settings
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

    // Set initial shift in dialog select shift
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
      this.setShiftByCategory({ category: this.selectedShift }).then(
        (response) => {
          this.shiftId = response[0].id;
        }
      );
    },

    // select profile group in navigation dashboard
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
    isBreak(value) {
      return value === "B" || value === "DB";
    },
    setPlanning(value) {
      const today = new Date(this.formattedDate);
      const options = { year: "numeric", month: "long", day: "numeric" };
      this.todayDate = today.toLocaleDateString(undefined, options);
      this.setLoadingValueAction(true);
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
            profileType: "rtg",
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
              profileType: "rtg",
            };

            this.DisplayPlanning(dateObject);
          });
        });
      }
    },

    async DisplayPlanning(dateObject) {
      try {
        await this.setCurrentPlanning(dateObject);
        this.planning = this.getCurrentPlanning;
        if (this.planning) {
          // console.log(this.planning)
          const planningId = {
            planning_id: this.planning.id,
          };
          this.setPlanningBoxes(planningId).then(() => {
            this.planning = this.getPlanningBoxes;
            // Extract unique time intervals
            // Initialize an empty array to store unique time intervals
            const timeIntervals = [];
            const timeIntervalsTable = [];
            this.planning.forEach((box) => {
              // Check if the current time interval already exists in the timeIntervals array
              const existingIntervalIndex = timeIntervalsTable.findIndex(
                (interval) => {
                  return (
                    interval.title === `${box.start_time} - ${box.ends_time}`
                  );
                }
              );

              // If the current time interval doesn't exist in the array, add it
              if (existingIntervalIndex === -1) {
                timeIntervalsTable.push({
                  title: `${box.start_time} - ${box.ends_time}`,
                  sortable: false,
                  key: `timeInterval_${timeIntervalsTable.length}`,
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
                title: "Driver",
                align: "start",
                sortable: false,
                key: "driver",
              },
              ...timeIntervalsTable,
            ];

            // Extract unique users from the planning array
            const uniqueUsers = Array.from(
              new Set(this.planning.map((box) => box.user.id))
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
                const { user, start_time, ends_time, break: isBreak, id } = box;
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
                      oldValue: user.workingHours,
                      totalWorkingHours: user.workingHours + workingMinutes,
                    };
                  } else {
                    // If this.userWorkingHours[user.id] already exists, update its properties
                    this.userWorkingHours[user.id].oldValue = user.workingHours;
                    this.userWorkingHours[user.id].totalWorkingHours +=
                      workingMinutes;
                  }
                }
              });

              // console.log(this.userWorkingHours);
              const userToUpdate = {
                id: userId,
                workingHours:
                  this.userWorkingHours[userId]?.totalWorkingHours || 0,
              };
              //console.log(userToUpdate)
              this.usersWorkingHours.push(userToUpdate);
              // this.editUserAction(userToUpdate),then((response)=>{
              //   console.log(response)
              // })

              // Create a new row for the current user
              const row = {
                driver: `${userBoxes[0].user.firstname} ${userBoxes[0].user.lastname}`, // Driver's full name from the first box
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
                      cellContent = {
                        matricule: "B",
                        boxId: box.id,
                      };
                    } else {
                      cellContent = {
                        matricule: box.equipement.matricule,
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
                if (row[key] === "B" && hasEncounteredP) {
                  // Replace "P" with "DP"
                  row[key] = "DB";
                } else if (row[key] === "B") {
                  // Set the flag to true if "P" is encountered for the first time
                  hasEncounteredP = true;
                }
              }

              this.planningTable.push(row);
              // console.log(row)
              this.setLoadingValueAction(false);
            });
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

    finishPlanning() {
      this.usersWorkingHours = this.usersWorkingHours.filter(
        (usWh) => usWh.workingHours != 0
      );
      // console.log(this.usersWorkingHours)
      this.setLoadingValueAction(true);
      this.usersWorkingHours.forEach((user) => {
        this.editUserAction(user).then(() => {
          this.setLoadingValueAction(false);
          console.log("updated successfully");
        });
      });
    },

    closeDelete() {
      this.dialogDelete = false;
    },
    deleteItemConfirm() {
      this.setLoadingValueAction(true);
      this.deleteRTGPlanningAction({ id: this.planning[0].planning_id }).then(
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
      this.setEquipementsAction().then(() => {
        this.equipments = this.getEquipements
          .filter((equipement) => equipement.profile_group.type === "rtg")
          .map((equip) => equip.matricule);
        this.equipments.push("B");
        // console.log(this.equipments)
        this.setLoadingValueAction(false);
      });
    },
    openEditDialog(item, key) {
      // console.log(item[key])
      // Set the editable cell object
      this.filteredEquipements = [];
      const sameColumnItems = this.planningTable
        .map((it) => it[key].matricule)
        .filter((it) => it != item[key].matricule && it != "B");
      this.filteredEquipements = this.equipments.filter(
        (equip) => !sameColumnItems.includes(equip)
      );
      // console.log(this.filteredEquipements)
      this.itemToEdit.item = item;
      this.itemToEdit.key = key;
      this.itemToEdit.value = item[key].matricule;
      // Open the edit dialog
      this.showEditDialog = true;
    },
    saveCell() {
      // Check if this.editableCell is not null
      if (this.itemToEdit.item && this.itemToEdit.key !== null) {
        // Update the value of the cell in the item object
        this.itemToEdit.item[this.itemToEdit.key].matricule = this.itemToEdit.value;
        const equipement = this.getEquipements.find(equ=>equ.matricule===this.itemToEdit.value)
        // console.log(equipement)
        if(equipement || this.itemToEdit.value==="B"){
          this.setLoadingValueAction(true)
          this.setBoxUpdateAction({
            id: this.itemToEdit.item[this.itemToEdit.key].boxId,
            equipement_id:equipement?equipement.id:null,
            break:this.itemToEdit.value==="B"
          }).then(()=>{
            console.log("box updated successfully")
            this.setLoadingValueAction(false)
          })
          // console.log(equipement.id)
          // console.log(this.itemToEdit.item[this.itemToEdit.key].boxId)
        }
        // Close the edit dialog
        this.showEditDialog = false;

        // Reset itemToEdit
        this.itemToEdit.item = null;
        this.itemToEdit.key = null;
        this.itemToEdit.value = null;
      }
      // console.log(this.editableCell.value)
      // console.log(this.editableCell.item[this.editableCell.key])
    },
    cancelEdit() {
      // Reset any changes made in the dialog
      // Close the edit dialog
      this.showEditDialog = false;
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
}
thead td {
  font-weight: bolder;
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

.planning {
  margin-top: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.parent {
  width: 100%;
}
.v-data-table {
  max-height: 60vh;
  margin: 0 8px;
}

.add-btn {
  background-color: #1177b3;
  color: white;
}

.finish-button {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
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
  cursor: pointer;
}
</style>
