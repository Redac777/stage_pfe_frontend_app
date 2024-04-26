<template>
  <div>
    <v-data-table :headers="tableHeaders" :items="planningTable">
      <template v-slot:item="{ item }">
        <tr>
          <template v-for="(value, key) in item" :key="key">
            <td v-if="key !== 'id'">{{ value }}</td>
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
    };
  },

  computed: {
    ...mapGetters(["getCurrentPlanning", "getPlanningBoxes"]),
  },
  mounted() {
    this.setPlanning();
  },

  methods: {
    ...mapActions([
      "setCurrentPlanning",
      "setLoadingValueAction",
      "setPlanningBoxes",
    ]),
    async setPlanning() {
      this.setLoadingValueAction(true);
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
                        cellContent = "P"; // Set to "P" if not planned yet
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
                  if (row[key] === "P" && hasEncounteredP) {
                    // Replace "P" with "DP"
                    row[key] = "DP";
                  } else if (row[key] === "P") {
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
  },
};
</script>

<style scoped></style>
