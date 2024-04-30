<template>
  <div class="parent">
    <!-- Settings dialog -->
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
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="applyCreate">Apply</v-btn>
            <v-btn @click="closeCreateDialog">Close</v-btn>
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
          <v-icon>mdi-cog</v-icon>
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
                    break: !isDriver(key) && isBreak(value),
                    'none-break': !isDriver(key) && !isBreak(value),
                  }"
                >
                  {{ value }}
                </div>
              </td>
            </template>
          </tr>
        </template>
      </v-data-table>
    </div>
  </div>
</template>

<script>
import DashboardNavigation from "@/components/Dashboard/DashboardNavigation.vue";
import { mapActions, mapGetters } from "vuex";

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
      createdPlanningData : null
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
  },

  computed: {
    ...mapGetters(["getCurrentPlanning", "getPlanningBoxes"]),

    // Returns the formatted date in yyyy-mm-dd format
    formattedDate() {
      // Convert selectedDate to local timezone
      if (this.selectedDate) {
        const localDate = new Date(
          this.selectedDate.getTime() +
            this.selectedDate.getTimezoneOffset() * 60000
        );
        localDate.setDate(localDate.getDate()+1);
        // console.log(localDate)
        // Get the date string in yyyy-mm-dd format
        return localDate.toISOString().split("T")[0];
      }
    },
  },
  mounted() {
    this.setPlanning();
    this.setInitialShift();
  },

  methods: {
    ...mapActions([
      "setCurrentPlanning",
      "setLoadingValueAction",
      "setPlanningBoxes",
      "setShiftByCategory",
      "setShiftByTime",
      "setProfileGroupByType",
    ]),
    // Settings
    openSettingsDialog() {
      this.showSettingsDialog = true;
    },
    openCreateDialog(){
      this.showCreateDialog = true;
    },
    closeSettingsDialog() {
      this.showSettingsDialog = false;
    },

    closeCreateDialog(){
      this.showCreateDialog = false;
    },
    applySettings() {
      this.setPlanning(true);
      this.closeSettingsDialog();
    },

    applyCreate(){
      this.createdPlanningData = {
        date: this.selectedCreateDate,
        shift: this.selectedCreateShift
      }
      // console.log(this.createdPlanningData)
      this.$emit('createPlanning', this.createdPlanningData);
      this.closeCreateDialog();
    },


    // Set initial shift in dialog select shift
    setInitialShift() {
      this.setShiftByTime().then((response) => {
        this.selectedShift = response[0].category;
      });
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
      this.setLoadingValueAction(true);
      this.planningTable = [];
      if (!value) {
        let currentDate = new Date();
        let year = currentDate.getFullYear();
        let month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // Months are zero indexed, so we add 1
        let day = currentDate.getDate().toString().padStart(2, "0");
        let formattedDate = year + "-" + month + "-" + day;
        this.setShiftByTime().then((response) => {
          this.shiftId = response[0].id;

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

            this.DisplayPlanning(dateObject);
          });
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
            console.log(this.formattedDate);
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
            uniqueUsers.forEach((userId) => {
              // Find the boxes for the current user
              const userBoxes = this.planning.filter(
                (box) => box.user.id === userId
              );

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
                      cellContent = "B"; // Set to "P" if not planned yet
                    } else {
                      cellContent = box.equipement.matricule; // Set to equipement's matricule
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
  },
};
</script>

<style scoped>
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

.planning {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.parent {
  width: 100%;
}
.v-data-table {
  max-height: 75vh;
  margin: 0 8px;
}

.add-btn{
  background-color: #653e0f;
  color: white;
}
</style>
