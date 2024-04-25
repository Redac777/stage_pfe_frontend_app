<template>
  <div>
    <v-data-table :headers="tableHeaders">
      <template v-slot:item="{ item }">
        <tr>
          <!-- Display driver's full name -->
          <td>{{ item.firstname }} {{ item.lastname }}</td>
          <!-- Display RTGs -->
          <td v-for="sub in this.subsequents">{{ sub }}</td>
        </tr>
      </template>
    </v-data-table>
  </div>
  <div class="confirm-button">
    <v-btn
      @click="confirmPlanning"
      density="default"
      style="background-color: #15263f; color: white; width: 120px"
      >Confirm</v-btn
    >
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {

  
  data() {
    return {
      drivers: [],
      rtgs: [],
      tableHeaders: [],
      planning: [],
      tableItems: [],
      arrayToSave:[]
    };
  },

  computed: {
    ...mapGetters([
      "getDrivers",
      "getRTGs",
      "getCurrentPlanning",
      "getPlanningDrivers",
      "getPlanningEquipements",
    ]),
  },
  mounted() {
    this.setData();
  },

  methods: {
    ...mapActions([
      "setCurrentPlanning",
      "setLoadingValueAction",
      "setPlanningDrivers",
      "setUserById",
      "setPlanningEquipements",
      "setEquipementById",
      "setBoxAction",
    ]),

    async setData() {
      this.setLoadingValueAction(true);
      let currentDate = new Date();

      // Get year, month, and day
      let year = currentDate.getFullYear();
      let month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // Months are zero indexed, so we add 1
      let day = currentDate.getDate().toString().padStart(2, "0");
      let formattedDate = year + "-" + month + "-" + day;
      const dateObject = {
        date: formattedDate,
      };

      try {
        await this.setCurrentPlanning(dateObject);
        this.planning = this.getCurrentPlanning;
        if (this.planning) {
          const planningId = {
            planning_id: this.planning[0].id,
          };

          const driversPromise = this.setPlanningDrivers(planningId);
          const equipementsPromise = this.setPlanningEquipements(planningId);

          await Promise.all([driversPromise, equipementsPromise]);

          const driversPlanning = this.getPlanningDrivers;
          if (driversPlanning) {
            for (let driverP in driversPlanning) {
              const user = {
                user_id: driversPlanning[driverP].user_id,
              };
              const response = await this.setUserById(user);
              this.drivers.push(response);
            }
          }

          const equipementPlanning = this.getPlanningEquipements;
          if (equipementPlanning) {
            for (let equP in equipementPlanning) {
              const equipement = {
                equipement_id: equipementPlanning[equP].equipement_id,
              };
              const response = await this.setEquipementById(equipement);
              this.rtgs.push(response);
            }
          }

          this.rtgPlanning(); // Call rtgPlanning() after all promises have resolved
          this.setLoadingValueAction(false);
        }
      } catch (error) {
        this.setLoadingValueAction(false);
        console.error(error);
        // Handle error
      }
    },

    rtgPlanning() {
      let nbrDrivers = this.drivers.length;
      let nbrRtgs = this.rtgs.length;
      let nbrSubs = nbrDrivers - nbrRtgs;
      let nbrCols = Math.ceil(nbrDrivers / nbrSubs);
      let colDuration = 480 / nbrCols;
      let divNbrDriverPerNbrSubs = nbrDrivers % nbrSubs;
      let nbrDoubleBreak =
        divNbrDriverPerNbrSubs != 0 ? nbrSubs - divNbrDriverPerNbrSubs : 0;
      this.drivers = this.drivers.sort(function (a, b) {
        return b.workingHours - a.workingHours;
      });
      let startTime = 7;
      for (let i = 0; i < nbrCols; i++) {
        let hours = Math.floor(startTime); // Extract whole hours
        let minutes = Math.round((startTime - hours) * 60); // Extract remaining minutes and round

        // Adjust minutes if they exceed 60
        if (minutes >= 60) {
          hours += 1; // Increment hours
          minutes -= 60; // Subtract 60 from minutes
        }

        // Format startTime as "hh:mm"
        let startTimeFormatted =
          hours + ":" + (minutes < 10 ? "0" : "") + minutes;

        // Calculate endTime
        let endTime = startTime + colDuration / 60;

        let endTimeHours = Math.floor(endTime); // Extract whole hours for end time
        let endTimeMinutes = Math.round((endTime - endTimeHours) * 60); // Extract remaining minutes and round

        // Adjust endTime if minutes exceed 60
        if (endTimeMinutes >= 60) {
          endTimeHours += 1; // Increment hours
          endTimeMinutes -= 60; // Subtract 60 from minutes
        }

        // Format endTime as "hh:mm"
        let endTimeFormatted =
          endTimeHours +
          ":" +
          (endTimeMinutes < 10 ? "0" : "") +
          endTimeMinutes;

        // Push start and end times to the tableHeaders array
        this.tableHeaders.push({
          title: startTimeFormatted + " - " + endTimeFormatted,
          sortable: false,
        });

        // Update startTime for the next iteration
        startTime = endTimeHours + endTimeMinutes / 60;
      }
      const itemsPlanning = [];
      itemsPlanning.push(["Drivers | Time", ...this.tableHeaders]);

      for (let i = 0; i < nbrDrivers; i++) {
        itemsPlanning.push(Array(nbrCols + 1).fill(this.drivers[i]));
      }

      let k = 0;
      for (let i = 1; i < nbrDrivers + 1; i += nbrSubs) {
        k++;
        let maxJ = i + nbrSubs;
        if (maxJ > nbrDrivers) maxJ = maxJ - nbrDoubleBreak;
        for (let j = i; j < maxJ; j++) {
          itemsPlanning[j][k] = "P";
        }
      }

      let startDoubleBreak = itemsPlanning.length - nbrSubs;
      let rtgsIndex = 0;
      for (let j = 1; j < nbrCols + 1; j++) {
        rtgsIndex = 0;
        for (let i = 1; i < nbrDrivers + 1; i++) {
          if (itemsPlanning[i][j] != "P") {
            if (rtgsIndex < this.rtgs.length) {
              // Check if rtgsIndex is within bounds
              itemsPlanning[i][j] = this.rtgs[rtgsIndex];
              rtgsIndex++;
            } else {
              // Handle the case when rtgsIndex exceeds the length of rtgs array
              // For example, you can break the loop or handle it according to your logic.
              break;
            }
          }
        }
      }
      if (nbrDoubleBreak != 0) {
        for (
          let i = startDoubleBreak;
          i < startDoubleBreak + nbrDoubleBreak;
          i++
        ) {
          itemsPlanning[i][k] = "DP";
        }
        const doubleBreakDrivers = [];

        for (let i = 1; i < nbrDrivers + 1; i++) {
          if (itemsPlanning[i][nbrCols] == "DP") {
            doubleBreakDrivers.push({
              index: i,
              driver: itemsPlanning[i][0],
            });
          }
        }
        let tempDriver = null;
        for (let i = 1; i < nbrDoubleBreak + 1; i++) {
          tempDriver = itemsPlanning[i][0];
          itemsPlanning[i][0] = doubleBreakDrivers[i - 1].driver;
          itemsPlanning[doubleBreakDrivers[i - 1].index][0] = tempDriver;
        }
      }

      const id = 1;
      let parts = [];
      for (let i = 1; i < nbrDrivers + 1; i++) {
        for (let j = 1; j < nbrCols + 1; j++) {
          const equipementId =
            itemsPlanning[i][j] == "P" || itemsPlanning[i][j] == "DP"
              ? null
              : this.rtgs.find(
                  (rtg) => rtg.matricule === itemsPlanning[i][j].matricule
                )?.id;
          parts = itemsPlanning[0][j].title.split("+")[0].split("-");

          this.arrayToSave.push({
            planning_id: this.planning[0].id,
            user_id: itemsPlanning[i][0].id,
            equipement_id: equipementId,
            break:
              itemsPlanning[i][j] == "P" || itemsPlanning[i][j] == "DP"
                ? true
                : false,
            start_time: parts[0],
            ends_time: parts[1],
          });
        }
      }
      console.log(itemsPlanning)

      // console.log(
      //   this.drivers.map((driver) => ({
      //     driverName: driver.firstname + " " + driver.lastname,
      //     driverWorkingHours: driver.workingHours,
      //   }))
      // );
    },
    confirmPlanning() {
      this.setLoadingValueAction(true)
      for (let item in this.arrayToSave) {
       this.setBoxAction(this.arrayToSave[item]).then((response) => {
         console.log(response)
         this.setLoadingValueAction(false)
       })
      }
    },
  },
};
</script>

<style scoped></style>
