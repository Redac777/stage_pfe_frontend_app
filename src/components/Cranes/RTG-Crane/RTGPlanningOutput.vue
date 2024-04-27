<template>
  <div class="top">
    <div class="selects-container">
      <v-btn @click="toggleDatePicker">{{
        showDatePicker ? "Close Date Picker" : "Open Date Picker"
      }}</v-btn>

      <!-- Date picker -->
      <v-date-picker
        v-model="selectedDate"
        v-if="showDatePicker"
      ></v-date-picker>
      <div class="shift-select-container">
        <v-select
          v-model="selectedShift"
          :items="shifts"
          label="Select Shift"
          class="shift-select"
          outlined
          dense
        ></v-select>
      </div>
    </div>

    <div class="buttons-container">
      <v-btn
        @click="
          setPlanning(true)
        "
        color="primary"
        >Go</v-btn
      >
      <!-- Add other buttons here -->
    </div>
  </div>

  <div class="planning">
    <div class="legend">
      <div class="legend-item break">Break</div>
      <div class="legend-item none-break">Work</div>
      <!-- Add other legend items here -->
    </div>
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
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  data() {
    return {
      planning: [],
      planningTable: [],
      tableHeaders: [],
      selectedDate: null,
      selectedShift: "",
      shifts: ["A", "B", "C"],
      showDatePicker: false,
    };
  },

  computed: {
    ...mapGetters(["getCurrentPlanning", "getPlanningBoxes"]),
    formattedDate() {
      // Convert selectedDate to local timezone
      if (this.selectedDate) {
        const localDate = new Date(
          this.selectedDate.getTime() +
            this.selectedDate.getTimezoneOffset() * 60000
        );
        localDate.setDate(localDate.getDate() + 1);
        // Get the date string in yyyy-mm-dd format
        return localDate.toISOString().split("T")[0];
      }
    },
  },
  mounted() {
    this.setPlanning();
  },

  methods: {
    ...mapActions([
      "setCurrentPlanning",
      "setLoadingValueAction",
      "setPlanningBoxes",
      "setShiftByCategory",
    ]),
    isDriver(key) {
      return key === "driver";
    },
    isBreak(value) {
      return value === "B" || value === "DB";
    },
    setPlanning(value) {
      this.planningTable = [];
      if (!value) {
        let currentDate = new Date();
        // Get year, month, and day
        let year = currentDate.getFullYear();
        let month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // Months are zero indexed, so we add 1
        let day = currentDate.getDate().toString().padStart(2, "0");
        let formattedDate = year + "-" + month + "-" + day;
        const dateObject = {
          date: "2024-04-26",
          shift_id: 3,
          profile_group_id: 1,
        };
        this.DisplayPlanning(dateObject);
      } else {
        console.log(this.formattedDate); // Output: "yyyy-mm-dd"
        let dateObject = null
        this.showDatePicker = false;
        const shift = {
          category: this.selectedShift,
        };
        this.setShiftByCategory(shift).then((response) => {
          dateObject = {
            date: this.formattedDate,
            shift_id: response[0].id,
            profile_group_id: 1,
          }
          this.DisplayPlanning(dateObject);
        });
        
      }
    },

    async DisplayPlanning(dateObject) {
      this.setLoadingValueAction(true);
      try {
        await this.setCurrentPlanning(dateObject);
        this.planning = this.getCurrentPlanning;
        if (this.planning) {
          const planningId = {
            planning_id: this.planning[0].id,
          };

          this.setPlanningBoxes(planningId).then(() => {
            this.planning = this.getPlanningBoxes;
            this.setLoadingValueAction(false);
            console.log(this.planning);
            this.setPlanningBoxes(planningId).then(() => {
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

              // Log the table headers
              console.log(this.tableHeaders);

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
                console.log(userBoxes);
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
                  console.log(boxesInInterval);
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
              });
              console.log(this.planningTable);
            });
          });
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
.planning {
  margin-top: 4%;
}

.break {
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid #ebb8b8;
  border-radius: 5px;
  padding: 5px;
  background-color: #ebb8b8;
  font-weight: bolder;
}
.none-break {
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid #79997e;
  border-radius: 5px;
  padding: 5px;
  background-color: #79997e;
  font-weight: bolder;
}
.legend {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 10px;
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

.buttons-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px; /* Adjust the gap between buttons as needed */
}
.top {
  display: flex;
  justify-content: center;
  align-items: center;
}
.shift-select {
  width: 200px;
}
.shift-select-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
